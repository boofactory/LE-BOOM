'use client';

import { useState } from 'react';
import DateSection from './DateSection';
import EventTimelineCard from './EventTimelineCard';
import BottomNavigation from './BottomNavigation';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface TimelineViewProps {
  events: any[];
  onOpenDetails: (event: any) => void;
  onOpenStatus: (event: any, mode: 'installation' | 'return') => void;
  loading?: boolean;
  refreshing?: boolean;
  lastUpdate?: Date | null;
  onRefresh?: () => void;
}

interface GroupedEvents {
  today: any[];
  tomorrow: any[];
  thisWeek: any[];
  later: any[];
  history: any[];
}

export default function TimelineView({
  events,
  onOpenDetails,
  onOpenStatus,
  loading = false,
  refreshing = false,
  lastUpdate = null,
  onRefresh
}: TimelineViewProps) {
  const [activeView, setActiveView] = useState<'timeline' | 'history'>('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Group events by time period
  const groupEventsByDate = (): GroupedEvents => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const weekEnd = new Date(todayStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const grouped: GroupedEvents = {
      today: [],
      tomorrow: [],
      thisWeek: [],
      later: [],
      history: [],
    };

    events.forEach((event) => {
      const status = (event.installation_status || '').toLowerCase();
      const isAtelier = status.includes('atelier');
      const eventDate = event.event_date ? new Date(event.event_date) : null;

      if (isAtelier) {
        grouped.history.push(event);
      } else if (eventDate) {
        if (eventDate >= todayStart && eventDate < tomorrowStart) {
          grouped.today.push(event);
        } else if (eventDate >= tomorrowStart && eventDate < new Date(tomorrowStart.getTime() + 24 * 60 * 60 * 1000)) {
          grouped.tomorrow.push(event);
        } else if (eventDate >= tomorrowStart && eventDate < weekEnd) {
          grouped.thisWeek.push(event);
        } else {
          grouped.later.push(event);
        }
      }
    });

    // Sort each group by date
    const sortByDate = (a: any, b: any) => {
      const dateA = a.event_date ? new Date(a.event_date).getTime() : 0;
      const dateB = b.event_date ? new Date(b.event_date).getTime() : 0;
      return dateA - dateB;
    };

    grouped.today.sort(sortByDate);
    grouped.tomorrow.sort(sortByDate);
    grouped.thisWeek.sort(sortByDate);
    grouped.later.sort(sortByDate);
    grouped.history.sort((a, b) => sortByDate(b, a)); // Reverse for history

    return grouped;
  };

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

  const grouped = groupEventsByDate();

  // Filter history events
  const filteredHistory = grouped.history.filter((event) => {
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
    if (selectedYear !== 'all') {
      const eventDate = event.event_date ? new Date(event.event_date) : null;
      if (eventDate) {
        const eventYear = eventDate.getFullYear().toString();
        if (eventYear !== selectedYear) return false;
      }
    }

    return true;
  });

  // Get available years for filter
  const availableYears = Array.from(new Set(
    grouped.history
      .map(e => e.event_date ? new Date(e.event_date).getFullYear() : null)
      .filter((year): year is number => year !== null)
  )).sort((a, b) => b - a);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-neutral-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-brand-dark">
            {activeView === 'timeline' ? 'Agenda' : 'Historique'}
          </h2>
          {lastUpdate && (
            <p className="text-sm text-neutral-500 mt-1 flex items-center gap-2">
              {refreshing && (
                <span className="inline-block w-2 h-2 bg-brand-coral rounded-full animate-pulse"></span>
              )}
              Mise à jour: {formatLastUpdate()}
            </p>
          )}
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-neutral-100 active:scale-95 transition-all duration-200"
          >
            <svg
              className={`w-5 h-5 text-neutral-600 ${refreshing ? 'animate-spin' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
            </svg>
          </button>
        )}
      </div>

      {/* Timeline View */}
      {activeView === 'timeline' && (
        <div className="space-y-6">
          {/* Today */}
          <DateSection
            title="Aujourd'hui"
            emoji="🎯"
            count={grouped.today.length}
            defaultExpanded={true}
            color="coral"
          >
            {grouped.today.map((event) => (
              <EventTimelineCard
                key={event.id}
                event={event}
                onOpenDetails={onOpenDetails}
                onOpenStatus={onOpenStatus}
                showTimeline={true}
              />
            ))}
          </DateSection>

          {/* Tomorrow */}
          <DateSection
            title="Demain"
            emoji="📅"
            count={grouped.tomorrow.length}
            defaultExpanded={grouped.today.length === 0}
            color="green"
          >
            {grouped.tomorrow.map((event) => (
              <EventTimelineCard
                key={event.id}
                event={event}
                onOpenDetails={onOpenDetails}
                onOpenStatus={onOpenStatus}
                showTimeline={true}
              />
            ))}
          </DateSection>

          {/* This Week */}
          <DateSection
            title="Cette semaine"
            emoji="📆"
            count={grouped.thisWeek.length}
            defaultExpanded={false}
            color="blue"
          >
            {grouped.thisWeek.map((event) => (
              <EventTimelineCard
                key={event.id}
                event={event}
                onOpenDetails={onOpenDetails}
                onOpenStatus={onOpenStatus}
                showTimeline={true}
              />
            ))}
          </DateSection>

          {/* Later */}
          <DateSection
            title="Plus tard"
            emoji="🗓️"
            count={grouped.later.length}
            defaultExpanded={false}
            color="neutral"
          >
            {grouped.later.map((event) => (
              <EventTimelineCard
                key={event.id}
                event={event}
                onOpenDetails={onOpenDetails}
                onOpenStatus={onOpenStatus}
                showTimeline={true}
              />
            ))}
          </DateSection>

          {/* Empty state */}
          {grouped.today.length === 0 && grouped.tomorrow.length === 0 && grouped.thisWeek.length === 0 && grouped.later.length === 0 && (
            <div className="text-center py-12 bg-neutral-50 rounded-xl">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-neutral-600 font-medium mb-2">Aucun événement à venir</p>
              <p className="text-sm text-neutral-500">
                Les événements s'affichent automatiquement depuis Notion
              </p>
            </div>
          )}
        </div>
      )}

      {/* History View */}
      {activeView === 'history' && (
        <div>
          {/* Search & Filter */}
          <div className="mb-6 flex gap-3">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-coral focus:border-transparent text-sm"
            />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-coral focus:border-transparent text-sm font-medium"
            >
              <option value="all">Toutes les années</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* History List */}
          <div className="space-y-4">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((event) => (
                <EventTimelineCard
                  key={event.id}
                  event={event}
                  onOpenDetails={onOpenDetails}
                  onOpenStatus={onOpenStatus}
                  showTimeline={false}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-neutral-50 rounded-xl">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-neutral-600 font-medium mb-2">Aucun événement trouvé</p>
                <p className="text-sm text-neutral-500">
                  Essayez de modifier vos filtres de recherche
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation
        activeView={activeView}
        onViewChange={setActiveView}
      />
    </div>
  );
}
