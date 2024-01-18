import { defu } from 'defu'
import { defineNuxtModule } from '@nuxt/kit'
import type { YaciConfig } from '~/types'

export default defineNuxtModule<YaciConfig>({
  meta: {
    name: 'nuxt-yaci',
    configKey: 'yaci',
    compatibility: {
      nuxt: '^3.7.0'
    }
  },
  defaults: {
    baseURL: 'http://localhost:3000',
    version: '0.2.0',
    ollama: {
      baseURL: 'http://localhost:11434',
      defaultModel: 'mistral:latest',
      defaultSystemPrompt: undefined,
      defaultTemplate: undefined,
      defaultOptions: {
        temperature: undefined,
        num_ctx: undefined
      }
    }
  },
  setup (options, nuxt) {
    // Public runtimeConfig
    nuxt.options.runtimeConfig.public.yaci = defu<YaciConfig, YaciConfig[]>(
      nuxt.options.runtimeConfig.public.yaci,
      {
        baseURL: options.baseURL,
        version: options.version,
        ollama: {
          baseURL: options.ollama.baseURL,
          defaultModel: options.ollama.defaultModel,
          defaultSystemPrompt: options.ollama.defaultSystemPrompt,
          defaultTemplate: options.ollama.defaultTemplate,
          defaultOptions: {
            temperature: options.ollama.defaultOptions?.temperature,
            num_ctx: options.ollama.defaultOptions?.num_ctx
          }
        }
      }
    )
  }
})

declare module '@nuxt/schema' {
  interface NuxtOptions {
    yaci?: YaciConfig
    runtimeConfig: {
      yaci: YaciConfig
      public: {
        yaci: YaciConfig
      }
    };
  }
}
