---
sidebar_position: 3
title: Supported 3D Formats
sidebar_label: Supported Formats
description: Complete reference for supported 3D file formats, their features, and when to use each.
tags: [3d-bits, composer, formats, gltf, glb]
---

# Supported 3D File Formats

Composer supports multiple 3D file formats, each with different capabilities and use cases. This guide helps you choose the right format for your needs.

## Format Comparison Table

Composer loads six extensions: `.glb`, `.gltf`, `.splat`, `.ply`, `.stl` and `.obj`. Anything else is rejected when the model is added.

| Format | Extension | Materials | Textures | Animations | Material variants | Node Control | Best For |
|--------|-----------|-----------|----------|------------|-------------------|--------------|----------|
| **GLB** ⭐ | `.glb` | ✅ | ✅ | ✅ | ✅ | ✅ | **Production** |
| **GLTF** | `.gltf` | ✅ | ✅ | ✅ | ✅ | ✅ | Development |
| **SPLAT** | `.splat` | ☑️ | ☑️ | ❌ | ❌ | ❌ | Gaussian splatting |
| **PLY** | `.ply` | ☑️ | ☑️ | ❌ | ❌ | ❌ | Gaussian splat and scan output |
| **STL** | `.stl` | ❌ | ❌ | ❌ | ❌ | ❌ | CAD exports |
| **OBJ** | `.obj` | ❌ | ❌ | ❌ | ❌ | ❌ | Legacy meshes |

⭐ = Recommended for production  
☑️ = Photorealistic appearance achieved through 3D Gaussian Splatting (3DGS) ellipses instead of traditional materials/textures

**Material variants** means the alternative material sets baked into a glTF with `KHR_materials_variants`, and **Node Control** means showing and hiding the parts inside one file. Those two columns are what a configurator is built from, and only glTF and GLB have them. Every format can still be shown or hidden as a whole, positioned, rotated, scaled and given transform variants, because those are set on the model rather than inside the file.

---

## GLB Format (Recommended)

**File Extension:** `.glb`  
**MIME Type:** `model/gltf-binary`  
**Best For:** Production eCommerce use

### Advantages

