'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface EventInfoModalProps {
  event: any;
  isOpen: boolean;
  onClose: () => void;
  onOpenStatusModal?: () => void;
}

export default function EventInfoModal({ event, isOpen, onClose, onOpenStatusModal }: EventInfoModalProps) {
  if (!isOpen) return null;

  const clientName = event.client_name || 'Sans titre';
  const eventType = event.event_type || '';
  const eventDate = event.event_date || null;
  const albumName = event.album_name || null;
  const photomaton = event.photomaton || null;
  const notionData = event.notion_data || {};

  // Extract additional details from notion_data
  const getNotionValue = (fieldNames: string[], type: 'rich_text' | 'select' | 'multi_select' | 'phone' | 'email' = 'rich_text'): any => {
    for (const fieldName of fieldNames) {
      const field = notionData[fieldName];
      if (!field) continue;

      switch (type) {
        case 'rich_text':
          if (field.rich_text?.[0]?.plain_text) return field.rich_text[0].plain_text;
          break;
        case 'select':
          if (field.select?.name) return field.select.name;
          break;
        case 'multi_select':
          if (field.multi_select) return field.multi_select.map((item: any) => item.name);
          break;
        case 'phone':
          if (field.phone_number) return field.phone_number;
          break;
        case 'email':
          if (field.email) return field.email;
          break;
      }
    }
    return null;
  };

  const location = getNotionValue(['lieu de l\'évenement', 'Lieu', 'Location']);
  const prestations = getNotionValue(['Prestations', 'Services']);
  const installationTime = getNotionValue(['Event - Heure installation', 'Heure installation']);
  const installationStaff = getNotionValue(['Staff Installation', 'Installation Staff'], 'multi_select');
  const recuperationTime = getNotionValue(['Event - Heure Récupération', 'Heure Récupération']);
  const recuperationStaff = getNotionValue(['Staff Récupération', 'Récupération Staff'], 'multi_select');
  const importantInfo = getNotionValue(['Info importante', 'Important']);

  // Contact info
  const contactName = getNotionValue(['Event - Contact sur place', 'Contact sur place', 'Contact']);
  const contactPhone = getNotionValue(['Event - Telephone contact', 'Téléphone contact'], 'phone');

  // Client info
  const clientPhone = getNotionValue(['Téléphone'], 'phone');
  const clientEmail = getNotionValue(['E-mail'], 'email');
  const clientPrenom = getNotionValue(['Prénom']);
  const clientNom = getNotionValue(['Nom']);
  const clientAddress = getNotionValue(['Adresse de facturation', 'Adresse']);

  // Additional info
  const materiels = getNotionValue(['Event - Liste matériel', 'Liste matériel']);
  const wifiInfo = getNotionValue(['Event -Wifi', 'WiFi']);
  const installationNotes = getNotionValue(['Info installation']);
  const infosComplementaires = getNotionValue(['Infos Complémentaires', 'Info Complémentaire']);

  // Photoboo info
  const photobooFormule = getNotionValue(['Photoboo : Formule'], 'select');
  const photobooJours = getNotionValue(['Photoboo : Jours de location'], 'select');
  const photobooFond = getNotionValue(['Photoboo - Fond'], 'select');
  const photobooCadres = getNotionValue(['Photoboo : Cadres'], 'select');
  const photobooCadreChoisi = getNotionValue(['Photoboo : Cadre choisi']);
  const photobooInfos = getNotionValue(['Photoboo : Info Complémentaire']);

  // Prix
  const prixPrestations = notionData['Prix Prestations']?.number;
  const prixLivraison = notionData['Prix Livraison/Expédition']?.number;
  const prixTotal = notionData['Prix Total']?.number;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatStaffList = (staff: any) => {
    if (Array.isArray(staff)) {
      return staff.join(' • ');
    }
    return staff || '-';
  };

  const getGoogleMapsUrl = () => {
    if (!location) return '#';
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-coral to-coral-light p-6 text-white sticky top-0 z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{clientName}</h2>
              {eventType && <p className="text-sm opacity-90 mt-1">{eventType}</p>}
              {eventDate && <p className="text-sm opacity-90 mt-1">{formatDate(eventDate)}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Important Info Banner */}
          {importantInfo && (
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800 mb-1">⚠️ Information importante</h4>
                  <p className="text-sm text-yellow-700 whitespace-pre-wrap">{importantInfo}</p>
                </div>
              </div>
            </div>
          )}

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location */}
            {location && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-coral" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  Lieu de l'événement
                </h4>
                <p className="text-sm text-gray-600 mb-2">{location}</p>
                <a
                  href={getGoogleMapsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-skyblue hover:underline flex items-center gap-1"
                >
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                  </svg>
                  Ouvrir dans Google Maps
                </a>
              </div>
            )}

            {/* Contact sur place */}
            {(contactName || contactPhone) && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-coral" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  Contact sur place
                </h4>
                {contactName && <p className="text-sm text-gray-600">{contactName}</p>}
                {contactPhone && (
                  <a href={`tel:${contactPhone}`} className="text-sm text-skyblue hover:underline flex items-center gap-1 mt-1">
                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    {contactPhone}
                  </a>
                )}
              </div>
            )}

            {/* Album & Photomaton */}
            {(albumName || photomaton) && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-coral" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  Album & Photomaton
                </h4>
                {albumName && <p className="text-sm text-gray-600">📁 {albumName}</p>}
                {photomaton && <p className="text-sm text-gray-600 mt-1">📸 {photomaton}</p>}
              </div>
            )}

            {/* Prestations */}
            {prestations && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-coral" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.29 7 12 12 20.71 7"/>
                    <line x1="12" y1="22" x2="12" y2="12"/>
                  </svg>
                  Prestations
                </h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{prestations}</p>
              </div>
            )}

            {/* Client Info */}
            {(clientNom || clientPrenom || clientPhone || clientEmail || clientAddress) && (
              <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-coral" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Informations client
                </h4>
                <div className="space-y-2">
                  {(clientPrenom || clientNom) && (
                    <p className="text-sm text-gray-800 font-medium">
                      {[clientPrenom, clientNom].filter(Boolean).join(' ')}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    {clientPhone && (
                      <a href={`tel:${clientPhone}`} className="text-sm text-skyblue hover:underline flex items-center gap-1">
                        📞 {clientPhone}
                      </a>
                    )}
                    {clientEmail && (
                      <a href={`mailto:${clientEmail}`} className="text-sm text-skyblue hover:underline flex items-center gap-1">
                        📧 {clientEmail}
                      </a>
                    )}
                  </div>
                  {clientAddress && (
                    <p className="text-sm text-gray-600 mt-2">📍 {clientAddress}</p>
                  )}
                </div>
              </div>
            )}

            {/* WiFi */}
            {wifiInfo && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 13a10 10 0 0 1 14 0"/>
                    <path d="M8.5 16.5a5 5 0 0 1 7 0"/>
                    <path d="M12 20h.01"/>
                  </svg>
                  Informations WiFi
                </h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap font-mono">{wifiInfo}</p>
              </div>
            )}

            {/* Material List */}
            {materiels && materiels.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-coral" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                  Liste matériel
                </h4>
                <div className="flex flex-wrap gap-2">
                  {materiels.map((materiel: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-coral/10 text-coral text-xs rounded-full">
                      {materiel}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Installation Notes */}
            {installationNotes && (
              <div className="p-4 bg-yellow-50 rounded-lg md:col-span-2">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  Informations d'installation
                </h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{installationNotes}</p>
              </div>
            )}

            {/* Photoboo Details */}
            {(photobooFormule || photobooJours || photobooFond || photobooCadres || photobooCadreChoisi || photobooInfos) && (
              <div className="p-4 bg-purple-50 rounded-lg md:col-span-2">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  📸 Configuration Photoboo
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {photobooFormule && (
                    <div>
                      <span className="text-xs text-gray-500 uppercase">Formule</span>
                      <p className="text-sm text-gray-800 font-medium">{photobooFormule}</p>
                    </div>
                  )}
                  {photobooJours && (
                    <div>
                      <span className="text-xs text-gray-500 uppercase">Jours de location</span>
                      <p className="text-sm text-gray-800 font-medium">{photobooJours}</p>
                    </div>
                  )}
                  {photobooFond && (
                    <div>
                      <span className="text-xs text-gray-500 uppercase">Fond</span>
                      <p className="text-sm text-gray-800 font-medium">{photobooFond}</p>
                    </div>
                  )}
                  {photobooCadres && (
                    <div>
                      <span className="text-xs text-gray-500 uppercase">Cadres</span>
                      <p className="text-sm text-gray-800 font-medium">{photobooCadres}</p>
                    </div>
                  )}
                  {photobooCadreChoisi && (
                    <div className="sm:col-span-2">
                      <span className="text-xs text-gray-500 uppercase">Cadre choisi</span>
                      <p className="text-sm text-gray-800 font-medium">{photobooCadreChoisi}</p>
                    </div>
                  )}
                  {photobooInfos && (
                    <div className="sm:col-span-2">
                      <span className="text-xs text-gray-500 uppercase">Informations complémentaires</span>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{photobooInfos}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Infos Complémentaires */}
            {infosComplementaires && (
              <div className="p-4 bg-blue-50 rounded-lg md:col-span-2">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  ℹ️ Informations complémentaires
                </h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{infosComplementaires}</p>
              </div>
            )}
          </div>

          {/* Staff Section */}
          {(installationStaff || recuperationStaff) && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">👥 Équipes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Installation */}
                {installationStaff && (
                  <div className="p-4 bg-coral/5 rounded-lg border-l-4 border-coral">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-coral" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
                        <path d="M9 18h6"/>
                        <path d="M10 22h4"/>
                      </svg>
                      <h4 className="text-sm font-semibold text-gray-700">Installation</h4>
                      {installationTime && (
                        <span className="text-xs text-coral font-medium">🕐 {installationTime}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{formatStaffList(installationStaff)}</p>
                  </div>
                )}

                {/* Récupération */}
                {recuperationStaff && (
                  <div className="p-4 bg-skyblue/5 rounded-lg border-l-4 border-skyblue">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-skyblue" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                      </svg>
                      <h4 className="text-sm font-semibold text-gray-700">Récupération</h4>
                      {recuperationTime && (
                        <span className="text-xs text-skyblue font-medium">🕐 {recuperationTime}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{formatStaffList(recuperationStaff)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pricing Section */}
          {(prixPrestations || prixLivraison || prixTotal) && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Tarification</h3>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 space-y-3">
                {prixPrestations && (
                  <div className="flex justify-between items-center pb-2 border-b border-green-200">
                    <span className="text-sm text-gray-600">Prix prestations</span>
                    <span className="text-base font-semibold text-gray-900">{prixPrestations.toFixed(2)} CHF</span>
                  </div>
                )}
                {prixLivraison && (
                  <div className="flex justify-between items-center pb-2 border-b border-green-200">
                    <span className="text-sm text-gray-600">Prix livraison/expédition</span>
                    <span className="text-base font-semibold text-gray-900">{prixLivraison.toFixed(2)} CHF</span>
                  </div>
                )}
                {prixTotal && (
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-base font-bold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-green-700">{prixTotal.toFixed(2)} CHF</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t pt-6 flex gap-3">
            {onOpenStatusModal && (
              <button
                onClick={onOpenStatusModal}
                className="flex-1 px-4 py-3 bg-coral hover:bg-coral-light text-white rounded-lg transition-colors font-medium"
              >
                📝 Gérer le statut
              </button>
            )}
            {event.url && (
              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-center font-medium"
              >
                🔗 Voir dans Notion
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
