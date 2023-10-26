<template>
  <div class="prose dark:prose-invert w-full h-full mx-auto overflow-y-auto">
    <UCard class="min-h-full h-fit flex flex-col">
      <template #header>
        <div class="w-full px-4 text-center">
          <span v-if="pageTitle || chat.title" class="inline-flex gap-2">
            <h3 class="my-0 truncate">
              {{ pageTitle || chat.title }}
            </h3>
            <UButton icon="i-ph-pencil" variant="ghost" @click="isEdit.open = true" />
            <UModal v-model="isEdit.open">
              <UCard class="prose dark:prose-invert">
                <template #header>
                  <h3 class="my-0 ml-4">
                    Change Title
                  </h3>
                </template>
                <h4 class="mt-0">
                  Set new title:
                </h4>
                <UInput v-model="isEdit.title" />
                <template #footer>
                  <span class="w-full inline-flex justify-end gap-6 mb-2">
                    <UButton label="Cancel" variant="outline" color="black" @click="isEdit.open = false" />
                    <UButton label="Edit Title" variant="outline" :ui="{variant:{solid:'dark:text-gray-100'}}" @click="editTitle()" />
                  </span>
                </template>
              </UCard>
            </UModal>
          </span>
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
const isEdit = ref({
  open: false,
  title: chat.value.title ?? ''
})

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

  chat.value.context = responseBody.context

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

  if (chat.value.messages && chat.value.messages.length > 1) {
    const lastMessage = chat.value.messages?.at(-1)
    if (lastMessage!.sender === 'ai' && isOllamaResponseSingle(lastMessage!.message)) {
      chat.value.context = lastMessage!.message.context
    }
  } else {
    chat.value.messages = []
  }

  await useFetch('/api/chats', {
    method: 'post',
    body: chat.value
  })
}

async function editTitle () {
  chat.value.title = isEdit.value.title

  await useFetch('/api/chats', {
    method: 'post',
    body: chat.value
  })

  isEdit.value.open = false
}
</script>

<style coped>

</style>
