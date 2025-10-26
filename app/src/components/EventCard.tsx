'use client';

import { EventWithRelations } from '@/types';

interface EventCardProps {
  event: Partial<EventWithRelations> & { id: number; clientName: string };
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="card hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-dark">{event.clientName}</h3>
        {event.eventType && (
          <span className="px-2 py-1 bg-coral/20 text-coral text-xs font-medium rounded">
            {event.eventType}
          </span>
        )}
      </div>

      {event.eventDate && (
        <p className="text-sm text-gray-600 mb-2">
          📅 {new Date(event.eventDate).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      )}

      {event.albumName && (
        <p className="text-sm text-gray-500 mb-3">
          📁 {event.albumName}
        </p>
      )}

      {event.photomaton && (
        <p className="text-xs text-gray-500">
          📸 {event.photomaton.name}
        </p>
      )}

      <div className="mt-4 grid grid-cols-4 gap-2 pt-3 border-t border-gray-200">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-800">{event.totalSessions || 0}</p>
          <p className="text-xs text-gray-500">Sessions</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-coral">{event.totalPrints || 0}</p>
          <p className="text-xs text-gray-500">Prints</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-skyblue">{event.totalDigital || 0}</p>
          <p className="text-xs text-gray-500">Digital</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-purple-500">{event.totalGifs || 0}</p>
          <p className="text-xs text-gray-500">GIFs</p>
        </div>
      </div>
    </div>
  );
}
