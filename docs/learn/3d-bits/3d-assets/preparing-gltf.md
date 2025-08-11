---
sidebar_position: 3
title: "Preparing GLTF 3D Assets"
sidebar_label: Preparing GLTF 3D Assets
description: Learn about the best practices and solutions when preparing 3D GLTF assets for your 3D configurators.
tags: [shopify, 3d-bits, configurators]
image: https://ik.imagekit.io/bitbybit/app/assets/start/shopify/preparing-gltf-assets/preparing-gltf-assets-for-3d-bits-app-for-shopify.jpeg
---

# Where to Start

The first step in preparing 3D assets for your configurator is having 3D models of your products.  

If your brand already designs and manufactures physical goods, there’s a good chance you already have detailed, good-looking 3D models on hand. Resellers can often get these from manufacturers - many keep accurate CAD files of their products for engineering or marketing purposes. Not all manufacturers will share them, though, so sometimes you’ll need to commission a 3D artist or designer to create them from scratch in professional CAD software. Some AI tools also exist, which can create 3D assets from 2D images, but in many cases they are not optimised for speed or quality, this may however change in the near future.

![Preparing GLTF Assets](https://ik.imagekit.io/bitbybit/app/assets/start/shopify/preparing-gltf-assets/preparing-gltf-assets-for-3d-bits-app-for-shopify.jpeg "Learn How to prepare GLTF assets")

# What Formats Merchants Usually Have

If you do manage to get existing 3D models, they’ll most likely come in formats such as **STEP (ISO 10303)**, **IGES**, or other proprietary CAD formats. These are common in professional design workflows because they use something called **BRep** - short for Boundary Representation - to store geometry. Usually people use software packages such as FreeCAD, SolidWorks, Fusion 360, Catia, Rhino, OpenCascade and similar modeling software packages to create these assets.  

BRep is very different from polygonal meshes. Instead of a collection of triangles, vertices, and indices, a BRep model is a precise mathematical description: NURBS curves, faces, shells, and solids define the surfaces and edges of the object. This is great for manufacturing and engineering, but to use these models on the web, you’ll need to **triangulate** them into formats like GLTF, OBJ, FBX, 3MF, or STL.

# From BRep to GLTF

Not all CAD or BRep editors can export directly to GLTF. In many cases, you’ll need to first export to an intermediate format such as FBX or STL, bring that into Blender, and then export to GLTF. Another common challenge is that CAD exports often lack proper material and texture data. If that’s the case, you’ll have to apply materials and textures inside Blender, which can be time-consuming but is sometimes unavoidable without some additional 3rd party plugins.   

When you do triangulate, you’ll usually be able to choose how dense the mesh will be. This is a crucial decision: fewer triangles mean the GPU can render your model much faster. The goal is to create low-poly models that still look good. Don’t expect a browser to smoothly handle millions of triangles - especially on older devices. Even high-end GPUs will struggle if you push them too far. Designing a configurator is a lot like designing a video game: performance matters just as much as visual quality. We go deeper into this mindset in [Configurators Are Games](./configurators-are-games.md).

# Editing Triangulated Models

Once you have a triangulated model, you’ll probably need to make adjustments. We recommend Blender for this. It’s free, open source, and maintained by some of the most experienced 3D professionals in the industry. Of course, it’s not the only option - commercial tools like 3ds Max can also handle triangulated models perfectly well.

[![Blender Logo](https://ik.imagekit.io/bitbybit/app/assets/start/shopify/preparing-gltf-assets/blender-logo.jpg "Blender Logo")](https://blender.org)      
[Download Blender Here](https://www.blender.org/download/)

# Understanding Meshes

In the context of 3D assets, a “mesh” is simply a triangulated section of your model assembly. It’s made up of triangles, each defined by three points in space. You can read more about meshes [here](https://en.wikipedia.org/wiki/Polygon_mesh), but for now, think of them as the building blocks that make up the visible geometry of your model.

In order to understand how many triangles or polygon faces your model contains, you should enable "Scene Stats" in Blender. Click right mouse button in the bottom right corner of Blender and enable it.

![Understand how many triangles your 3D assets contain in Blender](https://ik.imagekit.io/bitbybit/app/assets/start/shopify/preparing-gltf-assets/blender-scene-stats.jpeg "Blender scene stats")
*Enable Scene stats to understand how many triangles your 3D assets contain in Blender.*

# GLTF and Why We Use It

GLTF has become one of the most widely supported formats for delivering 3D assets online. It’s designed to be efficient to load, transmit, and render in real time. You can read more about it on the [Khronos website](https://www.khronos.org/gltf/), but the short version is: if you’re delivering interactive 3D experiences on the web, GLTF is the format you want to be working with. Blender supports exporting to GLTF directly, and once you’ve done that, you can upload the file to Shopify’s CDN for use with the 3D Bits app.

# Keeping Performance in Mind

One of the biggest performance killers in a 3D scene is having too many separate meshes. Ideally, your mesh count should match the number of materials in your model. There are valid reasons to split meshes - maybe you need to hide or show parts independently while configuring - but in general, the fewer meshes you have, the better.  

The reason comes down to something called **draw calls**. Every mesh in your scene requires a separate draw call to be rendered, and this happens for every frame. If you want a smooth 60 frames per second, you have roughly 16 milliseconds to render each frame. Too many draw calls, and you’ll exceed that budget quickly.

If you’re working in CAD, you can often merge parts by material before exporting. In Blender, you can select multiple meshes and use **Object → Join** to combine them into a single mesh. The specifics vary from one tool to another, but the principle is always the same: merge what you can.

![Join objects in Blender](https://ik.imagekit.io/bitbybit/app/assets/start/shopify/preparing-gltf-assets/blender-join-mesh-objects.jpeg "Join separate mesh objects together in Blender")
*Join separate mesh objects together in Blender.*

# Textures and Why They Matter

Textures are the 2D images you wrap around your 3D geometry to add surface detail. Just like images on a website, textures should be optimized. Larger textures mean more GPU memory usage and slower rendering.  

A good rule of thumb: make your textures as small as possible without losing visible quality. If your model will only ever be seen from a certain distance, you don’t need a 4K texture. In fact, 256×256 or 512×512 is plenty for most surfaces. Only use 4K textures when absolutely necessary.  

We also recommend using **KTX** texture compression inside GLTF files. If you have a repeating surface pattern, like a brick wall, it’s much faster to tile a small texture across the surface than to load a huge image that covers the whole thing in one go.

# Compression for Faster Loads

When a customer visits your store, their browser has to download everything: HTML, CSS, JavaScript, images, videos, and, in our case, 3D models. The bigger your 3D files, the longer they’ll take to load. And if loading takes too long, some visitors won’t stick around.

The good news is that GLTF files compress very well. You should always export to **GLB** - the binary version of GLTF - since it’s much smaller than the text-based version. Blender’s GLTF exporter can apply compression during export.  

![Blender Compression Options](https://ik.imagekit.io/bitbybit/app/assets/start/shopify/preparing-gltf-assets/blender-compress.jpeg "Blender Compression Options")

For even more options, try the free [Khronos GLTF Compressor](https://github.khronos.org/glTF-Compressor-Release/) and enable **Draco compression**. 3D Bits can decompress Draco-compressed files without issue. This tool can also compress textures and save them in formats like KTX.

Khronos compressor tool also will show you the split screen view of original vs compressed file with a nice separator line - it makes it super easy to compare before and after quality of the model.

![Khronos GLTF Compressor](https://ik.imagekit.io/bitbybit/app/assets/start/shopify/preparing-gltf-assets/khronos-gltf-compressor.jpeg "Khronos compressor tool comparison mode")
*Khronos compressor allows to compare original model with compressed.*

[Read More About The Compressor](https://www.khronos.org/blog/optimize-3d-assets-with-khronos-new-gltf-compressor-tool)

# Hosting on Shopify’s CDN

Once your file is ready, upload it to Shopify. Go to **Content → Files**, drag and drop your GLTF or GLB, and copy its URL if you want to use it in 3D Bits. Using Shopify’s CDN ensures your file is cached on servers close to your customers. If someone in Germany loads your product page, Shopify will serve the file from a nearby server, cutting down load times.

Shopify has a 20 MB file size limit, but that’s rarely an issue with well-optimized assets. If your model is bigger than that, you can split it into multiple files - 3D Bits can load several at once. If you decide to use your own CDN instead, make sure the files are publicly accessible.

# Reusing Parts with Instancing

If your model contains repeated parts - like bolts, wheels, or identical furniture sets - it’s best to save that part as a separate GLTF file and then load it once in 3D Bits, placing **instances** wherever needed. Instancing means the GPU loads the geometry only once and reuses it multiple times in the scene, which is far more efficient than loading duplicate meshes.

# Testing Before You Go Live

GLTF files need to be valid to be properly loaded into any 3D software, 3D Bits is no exception. That is why you should validate your files for any potential issues. We recommend using [Khronos GLTF validator](https://github.khronos.org/glTF-Validator/). Just upload your model and it will show if your file contains errors or potential improvements.

3D Bits is built on top of BabylonJS, which comes with a fantastic [Sandbox Viewer](https://sandbox.babylonjs.com/). Drop your GLTF file in there to preview it before uploading. You’ll spot missing textures, strange triangulation issues, or other export problems immediately. If you see a problem in the Sandbox, you’ll likely see it in 3D Bits as well.

![BabylonJS Sandbox](https://ik.imagekit.io/bitbybit/app/assets/start/shopify/preparing-gltf-assets/babylonjs-sandbox.jpeg "BabylonJS Sandbox can be used to test loading your compressed 3D assets, inspect contents")
*BabylonJS Sandbox can be used to test loading your compressed 3D assets, inspect contents.*

# Wrapping Up

Preparing 3D assets for the web is a balancing act between fidelity, file size, and performance. You might start with a pristine engineering model, but to make it run smoothly in a browser, you’ll need to simplify geometry, optimize textures, merge meshes, and compress files.  

This guide has walked through the journey from CAD to GLTF, explained why mesh count and texture size matter, and shown you how to host and test your assets before launch. Every product and every merchant is different, but the principles are the same: keep things light, keep them efficient, and your customers will have a faster, smoother, and more engaging 3D experience.
