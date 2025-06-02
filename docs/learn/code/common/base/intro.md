---
sidebar_position: 1
title: Introduction to Base Algorithms of Bitbybit
sidebar_label: Base Algorithms of Bitbybit
description: Discover the foundational capabilities of the @bitbybit-dev/base NPM package, your core toolkit for geometric and utility functions in Bitbybit.
tags: [code, base]
---

[View Package Source on GitHub](https://github.com/bitbybit-dev/bitbybit/tree/master/packages/dev/base)   
[NPM Package](https://www.npmjs.com/package/@bitbybit-dev/base)

Welcome to the **`@bitbybit-dev/base`** package! This is the foundational layer of the Bitbybit ecosystem, providing a rich set of core utilities for mathematics, geometry, data manipulation, and more. Whether you're building complex 3D models, performing geometric analysis, or just need robust utility functions, the `base` package is your starting point.

Think of this package as your essential toolbox, filled with well-defined, reliable tools that other Bitbybit functionalities and your own projects can build upon.

## What's Inside? A Tour of Core Capabilities

The `@bitbybit-dev/base` package is organized into several key classes, each specializing in a different area:

### `Vector` - The Language of Position and Direction
   At its core, a vector (or a point) in Bitbybit is simply an array of numbers (e.g., `[x, y, z]`). The `Vector` class provides a comprehensive suite for:
   *   **Creating** vectors and number sequences (like linear spans or eased distributions).
   *   Performing fundamental **vector math**: addition, subtraction, dot product, cross product, scaling.
   *   **Analyzing** vectors: calculating length (norm), normalizing (to get direction), finding distances, and measuring angles.
   *   [Learn more about the Vector class...](./vector/intro)

### `Point` - Defining Locations in Space
   While structurally similar to vectors, the `Point` class focuses on operations related to specific locations:
   *   **Creating** individual points or patterned arrangements (like spirals or hexagonal grids).
   *   **Transforming** points: moving (translating), rotating, and scaling them in 3D space.
   *   **Analyzing** collections of points: finding the closest point, calculating bounding boxes, or determining the average position.
   *   [Learn more about the Point class...](./point/intro)

### `Line` - Working with Straight Segments
   The `Line` class deals with straight line segments defined by start and end points:
   *   **Creating** lines from various inputs (pairs of points, sequences of points).
   *   **Getting information** like length, endpoints, or points along the line.
   *   **Transforming** lines and converting between different line/segment representations.
   *   Performing **intersections** between lines.
   *   [Learn more about the Line class...](./line/intro)

### `Polyline` - Paths and Sequences of Lines
   Polylines are sequences of connected line segments, forming paths or outlines:
   *   **Creating** polylines from lists of points, specifying if they are open or closed.
   *   **Analyzing** polylines: calculating total length or getting their constituent points.
   *   **Modifying** polylines: reversing direction or applying transformations.
   *   Finding **intersections** (self-intersections or intersections between two polylines).
   *   Advanced utilities like **sorting scattered segments** into continuous polylines.
   *   [Learn more about the Polyline class...](./polyline/intro)

### `Math` - Your Numerical Toolkit
   The `Math` class offers a wide array of numerical operations:
   *   **Basic arithmetic** and standard mathematical functions (square root, absolute value, logarithms, trigonometry).
   *   **Number generation** (random numbers, Pi).
   *   **Number manipulation** like remapping values from one range to another.
   *   Powerful **easing functions** for creating smooth, non-linear transitions and distributions.
   *   [Learn more about the Math class...](./math/intro)

### `Lists` - Managing Your Data Collections
   Lists (arrays) are fundamental for storing collections of data. The `Lists` class provides extensive tools for:
   *   **Creating** and populating lists (e.g., repeating items).
   *   **Accessing** items by index, getting sub-lists, or retrieving items based on patterns.
   *   **Modifying** lists: adding, removing, or replacing items.
   *   **Restructuring** lists: reversing, grouping, or transposing (flipping) 2D lists.
   *   **Sorting** lists of numbers, text, or objects by property values.
   *   [Learn more about the Lists class...](./lists/intro)

### `Color` - Working with Colors
   The `Color` class helps you define, convert, and manipulate colors, primarily focusing on:
   *   **Hexadecimal** (e.g., `#FF0000`) and **RGB** (Red, Green, Blue) color formats.
   *   **Converting** seamlessly between these formats.
   *   **Extracting** individual color components (R, G, B).
   *   Performing basic manipulations like **inverting** a color.
   *   [Learn more about the Color class...](./color/intro)

### `Logic` - Making Decisions
   The `Logic` class is all about boolean values (`true`/`false`) and conditional operations:
   *   **Creating** boolean values and lists of booleans (e.g., from random generation or by thresholding numerical data).
   *   Performing **comparisons** between values (equal to, greater than, etc.).
   *   Implementing **conditional logic** with "gates" that pass through data only if a condition is met.
   *   [Learn more about the Logic class...](./logic/intro)

### `Text` - Manipulating and Representing Text
   The `Text` class provides tools for string operations and an exciting feature for 3D:
   *   Basic **string manipulation**: splitting, joining, replacing, and formatting text.
   *   Converting various data types **to strings**.
   *   Generating **vector text**: converting text characters into 2D vector paths, suitable for creating 3D text objects in your scenes.
   *   [Learn more about the Text class...](./text/intro) <!-- Link to Text API page -->

### `Dates` - Handling Date and Time
    The `Dates` class provides utilities for working with date and time information:
    *   **Creating** `Date` objects (current time, specific dates, from timestamps).
    *   **Converting** dates to various string formats (ISO, locale-specific, UTC).
    *   **Getting and setting** individual components of a date (year, month, day, hour, etc.), with support for both local time and UTC.
    *   **Parsing** date strings into `Date` objects.
    *   [Learn more about the Dates class...](./dates/intro) <!-- Link to Dates API page -->

### `Mesh Utilities` - Low-Level Mesh Operations
    The `MeshBitByBit` class offers specialized functions for working directly with mesh triangles and planes:
    *   Calculating **distances to planes** and defining **triangle planes**.
    *   Performing **intersections** between triangles and, by extension, between entire meshes to find intersection segments or polylines.
    *   These are more advanced tools for detailed geometric analysis.
    *   [Learn more about the Mesh Utilities class...](./mesh/intro)

## Get Started!

The `@bitbybit-dev/base` package is designed to be intuitive and powerful. Dive into the documentation for each class to explore their methods in detail and see how they can accelerate your development with Bitbybit.

Happy coding!