# @bitbybit-dev/create-app

🚀 **CLI tool to scaffold Bit By Bit Developers 3D/CAD projects with your favorite game engine**

Create stunning 3D/CAD applications with ease using our powerful geometry kernels: OCCT (OpenCascade), JSCAD, and Manifold.

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
- 🎮 **Game Engine**: Three.js, Babylon.js, or PlayCanvas

### CLI Options

```bash
npm init @bitbybit-dev/app my-project --engine threejs
```

Available engines:
- `threejs` - Three.js: Lightweight and flexible 3D library
- `babylonjs` - Babylon.js: Powerful and feature-rich game engine  
- `playcanvas` - PlayCanvas: Fast and lightweight WebGL game engine

## What You Get

Each scaffolded project includes:

- ⚡ **Vite** - Lightning fast build tool
- 📘 **TypeScript** - Type-safe development
- 🎨 **Bitbybit** - All geometry kernels pre-configured:
  - **OCCT** (OpenCascade) - Professional CAD kernel
  - **JSCAD** - Programmatic solid modeling
  - **Manifold** - Fast mesh boolean operations
- 🎮 **Your chosen 3D engine** - Three.js, Babylon.js, or PlayCanvas

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
