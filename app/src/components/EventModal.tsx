'use client';

import { useState } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface EventModalProps {
  event: any;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: () => void;
}

const INSTALLATION_CHECKLIST = [
  { id: 'network', label: 'Test du réseau' },
  { id: 'print_portrait', label: 'Test photo et impression portrait' },
  { id: 'print_landscape', label: 'Test photo et impression paysage' },
  { id: 'calibrated', label: 'Imprimante calibrée' },
  { id: 'gif', label: 'Test GIF' },
  { id: 'qr_code', label: 'Test QR code' },
  { id: 'lamp_button', label: 'Test bouton lampe' },
  { id: 'photo_quantity', label: 'Quantité photo OK' },
  { id: 'cleaning', label: 'Écran et objectif nettoyés' },
];

const RETURN_CHECKLIST = [
  { id: 'photos_downloaded', label: 'Photos de l\'événement téléchargées' },
  { id: 'photomaton_visible', label: 'Photomaton visible dans le BOOM' },
];

export default function EventModal({ event, isOpen, onClose, onStatusUpdate }: EventModalProps) {
  // Installation state
  const [installationChecklist, setInstallationChecklist] = useState<Record<string, boolean>>({});
  const [installationNotes, setInstallationNotes] = useState('');
  const [isSubmittingInstallation, setIsSubmittingInstallation] = useState(false);

  // Return state
  const [returnChecklist, setReturnChecklist] = useState<Record<string, boolean>>({});
  const [returnNotes, setReturnNotes] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [clientEmail, setClientEmail] = useState('');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  if (!isOpen) return null;

  const clientName = event.client_name || 'Sans titre';
  const eventType = event.event_type || '';
  const eventDate = event.event_date || null;
  const installationStatus = event.installation_status || '';
  const returnStatus = event.return_status || '';
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
  const contactName = getNotionValue(['Contact sur place', 'Contact']);
  const contactPhone = getNotionValue(['Téléphone contact', 'Contact téléphone'], 'phone');
  const clientAddress = getNotionValue(['Adresse client', 'Client adresse']);
  const clientPhoneValue = getNotionValue(['Téléphone client', 'Client téléphone'], 'phone');
  const clientEmailValue = getNotionValue(['Email client', 'Client email'], 'email');
  const materiels = getNotionValue(['Liste matériel', 'Matériel'], 'multi_select');
  const wifiInfo = getNotionValue(['Informations WiFi', 'WiFi']);
  const installationInfo = getNotionValue(['Informations Installation', 'Info Installation']);

  // Check if all checklist items are checked
  const isInstallationComplete = INSTALLATION_CHECKLIST.every(item => installationChecklist[item.id]);
  const isReturnComplete = RETURN_CHECKLIST.every(item => returnChecklist[item.id]);

  const handleInstallationToggle = (id: string) => {
    setInstallationChecklist(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleReturnToggle = (id: string) => {
    setReturnChecklist(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleMarkInstalled = async () => {
    setIsSubmittingInstallation(true);
    try {
      const response = await fetch(`/api/events/${event.id}/installation`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklist: installationChecklist,
          notes: installationNotes,
          installation_date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        alert('✅ Installation confirmée !');
        onStatusUpdate?.();
        onClose();
      } else {
        alert('❌ Erreur lors de la confirmation');
      }
    } catch (error) {
      console.error('Error marking installed:', error);
      alert('❌ Erreur réseau');
    } finally {
      setIsSubmittingInstallation(false);
    }
  };

  const handleMarkReturned = async () => {
    setIsSubmittingReturn(true);
    try {
      const response = await fetch(`/api/events/${event.id}/return`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklist: returnChecklist,
          notes: returnNotes,
          return_date: new Date().toISOString(),
          send_email: sendEmail,
          client_email: clientEmail || clientEmailValue,
        }),
      });

      if (response.ok) {
        alert('✅ Retour confirmé !');
        if (sendEmail) {
          alert('📧 Email envoyé au client');
        }
        onStatusUpdate?.();
        onClose();
      } else {
        alert('❌ Erreur lors de la confirmation');
      }
    } catch (error) {
      console.error('Error marking returned:', error);
      alert('❌ Erreur réseau');
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const isInstalled = installationStatus && installationStatus.toLowerCase().includes('installé');
  const isReturned = returnStatus && returnStatus.toLowerCase().includes('récupéré');

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
          {/* Section 1: Event Overview */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Informations générales</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location */}
              {location && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">📍 Lieu</h4>
                  <p className="text-sm text-gray-600">{location}</p>
                </div>
              )}

              {/* Contact sur place */}
              {(contactName || contactPhone) && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">👤 Contact sur place</h4>
                  {contactName && <p className="text-sm text-gray-600">{contactName}</p>}
                  {contactPhone && <p className="text-sm text-gray-600">📞 {contactPhone}</p>}
                </div>
              )}

              {/* Client Info */}
              {(clientAddress || clientPhoneValue || clientEmailValue) && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">💼 Informations client</h4>
                  {clientAddress && <p className="text-sm text-gray-600">{clientAddress}</p>}
                  {clientPhoneValue && <p className="text-sm text-gray-600">📞 {clientPhoneValue}</p>}
                  {clientEmailValue && <p className="text-sm text-gray-600">📧 {clientEmailValue}</p>}
                </div>
              )}

              {/* WiFi */}
              {wifiInfo && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">📶 Informations WiFi</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{wifiInfo}</p>
                </div>
              )}

              {/* Material List */}
              {materiels && materiels.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">📦 Liste matériel</h4>
                  <div className="flex flex-wrap gap-2">
                    {materiels.map((materiel: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-coral/10 text-coral text-xs rounded-full">
                        {materiel}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Installation Info */}
              {installationInfo && (
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg md:col-span-2">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-2">ℹ️ Informations Installation</h4>
                  <p className="text-sm text-yellow-700 whitespace-pre-wrap">{installationInfo}</p>
                </div>
              )}
            </div>
          </section>

          {/* Section 2: Installation Checklist */}
          {!isInstalled && (
            <section className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🔧 Checklist Installation</h3>

              <div className="space-y-2 mb-4">
                {INSTALLATION_CHECKLIST.map((item) => (
                  <label key={item.id} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={installationChecklist[item.id] || false}
                      onChange={() => handleInstallationToggle(item.id)}
                      className="w-5 h-5 text-coral border-gray-300 rounded focus:ring-coral"
                    />
                    <span className="ml-3 text-sm text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>

              <textarea
                value={installationNotes}
                onChange={(e) => setInstallationNotes(e.target.value)}
                placeholder="Notes d'installation (optionnel)..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent"
                rows={3}
              />

              <button
                onClick={handleMarkInstalled}
                disabled={!isInstallationComplete || isSubmittingInstallation}
                className={`mt-4 w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                  isInstallationComplete && !isSubmittingInstallation
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmittingInstallation ? 'Confirmation...' : '✅ Marquer comme installé'}
              </button>

              {!isInstallationComplete && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Complétez tous les points de la checklist pour valider l'installation
                </p>
              )}
            </section>
          )}

          {/* Section 3: Return Checklist */}
          {isInstalled && !isReturned && (
            <section className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🏠 Checklist Récupération</h3>

              <div className="space-y-2 mb-4">
                {RETURN_CHECKLIST.map((item) => (
                  <label key={item.id} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={returnChecklist[item.id] || false}
                      onChange={() => handleReturnToggle(item.id)}
                      className="w-5 h-5 text-skyblue border-gray-300 rounded focus:ring-skyblue"
                    />
                    <span className="ml-3 text-sm text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>

              <textarea
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                placeholder="Notes de récupération (optionnel)..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-skyblue focus:border-transparent"
                rows={3}
              />

              {/* Email Option */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <label className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="w-5 h-5 text-skyblue border-gray-300 rounded focus:ring-skyblue"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">📧 Envoyer email de confirmation au client</span>
                </label>

                {sendEmail && (
                  <input
                    type="email"
                    value={clientEmail || clientEmailValue || ''}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="Email du client"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-skyblue focus:border-transparent"
                  />
                )}
              </div>

              <button
                onClick={handleMarkReturned}
                disabled={!isReturnComplete || isSubmittingReturn}
                className={`mt-4 w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                  isReturnComplete && !isSubmittingReturn
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmittingReturn ? 'Confirmation...' : '🏠 Marquer comme récupéré'}
              </button>

              {!isReturnComplete && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Complétez tous les points de la checklist pour valider la récupération
                </p>
              )}
            </section>
          )}

          {/* Already completed status */}
          {isInstalled && isReturned && (
            <section className="border-t pt-6">
              <div className="p-6 bg-green-50 border-l-4 border-green-500 rounded-lg text-center">
                <p className="text-lg font-semibold text-green-800">✅ Événement terminé</p>
                <p className="text-sm text-green-600 mt-2">Cet événement a été installé et récupéré.</p>
              </div>
            </section>
          )}

          {/* Link to Notion */}
          {event.url && (
            <div className="border-t pt-6">
              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                🔗 Voir la page Notion complète
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
