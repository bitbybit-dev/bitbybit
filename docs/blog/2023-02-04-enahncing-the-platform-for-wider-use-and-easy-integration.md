---
slug: enahncing-the-platform-for-wider-use-and-easy-integration
title: ENHANCING THE PLATFORM FOR WIDER USE AND EASY INTEGRATION
authors: [ubarevicius]
tags: [bitbybit, cloud]
---

![Example of the THREEJS app using our opensource libraries](https://ik.imagekit.io/bitbybit/app/assets/blog/cad-democratisation/bitbybit-npm-packages-web-technologies.png)

In our recent platform update we split our codebase into reusable packages and published them under MIT License for everyone to use. This article will introduce you to the packages and show you how you can use them to create your own 3D applications.

<!-- truncate -->

Some of the web technologies where you can integrate Bit By Bit Developers CAD algorithms

Many Computer-Aided Design (CAD) products have been developed as proprietary systems that run only on specific platforms, limiting the access of users to their code. To safeguard the integrity of their code and prevent unauthorized use, these software tools often employ various forms of locks and encryption methods.

However, with the increasing popularity of open-source software in web technologies, there has been a shift towards greater transparency and accessibility in the industry. Open-source software provides users with the freedom to access, modify, and share the code, and has become a popular choice for developers and users alike.

In line with this trend, we aim to continue promoting the values of openness and accessibility by releasing a significant portion of our code to the public under the MIT License. By doing so, we hope to promote innovation and collaboration within the CAD industry and provide greater opportunities for developers and users to engage with our software. Our commitment to the open-source community is a testament to our belief in the power of collaboration and the importance of transparency in the development of software tools.

### New NPM packages

We have released three NPM packages: bitbybit-occt, bitbybit-occt-worker, and bitbybit-core. These open-source packages are available for anyone to use. Below you will find a description of each package and an accompanying matrix image that displays the compatibility of each package with various web technologies.

![Picture showing compatibility matrix of Bit By Bit Developers NPM packages](https://ik.imagekit.io/bitbybit/app/assets/compatibility-matrix-npm.png)

Compatibility Matrix Of Bit By Bit Developers NPM Packages

### @bitbybit-dev/core

[NPM Link](https://www.npmjs.com/package/@bitbybit-dev/core)

[GitHub Link](https://github.com/bitbybit-dev/bitbybit)

This package provides a comprehensive collection of Bit By Bit Developers' CAD algorithms, which are also utilized in our online platform. The code for these algorithms has been organized into separate packages for easier management.

The "bitbybit-core" is independent of any front-end frameworks, such as React, Vue, or Angular, but does have a dependency on BabylonJS. If you must use any other 3D game engine or rendering pipelines, we recommend exploring our alternative packages. If you are looking for a complete solution, simply install this package and give it a try.

The code in this package is used to execute the functionality of our online editors. You can find numerous examples of its use in our public projects section. The app listed below makes use of this package as well

[GitHub link to example of laptop holder](https://github.com/bitbybit-dev/app-examples/tree/main/react/laptop-holder)

[Run this app](https://app-store.bitbybit.dev/laptop-holder)

![Picture showing laptop holder configurator example](https://ik.imagekit.io/bitbybit/app/assets/laptop-holder.png)

Laptop Holder Configurator Example

### @bitbybit-dev/occt

[NPM Link](https://www.npmjs.com/package/@bitbybit-dev/occt)

[GitHub Link](https://github.com/bitbybit-dev/bitbybit/tree/master/packages/dev/occt)

This package includes a custom build of the OpenCascade.js library, which compiles the C++ OpenCascade Technology (OCCT) kernel into Web Assembly (wasm) using emscripten. Our aim with this library is to abstract the OCCT kernel and provide a straightforward JavaScript API for its use.

The "bitbybit-occt" is independent of front-end frameworks or game engines. It can run both on the browser and on NodeJS apps. This makes this package very versatile as it can even run 3D CAD algorithms on the server.

In addition to the core functionality of the OCCT kernel, we have also added additional features to the library, making it easier to perform common CAD operations. This package is utilized by our online editors and is accessible to anyone. The full range of available algorithms can be found under the OCCT category.

If you really want to get a grasp on how to use OpenCascade - GitHub source code of this package is the most informative resource.

[NodeJS basic example using this package](https://github.com/bitbybit-dev/app-examples/tree/main/node/basic)

[NodeJS express example using this package](https://github.com/bitbybit-dev/app-examples/tree/main/node/express-app)

### @bitbybit-dev/occt-worker

[NPM Link](https://www.npmjs.com/package/@bitbybit-dev/occt-worker)

[GitHub Link](https://github.com/bitbybit-dev/bitbybit/tree/master/packages/dev/occt-worker)

This library integrates the "bitbybit-occt" package into a Web Worker and presents it through an asynchronous API. To further enhance performance, we have employed a special memoization caching technique. Although the package is not dependent on front-end frameworks or game engines, it does require RxJS, which we utilize extensively for various asynchronous operations.

If you prefer to write your own Web Worker, you can use this package as a reference and work directly with the "bitbybit-occt" package. It is important to note that when using the worker in JavaScript, you will primarily be dealing with "pointers" to OCCT shapes, which exist within the Web Assembly (wasm) environment. However, you can easily extract data from these shapes and manipulate them by referencing the pointers. For further information and examples, please refer to our documentation.

In addition to the main functionality, we have also tried to make the library user-friendly and easy to use. We understand that dealing with complex CAD algorithms and integrating them into a web-based platform can be challenging, and that is why we have put a lot of effort to provide a seamless and straightforward experience. Our goal is to help developers integrate advanced CAD functionality into their projects quickly and with minimal effort.

[GitHub link to example app that uses this pacakge with threejs](https://github.com/bitbybit-dev/app-examples/tree/main/react/bitbybit-threejs)

[Run this app](https://app-store.bitbybit.dev/bitbybit-threejs)

![Picture showing bitbybit threejs example app](https://ik.imagekit.io/bitbybit/app/assets/bitbybit-threejs.png)

Vase Configurator App Example

### Unlocking the potential of bitbybit-core: refactoring for broader use and easier integration

From its inception, the bitbybit-core library has been made freely available to all, however, its design was closely tied to our specific use case, limiting its potential for broader use. Our core algorithms have now matured to the point where they can be utilized to create advanced parametric geometries and various computer-aided design (CAD) configurators.

To unlock the full potential of these algorithms, we took the initiative to refactor portions of the codebase, breaking it down into more logically defined components. This effort proved that the algorithms did not require the close coupling that had previously existed, and opened up new possibilities for their use.

Our team recognizes the versatility of our CAD algorithms and the potential for a wide range of applications beyond what we have already imagined. Our goal is to make it as easy as possible for developers to integrate these algorithms into their own projects. To that end, we believe that publishing our code publicly is the most effective way to achieve this objective. We invite developers to explore and experiment with our libraries, and look forward to seeing the innovative projects that they create with it.

### Future plans for packaging

From the very beginning, we have been focused on making our platform highly modular and standardizing the input and output data structures used by the algorithms in different kernels. This is evident in the design of our visual programming language, which is composed of small, modular algorithms that can be combined and recombined in a variety of ways to achieve a wide range of results. However, while we have made significant progress in terms of modularization on the front-end of the editor, we have not yet fully invested in packaging our codebase into separate npm packages. This was just a first step towards decoupling our dependencies and separating the concerns of the OCCT CAD kernel and game engines. But rest assured, we plan to continue working towards this goal, so that others can benefit from our efforts.

Another area where we have started making progress is in the use of unit tests. Initially, we primarily exposed algorithms from third-party libraries through a thin integration layer, and we did not have much more in mind beyond that. However, as we have started to add more and more algorithms that are not available from third-party libraries, we have come to see the need for unit tests to ensure the stability and reliability of our code. We are now making a concerted effort to add unit tests to a majority of our 3D algorithms, and we hope to share some positive developments in this area soon. Overall, we are dedicated to making our platform as robust and efficient as possible, and these are just a few of the ways in which we are working towards that goal.