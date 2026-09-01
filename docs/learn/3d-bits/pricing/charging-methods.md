---
sidebar_position: 3
title: "Charging Methods: Product Lines, Bundled Parts, Variant Matrix and Single Line"
sidebar_label: Charging methods
description: Learn the four ways 3D Bits turns a configured price into a real Shopify charge, and how to choose between them.
tags: [shopify, 3d-bits, pricing, charging-modes, cart]
---

# Charging Methods

Shopify charges the price of real things in a cart. A configured price therefore has to become real cart contents somehow, and there are four ways to do that. You pick one per project, in **Storefront settings**.

If you are not sure, use **Product lines**. It works on every Shopify plan and handles every kind of pricing.

```mermaid
flowchart TD
    P["The price the shopper was shown"] --> Q{"Charging method"}
    Q -->|"Product lines"| A1["Your product's line, plus a<br/>hidden line per priced choice"]
    A1 --> A2["Checkout combines them into<br/>one line at the full price"]
    Q -->|"Bundled parts"| D1["One cart line, with the same<br/>parts nested underneath it"]
    D1 --> D2["The order lists every part;<br/>none can be removed alone"]
    Q -->|"Variant matrix"| B1["A generated variant for<br/>that exact combination"]
    B1 --> B2["One native Shopify line"]
    Q -->|"Single line"| C1["Your product's line, repriced<br/>to the configured total"]
    C1 --> C2["One line, no helper products"]
```


## Product lines

The configured price is assembled from real cart lines: your product, plus a hidden line for each priced choice.

**At checkout the shopper normally sees one line** at the full configured price - the extra lines are combined into it. The exception is a configuration that posts more than 2,000 units on one of those lines: Shopify will not combine a group that large, so the parts stay listed separately. Publishing warns you when a configuration of yours will do that.

In the **cart**, that combining has already happened too, but the combined row carries none of the
chosen options: Shopify keeps only 3D Bits' own bookkeeping on it. So the cart row would show a
price with nothing explaining it. 3D Bits fills that gap itself, adding a **configuration summary**
under the row - collapsed to a count, expanding to every choice with its swatch or thumbnail. The
full list is on the order either way.

- ✅ Works on **every Shopify plan**
- ✅ Handles everything: options, formulas, sliders, parts, linked products, quantity
- ✅ Every part appears on the order, so your team can see what to pick and make
- ⚠️ Creates hidden helper products in your catalogue ([what they are](./helper-products))

**Pick this if** you are starting out, you price with formulas or sliders, or the configuration is made of real products you also ship.

:::warning Your product's own price sets a floor
In this method the product's own Shopify price is posted on every configured order and is never rewritten, so no configuration can come to less than it. Publishing is refused if one could, and names the price the product should carry. See [Setting up pricing](./setting-up-pricing).
:::

### One line per option, or one combined charge

Product lines has a second setting, in the project's Storefront settings: **How option charges reach the order**.

**One line per chosen option** is the default. Each priced option gets its own hidden product, so the order itemises the options as separate lines - which is what you want when your workshop reads the order line by line.

**One combined charge** collects the priced options together instead, so a configuration adds one extra line however many options were chosen.

The trade-off is capacity. Checkout re-verifies every line a configuration posts, and refuses a cart it cannot finish verifying, so a configurator with many priced options lowers how many configured items one cart can hold. Publishing tells you the number. If shoppers are hitting that limit, switching to the combined charge is the fix.

Either way, options linked to your own products still ship as their own lines, and the order still carries the full breakdown of what was chosen.

## Bundled parts

The same real parts as Product lines, reaching the cart a different way. The shopper adds **one line**, and Shopify nests the parts underneath it as a bundle.

Two things follow from that, and they are the reasons to choose it:

- **A shopper cannot delete one part.** Shopify enforces the tie: the whole configuration goes from the cart or none of it does. Nobody receives an assembly missing its fixings because they tidied their cart.
- **It holds far more parts.** Checkout re-verifies every line a configuration posts, which is what limits Product lines. A bundle is one line at checkout however many parts it holds, so the ceiling moves from about **48 parts to about 130**.

- ✅ Works on **every Shopify plan**
- ✅ Handles everything Product lines handles: options, formulas, sliders, parts, linked products, quantity
- ✅ Every part appears on the order with its own price, inventory and fulfilment row
- ✅ Your product's own price is **not** a floor - the bundle is priced entirely by its parts
- ⚠️ Creates the same hidden helper products in your catalogue ([what they are](./helper-products))
- ⚠️ The configured product is a **grouping**, not a pickable line: your team picks the parts listed under it
- ⚠️ Not available for subscription or pre-order purchases (a Shopify restriction, shared with Product lines)

**Pick this if** your configurator is made of many real parts, or you want the parts held together so an order can never arrive incomplete.

:::note A limit on how many of one part
Shopify caps how many of a single part one bundle may hold. Publishing works this out for your configurator: it refuses outright if one part already exceeds it, and otherwise checks it against your quantity control's own maximum. If that maximum lets a shopper ask for more than the bundle can hold, publishing tells you the number to set it to; if the control has no maximum at all, it says so. Lowering a part's quantity per set raises the number.
:::

:::note What the order looks like
Each part is its own line item with its own price and inventory, labelled "Part of: your product". The configured product itself is the heading they sit under, and it carries the configuration, the preview image and the order PDF. The price breakdown, the parts list and the re-open link all work exactly as they do in Product lines.
:::

:::note What each part costs on the order
Every part is priced individually, including each product an option links, so your per-product reporting is right. Two cases put 0.00 on a part rather than a share: a product you linked without a recorded price, and a configuration a formula discounts to nothing. The order total is exact in both.
:::

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

