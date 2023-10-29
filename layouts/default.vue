<template>
  <div class="w-full h-full flex overflow-hidden">
    <div class="h-full relative transition-all transition-gpu duration-300" :class="{'ml-0': isSidebarOpen, '-ml-72': !isSidebarOpen}">
      <div
        class="h-full w-72 px-2 py-1 bg-neutral-50 bg-opacity-20 dark:bg-neutral-950 dark:bg-opacity-20 transform overflow-hidden"
      >
        <span class="w-full my-2 inline-flex justify-evenly prose dark:prose-invert">
          <NuxtLink to="/">
            <h3>Home</h3>
          </NuxtLink>
          <h3>Chats</h3>
        </span>
        <div class="w-3/4 mx-auto overflow-y-auto">
          <UVerticalNavigation
            class="w-full"
            :links="chatList"
            :ui="{
              label: 'w-full truncate relative inline-flex justify-between',
              badge: 'px-0 -me-0'
            }"
          >
            <template #badge="{ link, isActive }">
              <UButton icon="i-ph-trash" variant="ghost" :color="isActive ? 'primary' : 'black'" :padded="false" @click="() => { isModal.title = link.label; isModal.id = link.id; isModal.open = true }" />
            </template>
          </UVerticalNavigation>
          <UModal v-model="isModal.open">
            <UCard class="prose dark:prose-invert">
              <template #header>
                <h3 class="my-0 ml-4">
                  ⚠️ Warning!
                </h3>
              </template>
              <h4 class="mt-0">
                Deleting a chat is permanent.
              </h4>
              <p>You are about to delete the following chat:</p>
              {{ isModal.title }}
              <template #footer>
                <span class="w-full inline-flex justify-end gap-6 mb-2">
                  <UButton label="Cancel" variant="outline" @click="isModal.open = false" />
                  <UButton label="Delete Chat" variant="outline" color="warning" :ui="{variant:{solid:'dark:text-gray-100'}}" @click="deleteChat(isModal.id)" />
                </span>
              </template>
            </UCard>
          </UModal>
        </div>
      </div>
      <UButton
        class="absolute top-2 -right-12"
        color="white"
        :icon="isSidebarOpen ? 'i-ph-arrow-line-left' : 'i-ph-arrow-line-right'"
        variant="ghost"
        size="xl"
        @click="isSidebarOpen = !isSidebarOpen"
      />
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const isSidebarOpen = ref(false)
const chatList = useChatList()
chatList.value = await $fetch<{ id: string, label: string, to: string }[]>('/api/chats')
const isModal = ref({
  open: false,
  title: '',
  id: ''
})

onMounted(() => {
  const mediaQuery = window.matchMedia('(min-width: 1024px)')
  const storedSidebarState = localStorage.getItem('isSidebarOpen')
  if (storedSidebarState !== null) {
    isSidebarOpen.value = JSON.parse(storedSidebarState)
  } else {
    isSidebarOpen.value = mediaQuery.matches
  }
  mediaQuery.addEventListener('change', (event) => {
    isSidebarOpen.value = event.matches
  })
  // Store the state of isSidebarOpen in local storage
  window.addEventListener('beforeunload', () => {
    localStorage.setItem('isSidebarOpen', JSON.stringify(isSidebarOpen.value))
  })
})

watch(isModal, (newValue) => {
  if (newValue.open === false && newValue.title !== '' && newValue.id !== '') {
    isModal.value.id = ''
    isModal.value.title = ''
  }
})

async function deleteChat (chatId: string) {
  // do a fetch to delete the chat, then check response
  const { data: res } = await useFetch('/api/chats/deleteSingle', {
    key: `delete-${chatId}`,
    method: 'POST',
    body: {
      id: chatId
    }
  })

  // if response is ok, then delete the chat from chatList
  if (res.value === true) {
    const chatIndex = chatList.value.findIndex((chat) => { return chat.id === chatId })
    chatList.value.splice(chatIndex, 1)
    isModal.value.open = false
    // check if route.params.chatid equals with chatId, if it does then navigate to home
    if (route.params.chatid === chatId) {
      navigateTo('/')
    }
  }
}
</script>

<style scoped>

</style>
