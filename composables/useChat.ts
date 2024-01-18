import type { Chat, DeepPartial } from '~/types'

export const useChatList = () => {
  return useState<{label: Chat['yaci']['title'], to: string, id: Chat['yaci']['id']}[]>('yaci.chatList', () => [])
}

export const useChatState = () => {
  const { ollama, version } = useRuntimeConfig().public.yaci

  return useState<DeepPartial<Chat>>('yaci.chat', () => {
    return {
      yaci: {
        title: 'New Chat',
        version
      },
      model: ollama.defaultModel,
      options: {

        temperature: ollama.defaultOptions.temperature || undefined
      },
      template: ollama.defaultTemplate || undefined,
      messages: [],
      stream: true
    }
  })
}
