import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/response';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        photomaton: true,
        photos: {
          orderBy: {
            timestamp: 'desc',
          },
        },
      },
    });

    if (!event) {
      return notFoundResponse('Event');
    }

    return successResponse({ event });
  } catch (error) {
    console.error('Error fetching event:', error);
    return errorResponse('Failed to fetch event', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Compter les photos avant suppression
    const photosCount = await prisma.photo.count({
      where: { eventId: id },
    });

    // Supprimer l'événement (cascade supprime les photos)
    await prisma.event.delete({
      where: { id },
    });

    return successResponse({
      success: true,
      deleted: {
        eventId: id,
        photosDeleted: photosCount,
      },
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return notFoundResponse('Event');
    }
    console.error('Error deleting event:', error);
    return errorResponse('Failed to delete event', 500);
  }
}
