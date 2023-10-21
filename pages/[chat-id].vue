<template>
  <div class="prose dark:prose-invert w-full h-full mx-auto overflow-y-auto">
    <UCard class="min-h-full h-fit flex flex-col">
      <template #header>
        <div class="text-center">
          <h3 class="my-0">
            Welcome to YACI - {{ chatid }}
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

const ollama: any = useRuntimeConfig().public.ollama

const { params: { chatid } } = useRoute()

const messageText = ref<UserMessage>({
  context: [],
  prompt: ''
})
const chat = ref<Chat>({
  id: chatid[0],
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

  const responseBody = await $fetch<OllamaResponseSingle>(joinURL(ollama.baseUrl, '/api/generate'), {
    method: 'post',
    body: {
      model: 'mistral',
      context: messageText.value.context,
      prompt,
      stream: false
    }
  })

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
