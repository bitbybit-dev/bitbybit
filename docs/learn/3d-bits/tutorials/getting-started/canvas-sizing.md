---
sidebar_position: 4
title: "Understanding Canvas Sizing: Making Your 3D Viewer Fit Your Design"
sidebar_label: Canvas Sizing & Placement
description: Learn how the 3D Bits canvas adapts to your theme layout and how to control its size and placement through theme settings and custom CSS.
tags: [shopify, 3d-bits, canvas, styling, layout]
---

# Canvas Sizing & Placement

A common question we receive is: "Why is the 3D canvas so small on my product page?" The answer lies in understanding what 3D Bits actually provides and how it integrates with your store's design.

## The 3D Canvas: A Flexible Element

**3D Bits provides a canvas element** (along with a few surrounding div containers for structure). The canvas automatically takes **100% width of its parent container** and has a **minimum height of 60vh** (60% of the viewport height) by default. Think of it as a responsive container that adapts to whatever space your theme or page layout provides to it.

**Key principle:** The 3D canvas fills the full width of the space allocated to it by your theme's structure. The height adapts to the container, with a default minimum to ensure usability. If the parent container is narrow (like a 50% column in a two-column layout), the canvas will be narrow. If it's wide (like a full-width section), the canvas expands accordingly.

### What This Means for You

The size and placement of your 3D viewer is **controlled by your theme's layout, not by the 3D Bits app**. This is by design, following the same philosophy outlined in [Under the Hood](./under-the-hood)—we focus on what we do best (3D visualization) and integrate with your existing store structure rather than trying to override it.

