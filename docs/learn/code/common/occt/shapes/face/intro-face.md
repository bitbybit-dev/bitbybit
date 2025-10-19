---
sidebar_position: 1
title: "Working with Faces in OCCT"
sidebar_label: Intro Faces
description: Learn about OCCT faces, how to create them from wires, their role in constructing solids, and how faces can have multiple wires (e.g., for holes).
tags: [occt]
---

# OCCT Shapes: The Face

<img 
  class="category-icon-small" 
  src="https://s.bitbybit.dev/assets/icons/white/occt-icon.svg" 
  alt="OCCT category icon with a stylized logo representation" 
  title="OCCT category icon" />

## Introduction to Faces

In OpenCascade Technology (OCCT), a **Face** is a fundamental 2D shape that represents a surface bounded by one or more **Wires**. Faces are crucial as they form the surfaces used to construct **Shells** and **Solids**.

Key characteristics of faces:
*   **Composition:** Made from one or more closed wires that define boundaries. The outer wire defines the face's perimeter, while additional inner wires create holes.
*   **Surface Types:** Faces can represent various surface types, including planes, cylinders, spheres, and other complex surfaces, depending on the underlying geometry.
*   **Building Blocks:** Faces serve as the fundamental 2D elements for constructing 3D solids through operations like extrusion, revolution, or boolean combinations.

## Creating Face Primitives

Bitbybit offers many straightforward ways to create common face shapes (primitives) directly. These include:
*   **Squares and Rectangles**
*   **Circles and Ellipses**

These face primitives serve as excellent starting points for creating shells and solids, or can be used directly for surface analysis and visualization.

## Creating Faces from Wires

The most versatile method for creating faces is by using wires as boundaries:

*   **Simple Face:** Created from a single closed wire that defines the outer boundary.
*   **Face with Holes:** 
    *   **Outer Boundary:** One closed wire defines the face's perimeter.
    *   **Inner Boundaries (Holes):** Additional closed wires create holes within the face.
*   **Complex Surfaces:** Faces can be created on various underlying surfaces (planes, cylinders, etc.) with wire boundaries projected onto those surfaces.

## Faces as Building Blocks for Solids

Faces are fundamental for constructing 3D geometry:
*   **Shells:** Collections of connected faces that form the boundary of a volume.
*   **Solids:** Closed shells that define complete 3D objects with interior volume.
*   **Extrusion/Revolution:** Faces can be extruded along paths or revolved around axes to create 3D solids.

Understanding the relationship between wires and faces is essential for 3D modeling. When you deconstruct a face with holes, you'll get multiple wires - one for the outer boundary and additional wires for each hole.

The "Face" category in Bitbybit editors provides comprehensive tools for creating these essential 2D surfaces, bridging the gap between 1D wires and 3D solids, forming the foundation of surface and solid modeling operations.
