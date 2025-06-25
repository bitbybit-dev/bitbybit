---
sidebar_position: 2
title: "3D Bits Shopify App - FAQ"
sidebar_label: "FAQ"
description: "Frequently asked questions about using the 3D Bits app to integrate 3D models and product configurators into your Shopify store."
tags: [shopify, 3d-bits]
---

import Admonition from '@theme/Admonition';

# 3D Bits Shopify App: Frequently Asked Questions

As 3D Bits makes its way into Shopify stores, we’ve started getting some recurring questions from merchants. So, here’s a quick FAQ with some honest answers to help you understand what 3D Bits can do for your store.

<Admonition type="info" title="Don't see your question answered?">
  <p>If you have other questions or just need some initial guidance, please contact us, we're here to help you out!</p>
  <a href="mailto:info@bitbybit.dev">info@bitbybit.dev</a>
</Admonition>

---

### Can I use 3D Bits if I have zero coding skills?

**Yes, absolutely!** If you can click buttons and copy-paste, you’re good to go for basic 3D model display.

**Here's the simple process:**
1.  Install 3D Bits app, subscribe to Annual Base plan to begin your trial and pin the app.
2.  Go to Metafields sections within the app admin page and hit create button.
3.  Upload your 3D models to Shopify via **Content > Files**.
4.  Copy the link to your uploaded 3D model.
5.  Paste this link into one of our designated 3D Bits metafields associated with your product.
6.  Voilà! Your 3D model should now appear on your product page.

Feeling a bit more adventurous but still don't want to code? You can try our **BITBYBIT VIEWER** editor block within the Shopify Theme Editor. It allows for arranging slightly fancier scenes with multiple models or different camera angles, still without writing any code – just courage required!

<Admonition type="note" title="Quick Start Guide">
  For a detailed walkthrough, check out our guide: <a href="/learn/3d-bits/theme-app-extensions/bitbybit-viewer" target="_blank" rel="noopener noreferrer">3D Bits Setup Guide</a>.
</Admonition>

---

### Can I build a product configurator without writing code?

**To a certain extent, yes.**

The **BITBYBIT VIEWER** block (used within the Viewer Editor) lets you match static 3D models with your existing Shopify product variants. This is great for handling common scenarios like:
*   Showing a different 3D model for each color option (e.g., a blue chair model when "Blue" is selected).
*   Displaying different models for size variations.

<Admonition type="info" title="Our Design Philosophy">
  As technical founders, our initial inclination was to build in complex parametric logic for everything. However, we quickly realized that many merchants simply want to achieve straightforward visual changes based on standard Shopify variants – like showing the blue chair when "Blue" is selected. And that's perfectly fine and often all that's needed! 3D Bits handles this simple variant swapping effectively.
</Admonition>

- Have GLTF files ready? Check this tutorial: [No-Code GLTF Configurators with BITBYBIT VIEWER Editor on Shopify](/learn/3d-bits/tutorials/viewer-no-code-gltf-configurators)
- Want to use 3D scans (Gaussian splatting)? [No-Code Gaussian Splat Configurators with BITBYBIT VIEWER Editor on Shopify](/learn/3d-bits/tutorials/viewer-no-code-3d-scan-configurators)

For more complex configurators (e.g., where parts change dynamically beyond pre-set variants, or intricate rules are needed), you'd likely need to explore options involving some level of scripting, as discussed in later questions.

---

### I already use [bitbybit.dev](https://bitbybit.dev) for my projects – can I connect those to Shopify?

**Yes, you can!**

*   **For Simple Previews:** Use the **BITBYBIT PREVIEW** extension block in the Shopify Theme Editor. Make your project public on `bitbybit.dev`, and paste the project link into the block. That’s it! This is great for showcasing existing non-interactive or pre-animated scenes.
*   **For More Interactivity:** If you want your `bitbybit.dev` script to react to Shopify variants or other page elements, you'll need to integrate your scripts using the **BITBYBIT RUNNER** theme extension block. This involves exporting your script from `bitbybit.dev` (as a JavaScript snippet) and then setting up the Runner block to execute it. This approach is more complex but offers much greater control.

<Admonition type="note" title="Integration Guide">
  Learn more about connecting your projects: <a href="/learn/3d-bits/theme-app-extensions/bitbybit-preview" target="_blank" rel="noopener noreferrer">Connecting bitbybit.dev Projects to Shopify</a>.
</Admonition>

---

### I'm a merchant, but my store is managed by professional developers. What are my options?

You have a couple of flexible paths, depending on your needs and your team's skills:

- **Want to do it yourself?**  
  Our Base plan includes No-Code and Low-Code editors, so you can create 3D product experiences and even basic configurators without writing any code. If you’re comfortable with simple setup steps, you can get started on your own.

