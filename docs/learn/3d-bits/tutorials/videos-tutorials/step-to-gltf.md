---
sidebar_position: 6
title: "From STEP to GLTF - Convert PRO CAD 3D Models For 3D Bits Shopify App"
sidebar_label: Preparing GLTF Assets
description: Merchants often have product files created for manufacturing in professional CAD software such as FreeCAD, Fusion 360, CATIA, SolidWorks, Rhino, and others. But preparing these precise CAD models for web configurators is not straightforward.
tags: [shopify, 3d-bits]
---

# FreeCAD → Blender → Khronos Compressor → 3D Bits App for Shopify

## Learn how to prepare the models for web configurators

Merchants often have product files created for manufacturing in professional CAD software such as FreeCAD, Fusion 360, CATIA, SolidWorks, Rhino, and others. But preparing these precise CAD models for web configurators is not straightforward.

To achieve smooth performance and fast loading times, you need to:

* Optimize tessellation to keep triangle counts low without losing detail.
* Minimize the number of meshes - each extra mesh means an extra draw call, which can hurt frame rates.
* Balance texture quality and file size so your models look great while loading quickly.

That’s why it’s essential to choose an efficient workflow for converting STEP files into optimized, compressed GLTF models ready for the web.

## Video Tutorial: STEP TO GLTF

<div class="responsive-video-container">
  <iframe 
    width="560" 
    height="315" 
    src="https://www.youtube.com/embed/7mqd2FLlpcU" 
    title="From STEP to GLTF - Convert PRO CAD 3D Models For 3D Bits Shopify App" 
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
    allowfullscreen>
  </iframe>
</div>

In this tutorial, Matas Ubarevicius walks you through the full process of converting BREP-based geometry into lightweight, high-quality meshes:

1 - Start in FreeCAD – Import your STEP file, group parts by color, and tessellate them into meshes.
2 - Merge meshes so each one represents a single material.
3 - Export to PLY files and bring them into Blender.
4 - Apply materials in Blender, then export the model as GLTF.
5 - Compress your GLTF using the Khronos Compressor web tool.
6 - Upload to Shopify and import it into the 3D Bits app for seamless store integration.

By the end, you’ll have a streamlined, professional workflow for showcasing interactive 3D products in your online store—fast, optimized, and visually beautiful.

Thanks to [Ironside Armour](https://ironsidearmour.com) for providing the example 3D model.

[Python Macro For Selecting Objects By Colour](https://forum.freecad.org/viewtopic.php?p=733311&sid=b54256709987b58056037b42fab2ed73#p733311)   
Author: Forum User Roy_043

```python
import FreeCAD as App
import FreeCADGui as Gui

def getShapeColor(obj):
    if not hasattr(obj, "ViewObject"):
        return None
    if not hasattr(obj.ViewObject, "ShapeColor"):
        return None
    return obj.ViewObject.ShapeColor

def selectByShapeColor():
    doc = App.ActiveDocument
    if doc is None:
        App.Console.PrintWarning("There is no active document\n")
        return
    objs = Gui.Selection.getSelection()
    if len(objs) != 1:
        App.Console.PrintWarning("Select a single source object\n")
        return
    shape_col = getShapeColor(objs[0])
    if shape_col is None:
        App.Console.PrintWarning("Object does not have a ShapeColor\n")
        return
    objs = [obj for obj in doc.Objects if getShapeColor(obj) == shape_col]
    Gui.Selection.clearSelection()
    for obj in objs:
        Gui.Selection.addSelection(obj)

selectByShapeColor()
```