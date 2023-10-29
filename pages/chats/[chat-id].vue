<template>
  <div class="w-full min-h-screen overflow-y-auto">
    <UiChat :chat="chatHistory" :chat-id="(chatid as string)" :page-title="(pageTitle as string)" :model="(aiModel as string)" />
  </div>
</template>

<script setup lang="ts">
import type { Chat } from '~/types'

const { params: { chatid }, query: { title: pageTitle, model: aiModel } } = useRoute()

const { data: chatHistory } = await useFetch<Chat>('/api/chats/readSingle', {
  key: `chat-${chatid}`,
  method: 'POST',
  body: {
    id: chatid
  }
})
</script>

<style coped>

</style>
