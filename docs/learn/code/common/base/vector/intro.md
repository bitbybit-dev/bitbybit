---
sidebar_position: 1
title: Vectors in Bitbybit
sidebar_label: Vectors in Bitbybit
description: An overview of the Vector class in Bitbybit, explaining its core functionalities for vector math in simple terms.
tags: [code, vector]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<img 
  src="https://s.bitbybit.dev/assets/icons/white/vector-icon.svg" 
  alt="Vector category icon" 
  title="Vector category icon"
  width="100" /> 

The `Vector` class in Bitbybit provides a comprehensive suite of tools for performing vector mathematics. In Bitbybit, a **vector is fundamentally represented as an array of numbers**. For 3D operations, this typically takes the form `[x, y, z]`, where `y` is considered the 'up' direction by convention in many Bitbybit contexts. This simple array representation means that vectors can often be used interchangeably with points, which also follow the `[x, y, z]` structure.

[Full Source on GitHub](https://github.com/bitbybit-dev/bitbybit/blob/master/packages/dev/base/lib/api/services/vector.ts)


The `Vector` class in Bitbybit is your toolkit for working with vectors and points in your 3D designs.

**What is a Vector in Bitbybit?**

At its heart, a vector (or a point) in Bitbybit is just a simple **array of numbers**.
*   For 2D, it might look like `[x, y]`.
*   For 3D, it's typically `[x, y, z]`. In many Bitbybit contexts, `y` represents the "up" direction.

This straightforward representation makes it easy to pass vector data around and use it in various calculations.

## What Can You Do With the Vector Class?

The `Vector` class helps you perform a wide range of operations. Here's a look at the main categories of features it supports. For the exact input parameters, default values, and more advanced functions, please consult the detailed [Vector API Documentation](https://docs.bitbybit.dev/classes/Bit.Vector-1.html) (or the GitHub source linked above).

### 1. Creating Vectors and Number Sequences

Need to make a new vector or a list of numbers?
*   **Specific Vectors:** Create 2D (`[x,y]`) or 3D (`[x,y,z]`) vectors directly from their components (e.g., `vectorXYZ()`, `vectorXY()`).
*   **Number Ranges:** Generate sequences of numbers.
    *   `range()`: Get a simple list of integers (e.g., `[0, 1, 2, 3, 4]`).
    *   `span()`: Create evenly spaced numbers between a minimum and maximum (e.g., `[0, 0.5, 1.0, 1.5, 2.0]`).
    *   `spanLinearItems()`: Like `span()`, but you specify the total number of items you want.
    *   `spanEaseItems()`: Create a sequence where the spacing follows an "easing" curve (e.g., numbers bunch up at the start and spread out at the end). This is great for animations or non-uniform distributions.

### 2. Basic Vector Math (The Essentials)

These are the bread-and-butter operations:
*   **Addition & Subtraction:** Add two vectors (`add()`) or subtract one from another (`sub()`). You can also sum up a whole list of vectors (`addAll()`).
*   **Scaling (Multiplication/Division):** Make a vector longer or shorter by multiplying (`mul()`) or dividing (`div()`) its components by a single number (a scalar).
*   **Dot Product (`dot()`):** A fundamental operation that tells you about the relationship between two vectors' directions.
*   **Cross Product (`cross()`):** For 3D vectors, this gives you a new vector that's perpendicular to the two original vectors. Essential for finding normals or rotational axes.
*   **Negation (`neg()`):** Flip the direction of a vector.

### 3. Measuring and Analyzing Vectors

Understand your vectors' properties:
*   **Length (Magnitude/Norm):** Find out how long a vector is (`length()`, `norm()`). There are also versions for squared length (`lengthSq()`, `normSquared()`), which can be faster if you only need to compare lengths.
*   **Normalization (`normalized()`):** Create a "unit vector" – a vector with a length of 1 that points in the same direction as the original. Very useful for representing directions.
*   **Distance:** Calculate the distance between two points (which are just vectors) (`dist()`, `distSquared()`).
*   **Angles:**
    *   Measure the angle between two vectors (`angleBetween()`).
    *   Get signed angles or positive angles relative to a reference direction (`signedAngleBetween()`, `positiveAngleBetween()`, `angleBetweenNormalized2d()`). This helps determine orientation (e.g., clockwise vs. counter-clockwise).
*   **Interpolation (`lerp()`):** Find a point (vector) that's part-way between two other points, based on a fraction.

### 4. Validating and Checking Vectors

Perform checks on your vector data:
*   **Are Vectors the Same? (`vectorsTheSame()`):** Check if two vectors are equal, within a small tolerance (important for floating-point numbers).
*   **Is it Zero? (`isZero()`):** See if a vector has zero length.
*   **Is it Finite? (`finite()`):** Check if all numbers in a vector are valid (not Infinity or NaN).

### 5. Working with Lists of Vectors

Manage collections of vectors:
*   **Removing Duplicates:** Clean up lists by removing identical vectors, either all duplicates (`removeAllDuplicateVectors()`) or only those that are next to each other (`removeConsecutiveDuplicateVectors()`).
*   **Finding Min/Max Values (`min()`, `max()`):** Get the smallest or largest number within a vector's components.
*   **Domain (`domain()`):** For an ordered list of numbers, find the difference between the last and first values.

### 6. Utility Functions

*   **Point on Ray (`onRay()`):** Given a starting point, a direction vector, and a distance, find the coordinates of the point along that ray.
*   **Boolean List Check (`all()`):** Check if a list of boolean values are all `true`.

## How to Use

Typically, you'll interact with these methods by providing an "inputs" object. For example, to add two vectors:

```typescript
// In TypeScript (conceptual)
const vec1 = [1, 2, 3];
const vec2 = [4, 5, 6];

const sumVector = bitbybit.vector.add({ first: vec1, second: vec2 });
// sumVector will be [5, 7, 9]
```