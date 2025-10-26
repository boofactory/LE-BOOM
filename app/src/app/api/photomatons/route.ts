import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';
import { PhotomatonWithRelations } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const photomatons = await prisma.photomaton.findMany({
      include: {
        events: {
          where: {
            status: 'ACTIVE',
          },
          orderBy: {
            eventDate: 'asc',
          },
          take: 1,
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    // Enrichir avec les statistiques
    const enrichedPhotomatons: PhotomatonWithRelations[] = await Promise.all(
      photomatons.map(async (photomaton) => {
        const currentEvent = photomaton.events[0] || null;

        // Calculer les stats pour l'événement actif
        let stats = {
          totalDigital: 0,
          totalPrints: 0,
          totalGifs: 0,
        };

        if (currentEvent) {
          stats = {
            totalDigital: currentEvent.totalDigital,
            totalPrints: currentEvent.totalPrints,
            totalGifs: currentEvent.totalGifs,
          };
        }

        const { events, ...photomatonData } = photomaton;

        return {
          ...photomatonData,
          currentEvent,
          stats,
        };
      })
    );

    return successResponse({ photomatons: enrichedPhotomatons });
  } catch (error) {
    console.error('Error fetching photomatons:', error);
    return errorResponse('Failed to fetch photomatons', 500);
  }
}
