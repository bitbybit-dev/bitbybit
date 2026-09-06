---
sidebar_position: 2
title: "BITBYBIT VIEWER Block for Shopify's '3D Bits' App"
sidebar_label: BITBYBIT VIEWER
description: Place a published project's 3D view in an exact spot in your product template, and the older by-hand metafield route it grew out of.
tags: [shopify, 3d-bits, theme-blocks, metafields]
---

import Version from '@site/src/components/Version';

# The "BITBYBIT VIEWER" Block for Shopify (No-Code)

The **BITBYBIT VIEWER** is a theme app extension block provided by the `3D Bits` app for Shopify. It renders a product's 3D scene in the exact spot in your template where you place it.

Nearly everything about the scene itself is built in **Composer**, the app's visual editor, and published from there. The block's job today is placement, not configuration.

![A Shopify product page showcasing a 3D model using the BITBYBIT VIEWER block.](https://ik.imagekit.io/bitbybit/app/assets/start/shopify/bitbybit-viewer-theme-app-extension-block-shopify-3d-bits.jpeg "Demo store product using the BITBYBIT VIEWER block")
*Demo store product that uses the BITBYBIT VIEWER block.*

## The route most stores use now

Three steps, none of which involve copying anything by hand.

1.  **Build the scene in Composer.** Upload your models, wire them to product options, style the option panel. [Composer](/learn/3d-bits/composer/intro) covers this.
2.  **Link the products** the project belongs to, on the project's page in the 3D Bits admin.
3.  **Publish.** Publishing uploads your scene as a file and points every linked product at it, together with the project's storefront settings.

At that point the [app embed](/learn/3d-bits/theme-blocks/app-embed) already draws the configurator on those product pages, and you need no block at all.

You add this block when you want the 3D view somewhere the embed's placement setting cannot reach. Set the project's **Placement on the product page** to **Theme template blocks** in its Storefront settings, publish, then add a BITBYBIT VIEWER block to the product template. The embed stands down for those products so the two never draw over each other. [Switching a project to blocks](/learn/3d-bits/theme-blocks/overview#switching-a-project-to-blocks) has the details, including the one way it can leave a page blank.

:::tip Leave Scene JSON Configuration empty
When the block's **Scene JSON Configuration** setting is empty, it uses whatever the product's published project provides. You do not need to link it to a metafield yourself any more. Computed pricing, option availability and a paused configurator come across with it.
:::

To spread the option panel around the template as well, add [GUI CONTROLS blocks](/learn/3d-bits/theme-blocks/bitbybit-gui) beside it.

## Examples

Here are a few examples from our demo store that use the BITBYBIT VIEWER block:
*   [Viewer with Model URL only (Arabic Archway Vase)](https://bitbybit-dev-3d-configurators.myshopify.com/products/arabic-archway-vase-for-3d-printing)
*   [Configurable 3D Chair Product (using Scene Config JSON for variants)](https://bitbybit-dev-3d-configurators.myshopify.com/products/chair-configurator-no-code-variants)
*   [Viewer with Scene Config JSON (Serenity Swirl Vases)](https://bitbybit-dev-3d-configurators.myshopify.com/products/serenity-swirl-vases)

## Supported 3D Model Formats

The BITBYBIT VIEWER block supports the following 3D model formats:
`gltf`, `glb`, `splat`, `ply`, `obj`, `stl`

The same six extensions Composer accepts. [Supported Formats](/learn/3d-bits/composer/models/supported-formats) compares what each one can do.

## Manual route (legacy / advanced)

Before the app could publish projects, this block was configured entirely by hand: you pasted a model URL or a scene configuration into a product metafield, and linked the block's settings to those metafields in the theme editor. That route still works, and the rest of this page describes it.

:::warning A hand-filled product is not picked up by the app embed
The app embed only renders products that carry a project published from the app. A product you configure by hand needs a BITBYBIT VIEWER block placed in its template - without one, nothing appears on the page.
:::

### How Does It Work? (Basic Setup - Single Model)

1.  **Upload your 3D model:**
    *   Upload your 3D model file (for example a `.glb` or `.gltf` file) to the Shopify CDN, under **Content** then **Files** in your Shopify admin, or to any other publicly accessible cloud storage.
    *   Obtain the direct public URL to this file.

2.  **Configure in Shopify ("3D Bits" app):**
    Assuming you have already installed the "3D Bits" app in your Shopify store:
    *   **Product template and metafield linking:**
        1.  Create or edit a product template in your Shopify theme customizer.
        2.  Add the **BITBYBIT VIEWER** block from the "3D Bits" app to this template.
        3.  In the block's settings, dynamically link the **"Model URL"** setting of the block to the product metafield named **"3D Bits Model Url"**. This metafield is provided by our app - see [Metafields](/learn/3d-bits/admin/metafields).

        ![The BITBYBIT VIEWER block settings in the Shopify theme editor, with various settings dynamically linked to product metafields.](https://ik.imagekit.io/bitbybit/app/assets/start/shopify/3d-bits-bitbybit-viewer-theme-app-extension-configuration-dynamic-links.jpeg "BITBYBIT VIEWER block with dynamically linked settings")
        *BITBYBIT VIEWER block after dynamically linking settings to metafields.*

    *   **Enter the model URL in the product's metafields:**
        1.  Navigate to the specific product in your Shopify admin where you want to display the 3D model.
        2.  Find the "Metafields" section for that product.
        3.  Locate the **"3D Bits Model Url"** metafield.
        4.  Paste the public URL of your 3D model file into this metafield.

        ![The Shopify product admin page showing the "3D Bits Model Url" metafield with a URL to a 3D model file.](https://ik.imagekit.io/bitbybit/app/assets/start/shopify/bitbybit-model-preview-url-metafield.jpeg "Pasting the file URL into the metafield")
        *Paste your file URL into this metafield.*

    After completing these steps and previewing your product page, you should see the 3D model displayed.

## Building More Complex 3D Experiences with Composer

Loading a single model is often not enough. You might want to:
*   Customise camera settings (initial position, target, field of view).
*   Set up specific lighting (types, intensity, colour, position).
*   Enable a skybox for realistic environment reflections.
*   Load multiple 3D models into the same scene.
*   Make different 3D models or their properties react to product options, for example showing a red chair for the "Red" option and a blue one for "Blue".
*   Define points of interest.

All of that is a scene configuration, and **Composer** is the visual editor that writes it for you. Publishing a project is the normal way to get it onto a product, as described at the top of this page. The steps below are the manual alternative, for a product you are configuring by hand.

**In-depth tutorial: Composer and a chair configurator**
This tutorial walks through Composer and an interactive 3D chair configurator:

<div className="responsive-video-container">
  <iframe 
    width="560" 
    height="315" 
    src="https://www.youtube.com/embed/7R6ueAHGFhg" 
    title="3D Configurators On Shopify Product Pages with Composer And GLTF Assets (No Code)" 
    frameBorder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" 
    allowFullScreen>
  </iframe>
</div>

**Composer interface:**
Here is how Composer looks within the "3D Bits" app:

![The Composer interface within the Shopify "3D Bits" app, showing tools for configuring a 3D scene.](https://ik.imagekit.io/bitbybit/app/assets/start/shopify/3d-bits-viewer-editor-on-shopify-by-bitbybit.jpeg "Composer for scene configurations")
*Composer, where 3D scene configurations are built.*

**Using the scene configuration by hand:**
1.  Use Composer to create your scene configuration.
2.  Download or copy the JSON it produces.
3.  In your Shopify product admin, paste it into the product metafield named **"3D Bits Scene Config"**.

    ![The Shopify product admin page showing the "3D Bits Scene Config" metafield where the JSON configuration is pasted.](https://ik.imagekit.io/bitbybit/app/assets/start/shopify/shopify-3d-bits-viewer-scene-config-json.jpeg "Pasting Scene Configuration JSON into the metafield")
    *Paste your Scene Configuration JSON into this metafield.*

    The block picks this up on its own as long as its **Scene JSON Configuration** setting is left empty. You can also link that setting to the metafield explicitly, which older setups did.

    **Example output with a scene configuration:**
    ![A Shopify product page showing a 3D model of vases rendered with custom lighting and shadows, configured via Scene Config JSON using the BITBYBIT VIEWER block.](https://ik.imagekit.io/bitbybit/app/assets/start/shopify/product-page-viewer-serenity-swirl-shopify.jpeg "Product page using VIEWER block and Scene Config JSON")
    *Demo store product that uses the BITBYBIT VIEWER block and Scene Configuration metafield.*

### What if JSON is too large for the metafield?

Save your scene configuration as a file, upload it to the Shopify CDN, then paste the file's URL into the metafield instead of the JSON. 3D Bits recognises a URL and loads the file's contents. This is also what publishing a project does for you.

### Editing the Scene Config JSON

Composer is the recommended way to create and manage a scene configuration, but you can also edit the JSON directly in any text editor. For syntax highlighting and autocompletion we provide a JSON schema.

*   **JSON Schema:** you can find the schema [here](https://app-store.bitbybit.dev/files/ecommerce/viewer-editor/viewer-scene-schema-v<Version />.json). This link points to version `<Version />`. The schema is updated as the app gains features, so refer to the version that matches your "3D Bits" app.
    Many modern code editors, such as VS Code, use this schema to validate and autocomplete as you type.

## Video Tutorial: BITBYBIT VIEWER Block Setup

For a step-by-step guide to setting up and using the BITBYBIT VIEWER block, watch this tutorial:

<div className="responsive-video-container">
  <iframe 
    width="560" 
    height="315" 
    src="https://www.youtube.com/embed/FcvQAVE1tDc" 
    title="Tutorial Explains How To Use 3D Bits App For Shopify With BITBYBIT VIEWER Theme App Extension Block" 
    frameBorder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" 
    allowFullScreen>
  </iframe>
</div>
