<script setup lang="ts">
  import Card from '@/components/layout/Card.vue'
  import CardTitle from '@/components/layout/CardTitle.vue'
  import NavBar from '@/components/premade/navbar/NavBar.vue'
  import ContentView from '@/components/navigation/ContentView.vue'
  import NavigationTitle from '@/components/navigation/NavigationTitle.vue'
  import {Icon} from '@iconify/vue'
  import Modal from '@/components/layout/Modal.vue'
  import {ref} from 'vue'
  import Grid from '@/components/layout/Grid.vue'
  import TokenCard from '@/components/premade/TokenCard.vue'
  import { useTokensStore } from '@/stores/tokens'

  const tokensStore = useTokensStore()

  const showingCreateModal = ref<boolean>(false)

  const newName = ref('')
  const newUsername = ref('')
  const newColor = ref('#ff0000')
  const newSecret = ref('')

  const createToken = () => {
    tokensStore.addToken({
      name: newName.value,
      username: newUsername.value,
      color: newColor.value,
      secret: newSecret.value
    })
    showingCreateModal.value = false
  }
</script>

<template>
  <ContentView id="homeView">
    <NavigationTitle title="Authie">
      <button
        @click="showingCreateModal = !showingCreateModal"
      >
        <Icon icon="solar:pen-new-square-line-duotone" />
      </button>
    </NavigationTitle>

    <Grid class="spaced">
      <Card>
        <CardTitle
          title="Welcome!"
          icon="solar:shield-star-line-duotone"
        />

        <p>Add tokens with the button above.</p>
      </Card>

      <Card>
        <CardTitle
          title="Stats"
          icon="solar:shield-star-line-duotone"
        />

        <p>Secured accounts: {{ tokensStore.tokens.length }}</p>
      </Card>
    </Grid>

    <Card>
      <CardTitle
        title="Tokens"
        icon="solar:lock-keyhole-line-duotone"
      />

      <Grid class="spaced" id="tokenGrid">
        <TokenCard
          v-for="(token, index) in tokensStore.tokens"
          :key="index"
          :name="token.name"
          :username="token.username"
          token="678455"
          :color="token.color"
        />
      </Grid>
    </Card>

    <NavBar />
  </ContentView>

  <Modal v-if="showingCreateModal">
    <CardTitle
      title="Create Token"
      icon="solar:pen-new-square-line-duotone"
    />

    <input v-model="newSecret" type="password" placeholder="Secret" />
    <input v-model="newName" type="text" placeholder="Service" />
    <input v-model="newUsername" type="text" placeholder="@Username" />
    <input v-model="newColor" type="color" placeholder="Color" />
    <button @click="createToken">
      <Icon icon="solar:pen-new-square-line-duotone" />
      Create
    </button>
  </Modal>
</template>

<style scoped lang="sass">
  #tokenGrid
    grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr))
</style>