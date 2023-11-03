export * from './chat'

export interface YaciConfig {
  baseURL: string,
  version: string,
  ollama: {
    baseURL: string,
    defaultModel: string,
    defaultSystemPrompt?: string,
    defaultTemplate?: string,
    /**
     * Options based on the used model
     * @docs https://github.com/jmorganca/ollama/blob/main/docs/modelfile.md#valid-parameters-and-values
     */
    defaultOptions?: {
      temperature?: number,
      num_ctx?: number,
      [key: string]: any
    }
  }
}

export interface ModelList {
  models: {
    digest: string,
    modified_at: Date,
    name: string,
    size: number,
  }[]
}