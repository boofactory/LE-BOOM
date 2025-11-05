import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';
import { Client } from '@notionhq/client';
import { getNotionCredentials } from '@/lib/notion-config';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * GET /api/notion/events
 * Récupère les événements directement depuis Notion
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return unauthorizedResponse();
    }

    // Récupérer les credentials Notion (ignore les placeholders)
    const { token: notionToken, databaseId: notionDatabaseId, source } = await getNotionCredentials();

    if (!notionToken || !notionDatabaseId) {
      console.error('[NOTION-EVENTS] Missing configuration:', {
        hasToken: !!notionToken,
        hasDb: !!notionDatabaseId,
      });
      return errorResponse(
        'Configuration Notion manquante. Veuillez configurer NOTION_API_TOKEN et NOTION_DATABASE_ID dans les paramètres.',
        503
      );
    }

    console.log('[NOTION-EVENTS] Using credentials from:', source);
    console.log('[NOTION-EVENTS] Fetching from database:', {
      databaseId: notionDatabaseId,
      tokenLength: notionToken.length,
      tokenStart: notionToken.substring(0, 10) + '...',
    });

    const notion = new Client({ auth: notionToken });

    // Récupérer les événements depuis Notion
    const response = await notion.databases.query({
      database_id: notionDatabaseId,
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
    });

    console.log('[NOTION-EVENTS] Found', response.results.length, 'events');

    // Transformer les données Notion en format simplifié
    const events = response.results.map((page: any) => {
      const props = page.properties;

      // Extraire les propriétés de manière sécurisée
      const getTitle = (prop: any) => {
        if (prop?.title?.[0]?.plain_text) return prop.title[0].plain_text;
        return 'Sans titre';
      };

      const getRichText = (prop: any) => {
        if (prop?.rich_text?.[0]?.plain_text) return prop.rich_text[0].plain_text;
        return '';
      };

      const getDate = (prop: any) => {
        if (prop?.date?.start) return prop.date.start;
        return null;
      };

      const getNumber = (prop: any) => {
        if (prop?.number !== null && prop?.number !== undefined) return prop.number;
        return 0;
      };

      return {
        id: page.id,
        notion_page_id: page.id,
        client_name: getTitle(props['Client'] || props['Nom'] || props['Name']),
        event_type: getRichText(props['Type'] || props['Type événement']),
        event_date: getDate(props['Date']),
        album_name: getRichText(props['Album'] || props['Nom Album']),
        photomaton: getRichText(props['Photomaton'] || props['Boo']),
        total_sessions: getNumber(props['Sessions'] || props['Nb Sessions']),
        total_digital: getNumber(props['Digital'] || props['Nb Digital']),
        total_prints: getNumber(props['Prints'] || props['Nb Prints']),
        total_gifs: getNumber(props['GIFs'] || props['Nb GIFs']),
        notion_data: props,
        url: page.url,
      };
    });

    return successResponse({ events });
  } catch (error: any) {
    console.error('[NOTION-EVENTS] Error:', error);

    if (error.code === 'unauthorized') {
      return errorResponse(
        'Token Notion invalide. Vérifiez votre configuration.',
        401
      );
    }

    if (error.code === 'object_not_found') {
      return errorResponse(
        'Base de données Notion introuvable. Vérifiez l\'ID de la base.',
        404
      );
    }

    return errorResponse(
      `Erreur lors de la récupération des événements: ${error.message}`,
      500
    );
  }
}
