<template>
  <div class="prose dark:prose-invert w-full h-full mx-auto">
    <UCard class="min-h-full h-fit flex flex-col">
      <template #header>
        <div class="w-full px-4 text-center">
          <span v-if="chat.title || pageTitle" class="inline-flex gap-2">
            <h3 class="my-0 truncate">
              {{ chat.title || pageTitle }}
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
          <UTextarea
            ref="textarea"
            v-model="messageText.prompt"
            class="w-full"
            :disabled="isResponding"
            autoresize
            autofocus
            @keyup.enter="submitMessage"
          />
          <UButton class="px-6" icon="i-ph-arrow-right" :disabled="isResponding" @click="submitMessage" />
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type {
  OllamaResponseSingle,
  UserMessage,
  Chat
} from '~/types'

const { public: { ollama: { baseURL: ollamaURL } } } = useRuntimeConfig()

const { params: { chatid }, query: { title: pageTitle } } = useRoute()

const textarea = ref({ textarea: null as HTMLTextAreaElement | null })
const messageText = ref<UserMessage['message']>({
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

  const responseStream = await $fetch<ReadableStream>('/api/generate', {
    baseURL: ollamaURL,
    method: 'post',
    body: {
      model: 'mistral',
      context: chat.value.context,
      prompt,
      stream: true
    },
    responseType: 'stream'
  })

  const reader = responseStream.getReader()

  const message: OllamaResponseSingle = {
    sender: 'ai',
    message: {
      model: 'mistral',
      response: '',
      done: false
    }
  }

  chat.value.messages!.push(message)

  const lastMessage = chat.value.messages?.at(-1)

  while (true) {
    const { value } = await reader.read()

    const responseBody: OllamaResponseSingle['message'] = JSON.parse(new TextDecoder().decode(value))

    if (lastMessage && lastMessage.sender === 'ai' && !responseBody.done) {
      lastMessage.message.response += responseBody.response
      lastMessage.message.done = responseBody.done
    } else if (lastMessage && lastMessage.sender === 'ai' && responseBody.done) {
      const { response, ...rest } = responseBody
      lastMessage.message.response += response
      lastMessage.message = { ...lastMessage.message, ...rest }
      chat.value.context = responseBody.context
      break
    }
  }

  await useFetch('/api/chats', {
    method: 'post',
    body: chat.value
  })

  isResponding.value = false
  await nextTick()
  textarea.value.textarea?.focus()
}

async function deleteLast () {
  if (!isResponding.value) {
    if (chat.value.messages && chat.value.messages.length > 0) {
      const lastMessage = chat.value.messages.at(-1)

      if (lastMessage && lastMessage.sender === 'user') {
        chat.value.messages.splice(-1)
      } else if (lastMessage && lastMessage.sender === 'ai') {
        chat.value.messages.splice(-2)
        chat.value.context = lastMessage.message.context
      } else {
        throw new Error('Couln\'t delete last message')
      }
    }

    await useFetch('/api/chats', {
      method: 'post',
      body: chat.value
    })
  } else {
    useToast().add({
      id: 'delete_last_message',
      title: 'Cannot delete last message',
      description: 'You can\'t delete the last message while the AI is responding',
      icon: 'i-ph-warning',
      color: 'warning'
    })
  }
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
