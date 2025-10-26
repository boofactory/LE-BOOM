import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/response';
import { UpdatePhotomatonStatusRequest } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body: UpdatePhotomatonStatusRequest = await request.json();

    const updateData: any = {
      lastSeen: new Date(),
    };

    if (body.routerConnected !== undefined) {
      updateData.routerConnected = body.routerConnected;
    }

    if (body.pcConnected !== undefined) {
      updateData.pcConnected = body.pcConnected;
    }

    if (body.remainingPrints !== undefined) {
      updateData.remainingPrints = body.remainingPrints;
      updateData.lastPrintUpdate = new Date();
    }

    const photomaton = await prisma.photomaton.update({
      where: { id },
      data: updateData,
    });

    return successResponse({ photomaton });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return notFoundResponse('Photomaton');
    }
    console.error('Error updating photomaton status:', error);
    return errorResponse('Failed to update status', 500);
  }
}
