---
sidebar_position: 7
title: Loading and Exporting with BabylonJS
sidebar_label: Files
description: The bitbybit.babylon functions that bring models into the scene and take it out - glTF, glb, STL and OBJ from files, URLs or bytes, glTF tooling, Gaussian splatting scans, GLB and STL export and screenshots - with a table of every function.
topic: code.babylon.files
type: reference
tags: [code, babylonjs]
---

# Loading and exporting with BabylonJS

- **Into the scene** (`babylon.io`): glTF, glb, STL and OBJ models from a file, a URL or raw glb bytes, placed in the scene as meshes. A model from your project's assets is loaded with `bitbybit.asset.getFile` first.
- **Out of the scene** (`babylon.io`): the scene, or chosen meshes, as GLB, STL or a `.babylon` file, downloaded or kept as bytes. In the editors, <Ui>More</Ui> > <Ui>Export model</Ui> does the same without code.
- **glTF tooling** (`babylon.gltf`): a glTF file kept as its whole asset container rather than one mesh, so its material variants (`KHR_materials_variants`) can be listed and switched and its animation groups played.
- **Gaussian splatting** (`babylon.gaussianSplatting`): captured real-world scenes, clouds of soft coloured blobs from `.ply` files, placed and cloned like meshes.
- **Screenshots** (`babylon.tools`): the scene rendered through any camera at any size, downloaded or kept as an image.

Exact CAD formats such as STEP come from the kernels, not from the scene: [getting a model out](../concepts/getting-a-model-out) compares the two.

## Every function

### Loading and exporting

{/* api:babylon.io:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`exportBabylon`](https://docs.bitbybit.dev/classes/Bit.BabylonIO#exportBabylon) | Downloads the whole scene as a `.babylon` file, the engine's own JSON format that its editors and loaders read back; the extension is added when missing. |
| [`exportGLB`](https://docs.bitbybit.dev/classes/Bit.BabylonIO#exportGLB) | Downloads the whole scene as a glb file, the binary glTF that most 3D tools and web viewers read; `discardSkyboxAndGrid` leaves out the skybox and ground this library adds. |
| [`exportGLBBytes`](https://docs.bitbybit.dev/classes/Bit.BabylonIO#exportGLBBytes) | Writes the whole scene, or chosen nodes with their ancestors, as glb bytes without downloading anything, so they can be saved, sent on or loaded back with `loadGlbFromArrayBuffer`. |
| [`exportMeshesToStl`](https://docs.bitbybit.dev/classes/Bit.BabylonIO#exportMeshesToStl) | Downloads several meshes, with their child meshes, as one STL file; lines are left out. |
| [`exportMeshToStl`](https://docs.bitbybit.dev/classes/Bit.BabylonIO#exportMeshToStl) | Downloads a mesh and its visible child meshes as one STL file, the plain triangle format 3D printers take; lines are left out. |
| [`loadAssetIntoScene`](https://docs.bitbybit.dev/classes/Bit.BabylonIO#loadAssetIntoScene) | Loads a glTF, glb, STL or OBJ model from a File into the scene and gives back a container mesh with the model's meshes as its children; any other extension throws an error. |
| [`loadAssetIntoSceneFromRootUrl`](https://docs.bitbybit.dev/classes/Bit.BabylonIO#loadAssetIntoSceneFromRootUrl) | Loads a glTF, glb, STL or OBJ model from a web address into the scene and gives back a container mesh with the model's meshes as its children. |
| [`loadAssetIntoSceneFromRootUrlNoReturn`](https://docs.bitbybit.dev/classes/Bit.BabylonIO#loadAssetIntoSceneFromRootUrlNoReturn) | Loads a model from a web address into the scene, as `loadAssetIntoSceneFromRootUrl` does, without giving the mesh back. |
| [`loadAssetIntoSceneNoReturn`](https://docs.bitbybit.dev/classes/Bit.BabylonIO#loadAssetIntoSceneNoReturn) | Loads a glTF, glb, STL or OBJ model from a File into the scene, as `loadAssetIntoScene` does, without giving the mesh back. |
| [`loadGlbFromArrayBuffer`](https://docs.bitbybit.dev/classes/Bit.BabylonIO#loadGlbFromArrayBuffer) | Loads a glb model held as bytes into the scene, such as the output of `occt.io.convertStepToGltf`, and gives back a container mesh with the model's meshes as its children. |
| [`loadGlbFromArrayBufferNoReturn`](https://docs.bitbybit.dev/classes/Bit.BabylonIO#loadGlbFromArrayBufferNoReturn) | Loads a glb model held as bytes into the scene, as `loadGlbFromArrayBuffer` does, without giving the mesh back. |

{/* api:babylon.io:end */}

