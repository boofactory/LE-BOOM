'use client';

import { useEffect, useState } from 'react';

export default function HistoryPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events?limit=100');
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

      if (response.ok) {
        alert('Événement supprimé');
        fetchEvents();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-dark mb-6">Historique des événements</h2>

      {events.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">Aucun événement</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Photomaton</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Sessions</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Prints</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Digital</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">GIFs</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Statut</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{event.clientName}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {event.eventDate
                      ? new Date(event.eventDate).toLocaleDateString('fr-FR')
                      : '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {event.photomaton?.name || '-'}
                  </td>
                  <td className="py-3 px-4 text-right">{event.totalSessions}</td>
                  <td className="py-3 px-4 text-right text-coral font-semibold">
                    {event.totalPrints}
                  </td>
                  <td className="py-3 px-4 text-right text-skyblue font-semibold">
                    {event.totalDigital}
                  </td>
                  <td className="py-3 px-4 text-right text-purple-500 font-semibold">
                    {event.totalGifs}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        event.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : event.status === 'COMPLETED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
