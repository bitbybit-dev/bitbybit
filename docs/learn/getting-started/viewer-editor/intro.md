---
sidebar_position: 1
title: Introduction to Viewer Editor
sidebar_label: Viewer Editor Overview
description: Learn about Viewer Editor, a powerful no-code 3D eCommerce solution for building interactive 3D product configurators and custom scenes using GLTF and 3DGS assets.
tags: [getting-started, viewer-editor, shopify]
---

# Viewer Editor

Viewer Editor is a powerful no-code 3D eCommerce solution that enables you to build interactive 3D product configurators and custom 3D scenes using your ready made assets such as GLTF and 3DGS. Create sophisticated product visualizations without writing a single line of code.

![Viewer Editor Screenshot](/img/getting-started/viewer-editor/viewer-editor.jpg)

## Availability

Viewer Editor is an **Enterprise-level feature** currently available exclusively through our Shopify integration. It is not included in Silver or Gold subscription plans and does not offer a freemium tier. 

**Current Status:**
- ✅ Available for Shopify customers via our [3D Bits app](../../3d-bits/intro)
- 🚧 Integrations with other eCommerce platforms coming soon

If you need Viewer Editor for a non-Shopify eCommerce platform, please contact us to discuss a custom service, integration & maintenance contract.

## Integrations

The Viewer Editor works seamlessly with our **3D Bits** Shopify app. The JSON configuration you create in the editor can be integrated into your Shopify store through the **3D Bits Scene Config** metafield, allowing you to link 3D assets, points of interest, and dimensions to your product variants.

## What is Viewer Editor?

Instead of manually writing JSON configuration code, the Viewer Editor provides an intuitive interface where you can:

- **Load and arrange multiple 3D models** in a single scene
- **Configure variant matching** to show/hide models based on product options
- **Manage GLTF/GLB nodes and material variants** visually
- **Set up camera positions and controls** with visual feedback
- **Design advanced backgrounds** including gradients, images, and HDR skyboxes
- **Add custom lighting and shadows** with real-time preview
- **Create dimension annotations** for technical product visualization
- **Define points of interest** for guided navigation
- **Customize loading screens** with logos and colors
- **Configure animated rotations** per model or globally

## How It Works

The Viewer Editor generates valid Scene JSON Configuration that you can use in two ways:

1. **Copy to clipboard** - Click the Copy button and paste directly into the Scene Config metafield
2. **Download as file** - Click the Download button in the bottom toolbar, upload to Shopify CDN, and reference the URL

The generated JSON follows the **Viewer Scene Schema** and is automatically validated.

## Key Features

### Visual Model Management
Import 3D models (GLB, GLTF, PLY, SPLAT, OBJ, STL) and position them in your scene using visual controls. The editor provides a real-time 3D preview of your configuration.

### Variant Matching System
Connect product variants to 3D models or specific parts:
- Show different models based on color, size, or custom options
- Hide/show GLTF nodes dynamically
- Apply material variants from GLTF files
- Use the **option name edit feature** to easily rename input field mappings when themes or apps update

### Advanced Scene Configuration
Access powerful features not available through basic block settings:
- **Advanced backgrounds**: Linear gradients, radial gradients, background images, HDR skyboxes
- **Custom lighting**: Directional lights with shadows, intensity, and color control
- **Camera controls**: Arc rotate camera with limits, sensitivity, and zoom settings
- **Loading screens**: Custom logos, colors, progress bars
- **Dimension annotations**: Linear, angular, radial, diametral, ordinate, and bounding box dimensions
- **Points of interest**: Interactive hotspots with camera animations

## Subscription Plans

Available features in the Viewer Editor depend on your subscription plan, for Shopify, please refer to [subscription plans](https://bitbybit.dev/learn/3d-bits/plans/subscription-plans#bitbybit-viewer-no-code) for details on which features are included in each tier.

## Getting Started

1. **Access the Viewer Editor** from the 3D Bits app dashboard in your Shopify admin
2. **Import your 3D models** by providing public URLs
3. **Configure your scene** using the visual interface
4. **Test variants** to ensure they work correctly
5. **Export the configuration** using Copy or Download
6. **Link to product metafields** for dynamic per-product configurations

## Video Tutorials

### Chair Configurator with Viewer Editor
Learn how to build an interactive 3D chair configurator using the Viewer Editor and GLTF material variants:

<div class="responsive-video-container">
  <iframe 
    width="560" 
    height="315" 
    src="https://www.youtube.com/embed/7R6ueAHGFhg" 
    title="3D Configurators On Shopify Product Pages with Bitbybit Viewer Editor And GLTF Assets (No Code)" 
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
    allowfullscreen>
  </iframe>
</div>

## Related Documentation

- [BITBYBIT VIEWER Block](../../3d-bits/theme-app-extensions/bitbybit-viewer.md) - Overview of the viewer block
- [Block Settings](../../3d-bits/tutorials/bitbybit-viewer/settings) - Detailed explanation of all viewer settings which accept Viewer Editor integration
