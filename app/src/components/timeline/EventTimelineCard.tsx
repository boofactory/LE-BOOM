'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface EventTimelineCardProps {
  event: any;
  onOpenDetails?: (event: any) => void;
  onOpenStatus?: (event: any, mode: 'installation' | 'return') => void;
  showTimeline?: boolean;
  isHistory?: boolean;
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    };
    return date.toLocaleDateString('fr-FR', options);
  } catch {
    return '';
  }
}

function formatTime(dateString: string | null | undefined): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function getTimeUntil(dateString: string | null | undefined): string | null {
  if (!dateString) return null;
  try {
    const eventDate = new Date(dateString);
    const now = new Date();
    const diffMs = eventDate.getTime() - now.getTime();

    if (diffMs < 0) return null;

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours === 0) {
      if (diffMins < 30) return `Dans ${diffMins}min`;
      return `Dans ${diffMins}min`;
    }
    if (diffHours < 24) return `Dans ${diffHours}h${diffMins > 0 ? diffMins + 'min' : ''}`;

    return null;
  } catch {
    return null;
  }
}

function getNotionValue(notionData: any, fieldNames: string[]): any {
  if (!notionData) return null;

  for (const fieldName of fieldNames) {
    const field = notionData[fieldName];
    if (!field) continue;

    const type = field.type;
    switch (type) {
      case 'rich_text':
        return field.rich_text?.[0]?.plain_text || '';
      case 'multi_select':
        return field.multi_select?.map((item: any) => item.name) || [];
      case 'select':
        return field.select?.name || '';
      case 'title':
        return field.title?.[0]?.plain_text || '';
      default:
        return null;
    }
  }
  return null;
}

