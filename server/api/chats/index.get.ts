import type { ChatV010, ChatV020 } from '~/types'

type Chat = ChatV010 | ChatV020

export default defineEventHandler(async (_event) => {
  const storage = useStorage('chats')

  const ids = await storage.getKeys()

  // read all chats using ids and get each title
  async function getTitle (id: string) {
    const chat = await storage.getItem<Chat>(id)

    if (chat && chat.yaci && (chat.yaci.version === 'v0.1.0' || chat.yaci.version === '0.1.0')) {
      const chatV010 = chat as ChatV010
      return {
        label: chatV010.title,
        to: `/chats/${id}`,
        id: chat.id
      }
    } else if (chat && chat.yaci && chat.yaci.version === '0.2.0') {
      const chatV020 = chat as ChatV020
      return {
        label: chatV020.settings.title,
        to: `/chats/${id}`,
        id: chat.id
      }
    }
  }

  return await Promise.all(ids.map(getTitle))
})
