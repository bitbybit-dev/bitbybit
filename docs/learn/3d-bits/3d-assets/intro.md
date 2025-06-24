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
The **GLTF/GLB** file format is the most widely supported and optimized for web use. It is lightweight, efficient, and ideal for static models and interactive configurators.

### Splat Files
For 3D scans, **Splat files** offer an alternative to traditional 3D models. These files can be created using third-party applications and are suitable for showcasing scanned objects.

## Important Considerations

### Public Accessibility of Assets
3D assets displayed on your Shopify store are publicly accessible, similar to images. Anyone with technical knowledge can download these files. To protect sensitive information:
* Use lightweight, lower-poly models that abstract production-grade CAD designs.
* Avoid uploading detailed production models directly.

### Rights and Permissions
Ensure you have the rights to use all parts of your 3D models, including meshes, textures, and other assets. The **3D Bits** app renders the assets you provide, but you are responsible for their legality and compliance.

## Interactive Configurators: Bridging Assets and Experiences

Interactive configurators transform static 3D assets into dynamic experiences. By combining lightweight models with JSON-based scene configurations, you can create engaging product presentations that respond to user input. Learn more about configurators in the [Configurators Are Games](./configurators-are-games.md) section.

