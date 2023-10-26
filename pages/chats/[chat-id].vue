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
        <UiChat v-if="chat && chat.messages" :messages="chat.messages" @delete-last="chat.messages.splice(-2)" />
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
  context: [],
  prompt: ''
})
const chat = ref<Chat>({
  id: chatid as string,
  title: pageTitle as string,
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
      context: messageText.value.context,
      prompt,
      created_at: new Date()
    }
  })

  // TODO: enable streaming mode
  const responseBody = await $fetch<OllamaResponseSingle>(joinURL(ollamaURL, '/api/generate'), {
    method: 'post',
    body: {
      model: 'mistral',
      context: messageText.value.context,
      prompt,
      stream: false
    }
  })

  // TODO: post to api endpoint to save message to db, if successful, push to chat.value.messages, else reinsert the message into messageText.value.prompt

  chat.value.messages!.push({
    sender: 'bot',
    message: responseBody
  })
  isResponding.value = false
}

// use a computed property to map all contexts from chat.value
const allContexts = computed(() => {
  return chat.value.messages!.flatMap((message) => {
    if (message.sender === 'bot') {
      return message.message.context
    }
    return []
  })
})

// use a watcher to update messageText.value.context when allContexts changes
watch(allContexts, (contexts) => {
  messageText.value.context = contexts
})
</script>

<style coped>

</style>
