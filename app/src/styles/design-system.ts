/**
 * LE BOOM v2 - Design System
 * Tokens de design alignés sur la charte graphique BooFactory.ch
 */

export const designSystem = {
  /**
   * Palette de couleurs principale
   * Inspirée de BooFactory.ch
   */
  colors: {
    // Brand colors from BooFactory
    brand: {
      coral: '#D56852',      // Couleur primaire BooFactory
      coralLight: '#E08976',
      coralDark: '#C2503A',
      green: '#89A88D',      // Couleur secondaire BooFactory
      greenLight: '#A0BEA4',
      greenDark: '#708E75',
      dark: '#32373C',       // Dark gray BooFactory
      darkLight: '#4A5159',
      darkDark: '#1F2329',
    },

    // Semantic colors
    status: {
      success: '#10B981',    // Green
      successLight: '#D1FAE5',
      warning: '#F59E0B',    // Amber
      warningLight: '#FEF3C7',
      error: '#EF4444',      // Red
      errorLight: '#FEE2E2',
      info: '#3B82F6',       // Blue
      infoLight: '#DBEAFE',
    },

    // Installation states
    installation: {
      toInstall: '#F59E0B',     // Amber - À installer
      installed: '#10B981',     // Green - Installé
      atWorkshop: '#3B82F6',    // Blue - À l'atelier
    },

    // Neutral palette
    neutral: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },

    // Background & Surface
    background: {
      primary: '#FFFFFF',
      secondary: '#F9FAFB',
      tertiary: '#F3F4F6',
    },

    // Text colors
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
      inverse: '#FFFFFF',
    },
  },

  /**
   * Spacing scale (base 4px)
   */
  spacing: {
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
    24: '6rem',    // 96px
  },

  /**
   * Typography scale
   */
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      serif: ['Cardo', 'Georgia', 'serif'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],     // 12px
      sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
      base: ['1rem', { lineHeight: '1.5rem' }],    // 16px
      lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
      xl: ['1.25rem', { lineHeight: '1.75rem' }],  // 20px
      '2xl': ['1.5rem', { lineHeight: '2rem' }],   // 24px
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  },

  /**
   * Border radius
   */
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  /**
   * Shadows
   */
  boxShadow: {
    none: 'none',
    subtle: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    soft: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    medium: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    strong: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },

  /**
   * Animations
   */
  animation: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  /**
   * Z-index scale
   */
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    modalBackdrop: 40,
    modal: 50,
    popover: 60,
    tooltip: 70,
  },

  /**
   * Breakpoints
   */
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  /**
   * Touch targets (iOS guidelines)
   */
  touchTarget: {
    minimum: '44px',  // Taille minimale recommandée
    comfortable: '48px',
  },
} as const;

export type DesignSystem = typeof designSystem;

// Helper pour générer des classes Tailwind custom
export const tw = {
  /**
   * Bouton principal (call-to-action)
   */
  buttonPrimary: 'bg-brand-coral hover:bg-brand-coral-dark active:scale-95 text-white font-medium px-4 py-3 rounded-lg transition-all duration-200',

  /**
   * Bouton secondaire
   */
  buttonSecondary: 'bg-brand-green hover:bg-brand-green-dark active:scale-95 text-white font-medium px-4 py-3 rounded-lg transition-all duration-200',

  /**
   * Bouton outline
   */
  buttonOutline: 'border-2 border-brand-coral text-brand-coral hover:bg-brand-coral hover:text-white active:scale-95 font-medium px-4 py-3 rounded-lg transition-all duration-200',

  /**
   * Card standard
   */
  card: 'bg-white rounded-xl shadow-soft border border-neutral-100 hover:shadow-medium transition-shadow duration-200',

  /**
   * Input standard
   */
  input: 'w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-coral focus:border-transparent transition-all duration-200',

  /**
   * Badge de statut
   */
  badge: 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
};

export default designSystem;
