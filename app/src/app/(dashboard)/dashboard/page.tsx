'use client';

import EventCard from '@/components/EventCard';
import EventInfoModal from '@/components/EventInfoModal';
import StatusChangeModal from '@/components/StatusChangeModal';
import { useEffect, useState } from 'react';

type TabType = 'upcoming' | 'installed' | 'history';

export default function DashboardPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

  // Modal states
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusModalMode, setStatusModalMode] = useState<'installation' | 'return'>('installation');

  const handleOpenInfoModal = (event: any) => {
    setSelectedEvent(event);
    setIsInfoModalOpen(true);
  };

  const handleOpenStatusModal = (event: any, mode: 'installation' | 'return') => {
    setSelectedEvent(event);
    setStatusModalMode(mode);
    setIsStatusModalOpen(true);
  };

  const handleOpenStatusFromInfo = () => {
    setIsInfoModalOpen(false);
    // Determine mode based on event status
    const isInstalled = selectedEvent?.installation_status?.toLowerCase().includes('installé');
    setStatusModalMode(isInstalled ? 'return' : 'installation');
    setIsStatusModalOpen(true);
  };

  const handleCloseInfoModal = () => {
    setIsInfoModalOpen(false);
    setSelectedEvent(null);
  };

  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false);
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

  // Filter events by tab
  const filteredEvents = events.filter((event) => {
    const installationStatus = event.installation_status || '';
    const returnStatus = event.return_status || '';

    const isInstalled = installationStatus.toLowerCase().includes('installé');
    const isReturned = returnStatus.toLowerCase().includes('récupéré');

    switch (activeTab) {
      case 'upcoming':
        // À venir: pas encore récupéré
        return !isReturned;
      case 'installed':
        // Installés: installé mais pas récupéré
        return isInstalled && !isReturned;
      case 'history':
        // Historique: récupéré
        return isReturned;
      default:
        return true;
    }
  });

  const tabs = [
    { id: 'upcoming' as TabType, label: '📅 À venir', count: events.filter(e => !(e.return_status || '').toLowerCase().includes('récupéré')).length },
    { id: 'installed' as TabType, label: '✅ Installés', count: events.filter(e => (e.installation_status || '').toLowerCase().includes('installé') && !(e.return_status || '').toLowerCase().includes('récupéré')).length },
    { id: 'history' as TabType, label: '📦 Historique', count: events.filter(e => (e.return_status || '').toLowerCase().includes('récupéré')).length },
  ];

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

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-coral text-coral'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-coral/10 text-coral'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
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

      {filteredEvents.length === 0 && !error ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">
            {events.length === 0
              ? 'Aucun événement trouvé dans Notion'
              : `Aucun événement dans l'onglet "${tabs.find(t => t.id === activeTab)?.label}"`
            }
          </p>
          <p className="text-sm text-gray-400">
            {events.length === 0
              ? 'Les événements s\'affichent automatiquement depuis votre base Notion'
              : 'Essayez un autre onglet pour voir plus d\'événements'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onOpenDetails={handleOpenInfoModal}
              onOpenStatus={handleOpenStatusModal}
            />
          ))}
        </div>
      )}

      {/* Event Info Modal */}
      {selectedEvent && (
        <EventInfoModal
          event={selectedEvent}
          isOpen={isInfoModalOpen}
          onClose={handleCloseInfoModal}
          onOpenStatusModal={handleOpenStatusFromInfo}
        />
      )}

      {/* Status Change Modal */}
      {selectedEvent && (
        <StatusChangeModal
          event={selectedEvent}
          isOpen={isStatusModalOpen}
          onClose={handleCloseStatusModal}
          onStatusUpdate={handleStatusUpdate}
          mode={statusModalMode}
        />
      )}
    </div>
  );
}
