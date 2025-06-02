---
sidebar_position: 1
title: "Understanding OCCT Shape Types and Hierarchy"
sidebar_label: Intro Shapes
description: Explore the different types of shapes in OpenCascade Technology (OCCT) and understand their hierarchical relationship, from vertices to solids and compounds.
tags: [occt]
---

# OCCT Shapes: Building Blocks of 3D Geometry

<img 
  class="category-icon-small" 
  src="https://s.bitbybit.dev/assets/icons/white/occt-icon.svg" 
  alt="OCCT category icon with a stylized logo representation" 
  title="OCCT category icon" />

## Introduction to OCCT Shape Hierarchy

OpenCascade Technology (OCCT) defines several fundamental types of geometric shapes. Understanding the hierarchical relationship between these shapes is crucial for effective 3D modeling with OCCT. The basic hierarchy, from the simplest to the most complex, is generally as follows:

1.  **Vertex:** A single point in 3D space. It represents a location and has no dimension.
2.  **Edge:** A curve bounded by one or two vertices. It represents a 1D boundary of a face.
3.  **Wire:** A sequence of connected edges. A wire can be open or closed. Closed wires typically form the boundaries of faces.
4.  **Face:** A bounded portion of a surface. The boundaries of a face are defined by one or more wires. It represents a 2D region.
5.  **Shell:** A collection of connected faces. A shell can be open (like a surface model) or closed (forming an enclosed volume).
6.  **Solid:** A region of 3D space enclosed by one or more closed shells. Solids represent volumetric objects.

This hierarchy means you can conceptually (and sometimes programmatically) build up complex shapes from simpler ones:
*   Vertices can be used to define an edge.
*   Edges can be connected to form a wire.
*   Wires can define the boundary of a face.
*   Faces can be stitched together to create a shell.
*   A closed shell (or shells) can define a solid.

### The Compound Shape

A **Compound** is a special type of OCCT shape that acts as a container. It can group together any collection of other shape types (vertices, edges, faces, solids, or even other compounds). Compounds are very useful when you want to:
*   Organize multiple shapes as a single entity.
*   Apply the same transformation or operation to a group of shapes simultaneously.

## Can You Create a Solid Without Manually Building Up the Hierarchy?

**Yes, absolutely!**

While the underlying geometric structure of any valid solid in OCCT adheres to the hierarchy (a solid is composed of shells, shells of faces, etc.), Bitbybit (and OCCT itself) provides many **higher-level helper functions and tools** to create common and complex shapes directly, without requiring you to manually perform every step of the composition.

For example:
*   You can create a **cube solid** directly using a `createCube` function.
*   You can create a **cylinder solid** directly using a `createCylinder` function.
*   You can create a **sphere solid** directly using a `createSphere` function.

When you use these convenience functions, OCCT (and our Bitbybit wrappers) automatically handle the creation of the necessary underlying vertices, edges, wires, faces, and shells "behind the scenes" to construct the final solid shape. This makes the modeling process much more efficient and user-friendly for common geometric primitives.

However, it's still valuable to understand the fundamental hierarchy because:
*   It helps in debugging and understanding the structure of complex models.
*   For advanced or custom modeling scenarios, you might need to work with these lower-level entities directly (e.g., creating a face from a custom wire, or building a shell from a set of faces).
*   Many OCCT operations (like booleans, fillets, chamfers) operate on or produce these different shape types.

The OCCT Shapes category in Bitbybit editors provides components and functions for creating both primitive solids directly and for working with the lower-level shape entities when more granular control is needed.