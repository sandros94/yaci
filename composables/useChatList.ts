import type { Chat } from '~/types'

export const useChatList = () => {
  return useState<{label: Chat['title'], to: string, id: Chat['id']}[]>('chatList', () => [])
}
