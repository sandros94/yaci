export interface OllamaResponse {
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
    model?: string, // optional because I'm handling it elsewhere
    prompt: string,
    created_at?: Date,
    system?: string,
    template?: string,
    context?: number[],
    stream?: boolean,
    options?: {
      temperature?: number,
      num_ctx?: number,
      [key: string]: any
    }
  }
}

