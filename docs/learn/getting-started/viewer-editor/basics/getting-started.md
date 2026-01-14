---
sidebar_position: 2
title: Getting Started
sidebar_label: Getting Started
description: Learn how to access the Viewer Editor and create your first 3D scene configuration.
tags: [viewer-editor, getting-started, tutorial]
---

# Getting Started with Viewer Editor

This guide will help you access the Viewer Editor and understand the initial setup process.

## Prerequisites

Before you begin, make sure you have:

1. **Active Subscription** - An enterprise-level subscription that includes Viewer Editor access
2. **3D Bits App** - The 3D Bits Shopify app installed (for Shopify users)
3. **3D Assets** - GLTF/GLB files hosted on a public URL (or other supported formats)
4. **Product Setup** - A product in your store with variants configured

:::tip Asset Requirements
Your 3D models must be hosted on a publicly accessible URL (HTTPS). Common hosting options include:
- Shopify CDN (upload via Files in Shopify admin)
- Third-party CDN services
- Your own web server
:::

## Accessing the Viewer Editor

### For Shopify Users

1. Log in to your Shopify admin panel
2. Navigate to **Apps** in the left sidebar
3. Click on **3D Bits** to open the app
4. Click **Viewer Editor** in the main dashboard

![Viewer Editor in Shopify 3D Bits App](/img/getting-started/viewer-editor/viewer-editor-in-shopify.jpg)

<details>
<summary>Credits</summary>

Car Model: Asset is CCBY 4.0, created by Eric Chadwick of Darmstadt Graphics Group GmbH, 2024. Original asset is public domain "FREE Concept Car 004" by [Unity Fan](https://sketchfab.com/3d-models/free-concept-car-004-public-domain-cc0-4cba124633eb494eadc3bb0c4660ad7e). Download and details on [GitHub](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept).

- © 2015, Khronos Group - Khronos logo
- © 2017, Khronos Group - 3D Commerce logo

</details>

### For Other Platforms

Instructions for accessing Viewer Editor on other eCommerce platforms will be added as integrations become available.

## The First Launch

When you open the Viewer Editor for the first time:

1. **Empty Canvas** - You'll see an empty 3D viewport with a default background
3. **Example Scenes** - You can load example configurations to explore

![Viewer Editor in Shopify 3D Bits App](/img/getting-started/viewer-editor/viewer-editor-first-launch.jpg)

### Loading an Example

To understand the capabilities, start by loading an example:

1. Click the **Examples** button in the bottom toolbar
2. Browse the available example configurations
3. Click on the **Example** card to populate the editor

![Viewer Editor Examples](/img/getting-started/viewer-editor/viewer-editor-examples.jpg)

Note that this particular configurator loads 4 separate GLB files and switches between them, even if only the color is changing. In the future tutorials we will learn how to use KHR_materials_variants and GLTF parsing features to make configurators by using a single GLTF file.

![Viewer Editor Chair Example](/img/getting-started/viewer-editor/viewer-editor-chair-example.jpg)

If you want to understand how variants are assigned to each GLB file - open the model accordion values and inspect the **Simple Matches** panel.

![Viewer Editor Simple Variant Matching](/img/getting-started/viewer-editor/viewer-editor-simple-variant-matching.jpg)

## Creating Your First Scene

Follow these steps to create a basic scene:

### Step 1: Add a Model

1. Click the **+ Add Model** button in the left bar
2. In the dialog, enter your model's public URL (if using Shopify, copy link from Content > Files)
3. Give your model a name (e.g., "Main Product")
4. Click **Update**

![Add First Model](/img/getting-started/viewer-editor/viewer-editor-add-first-model.jpg)

The model will load in the 3D viewport. Depending on file size, this may take a few seconds.

### Step 2: Adjust the Camera

The scene automatically contains the camera, but your model may be too large or too small to see it - depending on your model size you have two options:

1. You can adjust the scale of your model
2. Adjust the position of the camera

While changing default camera position slightly is totally fine, we suggest to try and make 1 unit of your model equal 1 meter in reality. This scale usually helps ensure that default light & shadow settings will look good on your model. Having very large scenes may require you to adjust various shadow bias and other properties.

For now though, you should see your model on the white background canvas on the right side of Viewer Editor. Yor "Arc Rotate Camera" can now move around the object, zoom in and pan:

1. **Rotate** - Left-click and drag in the viewport
2. **Zoom** - Scroll wheel or pinch gesture
3. **Pan** - Right-click and drag (or Shift + left-click)

### Step 3: Configure Basic Settings

1. Click on your model in the **Models List** (left panel)
2. The **Properties Panel** will open below - showing model settings
3. Adjust position, rotation, or scale if needed

### Step 4: Set Background Color

1. Click the **Scene** tab in the toolbar
2. Expand the **Background** section
3. Click the color picker and choose your color
4. Hit Update button too see the change in the viewport

![Add First Model](/img/getting-started/viewer-editor/viewer-editor-change-background-color.jpg)

### Step 5: Export Your Configuration

1. Click the **Copy** button in the bottom toolbar
2. The JSON configuration is copied to your clipboard
3. You can now paste it into your product metafield in Shopify product page

Alternatively, click **Download** to save the configuration as a JSON file.

![Copy, Download & Load Buttons](/img/getting-started/viewer-editor/viewer-editor-3d-bits-copy-download-load.jpg)

## Understanding the JSON Output

When you export, you get JSON like this:

```json
{
    "$schema": "https://app-store.bitbybit.dev/files/ecommerce/viewer-editor/viewer-scene-schema-v0.21.1.json",
    "models": [
        {
        "name": "Main Product",
        "url": "https://example.com/model.glb",
        "position": [0, 0, 0],
        "rotation": [0, 0, 0],
        "scaling": [1, 1, 1]
        }
    ],
    "backgroundColor": "#f0f0f0"
}
```

This configuration is ready to use with the BITBYBIT VIEWER block. You can always preview JSON in Viewer Editor by clicking on the **Swap UI** button:

![Viewer JSON Editor](/img/getting-started/viewer-editor/viewer-json-editor.jpg)

Note that when you switch between UI and JSON the values change automatically. If you edit settings in UI - they will get reflected in the JSON when you swap. And other way around - when you do changes in the JSON and swap back to UI - the changes you made to JSON will become active in UI. This is true for as long as UI is valid and you adhere to provided schema in JSON.

## Next Steps

Now that you've created a basic scene, you can:

- [Learn the Interface](./interface-overview.md) - Understand all panels and controls
- [Add More Models](../models/adding-models.md) - Work with multiple models

## Common First-Time Questions

### Can I save my work?

The editor doesn't have a built-in save feature. Always export your configuration (Copy or Download) before closing the editor. You can reload it later using the **Upload** button.

### How do I test variants?

Use the **Variant Simulator** in the toolbar.

### My model isn't loading

Check that:
- The URL is publicly accessible (test it in a browser)
- The URL uses HTTPS (not HTTP)
- The file format is supported (GLB, GLTF, PLY, SPLAT, OBJ, STL)
- The file size is reasonable (under 50MB recommended)
