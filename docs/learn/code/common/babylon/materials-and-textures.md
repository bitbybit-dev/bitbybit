---
sidebar_position: 3
title: Materials, Textures and Decals
sidebar_label: Materials and Textures
description: The bitbybit.babylon functions for how surfaces look - physically based materials with base colour, metallic and roughness, transparency and emission, textures from images, and decals that stick an image onto a mesh - with a table of every function.
topic: code.babylon.materials
type: reference
tags: [code, babylonjs]
---

# Materials, textures and decals

A material says how light meets a surface. [Materials and the look of a model](../concepts/materials-and-looks) explains the idea and shows a physically based material on a sphere; this page lists what `bitbybit.babylon` adds to it.

- **Materials** (`babylon.material`): physically based materials with a base colour, how metallic and how rough a surface is, emission, transparency and its blending, both sides or one, and wireframe. A material is given to a drawn shape through the drawing options' face material, or applied to a mesh with `babylon.mesh`.
- **Textures** (`babylon.texture`): an image from a URL, tiled, scaled and offset, for a material's colour, roughness, normals or emission.
- **Decals** (`babylon.decal`): an image stuck onto a mesh where you point, the way a label sits on a product.

## Every function

### Materials

{/* api:babylon.material:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`pbrMetallicRoughness.create`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialPbrMetallicRoughness#create) | Creates a metallic-roughness material with the given color, metallic and roughness values, opacity, back-face culling and optional emissive color. |
| [`pbrMetallicRoughness.getAlpha`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialPbrMetallicRoughness#getAlpha) | Reads the opacity of a material, from 0 to 1. |
| [`pbrMetallicRoughness.getBackFaceCulling`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialPbrMetallicRoughness#getBackFaceCulling) | Reads whether a material skips the back of each face when drawing. |
| [`pbrMetallicRoughness.getBaseColor`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialPbrMetallicRoughness#getBaseColor) | Reads the base color of a material as a hex string. |
| [`pbrMetallicRoughness.getBaseTexture`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialPbrMetallicRoughness#getBaseTexture) | Reads the image texture a material uses in place of its base color, if it has one. |
| [`pbrMetallicRoughness.getMetallic`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialPbrMetallicRoughness#getMetallic) | Reads how metallic a material is, from 0 to 1. |
| [`pbrMetallicRoughness.getRoughness`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialPbrMetallicRoughness#getRoughness) | Reads how rough a material's surface is, from 0 to 1. |
| [`pbrMetallicRoughness.setAlpha`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialPbrMetallicRoughness#setAlpha) | Changes the opacity of a material, from 0 for invisible to 1 for solid; values between make the surface see-through. |
| [`pbrMetallicRoughness.setBackFaceCulling`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialPbrMetallicRoughness#setBackFaceCulling) | Sets whether the back of each face is skipped when drawing; culling is faster, while drawing both sides shows the inside of open or single-sided meshes. |
| [`pbrMetallicRoughness.setBaseColor`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialPbrMetallicRoughness#setBaseColor) | Changes the base color of a material, the color its surface has under white light, from a hex string. |
| [`pbrMetallicRoughness.setBaseTexture`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialPbrMetallicRoughness#setBaseTexture) | Gives a material an image texture that replaces its base color across the surface, as `texture.createSimple` makes one. |
| [`pbrMetallicRoughness.setMetallic`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialPbrMetallicRoughness#setMetallic) | Changes how metallic a material looks, from 0 for paint or plastic to 1 for bare metal. |
| [`pbrMetallicRoughness.setRoughness`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialPbrMetallicRoughness#setRoughness) | Changes how rough a material's surface is, from 0 for a mirror finish to 1 for fully matte. |
| [`skyMaterial.create`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialSky#create) | Creates a sky material from atmosphere settings; only the values you give are applied over the defaults. |
| [`skyMaterial.getAzimuth`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialSky#getAzimuth) | Reads where around the horizon the sun stands in a sky material, from 0 to 1. |
| [`skyMaterial.getCameraOffset`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialSky#getCameraOffset) | Reads the horizon offset vector of a sky material. |
| [`skyMaterial.getDistance`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialSky#getDistance) | Reads how far the sky dome sits from the camera in a sky material. |
| [`skyMaterial.getDithering`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialSky#getDithering) | Reads whether a sky material dithers its gradients to hide color banding. |
| [`skyMaterial.getInclination`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialSky#getInclination) | Reads how high the sun stands in a sky material, from -0.5 to 0.5. |
| [`skyMaterial.getLuminance`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialSky#getLuminance) | Reads the overall brightness of a sky material. |
| [`skyMaterial.getMieCoefficient`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialSky#getMieCoefficient) | Reads how much haze a sky material has around the sun. |
| [`skyMaterial.getMieDirectionalG`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialSky#getMieDirectionalG) | Reads how tightly a sky material's haze glow gathers around the sun. |
| [`skyMaterial.getRayleigh`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialSky#getRayleigh) | Reads the Rayleigh scattering strength of a sky material, the setting behind its blue. |
| [`skyMaterial.getSunPosition`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialSky#getSunPosition) | Reads the sun direction of a sky material; when `useSunPosition` is off it reflects the inclination and azimuth. |
| [`skyMaterial.getTurbidity`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialSky#getTurbidity) | Reads how hazy a sky material's air is. |
| [`skyMaterial.getUp`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialSky#getUp) | Reads the direction a sky material treats as up. |
| [`skyMaterial.getUseSunPosition`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialSky#getUseSunPosition) | Reads whether a sky material places the sun from `sunPosition` rather than from inclination and azimuth. |
| [`skyMaterial.setAzimuth`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialSky#setAzimuth) | Changes where around the horizon the sun stands in a sky material, from 0 to 1 for a full turn; ignored while `useSunPosition` is on. |
| [`skyMaterial.setCameraOffset`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialSky#setCameraOffset) | Shifts the horizon of a sky material by an offset vector, so the sky can sit higher or lower relative to the camera. |
| [`skyMaterial.setDistance`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialSky#setDistance) | Changes how far the sky dome sits from the camera in a sky material, which changes how the horizon reads. |
| [`skyMaterial.setDithering`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialSky#setDithering) | Turns dithering on or off for a sky material; on, it adds fine noise that hides color banding in smooth gradients. |
| [`skyMaterial.setInclination`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialSky#setInclination) | Changes how high the sun stands in a sky material, from -0.5 below the horizon through 0 at the horizon to 0.5 overhead; ignored while `useSunPosition` is on. |
| [`skyMaterial.setLuminance`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialSky#setLuminance) | Changes the overall brightness of a sky material, between 0 and 1. |
| [`skyMaterial.setMieCoefficient`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialSky#setMieCoefficient) | Changes how much haze a sky material has around the sun, between 0 and 0.1; more makes a wider, whiter glow. |
| [`skyMaterial.setMieDirectionalG`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialSky#setMieDirectionalG) | Changes how tightly a sky material's haze glow gathers around the sun; values near 1 make a small bright halo, lower values spread it. |
| [`skyMaterial.setRayleigh`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialSky#setRayleigh) | Changes how strongly a sky material scatters light in the way that makes a clear sky blue; higher is a deeper, brighter blue. |
| [`skyMaterial.setSunPosition`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialSky#setSunPosition) | Places the sun of a sky material at an explicit direction vector; it takes effect only while `useSunPosition` is on, otherwise inclination and azimuth decide. |
| [`skyMaterial.setTurbidity`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialSky#setTurbidity) | Changes how hazy a sky material's air is; more haze whitens the sky and spreads the sun's glow. |
| [`skyMaterial.setUp`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialSky#setUp) | Changes which direction a sky material treats as up, normally `[0, 1, 0]`; change it for scenes that use another axis as up. |
| [`skyMaterial.setUseSunPosition`](https://docs.bitbybit.dev/classes/Bit.BabylonMaterialSky#setUseSunPosition) | Chooses whether a sky material places the sun from `sunPosition`, when true, or from inclination and azimuth, when false. |

{/* api:babylon.material:end */}

### Textures

{/* api:babylon.texture:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`createImage`](https://docs.bitbybit.dev/classes/Bit.BabylonTexture#createImage) | Creates an image texture intended for decals and projections. |
| [`createSimple`](https://docs.bitbybit.dev/classes/Bit.BabylonTexture#createSimple) | Creates texture from URL from a few basic options. |

{/* api:babylon.texture:end */}

### Decals

{/* api:babylon.decal:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`clearDecalMap`](https://docs.bitbybit.dev/classes/Bit.BabylonDecal#clearDecalMap) | Clears all projected decals from a decal map, resetting it to empty. |
| [`createMeshDecal`](https://docs.bitbybit.dev/classes/Bit.BabylonDecal#createMeshDecal) | Creates a geometry decal that projects an image onto a mesh. |
| [`enableDecalMap`](https://docs.bitbybit.dev/classes/Bit.BabylonDecal#enableDecalMap) | Enables a UV-space decal map on a mesh and turns on the decal map plugin of its material. |
| [`projectDecal`](https://docs.bitbybit.dev/classes/Bit.BabylonDecal#projectDecal) | Projects an image into a decal map. |

{/* api:babylon.decal:end */}
