---
sidebar_position: 4
title: "Theme App Extension Blocks"
sidebar_label: Theme App Extension Blocks
description: Learn about Theme App Extension Blocks that 3D Bits application makes available to you.
tags: [shopify, 3d-bits]
---

# What are Theme App Extension Blocks?

Shopify uses Theme App Extension Blocks to let third-party apps like 3D Bits render content on your store. You can place these blocks almost anywhere on your site—product pages, blog posts, your homepage, and more.

# Understanding Shopify Templates

Theme App Extension Blocks live inside Shopify templates. Each product in your store uses a template—new stores typically start with a Default Template. Templates let you customize multiple pages at once instead of editing each page individually.

Think of templates like blueprints for your pages. If you have different types of products, you'll likely need different templates. For example, if only some products need 3D viewers while others don't, you'd create separate templates for each type. The same goes for different configurator settings—you might want unique 3D configurations for different product families.

Without templates, you'd have to apply the same customizations to every single page, which would be incredibly time-consuming.

:::tip Learn More
Check out the [official Shopify documentation on templates](https://help.shopify.com/en/manual/online-store/themes/theme-structure/templates) for detailed information.
:::

# How to Edit a Product Template

To access your product's template:

1. Open any product page in your Shopify admin
2. Look for the **Theme Template** card at the bottom of the right sidebar
3. Click the eye icon to inspect and edit the template's contents

![Shopify Product Template](/img/3d-bits/tutorials/template-card.jpg)

# How to Create a New Template

New templates are typically created by branching from existing ones. Here's how:

1. Navigate to **View Template** for any product
2. Click the template name (usually "Default Product") at the top center of the screen
3. Scroll down if needed to find the blue **+ Create template** button
4. Click the button and enter a name for your new template
5. Choose which existing template to use as the foundation

# Working with Blocks in Templates

When you edit a template, you'll see various blocks you can add. Shopify provides native blocks like Quantity Selector, Variant Picker, and Buy Buttons. Apps can create their own blocks too—this is how 3D Bits integrates with your store.

![Theme app extension blocks listed](/img/3d-bits/tutorials/theme-app-extension-blocks.jpg)

# The 3D Bits Extension Blocks

3D Bits provides four Theme App Extension Blocks, each designed for different use cases:

## BITBYBIT VIEWER

Best for displaying static 3D models and creating no-code configurators. Use this block if you have GLTF models, 3DGS files, or other compatible 3D assets ready to display.

Once you've added this block to your template, check out the [BITBYBIT VIEWER Settings Tutorial](../bitbybit-viewer/settings) to configure it.

## BITBYBIT RUNNER

Built for parametric geometry and custom configurators. This block works with visual programming editors or TypeScript to generate 3D content dynamically.

After adding this block, see the [BITBYBIT RUNNER Settings Tutorial](../bitbybit-runner/settings) for setup instructions.

## BITBYBIT APPS

A Pro plan feature for developers building custom single-page 3D experiences with full control.

Learn more in the [BITBYBIT APPS Settings Tutorial](../bitbybit-apps/settings).

## BITBYBIT PREVIEW

Embed public projects from the [bitbybit.dev](https://bitbybit.dev) platform directly into your store.

See the [BITBYBIT PREVIEW Settings Tutorial](../bitbybit-preview/settings) for configuration details.

# Common Settings

Some settings of these blocks are shared. You can check [common settings documentation](./common-settings).