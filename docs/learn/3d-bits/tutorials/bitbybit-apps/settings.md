---
sidebar_position: 2
title: "BITBYBIT APPS Theme App Extension Block Settings"
sidebar_label: Block Settings
description: Learn about various settings that BITBYBIT APPS theme app extension block provides to develop and run custom TypeScript applications.
tags: [shopify, 3d-bits]
---

# Block Settings

This guide explains all available settings for the **BITBYBIT APPS** theme app extension block in Shopify. Use this block to develop and deploy sophisticated custom 3D & 2D Single Page Applications (SPAs) directly onto Shopify product pages.

You'll find the BITBYBIT APPS settings in your theme editor after adding the block to a template.

## What is BITBYBIT APPS?

BITBYBIT APPS is the **most advanced** block in the 3D Bits suite, designed for **professional development teams**. It empowers you to create, test, and deploy sophisticated custom 3D & 2D SPAs with a streamlined workflow that seamlessly transitions between local development, preview, and live production environments.

### Key Characteristics

- **Professional SPA Development** - Complete Single Page Applications with full control
- **TypeScript + Vite Workflow** - Modern, fast development with professional tooling
- **Three Development Modes** - Local, Preview, and Production for efficient iteration
- **bits-pro NPM Package** - Seamless integration with Shopify product data
- **Framework Agnostic** - Use React, Vue, Svelte, or vanilla JavaScript
- **3D Engine Flexibility** - BabylonJS, ThreeJS, PlayCanvas, or any WebGL framework

### What You Can Build

**Advanced Configurators:**
- Multi-step configuration wizards
- Complex product customization flows
- Integration with external APIs
- Dynamic option builders

**Interactive Experiences:**
- Product visualizers with custom controls
- 3D design tools embedded in your store
- Measurement and dimensioning tools
- Virtual showrooms

**Business Applications:**
- Custom quote generators
- Manufacturing calculators
- Material estimators
- Project planners

