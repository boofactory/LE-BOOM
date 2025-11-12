'use client';

import EventCard from '@/components/EventCard';
import EventModal from '@/components/EventModal';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (event: any) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleStatusUpdate = () => {
    // Refresh events after status update
    fetchEventsFromNotion(true);
  };

  const fetchEventsFromNotion = async (isAutoRefresh = false) => {
    try {
      // Pour l'auto-refresh, on ne bloque pas l'UI
      if (isAutoRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Appeler l'API Notion directement pour récupérer les événements
      const response = await fetch('/api/notion/events');
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setEvents([]);
      } else {
        setEvents(data.events || []);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching events from Notion:', error);
      setError('Erreur lors du chargement des événements');
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchEventsFromNotion();
  }, []);

  // Auto-refresh toutes les 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchEventsFromNotion(true);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  const formatLastUpdate = () => {
    if (!lastUpdate) return '';
    const now = new Date();
    const diffMs = now.getTime() - lastUpdate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins === 1) return 'Il y a 1 minute';
    if (diffMins < 60) return `Il y a ${diffMins} minutes`;
    return lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-dark">Événements</h2>
          {lastUpdate && (
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              {refreshing && (
                <span className="inline-block w-2 h-2 bg-skyblue rounded-full animate-pulse"></span>
              )}
              Mise à jour: {formatLastUpdate()}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="card bg-red-50 border border-red-200 text-red-800 mb-6 p-4">
          <p className="font-medium">Erreur</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2">
            Vérifiez que vos clés Notion sont configurées dans{' '}
            <a href="/dashboard/settings" className="underline">Paramètres</a>
          </p>
        </div>
      )}

      {events.length === 0 && !error ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">Aucun événement trouvé dans Notion</p>
          <p className="text-sm text-gray-400">
            Les événements s'affichent automatiquement depuis votre base Notion
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} onOpenDetails={handleOpenModal} />
          ))}
        </div>
      )}

      {/* Event Modal */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}
