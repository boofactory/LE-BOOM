import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getNotionEvents } from '@/lib/notion';
import { successResponse, errorResponse } from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    const notionEvents = await getNotionEvents();

    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const notionEvent of notionEvents) {
      try {
        // Trouver le photomaton par défaut (premier de la liste)
        // TODO: Améliorer la logique d'attribution photomaton
        const photomaton = await prisma.photomaton.findFirst();

        if (!photomaton) {
          errors.push(`No photomaton found for event ${notionEvent.id}`);
          continue;
        }

        const existingEvent = await prisma.event.findUnique({
          where: { notionPageId: notionEvent.id },
        });

        if (existingEvent) {
          // Mettre à jour
          await prisma.event.update({
            where: { notionPageId: notionEvent.id },
            data: {
              clientName: notionEvent.clientName,
              eventType: notionEvent.eventType,
              eventDate: notionEvent.eventDate,
              albumName: notionEvent.albumName,
              notionData: notionEvent.notionData,
              syncedAt: new Date(),
            },
          });
          updated++;
        } else {
          // Créer
          await prisma.event.create({
            data: {
              notionPageId: notionEvent.id,
              photomatonId: photomaton.id,
              clientName: notionEvent.clientName,
              eventType: notionEvent.eventType,
              eventDate: notionEvent.eventDate,
              albumName: notionEvent.albumName,
              notionData: notionEvent.notionData,
              status: 'ACTIVE',
            },
          });
          created++;
        }
      } catch (error: any) {
        errors.push(`Error syncing event ${notionEvent.id}: ${error.message}`);
      }
    }

    return successResponse({
      success: true,
      synced: notionEvents.length,
      created,
      updated,
      errors,
    });
  } catch (error) {
    console.error('Error syncing Notion events:', error);
    return errorResponse('Failed to sync Notion events', 500);
  }
}
