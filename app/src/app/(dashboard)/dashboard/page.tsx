'use client';

import EventCard from '@/components/EventCard';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventsFromNotion = async () => {
    try {
      setLoading(true);
      setError(null);

      // Appeler l'API Notion directement pour récupérer les événements
      const response = await fetch('/api/notion/events');
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setEvents([]);
      } else {
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error fetching events from Notion:', error);
      setError('Erreur lors du chargement des événements');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsFromNotion();
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
        <h2 className="text-3xl font-bold text-dark">Événements Notion</h2>
        <button
          onClick={fetchEventsFromNotion}
          disabled={loading}
          className="btn-secondary"
        >
          {loading ? 'Chargement...' : '🔄 Rafraîchir'}
        </button>
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
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
