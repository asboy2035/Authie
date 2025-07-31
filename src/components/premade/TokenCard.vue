<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import * as OTPAuth from 'otpauth'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import InteriorItem from '@/components/layout/InteriorItem.vue'
  import {Icon} from '@iconify/vue'

  const props = defineProps<{
    name: string
    username: string
    secret: string
    color: string
    timeRemaining: number
  }>()

  const emit = defineEmits(['edit', 'delete'])

  const totp = new OTPAuth.TOTP({
    issuer: 'Authie',
    label: props.name,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: props.secret
  })

  const token = ref(totp.generate())
  let interval: number

  const isExpiring = computed(() => props.timeRemaining <= 5)

  onMounted(() => {
    interval = setInterval(() => {
      token.value = totp.generate()
    }, 1000)
  })

  onUnmounted(() => {
    clearInterval(interval)
  })
</script>

<template>
  <InteriorItem class="token" :class="{ expiring: isExpiring }">
    <HStack class="autoSpace fullWidth">
      <HStack class="tokenContent">
        <div
          class="tokenColor"
          :style="{ '--color': color }"
        />

        <VStack class="tokenInfo">
          <VStack class="tokenName">
            <h3>{{ name }}</h3>
            <p class="light">{{ username }}</p>
          </VStack>

          <p class="tokenText">{{ token }}</p>
        </VStack>
      </HStack>

      <!--Actions-->
      <HStack class="tokenActions">
        <button class="transparent" @click="emit('edit')">
          <Icon icon="solar:pen-2-line-duotone" />
        </button>
        <button class="transparent" @click="emit('delete')">
          <Icon icon="solar:trash-bin-minimalistic-line-duotone" />
        </button>
      </HStack>
    </HStack>
  </InteriorItem>
</template>

<style scoped lang="sass">
  @use "@/styles/animations"

  .token
    align-items: flex-start

    &.expiring
      animation: pulse 0.8s ease infinite

  .tokenContent
    .tokenColor
      width: 0.25rem
      margin: 0.5rem 0
      height: auto
      min-height: 3rem
      border-radius: 0.25rem
      background: var(--color)
      opacity: 0.4

    .tokenInfo
      .tokenName
        gap: 0.1rem

        *
          margin: 0

      .tokenText
        font-size: 200%

  .tokenActions
    button
      svg
        width: 1.5rem !important
        height: 1.5rem !important
</style>