:::info Frontend-Only Applications
BITBYBIT APPS is designed exclusively for **frontend SPA development**. Any logic that determines or modifies product prices must be handled securely via backend validation or third-party Shopify apps. See [Pricing and Backend Considerations](#pricing-and-backend-considerations) for details.
:::

### When to Use APPS vs Other Blocks

**Use APPS when:**
- You need custom TypeScript code
- You want complete UI control (within 3D Bits theme app extension block context)
- You're building complex business logic
- You need integration with external services
- Off-the-shelf blocks don't meet your requirements

**Use VIEWER instead when:**
- You only need to display 3D models
- No-code scene configuration is sufficient
- You want the simplest setup

**Use RUNNER instead when:**
- Visual programming (Blockly/Rete) meets your needs
- You need parametric geometry but not custom UI
- You want built-in variant integration

**Use PREVIEW instead when:**
- You have a published bitbybit.dev project
- You want to embed an iframe
- You're prototyping integration

## Available Settings

### Product-Specific Settings
- [Public Script URL](#public-script-url)

### Global Settings
- [Show Spinner](#show-spinner)
- [Receive Input Names As Variants](#receive-input-names-as-variants)
- [Input Collection Mode](#input-collection-mode)
- [Enable Debug Mode](#enable-debug-mode)
- [Disable Inputs When Computing](#disable-inputs-when-computing)
- [Show Fullscreen Button](#show-fullscreen-button)
- [Try to Prepend](#try-to-prepend)
- [Prepend With Query Selector](#prepend-with-query-selector)
- [Remove Children Before Prepend](#remove-children-before-prepend)

## Dynamic vs. Global Settings

:::info Common Setting Concept
Understanding which settings should be product-specific vs. global is important for all 3D Bits blocks. See [Common Settings: Dynamic vs. Global Settings](../getting-started/common-settings#dynamic-vs-global-settings) for the full explanation and [How to Link Settings to Metafields](../getting-started/common-settings#how-to-link-settings-to-metafields) for step-by-step instructions.
:::

### APPS-Specific Considerations

**Settings you might link to metafields** (if applicable):
- [Public Script URL](#public-script-url) - Different applications for different product types

**Settings that typically remain global** (configured once):
- All common settings ([Show Spinner](#show-spinner), [Enable Debug Mode](#enable-debug-mode), etc.)
- Canvas positioning options ([Try to Prepend](#try-to-prepend), etc.)

### Application Architecture

Unlike other blocks, APPS typically uses **one application** across all products, with the application itself handling product-specific logic internally. Your TypeScript code reads Shopify variant data and adapts its behavior accordingly.

Therefore, [Public Script URL](#public-script-url) usually remains **global** (same app for all products), unless you're building fundamentally different applications for different product categories.

## Public Script URL

The Public Script URL setting controls which JavaScript application the block loads, enabling the three-mode development workflow.

### Three Development Modes

The BITBYBIT APPS block supports three distinct modes:

**1. Local Development Mode (Default)**
- When Public Script URL is **empty**, the block automatically attempts to load from `https://localhost:4242`
- Enables hot-reload development with live updates
- Your Vite dev server runs locally (e.g., `npm run dev`)
- Best for rapid iteration and development

**2. Preview Mode**
- Set Public Script URL to your local static build: `https://localhost:4242/assets/index-stable.js`
- Test production-like behavior while still local
- Uses `npm run watch` to rebuild on changes
- Ideal for pre-deployment testing

**3. Production Mode**
- Set Public Script URL to Shopify CDN: `https://cdn.shopify.com/s/files/1/xxx/index-<hash>.js`
- Upload final build via Content → Files in Shopify Admin
- Optimized bundle served to customers
- Live production deployment

### Format

Provide a fully qualified URL to your application's main JavaScript file, or leave empty for local development:

```
# Local Development (empty setting)
# Defaults to: https://localhost:4242

# Preview Mode
https://localhost:4242/assets/index-stable.js

# Production Mode
https://cdn.shopify.com/s/files/1/xxx/index-<hash>.js?version=<version>
```

### Application Requirements

Your application must be:
- **ES6 Module** - Built as an ES module (uses `import`/`export`)
- **Single JavaScript file** - Bundled into one file with styles inlined
- **Uses bits-pro package** - For Shopify data integration
- **CORS-enabled** - If hosted on a different domain (automatic for Shopify CDN)
- **Compiled with Vite** - Recommended (other bundlers may work but aren't officially supported)

### Building Your Application

:::tip Use Our Templates
We provide production-ready templates in our private GitHub repository (included with Pro subscription). These templates include proper configuration for Vite, TypeScript, bits-pro integration, and example 3D engines.
:::

#### Recommended Setup

1. **Clone a template** from our private GitHub repository:
   - Vanilla TypeScript + React Three Fiber
   - Vanilla TypeScript + Three.js
   - Vanilla TypeScript + Babylon.js
   - Vanilla TypeScript + PlayCanvas
   - Vanilla TypeScript + Bitbybit CAD

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev  # Runs on localhost:4242
   ```

4. **Build for preview/production:**
   ```bash
   npm run watch  # For preview mode (rebuilds on changes)
   npm run build   # For production deployment
   ```

#### Required Configuration

Your Vite config must output:
- **Single JavaScript file** - All code and styles bundled
- **ES Module format** - Not CommonJS
- **Correct port** - localhost:4242 for local development

Our templates include the correct configuration. Custom setups should follow similar patterns.

### Hosting Your Application

**Recommended: Shopify CDN (Production)**
- Upload via Content → Files in Shopify Admin
- Automatic CDN distribution
- No CORS issues
- Free hosting included
- Best performance for customers

**Local Development/Preview**
- Run Vite dev server on localhost:4242
- No external hosting needed
- HTTPS certificate required (handled by Vite)

**Alternative Hosting Options** (less common):
- **Cloud Storage**: AWS S3 + CloudFront, Google Cloud Storage
- **CDN Services**: Cloudflare, jsDelivr
- **Your Own Server**: Any HTTPS server with CORS headers

:::warning Using Alternative Hosting
If hosting outside Shopify, ensure proper CORS headers are configured. Shopify CDN is recommended for the simplest, most reliable setup.
:::

### CORS Requirements

If your application is hosted on a different domain than your Shopify store, the server must return appropriate CORS headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

Most CDN services handle this automatically.

### Application Structure with bits-pro

Your application uses the **bits-pro NPM package** to communicate with the BITBYBIT APPS block:

1. **Import bitsPro:**
   ```typescript
   import { bitsPro } from "@bitbybit-dev/bits-pro";
   ```

2. **Define your Inputs interface:**
   ```typescript
   interface Inputs {
     // Input names and their values are assembled by 3D Bits
     [key: string]: unknown;
     bitsContext: {
       iterationCount: number;
       blockId: string;
     }
   }
   ```

3. **Create an onUpdate callback:**
   ```typescript
   const onUpdate = async (inputs: Inputs) => {
     console.log('Inputs Received:', inputs);
     // Your application logic here
     bitsPro.finishedComputing();
   }
   ```

4. **Initialize bitsPro in your start function:**
   ```typescript
   const start = async () => {
     bitsPro.init(onUpdate, import.meta.env.PROD);
     // Your initialization code
     bitsPro.appReady();
   }
   ```

:::tip bits-pro Package
The bits-pro package handles all communication with the block, automatically receiving product page interactions in JSON format. Our templates include complete integration examples.
:::

### Example Application

Minimal APPS application structure:

```typescript
import { bitsPro } from "@bitbybit-dev/bits-pro";
import { createDirLightGroundAndSphere, initThreeJS } from "./init-threejs"

document.querySelector<HTMLDivElement>('#root-3d-bits')!.innerHTML = `
<div id="scene-container" style="width: 100%; height: 100%; overflow: hidden;">
    <canvas id="three-canvas"></canvas>
</div>
`

interface Inputs {
    // Input names and their values are assembled by 3D Bits, this interface should reflect your 
    // actual set up. You may need to use case-sensitive strings to define the properties.
    [key: string]: unknown;
    bitsContext: {
        // normally starts with 0 and increases each time the inputs on
        // Shopify side change
        iterationCount: number;
        // the ID of the current HTML block context where your app is running
        blockId: string;
    }
}

const onUpdate = async (inputs: Inputs) => {
    console.log('Inputs Received:', inputs);
    // In case you use spinners or disable inputs on Shopify side, you can
    // enable them again by calling this function. It is good practice to await
    // all of the code to be finished before calling this function.
    bitsPro.finishedComputing();
}

const start = async () => {
    // Always needs to be initialized first by providing the onUpdate function
    bitsPro.init(onUpdate, import.meta.env.PROD);

    const canvas = document.getElementById('three-canvas') as HTMLCanvasElement;
    const { scene } = initThreeJS(canvas);

    // When the app is initialized we must call this function
    // to let the Shopify side know that the app is ready to send updates on changing inputs
    setTimeout(() => {
        bitsPro.appReady();
    });
}

start();
```

:::note Complete Examples
Our GitHub templates include complete working examples with 3D rendering, proper TypeScript types, and best practices. Use them as starting points for your projects.
:::

### Development Workflow Summary

**Local Development:**
```
# Leave Public Script URL empty
# Block defaults to: https://localhost:4242
npm run dev
```

**Preview Mode:**
```
# Set Public Script URL to: https://localhost:4242/assets/index-stable.js
npm run watch
```

**Production:**
```
# Build and upload to Shopify
npm run build
# Upload dist/assets/index-<hash>.js to Content → Files
# Set Public Script URL to Shopify CDN URL
```

:::tip Seamless Transitions
Switch between modes by simply changing the Public Script URL setting. No code changes needed.
:::

## Global Settings

### Show Spinner

This is a common setting shared across multiple blocks. See the [Common Settings: Show Spinner](../getting-started/common-settings#show-spinner) documentation for detailed information.

:::tip APPS-Specific
Your application can control the spinner programmatically by dispatching custom events. This allows you to show/hide loading states based on your application's logic.
:::

---

### Receive Input Names As Variants

This is a common setting shared across multiple blocks. See the [Common Settings: Receive Input Names As Variants](../getting-started/common-settings#receive-input-names-as-variants) documentation for detailed information including:
- How input names vs. labels work
- Handling dynamic IDs in input names
- Theme and app update workflow

:::tip APPS-Specific
Your TypeScript application receives variant data through custom events. This setting controls the format of the data your application receives.
:::

---

### Input Collection Mode

This is a common setting shared across multiple blocks. See the [Common Settings: Input Collection Mode](../getting-started/common-settings#input-collection-mode) documentation for detailed information including mode options and use cases.

:::tip APPS-Specific
**All Inputs** mode is more common with APPS than other blocks, as custom applications often need data from additional form fields beyond standard product variants.
:::

---

### Enable Debug Mode

This is a common setting shared across multiple blocks. See the [Common Settings: Enable Debug Mode](../getting-started/common-settings#enable-debug-mode) documentation for detailed information including when to use, example output, and usage workflow.

:::tip APPS-Specific
Debug mode helps verify your application is receiving the correct input data. Use during development to troubleshoot variant integration.
:::

---

### Disable Inputs When Computing

This is a common setting shared across multiple blocks. See the [Common Settings: Disable Inputs When Computing](../getting-started/common-settings#disable-inputs-when-computing) documentation for detailed information.

:::tip APPS-Specific
Your application can also control input disabling programmatically by dispatching custom events, giving you fine-grained control over when inputs should be disabled based on your application state.
:::

---

### Show Fullscreen Button

This is a common setting shared across multiple blocks. See the [Common Settings: Show Fullscreen Button](../getting-started/common-settings#show-fullscreen-button) documentation for detailed information.

:::tip APPS-Specific
Your application can implement custom fullscreen behavior if needed, in addition to or instead of the standard fullscreen button.
:::

---

### Try to Prepend

This is a common setting shared across multiple blocks. See the [Common Settings: Try to Prepend](../getting-started/common-settings#try-to-prepend) documentation for detailed information.

:::tip APPS-Specific
Positioning is especially important for APPS since your custom application may have specific UI layout requirements. Test thoroughly with different screen sizes.
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

## Pricing and Backend Considerations

:::warning Frontend-Only Architecture
BITBYBIT APPS is designed **exclusively for frontend SPA development**. The block and workflow do not provide backend solutions, databases, or server-side rendering.
:::

### What's Included

✅ **Frontend SPA Development** - Complete client-side applications
✅ **Real-time Product Data** - Via bits-pro package
✅ **Professional Dev Tools** - IDE, Git, testing workflows
✅ **Three-Mode Deployment** - Local, Preview, Production
✅ **Template Examples** - Production-ready starting points

### What Requires Separate Implementation

❌ **Server-Side Rendering (SSR)** - Applications are client-side only
❌ **Backend APIs** - No built-in backend for custom server logic
❌ **Database/Persistence** - User data needs separate backend
❌ **Secure Price Validation** - Must be handled server-side

### Handling Pricing Correctly

Any logic that determines or modifies product prices **must** be handled securely:

**Option 1: Third-Party Apps**
- Use specialized Shopify apps for pricing rules
- Your frontend reflects their calculations
- Recommended for most use cases

**Option 2: Custom Backend**
- Build separate backend infrastructure
- Validate pricing server-side
- Your APPS frontend communicates with it
- Required for complex custom logic

:::danger Never Trust Client-Side Pricing
Price calculations in your frontend SPA can be manipulated by users. Always validate pricing server-side or via trusted third-party apps before checkout.
:::
