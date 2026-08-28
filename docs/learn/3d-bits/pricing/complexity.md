---
sidebar_position: 9
title: "How Complex Can a Configurator Be? Parts, Options and Checkout Limits"
sidebar_label: Managing complexity
description: How many parts and priced options a configurator can carry, which choices are cheap and which are expensive, and what to do when publishing is refused for being too complex.
tags: [shopify, 3d-bits, pricing, parts, limits, performance]
---

# Managing complexity

Every configured item in a cart is priced again at checkout, by Shopify. Checkout will not accept a
cart it cannot finish verifying, so a project that asks for more checking than it can complete is
refused rather than waved through. How much checking your project asks for depends far more on
**how you write your pricing rules** than on how many parts you have.

This page tells you which choices are cheap, which are expensive, and what happens when you go too
far.

## The short version

- **Parts that carry a typed price are cheap.** A hundred of those is not a problem.
- **Parts linked to a real product are the expensive kind.** Each one ships as its own cart line
  for checkout to verify, so they run out long before typed-price parts do - around twenty is where
  it starts to bite.
- **Nesting is cheap** - far cheaper than one more formula.
- **Quantity formulas are the expensive thing** - and specifically, how many *different* ones you
  write.
- **Nothing breaks quietly.** If a project is too complex, 3D Bits refuses to publish it and tells
  you what is binding.

## The one rule worth remembering

> **Reuse the same formula text across parts. Do not write a slightly different one for each.**

This is the single biggest lever you have, and it is not obvious.

Checkout remembers each distinct formula it has already worked out. Write the same
`ceil(width / 4000)` on thirty parts and it is worked out **once**. Write thirty formulas that
differ only slightly - `ceil(width / 4000)`, `ceil(width / 4001)`, and so on - and every one is
worked out separately.

The two projects are the same size. One publishes comfortably. The other is refused outright.

If several parts need genuinely different quantities, prefer one shared formula driven by a
different input over many bespoke formulas.

## What a project can carry

Rough guidance, with everything else left simple:

| Your project | Configured items per cart |
|---|---|
| Up to 100 parts with typed prices, fixed quantities, no formulas | 4 (the maximum) |
| 30 parts, six levels deep, all sharing one formula | 1 |
| 30 parts, six levels deep, each with its own formula | refused - will not publish |
| 20 parts nested twenty levels deep, one shared formula | 1 |
| 5 parts linked to real products you ship | 4 |
| 10 parts linked to real products you ship | 2 |
| 20 parts linked to real products you ship | 1 |
| Around 38 linked parts or more | refused - will not publish |

"Configured items per cart" is how many of *your configured products* a shopper can have in one
cart at the same time. Ordinary products do not count toward this limit.

Three things to read from that table:

1. Fixed quantities cost almost nothing. If a part's quantity never changes, type the number
   instead of writing a formula for it.
2. Depth is not what costs. Twenty levels is barely more than six.
3. **A linked part is not a cheap part.** A part with a typed price is only an amount, but a part
   linked to a product you ship is a real cart line, and every line is one more thing checkout has
   to verify. The first four rows assume typed prices throughout - swap those hundred parts for a
   hundred linked ones and the project is refused.

## Fixed ceilings

These do not move, whatever else you do:

- **4 configured items** in one cart
- **20 levels** of part nesting
- **1,000,000 units** of any single part

## Priced options

Each option that adds money is remembered in the rules, and in Product lines charging each one that
is switched on becomes its own cart line. Many priced options therefore cost you in two ways at
once.

What costs is **how many priced options one configuration can have switched on at the same time**,
not how many you have authored. Twenty priced options spread across a few dropdowns post only as
many lines as there are dropdowns, because a dropdown holds one choice at a time. The same twenty
given a switch each can all be on together, and post twenty. Roughly:

| Priced options a shopper can have on at once | Configured items per cart |
|---|---|
| 1-2 | 4 |
| around 5 | 3 |
| around 10 | 2 |
| around 20 | 1 |
| 40 or more | refused - will not publish |

If you have a great many, consider:

- **Combining them into one line.** There is a setting for charging all options through a single
  combined line instead of one line each.
- **Single line charging**, which prices everything into the product itself.

See [Charging methods](/learn/3d-bits/pricing/charging-methods) for the trade-offs.

## When publishing is refused

3D Bits works out the cost **before** it saves anything, so an over-complex project is caught at
publish rather than by a shopper at checkout. The message names what is binding:

- **Too large** - the rules themselves do not fit. Reduce the number of parts or priced options.
- **Too expensive to work out** - almost always distinct quantity formulas. Share one formula across
  parts, or replace formulas with fixed numbers where the quantity never varies.
- **Too many cart lines** - a single configuration would add more lines than checkout can verify.
  Combine option lines, or switch charging method.

A project that publishes with a **lower cart limit** has not failed. It simply means shoppers can
buy fewer of that configured product at once, and 3D Bits tells the shopper clearly if they try to
exceed it.

## If you need more headroom

In rough order of how much they buy you:

1. **Share one quantity formula** across as many parts as possible.
2. **Replace formulas with fixed numbers** wherever a quantity never varies.
3. **Simplify the formulas themselves** - a short expression is cheaper than a long one.
4. **Reduce priced options**, or combine their cart lines.
5. **Split the product** into two simpler configurators if it is really two products.

Nesting deeper, or adding more parts with fixed quantities, is nearly free - so restructure toward
those rather than away from them.
