---
sidebar_position: 1
title: What is Viewer Editor?
sidebar_label: Overview
description: Understand what the Viewer Editor is, its key capabilities, and how it fits into your 3D eCommerce workflow.
tags: [viewer-editor, overview, no-code]
---

# What is Viewer Editor?

The **Viewer Editor** is a professional no-code visual tool for creating advanced 3D product configurators and interactive scenes for eCommerce. It provides a comprehensive interface for designing complex 3D experiences without writing JSON configuration manually.

## Key Capabilities

### Visual Scene Building
Instead of writing JSON by hand, you use an intuitive visual interface to:
- Add and arrange multiple 3D models in a single scene
- Configure camera positions and controls with preview
- Design backgrounds with gradients, images, or HDR skyboxes
- Set up custom lighting and shadows
- Create loading screens with your branding

### Product Variant Integration
Connect your product options to 3D visualization:
- Show/hide entire models based on variant selection
- Control visibility of individual GLTF nodes
- Apply material variants from GLTF files
- Use simple or advanced condition-based matching
- Manage option name mappings between 3D models and HTML inputs on your page

### Technical Annotations
Add professional dimension annotations:
- Linear measurements between any given points in 3D space
- Angular dimensions for angles
- Radial and diametral dimensions for circular features
- Ordinate dimensions from reference points
- Automatic bounding box dimensions
- Full styling control for dimension appearance

### Interactive Navigation
Guide customers through your product:
- Create points of interest with custom hotspots
- Define camera animations for smooth transitions
- Style hotspots with custom colors and effects
- Link navigation to variant selections

## Who Is It For?

The Viewer Editor is designed for:

- **eCommerce Businesses** who want advanced 3D product configurators
- **Product Designers** creating technical product visualization
- **Marketing Teams** building engaging product experiences
- **Store Owners** on Shopify (with planned support for other platforms)

## Enterprise Feature

:::info Subscription Required
Viewer Editor is a stand-alone **enterprise-level application** designed exclusively for B2B eCommerce customers.

**Key Points:**
- **Shopify Users**: Requires a paid subscription through the 3D Bits app
- **Custom Webshops**: Available through custom B2B agreements (pricing differs from Shopify)
- **Not Included In**: Free, Silver, and Gold Bitbybit plans
- **Three Subscription Tiers**: Professional and Enterprise tiers unlock advanced features

For Shopify users, see [Subscription Plans](../../../3d-bits/plans/subscription-plans.md) for details on which features are included in each tier.
:::

## How It Works

1. **Access** - Open the Viewer Editor from your 3D Bits app dashboard
2. **Design** - Use the visual interface to configure your scene
3. **Preview** - See changes in the 3D canvas
4. **Test** - Simulate variant selections to verify behavior
5. **Export** - Copy or download the generated JSON configuration
6. **Integrate** - Link the configuration to your product pages

## Generated Output

The Viewer Editor generates valid JSON that conforms to the [**Viewer Scene Schema**](https://app-store.bitbybit.dev/files/ecommerce/viewer-editor/viewer-scene-schema-v0.21.1.json). This JSON can be:

- Copied to clipboard and pasted into Shopify product metafields
- Downloaded as a file and hosted on your CDN
- Used with the BITBYBIT VIEWER theme app extension block on Shopify

The generated configuration is automatically validated to ensure it will work correctly when deployed.

## Platform Support

**Current:**
- ✅ Shopify (via 3D Bits app)

**Potential integrations coming in the future:**
- 🚧 WooCommerce
- 🚧 Custom eCommerce solutions

For non-Shopify platforms, please contact us at [info@bitbybit.dev](mailto:info@bitbybit.dev) to discuss custom integration options.

## What You'll Learn

This documentation covers:

- **Basics** - Interface overview, navigation, and core concepts
- **Models** - Adding and managing 3D models
- **Variants** - Connecting product options to 3D visualization
- **GLTF Structure** - Working with GLTF/GLB node hierarchies
- **Scene Configuration** - Camera, lighting, backgrounds, and more
- **Dimensions** - Adding technical annotations
- **Navigation** - Points of interest and camera animations
- **Advanced Features** - Rotations, multiple models, and more
- **Export** - Getting your configuration into production
- **Troubleshooting** - Common issues and solutions

## Next Steps

Ready to get started? Continue to:
- [Getting Started](./getting-started.md) - Access the editor and create your first scene
- [Interface Overview](./interface-overview.md) - Learn the layout and controls


Or jump to a specific topic using the navigation menu.
