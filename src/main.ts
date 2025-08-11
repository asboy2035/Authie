import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from '@/App.vue'
import router from '@/router.ts'
import '@/styles/global.sass'
import { useTokensStore } from '@/stores/tokens.ts'

const authieApp = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

authieApp.use(pinia)

const tokensStore = useTokensStore()

Promise.all([
  tokensStore.init()
]).then(() => {
  authieApp
    .use(router)
    .mount('#app')
})
