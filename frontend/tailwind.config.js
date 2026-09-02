/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Sofia Sans"', 'sans-serif'],
      },
      colors: {
        canvas: '#F3F0EE',
        lifted: '#FCFBFA',
        bone: '#F4F4F4',
        ink: '#141413',
        charcoal: '#262627',
        slate: '#696969',
        granite: '#555555',
        graphite: '#565656',
        taupe: '#D1CDC7',
        signal: '#CF4500',
        arc: '#F37338',
        clay: '#9A3A0A',
        link: '#3860BE',
      },
      borderRadius: {
        'button': '20px',
        'consent': '24px',
        'stadium': '40px',
        'pill': '999px',
      },
      letterSpacing: {
        tightest: '-0.02em', // -2%
        tighter: '-0.01em', // -1%
        eyebrow: '0.04em', // +4%
      },
      boxShadow: {
        'lift': '0px 4px 24px 0px rgba(0, 0, 0, 0.04)',
        'float': '0px 24px 48px 0px rgba(0, 0, 0, 0.08)',
        'heavy': '0px 70px 110px 0px rgba(0, 0, 0, 0.25)',
      }
    },
  },
  plugins: [],
}
