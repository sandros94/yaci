<template>
  <div>
    <div v-for="item in messages" :key="JSON.stringify(item)" class="flex">
      <div v-if="item.sender === 'llm'" class="group pt-5">
        <div v-if="!isUserMessage(item.message)">
          <span class="justify-start">
            <UIcon name="i-ph-robot" class="align-text-bottom text-2xl" />
            {{ item.message.model }}
            <span class="hidden group-hover:inline-block pl-4 text-[0.66rem]">
              {{ item.message.created_at }}
            </span>
          </span>
          <VueMarkdown :source="item.message.response" />
        </div>
      </div>
      <div v-else class="group pt-5">
        <div v-if="isUserMessage(item.message)">
          <span class="justify-end">
            <UIcon name="i-ph-user" class="align-text-bottom text-2xl" />
            {{ item.sender }}
            <span class="hidden group-hover:inline-block pl-4 text-[0.66rem]">
              {{ item.message.created_at }}
            </span>
          </span>
          <p>{{ item.message.prompt }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import VueMarkdown from 'vue-markdown-render'
import type { Message, UserMessage } from '~/types'

defineProps({
  messages: {
    type: Array as PropType<Message[]>,
    required: true
  }
})

function isUserMessage (message: any): message is UserMessage {
  return message && message.prompt !== undefined
}
</script>
