# Bit By Bit Developers CAD algorithms exposing OCCT code via webworker

Visit [bitbybit.dev](https://bitbybit.dev) to use our full cloud platform.   
Best way to support us - [Silver or Gold plan subscription](https://bitbybit.dev/auth/pick-plan)    
Buy unique designs from our [Crafts shop](https://crafts.bitbybit.dev)       
Check out [3D Bits app for Shopify](https://apps.shopify.com/3d-bits-1)   

<img src="https://app.bitbybit.dev/assets/git-cover.png" alt="Picture showing bitbybit.dev platform">

This project exposes core OCCT 3D algorithms of Bit By Bit Developers platform via webworker. This code is open-sourced under MIT license. This package is independent of rendering frameworks such as BabylonJS or ThreeJS. You can build your own rendering pipeline in WebGL or WebGPU. While webworkers have their implementation in Node environment, this code is meant to be used in the browser environment. For Node environment check bitbybit-occt library.

# Github
https://github.com/bitbybit-dev
# NPM
https://www.npmjs.com/package/@bitbybit-dev/occt-worker

# Example Applications
Laptop Holder  
https://app-store.bitbybit.dev/laptop-holder
Github Source Code Angular (BabylonJS) - https://github.com/bitbybit-dev/app-examples/tree/main/angular/laptop-holder  
Github Source Code React (BabylonJS) - https://github.com/bitbybit-dev/app-examples/tree/main/react/laptop-holder  
  
Cup Configurator
https://app-store.bitbybit.dev/cup
Github Source Code React (BabylonJS) - https://github.com/bitbybit-dev/app-examples/tree/main/react/cup

# Closed Source Example Applications
https://app-store.bitbybit.dev/terrace-furniture

# Build package
tsc -p tsconfig.bitbybit.json

# Run Live Unit Tests
npm run test

# Run Live Unit Tests With Coverage
npm run test-c-l

# Media Channels
Discord: https://discord.gg/GSe3VMe  
Youtube: https://www.youtube.com/@bitbybitdev?sub_confirmation=1  
Instagram: https://www.instagram.com/bitbybit.dev  
Twitter: https://twitter.com/bitbybit_dev  
LinkedIn: https://lnkd.in/gQjEQA2  
Facebook: https://www.facebook.com/bitbybitdev  
Medium: https://bitbybit-dev.medium.com/  

# Principles
Bit By Bit Developers company will keep these core algorithms that you can find in this repository free and opensource for its users. These algorithms are based on other open-source projects, run and are deployed on the browser, thus there is no point of closing them down from public.

# About Bit By Bit Developers platform
Bit By Bit Developers web platform allows creators to program geometry through simple visual programming language or choose monaco typescript editor with full intellisense of bitbybit API. This cloud platform can fulfil many practical, educational and artistic needs of its users. Through familiar programming interface used in tools such as Scratch and Blockly.Games we expose powerful 3D algorithms that make it easier to implement various parametric tasks. Our goal is to make it very simple for users to share their ideas and designs. We want to encourage everyone to engage in the future of this tool.

# Dependencies

This project is based on amazing library opencascade.js that you can find at https://ocjs.org/ and a powerful OpenCascade geometry kernel, check it at https://opencascade.com