#!/usr/bin/env node

/**
 * Pre-start script that initializes environment before starting the application
 * This runs BEFORE Node.js loads the Next.js application
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

// URL-encode function for handling special characters in passwords
function urlEncode(str) {
  return encodeURIComponent(str);
}

// Build DATABASE_URL from individual env vars
function buildDatabaseUrl() {
  const user = process.env.POSTGRES_USER || 'boom_admin';
  const password = process.env.POSTGRES_PASSWORD;
  const db = process.env.POSTGRES_DB || 'boom_v2';

  if (!password) {
    console.error('❌ POSTGRES_PASSWORD environment variable is required!');
    process.exit(1);
  }

  const encodedPassword = urlEncode(password);
  return `postgresql://${user}:${encodedPassword}@postgres:5432/${db}`;
}

// Build REDIS_URL from individual env vars
function buildRedisUrl() {
  const password = process.env.REDIS_PASSWORD;

  if (!password) {
    console.error('❌ REDIS_PASSWORD environment variable is required!');
    process.exit(1);
  }

  const encodedPassword = urlEncode(password);
  return `redis://:${encodedPassword}@redis:6379`;
}

async function initializeEnvironment() {
  console.log('🚀 LE BOOM - Pre-start initialization...\n');

  // Step 1: Build DATABASE_URL and REDIS_URL
  console.log('📦 Building connection URLs...');
  process.env.DATABASE_URL = buildDatabaseUrl();
  process.env.REDIS_URL = buildRedisUrl();
  console.log('✅ DATABASE_URL configured');
  console.log('✅ REDIS_URL configured\n');

  // Step 2: Load or generate NEXTAUTH_SECRET
  console.log('🔐 Loading NEXTAUTH_SECRET...');

  let prisma;
  try {
    prisma = new PrismaClient();

    const setting = await prisma.setting.findUnique({
      where: { key: 'NEXTAUTH_SECRET' },
    });

    if (setting?.value) {
      process.env.NEXTAUTH_SECRET = setting.value;
      console.log('✅ NEXTAUTH_SECRET loaded from database\n');
    } else {
      // Generate new secret
      const secret = crypto.randomBytes(32).toString('base64');
      process.env.NEXTAUTH_SECRET = secret;

      try {
        await prisma.setting.create({
          data: {
            key: 'NEXTAUTH_SECRET',
            value: secret,
            encrypted: true,
            description: 'NextAuth secret for JWT signing',
          },
        });
        console.log('✅ NEXTAUTH_SECRET generated and saved\n');
      } catch (createError) {
        // Might fail if database not migrated yet, that's OK
        console.log('⚠️  NEXTAUTH_SECRET generated (not saved - DB not ready)\n');
      }
    }
  } catch (error) {
    console.log('⚠️  Database not ready, using temporary NEXTAUTH_SECRET');
    process.env.NEXTAUTH_SECRET = crypto.randomBytes(32).toString('base64');
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }

  console.log('✅ Pre-start initialization complete!\n');
  console.log('Starting application...\n');
}

// Run initialization
initializeEnvironment()
  .then(() => {
    // Start the actual application
    require('./server.js');
  })
  .catch((error) => {
    console.error('❌ Pre-start initialization failed:', error);
    process.exit(1);
  });
