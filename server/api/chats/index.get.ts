export default defineEventHandler(async (_event) => {
  await useStorage('chats/me.json').getKeys()
})
