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
      <UButton class="mt-4" @click="createChat">
        Create Chat
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const chatList = useChatList()
const uuid = useRandomUUID()

async function createChat () {
  const newChat = {
    id: uuid,
    title: 'New Chat',
    messages: []
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
        title: newChat.title
      }
    })
  }
}
</script>

<style coped>

</style>
