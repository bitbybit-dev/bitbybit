---
sidebar_position: 2
title: "BITBYBIT RUNNER Theme App Extension Block Settings"
sidebar_label: Block Settings
description: Learn about various settings that BITBYBIT RUNNER theme app extension block provides to configure parametric 3D configurators with visual programming and TypeScript.
tags: [shopify, 3d-bits]
---

# Block Settings

This guide explains all available settings for the **BITBYBIT RUNNER** theme app extension block in Shopify. Use this block to create parametric 3D configurators that generate geometry dynamically based on user input—powered by visual programming or TypeScript code.

You'll find the BITBYBIT RUNNER settings in your theme editor after adding the block to a template.

## What is BITBYBIT RUNNER?

BITBYBIT RUNNER is designed for **parametric geometry** and **custom configurators**. Unlike the BITBYBIT VIEWER block which displays pre-made 3D models, the RUNNER block executes code that **generates 3D content dynamically** in real-time based on product variants and user selections.

### Low-Code & Pro-Code Options

The RUNNER block works with both visual programming editors (Low-Code) and TypeScript (Pro-Code) available on the [bitbybit.dev](https://bitbybit.dev) platform:

**Low-Code Visual Programming:**
- **Blockly Editor** - Block-based visual programming interface (similar to Scratch)
- **Rete Editor** - Node-based visual programming interface for complex workflows

**Pro-Code Programming:**
- **Monaco TypeScript Editor** - Full TypeScript IDE for advanced developers

All editors are accessible through the **3D Bits admin dashboard** in your Shopify app. You can create scripts visually without writing code (Low-Code), or use TypeScript for maximum flexibility (Pro-Code).

### How It Works

1. Create a parametric script using Blockly, Rete, or Monaco on bitbybit.dev
2. Export the script using "Export to Runner" 
3. Add the script to your BITBYBIT RUNNER block (inline or via URL)
4. The script executes when customers change product variants
5. 3D geometry is generated in real-time based on their selections

## Available Settings

### Script Configuration
- [Inline Script](#inline-script)
- [Public Script URL](#public-script-url) - [See full documentation](../getting-started/common-settings#public-script-url)
- [Execute JavaScript](#execute-javascript)

### Geometry Kernel Options
- [Enable OCCT](#enable-occt)
- [Enable JSCAD](#enable-jscad)
- [Enable Manifold](#enable-manifold)

### Advanced Features
- [Enable Physics](#enable-physics)
- [Enable Key Event Listeners](#enable-key-event-listeners)
- [Fonts to Include](#fonts-to-include)

### Common Settings (Viewer & Runner)
- [Camera Position](#camera-position) - [See full documentation](../getting-started/common-settings#camera-position)
- [Camera Target](#camera-target) - [See full documentation](../getting-started/common-settings#camera-target)
- [Background Color](#background-color) - [See full documentation](../getting-started/common-settings#background-color)
- [Runner CDN Link](../getting-started/common-settings#runner-cdn-link)

### Common Settings (All Blocks)
- [Show Spinner](../getting-started/common-settings#show-spinner)
- [Receive Input Names As Variants](../getting-started/common-settings#receive-input-names-as-variants)
- [Input Collection Mode](../getting-started/common-settings#input-collection-mode)
- [Enable Debug Mode](../getting-started/common-settings#enable-debug-mode)
- [Disable Inputs When Computing](../getting-started/common-settings#disable-inputs-when-computing)
- [Try to Prepend](../getting-started/common-settings#try-to-prepend)
- [Prepend With Query Selector](../getting-started/common-settings#prepend-with-query-selector)
- [Remove Children Before Prepend](../getting-started/common-settings#remove-children-before-prepend)
- [Show Fullscreen Button](../getting-started/common-settings#show-fullscreen-button)

## Script Configuration Settings

---

### Inline Script

The Inline Script setting allows you to embed your parametric script directly into the theme block. This is the recommended approach for most use cases.

#### How to Get Your Script

1. Create your parametric design in the [bitbybit.dev](https://bitbybit.dev) platform using:
   - **Blockly Editor** for visual block-based programming (Low-Code)
   - **Rete Editor** for node-based visual workflows (Low-Code)
   - **Monaco Editor** for TypeScript code (Pro-Code)

2. Click the **"Export to Runner"** button in the editor
3. Copy the generated script to your clipboard
4. Paste it into this Inline Script field

#### Format

The script is exported as a text string that the runner can execute. It contains all the logic and geometry definitions from your visual programming or TypeScript code.

:::tip Access Editors
Access all three editors through the **3D Bits admin dashboard** in your Shopify app. Click "Open Editor" and choose your preferred programming interface.
:::

:::info Script Priority
If you provide an Inline Script, the [Public Script URL](#public-script-url) will be ignored. The inline script takes precedence.
:::

#### Benefits of Inline Scripts

- **Faster loading** - No external HTTP request required
- **Version control** - Script is stored with your theme
- **Reliability** - No dependency on external hosting
- **Simplicity** - Everything in one place

#### When to Use Public Script URL Instead

Consider using a [Public Script URL](#public-script-url) if:
- Your script is extremely large (multiple thousand lines)
- You want to share the same script across multiple stores
- You need to update the script frequently without changing product page configuration
- You're managing scripts through a separate deployment system

---

### Public Script URL

:::info Common Setting
This setting is shared between RUNNER and APPS blocks. See [Public Script URL in Common Settings](../getting-started/common-settings#public-script-url) for general information about URL requirements, hosting options, and CORS configuration.
:::

The Public Script URL setting allows you to load your parametric script from an external file hosted publicly on the web.

#### RUNNER-Specific Behavior

**Script Priority:**
If an [Inline Script](#inline-script) is provided, it takes precedence and this URL will be ignored.

**When to Use Public Script URL:**
- You have a centralized script management system
- The same script is used across multiple Shopify stores
- You want to update scripts without modifying the metafield values in product page (keep in mind asset may be cached)
- Your script is too large for comfortable inline embedding

**File Format:**
The URL must point to a script exported using "Export to Runner" from [bitbybit.dev](https://bitbybit.dev) editors in text/plain format.

**Recommended Hosting:**
- **Shopify CDN** - Upload as a theme asset for best reliability
- **GitHub Pages** - Use raw file URLs for version control
- **Cloud storage** - Google Cloud Storage, AWS S3, etc.

:::tip
For most use cases, [Inline Script](#inline-script) is recommended as it's faster (no external HTTP request) and more reliable (no dependency on external hosting).
:::

---

### Execute JavaScript

**Default:** `dispose(previousMeshes);const res = await runner.executeScript(script, inputs);update(previousMeshes, (res && res.meshes) ? res.meshes : []);`

The Execute JavaScript setting provides custom handling code that executes after product variant inputs change. This is an **advanced setting** that most users should not need to modify.

#### What It Does

This JavaScript code:
1. **Disposes** previous 3D meshes from memory
2. **Executes** your parametric script with current input values
3. **Updates** the scene with newly generated meshes

#### Default Behavior

The default implementation:
```javascript
dispose(previousMeshes);
const res = await runner.executeScript(script, inputs);
update(previousMeshes, (res && res.meshes) ? res.meshes : []);
```

This handles the standard use case where:
- Scripts return meshes that should be cleaned up on each execution
- New geometry replaces old geometry completely
- Memory is properly managed to prevent leaks

#### Available Context Variables

You have access to these contextual variables:

- `runner` - The Bitbybit runner instance
- `script` - Your parametric script content
- `inputs` - Current variant selections and form values
- `bitbybit` - Core Bitbybit library
- `Bit` - Bitbybit namespace
- `scene` - BabylonJS scene object
- `engine` - BabylonJS engine instance
- `BABYLON` - BabylonJS library
- `GUI` - BabylonJS GUI library
- `update(previousMeshes, newMeshes)` - Function to update displayed meshes
- `dispose(meshes)` - Function to clean up meshes from memory
- `previousMeshes` - Array of meshes from the previous execution

#### When to Customize

Modify this setting if you need to:
- **Preserve certain meshes** between executions (don't dispose everything)
- **Add custom animations** or transitions when geometry updates
- **Handle non-mesh outputs** from your script (e.g., lines, curves, points)
- **Implement custom error handling** for script execution
- **Add performance logging** or analytics
- **Integrate with other JavaScript libraries** on your page

#### Example: Preserve Background Meshes

```javascript
// Only dispose meshes tagged as "dynamic"
const dynamicMeshes = previousMeshes.filter(m => m.metadata?.dynamic);
dispose(dynamicMeshes);

const res = await runner.executeScript(script, inputs);
const newMeshes = (res && res.meshes) ? res.meshes : [];

// Tag new meshes as dynamic
newMeshes.forEach(m => {
  if (!m.metadata) m.metadata = {};
  m.metadata.dynamic = true;
});

update(dynamicMeshes, newMeshes);
```

#### Example: Add Fade Transition

```javascript
// Fade out old meshes
previousMeshes.forEach(m => {
  BABYLON.Animation.CreateAndStartAnimation(
    'fadeOut', m, 'visibility', 30, 15, 1, 0, 0
  );
});

const res = await runner.executeScript(script, inputs);
const newMeshes = (res && res.meshes) ? res.meshes : [];

// Fade in new meshes
newMeshes.forEach(m => {
  m.visibility = 0;
  BABYLON.Animation.CreateAndStartAnimation(
    'fadeIn', m, 'visibility', 30, 15, 0, 1, 0
  );
});

setTimeout(() => dispose(previousMeshes), 500);
update(previousMeshes, newMeshes);
```

:::warning Advanced Users Only
Only modify this setting if you understand JavaScript and BabylonJS. Incorrect code can break your configurator entirely. Always test thoroughly before deploying to production.
:::

## Geometry Kernel Options

BITBYBIT RUNNER supports multiple CAD geometry kernels. These kernels provide the mathematical foundations for creating precise 3D shapes programmatically.

---

### Enable OCCT

**Default:** `true`

OpenCascade Technology (OCCT) is a professional-grade CAD kernel for creating BRep (Boundary Representation) geometries. This is the **recommended kernel** for most parametric configurators.

#### What is OCCT?

OCCT is the same geometry kernel used in professional CAD software like FreeCAD. It excels at:
- **Precise solid modeling** - Boolean operations (union, subtract, intersect)
- **Complex surfaces** - NURBS, Bezier, swept surfaces
- **Filleting and chamfering** - Automatic edge rounding
- **Wire and edge operations** - Precise curve manipulation
- **Topology analysis** - Face, edge, and vertex queries

#### When to Use OCCT

Enable OCCT (default) when you need:
- Professional CAD-quality geometry
- Precise dimensional control
- Complex boolean operations
- Parametric parts with constraints
- Manufacturing-ready models

#### Features Available in Low-Code

OCCT features are exposed through bitbybit.dev **Low-Code** visual editors (Blockly/Rete):
- Create boxes, cylinders, spheres, cones
- Boolean union, subtract, intersect operations
- Fillet and chamfer edges
- Extrude, revolve, loft, and sweep profiles
- Create complex wire paths
- Apply transformations and arrays

#### Performance Considerations

OCCT is computationally intensive. Complex operations may take seconds to compute. Use the [Show Spinner](#show-spinner) setting to indicate computation progress to users.

:::tip Learning OCCT
Check the [bitbybit.dev tutorials](/learn/code/common/occt) to learn OCCT geometry modeling through visual programming.
:::

---

### Enable JSCAD

**Default:** `false`

JSCAD is an open-source CSG (Constructive Solid Geometry) kernel written in JavaScript. It provides an alternative approach to 3D modeling.

#### What is JSCAD?

JSCAD uses CSG methodology where complex shapes are built by combining simple primitives (cubes, spheres, cylinders) using boolean operations.

#### Key Differences from OCCT

- **Simpler operations** - Fewer features but easier to understand
- **Faster for basic shapes** - Quick boolean operations on primitives
- **Different topology** - CSG trees vs BRep solids
- **Smaller file size** - Lighter weight library

#### When to Use JSCAD

Consider enabling JSCAD instead of OCCT when:
- You only need simple primitive shapes
- Performance is critical for basic geometries
- You're familiar with CSG modeling paradigm
- File size/loading time is a concern

#### Combining with OCCT

You can enable both OCCT and JSCAD simultaneously. Your scripts can use features from both kernels. However, this increases the initial loading time.

:::info
JSCAD features are also accessible through bitbybit.dev **Low-Code** editors (Blockly and Rete) under the JSCAD category.
:::

---

### Enable Manifold

**Default:** `false`

Manifold is a modern, high-performance CSG geometry kernel with robust boolean operations.

#### What is Manifold?

Manifold is a newer CSG library designed for:
- **Reliable booleans** - More robust than traditional CSG implementations
- **Performance** - Optimized for speed
- **Manifold meshes** - Guarantees watertight, valid geometry
- **3D printing** - Produces models suitable for manufacturing

#### When to Use Manifold

Enable Manifold when:
- You encounter issues with JSCAD boolean operations
- You need guaranteed manifold (watertight) meshes
- You're preparing models for 3D printing
- Performance is critical for CSG operations

#### Comparison to JSCAD

- **More reliable** - Better handling of edge cases in boolean operations
- **Modern codebase** - Actively developed with latest techniques
- **Different API** - Separate set of blocks in visual editors

:::warning
Enabling multiple geometry kernels (OCCT + JSCAD + Manifold) increases loading time significantly. Only enable the kernels you actually use in your scripts.
:::

## Advanced Features

---

### Enable Physics

**Default:** `false`

Enables the Havok Physics Engine for advanced physics simulations in your 3D scene.

#### What is Havok Physics?

Havok is a professional-grade physics engine that can simulate:
- **Rigid body dynamics** - Falling, colliding, and bouncing objects
- **Constraints and joints** - Hinges, sliders, springs
- **Forces and impulses** - Gravity, wind, explosions
- **Collision detection** - Complex shape interactions

#### When to Enable

Enable physics only if your configurator requires:
- Animated simulations showing how products work
- Interactive physics-based demonstrations
- Game-like interactions with 3D objects
- Structural analysis or stress testing visualizations

#### Common Use Cases

Typical product configurators **do not need physics**. Consider physics for:
- Furniture that needs to demonstrate stability
- Mechanical assemblies showing motion
- Interactive product demonstrations
- Educational or training simulations

#### Performance Impact

Physics simulation adds computational overhead. Users will experience:
- Increased initial loading time (physics engine is ~2MB)
- Ongoing computation during simulation
- Higher device memory usage

:::warning
Physics interactions require **Pro-Code** (Monaco TypeScript editor) on bitbybit.dev. The Low-Code editors (Blockly and Rete) do not expose physics APIs directly.
:::

:::tip
Leave this disabled (default) unless you specifically need physics simulations.
:::

---

### Enable Key Event Listeners

**Default:** `false`

Enables keyboard input detection for interactive 3D experiences.

#### What It Does

When enabled, your scripts can respond to keyboard events:
- Key presses (keydown)
- Key releases (keyup)
- Continuous key holding

#### When to Enable

Enable key event listeners if you're building:
- Game-like 3D experiences
- Interactive walkthroughs or tours
- Camera control systems
- Custom navigation interfaces

#### Common Use Cases

Typical product configurators **do not need keyboard listeners**. Consider enabling for:
- First-person product exploration
- Interactive product demonstrations
- Training simulations
- Custom camera controls (WASD movement, etc.)

#### Available in Low-Code

Key event handling is exposed through the **Blockly editor** (Low-Code) under the Events category. You can create blocks that trigger actions when specific keys are pressed.

:::warning
Keyboard controls should not interfere with standard Shopify page navigation. Test thoroughly to ensure good user experience.
:::

:::info
Leave this disabled (default) for standard configurators to reduce loading time and avoid potential conflicts.
:::

---

### Fonts to Include

**Default:** `["Roboto"]`

Specifies which 3D fonts to load for creating 3D text in your parametric designs.

#### What It Does

3D fonts allow you to create extruded text shapes that can be customized by users. Common uses include:
- Engraved product names
- Embossed text on surfaces
- Custom labels or signage
- Personalized products with user input

#### Format

Provide an array of font names as JSON:
```json
["Roboto"]
```

Multiple fonts:
```json
["Roboto", "RobotoSlab", "Orbitron"]
```

#### Available Fonts

You can include any of these fonts:
- `Roboto` (default, recommended)
- `RobotoSlab`
- `Aboreto`
- `Bungee`
- `IndieFLower`
- `Lugrasimo`
- `Orbitron`
- `Silkscreen`
- `Tektur`
- `Workbench`

#### Load All Fonts

To include all available fonts:
```json
["Roboto", "RobotoSlab", "Aboreto", "Bungee", "IndieFLower", "Lugrasimo", "Orbitron", "Silkscreen", "Tektur", "Workbench"]
```

:::warning Performance Impact
Each font adds ~100-500KB to initial load time. Only include fonts you actually use in your scripts.
:::

#### Using Fonts in Scripts

These fonts are used exclusively with **OCCT 3D Text** operations. 3D text creation is available in:
- **OCCT blocks** in Blockly/Rete editors (Low-Code)
- **TypeScript API** in Monaco editor (Pro-Code)

The text appears as extruded 3D geometry that can be combined with other shapes using boolean operations.

#### Custom Fonts

Bitbybit also allows loading custom fonts through both **Low-Code** and **Pro-Code** editors. When using custom fonts:

:::warning Custom Font Requirements
- You must have all legal rights to use custom fonts
- Custom fonts may contain self-intersections or other geometric problems
- Some fonts cannot be converted to valid OCCT solids due to these issues
- Test custom fonts thoroughly—some work perfectly, others may fail
:::

#### Example Use Cases

- **Jewelry engraving** - Custom names on rings, bracelets
- **Signage** - Configurable business signs with custom text
- **Product labeling** - Embossed logos or serial numbers
- **Personalization** - User names on products

:::tip
Start with `["Roboto"]` (default) and add more fonts only as needed for your specific designs.
:::

## Visual Configuration Settings

---

### Runner CDN Link

This is a common setting shared across multiple blocks. See the [Common Settings: Runner CDN Link](../getting-started/common-settings#runner-cdn-link) documentation for detailed information including when to change versions and URL format.

---

### Camera Position

This is a common setting shared with the VIEWER block. See the [Common Settings: Camera Position](../getting-started/common-settings#camera-position) documentation for detailed information.

:::tip RUNNER-Specific Default
For the RUNNER block, the default camera position is `[30, 10, 30]` - further back than the VIEWER default because parametric geometry often spans a larger area.
:::

---

### Camera Target

This is a common setting shared with the VIEWER block. See the [Common Settings: Camera Target](../getting-started/common-settings#camera-target) documentation for detailed information.

:::tip RUNNER-Specific Default
For the RUNNER block, the default camera target is `[0, 15, 0]` - targeting a point elevated from the origin, suitable for typical parametric objects that extend vertically.
:::

---

### Background Color

This is a common setting shared with the VIEWER block. See the [Common Settings: Background Color](../getting-started/common-settings#background-color) documentation for detailed information.

---

## Global Settings

These settings are shared with the BITBYBIT VIEWER block and control how the runner interacts with your Shopify store.

---

### Show Spinner

This is a common setting shared across multiple blocks. See the [Common Settings: Show Spinner](../getting-started/common-settings#show-spinner) documentation for detailed information.

:::tip RUNNER-Specific
Parametric computation can take several seconds, especially for complex OCCT boolean operations, large geometry with many components, or first-time kernel initialization. Keep this enabled (default) to provide visual feedback during computation time.
:::

---

### Receive Input Names As Variants

This is a common setting shared across multiple blocks. See the [Common Settings: Receive Input Names As Variants](../getting-started/common-settings#receive-input-names-as-variants) documentation for detailed information including:
- How input names vs. labels work
- Handling dynamic IDs in input names
- Theme and app update workflow

:::tip RUNNER-Specific
Your parametric scripts reference inputs by name. For simple names, use dot notation (e.g., `inputs.color === "red"`). For names with spaces or special characters, use bracket notation (e.g., `inputs["Shirt Size"] === "large"`). Keep this enabled (default) to ensure technical names remain consistent and your script logic works reliably. You can also create mappings to more convenient property names in your scripts.
:::

---

### Input Collection Mode

This is a common setting shared across multiple blocks. See the [Common Settings: Input Collection Mode](../getting-started/common-settings#input-collection-mode) documentation for detailed information including mode options and use cases.

:::tip RUNNER-Specific
Use **All Inputs** mode when your parametric script needs data from custom form fields (e.g., text inputs for engraving names, number inputs for dimensions). Use **Standard Inputs** (default) for better performance when only responding to product variants.
:::

---

### Enable Debug Mode

This is a common setting shared across multiple blocks. See the [Common Settings: Enable Debug Mode](../getting-started/common-settings#enable-debug-mode) documentation for detailed information including when to use, example output, and usage workflow.

:::tip RUNNER-Specific
Debug mode is especially useful when developing parametric scripts to verify which input names your script should check (e.g., seeing `inputs.color` vs `inputs.Color` helps you write correct conditional logic).
:::

---

### Disable Inputs When Computing

This is a common setting shared across multiple blocks. See the [Common Settings: Disable Inputs When Computing](../getting-started/common-settings#disable-inputs-when-computing) documentation for detailed information.

:::tip RUNNER-Specific
Only enable this if you encounter specific issues with rapid variant changes during computation (e.g., users changing inputs faster than complex OCCT operations can complete, causing queue conflicts).
:::

---

### Try to Prepend

This is a common setting shared across multiple blocks. See the [Common Settings: Try to Prepend](../getting-started/common-settings#try-to-prepend) documentation for detailed information.

:::tip RUNNER-Specific
Commonly used to position the parametric 3D configurator in the product media gallery alongside or in place of product photos. Combine with [Prepend With Query Selector](#prepend-with-query-selector) and optionally [Remove Children Before Prepend](#remove-children-before-prepend).
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

### Show Fullscreen Button

This is a common setting shared across multiple blocks. See the [Common Settings: Show Fullscreen Button](../getting-started/common-settings#show-fullscreen-button) documentation for detailed information.

:::tip RUNNER-Specific
Fullscreen is especially valuable for parametric configurators where users need to examine generated geometry in detail. Keep this enabled.
:::

## Dynamic vs. Global Settings

:::info Common Setting Concept
Understanding which settings should be product-specific vs. global is important for all 3D Bits blocks. See [Common Settings: Dynamic vs. Global Settings](../getting-started/common-settings#dynamic-vs-global-settings) for the full explanation and [How to Link Settings to Metafields](../getting-started/common-settings#how-to-link-settings-to-metafields) for step-by-step instructions.
:::

### RUNNER-Specific Considerations

Unlike the BITBYBIT VIEWER block, the RUNNER block typically uses **fewer product-specific metafields** because the parametric logic is embedded in the script itself.

**Most settings remain global:**
- [Runner CDN Link](#runner-cdn-link)
- [Inline Script](#inline-script) or [Public Script URL](#public-script-url)
- [Execute JavaScript](#execute-javascript)
- All geometry kernel options
- All advanced features
- All common settings ([Show Spinner](#show-spinner), [Disable Inputs When Computing](#disable-inputs-when-computing), etc.)

**Optional product-specific settings:**
- [Inline Script](#inline-script) - Different scripts for different product types
- [Public Script URL](#public-script-url) - Per-product script variations
- [Camera Position](#camera-position) - Adjust for product scale
- [Camera Target](#camera-target) - Frame different products
- [Background Color](#background-color) - Match product aesthetics

### How Variants Work with RUNNER

**Key difference from VIEWER:** Your parametric script contains the logic for how variants affect geometry. With VIEWER, you configure variant behavior visually in the Viewer Editor. With RUNNER, you program custom logic in your Blockly, Rete, or TypeScript script.

Example logic in your script:
```typescript
if (inputs.size === "small") {
  // Generate small version geometry
} else if (inputs.size === "large") {
  // Generate large version geometry
}

if (inputs.color === "red") {
  material.diffuseColor = new BABYLON.Color3(1, 0, 0);
}
```

This is why RUNNER is more powerful but requires more setup—you're programming the configurator's behavior rather than using a no-code interface.

## Getting Help

If you encounter issues with BITBYBIT RUNNER settings:

### Troubleshooting Steps

1. **Enable [Debug Mode](#enable-debug-mode)** to see input values
2. **Check browser console** for JavaScript errors
3. **Verify script export** was done correctly from bitbybit.dev
4. **Test with simple geometry** before complex designs
5. **Disable unused geometry kernels** to improve loading time

### Resources

- **Bitbybit.dev Documentation** - [https://learn.bitbybit.dev](https://learn.bitbybit.dev)
- **Video Tutorials** - Visual programming walkthroughs
- **3D Bits Admin Dashboard** - Access editors and examples
- **Shopify App Support** - Contact through the app dashboard

### Common Issues

**Script doesn't execute:**
- Verify [Inline Script](#inline-script) or [Public Script URL](#public-script-url) is correctly configured
- Check that required geometry kernels ([OCCT](#enable-occt), etc.) are enabled
- Look for errors in browser console

**Canvas appears in wrong location:**
- Review [Try to Prepend](#try-to-prepend) and [Prepend With Query Selector](#prepend-with-query-selector) settings
- Inspect HTML to verify correct CSS selector
- Test with prepend disabled to see default position

**Inputs not detected:**
- Enable [Debug Mode](#enable-debug-mode) to see what inputs are found
- Try switching [Input Collection Mode](#input-collection-mode) to "All Inputs"
- Verify [Receive Input Names As Variants](#receive-input-names-as-variants) matches your script logic

**Performance issues:**
- Disable unnecessary geometry kernels
- Simplify parametric scripts (fewer operations)
- Use [Show Spinner](#show-spinner) to indicate computation time
- Consider enabling [Disable Inputs When Computing](#disable-inputs-when-computing)

---

**Ready to create your first parametric configurator?** Access the editors through your 3D Bits admin dashboard and start building with **Low-Code** (Blockly, Rete) or **Pro-Code** (TypeScript)!
