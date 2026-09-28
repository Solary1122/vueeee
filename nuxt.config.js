import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'LandingCreator - Dynamic Landing Page Generator',
      meta: [
        { name: 'description', content: 'Fast metadata customization engine for landing pages' }
      ]
    }
  }
});
