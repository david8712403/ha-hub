import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  imports: { autoImport: true },
  ssr: false,
  devtools: { enabled: true },

  typescript: {
    strict: true,
  },
  plugins: ["~/plugins/antd.ts"],

  modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt"],

  // 修改 CSS 順序，確保 Ant Design Vue 的樣式在 Tailwind 之後加載
  css: ["ant-design-vue/dist/reset.css", "~/assets/css/main.css"],

  app: {
    head: {
      title: 'Home Assistant Hub',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A management web application for Home Assistant' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    },
    baseURL: "/",
    buildAssetsDir: "/_nuxt/",
  },
  
  components: {
    global: true,
    dirs: [
      '~/components',
      '~/components/layout'
    ]
  },

  
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL || '/api',
      homeAssistantUrl: process.env.HOME_ASSISTANT_URL || 'http://localhost:8123',
    },
    private: {
      homeAssistantToken: process.env.HOME_ASSISTANT_TOKEN || '',
      jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    }
  },

  nitro: {
    imports: {
      useRuntimeConfig: '#imports'
    }
  },
  
  compatibilityDate: "2025-04-19",
});