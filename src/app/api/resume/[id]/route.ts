/**
 * Route API pour récupérer, modifier et supprimer un CV par son ID
 * GET /api/resume/[id]
 * PUT /api/resume/[id]
 * DELETE /api/resume/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCompleteResume, updateCompleteResume, deleteResume } from '@/lib/services/resume-service';
import type { PlayerSubmissionInput, PartialPlayerSubmissionInput } from '@/types/submission';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID du CV requis' },
        { status: 400 }
      );
    }
    
    const resume = await getCompleteResume(id);
    
    if (!resume) {
      return NextResponse.json(
        { error: 'CV non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(resume, { status: 200 });
    
  } catch (error) {
    console.error('Erreur lors de la récupération du CV:', error);
    
    // Gérer les erreurs de validation métier (du service)
    if (error instanceof Error) {
      if (error.message.includes('incomplet')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      
      // Erreurs Prisma
      if (error.message.includes('prisma') || error.message.includes('Prisma')) {
        return NextResponse.json(
          { error: 'Erreur de base de données' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

/**
 * Route API pour mettre à jour un CV complet
 * PUT /api/resume/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID du CV requis' },
        { status: 400 }
      );
    }

    // Parser le JSON avec gestion d'erreur
    let body: PartialPlayerSubmissionInput;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Format JSON invalide' },
        { status: 400 }
      );
    }
    
    // Validation : au moins un champ doit être fourni
    if (!body.resume && !body.player_profile && !body.contacts && 
        body.qualities === undefined && body.career_seasons === undefined && 
        body.training_entries === undefined && body.club_interests === undefined) {
      return NextResponse.json(
        { error: 'Au moins un champ doit être fourni pour la mise à jour' },
        { status: 400 }
      );
    }
    
    // Validation du CV (seulement si fourni)
    if (body.resume) {
      if (body.resume.color !== undefined) {
        // Validation du format de la couleur (hex)
        if (!/^#[0-9A-Fa-f]{6}$/.test(body.resume.color)) {
          return NextResponse.json(
            { error: 'La couleur doit être au format hex (#RRGGBB)' },
            { status: 400 }
          );
        }
      }
      
      if (body.resume.formation_system !== undefined) {
        // Validation du système de formation
        if (!['4-3-3', '3-5-2'].includes(body.resume.formation_system)) {
          return NextResponse.json(
            { error: 'Le système de formation doit être "4-3-3" ou "3-5-2"' },
            { status: 400 }
          );
        }
      }
    }
    
    // Validation du profil joueur (seulement si fourni)
    if (body.player_profile) {
      // Validation du format de la date de naissance (ISO date) si fournie
      if (body.player_profile.birth_date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(body.player_profile.birth_date)) {
        return NextResponse.json(
          { error: 'La date de naissance doit être au format ISO (YYYY-MM-DD)' },
          { status: 400 }
        );
      }
    }
    
    // Validation des contacts (seulement si fourni)
    if (body.contacts) {
      // Validation du format email si fourni
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (body.contacts.player_email !== undefined && !emailRegex.test(body.contacts.player_email)) {
        return NextResponse.json(
          { error: 'Format d\'email invalide pour player_email' },
          { status: 400 }
        );
      }
      
      if (body.contacts.agent_email !== undefined && body.contacts.agent_email !== null && !emailRegex.test(body.contacts.agent_email)) {
        return NextResponse.json(
          { error: 'Format d\'email invalide pour agent_email' },
          { status: 400 }
        );
      }
    }

    // Mettre à jour le CV
    await updateCompleteResume(id, body);
    
    // Récupérer le CV mis à jour pour le retourner
    const updatedResume = await getCompleteResume(id);
    
    if (!updatedResume) {
      return NextResponse.json(
        { error: 'CV non trouvé après mise à jour' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedResume, { status: 200 });
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour du CV:', error);
    
    // Gérer les erreurs de validation métier (du service)
    if (error instanceof Error) {
      if (error.message.includes('non trouvé')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      
      if (error.message.includes('incomplet') || error.message.includes('manquant')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      
      // Erreurs Prisma
      if (error.message.includes('prisma') || error.message.includes('Prisma')) {
        return NextResponse.json(
          { error: 'Erreur de base de données' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

/**
 * Route API pour supprimer un CV
 * DELETE /api/resume/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID du CV requis' },
        { status: 400 }
      );
    }

    // Supprimer le CV
    const deleted = await deleteResume(id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'CV non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: true,
        message: 'CV supprimé avec succès',
        resume_id: id
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Erreur lors de la suppression du CV:', error);
    
    // Gérer les erreurs Prisma
    if (error instanceof Error) {
      if (error.message.includes('prisma') || error.message.includes('Prisma')) {
        return NextResponse.json(
          { error: 'Erreur de base de données' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
