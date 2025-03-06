export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Fancensus Dashboard',
      meta: [
        { name: 'description', content: 'Fancensus data visualization dashboard' }
      ]
    }
  }
})