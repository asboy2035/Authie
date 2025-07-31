import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from '@/App.vue'
import router from '@/router.ts'
import '@/styles/global.sass'

const authieApp = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

authieApp
  .use(pinia)
  .use(router)
  .mount('#app')
