import type { Chat } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<Chat>(event)

  if (!body.id) {
    throw new Error('Missing chat ID')
  } else if (!body.yaci.version) {
    throw new Error('Missing chat version')
  } else if (!body.settings.title) {
    throw new Error('Missing chat title')
  }
  await useStorage('chats').setItem<Chat>(body.id, body)
})
