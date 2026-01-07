# Bitbybit Monorepo

This git repo contains multiple bitbybit packages and code for core 3D algorithms of Bitbybit platform which are open-sourced under MIT license.

# [FULL PLATFORM AT BITBYBIT.DEV](https://bitbybit.dev)   
# [LEARN BITBYBIT](https://learn.bitbybit.dev)   

Essential introduction by Matas   
[![Introduction by Matas Ubarevicius](https://img.youtube.com/vi/noc6Rg6tMe0/maxresdefault.jpg)](https://www.youtube.com/watch?v=noc6Rg6tMe0)

<img src="https://app.bitbybit.dev/assets/git-cover.png" alt="Picture showing bitbybit.dev platform">

## SUPPORT THE MISSION
Best way to support us - [Silver or Gold plan subscription](https://bitbybit.dev/auth/pick-plan)    
Check out [3D Bits app for Shopify](https://apps.shopify.com/3d-bits-1) also used in our Crafts shop   
Buy unique products from our [Crafts shop](https://crafts.bitbybit.dev) all designed with Bitbybit algorithms       

Your contributions allow this project to exist.

## Important Topics
[Getting Started With Bitbybit Platform](https://learn.bitbybit.dev/learn/getting-started/overview)     
[Integrate With ThreeJS](https://learn.bitbybit.dev/learn/npm-packages/threejs)     
[Integrate With BabylonJS](https://learn.bitbybit.dev/learn/npm-packages/babylonjs)     
[Bitbybit Runners](https://learn.bitbybit.dev/learn/runners)    
[Bitbybit Blog](https://learn.bitbybit.dev/blog)        
[3D Bits App For Shopify](https://learn.bitbybit.dev/learn/3d-bits/intro)
[Unit Testing Approach](https://learn.bitbybit.dev/learn/github/unit-tests)        
[Live Unit Test Coverage](https://learn.bitbybit.dev/learn/github/live-unit-test-coverage)          

## Github
https://github.com/bitbybit-dev/bitbybit  

## NPM Packages

[@bitbybit-dev/babylonjs](https://www.npmjs.com/package/@bitbybit-dev/babylonjs)   
BabylonJS game engine integration that allows easy drawing of geometry constructed by JSCAD, Manifold and OCCT kernels.   
[@bitbybit-dev/threejs](https://www.npmjs.com/package/@bitbybit-dev/threejs)   
ThreeJS game engine integration that allows easy drawing of geometry constructed by JSCAD, Manifold and OCCT kernels.   
[@bitbybit-dev/playcanvas](https://www.npmjs.com/package/@bitbybit-dev/playcanvas)   
PlayCanvas game engine integration that allows easy drawing of geometry constructed by JSCAD, Manifold and OCCT kernels.   
[@bitbybit-dev/core](https://www.npmjs.com/package/@bitbybit-dev/core)   
Assembles various packages and provides additional features that may combine all CAD kernels   
[@bitbybit-dev/jscad](https://www.npmjs.com/package/@bitbybit-dev/jscad)   
Wraps JSCAD with additional algorithms offered by bitbybit.dev   
[@bitbybit-dev/jscad-worker](https://www.npmjs.com/package/@bitbybit-dev/jscad-worker)   
Exposes @bitbybit-dev/jscad package via webworker and makes all calls asynchronouse and non-blocking   
[@bitbybit-dev/manifold](https://www.npmjs.com/package/@bitbybit-dev/manifold)   
Wraps MANIFOLD with additional algorithms offered by bitbybit.dev   
[@bitbybit-dev/manifold-worker](https://www.npmjs.com/package/@bitbybit-dev/manifold-worker)   
Exposes @bitbybit-dev/manifold package via webworker and makes all calls asynchronouse and non-blocking   
[@bitbybit-dev/occt](https://www.npmjs.com/package/@bitbybit-dev/occt)   
Wraps OpenCascade with additional algorithms offered by bitbybit.dev   
[@bitbybit-dev/occt-worker](https://www.npmjs.com/package/@bitbybit-dev/occt-worker)   
Exposes @bitbybit-dev/occt package via webworker and makes all calls asynchronouse and non-blocking      
[@bitbybit-dev/base](https://www.npmjs.com/package/@bitbybit-dev/base)   
Contains various base algorithms used in all other layers, such as vector math.   

To understand the structure of these packages better we provided this diagram:

## NPM Package Architecture
<img src="https://app.bitbybit.dev/assets/npm-package-architecture.jpeg" alt="Schematic diagram showing the architecture of all NPM packages">

## Example Applications
Laptop Holder   
https://app-store.bitbybit.dev/laptop-holder    
Github Source Code Angular   
https://github.com/bitbybit-dev/app-examples/tree/main/angular/laptop-holder   
Github Source Code React   
https://github.com/bitbybit-dev/app-examples/tree/main/react/laptop-holder   
  
Cup Configurator    
https://app-store.bitbybit.dev/cup   
Github Source Code   
https://github.com/bitbybit-dev/app-examples/tree/main/react/cup  

## Closed Source Example Applications
https://app-store.bitbybit.dev/terrace-furniture   

## Media Channels
Discord: https://discord.gg/GSe3VMe  
Youtube: https://www.youtube.com/@bitbybitdev?sub_confirmation=1  
Instagram: https://www.instagram.com/bitbybit.dev  
Twitter: https://twitter.com/bitbybit_dev  
LinkedIn: https://lnkd.in/gQjEQA2  
Facebook: https://www.facebook.com/bitbybitdev  
Medium: https://bitbybit-dev.medium.com/  

## Principles
Bit By Bit Developers company will keep these core algorithms that you can find in this repository free and opensource for its users. These algorithms are based on other open-source projects, run and are deployed on the browser, thus there is no point of closing them down from public.

## About Bit By Bit Developers platform
Bit By Bit Developers web platform allows creators to program geometry through simple visual programming language or choose monaco typescript editor with full intellisense of bitbybit API. This cloud platform can fulfil many practical, educational and artistic needs of its users. Through familiar programming interface used in tools such as Scratch and Blockly.Games we expose powerful 3D algorithms that make it easier to implement various parametric tasks. Our goal is to make it very simple for users to share their ideas and designs. We want to encourage everyone to engage in the future of this tool.

# Development Setup

## Contributions

If you're interested in contributing please check our [Contribution guidelines](https://github.com/bitbybit-dev/bitbybit/blob/master/CONTRIBUTING.md) & [code of conduct](https://github.com/bitbybit-dev/bitbybit/blob/master/CODE_OF_CONDUCT.md)

## First Time Setup and Testing

For first-time developers working on this project, follow these steps to set up the development environment and run all unit tests:

### Prerequisites
- Node.js (v16 or higher recommended)
- npm (comes with Node.js)
- Git

### Quick Start
1. Clone the repository:
   ```bash
   git clone https://github.com/bitbybit-dev/bitbybit.git
   cd bitbybit
   ```

2. Run the complete first-time setup (this will install all dependencies, build all packages, and run all unit tests):
   ```bash
   npm run first-time-setup
   ```

### Available Commands

- `npm run first-time-setup` - Complete setup for new developers (installs dependencies, builds packages, runs tests)
- `npm run setup` - Install dependencies and build all packages without running tests
- `npm run setup-and-test` - Install dependencies, build packages, and run all unit tests
- `npm run test` - Run all unit tests (requires packages to be built first)
- `npm run ci-packages` - Install dependencies for all packages
- `npm run build-packages` - Build all packages
- `npm run rebuild-all-packages` - Clean and rebuild all packages

### Running Individual Package Tests
You can also run tests for individual packages:
- `npm run test-base` - Test base package
- `npm run test-occt` - Test OCCT package  
- `npm run test-core` - Test core package
- `npm run test-jscad` - Test JSCAD package
- `npm run test-manifold` - Test Manifold package
- `npm run test-threejs` - Test ThreeJS package
- `npm run test-playcanvas` - Test PlayCanvas package
- `npm run test-babylonjs` - Test BabylonJS package

### Troubleshooting
If you encounter issues during setup:
1. Make sure you have Node.js v16+ installed
2. Clear npm cache: `npm cache clean --force`
3. Delete node_modules and package-lock.json, then run `npm install`

## Major Dependencies
BabylonJS, ThreeJS, PlayCanvas, OpenCascade, Manifold, JSCAD, Verbnurbs