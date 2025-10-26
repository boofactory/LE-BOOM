import { Photomaton, Event, Photo, SpeedTest, MediaType, EventStatus } from '@prisma/client';

// Re-export Prisma types
export type { Photomaton, Event, Photo, SpeedTest, MediaType, EventStatus };

// Extended types with relations
export type PhotomatonWithRelations = Photomaton & {
  currentEvent?: Event | null;
  stats?: {
    totalDigital: number;
    totalPrints: number;
    totalGifs: number;
  };
};

export type EventWithRelations = Event & {
  photomaton: Photomaton;
  photos?: Photo[];
};

// API Request types
export interface UpdatePhotomatonStatusRequest {
  routerConnected?: boolean;
  pcConnected?: boolean;
  remainingPrints?: number;
}

export interface UpdatePhotomatonConfigRequest {
  warningThreshold?: number;
  criticalThreshold?: number;
}

export interface TriggerActionRequest {
  photomatonId: number;
  action: 'power_on' | 'power_off' | 'lock' | 'unlock' | 'print_test';
}

export interface AgentSyncRequest {
  hostname: string;
  stats: Array<{
    type: MediaType;
    count: number;
    timestamp: string;
  }>;
  paperLevel?: number;
  speedtest?: {
    download: number;
    upload: number;
    ping: number;
  };
}
