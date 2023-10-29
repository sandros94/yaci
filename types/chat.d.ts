export interface OllamaResponseSingle {
  sender: 'ai',
  message: {
    created_at?: Date,
    eval_count?: number,
    eval_duration?: number,
    load_duration?: number,
    prompt_eval_count?: number,
    prompt_eval_duration?: number,
    total_duration?: number
    model: string,
    done: boolean,
    context?: number[],
    response: string,
  }
}

export interface UserMessage {
  sender: 'user',
  message: {
    prompt: string,
    created_at?: Date,
  }
}

export interface Chat {
  yaci: {
    version: string,
  },
  id: string,
  title: string,
  system_prompt?: string,
  temperature?: number,
  model: string,
  context?: number[],
  messages?: (UserMessage | OllamaResponseSingle)[],
}
