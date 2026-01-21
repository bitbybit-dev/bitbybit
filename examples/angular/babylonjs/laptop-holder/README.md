# Laptop Holder Configurator - Angular + BabylonJS + Vite

This is a modern Angular 20+ project using the new Vite-based build system with BabylonJS and BitByBit.

## Features

- **Angular 20+** with standalone components
- **Vite-based build** (via @angular/build)
- **BabylonJS** for 3D rendering
- **BitByBit OCCT** for CAD geometry (loaded from CDN - no worker files needed!)
- Parametric laptop holder configurator
- Export to STEP and STL formats

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open http://localhost:4200 in your browser

## Key Differences from Old Webpack Setup

- No need for custom webpack configuration
- No local worker files (`occ.worker.ts`, `jscad.worker.ts`) - workers are loaded from CDN
- Uses `initBitByBit()` for simple kernel initialization
- Modern ESM-only setup
- Standalone Angular components
