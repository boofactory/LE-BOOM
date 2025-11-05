import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';
import { Client } from '@notionhq/client';
import { prisma } from '@/lib/prisma';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * GET /api/notion/databases
 * Liste toutes les bases de données Notion accessibles avec le token
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return unauthorizedResponse();
    }

    // Récupérer le token Notion
    let notionToken = process.env.NOTION_API_TOKEN;

    if (!notionToken) {
      const tokenSetting = await prisma.setting.findUnique({
        where: { key: 'NOTION_API_TOKEN' },
      });
      notionToken = tokenSetting?.value;
    }

    if (!notionToken) {
      return errorResponse(
        'Token Notion manquant. Veuillez d\'abord configurer NOTION_API_TOKEN.',
        400
      );
    }

    console.log('[NOTION-DATABASES] Fetching databases list');

    const notion = new Client({ auth: notionToken });

    // Chercher toutes les databases
    const response = await notion.search({
      filter: {
        property: 'object',
        value: 'database',
      },
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time',
      },
    });

    console.log('[NOTION-DATABASES] Found', response.results.length, 'databases');

    // Formater les databases pour l'affichage
    const databases = response.results.map((db: any) => {
      const title = db.title?.[0]?.plain_text || 'Sans titre';
      const description = db.description?.[0]?.plain_text || '';

      return {
        id: db.id,
        title,
        description,
        url: db.url,
        last_edited_time: db.last_edited_time,
        created_time: db.created_time,
      };
    });

    return successResponse({ databases });
  } catch (error: any) {
    console.error('[NOTION-DATABASES] Error:', error);

    if (error.code === 'unauthorized') {
      return errorResponse(
        'Token Notion invalide. Vérifiez votre configuration.',
        401
      );
    }

    return errorResponse(
      `Erreur lors de la récupération des databases: ${error.message}`,
      500
    );
  }
}
