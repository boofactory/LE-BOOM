'use client';

import { Toaster } from 'sonner';
import { designSystem } from '@/styles/design-system';

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      expand={false}
      richColors
      toastOptions={{
        style: {
          fontFamily: designSystem.typography.fontFamily.sans.join(', '),
          fontSize: '14px',
          borderRadius: designSystem.borderRadius.lg,
          boxShadow: designSystem.boxShadow.medium,
        },
        className: 'toast-custom',
      }}
      theme="light"
      closeButton
      duration={3000}
    />
  );
}
