tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            fontFamily: {
              display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            colors: {
              brand: {
                50: '#f5f8ff',
                100: '#e8efff',
                200: '#cddcff',
                300: '#a5bdff',
                400: '#7a98ff',
                500: '#4a6dff',
                600: '#2c51f6',
                700: '#1f3fd3',
                800: '#1c36a8',
                900: '#182f87',
              },
            },
            boxShadow: {
              lux: '0 10px 30px -5px rgba(0,0,0,0.25), 0 8px 16px -8px rgba(0,0,0,0.2)',
            },
            backgroundImage: {
              'glass-gradient':
                'linear-gradient(135deg, rgba(255,255,255,0.85), rgba(255,255,255,0.55))',
              'glass-gradient-dark':
                'linear-gradient(135deg, rgba(24,24,27,0.85), rgba(24,24,27,0.55))',
            },
          },
        },
      };