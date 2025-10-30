---
sidebar_position: 1
title: "BITBYBIT VIEWER Block for Shopify's '3D Bits' App"
sidebar_label: BITBYBIT VIEWER
description: Learn how to use the BITBYBIT VIEWER theme app extension block in Shopify's "3D Bits" app to display static 3D models and configure complex scenes on your product pages without coding.
tags: [shopify, 3d-bits]
---

# The "BITBYBIT VIEWER" Block for Shopify (No-Code)

The **BITBYBIT VIEWER** is a theme app extension block provided by `3D Bits` app for Shopify. It offers the simplest way to create 3D model configurators from static assets on your product pages **without needing to interact with the Bitbybit coding editors.**

You can upload your 3D models to the Shopify CDN or any other publicly accessible cloud storage, and then use the URL of the file to display it directly on your product page using this block. For more advanced scenarios, the VIEWER block also allows you to load and configure multiple 3D models at once using a special JSON configuration, which can be easily created with our new **Viewer Editor tool**. These files can be linked to product options, such as size or color. You can also parse files such as GLTF to use material variants.

![A Shopify product page showcasing a 3D model using the BITBYBIT VIEWER block.](https://ik.imagekit.io/bitbybit/app/assets/start/shopify/bitbybit-viewer-theme-app-extension-block-shopify-3d-bits.jpeg "Demo store product using the BITBYBIT VIEWER block")
*Demo store product that uses the BITBYBIT VIEWER block.*

## Examples

Here are a few examples from our demo store that utilize the BITBYBIT VIEWER block:
*   [Viewer with Model URL only (Arabic Archway Vase)](https://bitbybit-dev-3d-configurators.myshopify.com/products/arabic-archway-vase-for-3d-printing)
*   [Configurable 3D Chair Product (using Scene Config JSON for variants)](https://bitbybit-dev-3d-configurators.myshopify.com/products/chair-configurator-no-code-variants)
*   [Viewer with Scene Config JSON (Serenity Swirl Vases)](https://bitbybit-dev-3d-configurators.myshopify.com/products/serenity-swirl-vases)

## Supported 3D Model Formats

Currently, the BITBYBIT VIEWER block supports the following 3D model formats:
`gltf`, `glb`, `splat`, `ply`, `obj`, `stl`

## How Does It Work? (Basic Setup - Single Model)

1.  **Upload Your 3D Model:**
    *   Upload your 3D model file (e.g., a `.glb` or `.gltf` file) to the Shopify CDN (under "Content" > "Files" in your Shopify admin) or any other publicly accessible cloud storage service (like AWS S3, Google Cloud Storage, etc.).
    *   Obtain the direct public URL to this file.

2.  **Configure in Shopify ("3D Bits" App):**
    Assuming you have already installed the "3D Bits" app in your Shopify store:
    *   **Product Template & Metafield Linking:**
        1.  Create or edit a product template in your Shopify theme customizer.
        2.  Add the **BITBYBIT VIEWER** block from the "3D Bits" app to this template.
        3.  In the block's settings, dynamically link the **"Model URL"** setting of the block to the product metafield named **"3D Bits Model Url"**. This metafield is provided by our app.

        ![The BITBYBIT VIEWER block settings in the Shopify theme editor, with various settings dynamically linked to product metafields.](https://ik.imagekit.io/bitbybit/app/assets/start/shopify/3d-bits-bitbybit-viewer-theme-app-extension-configuration-dynamic-links.jpeg "BITBYBIT VIEWER block with dynamically linked settings")
        *BITBYBIT VIEWER block after dynamically linking settings to metafields.*

    *   **Enter the Model URL in Product Metafields:**
        1.  Navigate to the specific product in your Shopify admin where you want to display the 3D model.
        2.  Find the "Metafields" section for that product.
        3.  Locate the **"3D Bits Model Url"** metafield.
        4.  Paste the public URL of your 3D model file into this metafield.

        ![The Shopify product admin page showing the "3D Bits Model Url" metafield with a URL to a 3D model file.](https://ik.imagekit.io/bitbybit/app/assets/start/shopify/bitbybit-model-preview-url-metafield.jpeg "Pasting the file URL into the metafield")
        *Paste your file URL into this metafield.*

    After completing these steps and previewing your product page, you should see the 3D model displayed.

## Building More Complex 3D Experiences with Viewer Editor

Sometimes, simply loading a single 3D model isn't enough. You might want to:
*   Customize camera settings (initial position, target, field of view).
*   Set up specific lighting (types, intensity, color, position).
*   Enable a skybox for realistic environment reflections.
*   Load multiple 3D models into the same scene.
*   Make different 3D models or their properties react to changing Shopify product variants (e.g., show a red chair model when the "Red" variant is selected, and a blue one for "Blue").
*   Define points of interest

This is where the **Scene Config JSON** functionality comes in. We have recently released a new **Viewer Editor tool** within the "3D Bits" app that allows you to create this JSON configuration through a simple, visual user interface. With this editor, you can load multiple 3D models, adjust camera settings, enable skyboxes, configure lighting, add shadows, and more, all without writing code.

**In-Depth Tutorial: Viewer Editor & Chair Configurator**
We highly recommend watching this tutorial where Matas explains how to use the Viewer Editor and set up an interactive 3D chair configurator using Scene Config JSON:

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

**The Viewer Editor Interface:**
Here's a glimpse of how the Viewer Editor looks within the "3D Bits" app environment:

![The Bitbybit Viewer Editor interface within the Shopify "3D Bits" app, showing tools for configuring a 3D scene.](https://ik.imagekit.io/bitbybit/app/assets/start/shopify/3d-bits-viewer-editor-on-shopify-by-bitbybit.jpeg "Viewer editor for scene configurations")
*Viewer editor that helps create 3D scene configurations.*

**Using the Scene Config JSON:**
1.  Use the Viewer Editor tool to create your desired scene configuration.
2.  The editor will generate a JSON output.
3.  Copy this entire JSON string.
4.  In your Shopify product admin, paste this JSON configuration into the product metafield named **"3D Bits Scene Config"**.

    ![The Shopify product admin page showing the "3D Bits Scene Config" metafield where the JSON configuration is pasted.](https://ik.imagekit.io/bitbybit/app/assets/start/shopify/shopify-3d-bits-viewer-scene-config-json.jpeg "Pasting Scene Configuration JSON into the metafield")
    *Paste your Scene Configuration JSON into this metafield.*

    If you've configured the BITBYBIT VIEWER block in your product template to dynamically link its "Scene Config JSON" setting to this metafield, the viewer will use your JSON to render the complex scene.

    **Example Output with Scene Config JSON:**
    ![A Shopify product page showing a 3D model of vases rendered with custom lighting and shadows, configured via Scene Config JSON using the BITBYBIT VIEWER block.](https://ik.imagekit.io/bitbybit/app/assets/start/shopify/product-page-viewer-serenity-swirl-shopify.jpeg "Product page using VIEWER block and Scene Config JSON")
    *Demo store product that uses the BITBYBIT VIEWER block and Scene Configuration metafield.*

### What if JSON is too large for the metafield?

Save your JSON configurator as a file, upload it to Shopify CDN as a file. Copy URL and paste it into the metafield, this will inform 3D Bits app to load the contents of the file.

### Editing the Scene Config JSON

While our Viewer Editor is the recommended way to create and manage the Scene Config JSON, you can also edit the JSON directly using any text editor. For a better editing experience with features like syntax highlighting and autocompletion (intellisense), we provide a JSON schema.

*   **JSON Schema:** You can find the schema [here](https://ik.imagekit.io/bitbybit/app/assets/start/shopify/viewer-scene-config-schema-0-20-9.json). (Note: This schema link points to version `0.20.9`. The schema may be updated in the future, so ensure you refer to the latest version compatible with your "3D Bits" app version.)
    Many modern code editors (like VS Code) can use this schema to provide validation and autocompletion as you edit the JSON.

## Video Tutorial: BITBYBIT VIEWER Block Setup

For a comprehensive step-by-step guide on setting up and using the BITBYBIT VIEWER block, please watch this tutorial:

<div class="responsive-video-container">
  <iframe 
    width="560" 
    height="315" 
    src="https://www.youtube.com/embed/FcvQAVE1tDc" 
    title="Tutorial Explains How To Use 3D Bits App For Shopify With BITBYBIT VIEWER Theme App Extension Block" 
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
    allowfullscreen>
  </iframe>
</div>

The BITBYBIT VIEWER block, especially when combined with the Scene Config JSON generated by our Viewer Editor, provides a powerful yet accessible no-code solution for creating sophisticated 3D product presentations on your Shopify store.