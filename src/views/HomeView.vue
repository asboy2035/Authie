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

  const showingCreateModal = ref<boolean>(false)
  const showingEditModal = ref<boolean>(false)

  const tokenCount = ref<number>(69)
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

        <p>Secured accounts: {{ tokenCount }}</p>
      </Card>
    </Grid>

    <Card>
      <CardTitle
        title="Tokens"
        icon="solar:lock-keyhole-line-duotone"
      />

      <Grid class="spaced tight">
        <TokenCard
          name="SlayFlare"
          username="@asboy2035"
          token="678455"
          color="pink"
        />

        <TokenCard
          name="SlayFlare"
          username="@asboy2035"
          token="678455"
          color="red"
        />

        <TokenCard
          name="SlayFlare"
          username="@asboy2035"
          token="678455"
          color="blue"
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

    <input id="creatorSecretInput" type="password" placeholder="Secret" />
    <input id="creatorNameInput" type="text" placeholder="Service" />
    <input id="creatorUsernameInput" type="text" placeholder="@Username" />
    <input id="creatorColorInput" type="color" placeholder="Color" />
  </Modal>
</template>

<style scoped>

</style>