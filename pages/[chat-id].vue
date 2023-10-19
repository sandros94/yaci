<template>
  <div class="prose dark:prose-invert w-full h-full mx-auto">
    <UCard class="h-full flex flex-col">
      <template #header>
        <div class="text-center">
          <h3 class="my-0">
            Welcome to YACI
          </h3>
        </div>
      </template>
      <div class="h-full overflow-y-auto">
        {{ chatId }}
      </div>
      <template #footer>
        <div class="flex">
          <UTextarea class="w-full" />
          <UButton class="px-6" icon="i-ph-arrow-right" />
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const chatId = route.params.chatid
</script>

<style coped>

</style>
