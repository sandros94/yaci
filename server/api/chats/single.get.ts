import type { Chat } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<Chat>(event)

  if (!body.id) {
    throw new Error('Missing chat ID')
  }
  await useStorage('chats/me.json').getItem<Chat>(body.id)
})
