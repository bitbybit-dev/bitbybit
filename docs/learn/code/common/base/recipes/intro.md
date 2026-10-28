---
sidebar_position: 1
title: Recipes in Bitbybit
sidebar_label: Recipes in Bitbybit
description: What a recipe is - solids described as data, steps that only refer back, numbers in two buffers - and how bitbybit.recipes checks one, reads one from JSON, follows a node to the step it places and draws the triangle meshes it holds.
topic: code.base.recipes
type: explanation
tags: [code, recipes]
---

[View Full Source & Details on GitHub](https://github.com/bitbybit-dev/bitbybit/blob/master/packages/dev/base/lib/api/services/recipes.ts)

A **recipe** describes solids as data instead of building them: a list of steps, such as a polygon, an extrusion, a cut or a union, and the results to build from them. Every number in it is already worked out, so a recipe holds no variables or expressions, and a kernel builds it in one call: `bitbybit.manifold.recipes.build` and `bitbybit.occt.recipes.build` both do. Because it is plain data, a recipe travels well, between threads, in a file and to CAD Cloud; the `ifc` package describes buildings this way.

`bitbybit.recipes` works on a recipe without building it. The format is still marked experimental and may change before it is declared stable.

## How a recipe is written

- `format` is always `"bitbybit.recipe"` and `version` is 1.
- `buffers` holds the numbers: `f64` for coordinates and `i32` for triangle indices. A step points into them by a **range** `[start, count]`, where the run starts and how many numbers it holds, so a large recipe is two flat arrays and a small skeleton around them.
- `nodes` are the steps. A step names earlier steps by their position in the list, never later ones, so a kernel builds the list in one pass and each step once, however many others use it.
- `roots` are the results: each names a node, a `matrix` that places it and a `tag`, labels handed back with the result untouched.
- `millimetresPerUnit` and `tolerance` describe the numbers for whoever reads the results; a kernel builds in the recipe's own units, unscaled.
- `groups`, when present, name the parts of a structure, such as a storey or an assembly, and a root may say which one it belongs to.

How finely a circle is divided is left to the kernel that builds it, so two kernels build close solids, not identical ones.

Here is a 2 by 2 square extruded 1 along Z, written as JSON holds it, with plain lists where the buffers are. The polygon's boundary is the 8 numbers from position 0 of `f64`, four `x, y` corners:

```json
{
    "format": "bitbybit.recipe",
    "version": 1,
    "millimetresPerUnit": 1,
    "tolerance": 1e-7,
    "buffers": { "f64": [0, 0, 2, 0, 2, 2, 0, 2], "i32": [] },
    "nodes": [
        { "op": "polygon", "points": [0, 8], "holes": [] },
        { "op": "extrude", "profile": 0, "direction": [0, 0, 1], "depth": 1 }
    ],
    "roots": [
        { "node": 1, "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], "tag": { "name": "plate" } }
    ]
}
```

## Reading and checking

- `read` takes a recipe whose buffers may be plain lists of numbers, as JSON holds them, turns them into the typed arrays the format keeps, and checks the result. A recipe with anything wrong is refused, with every problem it has listed in the message. The recipe you pass in is left as it was. Read a recipe this way when it comes from a file, a request or another thread, before anything builds it.
- `check` lists what is wrong with a recipe without stopping the script: steps that refer forward or out of range, ranges outside their buffers, coordinates that are not finite or too large, matrices that flatten, lists past their limits. An empty list means the recipe can be built. It expects the buffers as typed arrays already, so a recipe straight from JSON is reported for its lists; pass that one through `read`.

## Following a node to its step

`sourceOf` follows a node through the transforms that only turn and move it, down to the step they place, and folds those transforms into the matrix. Two roots that place one step through different moves then name the same step, which is what drawing it as instances, or building an assembly, wants. A transform that mirrors, scales or stretches stays a step of its own.

Give it the recipe as `read` returns it, the `node` to follow and the `matrix` placing it, such as a root's `node` and `matrix`. A transform node that moves step 1 five units along X, placed by the identity matrix, gives `{ node: 1, matrix }` with the move in the matrix.

## Meshes without a kernel

`surfaceMeshes` gives, for each root built only from triangle steps, through transforms, compounds and unions, its mesh placed by its matrix, as `{ positions, indices }`; a root holding anything else, such as an extrusion, gives `undefined`. That draws an open surface, which no solid kernel accepts, without building anything. `roots` picks which roots to read, every one when left out, and `adjustZtoY` turns each mesh a quarter turn about X, as a kernel's recipe build does with that option.

## Every function

{/* api:recipes:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`check`](https://docs.bitbybit.dev/classes/Bit.Recipes#check) | Checks a value against the recipe format and lists what is wrong with it: steps that refer forward or out of range, ranges outside their buffers, coordinates that are not finite or too large, matrices that flatten, lists past their limits. |
| [`read`](https://docs.bitbybit.dev/classes/Bit.Recipes#read) | Reads a recipe whose buffers may be lists of numbers, as JSON holds them, into the typed arrays the format keeps, and refuses one `check` finds anything wrong with. |
| [`sourceOf`](https://docs.bitbybit.dev/classes/Bit.Recipes#sourceOf) | Follows a node through the transforms that only turn and move to the step it places, folding them into the matrix, so roots that place one step through different moves share it, as an instanced drawing or an assembly wants. |
| [`surfaceMeshes`](https://docs.bitbybit.dev/classes/Bit.Recipes#surfaceMeshes) | Gives the triangle meshes of the roots built from triangle nodes alone, through transforms, compounds and unions, placed by their matrices, so an open mesh no solid kernel accepts can still be drawn. |

{/* api:recipes:end */}
