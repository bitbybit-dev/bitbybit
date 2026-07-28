---
sidebar_position: 3
title: "Charging Methods: Product Lines, Variant Matrix and Single Line"
sidebar_label: Charging methods
description: Learn the three ways 3D Bits turns a configured price into a real Shopify charge, and how to choose between them.
tags: [shopify, 3d-bits, pricing, charging-modes, cart]
---

# Charging Methods

Shopify charges the price of real things in a cart. A configured price therefore has to become real cart contents somehow, and there are three ways to do that. You pick one per project, in **Storefront settings**.

If you are not sure, use **Product lines**. It works on every Shopify plan and handles every kind of pricing.

## Product lines

The configured price is assembled from real cart lines: your product, plus a hidden line for each priced choice.

**In the cart, the shopper sees one line** at the full configured price - the extra lines are combined into it for display.

- ✅ Works on **every Shopify plan**
- ✅ Handles everything: options, formulas, sliders, included products, quantity
- ✅ Every part appears on the order, so your team can see what to pick and make
- ⚠️ Creates hidden helper products in your catalogue ([what they are](./helper-products))

**Pick this if** you are starting out, you price with formulas or sliders, or you include real products with certain configurations.

## Variant matrix

3D Bits generates a real Shopify variant for every possible combination, on your own product. When a shopper configures, the storefront simply selects the matching variant.

- ✅ **Everything native**: Shopify's own pricing, Markets, discounts and inventory apply untouched
- ✅ Best choice when you sell internationally and want exact per-market prices
- ✅ No helper products
- ⚠️ Only possible when every priced choice is a **discrete option** - no formulas or sliders
- ⚠️ Takes over the product's variants entirely, replacing what is there
- ⚠️ Shopify caps variants per product, so very large combinations do not fit

**Pick this if** your options are all dropdowns, radios or checkboxes, the number of combinations is modest, and you want native Shopify behaviour everywhere - particularly across several markets.

:::warning It replaces your product's variants
Choosing this method rebuilds the product's option space. 3D Bits will refuse if the product has variants it did not generate, so your existing variants are never silently overwritten - but you should expect the product to be *about* the configurator once you switch.
:::

## Single line

The configured product is charged as one line whose price is set to the configured total.

- ✅ The cleanest cart: one line, no helper products at all
- ⚠️ Requires **Shopify Plus** (or a development store)
- ⚠️ Requires the **Standard or Pro** 3D Bits plan
- ⚠️ Overrides per-market price adjustments, so it suits single-currency stores better

**Pick this if** you are on Plus, sell in one currency, and want the tidiest possible cart.

## How many options each method supports

The limits differ sharply, and they are the main reason a method may not be available to you.

| | Product lines | Variant matrix | Single line |
|---|---|---|---|
| **Priced controls** | No fixed limit | **At most 3** | No fixed limit |
| **Options per control** | No fixed limit | Limited by the combination total | No fixed limit |
| **Total combinations** | Not enumerated - no limit | **At most 2,048** | Not enumerated - no limit |
| **Formulas and sliders** | ✅ | ❌ not possible | ✅ |
| **Included products** | ✅ | ❌ not possible | ❌ charged via Product lines instead |
| **Quantity control** | ✅ | ❌ not possible | ✅ |
| **Multi-select checkboxes** | ✅ | ❌ not as a dimension | ✅ |

**Why the matrix is the strict one.** It generates a real Shopify variant for every combination, so it inherits Shopify's own product limits: **3 option dimensions** and **2,048 variants** per product. Four priced controls, or 3 controls whose options multiply past 2,048, cannot be expressed as variants at all.

Multiply your options to check: 8 woods × 5 sizes × 6 finishes = 240 combinations, comfortably inside. Add a fourth control and it becomes impossible regardless of the total.

**Why Product lines has no fixed limit.** It creates one hidden product per priced control and one variant per option, and splits a control across several products when it exceeds 250 options. So a control with 400 colours is fine.

There is still an overall ceiling: a configuration with a very large number of priced options and conditions can grow past what checkout is able to verify. Publishing tells you if you reach it, and names the size - see [Troubleshooting](./troubleshooting). In practice this is far beyond what a shopper would sensibly navigate.

**If the matrix is not possible**, publishing says exactly why - too many controls, too many combinations, a formula, an included product, a quantity control, or a multi-select - and uses Product lines instead rather than failing.

## Choosing

| Your situation | Method |
|---|---|
| Just getting started | Product lines |
| You price with a slider, a formula, or by area or length | Product lines |
| Certain configurations include real products you also ship | Product lines |
| All options are discrete, and you sell in several currencies | Variant matrix |
| You are on Plus, sell in one currency, want the tidiest cart | Single line |
| More than 3 priced controls, or more than 2,048 combinations | Product lines (the matrix cannot express it) |

## Changing your mind

You can switch methods and republish. 3D Bits cleans up after the method you left - archiving helper products it no longer needs, or restoring your product to a single variant when you leave the matrix.

Two things to know before you switch:

- **Archived, never deleted.** Past orders point at helper products, so they are archived rather than removed. Deleting them by hand breaks your order history.
- **After leaving the variant matrix**, check your product's price. The matrix replaced its original variants, so 3D Bits restores it to a single variant priced at the cheapest combination it had generated - which may not be the price you want.

If a method you picked is not available to your store or your configuration, publishing tells you and uses **Product lines** instead rather than failing.
