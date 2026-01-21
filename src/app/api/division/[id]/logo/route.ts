/**
 * Route API pour ajouter/mettre à jour le logo d'une division
 * PATCH /api/division/[id]/logo
 */

import { NextRequest, NextResponse } from 'next/server';
import * as resumeService from '@/lib/services/resume-service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de la division requis' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Valider que logo_url est fourni et est une chaîne
    if (typeof body.logo_url !== 'string' || !body.logo_url.trim()) {
      return NextResponse.json(
        { error: 'Le champ logo_url doit être une chaîne non vide' },
        { status: 400 }
      );
    }
    
    // Vérifier que la fonction existe
    if (typeof resumeService.updateDivisionLogo !== 'function') {
      return NextResponse.json(
        { error: 'Fonction de mise à jour non disponible' },
        { status: 500 }
      );
    }
    
    const success = resumeService.updateDivisionLogo(id, body.logo_url);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Division non trouvée' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        success: true,
        message: 'Logo de la division mis à jour avec succès',
        logo_url: body.logo_url,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour du logo de la division:', error);
    
    // Gérer les erreurs de validation métier
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
