<template>
  <div class="w-full h-full overflow-y-auto">
    <UCard id="message-container" class="prose dark:prose-invert mx-auto min-h-full flex flex-col">
      <template #header>
        <div class="w-full px-4 text-center">
          <span v-if="chat.settings.title" class="inline-flex gap-2">
            <h3 class="my-0 truncate">
              {{ chat.settings.title }}
            </h3>
            <UButton icon="i-ph-pencil" variant="ghost" :disabled="newChat" :color="newChat ? 'black' : 'primary'" @click="isEdit.open = true" />
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
            Welcome to
            <UTooltip text="Yet Another Chat Interface" :close-delay="333">
              YACI
            </UTooltip>
          </h3>
        </div>
      </template>
      <div v-if="chat.messages">
        <div v-for="(item, index) in chat.messages" :key="JSON.stringify(item)" class="flex">
          <div v-if="item.sender === 'ai'" class="w-full group pt-5">
            <span class="justify-start">
              <UIcon name="i-ph-robot" class="align-text-bottom text-2xl" />
              {{ item.message.model }}
              <span class="hidden group-hover:inline-block pl-4 text-[0.66rem]">
                {{ item.message.created_at }}
              </span>
            </span>
            <VueMarkdown :source="item.message.response" />
          </div>
          <div v-else class="w-full relative group pt-5">
            <UButton v-if="index === chat.messages.length - 2 || index === chat.messages.length - 1" icon="i-ph-x" class="absolute right-0 opacity-20 hover:opacity-100" variant="outline" @click="deleteLast()" />
            <span class="justify-end">
              <UIcon name="i-ph-user" class="align-text-bottom text-2xl" />
              {{ item.sender }}
              <span class="hidden group-hover:inline-block pl-4 text-[0.66rem]">
                {{ item.message.created_at }}
              </span>
            </span>
            <VueMarkdown :source="item.message.prompt" />
          </div>
        </div>
      </div>
      <template #footer>
        <UForm :state="messageText" class="relative" @submit="submitMessage">
          <div v-if="isError" class="w-fit absolute -top-12 inset-x-0 mx-auto">
            <UButton label="Chat not Saved" trailing-icon="i-ph-arrow-counter-clockwise" color="warning" @click="saveChat()" />
          </div>
          <UButtonGroup class="w-full">
            <UTextarea
              ref="textarea"
              v-model="messageText.prompt"
              class="w-full"
              :disabled="isResponding || isDeleting"
              autoresize
              autofocus
              @keydown.enter.prevent="handleEnter"
            />
            <UButton class="px-6" icon="i-ph-arrow-right" :disabled="isResponding" type="submit" />
          </UButtonGroup>
        </UForm>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { defu } from 'defu'
import VueMarkdown from 'vue-markdown-render'
import type {
  OllamaResponse,
  UserMessage,
  Chat
} from '~/types'

const { public: { yaci: { version, ollama } } } = useRuntimeConfig()
const chatList = useChatList()
const toast = useToast()

const props = defineProps({
  chat: {
    type: Object as PropType<Chat | null>,
    required: false,
    default: null
  },
  chatId: {
    type: String,
    required: true
  },
  chatOptions: {
    type: Object as PropType<Chat['settings'] | null>,
    required: false,
    default: () => {}
  }
})

const newChat = ref(props.chat === null)
const chat = ref<Chat>(props.chat ?? {
  yaci: {
    version
  },
  id: props.chatId,
  settings: defu(props.chatOptions, {
    title: props.chatOptions?.title ?? 'New Chat',
    model: props.chatOptions?.model ?? ollama.defaultModel
  }),
  context: [],
  messages: []
})

const textarea = ref({ textarea: null as HTMLTextAreaElement | null })
const messageText = reactive<UserMessage['message']>({
  prompt: ''
})

const isError = ref(false)
const isResponding = ref(false)
const isDeleting = ref(false)
const isEdit = ref({
  open: false,
  title: chat.value.settings.title ?? ''
})

function handleEnter (event: KeyboardEvent) {
  const orientation = window.screen.orientation.type
  // hacked way to submit on enter only on desktop
  if (event.shiftKey || orientation === 'portrait-primary' || orientation === 'portrait-secondary') {
    messageText.prompt += '\n'
  } else {
    submitMessage()
  }
}

