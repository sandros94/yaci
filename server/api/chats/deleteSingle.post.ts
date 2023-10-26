import type { Chat } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<Chat>(event)

  if (!body.id) {
    throw new Error('Missing chat ID')
  }
  const storage = useStorage()

  await storage.removeItem(`chats:${body.id}.json`)

  const check = await storage.hasItem(`chats:${body.id}.json`)

  if (!check) {
    return true
  } else {
    return false
  }
})
