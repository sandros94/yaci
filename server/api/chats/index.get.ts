import type { Chat } from '~/types'

export default defineEventHandler(async (_event) => {
  const storage = useStorage('chats')

  const ids = await storage.getKeys()

  // read all chats using ids and get each title
  async function getTitle (id: string) {
    const chat = await storage.getItem<Chat>(id)
    return {
      label: chat?.title,
      to: `/chats/${id}`,
      id: chat?.id
    }
  }

  return await Promise.all(ids.map(getTitle))
})
