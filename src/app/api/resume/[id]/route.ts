/**
 * Route API pour récupérer un CV par son ID
 * GET /api/resume/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCompleteResume } from '@/lib/services/resume-service';

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