**Default canvas styling:**
- **Width:** 100% of parent container (fully responsive)
- **Height:** 100% of parent container, with a minimum of 60vh (60% of viewport height)
- **Maximum height:** 100vh (won't exceed viewport height)

These defaults ensure the canvas is usable out of the box while remaining flexible enough to adapt to any theme layout.

## Why Canvas Size Varies

Several factors determine how much space is available for your 3D canvas:

### 1. Theme Layout Structure

Most Shopify themes organize product pages into a grid or column layout:
- **Two-column layouts:** Product images/3D canvas on the left, product form on the right
- **Stacked layouts:** Images/3D canvas at the top, product information below
- **Wide layouts:** Full-width product media section
- **Narrow layouts:** Centered content with constrained maximum width

Your theme's chosen layout directly impacts the available space for the 3D canvas.

### 2. Global Page Width Settings

Many themes include global settings that affect all pages:
- **Container width:** Maximum width for page content (e.g., 1200px, 1400px, or full-width)
- **Content padding:** Space around content areas
- **Column proportions:** How space is divided between media and product information

**Example:** If your theme's global page width is set to 1200px with 50/50 column split, your 3D canvas can occupy approximately 600px width. Change the global width to 1600px, and the canvas automatically gets more space.

### 3. Product Template Settings

Most themes offer product-specific template options:
- **Image width ratios:** 40/60, 50/50, 60/40 splits between media and information
- **Gallery styles:** Grid, carousel, stacked, or single-image layouts
- **Media placement:** Left, right, or centered positioning

These template-level settings often provide the most direct control over canvas size.

### 4. Section and Block Configuration

Themes built on Shopify 2.0 architecture use sections and blocks:
- **Section width settings:** Full-width, boxed, or custom container sizes
- **Block arrangement:** How elements stack and share space
- **Spacing controls:** Margins and padding around blocks

The 3D Bits app block respects these section-level constraints.

## How to Increase Canvas Size

Want a larger 3D canvas? Here are your options, ordered from simplest to most technical:

### Option 1: Adjust Theme Settings (Easiest)

:::danger Global vs. Local Settings
**Important:** Be extremely careful when adjusting theme settings. Global settings (like "Page width" or "Container width") affect **all pages across your entire store**, not just your 3D configurator products. If you only want to increase canvas size for specific products with 3D configurators, use template-level or section-level settings instead. Changing global settings will impact your entire site's layout, including regular products, collections, pages, and other content.
:::

**Step 1: Check global page width (affects entire store)**
1. Go to **Online Store > Themes > Customize**
2. Look for settings like:
   - "Page width" or "Container width"
   - "Layout" or "Page layout"
   - Often found in theme settings sidebar under "Layout" or "General"
3. Increase the maximum width or switch from "Narrow" to "Wide" preset
4. **⚠️ Warning:** This change will apply to ALL pages on your store

**Step 2: Modify product template layout (affects specific template only)**
1. Navigate to a product page in the theme editor
2. Look for template or section settings such as:
   - "Product media width" (increase from 50% to 60% or 70%)
   - "Image size" or "Gallery width"
   - "Layout style" (try "Wide" or "Full-width" options)
3. These settings typically apply only to products using this specific template
4. Preview changes before publishing

**Step 3: Reduce surrounding elements (section-level changes)**
- Consider hiding or minimizing elements that compete for space
- Remove unnecessary sections above or below product media
- Simplify sidebar content if using multi-column layouts
- These changes can typically be made per-product or per-template

:::tip Theme Documentation
Consult your theme's documentation for specific setting names and locations. Different themes organize these controls in various ways, but the concepts remain the same. Pay special attention to which settings are global (affect entire store) vs. template-specific (affect only certain products).
:::

### Option 2: Custom CSS (Intermediate)

For more precise control, you or your developer can add custom CSS that targets your product pages specifically.

**Where to add custom CSS:**
- **Theme settings:** Many themes include a "Custom CSS" field (applies globally to entire store)
- **Theme code:** Add to `assets/custom.css` or your theme's stylesheet (applies globally)
- **Page-specific:** Use Shopify's metafields and templates to apply CSS only to certain products (recommended for targeted changes)
- **Product template files:** Add `<style>` tags directly in specific template liquid files for template-only styling

**Example CSS for overriding canvas dimensions:**

```css
/* Override default canvas minimum height */
canvas {
  min-height: 80vh !important; /* Change from default 60vh to 80vh */
}

/* Set fixed canvas height instead of responsive */
.bitbybit-canvas-base-listen canvas {
  height: 700px !important;
  min-height: 700px !important;
}

/* Adjust canvas maximum height */
canvas {
  max-height: 80vh !important; /* Change from default 100vh */
}
```

For adjusting the container width or parent element styling, you'll need to inspect your specific theme's CSS classes using browser developer tools, as these vary significantly between themes.

:::warning CSS Specificity and Theme Variations
Custom CSS requires understanding your theme's existing styles and may need `!important` to override 3D Bits' default styling. The main `canvas` element and its wrapper div `.bitbybit-canvas-base-listen` are the primary targets for styling.

**Important:** Every Shopify theme uses different CSS classes and structure for product pages. The examples above only show how to override 3D Bits' own canvas styling. To adjust the parent containers or layout, you **must** inspect your specific theme using browser developer tools (F12) to identify the correct selectors. Always test thoroughly across different screen sizes.
:::

### Option 3: Advanced Layout Customization (Advanced)

For complete control, developers can modify theme templates to create custom layouts:

**Possible approaches:**
- **Full-width canvas with overlay controls:** Place the 3D canvas at 100% viewport width with product options in a floating panel or overlay
- **Split-screen design:** Fixed 3D canvas on one side, scrollable product information on the other
- **Immersive layouts:** Background 3D canvas with transparent or semi-transparent content overlay
- **Responsive breakpoints:** Different layouts for mobile vs. desktop viewing

**Implementation considerations:**
- Modify theme liquid templates (`product.liquid`, `main-product.liquid`, or relevant sections)
- Add custom CSS for layout structure and responsive behavior
- Ensure mobile responsiveness and accessibility
- Test across all devices and browsers
- Maintain compatibility with theme updates (use child themes or version control)

**Example concept:**
```liquid
<!-- Custom product template structure -->
<div class="custom-product-layout">
  <div class="fullwidth-canvas">
    {% render 'bitbybit-canvas-block' %}
  </div>
  <div class="floating-product-panel">
    <div class="product-info">
      <!-- Product form, options, description -->
    </div>
  </div>
</div>
```

:::info Developer Resources
For detailed integration guidance, see our [Integration Guidelines](../../for-developers/integration) for developers. Custom layout implementations require Shopify theme development knowledge.
:::

## Mobile Considerations

Canvas sizing becomes especially important on mobile devices where screen real estate is limited.

**Responsive behavior:**
- The 3D canvas automatically scales to fit its container on all screen sizes
- Most themes stack content vertically on mobile (full-width media, then product form below)
- Consider mobile-first design when customizing layouts
- Test touch interactions and viewport heights

**Mobile optimization tips:**
- On mobile, horizontal space is limited (narrow screen width), but users can scroll vertically
- Consider sticky or collapsible controls to maximize canvas visibility
- Test how your 3D canvas behaves when users rotate their devices
- Ensure important configurator controls remain accessible without excessive scrolling

## Common Scenarios and Solutions

### "The canvas is too small next to my product form"

**Solution:** Adjust your theme's product media width setting. Look for options like "Media width: 50%" and increase to 60-70%. This gives more space to the canvas while maintaining a two-column layout.

### "I want a full-width immersive experience"

**Solution:** This requires template customization. Your developer can create a custom product template with full-width canvas and overlaid or below-canvas product controls. See Option 3 above.

### "The canvas looks different on mobile vs. desktop"

**Solution:** This is expected behavior—responsive themes adapt layouts for different screen sizes. Use theme settings to control mobile-specific layouts, or add custom responsive CSS for precise control.

### "Can 3D Bits override my theme layout automatically?"

**No, and here's why:** Following our [design philosophy](./under-the-hood#our-design-philosophy-focus-on-what-we-do-best), 3D Bits respects your theme's structure rather than overriding it. Every store has unique design requirements, and automatically changing layouts could break carefully designed experiences. Instead, we provide the flexible canvas element that you can size and place according to your needs.

## Best Practices

**Before launching your 3D configurator:**
1. **Plan your layout:** Decide how much space you want to dedicate to 3D visualization
2. **Review theme capabilities:** Explore what your theme offers in terms of layout flexibility
3. **Test across devices:** Ensure the canvas size works well on mobile, tablet, and desktop
4. **Consider user flow:** Balance canvas size with accessibility of product options and information
5. **Document customizations:** If using custom CSS or templates, document your changes for future reference

**For optimal user experience:**
- Provide enough canvas space for users to comfortably view and interact with 3D models
- Ensure product configurator controls are visible and accessible without scrolling
- Balance immersive visualization with necessary product information
- Test with actual 3D models and realistic product options

## The Bottom Line

**The 3D canvas size is determined by your store's design, not by 3D Bits.** This approach gives you complete control over how 3D visualization integrates with your unique brand experience, product information layout, and design aesthetic.

If you're not satisfied with the default canvas size:
1. ✅ Start with theme settings (easiest, no code required)
2. ✅ Add custom CSS for specific adjustments (intermediate, flexible)
3. ✅ Create custom templates for complete control (advanced, limitless possibilities)

**Remember:** The goal is to create an experience that serves your customers. Sometimes a smaller, well-integrated canvas alongside clear product information works better than an immersive full-screen experience. Consider your products, your customers' needs, and your brand identity when making layout decisions.

---

**Need help with custom layouts?** Consult your theme developer or reach out to us for complex integration projects.
