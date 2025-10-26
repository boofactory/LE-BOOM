import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';
import { EventStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as EventStatus | null;
    const photomatonId = searchParams.get('photomatonId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (photomatonId) {
      where.photomatonId = parseInt(photomatonId);
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        photomaton: true,
        _count: {
          select: {
            photos: true,
          },
        },
      },
      orderBy: [
        {
          eventDate: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
      take: Math.min(limit, 100),
    });

    const total = await prisma.event.count({ where });

    return successResponse({ events, total });
  } catch (error) {
    console.error('Error fetching events:', error);
    return errorResponse('Failed to fetch events', 500);
  }
}
