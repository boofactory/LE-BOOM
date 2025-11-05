import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/response';
import { Client } from '@notionhq/client';
import { getNotionCredentials } from '@/lib/notion-config';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * GET /api/notion/inspect
 * Inspect la structure de la database Notion pour déboguer
 * Auth désactivée pour permettre le débogage rapide
 */
export async function GET(request: NextRequest) {
  try {
    const { token: notionToken, databaseId: notionDatabaseId } = await getNotionCredentials();

    if (!notionToken || !notionDatabaseId) {
      return errorResponse('Configuration Notion manquante', 400);
    }

    const notion = new Client({ auth: notionToken });

    // Récupérer la structure de la database
    const database = await notion.databases.retrieve({
      database_id: notionDatabaseId,
    });

    // Extraire les propriétés
    const properties = (database as any).properties || {};
    const propertyList = Object.keys(properties).map((key) => ({
      name: key,
      type: properties[key].type,
      id: properties[key].id,
    }));

    // Récupérer une page exemple pour voir les données réelles
    const pages = await notion.databases.query({
      database_id: notionDatabaseId,
      page_size: 1,
    });

    let examplePage = null;
    if (pages.results.length > 0) {
      const page = pages.results[0] as any;
      const exampleProps: any = {};

      Object.keys(page.properties).forEach((key) => {
        const prop = page.properties[key];
        exampleProps[key] = {
          type: prop.type,
          hasValue: !!prop[prop.type],
          sample: prop[prop.type],
        };
      });

      examplePage = {
        id: page.id,
        properties: exampleProps,
      };
    }

    return successResponse({
      database: {
        id: (database as any).id,
        title: (database as any).title?.[0]?.plain_text || 'Sans titre',
        description: (database as any).description?.[0]?.plain_text || '',
      },
      properties: propertyList,
      propertyNames: Object.keys(properties),
      totalProperties: Object.keys(properties).length,
      examplePage,
    });
  } catch (error: any) {
    console.error('[NOTION-INSPECT] Error:', error);
    return errorResponse(
      `Erreur: ${error.message}`,
      error.status || 500
    );
  }
}