:::note Which method to reach for first
Product lines, Bundled parts and Variant matrix are the most thoroughly reconciled at checkout,
because the amount Shopify collects is made of real product lines it can check the configured total
against. Single line buys a tidier cart by charging one line instead, and is the right choice when
that presentation matters more to you. If you have no particular reason to prefer one, start with
**Product lines**.
:::

## How many options each method supports

The limits differ sharply, and they are the main reason a method may not be available to you.

| | Product lines | Bundled parts | Variant matrix | Single line |
|---|---|---|---|---|
| **Priced controls** | No fixed limit | No fixed limit | **At most 3** | No fixed limit |
| **Options per control** | No fixed limit | No fixed limit | Limited by the combination total | No fixed limit |
| **Total combinations** | Not enumerated - no limit | Not enumerated - no limit | **At most 2,048** | Not enumerated - no limit |
| **Formulas and sliders** | ✅ | ✅ | ❌ not possible | ✅ |
| **Parts** | ✅ | ✅ | ❌ not possible | ⚠️ a *linked* part moves it to Product lines |
| **An option linking several products** | ✅ | ⚠️ the extras list at 0.00 | ❌ not possible | ⚠️ moves it to Product lines |
| **A shopper-chosen quantity on an option** | ✅ | ✅ | ❌ not possible | ✅ |
| **Quantity control** | ✅ | ✅ | ❌ not possible | ✅ |
| **Multi-select checkboxes** | ✅ | ✅ | ❌ not as a dimension | ✅ |
| **Parts one configuration can carry** | about 48 | **about 130** | not applicable | not applicable |

**Why the matrix is the strict one.** It generates a real Shopify variant for every combination, so it inherits Shopify's own product limits: **3 option dimensions** and **2,048 variants** per product. Four priced controls, or 3 controls whose options multiply past 2,048, cannot be expressed as variants at all.

Multiply your options to check: 8 woods × 5 sizes × 6 finishes = 240 combinations, comfortably inside. Add a fourth control and it becomes impossible regardless of the total.

**Why Product lines has no fixed limit.** It creates one hidden product per priced control and one variant per option, and splits a control across several products when it exceeds 250 options. So a control with 400 colours is fine.

There is still an overall ceiling: a configuration with a very large number of priced options and conditions can grow past what checkout will verify, and a cart checkout cannot verify is refused rather than waved through. Publishing tells you if you reach it, and names the size - see [Troubleshooting](./troubleshooting). In practice this is far beyond what a shopper would sensibly navigate.

**Why Bundled parts holds more.** Checkout verifies each configured cart line, and a bundle is one line however many parts it holds. What limits it instead is how much the app may write when it nests the parts: about **130 parts** for one configured item in the cart, about **65** each when a shopper buys two of them, about **32** each for four. Publishing works that out for your configurator and tells you the number. If you need more parts than Product lines allows, this is the method that gives them to you.

**If the matrix is not possible**, publishing says exactly why and uses Product lines instead rather than failing. It checks these in order, and names the first one it meets:

1. A **set multiplier** control, which multiplies the whole configuration.
2. An option that lets the **shopper choose a quantity**.
3. A **priced control that cannot be a variant dimension** - only dropdowns, radio buttons and checkboxes can be.
4. An option that **links several products**, since they must reach the order as their own lines.
5. Any **part** - a linked one is a real item needing its own line, and a priced unlinked one is an amount rather than a variant.
6. Any **formula**, which produces amounts that cannot be enumerated.
7. A **multi-select** control, since a variant holds one value per option.
8. **No priced option controls at all** to build a matrix from.
9. More than **3 option dimensions**, which is Shopify's limit.
10. More than **2,048 combinations**, which is also Shopify's limit.

## Choosing

| Your situation | Method |
|---|---|
| Just getting started | Product lines |
| You price with a slider, a formula, or by area or length | Product lines |
| The configuration is made of parts you also ship | Product lines |
| One choice adds several of your own products | Product lines |
| The configuration has more parts than Product lines will publish | Bundled parts |
| The parts must stay together, so nobody orders half an assembly | Bundled parts |
| All options are discrete, and you sell in several currencies | Variant matrix |
| You are on Plus, sell in one currency, want the tidiest cart | Single line |
| More than 3 priced controls, or more than 2,048 combinations | Product lines (the matrix cannot express it) |

## Changing your mind

You can switch methods and republish. 3D Bits cleans up after the method you left - archiving helper products it no longer needs, or restoring your product to a single variant when you leave the matrix.

Two things to know before you switch:

- **Archived, never deleted.** Past orders point at helper products, so they are archived rather than removed. Deleting them by hand breaks your order history.
- **After leaving the variant matrix**, check your product's price. The matrix replaced its original variants, so 3D Bits restores it to a single variant priced at your authored base price, or at the cheapest combination it had generated if there is no base price - which may not be the price you want.
- **Moving between Product lines and Bundled parts** changes nothing in your catalogue: both charge through the same helper products and the same linked products. What changes is the cart, the order's shape and how many parts a configuration may carry. Moving *to* Product lines can therefore be refused if the configuration has grown past what it can publish, and the message says so.
- **A cart built before the switch cannot be checked out.** The two methods build different carts, so a shopper who added your product days earlier is asked to remove it and configure it again rather than being charged twice. Nothing is lost - only that shopper's in-flight cart is affected, and only until they re-add it.

If a method you picked is not available to your store or your configuration, publishing tells you and uses **Product lines** instead rather than failing.

Product lines is the fallback, so it has none of its own. When *it* cannot be provisioned either, publishing stops rather than going live with a configurator that would collect the wrong amount.

**Bundled parts has no fallback either.** Nesting the parts is what charges the order, so if the app cannot set that up on your store, publishing stops and says so rather than going live with a product that would collect its own price and ship none of its parts.
