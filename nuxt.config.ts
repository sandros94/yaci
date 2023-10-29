import colors from 'tailwindcss/colors'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/eslint-module',
    '@nuxtjs/google-fonts',
    '@nuxt/ui'
  ],

  devtools: { enabled: true },

  css: [
    '~/assets/css/main.css'
  ],

  googleFonts: {
    families: {
      'DM+Sans': true,
      'DM+Mono': true
    }
  },

  tailwindcss: {
    config: {
      content: [],
      plugins: [require('@tailwindcss/typography')],
      theme: {
        extend: {
          colors: {
            success: colors.green,
            info: colors.sky,
            alert: colors.yellow,
            warning: colors.red
          },
          fontFamily: {
            sans: ['DM Sans', 'DM Mono']
          }
        }
      }
    }
  },

  ui: {
    safelistColors: ['primary', 'success', 'info', 'alert', 'warning'],
    icons: ['ph']
  },

  runtimeConfig: {
    public: {
      yaci: {
        baseURL: 'http://localhost:3000',
        version: 'v0.1.0',
        ollama: {
          baseURL: 'http://localhost:11434',
          defaultModel: 'mistral'
        }
      }
    }
  },

  nitro: {
    storage: {
      chats: {
        driver: 'fs',
        base: 'storage/chats'
      }
    }
  },

  $production: {
    nitro: {
      compressPublicAssets: true
    }
  },
  $development: {
    typescript: {
      shim: false
    }
  }
})
