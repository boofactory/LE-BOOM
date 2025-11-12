import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';
import { Client } from '@notionhq/client';
import { getNotionCredentials } from '@/lib/notion-config';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * POST /api/events/bulk-archive
 * Marque tous les événements avant une certaine date comme récupérés
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { before_date } = body; // Format: YYYY-MM-DD

    if (!before_date) {
      return errorResponse('Date manquante (before_date)', 400);
    }

    console.log('[BULK-ARCHIVE] Archiving events before:', before_date);

    // Récupérer les credentials Notion
    const { token: notionToken, databaseId: notionDatabaseId } = await getNotionCredentials();

    if (!notionToken || !notionDatabaseId) {
      return errorResponse('Configuration Notion manquante', 503);
    }

    const notion = new Client({ auth: notionToken });

    // Récupérer tous les événements avant cette date
    const response = await notion.databases.query({
      database_id: notionDatabaseId,
      filter: {
        and: [
          {
            property: 'Date évènement',
            date: {
              before: before_date,
            },
          },
          {
            or: [
              {
                property: 'Statut Récupération',
                status: {
                  does_not_equal: 'Récupéré',
                },
              },
              {
                property: 'Statut Récupération',
                status: {
                  is_empty: true,
                },
              },
            ],
          },
        ],
      },
    });

    console.log('[BULK-ARCHIVE] Found', response.results.length, 'events to archive');

    let updatedCount = 0;
    const errors: string[] = [];

    // Mettre à jour chaque événement
    for (const page of response.results) {
      try {
        await notion.pages.update({
          page_id: page.id,
          properties: {
            'Statut Installation': {
              status: {
                name: 'Installé',
              },
            },
            'Statut Récupération': {
              status: {
                name: 'Récupéré',
              },
            },
            'Récupération - Date réelle': {
              date: {
                start: before_date,
              },
            },
            'Notes Récupération': {
              rich_text: [
                {
                  text: {
                    content: 'Archivage automatique des anciens événements',
                  },
                },
              ],
            },
          },
        });
        updatedCount++;
        console.log(`[BULK-ARCHIVE] Updated event ${page.id}`);
      } catch (error: any) {
        console.error(`[BULK-ARCHIVE] Error updating ${page.id}:`, error);
        errors.push(`${page.id}: ${error.message}`);
      }
    }

    return successResponse({
      message: `${updatedCount} événements archivés`,
      total_found: response.results.length,
      updated: updatedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('[BULK-ARCHIVE] Error:', error);

    if (error.code === 'unauthorized') {
      return errorResponse('Token Notion invalide', 401);
    }

    return errorResponse(
      `Erreur lors de l'archivage: ${error.message}`,
      500
    );
  }
}
