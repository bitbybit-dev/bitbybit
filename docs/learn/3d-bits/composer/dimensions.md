---
sidebar_position: 8
title: "Dimensions"
sidebar_label: Dimensions
description: Measurement annotations drawn on the model itself, from fixed dimension lines to a bounding box that re-measures as the configuration changes.
tags: [3d-bits, composer, dimensions]
---

# Dimensions

:::info Standard and Pro plans
:::

For anything sold by size, the question behind the purchase is always the same: will it fit. Dimensions answer it on the model itself, with the measurement drawn where the shopper is already looking.

One thing to be clear about before you start. Only the **bounding box** type measures the product for itself. The other five are drawn between coordinates you supply, and they show the same number no matter what the shopper picks. That is not a shortcoming - a fixed annotation is exactly what you want on a fixed feature - but if you need a number that follows the configuration, see [Making a dimension follow the configuration](#making-a-dimension-follow-the-configuration) below.

## The six types

**Linear** measures the straight distance between two points you give it. Width, height, depth, the gap between shelves. This is the one you will use most, and for many products it is the only one needed. An optional direction vector controls which side of the feature the dimension line sits on.

**Angular** measures the angle between two direction vectors around a centre point, for a reclining back, an adjustable arm or a sloped panel. You set the radius of the arc it draws, and whether the number is shown in degrees or radians.

**Radial** measures from a centre point to a point on the curve, and can optionally print that as a diameter instead. Use it for a fillet or a rounded corner. A centre mark can be drawn or left off.

**Diametral** draws a diameter annotation across a circular feature: a centre point, a direction for the line, and the **diameter value you type**. Unlike radial, it does not derive the number from geometry - it presents the figure you give it, which is the right shape for a nominal size such as a pipe bore or a stated tube diameter.

**Ordinate** measures a point's distance from a reference origin along one chosen axis, which is how a technical drawing marks hole positions along a rail. Useful for mounting patterns where the shopper needs to check against something they already own. A leader line back to the origin can be shown or hidden.

**Bounding box** is the automatic one. Rather than picking points, you point it at your models and it measures their overall extent. For "will this fit through my door" this is exactly right, and it costs almost nothing to set up.

By default it measures everything in the scene. You can narrow it to particular **models**, or - once you have parsed a model's glTF structure - to individual **parts** inside one, and the two selections add together. Only meshes that are actually **visible** count, so a part hidden by a condition or a logic rule drops out of the measurement rather than inflating it. If a model or part it points at has since been deleted or renamed, the dimension is skipped altogether rather than quietly measuring the whole product, which is your signal to re-pick its selection.

Each bounding box carries three sub-dimensions - **Width (X)**, **Height (Y)** and **Depth (Z)** - and each is enabled separately, so a wardrobe can show width and height without a depth line cluttering the front view. Each one has its own edge position, offset, line length, decimal places, label suffix, label override and styling.

## Setting them up

You type the coordinates, and the annotation draws itself. Unlike markers and decals, dimensions have no drag handles in the 3D view, so the practical way to place one is to read the numbers off the model and adjust until the line sits where you want it. Move the camera as you go - a line that looks right from the front is often floating in front of the product from the side.

Each one can be styled, so the line colour and thickness, the arrow size and shape, the extension lines and the text suit your product rather than shouting over it. A style can be copied from one dimension and pasted onto others, which is the fastest way to keep a set consistent.

Dimensions can be cloned, reordered and named. A name is worth setting: it is what the Logic section and the Overview use to refer to them.

Like everything else in Composer, dimensions can be conditional. Show the depth measurement only when the shopper has opened the accordion about fitting, or show a different set of dimensions for the wall-mounted version.

## Making a dimension follow the configuration

There are two ways to get a measurement that changes with the product, and they suit different situations.

**Let the bounding box do it.** This is the straightforward one. Because it measures the visible meshes rather than remembered coordinates, it simply follows: swap a longer part in, hide a section, move something with a transform variant, and the number updates with no further work from you. Narrow the selection to the models or parts that define the size you are quoting, and it keeps quoting that.

**Draw one dimension per state and condition them.** For the five fixed types, the honest approach is a dimension per configuration, each with a condition, so exactly one is on screen at a time. It sounds laborious and usually is not, because a product with three lengths needs three dimensions, not thirty. This is also the only way to state a number the geometry does not contain, such as a nominal size or a stated tolerance.

A fixed dimension can additionally carry **transform variants**, which shift the whole annotation rigidly when a condition matches. That moves the line to keep up with a part that has moved, but it does not change the measured number, so use it to reposition an annotation rather than to re-measure.

## Units and honesty

Two fields decide what the label reads, and it is worth being precise about which does what.

**Label suffix** is text appended after the label. It is a label and nothing else - it converts nothing. Typing `in` after a value measured in millimetres produces a millimetre figure with the word "in" beside it, which is worse than no unit at all.

**Label override** is an arithmetic expression evaluated over `val`, the measured value. `val/25.4` on a millimetre model prints inches. `val*100` turns metres into centimetres. If you write something that is not arithmetic, the text is used as a template instead and `val` is replaced by the formatted measurement, so `Approx. val` prints the word "Approx." in front of the number.

Use them together and they agree: **Label override** `val/25.4` with **Label suffix** `in` gives you a genuine inch figure with an inch label. **Decimal places** then controls how many digits the result carries.

Be careful that what the dimension says matches what you ship. A dimension is a promise, and a shopper who measures their alcove against your model and receives something 3 cm wider will be in touch.

## Presentation

Dimensions work best switched off by default and revealed when asked for, either through a control the shopper toggles or in an accordion about sizing. A product covered in measurement lines the moment it loads looks like a technical drawing rather than something you want to own.

For a workshop, the same is not true. The order PDF on the Pro plan captures the scene as it stands at that moment, so any dimension showing then is in the picture - and there, dimensions are exactly what is wanted.
