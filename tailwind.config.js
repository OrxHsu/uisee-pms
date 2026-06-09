/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        display: ['"Montserrat"', '"Noto Sans SC"', 'sans-serif'],
        artistic: ['"FRIZON"', '"Noto Serif TC"', '"Noto Serif SC"', '"STSong"', '"SimSun"', 'serif'],
      },
      colors: {
        /* Liquid Glass 颜色系统 */
        'arc': {
          'bg': 'var(--bg-base)',
          'surface': 'var(--bg-surface)',
          'elevated': 'var(--bg-elevated)',
          'sidebar': 'var(--bg-sidebar)',
          'border': 'var(--border-color)',
          'border-strong': 'var(--border-strong)',
          'primary': 'var(--text-primary)',
          'secondary': 'var(--text-secondary)',
          'tertiary': 'var(--text-tertiary)',
          'accent': 'var(--accent)',
          'accent-hover': 'var(--accent-hover)',
          'accent-light': 'var(--accent-light)',
        },
        'space': {
          'coral': '#FF5E56',
          'pink': '#FF375F',
          'purple': '#BF5AF2',
          'indigo': '#5E5CE6',
          'blue': '#0A84FF',
          'teal': '#64D2FF',
          'green': '#30D158',
          'yellow': '#FFD60A',
          'orange': '#FF9F0A',
        },
        'accent': {
          blue: '#41B6E6',
          'blue-dark': '#002855',
          pink: '#DC95BF',
          purple: '#8b5cf6',
          coral: '#FF5E56',
        },
      },
      boxShadow: {
        /* Liquid Glass 阴影层级 */
        'glass': '0 8px 32px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.50), 0 1px 3px rgba(0, 0, 0, 0.30)',
        'glass-sm': '0 2px 12px rgba(0, 0, 0, 0.04)',
        'lift': '0 12px 40px rgba(0, 0, 0, 0.10)',
        'lift-dark': '0 12px 40px rgba(0, 0, 0, 0.50)',
        'inner-glow': 'inset 0 1px 1px rgba(255,255,255,0.80), inset 0 -0.5px 0.5px rgba(255,255,255,0.40)',
        'inner-glow-dark': 'inset 0 1px 1px rgba(255,255,255,0.10), inset 0 -0.5px 0.5px rgba(255,255,255,0.05)',
      },
      borderRadius: {
        'arc': '16px',
        'arc-lg': '20px',
        'arc-xl': '24px',
        'ios': '16px',
        'ios-lg': '20px',
        'ios-xl': '24px',
        'ios-2xl': '28px',
        'ios-3xl': '32px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'shimmer': 'shimmer 2s linear infinite',
        'glass-ripple': 'glassRipple 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glassRipple: {
          '0%': { transform: 'scale(0.95)', opacity: '0.5' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
