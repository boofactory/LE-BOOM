'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface EventCardProps {
  event: any;
  onOpenDetails?: (event: any) => void;
  onOpenStatus?: (event: any, mode: 'installation' | 'return') => void;
  hideStatusBadge?: boolean;
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('fr-FR', { month: 'short' });
    return `${day} ${month}`;
  } catch {
    return '-';
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
      default:
        return null;
    }
  }
  return null;
}

export default function EventCard({ event, onOpenDetails, onOpenStatus, hideStatusBadge = false }: EventCardProps) {
  // Extract data from event
  const clientName = event.client_name || 'Sans titre';
  const eventType = event.event_type || null;
  const eventDate = event.event_date || null;
  const notionData = event.notion_data || {};

  // Status fields
  const installationStatus = event.installation_status || '';

  // Extract additional fields
  const location = getNotionValue(notionData, ['lieu de l\'évenement', 'Lieu', 'Location']);
  const prestations = getNotionValue(notionData, ['Prestations', 'Services']);
  const installationTime = getNotionValue(notionData, ['Event - Heure installation', 'Heure installation']);
  const installationStaff = getNotionValue(notionData, ['Staff Installation', 'Installation Staff']);
  const importantInfo = getNotionValue(notionData, ['Info importante', 'Important']);

  // Clean staff names
  const formatStaffList = (staff: any) => {
    if (Array.isArray(staff)) {
      return staff
        .map((name: string) => name.replace(/^(Inst|Récup) : /, ''))
        .join(' • ');
    }
    return staff || '-';
  };

  // Clean prestations
  const cleanPrestations = prestations ? prestations.replace(/^Presta : /, '') : null;

  // Determine status badge
  const getStatusBadge = () => {
    if (installationStatus && installationStatus.toLowerCase().includes('atelier')) {
      return { text: 'À l\'atelier', color: 'bg-status-info/10 text-status-info border-status-info/20' };
    }
    if (installationStatus && installationStatus.toLowerCase().includes('installé')) {
      return { text: 'Installé', color: 'bg-status-success/10 text-status-success border-status-success/20' };
    }
    return { text: 'À installer', color: 'bg-status-warning/10 text-status-warning border-status-warning/20' };
  };

  const statusBadge = getStatusBadge();

  // Google Maps URL
  const getGoogleMapsUrl = () => {
    if (!location) return '#';
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`;
  };

  // Determine action button
  const getActionButton = () => {
    const status = installationStatus ? installationStatus.toLowerCase() : '';
    const isAtelier = status.includes('atelier');
    const isInstalled = status.includes('installé');

    if (isAtelier) return null;

    if (!isInstalled || status === '') {
      return (
        <button
          onClick={() => onOpenStatus?.(event, 'installation')}
          className="flex-1 h-11 bg-status-success hover:bg-status-success/90 active:scale-95 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium shadow-sm"
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
          className="flex-1 h-11 bg-brand-green hover:bg-brand-green-dark active:scale-95 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
          </svg>
          Récupérer
        </button>
      );
    }
  };

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden border border-neutral-200 hover:border-brand-coral/30 hover:shadow-medium transition-all duration-200">
      {/* Header - Compact & Modern */}
      <div className="relative bg-gradient-to-br from-brand-coral to-brand-coral-light p-4 text-white">
        {/* Status Badge */}
        {!hideStatusBadge && (
          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${statusBadge.color}`}>
              {statusBadge.text}
            </span>
          </div>
        )}

        {/* Title & Date */}
        <div className="pr-24">
          <h3 className="font-bold text-lg leading-tight mb-0.5 truncate">
            {clientName}
          </h3>
          {eventType && (
            <p className="text-sm opacity-90 font-medium">
              {eventType}
            </p>
          )}
        </div>

        {/* Date Badge */}
        {eventDate && (
          <div className="mt-2 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-lg">
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
            </svg>
            <span className="text-xs font-semibold">{formatDate(eventDate)}</span>
          </div>
        )}
      </div>

      {/* Important Info Banner */}
      {importantInfo && (
        <div className="px-4 pt-3">
          <div className="flex items-start gap-2 p-2.5 bg-status-warning/10 border border-status-warning/20 rounded-lg">
            <svg className="w-4 h-4 text-status-warning flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <p className="text-xs text-status-warning font-medium leading-tight">{importantInfo}</p>
          </div>
        </div>
      )}

      {/* Content - Compact Info */}
      <div className="p-4 space-y-3">
        {/* Location */}
        {location && (
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 bg-brand-coral/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-brand-coral" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-500 font-medium mb-0.5">Lieu</p>
              <p className="text-sm text-neutral-900 leading-tight truncate">{location}</p>
            </div>
          </div>
        )}

        {/* Prestations */}
        {cleanPrestations && (
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 bg-brand-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-brand-green" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-500 font-medium mb-0.5">Prestations</p>
              <p className="text-sm text-neutral-900 leading-tight truncate">{cleanPrestations}</p>
            </div>
          </div>
        )}

        {/* Installation Info */}
        {(installationTime || installationStaff) && (
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 bg-status-info/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-status-info" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-500 font-medium mb-0.5">Installation</p>
              <div className="flex items-center gap-2">
                {installationTime && (
                  <span className="text-xs font-semibold text-brand-coral">{installationTime}</span>
                )}
                {installationStaff && (
                  <span className="text-sm text-neutral-900 truncate">{formatStaffList(installationStaff)}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={() => onOpenDetails?.(event)}
          className="flex-1 h-11 bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-neutral-700 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
          Détails
        </button>

        {location && (
          <a
            href={getGoogleMapsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 bg-status-info hover:bg-status-info/90 active:scale-95 text-white rounded-lg transition-all duration-200 flex items-center justify-center shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
            </svg>
          </a>
        )}

        {getActionButton()}
      </div>
    </div>
  );
}
