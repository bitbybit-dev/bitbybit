---
sidebar_position: 2
title: "BITBYBIT PREVIEW Theme App Extension Block Settings"
sidebar_label: Block Settings
description: Learn about various settings that BITBYBIT PREVIEW theme app extension block provides to embed full bitbybit.dev projects via iframe.
tags: [shopify, 3d-bits]
---

# Block Settings

This guide explains all available settings for the **BITBYBIT PREVIEW** theme app extension block in Shopify. Use this block to embed complete published bitbybit.dev projects as interactive iframes on your product pages.

You'll find the BITBYBIT PREVIEW settings in your theme editor after adding the block to a template.

## What is BITBYBIT PREVIEW?

BITBYBIT PREVIEW allows you to **embed full published projects** from [bitbybit.dev](https://bitbybit.dev) directly into your Shopify store. Unlike VIEWER (displays models) or RUNNER (executes scripts), PREVIEW embeds an entire interactive experience via iframe.

:::warning No Shopify Communication Layer
At this time, PREVIEW has **no communication layer** between Shopify's UI (variants, options, inputs) and your embedded bitbybit.dev project. Projects must be **self-contained** within the bitbybit.dev platform and cannot respond to Shopify product selections. This limitation may change in future updates.
:::

### Key Characteristics

- **Full Experience** - Embeds complete bitbybit.dev projects with all interactivity
- **iframe-Based** - Loads the project in a sandboxed iframe
- **No Code Required** - Simply publish your project on bitbybit.dev and link it
- **Self-Contained** - All logic runs within the bitbybit.dev environment
- **No Shopify Integration** - Cannot respond to product variants or form inputs

### Typical Use Cases

- **General purpose 3D presentations** - Self-contained product demonstrations and tours
- **Interactive experiences** - 3D product explorations that don't need Shopify data
- **Educational content** - Product training or feature explanations
- **Prototyping** - Quick testing of bitbybit.dev projects in your store

:::info Not Ideal for Configurators
Since PREVIEW cannot receive Shopify variant data or form inputs, it's **not suitable for product configurators** that need to respond to customer selections. For configurators, use [VIEWER](../bitbybit-viewer/settings), [RUNNER](../bitbybit-runner/settings) or [APPS](../bitbybit-apps/settings) blocks instead.
:::

### When to Use PREVIEW vs Other Blocks

**Use PREVIEW when:**
- You have a self-contained published project on bitbybit.dev
- Your project doesn't need to respond to Shopify variants or inputs
- You want general purpose 3D product presentations
- You're prototyping without needing Shopify integration

**DON'T use PREVIEW when:**
- You need the 3D experience to respond to variant selections
- You're building a product configurator
- You need to pass Shopify data to your 3D experience

**Use VIEWER, RUNNER or APPS instead when:**
- Building configurators that respond to customer selections
- Need integration with Shopify variants and form inputs
- Require dynamic updates based on product options

## Available Settings

### Product-Specific Settings
- [Project Preview URL](#project-preview-url)

### Global Settings
- [Show Fullscreen Button](#show-fullscreen-button)
- [Try to Prepend](#try-to-prepend)
- [Prepend With Query Selector](#prepend-with-query-selector)
- [Remove Children Before Prepend](#remove-children-before-prepend)

## Dynamic vs. Global Settings

:::info Common Setting Concept
Understanding which settings should be product-specific vs. global is important for all 3D Bits blocks. See [Common Settings: Dynamic vs. Global Settings](../getting-started/common-settings#dynamic-vs-global-settings) for the full explanation and [How to Link Settings to Metafields](../getting-started/common-settings#how-to-link-settings-to-metafields) for step-by-step instructions.
:::

### PREVIEW-Specific Recommendations

**Settings you should link to metafields** (vary per product):
- [Project Preview URL](#project-preview-url) - Different products embed different projects

**Settings that typically remain global** (configured once):
- [Show Fullscreen Button](#show-fullscreen-button)
- Canvas positioning options ([Try to Prepend](#try-to-prepend), etc.)

## Product-Specific Settings

### Project Preview URL

The Project Preview URL setting specifies which bitbybit.dev project to embed in the iframe.

#### Format

Provide a full URL to your published bitbybit.dev project:
```
https://bitbybit.dev/app/bitbybit/project-id/scirpt-id/preview
```

#### How to Get Your Project URL

1. **Create and publish your project** on [bitbybit.dev](https://bitbybit.dev)
2. **Open your published project** in the bitbybit.dev viewer
3. **Copy the preview URL** from your browser's address bar
4. **Paste it** into this setting field

#### Valid URLs

The block only accepts URLs that start with:
```
https://bitbybit.dev/
```

Any other domain will be rejected for security reasons. If you provide an invalid URL, you'll see an error message displayed instead of the iframe.

#### Linking to Metafields

Since different products typically showcase different projects, you should:

1. **Create a product metafield** for the preview URL (e.g., `bitbybit_preview_url`)
2. **Link this setting** to that metafield using the cylinder icon
3. **Set different URLs** for each product in Shopify's product editor

See [How to Link Settings to Metafields](../getting-started/common-settings#how-to-link-settings-to-metafields) for detailed instructions.

#### Query Parameters

If your bitbybit.dev project supports query parameters for customization, you can include them in the URL:
```
https://bitbybit.dev/app/preview/your-project-id?color=red&size=large
```

However, dynamic parameter passing from Shopify variants to the iframe requires custom implementation. The PREVIEW block doesn't automatically pass variant data to the iframe.

:::tip
For projects that need to respond to Shopify variants, consider using VIEWER, RUNNER or APPS blocks instead, which have native variant integration.
:::

## Global Settings

### Show Fullscreen Button

This is a common setting shared across multiple blocks. See the [Common Settings: Show Fullscreen Button](../getting-started/common-settings#show-fullscreen-button) documentation for detailed information.

:::tip PREVIEW-Specific
Fullscreen mode is especially valuable for embedded projects, as iframes can feel constrained at default sizes. Enabling this gives users a better experience when exploring your bitbybit.dev projects.
:::

---

### Try to Prepend

This is a common setting shared across multiple blocks. See the [Common Settings: Try to Prepend](../getting-started/common-settings#try-to-prepend) documentation for detailed information.

:::tip PREVIEW-Specific
Commonly used to position the embedded project iframe in the product media gallery, allowing it to function as a product visualizer alongside or in place of product photos.
:::

---

### Prepend With Query Selector

This is a common setting shared across multiple blocks. See the [Common Settings: Prepend With Query Selector](../getting-started/common-settings#prepend-with-query-selector) documentation for detailed information including:
- What is a query selector
- Default value explanation
- Common selector patterns
- How to find the right selector
- Example selectors for popular themes

---

### Remove Children Before Prepend

This is a common setting shared across multiple blocks. See the [Common Settings: Remove Children Before Prepend](../getting-started/common-settings#remove-children-before-prepend) documentation for detailed information including common use cases and cautions.

---

## iframe Considerations

### Performance

iframe-embedded content has different performance characteristics:

- **Initial load** - Downloads the entire bitbybit.dev platform
- **Isolation** - Runs in separate execution context
- **Resources** - May load duplicate libraries if your store also uses them
- **Caching** - Browser may cache bitbybit.dev resources across page views

### Responsive Design

The iframe automatically:
- Scales to fit its container
- Supports fullscreen mode
- Handles viewport changes

However, the embedded bitbybit.dev project must also be responsive. Test your published project at different screen sizes before embedding.

### Communication Limitations

:::warning Current Limitation
At this time, the PREVIEW block has **no communication layer** between Shopify and the embedded bitbybit.dev project. This architectural limitation may be addressed in future updates.
:::

The PREVIEW block currently:
- ❌ Cannot read Shopify product variants or options
- ❌ Cannot receive data from Shopify form inputs
- ❌ Cannot respond to customer selections on the product page
- ❌ Cannot trigger Shopify cart actions
- ❌ Cannot access Shopify theme data
- ✅ Works only with self-contained bitbybit.dev projects
- ✅ Sandboxed

**What This Means:**
- Your embedded project must be **fully self-contained**
- All interactivity happens **within the bitbybit.dev environment only**
- Best suited for **general purpose presentations** and demonstrations
- **Not suitable for configurators** that need Shopify integration

**For Projects Requiring Shopify Integration:**
- Use [RUNNER](../bitbybit-runner/settings) for parametric scripts with variant integration
- Use [APPS](../bitbybit-apps/settings) for custom applications with full control
- Use [VIEWER](../bitbybit-viewer/settings) for simple 3D model display with basic interaction

:::tip Future Development
We are exploring ways to enable communication between PREVIEW iframes and Shopify in future updates. This would allow embedded bitbybit.dev projects to respond to product selections while maintaining the simplicity of the iframe approach.
:::

## Best Practices

### Understanding Self-Contained Projects

:::warning Critical Requirement
Your bitbybit.dev project must be **completely self-contained**. It cannot receive data from Shopify variants, options, or form inputs. All interactivity must be built into the project itself on bitbybit.dev.
:::

**This means:**
- ✅ Users can interact with controls **within** your bitbybit.dev project
- ✅ Your project can have its own UI, sliders, buttons, etc.
- ✅ Perfect for demonstrations, tours, and explorations
- ❌ Cannot respond to Shopify variant selections
- ❌ Cannot adapt based on product options chosen in Shopify
- ❌ Not suitable for configurators that need Shopify integration

### Publishing on bitbybit.dev

Before embedding:
1. **Fully test your project** on bitbybit.dev
2. **Ensure it's self-contained** with all needed interactivity built-in
3. **Ensure responsive design** works at various sizes
4. **Optimize loading time** (minimize geometry complexity)
5. **Set appropriate permissions** on your published project
6. **Document any query parameters** your project accepts

### Shopify Integration

In your store:
1. **Link Project Preview URL to metafields** for product-specific content
2. **Test iframe positioning** with [Try to Prepend](#try-to-prepend)
3. **Enable fullscreen** for better user experience
4. **Provide fallback content** (product images) if iframe fails
5. **Test on mobile devices** thoroughly
