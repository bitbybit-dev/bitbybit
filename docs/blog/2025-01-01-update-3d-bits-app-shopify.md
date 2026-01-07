---
slug: updated-3d-bits-app-for-shopify
title: "UPDATED: 3D Bits App for Shopify - Simpler Static 3D Models & Project Embedding!"
authors: [ubarevicius]
tags: [bitbybit, cad]
description: "Exciting updates for the 3D Bits app for Shopify! Introducing new capabilities for simpler use cases, including easier static 3D model display and direct embedding of public Bitbybit.dev projects."
---

![3D Bits app for Shopify was updated to embed preview links to public bitbybit.dev scripts, showcasing a 3D towel and bucket model.](https://ik.imagekit.io/bitbybit/app/assets/start/shopify/bitbybit-embed-towel-bucket.jpeg "3D Bits app for Shopify was updated to embed preview links to public bitbybit.dev scripts")

We are happy to announce that the **3D Bits app for Shopify** has been updated with some powerful new capabilities designed to simplify common use cases! While parametric 3D models offer incredible flexibility, we understand that the learning curve associated with programming them can be steep.

<!--truncate-->

To address this, we've introduced **two new theme app extension blocks**:
1.  **BITBYBIT VIEWER:** Simplifies the display of static 3D models (like GLTF files or 3D scans).
2.  **BITBYBIT PREVIEW:** Offers a straightforward way to embed public Bitbybit.dev projects that don't need to react to Shopify product variant changes.

These updates make it easier than ever to bring stunning 3D experiences to your Shopify store.


### 3D Bits on the Shopify App Store

If you'd like to install or update the app for your Shopify store, just click the link below:

➡️ **[3D Bits App for Shopify](https://apps.shopify.com/3d-bits-1)**

### So, What Are The Updates?

Many of our users simply need to display static 3D models on their product pages – think 3D scans of their products or pre-made GLTF assets. Previously, even for these simpler cases, it often required creating a small script on our Bitbybit.dev platform, exporting it to Shopify, and following several integration steps.

To make this process significantly easier, we’ve introduced the **BITBYBIT VIEWER** theme app extension block.
*   **Simplified Static Model Display:** This new block lets you display 3D models on your product pages using just a URL (e.g., from Shopify’s CDN or any public URL) – often with no need to use the Bitbybit.dev editor at all. It’s perfect for users who want to showcase a 3D model that doesn't need to dynamically respond to product variant changes.
*   **Advanced Scene Configuration (JSON):** For those looking to customize more advanced 3D experiences with static models, the BITBYBIT VIEWER also supports Scene Configuration in JSON format. This feature lets you load multiple files, precisely adjust model rotation, position, and scale. You can also customize camera speeds, initial positions, lighting, skyboxes, and more, giving you fine-grained control over the 3D presentation.

Additionally, for experienced users already familiar with the Bitbybit.dev ecosystem, we’ve added the **BITBYBIT PREVIEW** theme app extension block.
*   **Direct Project Embedding:** With a single preview URL from a public Bitbybit.dev project, you can now link and embed that project directly onto your Shopify product pages. This is great for showcasing more complex or interactive scenes that you've already built on Bitbybit.dev, as long as they don't require dynamic updates based on Shopify product variants.

### BITBYBIT VIEWER Block

The **BITBYBIT VIEWER** block sets up the 3D scene and loads the 3D models you provide via URL or JSON configuration. It currently supports popular file formats like:
*   `gltf`, `glb` (standard 3D model format)
*   `splat`, `ply` (for Gaussian Splatting 3D scans)
*   `obj`, `stl` (common 3D model/printing formats)

For the best results with assets you own, we recommend uploading them to Shopify’s "Content" section (under Settings), then copying their CDN URLs and using those with the Viewer block. You can also customize settings such as the background color and other scene details directly within the Shopify theme editor to match your preferences.

➡️ **[Learn more about the BITBYBIT VIEWER block](/learn/3d-bits/theme-app-extensions/bitbybit-viewer)**

![Shopify theme editor showing the configuration options for the BITBYBIT VIEWER theme app extension block, including dynamic links for 3D model URLs.](https://ik.imagekit.io/bitbybit/app/assets/start/shopify/3d-bits-bitbybit-viewer-theme-app-extension-configuration-dynamic-links.jpeg "This is how VIEWER theme app extension block looks like on admin panel of Shopify product template")

Here's a short tutorial that will walk you through all the steps involved to set up and use the BITBYBIT VIEWER block:

<div class="responsive-video-container">
<iframe width="560" height="315" src="https://www.youtube.com/embed/FcvQAVE1tDc" title="3D Bits App For Shopify - Tutorial Explains How To Use 3D Bits App For Shopify With BITBYBIT VIEWER Theme App Extension Block" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" allowfullscreen></iframe>
</div>

### BITBYBIT PREVIEW Block

The **BITBYBIT PREVIEW** block works with a single metafield where you can paste a public project URL from Bitbybit.dev. This will create an embedding on your Shopify product page that simply loads whatever is in that public Bitbybit.dev project. It can even contain physics simulations, animations, and other interactive elements.

**Important Note:** Scenes embedded with the PREVIEW block are self-contained and **cannot** be dynamically changed by Shopify product variant inputs or other UI elements on the Shopify product page. It's a direct window to your Bitbybit.dev project.

➡️ **[Learn more about the BITBYBIT PREVIEW block](/learn/3d-bits/theme-app-extensions/bitbybit-preview)**

![Shopify theme editor showing the configuration options for the BITBYBIT PREVIEW theme app extension block, typically requiring a single URL to a public Bitbybit.dev project.](https://ik.imagekit.io/bitbybit/app/assets/start/shopify/bitbybit-preview-block.jpeg "This is how PREVIEW theme app extension block looks like on admin panel of Shopify product template")

Here's a short tutorial that will walk you through all the steps involved to set up and use the BITBYBIT PREVIEW block:

<div class="responsive-video-container">
<iframe width="560" height="315" src="https://www.youtube.com/embed/xU5seV1NQ5o" title="3D Bits App For Shopify - Tutorial Explains How To Use 3D Bits App For Shopify With BITBYBIT PREVIEW Theme App Extension Block" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" allowfullscreen></iframe>
</div>

### Showcasing 3D Gaussian Splats

If you want to scan your physical 3D products and sell them online using the revolutionary Gaussian Splatting technique, the 3D Bits app is your go-to solution.
*   **Scanning:** To create scans, we recommend using apps like **Scaniverse** on iPhone or Android devices.
*   **File Format:** Save your scans in the `.splat` file format for best compatibility and size.
*   **Upload:** Upload these `.splat` files to Shopify as "Content" (under Settings > Content > Files).
*   **Editing (Optional):** While Scaniverse offers basic editing tools, you can refine your scans further (e.g., remove noise, crop unnecessary details) with the web-based **SuperSplat editor**.
*   **Display on Shopify:** For displaying 3D Gaussian Splats on your Shopify product pages, we suggest using the new **BITBYBIT VIEWER** theme app extension block. It’s the easiest and most direct way we offer to configure and showcase these types of 3D models.

**Helpful Links:**
*   [Scaniverse App](https://scaniverse.com)
*   [SuperSplat Editor by PlayCanvas](https://playcanvas.com/supersplat/editor/)

Also, make sure to check out our tutorials to learn how this can be done step-by-step:
➡️ **[Video tutorials on how to use the 3D Bits app](/learn/3d-bits/intro)**

### Have a Great Time with 3D Bits!

We hope that these updates will be highly beneficial to you and that your Shopify webshops will look even more stunning with these enhanced 3D capabilities. These new features are available to all users of the 3D Bits app for Shopify.

If you have any questions, need help with anything, or have feedback, please feel free to contact us at any time.

Want to learn more about the original capabilities of 3D Bits for parametric and interactive configurators?
➡️ **[Read about the original release of 3D Bits and what it can do here](/blog/3d-bits-app-for-shopify)**

![Screenshot of the 3D Bits app for Shopify demo store, showcasing interactive 3D products.](https://ik.imagekit.io/bitbybit/app/assets/blog/3d-bits-app-for-shopify/3d-bits-app-for-shopify-demo-store-picture.jpeg "3D Bits app for Shopify demo store")