### glTF

{/* api:babylon.gltf:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`getAnimationGroups`](https://docs.bitbybit.dev/classes/Bit.BabylonGltf#getAnimationGroups) | Gets the animation groups of a loaded glTF asset container. |
| [`getMeshes`](https://docs.bitbybit.dev/classes/Bit.BabylonGltf#getMeshes) | Gets all meshes of a loaded glTF asset container. |
| [`getRootNode`](https://docs.bitbybit.dev/classes/Bit.BabylonGltf#getRootNode) | Gets the root transform node of a loaded glTF asset. |
| [`getSelectedMaterialVariant`](https://docs.bitbybit.dev/classes/Bit.BabylonGltf#getSelectedMaterialVariant) | Gets the currently selected KHR_materials_variants material variant of a loaded glTF asset. |
| [`listAnimationGroupNames`](https://docs.bitbybit.dev/classes/Bit.BabylonGltf#listAnimationGroupNames) | Lists the names of the animation groups of a loaded glTF asset container. |
| [`listMaterialVariants`](https://docs.bitbybit.dev/classes/Bit.BabylonGltf#listMaterialVariants) | Lists the names of the KHR_materials_variants material variants declared by a loaded glTF asset. |
| [`loadAssetContainer`](https://docs.bitbybit.dev/classes/Bit.BabylonGltf#loadAssetContainer) | Loads a glTF or glb file from an uploaded asset file into the scene and returns the asset container. |
| [`loadAssetContainerFromUrl`](https://docs.bitbybit.dev/classes/Bit.BabylonGltf#loadAssetContainerFromUrl) | Loads a glTF or glb file from a url into the scene and returns the asset container. |
| [`playAnimationGroup`](https://docs.bitbybit.dev/classes/Bit.BabylonGltf#playAnimationGroup) | Starts playing an animation group of a loaded glTF asset. |
| [`resetMaterialVariant`](https://docs.bitbybit.dev/classes/Bit.BabylonGltf#resetMaterialVariant) | Resets the materials of a loaded glTF asset back to the original KHR_materials_variants default. |
| [`selectMaterialVariant`](https://docs.bitbybit.dev/classes/Bit.BabylonGltf#selectMaterialVariant) | Activates a KHR_materials_variants material variant by name, swapping the materials of the asset accordingly. |
| [`stopAnimationGroup`](https://docs.bitbybit.dev/classes/Bit.BabylonGltf#stopAnimationGroup) | Stops an animation group of a loaded glTF asset. |

{/* api:babylon.gltf:end */}

### Gaussian splatting

{/* api:babylon.gaussianSplatting:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`clone`](https://docs.bitbybit.dev/classes/Bit.BabylonGaussianSplatting#clone) | Makes a copy of a Gaussian splatting mesh that shares its splat data, so the same capture can appear at several places cheaply. |
| [`create`](https://docs.bitbybit.dev/classes/Bit.BabylonGaussianSplatting#create) | Loads a Gaussian splatting `.ply` file from a URL into the scene as a mesh that casts and receives shadows; nothing is loaded without a URL. |
| [`getSplatPositions`](https://docs.bitbybit.dev/classes/Bit.BabylonGaussianSplatting#getSplatPositions) | Reads the center point of every splat in a Gaussian splatting mesh, in its own coordinates; the engine stores four numbers per splat and only the first three are the point. |

{/* api:babylon.gaussianSplatting:end */}

### Screenshots

{/* api:babylon.tools:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`createScreenshot`](https://docs.bitbybit.dev/classes/Bit.BabylonTools#createScreenshot) | Renders the scene through `camera`, or the active camera when none is given, at the given size and gives the image back as a data URL. |
| [`createScreenshotAndDownload`](https://docs.bitbybit.dev/classes/Bit.BabylonTools#createScreenshotAndDownload) | Renders the scene through `camera`, or the active camera when none is given, at the given size and downloads the image in the browser. |

{/* api:babylon.tools:end */}
