import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * URL-encode passwords to handle special characters
 */
function urlEncode(str: string): string {
  return encodeURIComponent(str);
}

/**
 * Build DATABASE_URL from individual components with automatic URL encoding
 */
export function buildDatabaseUrl(): string {
  const user = process.env.POSTGRES_USER || 'boom_admin';
  const password = process.env.POSTGRES_PASSWORD || '';
  const db = process.env.POSTGRES_DB || 'boom_v2';

  if (!password) {
    throw new Error('POSTGRES_PASSWORD environment variable is required');
  }

  const encodedPassword = urlEncode(password);
  return `postgresql://${user}:${encodedPassword}@postgres:5432/${db}`;
}

/**
 * Build REDIS_URL from individual components with automatic URL encoding
 */
export function buildRedisUrl(): string {
  const password = process.env.REDIS_PASSWORD || '';

  if (!password) {
    throw new Error('REDIS_PASSWORD environment variable is required');
  }

  const encodedPassword = urlEncode(password);
  return `redis://:${encodedPassword}@redis:6379`;
}

/**
 * Initialize DATABASE_URL and REDIS_URL in process.env if not already set
 */
export function initializeDatabaseUrls(): void {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = buildDatabaseUrl();
    console.log('✅ DATABASE_URL constructed from env vars');
  }

  if (!process.env.REDIS_URL) {
    process.env.REDIS_URL = buildRedisUrl();
    console.log('✅ REDIS_URL constructed from env vars');
  }
}

/**
 * Check if the application has been initialized (has required settings)
 */
export async function isAppInitialized(): Promise<boolean> {
  try {
    const requiredSettings = await prisma.setting.findMany({
      where: {
        key: {
          in: ['NEXTAUTH_SECRET', 'APP_INITIALIZED'],
        },
      },
    });

    return requiredSettings.length >= 2;
  } catch (error) {
    console.error('Error checking initialization status:', error);
    return false;
  }
}

/**
 * Generate and save NEXTAUTH_SECRET
 */
export async function generateNextAuthSecret(): Promise<string> {
  const secret = crypto.randomBytes(32).toString('base64');

  await prisma.setting.upsert({
    where: { key: 'NEXTAUTH_SECRET' },
    create: {
      key: 'NEXTAUTH_SECRET',
      value: secret,
      encrypted: true,
      description: 'NextAuth secret for JWT signing',
    },
    update: {
      value: secret,
    },
  });

  return secret;
}

/**
 * Get NEXTAUTH_SECRET from database or generate if doesn't exist
 * Also sets it in process.env for NextAuth to use
 */
export async function getOrCreateNextAuthSecret(): Promise<string> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'NEXTAUTH_SECRET' },
    });

    let secret: string;
    if (setting?.value) {
      secret = setting.value;
    } else {
      secret = await generateNextAuthSecret();
    }

    // Set in environment for NextAuth
    process.env.NEXTAUTH_SECRET = secret;
    console.log('✅ NEXTAUTH_SECRET loaded from database');
    return secret;
  } catch (error) {
    console.error('Error getting NextAuth secret:', error);
    // Fallback to env var or generate temporary one
    const fallback = process.env.NEXTAUTH_SECRET || crypto.randomBytes(32).toString('base64');
    process.env.NEXTAUTH_SECRET = fallback;
    return fallback;
  }
}

/**
 * Mark application as initialized
 */
export async function markAppAsInitialized(): Promise<void> {
  await prisma.setting.upsert({
    where: { key: 'APP_INITIALIZED' },
    create: {
      key: 'APP_INITIALIZED',
      value: 'true',
      encrypted: false,
      description: 'Application initialization flag',
    },
    update: {
      value: 'true',
    },
  });
}
