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
    <NavBar />
  </ContentView>
</template>

<style scoped lang="sass">
  .button-group
    display: flex
    gap: 1rem
    margin-top: 1rem
</style>
