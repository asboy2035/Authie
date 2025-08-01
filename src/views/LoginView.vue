<script setup lang="ts">
  import { ref } from 'vue'
  import { useTokensStore } from '@/stores/tokens'
  import { useRouter } from 'vue-router'
  import Card from '@/components/layout/Card.vue'
  import CardTitle from '@/components/layout/CardTitle.vue'
  import {Icon} from '@iconify/vue'
  import {useHead} from '@vueuse/head'

  const tokensStore = useTokensStore()
  const router = useRouter()

  const passcode = ref('')
  const error = ref('')

  const login = async () => {
    error.value = ''
    try {
      await tokensStore.setPasscode(passcode.value.trim())
      const valid = await tokensStore.verifyPasscode(passcode.value)
      if (!valid) {
        error.value = 'Invalid passcode.'
        tokensStore.encryptionKey = null
        return
      }
      await tokensStore.init()
      await router.push('/')
    } catch (e) {
      console.error('Login failed:', e)
      error.value = 'Unexpected error occurred.'
      tokensStore.encryptionKey = null
    }
  }

  useHead({
    title: 'Login'
  })
</script>

<template>
  <Card class="fitContent">
    <CardTitle
      title="Enter Passcode"
      icon="solar:lock-keyhole-line-duotone"
    />

    <input v-model="passcode" type="password" placeholder="Passcode" @keyup.enter="login" />

    <p v-if="error" class="errorMessage">{{ error }}</p>
    <button @click="login">
      <Icon icon="solar:lock-keyhole-unlocked-line-duotone" />
      Login
    </button>
  </Card>
</template>
