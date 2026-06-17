/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#007AFF',
          light: '#4DA3FF',
          dark: '#0062CC',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F2F2F7',
          200: '#E5E5EA',
          300: '#D1D1D6',
          400: '#AEAEB2',
          500: '#8E8E93',
          600: '#636366',
          700: '#48484A',
          800: '#3A3A3C',
          900: '#2C2C2E',
          950: '#1C1C1E',
        },
        subject: {
          math: '#FF9500',
          physics: '#5AC8FA',
          chemistry: '#34C759',
          biology: '#30D158',
          history: '#FF3B30',
          geography: '#FFCC00',
          literature: '#AF52DE',
          english: '#007AFF',
          politics: '#FF2D55',
          other: '#8E8E93',
        },
      },
      fontFamily: {
        display: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"Helvetica Neue"',
          'system-ui',
          'sans-serif',
        ],
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"Helvetica Neue"',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          '"SF Mono"',
          'Menlo',
          'Monaco',
          '"Courier New"',
          'monospace',
        ],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)',
        'card-hover': '0 2px 8px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)',
        popup: '0 4px 24px rgba(0,0,0,0.10), 0 8px 40px rgba(0,0,0,0.06)',
        toolbar: '0 1px 4px rgba(0,0,0,0.06), 0 0.5px 0 rgba(0,0,0,0.04)',
        focus: '0 0 0 4px rgba(0,122,255,0.24)',
      },
      borderRadius: {
        card: '16px',
        popup: '20px',
        pill: '9999px',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        wiggle: {
          '0%,100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-1deg)' },
          '75%': { transform: 'rotate(1deg)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s ease-in-out infinite',
        float: 'float 5s ease-in-out infinite',
        wiggle: 'wiggle 0.3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
