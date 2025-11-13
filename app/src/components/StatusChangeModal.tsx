'use client';

import { useState } from 'react';
import { toast } from '@/hooks/useToast';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface StatusChangeModalProps {
  event: any;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: () => void;
  mode: 'installation' | 'return';
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

export default function StatusChangeModal({ event, isOpen, onClose, onStatusUpdate, mode }: StatusChangeModalProps) {
  const checklist = mode === 'installation' ? INSTALLATION_CHECKLIST : RETURN_CHECKLIST;

  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [clientEmail, setClientEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const clientName = event.client_name || 'Sans titre';
  const eventType = event.event_type || '';
  const notionData = event.notion_data || {};

  // Get client email from notion data
  const getClientEmail = () => {
    const fieldNames = ['Email client', 'Client email', 'Email'];
    for (const fieldName of fieldNames) {
      const field = notionData[fieldName];
      if (field?.email) return field.email;
    }
    return '';
  };

  const defaultEmail = clientEmail || getClientEmail();

  const isComplete = checklist.every(item => checklistState[item.id]);

  const handleToggle = (id: string) => {
    setChecklistState(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const endpoint = mode === 'installation' ? 'installation' : 'return';
      const response = await fetch(`/api/events/${event.id}/${endpoint}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklist: checklistState,
          notes,
          ...(mode === 'installation' ? {
            installation_date: new Date().toISOString(),
          } : {
            return_date: new Date().toISOString(),
            send_email: sendEmail,
            client_email: clientEmail || defaultEmail,
          }),
        }),
      });

      if (response.ok) {
        toast.success(
          mode === 'installation' ? 'Installation confirmée !' : 'Retour confirmé !',
          mode === 'return' && sendEmail ? 'Email envoyé au client' : undefined
        );
        onStatusUpdate?.();
        onClose();
      } else {
        toast.error('Erreur lors de la confirmation', 'Veuillez réessayer');
      }
    } catch (error) {
      console.error('Error submitting status:', error);
      toast.error('Erreur réseau', 'Vérifiez votre connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-6 text-white ${mode === 'installation' ? 'bg-gradient-to-r from-coral to-coral-light' : 'bg-gradient-to-r from-skyblue to-blue-500'}`}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">
                {mode === 'installation' ? '🔧 Valider l\'installation' : '🏠 Valider la récupération'}
              </h2>
              <p className="text-sm opacity-90 mt-1">{clientName}</p>
              {eventType && <p className="text-xs opacity-75 mt-0.5">{eventType}</p>}
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
          {/* Checklist */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              ✓ Checklist ({Object.values(checklistState).filter(Boolean).length}/{checklist.length})
            </h3>
            <div className="space-y-2">
              {checklist.map((item) => (
                <label key={item.id} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={checklistState[item.id] || false}
                    onChange={() => handleToggle(item.id)}
                    className={`w-5 h-5 border-gray-300 rounded focus:ring-2 ${
                      mode === 'installation'
                        ? 'text-coral focus:ring-coral'
                        : 'text-skyblue focus:ring-skyblue'
                    }`}
                  />
                  <span className="ml-3 text-sm text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📝 Notes (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={mode === 'installation' ? 'Notes d\'installation...' : 'Notes de récupération...'}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Email Option (Return only) */}
          {mode === 'return' && (
            <div className="p-4 bg-blue-50 rounded-lg">
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
                  value={clientEmail || defaultEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="Email du client"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-skyblue focus:border-transparent"
                />
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!isComplete || isSubmitting}
            className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
              isComplete && !isSubmitting
                ? mode === 'installation'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting
              ? 'Confirmation...'
              : mode === 'installation'
                ? '✅ Confirmer l\'installation'
                : '🏠 Confirmer la récupération'
            }
          </button>

          {!isComplete && (
            <p className="text-sm text-gray-500 text-center">
              Complétez tous les points de la checklist pour valider
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
