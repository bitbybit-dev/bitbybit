---
sidebar_position: 3
title: Conventions
sidebar_label: Conventions
description: The handful of conventions that hold everywhere in Bitbybit - colour ranges, which way is up, and the defaults that surprise people.
tags: [code, draw, occt]
---

# Conventions That Hold Everywhere

A few conventions run through the whole library. None of them is guessable, each one has a reasonable
alternative that other tools picked instead, and each is worth five minutes now rather than an hour
of confusion later.

## Colours are 0 to 1, not 0 to 255

A colour given as an array is three numbers between **0 and 1**.

```
[1, 0, 0]        red
[1, 0.5, 0]      orange
[0, 0, 0]        black
```

Many graphics tools use 0 to 255 instead, so `[255, 128, 0]` is a natural thing to write. It is not
orange here. Those numbers are 255 times too large, and the result is clamped to white.

If you pass a value outside the range, a message in the console tells you so and names the likely
cause. Divide by 255 and you have the right numbers.

You can also pass a hex string like `"#ff8000"` anywhere a colour is accepted, which avoids the
question entirely.

### Geometry can carry its own colour, and it wins

JSCAD shapes can have a colour baked onto the geometry itself. When they do, that colour beats the one
in your draw options.

This is intentional: the colour on the geometry is the more specific instruction. It is also why a
colour you chose in the options appears to be ignored for some shapes and respected for others. If you
want your option to apply, remove the colour from the geometry rather than fighting it.

## Y is up

Bitbybit treats **Y** as the up axis, throughout.

Many CAD systems treat Z as up instead. When you import from one, the model arrives lying on its side,
which is what the `adjustZtoY` option on the STEP and IGES importers is for.

Two related mappings, if you are building points by hand:

- A 2D point becomes 3D as `[x, y]` to `[x, y, 0]`.
- When drawings are flattened to 2D for DXF export, the **Y** value is dropped: 3D X becomes DXF X, and
  3D Z becomes DXF Y.

## Both sides of a surface are drawn by default

`drawTwoSided` is **on** unless you explicitly set it to `false`.

This is usually what you want. An open surface, or a solid you are looking into, shows its back faces
rather than disappearing. The back faces are drawn in their own colour so you can tell which side you
are seeing.

Turn it off when you know your geometry is a closed solid viewed from outside, and you would rather not
pay for the second set of faces.

## Camera settings are tuned for a 20-unit scene

Camera distance, the near and far clipping limits, and the pan and zoom sensitivities are all worked
out from the size of your scene, using a 20-unit scene as the baseline.

**This only happens if you pass no camera options at all.** Supplying any camera option switches the
calculation off completely, and your values are used exactly as given.

The practical consequence: a set of camera options that felt right for one model can feel wrong for a
model ten times the size, because you have opted out of the scaling that would have adapted them. If a
camera behaves oddly after a change of scale, try removing the options and letting them be derived.

## Drawing a tag gives you back the tag

Almost everything you draw gives you back a mesh or a scene object. Tags are the exception.

A tag is a text label. It is not geometry - it is an HTML element sitting on top of the canvas, moved
to follow a point in the scene. So drawing one gives you back the tag itself.

You update it the same way as anything else, by passing what you got back into the next draw call. But
if you are storing drawn results and expecting them all to be meshes, tags will not be.

## A decal needs its material switched on

Applying a decal to a mesh takes two steps, not one. Assigning the decal is the first. The mesh's
material also has to have decals enabled on it.

Doing only the first renders nothing at all, which looks like the feature is broken rather than
half-configured.
