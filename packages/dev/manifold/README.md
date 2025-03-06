## Bit By Bit Developers Manifold based CAD library

Visit [bitbybit.dev](https://bitbybit.dev) to use our full cloud platform.   
Best way to support us - [Silver or Gold plan subscription](https://bitbybit.dev/auth/pick-plan)    
Buy unique products from our [Crafts shop](https://crafts.bitbybit.dev) all designed with Bitbybit algorithms       
Check out [3D Bits app for Shopify](https://apps.shopify.com/3d-bits-1) also used in our Crafts shop   

<img src="https://app.bitbybit.dev/assets/git-cover.png" alt="Picture showing bitbybit.dev platform">

This project exposes 3D algorithms based on manifold-3d 3D CAD kernel, developed by Emmett Lalish and Chun Kit LAM, which you can find on https://github.com/elalish/manifold. Bit By Bit Developers platform integrates this kernel into it's platform via this library. Currently we try to expose Manifold library 1:1 in terms of functionality through our structured API, but as time goes we will have more unique algorithms in this package, which will be tuned specifically to our users.

This package should work in Node and browser based applications. If you want to use this package in your browser based applications we highly suggest to use @bitbybit-dev/manifold-webworker npm package, which wraps this lib into promisified non-blocking API.

## Github
https://github.com/bitbybit-dev/bitbybit/tree/master/packages/dev/manifold
## NPM
https://www.npmjs.com/package/@bitbybit-dev/manifold

## THREEJS Example Applications Using Manifold  
[Manifold Sliced Mesh](https://app-store.bitbybit.dev/manifold-sliced-mesh/)   
[Github Source Code](https://github.com/bitbybit-dev/app-examples/blob/main/webpack/threejs/src/code/manifold-sliced-mesh.ts)   

## Other THREEJS Applications   
[Vase](https://app-store.bitbybit.dev/vase)
[Github source code](https://github.com/bitbybit-dev/app-examples/tree/main/react/threejs/vase)

## Other Example Applications
[Laptop Holder](https://app-store.bitbybit.dev/laptop-holder)   
[Github Source Code Angular](https://github.com/bitbybit-dev/app-examples/tree/main/angular/laptop-holder)   
[Github Source Code React](https://github.com/bitbybit-dev/app-examples/tree/main/react/laptop-holder)   
  
[Cup Configurator](https://app-store.bitbybit.dev/cup)    
[Github Source Code](https://github.com/bitbybit-dev/app-examples/tree/main/react/cup)

## Closed Source Example Applications
[Terrace Furniture](https://app-store.bitbybit.dev/terrace-furniture)

## Build package
npm run build-p

## Run unit tests and generate test coverage
npm run test-c

## Run live unit tests and generate test coverage on save
npm run test-c-l

## Unit test coverage report online
https://tests.bitbybit.dev/threejs

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
Manifold
https://github.com/elalish/manifold