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

  const token = ref<string>(totp.generate())
  const isExpiring = computed(() => props.timeRemaining <= 5)
  let timeout: ReturnType<typeof setTimeout>
  const showingCopiedIcon = ref<boolean>(false)

  function scheduleNextTokenUpdate() {
    const msRemaining = props.timeRemaining * 1000
    timeout = setTimeout(() => {
      token.value = totp.generate()
      scheduleNextTokenUpdate()
    }, msRemaining)
  }

  onMounted(() => {
    scheduleNextTokenUpdate()
  })

  onUnmounted(() => {
    clearTimeout(timeout)
  })

  function copyToken(
    text: string
  ): void {
    navigator
      .clipboard
      .writeText(text)
      .catch((err) => {
        console.error("Failed to copy text: ", err)
      })
    showingCopiedIcon.value = true

    setTimeout(() => {
      showingCopiedIcon.value = false
    }, 2000)
  }
</script>

<template>
  <InteriorItem
    class="token"
    :class="{ expiring: isExpiring }"
    @click="copyToken(token)"
  >
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

          <HStack class="centered tokenNumber">
            <p class="tokenText">{{ token }}</p>

            <Icon
              v-if="showingCopiedIcon"
              class="copiedIcon"
              icon="solar:clipboard-check-line-duotone"
            />
          </HStack>
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
      margin-right: 0.5rem
      height: auto
      min-height: 3rem
      border-radius: 0.25rem
      background: var(--color)
      opacity: 0.7

    .tokenInfo
      .tokenName
        gap: 0.1rem

        p
          margin: 0
        h3
          margin: -0.1rem 0

      .tokenNumber
        .tokenText
          font-size: 200%

        .copiedIcon
          animation: scaleIn 0.3s ease forwards
          width: 1.75rem
          height: 1.75rem

  .tokenActions
    button
      svg
        width: 1.5rem !important
        height: 1.5rem !important
</style>