✅ **Single File** - All data in one file (geometry, materials, textures)  
✅ **Smallest Size** - Binary format is compact  
✅ **Fastest Loading** - Optimized for web delivery  
✅ **Full Features** - Supports all Composer capabilities  
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
- Never above 30 MB - see [File Size Guidelines](#file-size-guidelines) below

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
✅ **Swappable whole** - a scan can still be shown or hidden by a rule, so several scans can stand in for each other as options  

### Limitations

❌ **No material variants** - nothing inside the file can be switched, so each alternative is a separate capture and a separate download  
❌ **No Materials** - Baked appearance  
❌ **Large Files** - 5-100 MB typical straight out of a capture tool, so compressing them is not optional: anything over 30 MB will not load at all on iPhone Safari  
❌ **In active development** - Some tools may lack support for splats  
❌ **No Scene Lighting Interaction** - SPLAT files are not affected by Composer scene lights and do not cast or receive shadows from the scene. However, if the original 3D scan captured lighting and shadows from the real environment, those will be preserved in the SPLAT file as part of the baked appearance

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
4. Use the GLB in Composer

---

## PLY Format

**File Extension:** `.ply`  
**Best For:** Gaussian splat captures and scanner output

PLY comes in two quite different flavours and 3D Bits loads them through the same reader as `.splat`. A splat PLY behaves exactly like a `.splat` file. A scanner PLY is plain geometry, usually with colour baked into its points rather than into materials.

### Features

✅ **Direct from scanners and splat tools** - no conversion step  
✅ **Colour without textures** - point or vertex colour comes across  

### Limitations

❌ **No material variants and no node control** - it cannot be parsed into a structure  
❌ **No materials to recolour or swap** - what was captured is what you get  
❌ **Large files** - splat PLY in particular is rarely small, and the 30 MB block applies to it too  

### When to Use

- ✅ A capture your scanning tool exports as PLY
- ✅ A quick look at scanner output before you commit to it
- ❌ A configurable product - convert to GLB and build the options there

---

## OBJ Format

**File Extension:** `.obj`  
**Best For:** Legacy meshes you have nothing better for

OBJ loads, and that is close to the whole story. Its materials live in a separate `.mtl` file with its texture images beside it, which runs into exactly the hosting problem described for multi-file glTF in [Adding Models](/learn/3d-bits/composer/models/adding-models#gltf) - single-file storage gives every upload its own address, so those companions are not found. In practice an OBJ shows up as untextured geometry.

### Limitations

❌ **Materials arrive separately** - and therefore usually not at all  
❌ **No material variants and no node control**  
❌ **Verbose** - a text format, so files are larger than the equivalent GLB  

### When to Use

- ✅ A one-off look at some old geometry
- ❌ Anything on a product page - import it into Blender, give it materials, export GLB

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

OBJ, PLY and STL load directly, so this is a recommendation rather than a requirement. They carry no material variants and no node visibility control, which is what configurable products are built on, so converting is worth the effort for anything beyond a static preview.

If you have:
- FBX files → Convert to GLB, this format is not loaded
- GLTF folders with separate `.bin` and texture files → Convert to GLB, or host the whole folder yourself; uploaded one at a time the companion files cannot be found
- STEP or STPZ files → Use [Helpers → Converters](/learn/3d-bits/admin/helpers#converters)
- OBJ files → Loads, but convert to GLB for materials and variants
- PLY files → Loads, but convert to GLB unless it is a Gaussian splat capture
- STL files → Loads as plain grey geometry, add materials and convert to GLB

---

## File Size Guidelines

No format carries a size limit of its own - size is not a property of the format. There are two figures that actually stop something, and they are the same for every format:

- **100 MB** is the only hard refusal. A file larger than that is rejected when you upload it to your asset library, with *"File is too large - the maximum is 100 MB."*
- **30 MB** is a storefront block rather than a maximum, and it applies on **iPhone Safari only**. See the admonition below.

Everything in between is advisory. Composer flags heavy files as you work, but nothing between the two figures above stops you saving, publishing or loading anything.

The column below is therefore the iPhone Safari ceiling, not a maximum:

| Format | Recommended | iPhone Safari ceiling | Notes |
|--------|-------------|-----------------------|-------|
| GLB | < 10 MB | 30 MB | Compress textures and geometry |
| GLTF | < 10 MB | 30 MB | Self-contained only - convert to GLB instead |
| SPLAT | < 10 MB | 30 MB | Compress the capture; splats are rarely small |
| PLY | < 10 MB | 30 MB | Same reader as SPLAT, same advice |
| STL | < 5 MB | 30 MB | Add materials, convert to GLB |
| OBJ | < 5 MB | 30 MB | Convert to GLB |

:::danger 30 MB is a hard block, not a guideline
On the storefront, 3D Bits refuses to load **any single model over 30 MB on iPhone Safari**, because those shoppers' browsers are the ones that crash. They see a panel explaining it and the rest of the scene loads without that model.

The limit is per model rather than per scene, so a scene of four 20 MB models loads and a scene of one 31 MB model does not. No other browser blocks on size, which means a file over the line is invisible to you until an iPhone shopper meets it.

Composer flags a file at **20 MB** and again at **40 MB**, and warns when every distinct file together passes 40 MB. [Model size and performance limits](/learn/3d-bits/3d-assets/size-and-performance) sets out all four limits and what each one does.
:::

:::warning Large Files
Well under the block, a heavy file still:
- Takes very long to load
- Causes memory issues
- Fails on lower-end devices
- Creates a poor user experience

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
6. **Test in Composer**
7. **Optimize further if needed**

### For Existing Content

1. **Identify current format** (OBJ, FBX, etc.)
2. **Import into Blender or compatible software**
3. **Set up PBR materials**
4. **Export as GLB**
5. **Test in Composer**

### STEP, IGES and BRep formats

**Start with the built-in converter.** If what you have is a **STEP** (`.step`, `.stp`) or **STPZ** file, you do not need another tool: the 3D Bits app has a converter at **Helpers → Converters** that turns it into glTF. Composer's start screen links straight to it - *"Have a STEP or STPZ file? Go to the Converter to generate glTF."* - and [Helpers](/learn/3d-bits/admin/helpers#converters) describes it.

Treat the result as a starting point rather than a finished asset. CAD carries far more detail than a product page needs, so the converted file usually wants a pass through Blender to reduce it and to group the parts the way your options need. [Preparing 3D assets](/learn/3d-bits/3d-assets/preparing-gltf) covers that pass.

For **IGES**, **Parasolid** and **ACIS**, and for a STEP file the converter cannot make sense of, take the manual route described below.

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

**The manual conversion workflow:**

:::danger Never Upload Production CAD Files Directly
Production CAD files (STEP, IGES, etc.) often contain precise engineering data, manufacturing specifications, and proprietary information. **Never convert and upload these directly to your website.** Always create simplified, marketing-quality versions that show product appearance without revealing sensitive technical details.

[**Read: Your Assets & Security - Essential Information**](/learn/3d-bits/3d-assets/asset-security)
:::

BRep formats cannot be directly loaded into Composer. They must be tessellated (converted from mathematical surfaces to polygon meshes) first:

1. **Tessellate in CAD software** - Open the STEP/IGES file in tools like:
   - **FreeCAD** (free, open-source)
   - **Rhino** (paid, excellent tessellation control)
   - **Blender with CAD Sketcher addon** (free)
   - Original CAD software (SolidWorks, Fusion 360, etc.)

:::warning Tessellation Strategy Matters
Tessellation settings directly impact triangle count. CAD models can easily generate millions of triangles with high-quality settings, creating files too heavy for web use. For eCommerce, aim for **50,000-500,000 triangles** per model. Use coarser tessellation settings, then manually add detail only where visible. Test file size and loading performance-web models must remain lightweight for smooth shopper experience.
:::

2. **Export as mesh** - Save as OBJ or STL from the CAD tool

3. **Import to Blender** - Load the mesh, merge/clean geometry

4. **Apply materials & textures** - Add PBR materials for realistic appearance

5. **Export as GLB** - Final format for Composer

[**Check this tutorial to learn conversion principles between STEP and GLB**](/learn/3d-bits/tutorials/videos-tutorials/step-to-gltf)

[**Learn More about 3D assets & configurators**](/learn/3d-bits/3d-assets)

---

## Next Steps

Now that you understand file formats:

- [Adding Models](/learn/3d-bits/composer/models/adding-models) - Add your models to the scene
- [Model Properties](/learn/3d-bits/composer/models/model-properties) - Configure model settings
