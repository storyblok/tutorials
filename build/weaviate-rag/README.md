# Build a RAG Pipeline with Weaviate and Ollama

This repository includes all the code necessary to follow the [From Search Engine to AI Assistant](https://www.storyblok.com/) tutorial, the third part of our vector database series.

[![Try Storyblok free](https://img.shields.io/badge/Try%20Storyblok-dad4ff.svg?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTQuNzA3IDIuNTM4aDIyLjUyOXYyMy41ODdINC43MDd6IiBzdHlsZT0iZmlsbDojZmZmIi8+PHBhdGggZmlsbD0iIzFmMWYxZiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMS43NDMgMi42MDFBMi41OTcgMi41OTcgMCAwIDEgNC4zMzUgMGgyMy4zM2EyLjU5NyAyLjU5NyAwIDAgMSAyLjU5MiAyLjYwMXYyMy40MTFhMi41OTcgMi41OTcgMCAwIDEtMi41OTIgMi42MDJIMTIuNTQ4bC0zLjg3MiAzLjIwOGEuNzcuNzcgMCAwIDEtMS4yNjEtLjU5N3YtMi42MTFoLTMuMDhhMi41OTcgMi41OTcgMCAwIDEtMi41OTItMi42MDJabTUuNjcgMi4xMjdoMTIuNDYyYzIuNjkxIDAgNC44NzMgMi4xOSA0Ljg3MyA0Ljg5IDAgMi4xNjQtMS40IDQtMy4zNDIgNC42NDRhNC44ODcgNC44ODcgMCAwIDEgMy45OSA0LjgxYzAgMi43MDEtMi4xODEgNC44OS00Ljg3MyA0Ljg5SDcuNDEzdi05LjQ1NFptMTAuMzY0IDQuNEgxMS45NXYyLjkzNGg1LjgyOGMuODA4IDAgMS40NjItLjY1NiAxLjQ2Mi0xLjQ2NyAwLS44MS0uNjU0LTEuNDY3LTEuNDYyLTEuNDY3em0tNS44MjggNi41Mmg2LjMxNGMuODk3IDAgMS42MjQuNzMgMS42MjQgMS42MyAwIC45MDEtLjcyNyAxLjYzLTEuNjI0IDEuNjNoLTYuMzE0eiIgY2xpcC1ydWxlPSJldmVub2RkIiBzdHlsZT0ic3Ryb2tlLXdpZHRoOjEuNTE3NzUiLz48L3N2Zz4K&labelColor=ffffff)](https://app.storyblok.com/#/signup?utm_source=docs)
[![Join the Storyblok Discord community](https://img.shields.io/discord/700316478792138842?style=for-the-badge&logo=discord&label=Join%20our%20community&labelColor=ffffff&color=dad4ff)](https://storyblok.com/join-discord)

## What you'll build

A fully local Retrieval-Augmented Generation (RAG) pipeline that turns the semantic search engine from [Part 2](https://github.com/storyblok/tutorials/tree/main/build/weaviate) into an AI assistant grounded in your content. You'll learn how to:

- Run an LLM locally with Ollama (no API keys, no cloud dependencies)
- Combine vector similarity with BM25 keyword matching (hybrid search)
- Chunk long documents by markdown headers to beat embedding dilution
- Ground an LLM's answers in retrieved context with a solid system prompt
- Stream tokens as they're generated for a real-assistant feel
- Add a relevance threshold so the pipeline declines off-topic questions instead of hallucinating

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Node.js](https://nodejs.org/) v18 or higher
- [Ollama](https://ollama.com/download) installed locally

## Get started

### 1. Clone this project

```sh
git clone --no-checkout --depth 1 --filter=tree:0 https://github.com/storyblok/tutorials.git && cd tutorials
git sparse-checkout set --no-cone /build/weaviate-rag
git checkout && cd build/weaviate-rag
```

### 2. Install dependencies

```sh
npm install
```

### 3. Start Weaviate

This spins up Weaviate and a local embedding model (all-MiniLM-L6-v2):

```sh
docker compose up -d
```

### 4. Pull the Ollama model

```sh
ollama pull qwen3.5:4b
```

Sanity-check that Ollama is reachable from Node.js:

```sh
npm run test-ollama
```

### 5. Create the collection and ingest whole articles

```sh
npm run create-collection
npm run ingest
```

### 6. Compare pure vector vs hybrid search

```sh
npm run search -- "v4"
```

You should see BM25 surface `Introducing Storyblok CLI v4` while pure vector search misses it.

### 7. Ask a question

```sh
npm run ask -- "How do I set up Storyblok with Next.js?"
```

You can pass a different model as a second argument, e.g. `npm run ask -- "…" "qwen3.5:9b"`.

### 8. Re-ingest as header-based chunks

```sh
npm run ingest-chunks
```

### 9. Compare whole-article RAG vs chunked RAG

```sh
npm run compare-chunking -- "How do I set up Storyblok with Next.js?"
```

Same question, same model, two retrieval strategies — shows why chunking beats whole-document embeddings.

## Project structure

```
weaviate-rag/
├── docker-compose.yml            # Weaviate + transformer model setup
├── package.json                  # Dependencies and scripts
├── data/
│   └── articles.json             # Sample blog articles (20 DEV.to posts)
└── scripts/
    ├── 0-test-ollama.js          # Sanity check for Ollama
    ├── 1-create-collection.js    # Article schema
    ├── 2-ingest.js               # Whole-article ingestion
    ├── 3-ingest-chunks.js        # Header-based chunking + ingestion
    ├── 4-search.js               # nearText vs hybrid comparison
    ├── 5-ask.js                  # Full RAG pipeline (retrieve → augment → generate)
    └── 6-compare-chunking.js     # Whole-article RAG vs chunked RAG, side by side
```

## Stopping Weaviate

```sh
docker compose down
```

To also remove the persisted data:

```sh
docker compose down -v
```

## Related resources

- [What's the Big Deal with Vector Databases?](https://www.storyblok.com/mp/what-s-the-big-deal-with-vector-databases) (Part 1)
- [Build a Semantic Search Engine from Scratch](https://www.storyblok.com/mp/build-a-semantic-search-engine-from-scratch) (Part 2)
- [Weaviate hybrid search](https://docs.weaviate.io/weaviate/search/hybrid)
- [Ollama JavaScript client](https://github.com/ollama/ollama-js)

Happy building!
