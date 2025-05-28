---
slug: threejs-support
title: "ANNOUNCING ThreeJS Support: Expanding Bitbybit.dev's CAD Capabilities"
authors: [ubarevicius]
tags: [bitbybit, cad]
description: "Introducing new open-source NPM packages, @bitbybit-dev/threejs and @bitbybit-dev/babylonjs, to make 3D CAD accessible and adaptable for a broader community, including ThreeJS developers."
---

![A muscle car with two powerful engines under its hood - one representing BabylonJS and the other ThreeJS, both driven by the Bitbybit.dev platform.](https://ik.imagekit.io/bitbybit/app/assets/blog/threejs-support/bitbybit-two-engines-babylonjs-threejs.jpeg "The muscle car with two engines under the gigantic hood - BabylonJS and ThreeJS driven by Bitbybit.")

We are thrilled to announce the release of two new open-source NPM packages designed to advance our core mission: making 3D CAD (Computer-Aided Design) accessible and adaptable for a broader community of developers. These packages, **`@bitbybit-dev/threejs`** and **`@bitbybit-dev/babylonjs`**, are critical steps toward our strategic goal of democratizing access to 3D CAD technologies, and they offer significantly greater flexibility for our users.

<!--truncate-->

**Explore the New Packages:**
*   NPM: **[@bitbybit-dev/threejs](https://www.npmjs.com/package/@bitbybit-dev/threejs)**
*   NPM: **[@bitbybit-dev/babylonjs](https://www.npmjs.com/package/@bitbybit-dev/babylonjs)**
*   NPM (Core Layer): **[@bitbybit-dev/core](https://www.npmjs.com/package/@bitbybit-dev/core)**
*   GitHub: **[Bitbybit.dev Monorepo](https://github.com/bitbybit-dev/bitbybit)**

### Why We Did It: Embracing Versatility

Our main objective with these new releases is to make our CAD tools more versatile and accessible. By decoupling our core algorithmic layer from a single game engine, we are opening the door for developers to integrate Bitbybit.dev's technology with their preferred 3D rendering tools—most notably, **ThreeJS**.

This strategic move significantly broadens our reach and aligns perfectly with our vision of an open, adaptable CAD platform that meets the diverse needs of the global 3D developer community. Now, developers can leverage Bitbybit.dev's powerful CAD functionalities within their existing ThreeJS projects, or choose between ThreeJS and BabylonJS based on their project requirements.

<div class="responsive-video-container">
<iframe width="560" height="315" src="https://www.youtube.com/embed/Ozi2sbnXjHg" title="Use THREEJS Game Engine With 3D CAD Geometry Algorithms Of BITBYBIT DEV Platform" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</div>

**See it in action with ThreeJS:**
*   **Live Demo App:** [Try the "Patterns" Demo (ThreeJS)](https://app-store.bitbybit.dev/patterns/)
*   **Source Code:** [Check out the "Patterns" Demo Source Code on GitHub](https://github.com/bitbybit-dev/app-examples/blob/main/webpack/threejs/src/code/patterns.ts)

### A Quick Note on BabylonJS: It's Here to Stay!

While we are incredibly excited to bring ThreeJS compatibility to our platform, it’s important to clarify that **BabylonJS is here to stay**. BabylonJS remains a crucial and valued component in our high-level platform architecture, particularly for powering our integrated visual programming editors like Rete and Blockly, as well as our Monaco-based TypeScript editor.

For users already working within the Bitbybit.dev ecosystem, there will be no disruptions. Instead, this expansion offers them *more choices*. If they wish to integrate our CAD tools with other engines, such as ThreeJS, as their projects evolve or as they experiment with different technologies, they now have a clear and supported path to do so.

### CAD on the Browser: Our Evolving Layered Approach

From the outset, we built the Bitbybit.dev platform in a series of modular layers, balancing open-source accessibility with proprietary elements to create a powerful, flexible CAD solution. Our core algorithmic layer was initially designed with open-source ideals in mind, making it available for developers to integrate into their own projects.

However, this core layer remained deeply intertwined with the BabylonJS game engine—an integration we have always appreciated and continue to utilize extensively in our parametric design editors and internal projects. Yet, this dependency also presented challenges. It limited our ability to easily support other popular game engines and 3D libraries, which, in turn, created a barrier to our vision of a truly democratic and widely adoptable CAD platform. Recognizing the immense popularity and robust ecosystems of other engines, like ThreeJS and PlayCanvas, we decided it was time to refactor our core to make it more versatile and engine-agnostic.

### The New Packages: `@bitbybit-dev/threejs` and `@bitbybit-dev/babylonjs`

Our refactoring work has culminated in two new NPM packages that significantly enhance the flexibility and reach of the Bitbybit.dev platform:

*   **`@bitbybit-dev/threejs`**:
    This package enables seamless integration of Bitbybit.dev's CAD algorithms with ThreeJS, a widely used and beloved 3D library. This opens our platform to a vast audience of developers already familiar with and proficient in ThreeJS.
*   **`@bitbybit-dev/babylonjs`**:
    This package maintains our long-standing and robust support for BabylonJS. Developers who have already integrated Bitbybit.dev using BabylonJS can continue their work with minimal adjustments, now benefiting from the cleaner separation of concerns provided by the new architecture.

Both of these engine-specific packages rely on our **`@bitbybit-dev/core`** package. This core package now stands as a decoupled, engine-agnostic layer containing the fundamental CAD logic, data structures, and interfaces. It serves as the common foundation for each game engine integration, making it simpler for developers to potentially switch between engines if needed, or even use Bitbybit.dev in environments without a visual game engine (e.g., for backend processing or pure geometric computations).

### Current Architecture: A More Flexible Future

Our updated platform architecture reflects a more flexible, modular setup. Each game engine-specific package now connects through the common `@bitbybit-dev/core` layer, creating a streamlined, extensible structure that supports a wider range of integrations and future possibilities.

![Overview of Bitbybit.dev platform architecture, showing open-source NPM packages (@bitbybit-dev/core, @bitbybit-dev/threejs, @bitbybit-dev/babylonjs) and their relation to proprietary application levels.](https://ik.imagekit.io/bitbybit/app/assets/blog/threejs-support/npm-packages-scheme.jpeg "Overview of Bitbybit platform architecture, indicating open-source layers accessible via NPM packages and proprietary application levels.")

With these new packages, we’re excited to expand the possibilities for our users, offering them a truly flexible, developer-friendly CAD solution that empowers them to create, innovate, and build amazing 3D experiences on the web, regardless of their preferred rendering engine.