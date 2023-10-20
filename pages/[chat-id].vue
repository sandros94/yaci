<template>
  <div class="prose dark:prose-invert w-full h-full mx-auto overflow-y-auto">
    <UCard class="min-h-full h-fit flex flex-col">
      <template #header>
        <div class="text-center">
          <h3 class="my-0">
            Welcome to YACI - {{ chatId }}
          </h3>
        </div>
      </template>
      <div>
        <UiChat :messages="messages" />
      </div>
      <template #footer>
        <div class="flex">
          <UTextarea v-model="messageText.prompt" class="w-full" @keyup.enter="submitMessage" />
          <UButton class="px-6" icon="i-ph-arrow-right" @click="submitMessage" />
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
  Message
} from '~/types'

const ollama: any = useRuntimeConfig().public.ollama

const route = useRoute()
const chatId = route.params.chatid

const messageText = ref<UserMessage>({
  context: [],
  prompt: ''
})
const messages = ref<Message[]>([])

async function submitMessage () {
  if (!messageText.value.prompt) { return }

  const prompt = messageText.value.prompt

  messages.value.push({
    sender: 'user',
    message: {
      context: messageText.value.context,
      prompt,
      created_at: new Date()
    }
  })

  messageText.value.prompt = ''

  const responseBody = await $fetch<OllamaResponseSingle>(joinURL(ollama.baseUrl, '/api/generate'), {
    method: 'post',
    body: {
      model: 'mistral',
      context: messageText.value.context,
      prompt,
      stream: false
    }
  })

  messageText.value.context = responseBody.context

  messages.value.push({
    sender: 'llm',
    message: responseBody
  })
}
</script>

<style coped>

</style>
