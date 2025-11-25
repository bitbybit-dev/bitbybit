---
sidebar_position: 3
title: Supported 3D Formats
sidebar_label: Supported Formats
description: Complete reference for supported 3D file formats, their features, and when to use each.
tags: [viewer-editor, formats, gltf, glb]
---

# Supported 3D File Formats

The Viewer Editor supports multiple 3D file formats, each with different capabilities and use cases. This guide helps you choose the right format for your needs.

## Format Comparison Table

| Format | Extension | Materials | Textures | Animations | Variants | Node Control | Best For |
|--------|-----------|-----------|----------|------------|----------|--------------|----------|
| **GLB** ⭐ | `.glb` | ✅ | ✅ | ✅ | ✅ | ✅ | **Production** |
| **GLTF** | `.gltf` | ✅ | ✅ | ✅ | ✅ | ✅ | Development |
| **SPLAT** | `.splat` | ☑️ | ☑️ | ❌ | ❌ | ❌ | Gaussian splatting |
| **STL** | `.stl` | ❌ | ❌ | ❌ | ❌ | ❌ | CAD exports |

⭐ = Recommended for production  
⚠️ = Partial support (requires additional files)  
☑️ = Photorealistic appearance achieved through 3D Gaussian Splatting (3DGS) ellipses instead of traditional materials/textures

---

## GLB Format (Recommended)

**File Extension:** `.glb`  
**MIME Type:** `model/gltf-binary`  
**Best For:** Production eCommerce use

### Advantages

✅ **Single File** - All data in one file (geometry, materials, textures)  
✅ **Smallest Size** - Binary format is compact  
✅ **Fastest Loading** - Optimized for web delivery  
✅ **Full Features** - Supports all Viewer Editor capabilities  
✅ **Industry Standard** - Widely supported across platforms  
✅ **PBR Materials** - Physically-based rendering support  
✅ **Material Variants** - Multiple material configurations  
✅ **Node Hierarchy** - Full control over object parts  

### When to Use

- ✅ Production eCommerce products
- ✅ Interactive configurators
- ✅ Models with textures and materials
- ✅ Files that need to load quickly
- ✅ When using variant matching features

### Creating GLB Files

**From Blender:**
1. File → Export → glTF 2.0
2. Format: **glTF Binary (.glb)**
3. Enable: Include → Selected Objects, Materials, Textures
4. Enable: Compression → Draco (optional, reduces size)
5. Export

### GLB Optimization Tips

1. **Compress Textures**
   - Use JPEG or WebP for diffuse/base color
   - Use WebP only when transparency needed
   - Resize to appropriate resolution (512px-2048px)

2. **Enable Draco Compression**
   - Reduces geometry size by 60-90%
   - Slightly increases load time (worth it)
   - Widely supported in browsers

3. **Remove Hidden Geometry**
   - Delete faces not visible to camera
   - Remove internal components
   - Clean up mesh before export

4. **Optimize Materials**
   - Share materials where possible
   - Remove unused textures
   - Use efficient texture formats

**Target Sizes:**
- Simple product: < 2 MB
- Detailed product: 2-10 MB
- Complex product: 10-30 MB
- Maximum: 50 MB

[**Check this guide for helpful tips**](/learn/3d-bits/3d-assets/preparing-gltf)

---

## SPLAT Format

**File Extension:** `.splat`  
**Best For:** Gaussian splatting captures

### About Gaussian Splatting

A new 3D capture technique that creates photorealistic scenes from photos or videos using AI. Some of the apps you can use to create splats:

[**Check this tutorial on how to use 3DGS as variants**](/learn/3d-bits/tutorials/videos-tutorials/viewer-no-code-3d-scan-configurators)

