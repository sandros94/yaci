export * from './chat'
export * from './chatVersions'

export interface YaciConfig {
  baseURL?: string,
  version?: '0.3.0',
  ollama?: {
    baseURL?: string,
    defaultModel?: string,
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

export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>
} : T
