import type {
  ChatVersions,
  ChatV010,
  ChatV020,
  ChatV030
} from '~/types'

export default defineEventHandler(async (_event) => {
  const storage = useStorage('chats')

  const ids = await storage.getKeys()

  // read all chats using ids and get each title
  async function getTitle (id: string) {
    const chat = await storage.getItem<ChatVersions>(id)

    if (chat && chat.yaci && (chat.yaci.version === 'v0.1.0' || chat.yaci.version === '0.1.0')) {
      const chatV010 = chat as ChatV010
      return {
        label: chatV010.title,
        to: `/chats/${chatV010.id}`,
        id: chatV010.id
      }
    } else if (chat && chat.yaci && chat.yaci.version === '0.2.0') {
      const chatV020 = chat as ChatV020
      return {
        label: chatV020.settings.title,
        to: `/chats/${chatV020.id}`,
        id: chatV020.id
      }
    } else if (chat && chat.yaci && chat.yaci.version === '0.3.0') {
      const chatV030 = chat as ChatV030
      return {
        label: chatV030.yaci.title,
        to: `/chats/${chatV030.yaci.id}`,
        id: chatV030.yaci.id
      }
    }
  }

  return await Promise.all(ids.map(getTitle))
})
