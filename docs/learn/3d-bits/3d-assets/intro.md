---
sidebar_position: 1
title: "3D Assets for Shopify's '3D Bits' App"
sidebar_label: Intro
description: Learn about the 3D asset formats supported by the "3D Bits" app and how to prepare your models for interactive configurators and static displays on Shopify.
tags: [shopify, 3d-bits]
---

# 3D Assets for Shopify's "3D Bits" App

The **3D Bits** app supports various 3D asset formats for creating interactive configurators and static displays on Shopify. This section provides an overview of the supported formats and best practices for preparing your models for the web.

## Recommended Formats

### GLTF/GLB
The **GLTF/GLB** file format is the most widely supported and optimised for web use. It is lightweight, efficient, and ideal for static models and interactive configurators. It is also the format that carries the extras a configurator is built on - material variants and baked animations - so build your product models in GLTF and export **GLB**, the binary version, wherever you can.

### Splat Files
For 3D scans, **Splat files** offer an alternative to traditional 3D models. These files can be created using third-party applications and are suitable for showcasing scanned objects.

### Other Formats the App Accepts
Composer and the storefront both accept six extensions in total: `.glb`, `.gltf`, `.ply`, `.splat`, `.stl` and `.obj`. The last three load perfectly well and are handy for a quick test or a simple shape, but none of them carries material variants or animations the way GLTF does, so they are not the format to build a configurator on.

## Important Considerations

### Public Accessibility of Assets
3D assets displayed on your Shopify store are publicly accessible, similar to images. Anyone with technical knowledge can download these files. To protect sensitive information:
* Use lightweight, lower-poly models that abstract production-grade CAD designs.
* Avoid uploading detailed production models directly.

**Important:** Read the complete [Your Assets & Security](/learn/3d-bits/3d-assets/asset-security) guide to fully understand asset security implications, intellectual property considerations, and best practices before uploading any 3D models. Your models are not the only public part of a published configurator - so is the configuration that drives it, which is covered in [What Else Is Public: Your Configuration](/learn/3d-bits/3d-assets/asset-security#what-else-is-public-your-configuration).

### File Size and Performance
Three numbers get quoted around file size, and they do different things. Composer warns you about a model from **20 MB** and about your scene total from **40 MB**, but stops nothing. Your live storefront skips any single model over **30 MB** for shoppers on iPhone Safari, and shows them a notice. Uploads through the app are refused above **100 MB**. Which one you are looking at, and what to aim for instead, is explained in [Size and Performance Limits](/learn/3d-bits/3d-assets/size-and-performance).

### Where Your Files Live
Upload models and images on the app's **Assets** page, or straight from the model and image fields in Composer - both put the file on your store's CDN and make it available to every project. You can also drop files into **Content → Files** in the Shopify admin and paste the URL in yourself, or host them on your own CDN as long as they are publicly reachable.

### Rights and Permissions
Ensure you have the rights to use all parts of your 3D models, including meshes, textures, and other assets. The **3D Bits** app renders the assets you provide, but you are responsible for their legality and compliance.

## Interactive Configurators: Bridging Assets and Experiences

Interactive configurators transform static 3D assets into dynamic experiences. By combining lightweight models with JSON-based scene configurations, you can create engaging product presentations that respond to user input. Learn more about configurators in the [Configurators Are Games](/learn/3d-bits/3d-assets/configurators-are-games) section, and about turning a CAD model into a web-ready GLTF in [Preparing GLTF Assets](/learn/3d-bits/3d-assets/preparing-gltf).

