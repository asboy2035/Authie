<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue'
  import Card from '@/components/layout/Card.vue'
  import CardTitle from '@/components/layout/CardTitle.vue'
  import NavBar from '@/components/premade/navbar/NavBar.vue'
  import ContentView from '@/components/navigation/ContentView.vue'
  import NavigationTitle from '@/components/navigation/NavigationTitle.vue'
  import {Icon} from '@iconify/vue'
  import Modal from '@/components/layout/Modal.vue'
  import Grid from '@/components/layout/Grid.vue'
  import TokenCard from '@/components/premade/TokenCard.vue'
  import { useTokensStore } from '@/stores/tokens'
  import InteriorItem from '@/components/layout/InteriorItem.vue'

  const tokensStore = useTokensStore()

  const showingCreateModal = ref<boolean>(false)
  const showingEditModal = ref<boolean>(false)
  const editingToken = ref<number | null>(null)

  const newName = ref('')
  const newUsername = ref('')
  const newColor = ref('#ff0000')
  const newSecret = ref('')

  const timeRemaining = ref(0)
  let interval: number

  onMounted(() => {
    interval = setInterval(() => {
      const date = new Date()
      timeRemaining.value = 30 - (date.getSeconds() % 30)
    }, 1000)
  })

  onUnmounted(() => {
    clearInterval(interval)
  })

  const createToken = () => {
    tokensStore.addToken({
      name: newName.value,
      username: newUsername.value,
      color: newColor.value,
      secret: newSecret.value
    })
    showingCreateModal.value = false
  }

  const editToken = (index: number) => {
    const token = tokensStore.tokens[index]
    if (token) {
      newName.value = token.name
      newUsername.value = token.username
      newColor.value = token.color
      newSecret.value = token.secret
      editingToken.value = index
      showingEditModal.value = true
    }
  }

  const updateToken = () => {
    if (editingToken.value !== null) {
      tokensStore.tokens[editingToken.value] = {
        name: newName.value,
        username: newUsername.value,
        color: newColor.value,
        secret: newSecret.value
      }
      showingEditModal.value = false
      editingToken.value = null
    }
  }

  const deleteToken = (index: number) => {
    tokensStore.tokens.splice(index, 1)
  }
</script>

<template>
  <ContentView id="homeView">
    <NavigationTitle title="Authie">
      <InteriorItem id="otpTime">
        <p>{{ timeRemaining }}</p>
      </InteriorItem>
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
          :secret="token.secret"
          :color="token.color"
          :time-remaining="timeRemaining"
          @edit="editToken(index)"
          @delete="deleteToken(index)"
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

  <Modal v-if="showingEditModal">
    <CardTitle
      title="Edit Token"
      icon="solar:pen-2-line-duotone"
    />

    <input v-model="newSecret" type="password" placeholder="Secret" />
    <input v-model="newName" type="text" placeholder="Service" />
    <input v-model="newUsername" type="text" placeholder="@Username" />
    <input v-model="newColor" type="color" placeholder="Color" />
    <button @click="updateToken">
      <Icon icon="solar:pen-2-line-duotone" />
      Update
    </button>
  </Modal>
</template>

<style scoped lang="sass">
  #otpTime
    padding: 0.25rem 0.5rem !important
</style>
