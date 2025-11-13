'use client';

import TimelineView from '@/components/timeline/TimelineView';
import EventInfoModal from '@/components/EventInfoModal';
import StatusChangeModal from '@/components/StatusChangeModal';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

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

  if (error) {
    return (
      <div className="card bg-status-error/10 border border-status-error/20 text-status-error mb-6 p-6 rounded-xl">
        <p className="font-bold text-lg mb-2">Erreur</p>
        <p className="text-sm mb-3">{error}</p>
        <p className="text-xs">
          Vérifiez que vos clés Notion sont configurées dans{' '}
          <a href="/dashboard/settings" className="underline font-medium">Paramètres</a>
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Timeline View */}
      <TimelineView
        events={events}
        loading={loading}
        refreshing={refreshing}
        lastUpdate={lastUpdate}
        onOpenDetails={handleOpenInfoModal}
        onOpenStatus={handleOpenStatusModal}
        onRefresh={() => fetchEventsFromNotion(true)}
      />

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
