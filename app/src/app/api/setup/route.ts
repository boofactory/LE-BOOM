import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';
import { isAppInitialized, markAppAsInitialized, generateNextAuthSecret } from '@/lib/db-init';
import bcrypt from 'bcrypt';

/**
 * GET /api/setup
 * Check if application is initialized
 */
export async function GET(request: NextRequest) {
  try {
    const initialized = await isAppInitialized();
    return successResponse({ initialized });
  } catch (error: any) {
    return errorResponse(`Error checking initialization: ${error.message}`, 500);
  }
}

/**
 * POST /api/setup
 * Initialize the application with admin credentials
 */
export async function POST(request: NextRequest) {
  try {
    // Check if already initialized
    const initialized = await isAppInitialized();
    if (initialized) {
      return errorResponse('Application is already initialized', 400);
    }

    const body = await request.json();
    const { username, password, email, name, notionToken, notionDatabaseId } = body;

    // Validate required fields
    if (!username || !password) {
      return errorResponse('Username and password are required', 400);
    }

    if (password.length < 8) {
      return errorResponse('Password must be at least 8 characters', 400);
    }

    // Generate NEXTAUTH_SECRET
    console.log('[SETUP] Generating NEXTAUTH_SECRET...');
    await generateNextAuthSecret();

    // Hash the password
    console.log('[SETUP] Hashing admin password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    console.log('[SETUP] Creating admin user...');
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email: email || `${username}@boofactory.local`,
        name: name || username,
        role: 'ADMIN',
      },
    });

    // Save Notion credentials if provided
    if (notionToken) {
      console.log('[SETUP] Saving Notion API token...');
      await prisma.setting.create({
        data: {
          key: 'NOTION_API_TOKEN',
          value: notionToken,
          encrypted: true,
          description: 'Notion API integration token',
        },
      });
    }

    if (notionDatabaseId) {
      console.log('[SETUP] Saving Notion database ID...');
      await prisma.setting.create({
        data: {
          key: 'NOTION_DATABASE_ID',
          value: notionDatabaseId,
          encrypted: false,
          description: 'Notion database ID for events',
        },
      });
    }

    // Mark app as initialized
    console.log('[SETUP] Marking application as initialized...');
    await markAppAsInitialized();

    console.log('[SETUP] ✅ Application initialized successfully!');

    return successResponse({
      message: 'Application initialized successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('[SETUP] Error:', error);

    if (error.code === 'P2002') {
      return errorResponse('Username or email already exists', 400);
    }

    return errorResponse(`Setup failed: ${error.message}`, 500);
  }
}