- **Have a developer team?**  
  If your developers are comfortable with coding, they’ll get the most out of our Pro plan. It unlocks advanced features and tools designed for building fully custom 3D experiences.  
  For more details on what 3D Bits offers to developers, see the next question.

---

### We’re developers building stores for merchants. Should we bother with 3D Bits?

**Absolutely.**

While you *could* build your own 3D integration from scratch (handling WebGL viewers, model loading, Shopify integration, etc.), that’s a lot of repeated work for every project or theme.

**3D Bits takes care of the essentials:**
*   Simple 3D model embedding.
*   Seamless Shopify metafield integration for 3D assets.
*   Easy mapping between product variants and 3D models.
*   The Runner block, which lets you run your own JavaScript/TypeScript to control the 3D scene and respond to store events.

This means you can focus on what makes your client’s store unique—custom logic, creative 3D experiences, and advanced interactivity—without reinventing the technical foundation every time. We’ve been there, and it’s not fun!

**Need more power? Go Pro!**  
Our Pro plan is built specifically for development teams building advanced 3D experiences:
*   Access private TypeScript Vite project templates.
*   Use any editor you want—VSCode, Visual Studio, XCode, etc.
*   Host your codebase on Git for easy team collaboration.
*   Integrate web game engines such as `ThreeJS`, `BabylonJS`, `PlayCanvas`, or others.
*   Integrate other web-based packages or technologies as needed.
*   Ensure quality with unit tests.
*   Simple deployment process between local and production environments.
*   Access our private `bits-pro` npm package to establish communication with the Shopify product page.

<Admonition type="note" title="Note on rendering engines">
    We currently use BabylonJS in the 3D Bits app whenever you use the Base plan. For anything else, you'll need to go Pro.
</Admonition>

---

### Can I use 3D Bits for complex pricing (e.g., a slider value changes the product price)?

**Not directly for the pricing calculation itself.**

3D Bits is focused on handling the **3D visualization**. It can:
*   Read a value from a slider (or any other UI element on your page).
*   Update the 3D model based on that value (e.g., change dimensions, swap parts).

However, **3D Bits does not calculate or update the product price in Shopify.** Pricing logic, especially for complex, dynamically calculated prices, needs to be handled by:
*   Shopify's built-in variant pricing.
*   A dedicated third-party Shopify pricing app.
*   Custom backend development with secure validation.

Shopify offers three variant types with many options out of the box, which covers most standard pricing scenarios. For anything fancier, you’ll need to combine 3D Bits for the visuals with other tools or custom solutions for the pricing logic.

---

### My product has a ton of configurable parts and complex logic. Can I build a fully custom configurator with 3D Bits?

**Yes, if you or your team can write JavaScript or TypeScript.**

This is where our **Pro** plan really shines, but you can also use the **BITBYBIT RUNNER** theme extension block. It acts as a bridge:
1.  You develop your complex configuration logic, part-swapping rules, and geometric manipulations as a script (e.g., using Rete, Blockly, or TypeScript on `bitbybit.dev` and then exporting it, or writing it directly for the runner).
2.  The Runner block executes this script within your Shopify theme.
3.  Your script can then interact with the 3D scene, listen to Shopify variant changes (or other custom UI elements you add to the page), and update the 3D model accordingly.

3D Bits provides the 3D rendering pipeline and the connection to Shopify. You'll need to bring your own:
*   Custom configuration logic (as a script).
*   Pricing strategy (likely handled by Shopify or another app).
*   Custom UI elements (if Shopify's default variant selectors aren't sufficient).

<Admonition type="note" title="Advanced Configuration Guide">
  Dive deeper into building custom configurators: <a href="/learn/3d-bits/theme-app-extensions/bitbybit-runner" target="_blank" rel="noopener noreferrer">Using the Bitbybit Runner for Custom Logic</a>.
</Admonition>

---

### Does 3D Bits offer fancy UI controls for product pages (like custom sliders, color swatches, etc.)?

**In general - no. 3D Bits is not here to reinvent the dropdown or the color swatch.**

There are many excellent Shopify apps and theme development techniques dedicated to creating sophisticated UI controls for product options. Having said that Pro plan does have the ability to use frameworks such as React, Angular or others to create UI elements. However keep in mind that we do not offer any special technologies to alter the prices. If you need such functionality you'll need to build it yourself.

3D Bits focuses on the 3D visualization. It's designed to **listen** to what options are already selected on your product page (whether through standard Shopify variants or custom UI controls you've implemented) and then **update the 3D scene accordingly**:
*   Show the correct 3D model or parts.
*   Hide what shouldn’t be visible.
*   Update 3D model dimensions or features based on selected options.

**Think of 3D Bits as the 3D backbone of your product visualization – not the entire user interface nervous system. 💪** It plays well with others, allowing you to choose the best UI tools for your store while it handles the 3D heavy lifting.