import type {
  MessageV030System,
  MessageV030User,
  ResponseV030Assistant,
  ChatV030
} from '~/types/chatVersions'

export type MessageSystem = MessageV030System
export type MessageUser = MessageV030User
export type ResponseAssistant = ResponseV030Assistant

export type Message = MessageSystem | MessageUser | MessageAssistant

export type Chat = ChatV030
