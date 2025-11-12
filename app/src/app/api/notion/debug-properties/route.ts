import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';
import { Client } from '@notionhq/client';
import { getNotionCredentials } from '@/lib/notion-config';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * GET /api/notion/debug-properties
 * Debug endpoint to see all properties of events
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return unauthorizedResponse();
    }

    const { token: notionToken, databaseId: notionDatabaseId } = await getNotionCredentials();

    if (!notionToken || !notionDatabaseId) {
      return errorResponse('Configuration Notion manquante', 503);
    }

    const notion = new Client({ auth: notionToken });

    // Get first 3 events without any filter
    const response = await notion.databases.query({
      database_id: notionDatabaseId,
      page_size: 3,
    });

    // Return raw properties
    const debugData = response.results.map((page: any) => ({
      id: page.id,
      properties: Object.keys(page.properties).map(key => ({
        name: key,
        type: page.properties[key].type,
        value: page.properties[key],
      })),
    }));

    // Log to server console for debugging
    console.log('\n=== NOTION PROPERTIES DEBUG ===');
    debugData.forEach((event, i) => {
      console.log(`\nEvent ${i + 1} (${event.id}):`);
      event.properties.forEach(prop => {
        if (prop.name.toLowerCase().includes('livrer') || prop.name === 'A Livrer') {
          console.log(`  → ${prop.name} (${prop.type}):`, JSON.stringify(prop.value, null, 2));
        }
      });
      console.log('  All property names:', event.properties.map(p => p.name).join(', '));
    });
    console.log('=== END DEBUG ===\n');

    return successResponse({ events: debugData });
  } catch (error: any) {
    console.error('[DEBUG-PROPERTIES] Error:', error);
    return errorResponse(`Erreur: ${error.message}`, 500);
  }
}
