import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';

/**
 * GET /api/settings
 * Récupère tous les settings (sans les valeurs encrypted pour la sécurité)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return unauthorizedResponse();
    }

    const settings = await prisma.setting.findMany({
      select: {
        id: true,
        key: true,
        value: true,
        description: true,
        encrypted: true,
        updatedAt: true,
      },
      orderBy: {
        key: 'asc',
      },
    });

    // Masquer les valeurs encrypted
    const sanitizedSettings = settings.map((setting) => ({
      ...setting,
      value: setting.encrypted ? '********' : setting.value,
    }));

    return successResponse({ settings: sanitizedSettings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return errorResponse('Failed to fetch settings', 500);
  }
}

/**
 * POST /api/settings
 * Crée ou met à jour un setting
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { key, value, description, encrypted } = body;

    if (!key || value === undefined) {
      return errorResponse('Missing required fields: key and value', 400);
    }

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value, description, encrypted: encrypted || false },
      create: { key, value, description, encrypted: encrypted || false },
    });

    return successResponse({ setting });
  } catch (error) {
    console.error('Error upserting setting:', error);
    return errorResponse('Failed to save setting', 500);
  }
}

/**
 * DELETE /api/settings
 * Supprime un setting
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return errorResponse('Missing required parameter: key', 400);
    }

    await prisma.setting.delete({
      where: { key },
    });

    return successResponse({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return errorResponse('Setting not found', 404);
    }
    console.error('Error deleting setting:', error);
    return errorResponse('Failed to delete setting', 500);
  }
}
