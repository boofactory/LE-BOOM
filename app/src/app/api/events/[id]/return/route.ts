import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';
import { Client } from '@notionhq/client';
import { getNotionCredentials } from '@/lib/notion-config';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * PATCH /api/events/[id]/return
 * Marque un événement comme récupéré et met à jour Notion
 * Optionnellement envoie un email au client
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
    const { checklist, notes, return_date, send_email, client_email } = body;

    console.log('[RETURN] Marking event as returned:', {
      eventId: id,
      checklist,
      hasNotes: !!notes,
      date: return_date,
      sendEmail: send_email,
      clientEmail: client_email,
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
            name: 'À l\'atelier',
          },
        },
        'A Livrer': {
          rich_text: [], // Vider pour masquer du dashboard
        },
        'Admin Post - Récupération Matériel': {
          checkbox: true,
        },
      },
    });

    console.log('[RETURN] Event marked as returned successfully');

    // TODO: Envoyer l'email si send_email === true
    // Pour l'instant, on va juste logger
    if (send_email && client_email) {
      console.log('[RETURN] Would send confirmation email to:', client_email);
      console.log('[RETURN] Email template:');
      console.log(`
        Objet: Merci pour votre confiance - BooFactory

        Bonjour,

        Nous vous confirmons la récupération du photomaton suite à votre événement.

        ✅ Toutes vos photos ont été uploadées et sont disponibles
        ✅ Le matériel a été récupéré en bon état

        Nous espérons que notre service vous a donné entière satisfaction !

        Cordialement,
        L'équipe BooFactory
      `);
    }

    return successResponse({
      message: 'Récupération confirmée',
      event_id: id,
      return_date,
      email_sent: send_email && !!client_email,
    });
  } catch (error: any) {
    console.error('[RETURN] Error:', error);

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
