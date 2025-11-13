'use client';

import EventCard from '@/components/EventCardV2';
import EventInfoModal from '@/components/EventInfoModal';
import StatusChangeModal from '@/components/StatusChangeModal';
import { useEffect, useState } from 'react';

type TabType = 'current' | 'upcoming' | 'history';

export default function DashboardPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('current');

  // History tab filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');

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

  // Get unique years for filter
  const availableYears = Array.from(new Set(
    events
      .map(e => e.event_date ? new Date(e.event_date).getFullYear() : null)
      .filter((year): year is number => year !== null)
  )).sort((a, b) => b - a);

  // Filter events by tab
  const filteredEvents = events.filter((event) => {
    const status = (event.installation_status || '').toLowerCase();
    const isAtelier = status.includes('atelier');
    const eventDate = event.event_date ? new Date(event.event_date) : null;
    const today = new Date();
    const twoWeeksFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Base tab filtering
    let passesTabFilter = false;
    switch (activeTab) {
      case 'current':
        // En cours: événements des 2 prochaines semaines, pas à l'atelier
        passesTabFilter = !isAtelier && !!eventDate && eventDate <= twoWeeksFromNow;
        break;
      case 'upcoming':
        // À venir: événements après 2 semaines, pas à l'atelier
        passesTabFilter = !isAtelier && !!eventDate && eventDate > twoWeeksFromNow;
        break;
      case 'history':
        // Historique: événements à l'atelier uniquement
        passesTabFilter = isAtelier;
        break;
      default:
        passesTabFilter = true;
    }

    if (!passesTabFilter) return false;

    // Additional filtering for history tab
    if (activeTab === 'history') {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          event.client_name?.toLowerCase().includes(query) ||
          event.event_type?.toLowerCase().includes(query) ||
          event.photomaton?.toLowerCase().includes(query) ||
          event.album_name?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Year filter
      if (selectedYear !== 'all' && eventDate) {
        const eventYear = eventDate.getFullYear().toString();
        if (eventYear !== selectedYear) return false;
      }
    }

    return true;
  });

  const tabs = [
    {
      id: 'current' as TabType,
      label: '🎯 En cours',
      count: events.filter(e => {
        const status = (e.installation_status || '').toLowerCase();
        const isAtelier = status.includes('atelier');
        const eventDate = e.event_date ? new Date(e.event_date) : null;
        const today = new Date();
        const twoWeeksFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
        return !isAtelier && eventDate && eventDate <= twoWeeksFromNow;
      }).length
    },
    {
      id: 'upcoming' as TabType,
      label: '📅 À venir',
      count: events.filter(e => {
        const status = (e.installation_status || '').toLowerCase();
        const isAtelier = status.includes('atelier');
        const eventDate = e.event_date ? new Date(e.event_date) : null;
        const today = new Date();
        const twoWeeksFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
        return !isAtelier && eventDate && eventDate > twoWeeksFromNow;
      }).length
    },
    {
      id: 'history' as TabType,
      label: '📦 Historique',
      count: events.filter(e => (e.installation_status || '').toLowerCase().includes('atelier')).length
    },
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

      {/* Search and Filter Bar for History Tab */}
      {activeTab === 'history' && (
        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Rechercher (client, type, photomaton, album)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent"
          />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent"
          >
            <option value="all">Toutes les années</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      )}

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
              hideStatusBadge={activeTab === 'history'}
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
