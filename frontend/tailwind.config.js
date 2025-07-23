module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Apple-inspired color palette
      colors: {
        // Apple grays
        'apple-gray': {
          1: '#F5F5F7',
          2: '#E5E5E7',
          3: '#D1D1D6',
          4: '#8E8E93',
          5: '#636366',
          6: '#48484A',
          7: '#1D1D1F',
        },
        // Apple blue
        'apple-blue': '#007AFF',
        // Semantic colors
        'success': '#34C759',
        'warning': '#FF9500',
        'error': '#FF3B30',
        'info': '#007AFF',
        // Primary colors (keeping existing for compatibility)
        primary: {
          50: '#eff6ff',
          500: '#007AFF', // Apple blue
          600: '#0056CC',
          700: '#004499',
        }
      },
      // Apple typography
      fontFamily: {
        'sf': [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif'
        ],
        'sf-display': [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif'
        ],
        'sf-text': [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif'
        ],
      },
      // Apple spacing (8px grid system)
      spacing: {
        '18': '4.5rem', // 72px
        '22': '5.5rem', // 88px
        '26': '6.5rem', // 104px
        '30': '7.5rem', // 120px
        '34': '8.5rem', // 136px
        '38': '9.5rem', // 152px
        '42': '10.5rem', // 168px
        '46': '11.5rem', // 184px
        '50': '12.5rem', // 200px
      },
      // Apple shadows and elevation
      boxShadow: {
        'apple-sm': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'apple': '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'apple-md': '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        'apple-lg': '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
        'apple-xl': '0 25px 50px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.05)',
        'apple-2xl': '0 50px 100px rgba(0, 0, 0, 0.1), 0 20px 40px rgba(0, 0, 0, 0.06)',
      },
      // Apple border radius
      borderRadius: {
        'apple': '0.75rem', // 12px
        'apple-lg': '1rem', // 16px
        'apple-xl': '1.25rem', // 20px
      },
      // Apple animations
      animation: {
        'apple-fade-in': 'appleFadeIn 0.3s ease-out',
        'apple-slide-up': 'appleSlideUp 0.3s ease-out',
        'apple-scale': 'appleScale 0.2s ease-out',
      },
      keyframes: {
        appleFadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        appleSlideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        appleScale: {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      // Apple-specific utilities
      backdropBlur: {
        'apple': '20px',
      },
    },
  },
  plugins: [
    // Custom plugin for Apple-specific utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.apple-blur': {
          'backdrop-filter': 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
        },
        '.apple-text-gradient': {
          'background': 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.apple-glass': {
          'background': 'rgba(255, 255, 255, 0.8)',
          'backdrop-filter': 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}