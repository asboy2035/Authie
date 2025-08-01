import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import CreatePasscodeView from '@/views/CreatePasscodeView.vue'
import { useTokensStore } from '@/stores/tokens'
import SettingsView from '@/views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomeView,
      beforeEnter: (to, from, next) => {
        const tokensStore = useTokensStore()
        if (!tokensStore.encryptionKey) {
          next('/login')
        } else {
          next()
        }
      }
    },
    {
      path: '/login',
      component: LoginView,
      beforeEnter: (to, from, next) => {
        if (localStorage.getItem('tokens')) {
          next()
        } else {
          next('/create-passcode')
        }
      }
    },
    { path: '/create-passcode', component: CreatePasscodeView },
    {
      path: '/settings',
      component: SettingsView,
      beforeEnter: (to, from, next) => {
        const tokensStore = useTokensStore()
        if (!tokensStore.encryptionKey) {
          next('/login')
        } else {
          next()
        }
      }
    }
  ]
})

export default router
