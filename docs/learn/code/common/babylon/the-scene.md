---
sidebar_position: 2
title: The Scene, Lights and Camera
sidebar_label: Scene, Lights and Camera
description: The bitbybit.babylon functions for the scene as a whole - backgrounds and gradients, skyboxes and environment light, fog, directional and point lights with shadows, the camera and its limits, physics and the engine - with a table of every function.
topic: code.babylon.the-scene
type: reference
tags: [code, babylonjs]
---

# The scene, lights and camera

## Background

`babylon.scene` paints what is behind the model: one colour (`backgroundColour`), a straight or round gradient between two or many colours, an image, or any CSS background. A **skybox** (`enableSkybox`, `enableSkyboxCustomTexture`) surrounds the scene with a picture of an environment and lights the model with it, which is what makes metal look like metal; `hideSkybox` keeps the light and hides the picture.

## Light and shadow

`drawDirectionalLight` adds a sun: light from one direction everywhere, the usual choice for a model, with shadows when `enableShadows` is on. `drawPointLight` adds a bulb at a point. Shadows are drawn from a map of the scene seen from the light; in a large or a millimetre-scale scene, raise `shadowGeneratorMapSize` for sharper shadows and set `shadowNormalBias` in the scene's own units if the surfaces show stripes. `fog` fades distant geometry into a colour.

## Camera

The scene starts with an orbiting camera aimed at the origin. `adjustActiveArcRotateCamera` moves it and sets its limits: how close and how far it may go, how far it may turn, and how fast it pans and zooms. `babylon.camera` builds other cameras: `arcRotate` to orbit a target, `free` to fly, `target` to look from a fixed spot; `activateCamera` switches to one.

## Physics and the engine

`enablePhysics` turns on the physics engine with a gravity vector; in the editors that is Havok. `babylon.engine` hands you the engine and its canvas, for the renderer's own settings.

## Every function

### Scene

