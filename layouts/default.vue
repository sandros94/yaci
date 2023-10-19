<template>
  <div class="w-full h-full flex overflow-hidden">
    <div class="h-full relative transition-all transition-gpu duration-300" :class="{'ml-0': isSidebarOpen, '-ml-72': !isSidebarOpen}">
      <div
        class="h-full w-72 px-2 py-1 bg-neutral-50 bg-opacity-20 dark:bg-neutral-950 dark:bg-opacity-20 transform"
      >
        <h3>Side Bar</h3>
      </div>
      <UButton
        class="absolute top-2 -right-12"
        color="white"
        :icon="isSidebarOpen ? 'i-ph-arrow-line-left' : 'i-ph-arrow-line-right'"
        variant="ghost"
        size="xl"
        @click="isSidebarOpen = !isSidebarOpen"
      />
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isSidebarOpen = ref(false)

onMounted(() => {
  const mediaQuery = window.matchMedia('(min-width: 1024px)')
  isSidebarOpen.value = mediaQuery.matches
  mediaQuery.addEventListener('change', (event) => {
    isSidebarOpen.value = event.matches
  })
})
</script>

<style scoped>

</style>
