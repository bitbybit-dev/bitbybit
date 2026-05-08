# @bitbybit-dev/create-app

🚀 **CLI tool to scaffold Bit By Bit Developers 3D/CAD projects — browser-based frontend apps and CAD Cloud backend projects**

Create stunning 3D/CAD applications with ease using our powerful geometry kernels: OCCT (OpenCascade), JSCAD, and Manifold. Or scaffold a full-stack project that connects to our [CAD Cloud API](https://learn.bitbybit.dev/api/cloud-api) for server-side model generation and file conversion.

## Quick Start

### Using npm init (Recommended)

```bash
npm init @bitbybit-dev/app my-project
```

### Using npx

```bash
npx @bitbybit-dev/create-app my-project
```

## Usage

### Interactive Mode

Simply run the command without options to enter interactive mode:

```bash
npm init @bitbybit-dev/app my-project
```

You'll be prompted to select:
- 📦 **App Type**: Frontend (browser 3D app) or Cloud (backend + frontend for CAD Cloud API)
- 🎮 **Game Engine** (frontend): Three.js, Babylon.js, or PlayCanvas
- ⚙️ **OCCT Architecture** (frontend): 32-bit, 64-bit, or 64-bit Multi-threaded
- 🖥️ **Backend Template** (cloud): Hono + SDK, Hono + REST, Node.js + SDK, Node.js + REST, or .NET + REST

### CLI Options

```bash
npm init @bitbybit-dev/app my-project --engine threejs --occt-architecture 32
```

Available engines:
- `threejs` - Three.js: Lightweight and flexible 3D library
- `babylonjs` - Babylon.js: Powerful and feature-rich game engine  
- `playcanvas` - PlayCanvas: Fast and lightweight WebGL game engine

Available OCCT architectures:
- `32` - 32-bit (Default): Supported on all browsers
- `64` - 64-bit: May not be supported on all browsers (requires WebAssembly Memory64)
- `64-mt` - 64-bit Multi-threaded: Requires special server configuration (COOP/COEP headers)

### OCCT Architecture Notes

**32-bit (Default)**: Works on all browsers and is recommended for maximum compatibility.

**64-bit**: Uses WebAssembly Memory64, which may not be available in older browsers. Use this when you need to work with larger CAD models that exceed 32-bit memory limits.

**64-bit Multi-threaded**: Enables parallel processing using WebAssembly threads. Requires your server to send the following headers:
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

When you select 64-bit MT, a `vite.config.ts` is automatically created with these headers pre-configured for development.

## What You Get

### Frontend Projects

Each scaffolded frontend project includes:

- ⚡ **Vite** - Lightning fast build tool
- 📘 **TypeScript** - Type-safe development
- 🎨 **Bitbybit** - All geometry kernels pre-configured:
  - **OCCT** (OpenCascade) - Professional CAD kernel
  - **JSCAD** - Programmatic solid modeling
  - **Manifold** - Fast mesh boolean operations
- 🎮 **Your chosen 3D engine** - Three.js, Babylon.js, or PlayCanvas

### Cloud Projects

Each scaffolded cloud project includes:

- 🖥️ **Your chosen backend** - Hono (Cloudflare Workers), Express 5 (Node.js), or ASP.NET Core (.NET 10)
- 🌐 **React + Three.js frontend** - shared across all backends for visualizing CAD results
- 🔑 **Secure API key handling** - keys stay on the server; the frontend proxies requests through your backend
- 📘 **TypeScript SDK or raw REST** - depending on your chosen template
- 📖 **Ready-to-run examples** - model generation, CAD pipelines, file conversion, and file uploads

## After Scaffolding

Navigate to your project and start developing:

```bash
cd my-project
npm install
npm run dev
```

## Project Structure

```
my-project/
├── index.html
├── package.json
├── tsconfig.json
├── public/
│   └── vite.svg
└── src/
    ├── main.ts
    ├── style.css
    └── vite-env.d.ts
```

## Links

- 🌐 **Website**: [https://bitbybit.dev](https://bitbybit.dev)
- 📚 **Documentation**: [https://bitbybit.dev/docs](https://bitbybit.dev/docs)
- 💬 **Discord Community**: [https://discord.gg/GSe3VMe](https://discord.gg/GSe3VMe)
- 🐛 **Issues**: [https://github.com/bitbybit-dev/bitbybit/issues](https://github.com/bitbybit-dev/bitbybit/issues)

## Support Us

⭐ **The best way to support Bit By Bit Developers is with a Silver or Gold plan subscription!**

[Subscribe Now](https://bitbybit.dev/auth/pick-plan)

## License

MIT © [Bit By Bit Developers](https://bitbybit.dev)
