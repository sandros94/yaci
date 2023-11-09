<template>
  <div class="prose dark:prose-invert w-full h-full mx-auto flex flex-col">
    <div class="w-full my-auto text-center">
      <h1>
        Welcome to
        <UTooltip text="Yet Another Chat Interface" :popper="{placement: 'top'}" :close-delay="333">
          YACI
        </UTooltip>
      </h1>
      <p>Pick a Chat from the sidebar or create a new one.</p>
      <span class="w-fit inline-flex justify-center gap-6 mt-4">
        <UButton label="Manage Models" @click="editModelsModal = true" />
        <UButton label="New Chat" @click="newChatModal = true" />
      </span>
      <UModal v-model="editModelsModal">
        <UCard class="prose dark:prose-invert">
          <template #header>
            <h3 class="my-0 ml-4">
              Manage Models
            </h3>
          </template>
          <p>
            Not available in this version of YACI.
          </p>
        </UCard>
      </UModal>
      <UModal v-model="newChatModal">
        <UCard class="prose dark:prose-invert">
          <template #header>
            <h3 class="my-0 ml-4">
              Create Chat
            </h3>
          </template>
          <UForm :state="chatOptions" class="flex flex-col gap-6" @submit="createChat">
            <UFormGroup label="Chat Title" name="title">
              <UInput v-model="chatOptions.title" />
            </UFormGroup>
            <UFormGroup label="Model" name="model">
              <USelect v-model="chatOptions.model" :loading="pendingModels" :options="modelList" />
            </UFormGroup>
            <span class="w-full inline-flex justify-end gap-6 mt-6 mb-2">
              <UButton label="Create Chat" type="submit" :disabled="!modelList && !pendingModels" />
            </span>
          </UForm>
        </UCard>
      </UModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserPrompt, ModelList } from '~/types'
const { yaci: { ollama } } = useRuntimeConfig().public
const chatList = useChatList()
const uuid = useRandomUUID()
const newChatModal = ref(false)
const editModelsModal = ref(false)

const { data: availableModels, pending: pendingModels } = useFetch<ModelList>('/ollama/tags')
const modelList = computed(() => {
  return availableModels.value?.models.map(model => model.name)
})

const chatOptions = reactive<{title: string} & Omit<UserPrompt['message'], 'prompt'>>({
  title: 'New Chat',
  model: ollama.defaultModel
})

async function createChat () {
  const newChat = {
    id: uuid,
    title: chatOptions.title,
    model: chatOptions.model
  }
  // check if newChat's `id` already exists as chatList's `to` property. If it does regenerate the uuid and try again, else push the newChat to chatList
  if (chatList.value.find((chat) => { return chat.to === newChat.id })) {
    createChat()
  } else {
    chatList.value.push({
      to: `/chats/${newChat.id}`,
      label: newChat.title,
      id: newChat.id
    })
    await navigateTo({
      path: `/chats/${newChat.id}`,
      query: {
        title: newChat.title,
        model: newChat.model
      }
    })
  }
}
</script>

<style coped>

</style>
