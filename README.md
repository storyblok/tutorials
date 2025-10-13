<div align="center">
  <a href="https://www.storyblok.com?utm_source=github.com&utm_medium=readme&utm_campaign=tutorials" align="center">
    <img src="https://raw.githubusercontent.com/storyblok/.github/refs/heads/main/profile/public/github-banner.png" alt="Storyblok Logo">
  </a>
  <h1 align="center">Tutorials</h1>
  <p align="center">
    A monorepo that consolidates all official and community-contributed tutorials related to Storyblok.  
    This repository serves as a central hub for learning materials, integration examples, and step-by-step guides to help developers explore and build with Storyblok.
  </p>
</div>

<p align="center">
  <a href="https://storyblok.com/join-discord">
    <img src="https://img.shields.io/discord/700316478792138842?label=Join%20Our%20Discord%20Community&style=appveyor&logo=discord&color=8d60ff">
  </a>
  <a href="https://twitter.com/intent/follow?screen_name=storyblok">
    <img src="https://img.shields.io/badge/Follow-%40storyblok-8d60ff?style=appveyor&logo=twitter" alt="Follow @Storyblok" />
  </a>
  <a href="https://app.storyblok.com/#!/signup?utm_source=github.com&utm_medium=readme&utm_campaign=tutorials">
    <img src="https://img.shields.io/badge/Try%20Storyblok-Free-8d60ff?style=appveyor&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABGdBTUEAALGPC/xhBQAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAHqADAAQAAAABAAAAHgAAAADpiRU/AAACRElEQVRIDWNgGGmAEd3D3Js3LPrP8D8WXZwSPiMjw6qvPoHhyGYwIXNAbGpbCjbzP0MYuj0YFqMroBV/wCxmIeSju64eDNzMBJUxvP/9i2Hnq5cM1devMnz984eQsQwETeRhYWHgIcJiXqC6VHlFBjUeXgav40cIWkz1oLYXFmGwFBImaDFBHyObcOzdW4aSq5eRhRiE2dgYlpuYoYSKJi8vw3GgWnyAJIs/AuPu4scPGObd/fqVQZ+PHy7+6udPOBsXgySLDfn5GRYYmaKYJcXBgWLpsx8/GPa8foWiBhuHJIsl2DkYQqWksZkDFgP5PObcKYYff//iVAOTIDlx/QPqRMb/YSYBaWlOToZIaVkGZmAZSQiQ5OPtwHwacuo4iplMQEu6tXUZMhSUGDiYmBjylFQYvv/7x9B04xqKOnQOyT5GN+Df//8M59ASXKyMHLoyDD5JPtbj42OYrm+EYgg70JfuYuIoYmLs7AwMjIzA+uY/zjAnyWJpDk6GOFnCvrn86SOwmsNtKciVFAc1ileBHFDC67lzG10Yg0+SjzF0ownsf/OaofvOLYaDQJoQIGix94ljv1gIZI8Pv38zPvj2lQWYf3HGKbpDCFp85v07NnRN1OBTPY6JdRSGxcCw2k6sZuLVMZ5AV4s1TozPnGGFKbz+/PE7IJsHmC//MDMyhXBw8e6FyRFLv3Z0/IKuFqvFyIqAzd1PwBzJw8jAGPfVx38JshwlbIygxmYY43/GQmpais0ODDHuzevLMARHBcgIAQAbOJHZW0/EyQAAAABJRU5ErkJggg==" alt="Follow @Storyblok" />
  </a>
</p>

## 📚 Tutorials Overview

This monorepo contains official and community Storyblok tutorials.  
Each tutorial is self-contained within its own folder and includes source code, documentation, and configuration files.

| Tutorial                                                                 | Description                                                                 |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| [How to Integrate Algolia Search into Storyblok using Astro](tutorials/algolia-astro) | Learn how to connect Algolia with Storyblok in an Astro project for instant search. |
| [Build a Blog with Next.js and Storyblok](tutorials/nextjs-blog)         | Step-by-step guide to building a full-featured blog using Next.js and Storyblok. |
| [Deploy Storyblok + Nuxt Site on Netlify](tutorials/nuxt-netlify)        | Learn how to deploy your Storyblok-powered Nuxt app to Netlify.             |

> 🧩 You can copy any tutorial folder and use it as a standalone project.  
> Each tutorial includes its own `README.md` with setup instructions and explanations.

## 🧰 Structure

```

tutorials/
├── examples/
│   ├── algolia-astro/
│   ├── nextjs-blog/
│   ├── nuxt-netlify/
│   └── ...
├── package.json
├── pnpm-workspace.yaml
└── README.md

````

- Each tutorial is an isolated example project.
- Tutorials may use different frameworks (Astro, Next.js, Nuxt, etc.).
- No shared dependencies are required to copy or run individual tutorials.

## 🛠️ Development

### Prerequisites

- Node.js (v22 or later)
- pnpm (v10 or later)
- Git

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/storyblok/tutorials.git
   cd tutorials

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Explore available tutorials:

   ```bash
   cd examples/<example-folder>
   pnpm dev
   ```

## 🤝 Contributing

We welcome contributions from the community!
To add a new tutorial:

1. Create a new folder under `examples/`.
2. Include a clear and descriptive `README.md`.
3. Use consistent naming conventions and structure.
4. Submit a pull request following our [Contributing Guide](CONTRIBUTING.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

* [Storyblok Documentation](https://www.storyblok.com/docs)
* [Storyblok Website](https://www.storyblok.com)
* [Storyblok GitHub Organization](https://github.com/storyblok)
* [Storyblok Discord](https://storyblok.com/join-discord)

