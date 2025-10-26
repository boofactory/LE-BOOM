import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';

/**
 * GET /api/health/database
 * Vérifie l'état de la base de données et des tables
 */
export async function GET(request: NextRequest) {
  try {
    const checks: any = {
      connected: false,
      tables: {},
      migrations: {
        executed: false,
        count: 0,
      },
    };

    // Test de connexion
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.connected = true;
    } catch (error) {
      return errorResponse('Database connection failed', 500);
    }

    // Vérifier les tables essentielles
    const expectedTables = [
      'photomatons',
      'events',
      'photos',
      'speedtests',
      'users',
      'accounts',
      'sessions',
      'settings',
      'audit_logs',
      '_prisma_migrations',
    ];

    for (const table of expectedTables) {
      try {
        // Essayer de compter les lignes
        const result: any = await prisma.$queryRawUnsafe(
          `SELECT COUNT(*) as count FROM "${table}"`
        );
        checks.tables[table] = {
          exists: true,
          count: parseInt(result[0]?.count || '0', 10),
        };
      } catch (error: any) {
        checks.tables[table] = {
          exists: false,
          error: error.message,
        };
      }
    }

    // Vérifier les migrations
    try {
      const migrations: any = await prisma.$queryRaw`
        SELECT migration_name, finished_at, started_at
        FROM "_prisma_migrations"
        ORDER BY started_at DESC
      `;
      checks.migrations.executed = true;
      checks.migrations.count = migrations.length;
      checks.migrations.latest = migrations[0]?.migration_name;
      checks.migrations.list = migrations.map((m: any) => ({
        name: m.migration_name,
        finished: !!m.finished_at,
        started: m.started_at,
      }));
    } catch (error) {
      checks.migrations.error = 'Migration table not accessible';
    }

    // Déterminer le statut global
    const missingTables = Object.entries(checks.tables)
      .filter(([, info]: any) => !info.exists)
      .map(([name]) => name);

    const status = missingTables.length === 0 ? 'healthy' : 'degraded';

    return successResponse({
      status,
      checks,
      missingTables,
      recommendations: missingTables.length > 0
        ? [
            'Exécutez "npx prisma db push" pour créer les tables manquantes',
            'Ou exécutez "npx prisma migrate deploy" pour appliquer les migrations',
          ]
        : [],
    });
  } catch (error: any) {
    console.error('[HEALTH] Database check error:', error);
    return errorResponse(`Database health check failed: ${error.message}`, 500);
  }
}
