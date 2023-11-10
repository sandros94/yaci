import type { ChatV010, ChatV020 } from '~/types'

type Chat = ChatV010 | ChatV020

export const useChatMigration = () => {
  function migrateFrom010To020 (chat: ChatV010): ChatV020 {
    return {
      yaci: {
        version: '0.2.0'
      },
      id: chat.id,
      settings: {
        title: chat.title,
        model: chat.model,
        system_prompt: chat.system_prompt ?? undefined,
        temperature: chat.temperature ?? undefined,
        parameter: chat.template ?? undefined,
        template: chat.template ?? undefined
      },
      context: chat.context ?? undefined,
      messages: chat.messages ?? undefined
    }
  }

  function migrateChat (oldChat: Chat) {
    let newChat: Chat = oldChat

    if (oldChat.yaci.version === 'v0.1.0' || oldChat.yaci.version === '0.1.0') {
      newChat = migrateFrom010To020(newChat as ChatV010)
    }

    // Placeolder for future migrations
    // if (oldChat.yaci.version === '0.2.0') {
    //   newChat = migrateFrom020To030(newChat as ChatV020)
    // }

    if (oldChat.yaci.version !== newChat.yaci.version) {
      return newChat
    } else {
      return null
    }
  }

  return {
    migrateChat
  }
}
