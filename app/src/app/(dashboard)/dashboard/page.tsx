'use client';

import EventCard from '@/components/EventCard';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events?status=ACTIVE');
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncNotion = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/notion/sync', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        alert(`Synchronisation réussie: ${data.created} créés, ${data.updated} mis à jour`);
        fetchEvents();
      }
    } catch (error) {
      console.error('Error syncing:', error);
      alert('Erreur lors de la synchronisation');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-dark">Événements en cours</h2>
        <button onClick={syncNotion} disabled={syncing} className="btn-primary">
          {syncing ? 'Synchronisation...' : '🔄 Sync Notion'}
        </button>
      </div>

      {events.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">Aucun événement en cours</p>
          <button onClick={syncNotion} disabled={syncing} className="btn-secondary">
            Synchroniser depuis Notion
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
