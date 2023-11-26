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

  try {
    await useStorage('chats').setItem<Chat>(body.id, body)
    setResponseStatus(event, 200)
    return body
  } catch (error: any) {
    setResponseStatus(event, error.code ?? 500, error.message)
    // eslint-disable-next-line no-console
    console.error(error)
    return error
  }
})
