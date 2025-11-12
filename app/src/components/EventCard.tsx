'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface EventCardProps {
  event: any;
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
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

export default function EventCard({ event }: EventCardProps) {
  // Extract data from event (snake_case from API)
  const clientName = event.client_name || 'Sans titre';
  const eventType = event.event_type || null;
  const eventDate = event.event_date || null;
  const albumName = event.album_name || null;
  const photomaton = event.photomaton || null;
  const notionUrl = event.url || null;
  const notionData = event.notion_data || {};

  // Extract additional fields from notion_data
  const location = getNotionValue(notionData, ['lieu de l\'évenement', 'Lieu', 'Location']);
  const prestations = getNotionValue(notionData, ['Prestations', 'Services']);
  const installationTime = getNotionValue(notionData, ['Event - Heure installation', 'Heure installation']);
  const installationStaff = getNotionValue(notionData, ['Staff Installation', 'Installation Staff']);
  const recuperationTime = getNotionValue(notionData, ['Event - Heure Récupération', 'Heure Récupération']);
  const recuperationStaff = getNotionValue(notionData, ['Staff Récupération', 'Récupération Staff']);
  const importantInfo = getNotionValue(notionData, ['Info importante', 'Important']);

  const formatStaffList = (staff: any) => {
    if (Array.isArray(staff)) {
      return staff.join(' • ');
    }
    return staff || '-';
  };

  const formatPrestationsList = (prestations: any) => {
    if (Array.isArray(prestations)) {
      return prestations.join(' • ');
    }
    return prestations || '-';
  };

  return (
    <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="bg-gradient-to-r from-coral to-coral-light p-4 text-white">
        <div className="mb-2">
          <h2 className="font-bold text-xl truncate">
            {clientName}
          </h2>
          {eventType && (
            <p className="text-sm mt-1 opacity-90">
              {eventType}
            </p>
          )}
        </div>
        {eventDate && (
          <time className="text-sm opacity-90 flex items-center">
            <svg className="w-4 h-4 mr-1 opacity-70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {formatDate(eventDate)}
          </time>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Important Info Banner */}
        {importantInfo && (
          <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <p className="text-sm text-yellow-800">{importantInfo}</p>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="space-y-4 mb-4">
          {/* Location */}
          {location && (
            <div className="flex items-start">
              <svg className="w-5 h-5 text-coral flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Lieu</h3>
                <p className="text-sm text-gray-600">{location}</p>
              </div>
            </div>
          )}

          {/* Prestations */}
          {prestations && (
            <div className="flex items-start">
              <svg className="w-5 h-5 text-coral flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.29 7 12 12 20.71 7"/>
                <line x1="12" y1="22" x2="12" y2="12"/>
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Prestations</h3>
                <p className="text-sm text-gray-600">{formatPrestationsList(prestations)}</p>
              </div>
            </div>
          )}

          {/* Album & Photomaton */}
          <div className="flex items-start">
            <svg className="w-5 h-5 text-coral flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Album & Photomaton</h3>
              <div className="space-y-1">
                {albumName && (
                  <p className="text-sm text-gray-600">📁 {albumName}</p>
                )}
                {photomaton && (
                  <p className="text-sm text-gray-600">📸 {photomaton}</p>
                )}
                {!albumName && !photomaton && (
                  <p className="text-sm text-gray-400">-</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Staff Section */}
        {(installationStaff || recuperationStaff) && (
          <div className="space-y-3 mb-4 pt-4 border-t border-gray-100">
            {/* Installation */}
            {installationStaff && (
              <div className="flex items-start">
                <svg className="w-5 h-5 text-coral flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
                  <path d="M9 18h6"/>
                  <path d="M10 22h4"/>
                </svg>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-700">Installation</h3>
                    {installationTime && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-coral/10 text-coral">
                        <svg className="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {installationTime}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{formatStaffList(installationStaff)}</p>
                </div>
              </div>
            )}

            {/* Récupération */}
            {recuperationStaff && (
              <div className="flex items-start">
                <svg className="w-5 h-5 text-skyblue flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                </svg>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-700">Récupération</h3>
                    {recuperationTime && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-skyblue/10 text-skyblue">
                        <svg className="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {recuperationTime}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{formatStaffList(recuperationStaff)}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        {notionUrl && (
          <div className="pt-3 border-t border-gray-100">
            <a
              href={notionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center px-4 py-2 bg-coral hover:bg-coral-light text-white rounded-lg transition-colors"
            >
              <span className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Voir dans Notion
              </span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
