export interface OllamaResponse {
  sender: 'ai'
  message: {
    created_at?: Date
    eval_count?: number
    eval_duration?: number
    load_duration?: number
    prompt_eval_count?: number
    prompt_eval_duration?: number
    total_duration?: number
    model: string
    done: boolean
    context?: number[]
    response: string
  }
}

export interface UserMessage {
  sender: 'user'
  message: {
    model?: string // optional because I'm handling it elsewhere
    prompt: string
    created_at?: Date
    system?: string
    template?: string
    context?: number[]
    stream?: boolean
    options?: {
      temperature?: number
      num_ctx?: number
      [key: string]: any
    }
  }
}

export interface ChatV010 {
  yaci: {
    version: '0.1.0' | string, // `string` is needed because nuxt modules don't support litteral types
  }
  id: string
  title: string
  system_prompt?: string
  template?: string
  temperature?: number
  model: string
  context?: number[]
  messages?: (UserMessage | OllamaResponse)[]
}

export interface ChatV020 {
  yaci: {
    version: '0.2.0' | string, // `string` is needed because nuxt modules don't support litteral types
  }
  id: string
  settings: {
    title: string
    model: string
    system_prompt?: string
    temperature?: number
    parameter?: string
    template?: string
  }
  context?: number[]
  messages?: (UserMessage | OllamaResponse)[]
}

export interface MessageV030System {
  role: 'system'
  content: string
  images?: string[]
}

export interface MessageV030User {
  role: 'user'
  content: string
  images?: string[]
}

export interface ResponseV030Assistant {
  model: string
  created_at: Date
  message: {
    role: 'assistant'
    content: string
    images: null
  },
  done: boolean
  total_duration?: number,
  load_duration?: number,
  prompt_eval_count?: number,
  prompt_eval_duration?: number,
  eval_count?: number,
  eval_duration?: number
}

export interface ChatV030 {
  yaci: {
    version: '0.3.0' | string, // `string` is needed because nuxt modules don't support litteral types
    id: string
    title: string
  }
  model: string
  messages?: (MessageV030System | MessageV030User | MessageV030Assistant['message'])[]
  format: 'json'
  options?: {
    mirostat?: number
    mirostat_eta?: number
    mirostat_tau?: number
    num_ctx?:	number
    num_gpu?:	number
    num_gqa?:	number
    num_predict?:	number
    num_thread?: number
    repeat_last_n?:	number
    repeat_penalty?: number
    seed?: number
    stop?: string
    temperature?:	number
    tfs_z?:	number
    top_k?:	number
    top_p?:	number
  }
  template?: string
  stream: boolean
}

export type ChatVersions = ChatV010 | ChatV020 | ChatV030
