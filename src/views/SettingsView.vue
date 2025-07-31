<script setup lang="ts">
  import { ref } from 'vue'
  import { useTokensStore } from '@/stores/tokens'
  import ContentView from '@/components/navigation/ContentView.vue'
  import NavigationTitle from '@/components/navigation/NavigationTitle.vue'
  import Card from '@/components/layout/Card.vue'
  import CardTitle from '@/components/layout/CardTitle.vue'
  import { Icon } from '@iconify/vue'
  import NavBar from '@/components/premade/navbar/NavBar.vue'

  const tokensStore = useTokensStore()
  const fileInput = ref<HTMLInputElement | null>(null)

  const oldPasscode = ref('')
  const newPasscode = ref('')
  const confirmNewPasscode = ref('')
  const passcodeChangeError = ref('')
  const passcodeChangeSuccess = ref(false)

  const exportTokens = () => {
    const data = JSON.stringify(tokensStore.tokens, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'authie-tokens.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const triggerImport = () => {
    fileInput.value?.click()
  }

  const importTokens = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedTokens = JSON.parse(e.target?.result as string)
          if (Array.isArray(importedTokens)) {
            for (const token of importedTokens) {
              if (token.name && token.secret && token.color) {
                tokensStore.addToken({
                  name: token.name,
                  username: token.username || '',
                  color: token.color,
                  secret: token.secret
                })
              }
            }
          }
        } catch (error) {
          console.error('Error parsing JSON file:', error)
        }
      }
      reader.readAsText(file)
    }
  }

  const clearData = () => {
    if (confirm('Are you sure you want to delete all your tokens? This action cannot be undone.')) {
      alert("Reload page to see changes.")

      localStorage.clear()
      tokensStore.$reset() // Reset Pinia store state
    }
  }

  const changePasscode = async () => {
    passcodeChangeError.value = ''
    passcodeChangeSuccess.value = false

    if (newPasscode.value !== confirmNewPasscode.value) {
      passcodeChangeError.value = 'New passcodes do not match.'
      return
    }
    if (newPasscode.value.length < 8) {
      passcodeChangeError.value = 'New passcode must be at least 8 characters long.'
      return
    }

    // Verify old passcode
    const isOldPasscodeValid = await tokensStore.verifyPasscode(oldPasscode.value)
    if (!isOldPasscodeValid) {
      passcodeChangeError.value = 'Incorrect old passcode.'
      return
    }

    try {
      await tokensStore.reEncryptAndSetNewPasscode(newPasscode.value)

      passcodeChangeSuccess.value = true
      oldPasscode.value = ''
      newPasscode.value = ''
      confirmNewPasscode.value = ''
    } catch (error) {
      console.error('Error changing passcode:', error)
      passcodeChangeError.value = 'Failed to change passcode. Please try again.'
    }
  }
</script>

<template>
  <ContentView>
    <NavigationTitle title="Settings" />

    <Card>
      <CardTitle title="Data Management" icon="solar:database-line-duotone" />
      <p>Import or export your tokens. This is useful for backing up your data or transferring it to another device.</p>
      <div class="button-group">
        <button @click="triggerImport">
          <Icon icon="solar:import-line-duotone" />
          Import
        </button>
        <input type="file" ref="fileInput" @change="importTokens" accept=".json" style="display: none" />
        <button @click="exportTokens">
          <Icon icon="solar:export-line-duotone" />
          Export
        </button>
      </div>
    </Card>

    <Card>
      <CardTitle title="Change Passcode" icon="solar:lock-keyhole-line-duotone" />
      <p>Update your encryption passcode. You will need your old passcode to do this.</p>
      <input v-model="oldPasscode" type="password" placeholder="Old Passcode" />
      <input v-model="newPasscode" type="password" placeholder="New Passcode" />
      <input v-model="confirmNewPasscode" type="password" placeholder="Confirm New Passcode" />
      <p v-if="passcodeChangeError" class="error-message">{{ passcodeChangeError }}</p>
      <p v-if="passcodeChangeSuccess" class="success-message">Passcode changed successfully!</p>
      <button @click="changePasscode">
        <Icon icon="solar:key-line-duotone" />
        Change Passcode
      </button>
    </Card>

    <Card>
      <CardTitle title="Delete All Data" icon="solar:trash-bin-minimalistic-line-duotone" />
      <p>Permanently delete all your stored tokens and encryption keys from this device.</p>
      <button @click="clearData" class="danger-button">
        <Icon icon="solar:trash-bin-minimalistic-line-duotone" />
        Delete All Data
      </button>
    </Card>

    <NavBar />
  </ContentView>
</template>

<style scoped lang="sass">
  .button-group
    display: flex
    gap: 1rem
    margin-top: 1rem

  .error-message
    color: red
    margin-top: 0.5rem

  .success-message
    color: green
    margin-top: 0.5rem

  .danger-button
    background-color: #ff4d4d
    &:hover
      background-color: #cc0000
</style>
