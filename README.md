# YACI

# Ollama
If you plan to access YACI and Ollama from something other than `localhost` you should configure the [`OLLAMA_ORIGINS` variable](https://github.com/jmorganca/ollama/blob/main/docs/faq.md#how-can-i-allow-additional-web-origins-to-access-ollama), as well as defining Nuxt to use the address via `NUXT_PUBLIC_YACI_OLLAMA_BASE_URL` env variable.

## Start Ollama via Docker with `OLLAMA_ORIGINS`
```bash
docker run --env=OLLAMA_HOST=0.0.0.0 --env=OLLAMA_ORIGINS="http://192.168.1.1:*,http://HOSTNAME.local:*" --volume=ollama:/root/.ollama -p 11434:11434 --name=ollama -d ollama/ollama:latest
```

# Contribute

Install the dependencies and start developing YACI:

```bash
# pnpm
pnpm install --frozen-lockfile && pnpm run dev
```
