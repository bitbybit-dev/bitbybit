---
sidebar_position: 2
title: "Working with Edges in OCCT"
sidebar_label: OCCT Edge
description: Learn about OCCT edges, how to create linear and curved edges, analyze their properties, use them to construct wires, and deconstruct other shapes into edges in Bitbybit.
slug: /editors/categories/occt/edge # Or adjust as needed
tags: [occt]
---

# OCCT Shapes: The Edge

<img 
  src="https://s.bitbybit.dev/assets/icons/white/occt-icon.svg" 
  alt="OCCT category icon with a stylized logo representation"
  width="100"
  title="OCCT category icon" />

## Introduction to Edges

In OpenCascade Technology (OCCT), an **Edge** is a fundamental 1D (one-dimensional) shape. It plays a crucial role in constructing more complex geometry:
*   Edges are used to build **Wires**.
*   Wires, in turn, define the boundaries of **Faces**.

An edge is characterized by:
*   **Start and End Points (Vertices):** These define the limits of the edge. An edge can also be closed (like a circle), in which case the start and end points coincide.
*   **A Curve:** This defines the geometric path of the edge between its start and end points. Edges can be straight (linear) or curved (e.g., arcs, ellipses, splines).

## How to Create an Edge in Bitbybit

Within Bitbybit, you can create, manipulate, and analyze edges using functions and components typically found under the `bitbybit.occt.shapes.edge...` class.

You can create various types of edges directly:
*   **Linear Edges:** Straight lines between two points.
*   **Arc Edges:** Circular arcs defined by parameters like center, radius, and angles.
*   **Ellipse Edges:** Elliptical arcs.
*   **Circle Edges:** Complete circles.

It's also possible to create a single-segment wire first and then convert it into an edge, as long as the wire consists of only one edge segment. Conversely, if you have a wire made of multiple connected edges, you can deconstruct that wire back into its constituent edges.

## Edge Analysis

Bitbybit provides some commands to inspect and analyze the properties of edges, such as these:

*   **`getEdgeLength`:** Get the length of the edge.
*   **`startPointOnEdge` / `endPointOnEdge`:** Retrieve the start and end vertices of the edge.
*   **`edgesToPoints` (Adaptive Subdivision):** This specialized command creates more points in areas of higher curvature along the edge and fewer points on straighter sections. This adaptive subdivision is particularly useful for applications like CNC (Computer Numerical Control) machining paths or when a non-uniform distribution of points is desired for analysis or meshing.

## Constructing Wires from Edges

You can construct a **Wire** by joining multiple edges together. A critical requirement for this is that the **end point of one edge must precisely match the start point of the next edge** in the sequence. If the edges are disconnected or have gaps between their endpoints, a valid wire cannot be formed from them directly.

## Deconstructing Shapes into Edges

Many higher-level OCCT shapes can be deconstructed to extract their constituent edges. This is a powerful feature for various analysis, manipulation, and feature recognition tasks.

*   **`getEdges` Command:** You can use a `getEdges` command/component to deconstruct Solids, Shells, Faces, and Wires into a list of their individual edges.
*   **Order of Edges:** When you deconstruct shapes like solids or faces into edges using a general `getEdges` function, the resulting list of edges might not be ordered in any specific path-following sequence. However, the order will typically be consistent, often matching the sequence used if you were to draw edge indexes.

### Deconstructing Wires with Ordered Edges

When you specifically want the edges of a wire to be returned in the order they appear along the wire's path, you can use a command like **`getEdgesAlongWire`**. This function offers additional benefits:
*   **Ordered Output:** It returns the edges in the sequence they form the wire.
*   **Direction Correction:** In OCCT, a wire can be constructed by joining edges that might be oriented in opposing directions relative to the overall wire direction. The `getEdgesAlongWire` command often attempts to reverse such edges so that their individual directions align with the wire's flow. This is very useful when you need a consistently oriented sequence of edges, for example, for path-based operations.

**Note on `getEdgesAlongWire` for Complex Shapes:**
The `getEdgesAlongWire` command typically operates on a single wire. If you need to get ordered edges for all boundaries of a solid, you would generally follow a multi-step process:
1.  Deconstruct the solid into its Faces.
2.  For each Face, get its boundary Wires.
3.  For each Wire, use `getEdgesAlongWire` to get its ordered edges.
This approach allows you to build collections of well-ordered edges for each boundary loop of your model.

Understanding how to create, analyze, and deconstruct edges is fundamental to leveraging the full power of OCCT within Bitbybit for parametric design and geometric manipulation.