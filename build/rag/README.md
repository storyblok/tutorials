---
title:
description:
tags:
---

# Build a RAG Pipeline from Scratch

This repository includes all the code necessary to follow the Build a RAG Pipeline from Scratch tutorial, the third part of our [vector database series](https://www.storyblok.com/mp/what-s-the-big-deal-with-vector-databases).

[![Try Storyblok free](https://img.shields.io/badge/Try%20Storyblok-dad4ff.svg?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTQuNzA3IDIuNTM4aDIyLjUyOXYyMy41ODdINC43MDd6IiBzdHlsZT0iZmlsbDojZmZmIi8+PHBhdGggZmlsbD0iIzFmMWYxZiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMS43NDMgMi42MDFBMi41OTcgMi41OTcgMCAwIDEgNC4zMzUgMGgyMy4zM2EyLjU5NyAyLjU5NyAwIDAgMSAyLjU5MiAyLjYwMXYyMy40MTFhMi41OTcgMi41OTcgMCAwIDEtMi41OTIgMi42MDJIMTIuNTQ4bC0zLjg3MiAzLjIwOGEuNzcuNzcgMCAwIDEtMS4yNjEtLjU5N3YtMi42MTFoLTMuMDhhMi41OTcgMi41OTcgMCAwIDEtMi41OTItMi42MDJabTUuNjcgMi4xMjdoMTIuNDYyYzIuNjkxIDAgNC44NzMgMi4xOSA0Ljg3MyA0Ljg5IDAgMi4xNjQtMS40IDQtMy4zNDIgNC42NDRhNC44ODcgNC44ODcgMCAwIDEgMy45OSA0LjgxYzAgMi43MDEtMi4xODEgNC44OS00Ljg3MyA0Ljg5SDcuNDEzdi05LjQ1NFptMTAuMzY0IDQuNEgxMS45NXYyLjkzNGg1LjgyOGMuODA4IDAgMS40NjItLjY1NiAxLjQ2Mi0xLjQ2NyAwLS44MS0uNjU0LTEuNDY3LTEuNDYyLTEuNDY3em0tNS44MjggNi41Mmg2LjMxNGMuODk3IDAgMS42MjQuNzMgMS42MjQgMS42MyAwIC45MDEtLjcyNyAxLjYzLTEuNjI0IDEuNjNoLTYuMzE0eiIgY2xpcC1ydWxlPSJldmVub2RkIiBzdHlsZT0ic3Ryb2tlLXdpZHRoOjEuNTE3NzUiLz48L3N2Zz4K&labelColor=ffffff)](https://app.storyblok.com/#/signup?utm_source=docs)
[![Join the Storyblok Discord community](https://img.shields.io/discord/700316478792138842?style=for-the-badge&logo=discord&label=Join%20our%20community&labelColor=ffffff&color=dad4ff)](https://storyblok.com/join-discord)

## Get started

Before you start, make sure you have [Docker](https://docs.docker.com/get-docker/) and [Ollama](https://ollama.com/) installed.

### 1. Clone this project

```sh
git clone --no-checkout --depth 1 --filter=tree:0 https://github.com/storyblok/tutorials.git && cd tutorials
git sparse-checkout set --no-cone /build/rag
git checkout && cd build/rag
```

### 2. Install dependencies

```sh
npm install
```

### 3. Pull the LLM

Pull the model used for the RAG demo:

```sh
ollama pull deepseek-r1:1.5b
```

You can substitute any model supported by Ollama. Larger models (7B+) produce more reliable answers.

### 4. Start Weaviate

Spin up [Weaviate](https://weaviate.io/developers/weaviate) and a local embedding model ([all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)):

```sh
docker compose up -d
```

Once the containers initialize, verify Weaviate is running:

```sh
curl http://localhost:8080/v1/meta | jq '.version'
# Should return "1.34.5"
```

### 5. Ingest the sample data

Create the Article collection and import the sample articles:

```sh
npm run ingest
```

### 6. Run semantic searches

Try basic semantic search, conceptual search, and filtered search examples:

```sh
npm run search
```

### 7. Run the RAG pipeline

Ask a question grounded in your content:

```sh
npm run rag
```

Happy building!
