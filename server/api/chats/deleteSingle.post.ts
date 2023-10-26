import type { Chat } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<Chat>(event)

  if (!body.id) {
    throw new Error('Missing chat ID')
  }
  const storage = useStorage('chat')

  await storage.removeItem(body.id)

  const check = await storage.hasItem(body.id)

  if (!check) {
    return true
  } else {
    return false
  }
})
