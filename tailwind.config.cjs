module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ksg: {
          gold: '#B5955B',        // KSG gold/brown from logo
          goldDark: '#8C6A3C',    // Darker gold for hover states
          dark: 'rgb(28, 20, 0)', // Main dark background
          darkAlt: 'rgb(35, 25, 0)', // Slightly lighter for hover
          light: '#FFFFFF',       // White text
          muted: '#4A4A4A',       // Muted text
          border: '#E5E7EB',      // Light gray for borders
          transparent: {
            white: 'rgba(255, 255, 255, 0.9)',
            hover: 'rgba(255, 255, 255, 0.1)',
            border: 'rgba(255, 255, 255, 0.3)'
          }
        }
      },
      fontFamily: {
        sans: ['Helvetica', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: []
};
