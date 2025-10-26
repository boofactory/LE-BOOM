import { NextRequest } from 'next/server';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';
import { prisma } from '@/lib/prisma';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Vérifie l'authentification de test
 */
function checkTestAuth(request: NextRequest): boolean {
  const apiKey = request.headers.get('X-Test-API-Key');
  const validApiKey = process.env.TEST_API_KEY;

  if (!validApiKey) {
    return false;
  }

  return apiKey === validApiKey;
}

/**
 * POST /api/test/run
 * Exécute des tests automatisés
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    if (!checkTestAuth(request)) {
      console.log('[TEST-RUN] Unauthorized attempt');
      return unauthorizedResponse('Invalid or missing X-Test-API-Key header');
    }

    const body = await request.json();
    const { test, data } = body;

    console.log('[TEST-RUN] Running test:', test);

    const results: any = {
      test,
      timestamp: new Date().toISOString(),
      passed: false,
      details: {},
    };

    switch (test) {
      case 'database':
        results.details = await testDatabase();
        results.passed = results.details.connected;
        break;

      case 'settings':
        results.details = await testSettings(data);
        results.passed = results.details.success;
        break;

      case 'auth':
        results.details = await testAuth(data);
        results.passed = results.details.success;
        break;

      case 'notion':
        results.details = await testNotion(data);
        results.passed = results.details.success;
        break;

      case 'all':
        const allTests = await runAllTests(data);
        results.details = allTests;
        results.passed = allTests.every((t: any) => t.passed);
        break;

      default:
        return errorResponse(`Unknown test: ${test}`, 400);
    }

    console.log('[TEST-RUN] Test completed:', { test, passed: results.passed });

    return successResponse(results);
  } catch (error: any) {
    console.error('[TEST-RUN] Error:', error);
    return errorResponse(`Test execution failed: ${error.message}`, 500);
  }
}

/**
 * Test de connexion à la base de données
 */
async function testDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    // Compter les tables
    const tables = [
      'photomatons',
      'events',
      'photos',
      'settings',
      'users',
    ];

    const tableCounts: any = {};
    for (const table of tables) {
      try {
        const result: any = await prisma.$queryRawUnsafe(
          `SELECT COUNT(*) as count FROM "${table}"`
        );
        tableCounts[table] = parseInt(result[0]?.count || '0', 10);
      } catch (error) {
        tableCounts[table] = 'ERROR';
      }
    }

    return {
      connected: true,
      tables: tableCounts,
    };
  } catch (error: any) {
    return {
      connected: false,
      error: error.message,
    };
  }
}

/**
 * Test CRUD settings
 */
async function testSettings(data?: any) {
  try {
    const testKey = 'TEST_SETTING_' + Date.now();
    const testValue = 'test-value-' + Math.random();

    // CREATE
    const created = await prisma.setting.create({
      data: {
        key: testKey,
        value: testValue,
        description: 'Test setting created by API test',
        encrypted: false,
      },
    });

    // READ
    const read = await prisma.setting.findUnique({
      where: { key: testKey },
    });

    // UPDATE
    const updated = await prisma.setting.update({
      where: { key: testKey },
      data: { value: testValue + '-updated' },
    });

    // DELETE
    await prisma.setting.delete({
      where: { key: testKey },
    });

    return {
      success: true,
      operations: {
        create: !!created,
        read: read?.value === testValue,
        update: updated?.value === testValue + '-updated',
        delete: true,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Test d'authentification
 */
async function testAuth(data?: any) {
  try {
    // Vérifier que les variables d'environnement sont configurées
    const checks = {
      adminUsername: !!process.env.ADMIN_USERNAME,
      adminPasswordHash: !!process.env.ADMIN_PASSWORD_HASH,
      nextauthSecret: !!process.env.NEXTAUTH_SECRET,
      nextauthUrl: !!process.env.NEXTAUTH_URL,
    };

    return {
      success: Object.values(checks).every(Boolean),
      checks,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Test de synchronisation Notion
 */
async function testNotion(data?: any) {
  try {
    const notionToken = process.env.NOTION_API_TOKEN;
    const notionDatabaseId = process.env.NOTION_DATABASE_ID;

    if (!notionToken || !notionDatabaseId) {
      return {
        success: false,
        error: 'Notion API credentials not configured',
      };
    }

    // Test simple: vérifier que les credentials sont présents
    // Dans un test complet, on ferait un vrai appel à l'API Notion
    return {
      success: true,
      configured: true,
      note: 'Full Notion API test not implemented yet',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Exécute tous les tests
 */
async function runAllTests(data?: any) {
  const tests = [
    { name: 'database', fn: testDatabase },
    { name: 'settings', fn: testSettings },
    { name: 'auth', fn: testAuth },
    { name: 'notion', fn: testNotion },
  ];

  const results: Array<{
    name: string;
    passed: boolean;
    details?: any;
    error?: string;
  }> = [];

  for (const test of tests) {
    try {
      const result = await test.fn(data);
      results.push({
        name: test.name,
        passed: result.success !== false && result.connected !== false,
        details: result,
      });
    } catch (error: any) {
      results.push({
        name: test.name,
        passed: false,
        error: error.message,
      });
    }
  }

  return results;
}