async function submitMessage () {
  if (!messageText.prompt || messageText.prompt === '\n') { return }
  isResponding.value = true

  const prompt = messageText.prompt
  messageText.prompt = ''

  chat.value.messages?.push({
    sender: 'user',
    message: {
      prompt,
      created_at: new Date()
    }
  })

  // TODO: check for ollama errors
  const responseStream = await $fetch<ReadableStream>('/ollama/generate', {
    method: 'post',
    body: defu({
      system: chat.value.settings.system_prompt,
      template: chat.value.settings.template,
      options: {
        temperature: chat.value.settings.temperature
      }
    }, {
      model: ollama.defaultModel,
      context: chat.value.context,
      prompt,
      stream: true
    }),
    responseType: 'stream'
  })

  const reader = responseStream.getReader()

  const message: OllamaResponse = {
    sender: 'ai',
    message: {
      model: chat.value.settings.model,
      response: '',
      done: false
    }
  }

  chat.value.messages!.push(message)

  const lastMessage = chat.value.messages?.at(-1)

  while (true) {
    const { value, done } = await reader.read()

    if (done) {
      break
    }

    const lines = new TextDecoder().decode(value).split('\n')
    for (const line of lines) {
      if (line) { // check if line is not an empty string
        const responseBody: OllamaResponse['message'] = JSON.parse(line)

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
    }
  }

  await saveChat()

  if (newChat.value) {
    chatList.value = await $fetch<{ id: string, label: string, to: string }[]>('/api/chats')
    newChat.value = false
  }
}

async function saveChat () {
  const savedChat = await useFetch('/api/chats', {
    key: `chat-${chat.value.id}`,
    method: 'post',
    body: chat.value
  })

  const {
    data: savedChatData,
    pending: savedChatPending,
    error: savedChatError
  } = savedChat

  if (savedChatData.value && !savedChatPending.value && !savedChatError.value) {
    isError.value = false
    isResponding.value = false
    await nextTick()
    textarea.value.textarea?.focus()
    toast.remove('save_chat_error')
  } else if (!savedChatPending.value && savedChatError.value) {
    isError.value = true
    toast.add({
      id: 'save_chat_error',
      title: 'Couldn\'t save chat',
      description: `${savedChatError.value.message}`,
      icon: 'i-ph-warning',
      color: 'warning',
      timeout: 0,
      actions: [{
        label: 'Retry',
        color: 'primary',
        trailingIcon: 'i-ph-arrow-counter-clockwise',
        click: async () => await saveChat()
      }]
    })
  }

  return savedChat
}

async function deleteLast () {
  if (!isResponding.value) {
    isDeleting.value = true
    if (chat.value.messages && chat.value.messages.length > 0) {
      const lastMessage = chat.value.messages.at(-1)

      if (lastMessage && lastMessage.sender === 'user') {
        chat.value.messages.splice(-1)
      } else if (lastMessage && lastMessage.sender === 'ai') {
        chat.value.messages.splice(-2)
        chat.value.context = chat.value.messages.length > 0 ? lastMessage.message.context : []
      } else {
        throw new Error('Couln\'t delete last message')
      }
    }

    await useFetch('/api/chats', {
      key: `chat-${chat.value.id}`,
      method: 'post',
      body: chat.value
    })
    isDeleting.value = false
  } else {
    toast.add({
      id: 'delete_last_message',
      title: 'Cannot delete last message',
      description: 'You can\'t delete the last message while the AI is responding',
      icon: 'i-ph-warning',
      color: 'warning'
    })
  }
}

async function editTitle () {
  chat.value.settings.title = isEdit.value.title

  await useFetch('/api/chats', {
    key: `chat-${chat.value.id}`,
    method: 'post',
    body: chat.value
  })

  chatList.value = await $fetch<{ id: string, label: string, to: string }[]>('/api/chats')

  isEdit.value.open = false
}

onMounted(() => {
  const messageContainer = document.getElementById('message-container')

  const autoScroller = new ResizeObserver(() => {
    messageContainer?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  })

  if (messageContainer) {
    autoScroller.observe(messageContainer)
  }
})
</script>

<style coped>

</style>
