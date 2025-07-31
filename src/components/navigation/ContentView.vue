<script setup lang="ts">

</script>

<template>
  <div class="contentView">
    <slot />
  </div>
</template>

<style scoped lang="sass">
  .contentView
    display: flex
    flex-direction: column
    width: calc(100vw - 3rem)
    max-width: 55rem
    min-height: 100vh
    padding: var(--contentPadding)
    gap: 0.5rem
</style>