- [Scaniverse](https://scaniverse.com/) Free
- [Luma AI](https://lumalabs.ai/) Paid
- [Polycam](https://poly.cam/) Paid

The best opensource editor for splats - [Supersplat](https://superspl.at/editor)

### Features

✅ **Photorealistic** - Very high visual quality  
✅ **From Photos** - Created from image sets  
✅ **Novel View Synthesis** - Smooth viewing angles  
✅ **Variants** - Use separate 3D scans as different models 

### Limitations

❌ **Variants Heavy** - Using different models to represent variants might be inefficient
❌ **No Materials** - Baked appearance  
❌ **Large Files** - 5-100MB typical  
❌ **In active development** - Some tools may lack support for splats  
❌ **No Scene Lighting Interaction** - SPLAT files are not affected by Viewer Editor scene lights and do not cast or receive shadows from the scene. However, if the original 3D scan captured lighting and shadows from the real environment, those will be preserved in the SPLAT file as part of the baked appearance

### When to Use

- ✅ Photorealistic room/environment captures
- ✅ Artistic/showcase purposes
- ✅ Experimental projects
- ❌ Product configurators (harder to configure efficiently)

---

## STL Format

**File Extension:** `.stl`  
**Best For:** CAD exports, 3D printing

### Features

✅ **CAD Compatibility** - Standard CAD export  
✅ **Simple Geometry** - Easy to work with  
✅ **Small Files** - Geometry only  

### Limitations

❌ **No Colors** - Solid gray only  
❌ **No Materials** - No visual properties  
❌ **No Textures** - Can't apply images  
❌ **Basic Display** - Very plain appearance  

### When to Use

- ✅ CAD model previews
- ✅ Technical drawings
- ✅ When visual quality doesn't matter
- ❌ Product visualization (use GLB with materials)

### Adding Materials to STL

STL files display as solid gray. To add materials:

1. Import STL into Blender
2. Apply materials and textures
3. Export as GLB
4. Use the GLB in Viewer Editor

---

## Format Selection Guide

### For eCommerce Products → **GLB**

Use GLB when you need:
- Product configurators
- Material variants
- Node visibility control
- Professional appearance
- Fast loading times

### For 3D Scans → **SPLAT or GLB**

Use SPLAT:
- For fast changing, hard to model products - sculptures, flower compositions
- Do not forget to compress
- Photorealistic captures
- Showcase projects
- Experimental features

### For Legacy Content → **Convert to GLB**

If you have:
- OBJ files → Convert to GLB
- PLY files → Convert to GLB
- FBX files → Convert to GLB
- STL files → Add materials, convert to GLB
- GLTF folders → Convert to GLB

---

## File Size Guidelines

Recommended maximum sizes by format:

| Format | Recommended | Maximum | Notes |
|--------|-------------|---------|-------|
| GLB | < 10 MB | 50 MB | Compress textures and geometry |
| GLTF | < 15 MB total | N/A | Convert to GLB instead |
| SPLAT | < 30 MB | 100 MB | Experimental, may be slower |
| STL | < 5 MB | 20 MB | Add materials, convert to GLB |

:::warning Large Files
Files over 50 MB may:
- Take very long to load
- Cause memory issues
- Fail on mobile devices
- Create poor user experience

Optimize or split into multiple models if needed.
:::

---

## Recommended Workflow

### For New Projects

1. **Model in your preferred software** (Blender, 3ds Max, etc.)
2. **Apply PBR materials** (Metallic-Roughness workflow)
3. **Optimize geometry** (reduce polygons, remove hidden parts)
4. **Compress textures** (appropriate resolution)
5. **Export as GLB** with Draco compression
6. **Test in Viewer Editor**
7. **Optimize further if needed**

### For Existing Content

1. **Identify current format** (OBJ, FBX, etc.)
2. **Import into Blender or compatible software**
3. **Set up PBR materials**
4. **Export as GLB**
5. **Test in Viewer Editor**

### STEP, IGES and BRep formats

**What are BRep models?**  
BRep (Boundary Representation) is a precise mathematical representation of 3D geometry used in CAD software. Unlike mesh-based formats (GLB, STL), BRep defines surfaces using mathematical curves and equations, making them perfect for engineering and manufacturing but incompatible with real-time 3D viewers that require polygon meshes.

**Common BRep formats:**
- **STEP (.step, .stp)** - Industry standard for CAD exchange (created by SolidWorks, CATIA, Fusion 360, etc.)
- **IGES (.igs, .iges)** - Older CAD exchange format
- **Parasolid (.x_t, .x_b)** - Native format for Siemens NX, Solid Edge
- **ACIS (.sat)** - Format used by AutoCAD, Inventor

**Tools that create these files:**
- **SolidWorks** - Mechanical design CAD
- **CATIA** - Advanced engineering CAD
- **Fusion 360** - Cloud-based CAD
- **Rhino** - NURBS-based modeling
- **FreeCAD** - Open-source parametric CAD
- **Siemens NX** - Industrial CAD/CAM

**Conversion workflow:**

:::danger Never Upload Production CAD Files Directly
Production CAD files (STEP, IGES, etc.) often contain precise engineering data, manufacturing specifications, and proprietary information. **Never convert and upload these directly to your website.** Always create simplified, marketing-quality versions that show product appearance without revealing sensitive technical details.

[**Read: Your Assets & Security - Essential Information**](/learn/3d-bits/tutorials/getting-started/your-assets)
:::

BRep formats cannot be directly loaded into Viewer Editor. They must be tessellated (converted from mathematical surfaces to polygon meshes) first:

1. **Tessellate in CAD software** - Open the STEP/IGES file in tools like:
   - **FreeCAD** (free, open-source)
   - **Rhino** (paid, excellent tessellation control)
   - **Blender with CAD Sketcher addon** (free)
   - Original CAD software (SolidWorks, Fusion 360, etc.)

:::warning Tessellation Strategy Matters
Tessellation settings directly impact triangle count. CAD models can easily generate millions of triangles with high-quality settings, creating files too heavy for web use. For eCommerce, aim for **50,000-500,000 triangles** per model. Use coarser tessellation settings, then manually add detail only where visible. Test file size and loading performance—web models must remain lightweight for smooth customer experience.
:::

2. **Export as mesh** - Save as OBJ or STL from the CAD tool

3. **Import to Blender** - Load the mesh, merge/clean geometry

4. **Apply materials & textures** - Add PBR materials for realistic appearance

5. **Export as GLB** - Final format for Viewer Editor

[**Check this tutorial to learn conversion principles between STEP and GLB**](/learn/3d-bits/tutorials/videos-tutorials/step-to-gltf)

[**Learn More about 3D assets & configurators**](/learn/3d-bits/3d-assets)

---

## Next Steps

Now that you understand file formats:

- [Adding Models](./adding-models.md) - Add your models to the scene
- [Model Properties](./model-properties.md) - Configure model settings
