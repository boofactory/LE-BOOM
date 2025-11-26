import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';

/**
 * GET /api/users
 * List all users (admin only)
 */
export async function GET(request: NextRequest) {
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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        infomaniakId: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { active: 'desc' },  // Active users first
        { createdAt: 'desc' }, // Then newest first
      ],
    });

    return successResponse({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return errorResponse('Failed to fetch users', 500);
  }
}
