# Bitbybit Monorepo

This git repo contains multiple bitbybit packages and code for core 3D algorithms of Bitbybit platform which are open-sourced under MIT license.

# [FULL PLATFORM AT BITBYBIT.DEV](https://bitbybit.dev)   
# [LEARN BITBYBIT](https://learn.bitbybit.dev)   

Essential introduction by Matas   
[![Introduction by Matas Ubarevicius](https://img.youtube.com/vi/noc6Rg6tMe0/maxresdefault.jpg)](https://www.youtube.com/watch?v=noc6Rg6tMe0)

<img src="https://app.bitbybit.dev/assets/git-cover.png" alt="Picture showing bitbybit.dev platform">

## SUPPORT THE MISSION
Best way to support us - [Silver or Gold plan subscription](https://bitbybit.dev/auth/pick-plan)    
Buy unique products from our [Crafts shop](https://crafts.bitbybit.dev) all designed with Bitbybit algorithms       
Check out [3D Bits app for Shopify](https://apps.shopify.com/3d-bits-1) also used in our Crafts shop   

Your contributions allow this project to exist.

## HISTORY

This library was previously UI dependant and was heaviy intertwined with BabylonJS game engine. It is now decoupled from our editors to ensure protection of our corporate identity and cloud services. BabylonJS layer is now also separated into special package @bitbybit-dev/babylonjs - this will cause the breaking change in v0.18.0. If you are using the version prior to v0.18.0 and depend on the @bitbybit-dev/core package, please consider updating to use @bitbybit-dev/babylonjs NPM package. @bitbybit-dev/core is now game engine independent layer.


## Github
https://github.com/bitbybit-dev/bitbybit  

## NPM Packages

[@bitbybit-dev/babylonjs](https://www.npmjs.com/package/@bitbybit-dev/babylonjs)   
BabylonJS game engine integration that allows easy drawing of geometry constructed by JSCAD, Manifold and OCCT kernels.   
[@bitbybit-dev/threejs](https://www.npmjs.com/package/@bitbybit-dev/threejs)   
ThreeJS game engine integration that allows easy drawing of geometry constructed by JSCAD, Manifold and OCCT kernels.   
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

## Major Dependencies
BabylonJS, ThreeJS, OpenCascade, Manifold, JSCAD, Verbnurbs