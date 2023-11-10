# YACI
YACI stands for **Y**et **A**nother **C**hat **I**nterface

(for those that know me I love silly acronyms)

Recently I started following [this great project called Ollama](https://github.com/jmorganca/ollama/) that much simplified most of the LLMs deployments I've tried so far. Since the insanely easy and fast process I decided it could have been nice use it to learn and test a few things I've been considering lately.

I would like to emphasize the fact that this is mainly a personal project, again mainly for learning and testing a few things around [Nuxt](https://nuxt.com) and [Nitro](https://nitro.unjs.io/). At the current state it is suitable only for personal/local use. If you want to put it in a production/public environment you are on your own and the sole resposible for it.

## How to use it
Copy the docker compose, and then in the same directory do:
```bash
docker compose up -d
```
Then open up a browser and navigate to YACI (defaults to [localhost:3000](http://localhost:3000)) and start chatting.

## Features
Currently what is available is pretty limited, since I'm building YACI only in my free time. But some of them are:
- [x] Server side chat storage (currently each chat is a json file).
- [x] Ability to delete the last prompt (to preserve optimum context).
- [x] Markdown rendering for both prompts and responses.
- [x] System Prompts
- [x] Tempaltes
- [x] Temperature
- [x] Manage Models

Limitations:
- Currently it is only possible to manage Models published by Ollama. Custom ones still needs to be managed via [Ollama's Rest API](https://github.com/jmorganca/ollama/blob/main/docs/api.md).
- No Langchain, only pure Rest API. But I'm planning to experiment with it in the future.
- No docs, but planned.

In the future, hopefully:
- [ ] Upload `Modelfile`s and install them
- [ ] Generate and use `Embeddings`
- [ ] Langchain
  - [ ] External resources to include in the chat

# Ollama
If you plan to access YACI and Ollama from something other than `localhost` you should configure the [`OLLAMA_ORIGINS` variable](https://github.com/jmorganca/ollama/blob/main/docs/faq.md#how-can-i-allow-additional-web-origins-to-access-ollama), as well as defining Nuxt to use the address via `NUXT_PUBLIC_YACI_OLLAMA_BASE_URL` env variable.

# Contribute

You could sponsor me if you'd like that I dedicate more of the non-free time to this project, or you could open up an Issue/PR.

If you go for the latter: clone the repo, install dependencies and start developing YACI:

```bash
# pnpm
pnpm install --frozen-lockfile && pnpm run dev
```
Remember to start an Ollama instance, easiest way is via:
```bash
docker run --env=OLLAMA_HOST=0.0.0.0 --env=OLLAMA_ORIGINS="http://192.168.1.1:*,http://HOSTNAME.local:*" --volume=ollama:/root/.ollama -p 11434:11434 --name=ollama -d ollama/ollama:latest
```
