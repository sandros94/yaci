import type { Chat } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<Chat>(event)

  if (!body.yaci.id) {
    throw new Error('Missing chat ID')
  }
  const storage = useStorage('chats')

  await storage.removeItem(body.yaci.id)

  const check = await storage.hasItem(body.yaci.id)

  if (!check) {
    return true
  } else {
    return false
  }
})
