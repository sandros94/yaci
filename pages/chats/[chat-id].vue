<template>
  <div class="w-full h-full overflow-y-auto" style="overflow-anchor: auto;">
    <UiChat v-if="chatHistory" :chat="chatHistory" :chat-id="(chatid as string)" :page-title="(pageTitle as string)" />
  </div>
</template>

<script setup lang="ts">
import type { Chat } from '~/types'

const { params: { chatid }, query: { title: pageTitle } } = useRoute()

const { data: chatHistory } = await useFetch<Chat>('/api/chats/readSingle', {
  method: 'POST',
  body: {
    id: chatid
  }
})
</script>

<style coped>

</style>
