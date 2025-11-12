import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';
import { Client } from '@notionhq/client';
import { getNotionCredentials } from '@/lib/notion-config';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * PATCH /api/events/[id]/installation
 * Marque un événement comme installé et met à jour Notion
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const body = await request.json();
    const { checklist, notes, installation_date } = body;

    console.log('[INSTALLATION] Marking event as installed:', {
      eventId: id,
      checklist,
      hasNotes: !!notes,
      date: installation_date,
    });

    // Récupérer les credentials Notion
    const { token: notionToken } = await getNotionCredentials();

    if (!notionToken) {
      return errorResponse('Configuration Notion manquante', 503);
    }

    const notion = new Client({ auth: notionToken });

    // Mettre à jour la page Notion
    await notion.pages.update({
      page_id: id,
      properties: {
        'État': {
          status: {
            name: 'Installé',
          },
        },
        ...(notes && {
          'Info installation': {
            rich_text: [
              {
                text: {
                  content: notes,
                },
              },
            ],
          },
        }),
      },
    });

    console.log('[INSTALLATION] Event marked as installed successfully');

    return successResponse({
      message: 'Installation confirmée',
      event_id: id,
      installation_date,
    });
  } catch (error: any) {
    console.error('[INSTALLATION] Error:', error);

    if (error.code === 'unauthorized') {
      return errorResponse('Token Notion invalide', 401);
    }

    if (error.code === 'object_not_found') {
      return errorResponse('Événement introuvable dans Notion', 404);
    }

    return errorResponse(
      `Erreur lors de la confirmation: ${error.message}`,
      500
    );
  }
}
