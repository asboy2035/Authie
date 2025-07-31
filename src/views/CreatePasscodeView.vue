<script setup lang="ts">
  import { ref } from 'vue'
  import { useTokensStore } from '@/stores/tokens'
  import { useRouter } from 'vue-router'
  import Card from '@/components/layout/Card.vue'
  import CardTitle from '@/components/layout/CardTitle.vue'
  import {Icon} from '@iconify/vue'

  const tokensStore = useTokensStore()
  const router = useRouter()

  const passcode = ref('')
  const confirmPasscode = ref('')
  const error = ref('')

  const createPasscode = async () => {
    if (passcode.value !== confirmPasscode.value) {
      error.value = 'Passcodes do not match.'
      return
    }
    if (passcode.value.length < 8) {
        error.value = 'Passcode must be at least 8 characters long.'
        return
    }
    error.value = ''
    await tokensStore.setPasscode(passcode.value)
    await router.push('/')
  }
</script>

<template>
  <Card>
    <CardTitle
      title="Create Passcode"
      icon="solar:lock-keyhole-line-duotone"
    />

    <input v-model="passcode" type="password" placeholder="New Passcode" />
    <input v-model="confirmPasscode" type="password" placeholder="Confirm Passcode" @keyup.enter="createPasscode"/>

    <p v-if="error" class="errorMessage">{{ error }}</p>
    <button @click="createPasscode">
      <Icon icon="solar:pen-new-square-line-duotone" />
      Create
    </button>
  </Card>
</template>
