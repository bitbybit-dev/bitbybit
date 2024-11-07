## Bit By Bit Developers monorepo

<img src="https://app.bitbybit.dev/assets/git-cover.png" alt="Picture showing bitbybit.dev platform">

This git repo contains multiple bitbybit packages and contains code for 3D algorithms of Bit By Bit Developers platform which are open-sourced under MIT license. This library was previously UI dependant and was heaviy intertwined with BabylonJS game engine. It is now decoupled from our editors to ensure protection of our corporate identity and cloud services. BabylonJS layer is now also separated into special package @bitbybit-dev/babylonjs - this will cause the breaking change in v0.18.0. If you are using the version prior to v0.18.0 and depend on the @bitbybit-dev/core package, please consider updating to use @bitbybit-dev/babylonjs NPM package. @bitbybit-dev/core is now game engine independent layer.

Visit https://bitbybit.dev to use our full cloud platform.

## Github
https://github.com/bitbybit-dev/bitbybit  
## NPM Packages
https://www.npmjs.com/package/@bitbybit-dev/babylonjs
https://www.npmjs.com/package/@bitbybit-dev/threejs
https://www.npmjs.com/package/@bitbybit-dev/core

## Example Applications
Laptop Holder   
https://app-store.bitbybit.dev/laptop-holder    
Github Source Code Angular - https://github.com/bitbybit-dev/app-examples/tree/main/angular/laptop-holder
Github Source Code React - https://github.com/bitbybit-dev/app-examples/tree/main/react/laptop-holder
  
Cup Configurator    
https://app-store.bitbybit.dev/cup
Github Source Code - https://github.com/bitbybit-dev/app-examples/tree/main/react/cup  

## Closed Source Example Applications
https://app-store.bitbybit.dev/terrace-furniture

## Build package
tsc -p tsconfig.bitbybit.json  

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
BabylonJS, Rete, Blockly, OpenCascade, JSCAD, Verbnurbs