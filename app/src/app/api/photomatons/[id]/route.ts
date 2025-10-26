import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/response';
import { UpdatePhotomatonConfigRequest } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const photomaton = await prisma.photomaton.findUnique({
      where: { id },
      include: {
        events: {
          where: {
            status: 'ACTIVE',
          },
          take: 1,
        },
        speedTests: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!photomaton) {
      return notFoundResponse('Photomaton');
    }

    return successResponse({ photomaton });
  } catch (error) {
    console.error('Error fetching photomaton:', error);
    return errorResponse('Failed to fetch photomaton', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body: UpdatePhotomatonConfigRequest = await request.json();

    const photomaton = await prisma.photomaton.update({
      where: { id },
      data: {
        warningThreshold: body.warningThreshold,
        criticalThreshold: body.criticalThreshold,
      },
    });

    return successResponse({ photomaton });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return notFoundResponse('Photomaton');
    }
    console.error('Error updating photomaton:', error);
    return errorResponse('Failed to update photomaton', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    await prisma.photomaton.delete({
      where: { id },
    });

    return successResponse({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return notFoundResponse('Photomaton');
    }
    console.error('Error deleting photomaton:', error);
    return errorResponse('Failed to delete photomaton', 500);
  }
}
