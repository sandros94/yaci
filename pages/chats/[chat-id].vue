<template>
  <div class="prose dark:prose-invert w-full h-full mx-auto overflow-y-auto">
    <UCard class="min-h-full h-fit flex flex-col">
      <template #header>
        <div class="w-full px-4 text-center">
          <h3 v-if="pageTitle" class="my-0 truncate">
            {{ pageTitle }}
          </h3>
          <h3 v-else class="my-0">
            Welcome to YACI
          </h3>
        </div>
      </template>
      <div>
        <UiChat v-if="chat && chat.messages" :messages="chat.messages" @delete-last="deleteLast()" />
      </div>
      <template #footer>
        <div class="flex">
          <UTextarea v-model="messageText.prompt" class="w-full" :disabled="isResponding" @keyup.enter="submitMessage" />
          <UButton class="px-6" icon="i-ph-arrow-right" :disabled="isResponding" @click="submitMessage" />
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { joinURL } from 'ufo'
import type {
  OllamaResponseSingle,
  UserMessage,
  Chat
} from '~/types'

const { public: { ollama: { baseURL: ollamaURL } } } = useRuntimeConfig()

const { params: { chatid }, query: { title: pageTitle } } = useRoute()

const messageText = ref<UserMessage>({
  prompt: ''
})

const { data: chatHistory } = await useFetch<Chat>('/api/chats/readSingle', {
  method: 'POST',
  body: {
    id: chatid
  }
})

const chat = ref<Chat>(chatHistory.value ?? {
  id: chatid as string,
  title: pageTitle as string,
  context: [],
  messages: []
})
const isResponding = ref(false)

async function submitMessage () {
  if (!messageText.value.prompt) { return }
  isResponding.value = true

  const prompt = messageText.value.prompt
  messageText.value.prompt = ''

  chat.value.messages?.push({
    sender: 'user',
    message: {
      prompt,
      created_at: new Date()
    }
  })

  // TODO: enable streaming mode
  const responseBody = await $fetch<OllamaResponseSingle>(joinURL(ollamaURL, '/api/generate'), {
    method: 'post',
    body: {
      model: 'mistral',
      context: chat.value.context,
      prompt,
      stream: false
    }
  })

  chat.value.messages!.push({
    sender: 'ai',
    message: responseBody
  })
  chat.value.context!.push(...responseBody.context)

  // TODO: post to api endpoint to save message to db
  await useFetch('/api/chats', {
    method: 'post',
    body: chat.value
  })

  isResponding.value = false
}

async function deleteLast () {
  function isOllamaResponseSingle (message: UserMessage | OllamaResponseSingle): message is OllamaResponseSingle {
    return (message as OllamaResponseSingle).model !== undefined
  }

  chat.value.messages!.splice(-2)

  chat.value.context = chat.value.messages!.flatMap((message) => {
    if (message.sender === 'ai' && isOllamaResponseSingle(message.message)) {
      return message.message.context
    }
    return []
  })

  await useFetch('/api/chats', {
    method: 'post',
    body: chat.value
  })
}
</script>

<style coped>

</style>
