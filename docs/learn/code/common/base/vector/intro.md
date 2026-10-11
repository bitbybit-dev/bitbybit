---
sidebar_position: 1
title: Vectors in Bitbybit
sidebar_label: Vectors in Bitbybit
description: How bitbybit.vector adds, scales and multiplies vectors, measures lengths, distances and angles in degrees, blends between vectors, builds number sequences and cleans lists of vectors.
topic: code.base.vector
type: explanation
tags: [code, vector]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<img 
  src="https://s.bitbybit.dev/assets/icons/white/vector-icon.svg" 
  alt="Vector category icon" 
  title="Vector category icon"
  width="100" /> 

[Full Source on GitHub](https://github.com/bitbybit-dev/bitbybit/blob/master/packages/dev/base/lib/api/services/vector.ts)

`bitbybit.vector` does vector maths on plain arrays of numbers.

## What a vector is

A vector is an array of numbers: `[x, y]` in 2D and `[x, y, z]` in 3D, with Y pointing up. A point has the same shape, so a point can be passed where a vector is expected and back; `dist` between two points is their distance.

Every function gives a new array or a number and leaves its input unchanged. Angles are in degrees.

## Building vectors and number sequences

- `vectorXYZ` builds `[x, y, z]` and `vectorXY` builds `[x, y]`.
- `range` lists the whole numbers from 0 up to, but not including, `max`: 5 gives `[0, 1, 2, 3, 4]`.
- `span` lists the numbers from `min` to `max` in steps of `step`. `max` is included only when a step lands on it, and floating-point steps such as 0.1 can miss it by a hair.
- `spanLinearItems` lists `nrItems` evenly spaced numbers from `min` to `max`, both included: 0 to 10 in 5 items gives `[0, 2.5, 5, 7.5, 10]`.
- `spanEaseItems` does the same but spaces the numbers along an easing curve, so they bunch up near `min` (`easeIn...`), near `max` (`easeOut...`) or at both ends (`easeInOut...`). With `intervals` on it gives the gaps between neighbours instead.
- `parseNumbers` turns a list of number texts into numbers.

## Arithmetic

- `add` and `sub` work entry by entry; `sub` subtracts `second` from `first`. `addAll` adds a whole list of vectors into one.
- `mul` and `div` multiply or divide every entry by one number, and `neg` flips every sign so the vector points the opposite way.
- `dot` gives the dot product: 0 for vectors at right angles and, for unit vectors, the cosine of the angle between them.
- `cross` gives the cross product of two 3D vectors, a vector at right angles to both by the right-hand rule: `[1,0,0]` and `[0,1,0]` give `[0,0,1]`. Its length is the area of the parallelogram the two span. Use it to find normals and rotation axes.

## Lengths, directions and distances

- `length` gives the length of a 3D vector and `norm` of a vector of any size. `lengthSq` and `normSquared` give the squared length, which avoids a square root when you only compare.
- `normalized` scales a vector to length 1, keeping its direction. A vector shorter than `1e-8` has no direction, and the result is `undefined`.
- `dist` and `distSquared` measure between two vectors read as points.
- `onRay` gives the point `distance` along `vector` from `point`. The direction is used as given, so with a direction of length 2 the point lands twice as far; normalize it first to measure in model units.
- `lerp` blends two vectors by `fraction`, which is the share of `first`: 1 gives `first`, 0 gives `second` and 0.5 the midpoint. This is the opposite order to `bitbybit.math.lerp`.

## Angles

- `angleBetween` gives the angle between two vectors, from 0 to 180 degrees, without a direction of turning.
- `signedAngleBetween` and `positiveAngleBetween` give the angle from `first` to `second`, turning around a `reference` direction, from 0 to 360 degrees. The turn is counter-clockwise when the reference points toward you, so a clockwise turn of 30 degrees reads as 330.
- `angleBetweenNormalized2d` gives the angle from one 2D vector to another, from -180 to 180 degrees, positive counter-clockwise. Only the first two entries are read.

## Checking values

- `vectorsTheSame` tells whether two vectors match entry by entry within `tolerance`; vectors of different length never match.
- `isZero` tells whether every entry is exactly 0.
- `finite` marks which entries are finite numbers, and `all` tells whether every boolean in a list is true, so the two together check that a vector holds no `Infinity` or `NaN`.

## Lists of numbers and of vectors

- `min`, `max` and `sum` give the smallest, the largest and the total of the entries.
- `domain` subtracts the first entry from the last, which for a sorted list is its range.
- `removeAllDuplicateVectors` keeps the first of every repeated vector in a list, and `removeConsecutiveDuplicateVectors` removes a vector only when it repeats the one right before it; with `checkFirstAndLast` on it also drops a last vector that repeats the first. Both count entries within `tolerance` as equal.

## Every function

{/* api:vector:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`add`](https://docs.bitbybit.dev/classes/Bit.Vector#add) | Adds two vectors entry by entry. |
| [`addAll`](https://docs.bitbybit.dev/classes/Bit.Vector#addAll) | Adds a list of vectors together entry by entry into one vector. |
| [`all`](https://docs.bitbybit.dev/classes/Bit.Vector#all) | Tells whether every value in a list of booleans is true. |
| [`angleBetween`](https://docs.bitbybit.dev/classes/Bit.Vector#angleBetween) | Measures the angle between two vectors in degrees, always between 0 and 180. |
| [`angleBetweenNormalized2d`](https://docs.bitbybit.dev/classes/Bit.Vector#angleBetweenNormalized2d) | Measures the signed angle from the first 2D vector to the second, in degrees from -180 to 180. |
| [`cross`](https://docs.bitbybit.dev/classes/Bit.Vector#cross) | Computes the cross product of two 3D vectors: a vector at right angles to both. |
| [`dist`](https://docs.bitbybit.dev/classes/Bit.Vector#dist) | Computes the straight-line distance between two vectors. |
| [`distSquared`](https://docs.bitbybit.dev/classes/Bit.Vector#distSquared) | Computes the squared distance between two vectors, which avoids the square root when only comparing distances. |
| [`div`](https://docs.bitbybit.dev/classes/Bit.Vector#div) | Divides every entry of a vector by one number. |
| [`domain`](https://docs.bitbybit.dev/classes/Bit.Vector#domain) | Subtracts the first value of a vector from its last, which for a sorted list is its range. |
| [`dot`](https://docs.bitbybit.dev/classes/Bit.Vector#dot) | Computes the dot product of two vectors: the sum of the products of matching entries. |
| [`finite`](https://docs.bitbybit.dev/classes/Bit.Vector#finite) | Marks which entries of a vector are finite numbers. |
| [`isZero`](https://docs.bitbybit.dev/classes/Bit.Vector#isZero) | Tells whether a vector has no length, that is, every entry is exactly 0. |
| [`length`](https://docs.bitbybit.dev/classes/Bit.Vector#length) | Computes the length of a 3D vector. |
| [`lengthSq`](https://docs.bitbybit.dev/classes/Bit.Vector#lengthSq) | Computes the squared length of a 3D vector, which avoids the square root when only comparing lengths. |
| [`lerp`](https://docs.bitbybit.dev/classes/Bit.Vector#lerp) | Blends two vectors linearly by a fraction. |
| [`max`](https://docs.bitbybit.dev/classes/Bit.Vector#max) | Finds the largest value in a vector. |
| [`min`](https://docs.bitbybit.dev/classes/Bit.Vector#min) | Finds the smallest value in a vector. |
| [`mul`](https://docs.bitbybit.dev/classes/Bit.Vector#mul) | Multiplies every entry of a vector by one number. |
| [`neg`](https://docs.bitbybit.dev/classes/Bit.Vector#neg) | Flips the sign of every entry, so the vector points the opposite way. |
| [`norm`](https://docs.bitbybit.dev/classes/Bit.Vector#norm) | Computes the length of a vector. |
| [`normalized`](https://docs.bitbybit.dev/classes/Bit.Vector#normalized) | Scales a 3D vector to length 1 while keeping its direction. |
| [`normSquared`](https://docs.bitbybit.dev/classes/Bit.Vector#normSquared) | Computes the squared length of a vector, which avoids the square root when only comparing lengths. |
| [`onRay`](https://docs.bitbybit.dev/classes/Bit.Vector#onRay) | Finds the point at a given distance from a start point along a direction. |
| [`parseNumbers`](https://docs.bitbybit.dev/classes/Bit.Vector#parseNumbers) | Turns a list of number strings into numbers. |
| [`positiveAngleBetween`](https://docs.bitbybit.dev/classes/Bit.Vector#positiveAngleBetween) | Measures the angle from the first vector to the second, turning around a reference direction, in degrees from 0 to 360. |
| [`range`](https://docs.bitbybit.dev/classes/Bit.Vector#range) | Lists the whole numbers from 0 up to, but not including, `max`. |
| [`removeAllDuplicateVectors`](https://docs.bitbybit.dev/classes/Bit.Vector#removeAllDuplicateVectors) | Removes every repeated vector from a list, keeping the first occurrence of each. |
| [`removeConsecutiveDuplicateVectors`](https://docs.bitbybit.dev/classes/Bit.Vector#removeConsecutiveDuplicateVectors) | Removes a vector when it repeats the one right before it; the same vector further away is kept. |
| [`signedAngleBetween`](https://docs.bitbybit.dev/classes/Bit.Vector#signedAngleBetween) | Measures the angle from the first vector to the second, turning around a reference direction, in degrees from 0 to 360. |
| [`span`](https://docs.bitbybit.dev/classes/Bit.Vector#span) | Lists the numbers from `min` to `max`, stepping by `step`; `max` is included when a step lands on it. |
| [`spanEaseItems`](https://docs.bitbybit.dev/classes/Bit.Vector#spanEaseItems) | Lists `nrItems` numbers from `min` to `max` spaced by an easing curve, so they bunch up at one end or both. |
| [`spanLinearItems`](https://docs.bitbybit.dev/classes/Bit.Vector#spanLinearItems) | Lists `nrItems` evenly spaced numbers from `min` to `max`, both included. |
| [`sub`](https://docs.bitbybit.dev/classes/Bit.Vector#sub) | Subtracts the second vector from the first, entry by entry. |
| [`sum`](https://docs.bitbybit.dev/classes/Bit.Vector#sum) | Adds up all values of a vector into one number. |
| [`vectorsTheSame`](https://docs.bitbybit.dev/classes/Bit.Vector#vectorsTheSame) | Tells whether two vectors are the same within a tolerance, entry by entry. |
| [`vectorXY`](https://docs.bitbybit.dev/classes/Bit.Vector#vectorXY) | Builds a 2D vector from its x and y values. |
| [`vectorXYZ`](https://docs.bitbybit.dev/classes/Bit.Vector#vectorXYZ) | Builds a 3D vector from its x, y and z values. |

{/* api:vector:end */}
