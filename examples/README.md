# Bit By Bit Developers App Examples

<img src="https://app.bitbybit.dev/assets/git-cover.png" alt="Picture showing bitbybit.dev platform">

These app examples are meant to show how bitbybit npm packages can be used to create 3D models on the browser and on the server.
Core, babylonjs and threejs libraries work only on the browser and are dependant on many great 3D libraries. bitbybit-occt library is much more versatile and can be used both on the nodejs and browser applications.

Visit https://bitbybit.dev to use our full cloud platform.

# App Example Frameworks
We present examples with full integration for the most popular frameworks, such as Angular, React, NextJS, Nuxt, NodeJS with Express. Whenever possible we try to build a valid 3D model configurator, using either babylonjs or threejs game enegines for representation.

# Github
https://github.com/bitbybit-dev/app-examples

# NPM
BABYLONJS   
https://www.npmjs.com/package/@bitbybit-dev/babylonjs  
THREEJS   
https://www.npmjs.com/package/@bitbybit-dev/threejs  
CORE   
https://www.npmjs.com/package/@bitbybit-dev/core   
OCCT WORKER   
https://www.npmjs.com/package/@bitbybit-dev/occt-worker   
OCCT   
https://www.npmjs.com/package/@bitbybit-dev/occt   

# Example Applications

Visit this page to find a short overview of all the configurators built so far:
https://app-store.bitbybit.dev

| App | Engine | Live | Source in this repository |
| --- | --- | --- | --- |
| Patterns | Three.js | https://app-store.bitbybit.dev/patterns | [webpack/threejs/src/code/patterns.ts](./webpack/threejs/src/code/patterns.ts) |
| Laptop Holder | BabylonJS | https://app-store.bitbybit.dev/laptop-holder | [angular/babylonjs/laptop-holder](./angular/babylonjs/laptop-holder), [react/babylonjs/laptop-holder](./react/babylonjs/laptop-holder) |
| 3D Printable Vase | Three.js | https://app-store.bitbybit.dev/bitbybit-threejs | [react/threejs/vase](./react/threejs/vase) |
| Cup Configurator | BabylonJS | https://app-store.bitbybit.dev/cup | [react/babylonjs/cup](./react/babylonjs/cup) |
| Cup Configurator | Three.js | https://app-store.bitbybit.dev/cup-three | [vite/threejs/cup](./vite/threejs/cup), [webpack/threejs/src/code/cup.ts](./webpack/threejs/src/code/cup.ts) |

<img src="https://app.bitbybit.dev/assets/laptop-holder.png" alt="Laptop Holder Configurator">

Other closed-source apps we built: Terrace Furniture (BabylonJS), https://app-store.bitbybit.dev/terrace-furniture

# Verifying the examples

Every example installs the published `@bitbybit-dev` packages from the registry, the way a user
does, so the examples are the post-publish smoke of the packages. `scripts/examples.mjs` finds
every directory here with a `package.json` and runs each on its own, reporting per example:

```
npm run list               # every example, and any that verify.config.json skips (with the reason)
npm run verify             # npm ci, then npm run build, in each - Angular, Next.js and Nuxt install only
npm run verify:heavy       # the same, building those three too
npm run audit:all          # npm audit at the high level over every lockfile
npm run refresh-lockfiles  # regenerate every lockfile and apply the audit fixes it can
```

`.github/workflows/examples.yml` runs verify and the audit weekly, on every published version and
by hand, and the create-app templates' scaffold-and-install smoke beside them. It is not a
pull-request gate: nothing here builds from the repository's sources, so a pull request cannot
break it - a publish, or a dependency advisory, can. The lockfiles are what Dependabot reads for
this repository; when it reports an advisory under `examples/`, run `npm run refresh-lockfiles`
here and commit the result, bumping a direct dependency in the example's `package.json` where the
fix is outside its range. `api/dotnet-rest` is a .NET project and is outside this lane.

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

# Major Dependencies
BabylonJS, ThreeJS, OpenCascade, JSCAD, Verbnurbs, React, Angular, NextJS, Nuxt, Webpack, NodeJS