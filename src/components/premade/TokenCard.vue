<script setup lang="ts">
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import InteriorItem from '@/components/layout/InteriorItem.vue'

  defineProps<{
    name: string
    username: string
    token: string
    color: string
  }>()
</script>

<template>
  <InteriorItem class="token">
    <HStack class="tokenContent">
      <div
        class="tokenColor"
        :style="{ '--color': color }"
      />

      <VStack class="tokenInfo">
        <VStack class="tokenName">
          <h4>{{ name }}</h4>
          <p class="light">{{ username }}</p>
        </VStack>

        <p class="tokenText">{{ token }}</p>
      </VStack>
    </HStack>
  </InteriorItem>
</template>

<style scoped lang="sass">
  .token
    align-items: flex-start

    .tokenContent
      .tokenColor
        height: calc(100% - 2rem)
        width: 0.25rem
        border-radius: 0.25rem
        background: var(--color)
        opacity: 0.4

      .tokenInfo
        .tokenName
          gap: 0

        .tokenText
          font-size: 200%
</style>