{/* api:babylon.scene:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`activateCamera`](https://docs.bitbybit.dev/classes/Bit.BabylonScene#activateCamera) | Makes a camera the one the scene renders through, detaching the controls of the camera that was active before. |
| [`adjustActiveArcRotateCamera`](https://docs.bitbybit.dev/classes/Bit.BabylonScene#adjustActiveArcRotateCamera) | Repositions the default orbiting camera, the one named `Camera`, and sets its limits and sensitivities. |
| [`backgroundColour`](https://docs.bitbybit.dev/classes/Bit.BabylonScene#backgroundColour) | Fills the background of the scene with one plain color and removes any canvas background image or gradient set before. |
| [`canvasBackgroundImage`](https://docs.bitbybit.dev/classes/Bit.BabylonScene#canvasBackgroundImage) | Shows an image behind the scene with the CSS background options for how it repeats, scales, sits and scrolls; the scene's clear color becomes transparent so the image shows through. |
| [`canvasCSSBackgroundImage`](https://docs.bitbybit.dev/classes/Bit.BabylonScene#canvasCSSBackgroundImage) | Paints any CSS `background-image` value behind the scene, a gradient or an image, by making the scene's clear color transparent and styling the canvas. |
| [`clearAllDrawn`](https://docs.bitbybit.dev/classes/Bit.BabylonScene#clearAllDrawn) | Removes everything drawn from the scene: meshes, the materials and the textures they wear, procedural textures, the scene's custom render targets, every light but the default hemispheric one, transform nodes, shadow generators, fog and the environment texture, and restores the default camera when another was active. |
| [`drawDirectionalLight`](https://docs.bitbybit.dev/classes/Bit.BabylonScene#drawDirectionalLight) | Adds a light that shines the same way everywhere, like the sun, along `direction`. |
| [`drawDirectionalLightNoReturn`](https://docs.bitbybit.dev/classes/Bit.BabylonScene#drawDirectionalLightNoReturn) | Adds a directional light to the scene, as `drawDirectionalLight` does, without giving it back; for scripts that only need the light to exist. |
| [`drawPointLight`](https://docs.bitbybit.dev/classes/Bit.BabylonScene#drawPointLight) | Adds a light that shines in every direction from a point, like a bulb, with an optional small glowing sphere at its position. |
| [`drawPointLightNoReturn`](https://docs.bitbybit.dev/classes/Bit.BabylonScene#drawPointLightNoReturn) | Adds a point light to the scene, as `drawPointLight` does, without giving it back; for scripts that only need the light to exist. |
| [`enablePhysics`](https://docs.bitbybit.dev/classes/Bit.BabylonScene#enablePhysics) | Turns on the physics engine for the scene with the given gravity, so bodies given physics fall and collide; the physics plugin must be set up on the context. |
| [`enableSkybox`](https://docs.bitbybit.dev/classes/Bit.BabylonScene#enableSkybox) | Surrounds the scene with one of the built-in skyboxes and uses it as the environment lighting that reflective materials pick up. |
| [`enableSkyboxCustomTexture`](https://docs.bitbybit.dev/classes/Bit.BabylonScene#enableSkyboxCustomTexture) | Surrounds the scene with a skybox loaded from your own texture and uses it as the environment lighting. |
| [`enableSkyboxFromTexture`](https://docs.bitbybit.dev/classes/Bit.BabylonScene#enableSkyboxFromTexture) | Surrounds the scene with a skybox built from a cube texture you loaded yourself and uses it as the environment lighting. |
| [`fog`](https://docs.bitbybit.dev/classes/Bit.BabylonScene#fog) | Fades distant geometry into a color, the way haze does. |
| [`getActiveCamera`](https://docs.bitbybit.dev/classes/Bit.BabylonScene#getActiveCamera) | Gives the camera the scene currently renders through. |
| [`getScene`](https://docs.bitbybit.dev/classes/Bit.BabylonScene#getScene) | Gives the scene every draw call goes into, for direct use of the BabylonJS API on it. |
| [`getShadowGenerators`](https://docs.bitbybit.dev/classes/Bit.BabylonScene#getShadowGenerators) | Lists the shadow generators of the lights created through this library, one per light with shadows enabled; drawn meshes are registered with them as casters. |
| [`multiColorLinearGradientBackground`](https://docs.bitbybit.dev/classes/Bit.BabylonScene#multiColorLinearGradientBackground) | Paints a straight gradient through several colors behind the scene, each at its own stop percentage; `colors` and `stops` must be the same length, or an error object comes back instead. |
| [`multiColorRadialGradientBackground`](https://docs.bitbybit.dev/classes/Bit.BabylonScene#multiColorRadialGradientBackground) | Paints a round gradient through several colors behind the scene, each at its own stop percentage; `colors` and `stops` must be the same length, or an error object comes back instead. |
| [`onPointerDown`](https://docs.bitbybit.dev/classes/Bit.BabylonScene#onPointerDown) | Sets the function that runs when a pointer button is pressed on the canvas, replacing any function set before. |
| [`onPointerMove`](https://docs.bitbybit.dev/classes/Bit.BabylonScene#onPointerMove) | Sets the function that runs whenever the pointer moves over the canvas, replacing any function set before; it runs often, so keep it light. |
| [`onPointerUp`](https://docs.bitbybit.dev/classes/Bit.BabylonScene#onPointerUp) | Sets the function that runs when a pointer button is released on the canvas, replacing any function set before. |
| [`setAndAttachScene`](https://docs.bitbybit.dev/classes/Bit.BabylonScene#setAndAttachScene) | Makes the given scene the one this library draws into, adding the shadow bookkeeping and root node it expects; for applications that create the scene themselves. |
| [`twoColorLinearGradientBackground`](https://docs.bitbybit.dev/classes/Bit.BabylonScene#twoColorLinearGradientBackground) | Paints a straight gradient between two colors behind the scene, in the given direction, with the stops as percentages along it. |
| [`twoColorRadialGradientBackground`](https://docs.bitbybit.dev/classes/Bit.BabylonScene#twoColorRadialGradientBackground) | Paints a round gradient between two colors behind the scene, spreading out from `position` in the given `shape`, with the stops as percentages from the center. |
| [`useRightHandedSystem`](https://docs.bitbybit.dev/classes/Bit.BabylonScene#useRightHandedSystem) | Switches the scene between the left-handed coordinate system BabylonJS uses by default and a right-handed one, the convention of most CAD tools and of glTF; the active camera is refreshed to match. |

{/* api:babylon.scene:end */}

