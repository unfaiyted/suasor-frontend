/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/@skeletonlabs/skeleton-svelte/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
  variants: {
    extend: {
      // This adds the missing 'md' variant for responsive design
      md: ['responsive', 'dark'],
      dark: ['dark']
    },
  },
};