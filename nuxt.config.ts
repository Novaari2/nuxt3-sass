// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss','@nuxtjs/supabase','nuxt-icon'],
  components: [
    {
      path: '~/components/ui',
      // this is required else Nuxt will autoImport '.ts' file
      extensions: ['.vue'],
      // prefix for your components e.g. UiButton
      prefix: ''
    },
    {
      path: '~/components',
      // this is required else Nuxt will autoImport '.ts' file
      extensions: ['.vue'],
      // prefix for your components e.g. UiButton
      prefix: ''
    }
  ],
  supabase: {
    redirectOptions: {
      login: '/auth',
      callback: '/confirm',
      exclude: ['/'],
    }
  }
})
