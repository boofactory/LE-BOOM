import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';
import { Client } from '@notionhq/client';
import { prisma } from '@/lib/prisma';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * GET /api/notion/test
 * Test la connexion Notion et affiche des diagnostics détaillés
 */
export async function GET(request: NextRequest) {
  try {
    // Temporairement désactivé pour diagnostic
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return unauthorizedResponse();
    // }

    const diagnostics: any = {
      step1_env_vars: {},
      step2_settings: {},
      step3_final_values: {},
      step4_notion_test: {},
    };

    // Étape 1: Vérifier les variables d'environnement
    diagnostics.step1_env_vars = {
      NOTION_API_TOKEN: process.env.NOTION_API_TOKEN ? {
        exists: true,
        length: process.env.NOTION_API_TOKEN.length,
        first10: process.env.NOTION_API_TOKEN.substring(0, 10),
        last4: process.env.NOTION_API_TOKEN.slice(-4),
      } : { exists: false },
      NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID ? {
        exists: true,
        value: process.env.NOTION_DATABASE_ID,
      } : { exists: false },
    };

    // Étape 2: Vérifier les settings en base de données
    const tokenSetting = await prisma.setting.findUnique({
      where: { key: 'NOTION_API_TOKEN' },
    });
    const dbSetting = await prisma.setting.findUnique({
      where: { key: 'NOTION_DATABASE_ID' },
    });

    diagnostics.step2_settings = {
      NOTION_API_TOKEN: tokenSetting ? {
        exists: true,
        length: tokenSetting.value.length,
        first10: tokenSetting.value.substring(0, 10),
        last4: tokenSetting.value.slice(-4),
        encrypted: tokenSetting.encrypted,
        hasSpaces: tokenSetting.value.includes(' '),
        hasNewlines: tokenSetting.value.includes('\n') || tokenSetting.value.includes('\r'),
      } : { exists: false },
      NOTION_DATABASE_ID: dbSetting ? {
        exists: true,
        value: dbSetting.value,
        length: dbSetting.value.length,
        hasSpaces: dbSetting.value.includes(' '),
        hasNewlines: dbSetting.value.includes('\n') || dbSetting.value.includes('\r'),
      } : { exists: false },
    };

    // Étape 3: Valeurs finales utilisées
    const notionToken = tokenSetting?.value || process.env.NOTION_API_TOKEN;
    const notionDatabaseId = dbSetting?.value || process.env.NOTION_DATABASE_ID;

    diagnostics.step3_final_values = {
      source: tokenSetting ? 'settings' : 'env',
      token: notionToken ? {
        exists: true,
        length: notionToken.length,
        first10: notionToken.substring(0, 10),
        last4: notionToken.slice(-4),
      } : { exists: false },
      databaseId: notionDatabaseId ? {
        exists: true,
        value: notionDatabaseId,
      } : { exists: false },
    };

    if (!notionToken || !notionDatabaseId) {
      return successResponse({
        status: 'error',
        message: 'Configuration Notion incomplète',
        diagnostics,
      });
    }

    // Étape 4: Tester la connexion Notion
    try {
      const notion = new Client({ auth: notionToken });

      // Test 1: Récupérer les infos de la base de données
      const database = await notion.databases.retrieve({
        database_id: notionDatabaseId,
      });

      diagnostics.step4_notion_test = {
        database_found: true,
        database_title: (database as any).title?.[0]?.plain_text || 'Sans titre',
        properties_count: Object.keys((database as any).properties || {}).length,
        properties: Object.keys((database as any).properties || {}),
      };

      // Test 2: Essayer de récupérer les pages
      const pages = await notion.databases.query({
        database_id: notionDatabaseId,
        page_size: 1,
      });

      diagnostics.step4_notion_test.pages_test = {
        success: true,
        has_results: pages.results.length > 0,
        total_results: pages.results.length,
      };

      return successResponse({
        status: 'success',
        message: 'Connexion Notion réussie!',
        diagnostics,
      });
    } catch (notionError: any) {
      diagnostics.step4_notion_test = {
        error: true,
        code: notionError.code,
        message: notionError.message,
        status: notionError.status,
        body: notionError.body,
      };

      return successResponse({
        status: 'notion_error',
        message: 'Erreur lors du test Notion',
        diagnostics,
      });
    }
  } catch (error: any) {
    console.error('[NOTION-TEST] Error:', error);
    return errorResponse(`Test failed: ${error.message}`, 500);
  }
}
