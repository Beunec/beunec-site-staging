/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Enable dark mode via class
  theme: {
    extend: {
      colors: {
        primaryBlue: '#00477d',
        canvas: '#f4f4f0',
      },
      animation: {
        'water-ripple': 'water-ripple 0.6s ease-out',
        'gentle-fade-in': 'gentle-fade-in 0.8s ease-out forwards',
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
      },
      keyframes: {
        'water-ripple': {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        'gentle-fade-in': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
