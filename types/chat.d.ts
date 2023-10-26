export interface OllamaResponseSingle {
  created_at: Date,
  eval_count: number,
  eval_duration: number,
  load_duration: number,
  prompt_eval_count: number,
  prompt_eval_duration: number,
  total_duration: number
  model: string,
  done: boolean,
  context: number[],
  response: string,
}

export interface UserMessage {
  prompt: string,
  created_at?: Date,
}

export interface Message {
  sender: 'user' | 'ai',
  message: UserMessage | OllamaResponseSingle,
}

export interface Chat {
  id: string,
  title: string,
  system_prompt?: string,
  temperature?: number,
  context?: number[],
  messages?: Message[],
}
