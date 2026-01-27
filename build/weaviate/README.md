---
title: 
description: 
tags: 
---

# Build a Semantic Search Engine from Scratch

This repository includes all the code necessary to follow the [Build a Semantic Search Engine from Scratch](https://www.storyblok.com/mp/build-a-semantic-search-engine-from-scratch) tutorial, the second part of our [vector database series](https://www.storyblok.com/mp/what-s-the-big-deal-with-vector-databases).

[![Try Storyblok free](https://img.shields.io/badge/Try%20Storyblok-dad4ff.svg?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTQuNzA3IDIuNTM4aDIyLjUyOXYyMy41ODdINC43MDd6IiBzdHlsZT0iZmlsbDojZmZmIi8+PHBhdGggZmlsbD0iIzFmMWYxZiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMS43NDMgMi42MDFBMi41OTcgMi41OTcgMCAwIDEgNC4zMzUgMGgyMy4zM2EyLjU5NyAyLjU5NyAwIDAgMSAyLjU5MiAyLjYwMXYyMy40MTFhMi41OTcgMi41OTcgMCAwIDEtMi41OTIgMi42MDJIMTIuNTQ4bC0zLjg3MiAzLjIwOGEuNzcuNzcgMCAwIDEtMS4yNjEtLjU5N3YtMi42MTFoLTMuMDhhMi41OTcgMi41OTcgMCAwIDEtMi41OTItMi42MDJabTUuNjcgMi4xMjdoMTIuNDYyYzIuNjkxIDAgNC44NzMgMi4xOSA0Ljg3MyA0Ljg5IDAgMi4xNjQtMS40IDQtMy4zNDIgNC42NDRhNC44ODcgNC44ODcgMCAwIDEgMy45OSA0LjgxYzAgMi43MDEtMi4xODEgNC44OS00Ljg3MyA0Ljg5SDcuNDEzdi05LjQ1NFptMTAuMzY0IDQuNEgxMS45NXYyLjkzNGg1LjgyOGMuODA4IDAgMS40NjItLjY1NiAxLjQ2Mi0xLjQ2NyAwLS44MS0uNjU0LTEuNDY3LTEuNDYyLTEuNDY3em0tNS44MjggNi41Mmg2LjMxNGMuODk3IDAgMS42MjQuNzMgMS42MjQgMS42MyAwIC45MDEtLjcyNyAxLjYzLTEuNjI0IDEuNjNoLTYuMzE0eiIgY2xpcC1ydWxlPSJldmVub2RkIiBzdHlsZT0ic3Ryb2tlLXdpZHRoOjEuNTE3NzUiLz48L3N2Zz4K&labelColor=ffffff)](https://app.storyblok.com/#/signup?utm_source=docs)
[![Join the Storyblok Discord community](https://img.shields.io/discord/700316478792138842?style=for-the-badge&logo=discord&label=Join%20our%20community&labelColor=ffffff&color=dad4ff)](https://storyblok.com/join-discord)

## Get started

Before you start, make sure you have [Docker](https://docs.docker.com/get-docker/) installed and running.

### 1. Clone this project

```sh
git clone --no-checkout --depth 1 --filter=tree:0 https://github.com/storyblok/tutorials.git && cd tutorials
git sparse-checkout set --no-cone /build/weaviate
git checkout && cd build/weaviate
```

### 2. Install dependencies

```sh
npm install
```

### 3. Start Weaviate

Spin up [Weaviate](https://weaviate.io/developers/weaviate) and a local embedding model ([all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)):

```sh
docker compose up -d
```

Once the containers initialize, verify Weaviate is running:

```sh
curl http://localhost:8080/v1/meta | jq '.version'
# Should return "1.34.5"
```

### 4. Create the collection

Set up the Article schema with vectorization configuration:

```sh
npm run create-collection
```

### 5. Ingest the sample data

Import the sample articles into Weaviate:

```sh
npm run ingest
```

### 6. Run semantic searches

Try the search examples (basic search, conceptual search, filtered search):

```sh
npm run search
```

Happy building!
