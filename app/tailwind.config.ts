import type { Config } from 'tailwindcss';
import { designSystem } from './src/styles/design-system';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors from BooFactory.ch
        brand: {
          coral: designSystem.colors.brand.coral,
          'coral-light': designSystem.colors.brand.coralLight,
          'coral-dark': designSystem.colors.brand.coralDark,
          green: designSystem.colors.brand.green,
          'green-light': designSystem.colors.brand.greenLight,
          'green-dark': designSystem.colors.brand.greenDark,
          dark: designSystem.colors.brand.dark,
          'dark-light': designSystem.colors.brand.darkLight,
          'dark-dark': designSystem.colors.brand.darkDark,
        },

        // Legacy support (à remplacer progressivement)
        coral: {
          DEFAULT: designSystem.colors.brand.coral,
          light: designSystem.colors.brand.coralLight,
        },
        skyblue: {
          DEFAULT: designSystem.colors.status.info,
          light: designSystem.colors.status.infoLight,
        },
        dark: designSystem.colors.brand.dark,

        // Semantic colors
        status: {
          success: designSystem.colors.status.success,
          'success-light': designSystem.colors.status.successLight,
          warning: designSystem.colors.status.warning,
          'warning-light': designSystem.colors.status.warningLight,
          error: designSystem.colors.status.error,
          'error-light': designSystem.colors.status.errorLight,
          info: designSystem.colors.status.info,
          'info-light': designSystem.colors.status.infoLight,
        },

        // Installation states
        installation: {
          'to-install': designSystem.colors.installation.toInstall,
          installed: designSystem.colors.installation.installed,
          workshop: designSystem.colors.installation.atWorkshop,
        },

        // Neutral palette
        neutral: designSystem.colors.neutral,
      },

      fontFamily: {
        sans: designSystem.typography.fontFamily.sans,
        serif: designSystem.typography.fontFamily.serif,
      },

      fontSize: designSystem.typography.fontSize,
      fontWeight: designSystem.typography.fontWeight,

      spacing: designSystem.spacing,
      borderRadius: designSystem.borderRadius,
      boxShadow: designSystem.boxShadow,

      zIndex: designSystem.zIndex,

      // Custom animations
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'bounce-in': 'bounce-in 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        ripple: 'ripple 0.6s linear',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};

export default config;
