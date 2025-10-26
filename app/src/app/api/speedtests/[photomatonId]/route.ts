import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ photomatonId: string }> }
) {
  try {
    const { photomatonId: photomatonIdString } = await params;
    const photomatonId = parseInt(photomatonIdString);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const speedtests = await prisma.speedTest.findMany({
      where: {
        photomatonId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: Math.min(limit, 100),
    });

    return successResponse({ speedtests });
  } catch (error) {
    console.error('Error fetching speedtests:', error);
    return errorResponse('Failed to fetch speedtests', 500);
  }
}
