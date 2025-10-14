# Storyblok + Algolia + Astro Tutorial

This example demonstrates how to integrate **Algolia Search** with **Storyblok** in an **Astro** project. It is part of the Storyblok Tutorials monorepo but can also be used as a standalone Astro project.

## Overview

The project shows how to:

* Connect Storyblok content with Algolia
* Index and configure searchable attributes in Algolia
* Implement a frontend search using React InstantSearch in Astro
* Use environment variables for configuration

## Prerequisites

* A [Storyblok](https://www.storyblok.com) account
* An [Algolia](https://www.algolia.com) account
* Node.js (version 18 or higher recommended)
* pnpm, npm, or yarn

## Getting the Tutorial

This project is part of the monorepo. You can either clone the full repository or extract only this tutorial.

### Option 1: Clone the monorepo

```bash
git clone https://github.com/storyblok/tutorials.git
cd tutorials/tutorials/algolia-astro
```

### Option 2: Use Git sparse-checkout (recommended for cloning just this folder)

```bash
git init algolia-astro
cd algolia-astro
git remote add origin https://github.com/storyblok/tutorials.git
git sparse-checkout init --cone
git sparse-checkout set tutorials/algolia-astro
git pull origin main
```

### Option 3: Download only this folder

* Use [Download Directory](https://download-directory.github.io/): paste this URL:

  ```
  https://github.com/storyblok/tutorials/tree/main/tutorials/algolia-astro
  ```

  It will generate a ZIP containing only this folder.

* Or use SVN export:

```bash
svn export https://github.com/storyblok/tutorials/trunk/tutorials/algolia-astro
```

## Setup

1. **Install dependencies**

    **pnpm**

    ```bash
    pnpm install
    pnpm dev
    ```

1. **Set up environment variables**

    Copy `.env.example` to `.env` and update with your own credentials:

    ```bash
    cp .env.example .env
    ```

    **Example `.env` values:**

    ```env
    # Algolia Application ID
    PUBLIC_ALGOLIA_APP_ID="Your Algolia Application ID"

    # Algolia Search-Only API Key (safe for frontend use)
    PUBLIC_ALGOLIA_SEARCH_API_KEY="Your Algolia Search API Key"

    # Algolia Index Name
    PUBLIC_ALGOLIA_INDEX_NAME="Your Algolia Index Name"

    # Storyblok Access Token
    PUBLIC_STORYBLOK_API_KEY="Your Storyblok Access Token"
    ```

3. **Run the project**

    ```bash
    pnpm dev
    ```

    The project will start on `http://localhost:4321` by default.


## How It Works

* The **Storyblok Algolia Plugin** indexes your Storyblok content into Algolia.
* You can configure **searchable attributes**, **facets**, and **filters** directly in your Algolia dashboard.
* For this tutorial, we use the `tags` field to create a **filter/facet** under **Configuration → Facets** in Algolia.
* The frontend uses **React InstantSearch components** (`SearchBox`, `RefinementList`, `Hits`) to display search results, filters, and pagination within an Astro project.

## Learn More

* [Storyblok Documentation](https://www.storyblok.com/docs)
* [Algolia Documentation](https://www.algolia.com/doc/)
* [React InstantSearch Guide](https://www.algolia.com/doc/api-reference/widgets/react/)
* [Astro Documentation](https://docs.astro.build)
* [Example Code Repository](#) <!-- replace with your repo link if applicable -->
