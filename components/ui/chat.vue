<template>
  <div class="w-full h-full overflow-y-auto">
    <UCard id="message-container" class="prose dark:prose-invert mx-auto min-h-full flex flex-col">
      <template #header>
        <div class="w-full px-4 text-center">
          <span v-if="chat.yaci && chat.yaci.title" class="inline-flex gap-2">
            <h3 class="my-0 truncate">
              {{ chat.yaci.title }}
            </h3>
            <UButton icon="i-ph-pencil" variant="ghost" color="primary" @click="isEdit.open = true" />
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
          <div v-if="item.role === 'assistant'" class="w-full group pt-5">
            <span class="justify-start">
              <UIcon name="i-ph-robot" class="align-text-bottom text-2xl" />
              {{ chat.model }}
            </span>
            <NuxtMarkdown :source="item.content" />
          </div>
          <div v-else class="w-full relative group pt-5">
            <UButton v-if="index === chat.messages.length - 2 || index === chat.messages.length - 1" icon="i-ph-x" class="absolute right-0 opacity-20 hover:opacity-100" variant="outline" @click="deleteLast()" />
            <span class="justify-end">
              <UIcon name="i-ph-user" class="align-text-bottom text-2xl" />
              {{ item.role }}
            </span>
            <NuxtMarkdown :source="item.content" />
          </div>
        </div>
      </div>
      <template #footer>
        <UForm :state="{ promptText }" class="relative" @submit="submitMessage">
          <div v-if="isError" class="w-fit absolute -top-12 inset-x-0 mx-auto">
            <UButton label="Chat not Saved" trailing-icon="i-ph-arrow-counter-clockwise" color="warning" @click="saveChat()" />
          </div>
          <UButtonGroup class="w-full">
            <UTextarea
              ref="textarea"
              v-model="promptText"
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
import type {
  Chat,
  DeepPartial,
  MessageUser,
  ResponseAssistant
} from '~/types'

const chatList = useChatList()
const toast = useToast()

const props = defineProps({
  chat: {
    type: Object as PropType<DeepPartial<Chat>>,
    required: true
  },
  chatId: {
    type: String,
    required: true
  }
})

const chat = ref<DeepPartial<Chat>>(props.chat)

const textarea = ref({ textarea: null as HTMLTextAreaElement | null })
const promptText = ref<MessageUser['content']>('')

const newChat = ref<boolean>(chatList.value.some((chatItem: any) => { return chatItem.id === chat.value.yaci!.id }))
const isError = ref(false)
const isResponding = ref(false)
const isDeleting = ref(false)
const isEdit = ref({
  open: false,
  title: chat.value.yaci!.title
})

function handleEnter (event: KeyboardEvent) {
  const orientation = window.screen.orientation.type
  // hacked way to submit on enter only on desktop
  if (event.shiftKey || orientation === 'portrait-primary' || orientation === 'portrait-secondary') {
    promptText.value += '\n'
  } else {
    submitMessage()
  }
}

async function submitMessage () {
  if (!promptText.value || promptText.value === '\n') { return }
  isResponding.value = true

  const prompt = promptText.value
  promptText.value = ''

  chat.value.messages!.push({
    role: 'user',
    content: prompt
  })

  if (chat.value.stream) {
    // TODO: check for ollama errors
    const responseStream = await $fetch<ReadableStream>('/ollama/chat', {
      method: 'post',
      body: chat.value
    })

    const reader = responseStream.getReader()

    const message: Omit<ResponseAssistant, 'created_at'> & { created_at?: Date} = {
      model: chat.value.model!,
      message: {
        role: 'assistant',
        content: '',
        images: null
      },
      done: false
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
          const responseBody: ResponseAssistant = JSON.parse(line)

          if (lastMessage && lastMessage.role === 'assistant' && !responseBody.done) {
            lastMessage.message.content += responseBody.message.content
          } else if (lastMessage && lastMessage.role === 'assistant' && responseBody.done) {
            const { message, ...rest } = responseBody
            lastMessage.message.content += message.content
            // eslint-disable-next-line no-console
            console.log(rest)
            break
          }
        }
      }
    }
  } else {
    // TODO: check for ollama errors
    // eslint-disable-next-line
    const { yaci, ...rest } = chat.value

    const response = await $fetch<ResponseAssistant>('/ollama/chat', {
      method: 'post',
      body: rest
    })

    chat.value.messages!.push(response.message)
  }

  await saveChat()

  if (newChat.value) {
    chatList.value = await $fetch<{ id: string, label: string, to: string }[]>('/api/chats')
    newChat.value = false
  }
}

async function saveChat () {
  const savedChat = await useFetch('/api/chats', {
    key: `chat-${chat.value.yaci!.id}`,
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

      if (lastMessage && lastMessage.role === 'user') {
        chat.value.messages.splice(-1)
      } else if (lastMessage && lastMessage.role === 'assistant') {
        chat.value.messages.splice(-2)
      } else if (lastMessage && lastMessage.role === 'system') {
        return
      } else {
        throw new Error('Couln\'t delete last message')
      }
    }

    await useFetch('/api/chats', {
      key: `chat-${chat.value.yaci!.id}`,
      method: 'post',
      body: chat.value
    })
    isDeleting.value = false
  } else {
    toast.add({
      id: 'delete_last_message',
      title: 'Cannot delete last message',
      description: 'You can\'t delete the last message while the Assistant is responding',
      icon: 'i-ph-warning',
      color: 'warning'
    })
  }
}

async function editTitle () {
  chat.value.yaci!.title = isEdit.value.title

  await useFetch('/api/chats', {
    key: `chat-${chat.value.yaci!.id}`,
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
