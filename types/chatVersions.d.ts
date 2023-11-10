import {
  OllamaResponse,
  UserMessage
} from "./index";

export interface ChatV010 {
  yaci: {
    version: '0.1.0' | string, // `string` is needed because nuxt modules don't support litteral types
  },
  id: string,
  title: string,
  system_prompt?: string,
  template?: string,
  temperature?: number,
  model: string,
  context?: number[],
  messages?: (UserMessage | OllamaResponse)[],
}

export interface ChatV020 {
  yaci: {
    version: '0.2.0' | string, // `string` is needed because nuxt modules don't support litteral types
  },
  id: string,
  settings: {
    title: string,
    model: string,
    system_prompt?: string,
    temperature?: number,
    parameter?: string,
    template?: string,
  }
  context?: number[],
  messages?: (UserMessage | OllamaResponse)[],
}

export type ChatVersions = ChatV010 | ChatV020;
export type Chat = ChatV020;