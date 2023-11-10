<template>
  <div class="w-full min-h-screen overflow-y-auto">
    <UiChat v-if="!mismatchDetected" :chat="chatHistory" :chat-id="(chatId as string)" :chat-options="chatOptions" />
    <UContainer v-else class="flex min-h-full items-center justify-center overflow-y-auto max-w-lg">
      <UCard class="prose dark:prose-invert">
        <template #header>
          <h3 class="my-0 ml-4">
            Chat Version Mismatch
          </h3>
        </template>
        <p>
          You are trying to open up a chat that is not supported by the current version of YACI.
        </p>
        <ul>
          <li>
            <strong>Chat Version:</strong> {{ chatHistory?.yaci.version ?? 'Corrupted' }}
          </li>
          <li>
            <strong>YACI Version:</strong> {{ version }}
          </li>
        </ul>
        <p v-if="updateChatError" class="text-warning-500">
          ERROR:<br>Unable to update the chat to the current version of YACI.
        </p>
        <template #footer>
          <span class="w-full inline-flex justify-end gap-6 mb-2">
            <UButton label="Back Home" variant="outline" class="decoration-transparent" to="/" />
            <UButton label="Update Chat" class="decoration-transparent" @click="updateChat(chatHistory)" />
          </span>
        </template>
      </UCard>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import type { Chat } from '~/types'

const { params: { chatid: chatId }, query: { chatoptions } } = useRoute()
const { public: { yaci: { version } } } = useRuntimeConfig()
const { migrateChat } = useChatMigration()
const chatOptions: Chat['settings'] | null = chatoptions ? JSON.parse(chatoptions as string) : null

const { data: chatHistory, refresh: refreshChatHistory } = await useFetch<Chat>('/api/chats/readSingle', {
  key: `chat-${chatId}`,
  method: 'POST',
  body: {
    id: chatId
  }
})

const mismatchDetected = ref(true)
if (chatHistory.value && chatHistory.value.yaci && chatHistory.value.yaci.version !== version) {
  // eslint-disable-next-line no-console
  console.warn('Chat version mismatch, chat version:', chatHistory.value.yaci.version, 'YACI version:', version)
  mismatchDetected.value = true
} else {
  mismatchDetected.value = false
}

const updateChatError = ref(false)
async function updateChat (chat: any) {
  const updatedChat = migrateChat(chat)
  if (updatedChat) {
    await $fetch('/api/chats', {
      method: 'POST',
      body: updatedChat
    })
    await refreshChatHistory()
    mismatchDetected.value = false
  } else {
    updateChatError.value = true
  }
}
</script>

<style coped>

</style>
