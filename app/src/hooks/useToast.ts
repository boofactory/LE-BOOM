import { toast as sonnerToast } from 'sonner';

/**
 * Custom toast hook with BOOM branding
 * Wraps sonner's toast with custom styling and defaults
 */
export const useToast = () => {
  return {
    /**
     * Success toast
     */
    success: (message: string, description?: string) => {
      sonnerToast.success(message, {
        description,
        duration: 3000,
      });
    },

    /**
     * Error toast
     */
    error: (message: string, description?: string) => {
      sonnerToast.error(message, {
        description,
        duration: 4000,
      });
    },

    /**
     * Info toast
     */
    info: (message: string, description?: string) => {
      sonnerToast.info(message, {
        description,
        duration: 3000,
      });
    },

    /**
     * Warning toast
     */
    warning: (message: string, description?: string) => {
      sonnerToast.warning(message, {
        description,
        duration: 3500,
      });
    },

    /**
     * Loading toast (returns ID for dismissal)
     */
    loading: (message: string) => {
      return sonnerToast.loading(message);
    },

    /**
     * Promise toast (automatically handles loading/success/error states)
     */
    promise: <T,>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: any) => string);
      }
    ) => {
      return sonnerToast.promise(promise, messages);
    },

    /**
     * Custom toast with action button
     */
    action: (message: string, actionLabel: string, onAction: () => void) => {
      sonnerToast(message, {
        action: {
          label: actionLabel,
          onClick: onAction,
        },
      });
    },

    /**
     * Dismiss toast by ID
     */
    dismiss: (toastId?: string | number) => {
      sonnerToast.dismiss(toastId);
    },

    /**
     * Dismiss all toasts
     */
    dismissAll: () => {
      sonnerToast.dismiss();
    },
  };
};

// Named exports for direct use
export const toast = useToast();
