import type {
  Chat,
  ChatVersions,
  ChatV010,
  ChatV020,
  ChatV030
} from '~/types'

export const useChatMigration = () => {
  const { version: latest } = useRuntimeConfig().public.yaci

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

  function migrateFrom020To030 (chat: ChatV020): ChatV030 {
    const messages = chat.messages?.map((message) => {
      return {
        role: message.sender === 'user' ? 'user' : 'assistant',
        content: message.sender === 'user' ? message.message.prompt : message.message.response,
        images: message.sender !== 'ai' ? undefined : null
      }
    }) || []

    if (chat.settings.system_prompt) {
      messages.unshift({
        role: 'system',
        content: chat.settings.system_prompt,
        images: null
      })
    }

    return {
      yaci: {
        version: '0.3.0',
        id: chat.id,
        title: chat.settings.title
      },
      format: 'json',
      model: chat.settings.model,
      stream: true,
      options: {
        temperature: chat.settings.temperature ?? undefined
      },
      template: chat.settings.template ?? undefined,
      messages
    }
  }

  function migrateChat (oldChat: ChatVersions): Chat {
    let newChat: ChatVersions = oldChat

    while (newChat.yaci.version !== latest) {
      if (newChat.yaci.version === 'v0.1.0' || newChat.yaci.version === '0.1.0') {
        newChat = migrateFrom010To020(newChat as ChatV010)
      } else if (newChat.yaci.version === '0.2.0') {
        newChat = migrateFrom020To030(newChat as ChatV020)
      } else if (newChat.yaci.version === '0.3.0') {
        // Uncomment the following line when you have the migration function from 0.3.0 to 0.4.0
        // newChat = migrateFrom030To040(newChat as ChatV030)
      } else {
        // If the version is not recognized, throw an error
        throw new Error(`Unrecognized version ${newChat.yaci.version} encountered during migration.`)
      }
    }

    return newChat as Chat
  }

  return {
    migrateChat
  }
}
