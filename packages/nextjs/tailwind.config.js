/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        border: '#e4e5e4',
        primary: '#f1fd57',
        'primary-contrast': '#ffffff',
        secondary: '#445069',
        'secondary-contrast': '#F7E987',
        'background-base': '#252B48', // Main background colour
        'background-neutral': '#000000', // Secondary background colour
        'background-contrast': '#808080',
        'background-form': '#445069',
        'background-success': '#edf7ed',
        'text-body': '#ffffff',
        'text-body2': '#5B9A8B',
        'text-contrast': '#f1fd57',
        'text-heading': '#413B5A',
        'text-success': '#1e4620',
      },
      boxShadow: {
        paper: '2px 4px 23px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
  safelist: ['btn-primary', 'btn-secondary', 'btn-error', 'btn-text', 'btn-small'],
};
