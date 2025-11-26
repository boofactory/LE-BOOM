import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';

/**
 * PATCH /api/users/[id]
 * Update user (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return unauthorizedResponse();
    }

    // Check if user is admin
    const userRole = (session.user as any)?.role;
    if (userRole !== 'admin') {
      return errorResponse('Forbidden: Admin access required', 403);
    }

    const { id } = await params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return errorResponse('Invalid user ID', 400);
    }

    const body = await request.json();
    const { role, active } = body;

    // Validate role if provided
    if (role && !['ADMIN', 'INSTALLER', 'VIEWER'].includes(role)) {
      return errorResponse('Invalid role. Must be ADMIN, INSTALLER, or VIEWER', 400);
    }

    // Validate active if provided
    if (active !== undefined && typeof active !== 'boolean') {
      return errorResponse('Invalid active value. Must be boolean', 400);
    }

    // Build update data
    const updateData: any = {};
    if (role) updateData.role = role;
    if (active !== undefined) updateData.active = active;

    if (Object.keys(updateData).length === 0) {
      return errorResponse('No valid update fields provided', 400);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        updatedAt: true,
      },
    });

    console.log('[USERS] User updated:', { userId, updates: updateData });
    return successResponse({ user });
  } catch (error: any) {
    console.error('Error updating user:', error);

    if (error.code === 'P2025') {
      return errorResponse('User not found', 404);
    }

    return errorResponse('Failed to update user', 500);
  }
}
