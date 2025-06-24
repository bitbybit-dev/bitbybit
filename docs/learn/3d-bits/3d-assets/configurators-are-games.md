---
sidebar_position: 2
title: "Configurators Are Games"
sidebar_label: Configurators Are Games
description: Learn how to think like a game designer when creating 3D product configurators for Shopify using the "3D Bits" app.
tags: [shopify, 3d-bits, configurators]
---

# Configurators Are Games

**Product configurators are games.** 🎮 🕹️👾  
This mindset has transformed how Shopify merchants approach 3D product pages using the **3D Bits** app. By thinking like a game designer, you can create immersive, interactive experiences that engage customers and showcase your products in unique ways.

## Why Think Like a Game Designer?

### Products Solve Problems
Your product isn’t just a “thing.” It fulfills a desire or solves a problem. A gamified product page lets users experience that value interactively. Think of your product page as a level in a game—an invitation for customers to explore, play, and immerse themselves in the experience. With smart storytelling and interactivity, you can make your product page more engaging than visiting a physical store.

### Speed and Performance Matter
Games aren’t just fun—they’re fast. To ensure your configurator feels amazing, apply these practical tips inspired by game development:

#### Keep Your 3D Assets Lean
Modern devices can handle a lot, but don’t push it—especially on mobile. Use lightweight, lower-poly models as abstractions of production-grade CAD designs. Learn more about asset preparation in the [3D Assets](./intro.md) section.

#### Use Levels of Detail (LOD)
Swap in lower-poly models for distant objects in scenes with depth or zoom. This saves performance without sacrificing visuals.

#### Add Animated Assets
Show your products in action—walking, sitting, swimming, racing or interacting with the environment. Keyframed product animations can bring your scene to life.

#### Prioritize Textures and Materials
You can fake a lot of depth with smart textures and materials. Avoid modeling every tiny bump or groove.

#### Compress Assets for Faster Load Times
Use tools like the [Khronos Group GLTF Compressor](https://github.khronos.org/glTF-Compressor-Release/) to reduce file sizes without compromising quality. The **3D Bits** app supports Draco compression for GLTF files.

## Building Configurators with the "3D Bits" App

The **3D Bits** app is built around the powerful [BabylonJS](https://learn.bitbybit.dev/learn/npm-packages/babylonjs/intro) game engine, enabling brands to create stunning, smooth, and even playable product experiences. By combining lightweight 3D assets with JSON-based scene configurations, you can create interactive configurators that respond to user input.

### BITBYBIT VIEWER
The **Viewer Editor** functionality allows you to:
* Customize camera settings.
* Configure lighting and shadows.
* Enable skyboxes for realistic reflections.
* Load multiple 3D models into the same scene.
* React to Shopify product variants (e.g., change models based on selected options).
* Integrate with 3rd party apps such as YMQ Options and others for custom pricing

Learn how to create scene configurations using the [Viewer Editor tool](../theme-app-extensions/bitbybit-viewer).

### BITBYBIT RUNNER

Use runner to access inner features of BabylonJS game engine and code actual TypeScript logic that can immerse your shop visitors.

## Conclusion

Thinking like a game designer can elevate your 3D product pages from static displays to immersive experiences. Whether you're showcasing a single model or building a complex configurator, the **3D Bits** app provides the tools to bring your vision to life. For more tips on asset preparation, visit the [3D Assets](./intro.md) section.