export default function EventTimelineCard({
  event,
  onOpenDetails,
  onOpenStatus,
  showTimeline = true,
  isHistory = false
}: EventTimelineCardProps) {
  const clientName = event.client_name || 'Sans titre';
  const eventTitle = getNotionValue(event.notion_data, ['Evenement', 'Event', 'Événement']) || clientName;
  const eventType = event.event_type || null;
  const eventDate = event.event_date || null;
  const notionData = event.notion_data || {};
  const installationStatus = event.installation_status || '';

  const location = getNotionValue(notionData, ['lieu de l\'évenement', 'Lieu', 'Location']);
  const installationTime = getNotionValue(notionData, ['Event - Heure installation', 'Heure installation']);
  const installationStaff = getNotionValue(notionData, ['Staff Installation', 'Installation Staff']);
  const returnStaff = getNotionValue(notionData, ['Staff Récupération', 'Staff Return']);
  const prestations = getNotionValue(notionData, ['Prestations', 'Services']);
  const importantInfo = getNotionValue(notionData, ['Info importante', 'Info Importante', 'Important']);

  const formatStaffList = (staff: any) => {
    if (Array.isArray(staff)) {
      return staff
        .map((name: string) => name.replace(/^(Inst|Récup) : /, ''))
        .join(' • ');
    }
    return staff || '';
  };

  const cleanPrestations = prestations ? prestations.replace(/^Presta : /, '') : null;

  const dateDisplay = formatDate(eventDate);
  const timeDisplay = installationTime || formatTime(eventDate);
  const countdown = getTimeUntil(eventDate);

  const getStatusBorderColor = () => {
    const status = installationStatus.toLowerCase();
    if (status.includes('atelier')) return 'border-l-status-info';
    if (status.includes('installé')) return 'border-l-status-success';
    return 'border-l-brand-coral';
  };

  const getStatusDotColor = () => {
    const status = installationStatus.toLowerCase();
    if (status.includes('atelier')) return 'bg-status-info';
    if (status.includes('installé')) return 'bg-status-success';
    return 'bg-brand-coral';
  };

  const getActionButton = () => {
    const status = installationStatus.toLowerCase();
    const isAtelier = status.includes('atelier');
    const isInstalled = status.includes('installé');

    if (isAtelier || isHistory) return null;

    if (!isInstalled || status === '') {
      return (
        <button
          onClick={() => onOpenStatus?.(event, 'installation')}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 h-11 bg-status-success hover:bg-status-success/90 active:scale-95 text-white rounded-lg transition-all duration-200 text-sm font-semibold shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
          Installer
        </button>
      );
    } else {
      return (
        <button
          onClick={() => onOpenStatus?.(event, 'return')}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 h-11 bg-brand-green hover:bg-brand-green-dark active:scale-95 text-white rounded-lg transition-all duration-200 text-sm font-semibold shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
          </svg>
          Récupérer
        </button>
      );
    }
  };

  const getGoogleMapsUrl = () => {
    if (!location) return '#';
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`;
  };

  return (
    <div className="relative">
      {/* Timeline connector */}
      {showTimeline && (
        <div className="absolute left-0 top-0 bottom-0 w-px bg-neutral-200 -ml-4" />
      )}

      {/* Card */}
      <div className={`relative bg-white border-l-4 ${getStatusBorderColor()} border-r border-t border-b border-neutral-200 rounded-xl hover:border-r-brand-coral/30 hover:shadow-medium transition-all duration-200 overflow-hidden`}>
        {/* Timeline dot */}
        {showTimeline && (
          <div className={`absolute left-0 top-6 w-3 h-3 ${getStatusDotColor()} rounded-full border-4 border-white -ml-[26px] shadow-sm`} />
        )}

        {/* Card content - NO EXPAND, everything visible */}
        <div className="p-4">
          {/* Header: Date + Countdown */}
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <span className="text-sm font-bold text-brand-dark">{dateDisplay}</span>
            {countdown && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-coral/10 text-brand-coral border border-brand-coral/20">
                {countdown}
              </span>
            )}
          </div>

          {/* Event Title */}
          <h3 className="text-lg font-bold text-neutral-900 mb-3 leading-tight">
            {eventTitle}
          </h3>

          {/* Info importante */}
          {importantInfo && (
            <div className="mb-3 p-2 bg-status-warning/10 border-l-4 border-status-warning rounded-r-lg">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-status-warning flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-status-warning font-semibold">{importantInfo}</span>
              </div>
            </div>
          )}

          {/* Location */}
          {location && (
            <div className="flex items-start gap-2 mb-2">
              <svg className="w-4 h-4 text-brand-coral flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
              <span className="text-sm text-neutral-700 leading-tight">{location}</span>
            </div>
          )}

          {/* Staff Installation */}
          {installationStaff && (
            <div className="flex items-start gap-2 mb-2">
              <svg className="w-4 h-4 text-status-success flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-500 font-medium">Installation</p>
                <p className="text-sm text-neutral-700">{formatStaffList(installationStaff)}</p>
              </div>
            </div>
          )}

          {/* Staff Récupération */}
          {returnStaff && (
            <div className="flex items-start gap-2 mb-2">
              <svg className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-500 font-medium">Récupération</p>
                <p className="text-sm text-neutral-700">{formatStaffList(returnStaff)}</p>
              </div>
            </div>
          )}

          {/* Prestations */}
          {cleanPrestations && (
            <div className="flex items-start gap-2 mb-2">
              <svg className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
              </svg>
              <span className="text-sm text-neutral-600">{cleanPrestations}</span>
            </div>
          )}

          {/* Event Type (if different from title) */}
          {eventType && eventType !== eventTitle && (
            <div className="mt-2 inline-flex items-center px-2 py-1 rounded-md bg-neutral-100 text-neutral-700 text-xs font-medium">
              {eventType}
            </div>
          )}

          {/* Action buttons - ALWAYS VISIBLE */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onOpenDetails?.(event)}
              className="flex items-center justify-center gap-1.5 px-3 h-11 bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-neutral-700 rounded-lg transition-all duration-200 text-xs font-semibold"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
              Info
            </button>

            {location && (
              <a
                href={getGoogleMapsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-4 h-11 bg-status-info hover:bg-status-info/90 active:scale-95 text-white rounded-lg transition-all duration-200 text-sm font-semibold shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                GPS
              </a>
            )}

            {getActionButton()}
          </div>
        </div>
      </div>
    </div>
  );
}
