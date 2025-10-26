import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    // Compter le total d'événements
    const totalEvents = await prisma.event.count();

    // Calculer les moyennes
    const avgStats = await prisma.event.aggregate({
      _avg: {
        totalSessions: true,
        totalPrints: true,
        totalGifs: true,
        totalDigital: true,
      },
    });

    // Trouver les records (max de chaque catégorie)
    const maxSessions = await prisma.event.findFirst({
      where: {
        totalSessions: {
          gt: 0,
        },
      },
      orderBy: {
        totalSessions: 'desc',
      },
      select: {
        totalSessions: true,
        clientName: true,
      },
    });

    const maxPrints = await prisma.event.findFirst({
      where: {
        totalPrints: {
          gt: 0,
        },
      },
      orderBy: {
        totalPrints: 'desc',
      },
      select: {
        totalPrints: true,
        clientName: true,
      },
    });

    const maxGifs = await prisma.event.findFirst({
      where: {
        totalGifs: {
          gt: 0,
        },
      },
      orderBy: {
        totalGifs: 'desc',
      },
      select: {
        totalGifs: true,
        clientName: true,
      },
    });

    const maxDigital = await prisma.event.findFirst({
      where: {
        totalDigital: {
          gt: 0,
        },
      },
      orderBy: {
        totalDigital: 'desc',
      },
      select: {
        totalDigital: true,
        clientName: true,
      },
    });

    return successResponse({
      totalEvents,
      averages: {
        sessionsPerEvent: Math.round((avgStats._avg.totalSessions || 0) * 10) / 10,
        printsPerEvent: Math.round((avgStats._avg.totalPrints || 0) * 10) / 10,
        gifsPerEvent: Math.round((avgStats._avg.totalGifs || 0) * 10) / 10,
        digitalPerEvent: Math.round((avgStats._avg.totalDigital || 0) * 10) / 10,
      },
      records: {
        maxSessions: {
          value: maxSessions?.totalSessions || 0,
          eventName: maxSessions?.clientName || 'N/A',
        },
        maxPrints: {
          value: maxPrints?.totalPrints || 0,
          eventName: maxPrints?.clientName || 'N/A',
        },
        maxGifs: {
          value: maxGifs?.totalGifs || 0,
          eventName: maxGifs?.clientName || 'N/A',
        },
        maxDigital: {
          value: maxDigital?.totalDigital || 0,
          eventName: maxDigital?.clientName || 'N/A',
        },
      },
    });
  } catch (error) {
    console.error('Error fetching global stats:', error);
    return errorResponse('Failed to fetch stats', 500);
  }
}
