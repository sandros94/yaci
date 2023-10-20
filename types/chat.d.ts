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
  context: number[],
  created_at?: Date,
  prompt: string,
}

export interface Message {
  sender: string,
  message: OllamaResponseSingle | UserMessage,
}