### Lights

{/* api:babylon.lights:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`shadowLight.setDirectionToTarget`](https://docs.bitbybit.dev/classes/Bit.BabylonShadowLight#setDirectionToTarget) | Aims a shadow-casting light at a point in the scene, turning its direction to point from its position toward `target`. |
| [`shadowLight.setPosition`](https://docs.bitbybit.dev/classes/Bit.BabylonShadowLight#setPosition) | Moves a shadow-casting light to a point in the scene; for a directional light the position sets where its shadows are computed from. |

{/* api:babylon.lights:end */}

### Camera

{/* api:babylon.camera:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`arcRotate.create`](https://docs.bitbybit.dev/classes/Bit.BabylonArcRotateCamera#create) | Creates a camera that orbits `target` at distance `radius`, controlled by the pointer on the canvas, and adds it to the scene without activating it. |
| [`free.create`](https://docs.bitbybit.dev/classes/Bit.BabylonFreeCamera#create) | Creates a camera at `position` looking at `target` that the keyboard and pointer fly around, and adds it to the scene without activating it. |
| [`freezeProjectionMatrix`](https://docs.bitbybit.dev/classes/Bit.BabylonCamera#freezeProjectionMatrix) | Stops a camera from recomputing its projection every frame, saving work when its field of view and clipping distances no longer change. |
| [`getPosition`](https://docs.bitbybit.dev/classes/Bit.BabylonCamera#getPosition) | Reads where a camera is in the scene, as a point. |
| [`getSpeed`](https://docs.bitbybit.dev/classes/Bit.BabylonCamera#getSpeed) | Reads how fast a camera moves in response to its controls. |
| [`getTarget`](https://docs.bitbybit.dev/classes/Bit.BabylonCamera#getTarget) | Reads the point a camera is looking at. |
| [`makeCameraOrthographic`](https://docs.bitbybit.dev/classes/Bit.BabylonCamera#makeCameraOrthographic) | Switches a camera to orthographic projection, where objects keep their size whatever their distance, as in technical drawings. |
| [`makeCameraPerspective`](https://docs.bitbybit.dev/classes/Bit.BabylonCamera#makeCameraPerspective) | Switches a camera back to perspective projection, where distant objects look smaller, the default for cameras. |
| [`setMaxZ`](https://docs.bitbybit.dev/classes/Bit.BabylonCamera#setMaxZ) | Sets the far clipping distance of a camera: anything farther than `maxZ` scene units is not drawn. |
| [`setMinZ`](https://docs.bitbybit.dev/classes/Bit.BabylonCamera#setMinZ) | Sets the near clipping distance of a camera: anything closer than `minZ` scene units is not drawn. |
| [`setPosition`](https://docs.bitbybit.dev/classes/Bit.BabylonCamera#setPosition) | Moves a camera to a point in the scene; a target camera keeps looking at its target from there. |
| [`setSpeed`](https://docs.bitbybit.dev/classes/Bit.BabylonCamera#setSpeed) | Sets how fast a camera moves in response to its keyboard and pointer controls; 1 is the default pace. |
| [`setTarget`](https://docs.bitbybit.dev/classes/Bit.BabylonCamera#setTarget) | Turns a camera to look at a point in the scene. |
| [`target.create`](https://docs.bitbybit.dev/classes/Bit.BabylonTargetCamera#create) | Creates a camera at `position` looking at `target` with no navigation controls of its own, and adds it to the scene without activating it. |
| [`unfreezeProjectionMatrix`](https://docs.bitbybit.dev/classes/Bit.BabylonCamera#unfreezeProjectionMatrix) | Lets a frozen camera recompute its projection again, needed after changing its field of view or clipping distances. |

{/* api:babylon.camera:end */}

### Engine

{/* api:babylon.engine:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`getEngine`](https://docs.bitbybit.dev/classes/Bit.BabylonEngine#getEngine) | Gets the engine for the current context |
| [`getRenderingCanvas`](https://docs.bitbybit.dev/classes/Bit.BabylonEngine#getRenderingCanvas) | Gets the rendering canvas on which scene cameras can be attached |

{/* api:babylon.engine:end */}
