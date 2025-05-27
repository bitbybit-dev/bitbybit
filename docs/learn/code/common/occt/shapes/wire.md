---
sidebar_position: 3
title: "Working with Wires in OCCT"
sidebar_label: OCCT Wire
description: Learn about OCCT wires, how to create them from edges or points (polylines, splines, Bezier curves), their role in constructing faces, and how faces can have multiple wires (e.g., for holes).
tags: [occt]
---

# OCCT Shapes: The Wire

<img 
  src="https://s.bitbybit.dev/assets/icons/white/occt-icon.svg" 
  alt="OCCT category icon with a stylized logo representation" 
  width="100"
  title="OCCT category icon" />

## Introduction to Wires

In OpenCascade Technology (OCCT), a **Wire** is a fundamental shape typically composed of one or more connected **Edges**. Wires are crucial as they form the boundaries used to construct **Faces**.

Key characteristics of wires:
*   **Composition:** Made from a sequence of connected edges. A wire can even consist of a single edge.
*   **Curve Types:** Wires can represent various curve types, including BSplines, Bezier curves, and other complex paths, depending on the edges they are made from or the method used for their creation.
*   **More Creation Methods:** Bitbybit often provides a broader range of direct creation methods for wires compared to individual edges. If a direct method to create a specific type of curved edge isn't immediately apparent, you might find a corresponding wire creation tool. You can then, if needed, deconstruct that single-segment wire into its constituent edge.

## Creating Wire Primitives

Bitbybit offers many straightforward ways to create common wire shapes (primitives) directly. These include:
*   **Squares and Rectangles**
*   **Circles and Ellipses**
*   **N-gons (Polygons with N sides)**
*   Even more complex predefined shapes like **Stars, Hearts, or Christmas Trees**.

These wire primitives serve as excellent starting points for creating faces, which can then be extruded or otherwise manipulated to form shells or solids.

## Creating Wires from Points

Another popular and versatile method for creating wires is by using a collection of 3D points as input. These points can define the path of the wire in various ways:

*   **Polyline:** This is perhaps the most basic type of wire created from points. Bitbybit can transform a list of 3D points into a 3D polyline wire, which is a series of straight edge segments connecting the points in sequence.
*   **Curved Wires (BSplines, Bezier Curves, Interpolations):**
    *   **Interpolation:** If you choose to interpolate points into a wire, the resulting curve will pass *through* all the specified points, but its path between the points will be smoothly curved. Interpolated wires can also be made **closed** and **periodic** (smoothly continuous at the seam). Such periodic wires typically avoid sharp corners.
    *   **Bezier Curves:** A Bezier algorithm creates a smooth curve that is influenced by a set of control points. The curve aims to follow the general shape defined by these points but does *not necessarily pass through all of them* (except typically the start and end points).
    *   **BSplines:** BSplines offer even more control and flexibility for creating complex, smooth curves defined by control points, knots, and degrees.

## Wires as Boundaries of Faces ("Face Wires")

As mentioned, wires are fundamental for constructing faces and, by extension, shells.
*   **Outer Boundary:** Typically, a face has one **closed wire** that defines its outer boundary.
*   **Holes (Inner Boundaries):** A face can also have one or more holes. In such cases, the face will be defined by multiple wires:
    *   One wire for the outer boundary.
    *   Additional, separate closed wires for each inner hole.

Understanding this relationship is key when working with faces that have complex topologies. When you deconstruct a face, you might get multiple wires if it contains holes.

The "Wire" category in Bitbybit editors provides a rich set of tools for creating these essential 1D constructs, bridging the gap between simple points/edges and 2D faces, forming the backbone of many surface and solid modeling operations.