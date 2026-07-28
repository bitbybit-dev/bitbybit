---
sidebar_position: 5
title: "Linking Your Own Shopify Products to Configurator Options"
sidebar_label: Linked products
description: Learn how to charge an option through a real product you already sell, and how to keep the link healthy when prices change.
tags: [shopify, 3d-bits, pricing, product-options, ecommerce]
---

# Linking Your Own Products

Instead of typing an amount for an option, you can point it at a **real product in your catalogue**. Pick "Oak legs" in the configurator and your actual *Oak Legs* product is what gets charged and what appears on the order.

This is worth doing when the option is a thing you genuinely stock and want to see on the picking list.

## How to link one

1. In the Composer, open the option you want to price.
2. Choose **Link product** instead of entering an amount.
3. Pick the product, or drill into a specific variant.
4. Optionally set **Units** if one selection should charge several of them (a set of four legs).

The option now charges that product's price, and the product appears on the order.

**Picking a variant is optional for a priced option.** If you link a product without choosing one, 3D Bits charges that product's **default (first) variant**, and re-resolves it on every publish - so if you later reorder the product's variants, the link follows. Drill into a variant when the product has several and you mean a particular one.

:::warning Included products DO need a specific variant
This is the one exception. An **included product** - an item that always ships with certain configurations - must be linked to a specific variant. Linked at the product level it cannot be added to a cart, and publishing warns you.
:::

## What a price snapshot is

When you link, 3D Bits records the product's price **at that moment**. That recorded price is what the configurator shows shoppers and what it charges.

It does not follow the product afterwards. This is deliberate - your configurator's prices should not silently change because someone edited a product in another tab - but it means **the two can drift apart**, and you have to close the gap when they do.

## When a linked product changes

Open the project and look at the **Pricing catalogue** card. Every link shows its state:

| State | Meaning | What to do |
|---|---|---|
| *(no badge)* | The link matches your catalogue | Nothing |
| **Price changed** | The product now costs something different | Click **Update prices and republish** |
| **Not purchasable** | The product is a draft, archived, or not in the Online Store channel | Fix it in Shopify admin - no republish needed |
| **Link broken** | The variant no longer exists | Re-link the option in the Composer, then publish |
| **Not checked** | Shopify could not be reached just now | Reload the page |

The project list shows a **Linked product changed** badge, and your home dashboard warns you, so you do not have to go looking.

:::danger A broken link stops the configurator selling
If a linked variant has been deleted, shoppers cannot add that product to their cart at all - not just that option. Treat **Link broken** as urgent.
:::

## Which changes need a republish

Only these two:

- ✅ **The linked product's price changed** - republish
- ✅ **The linked variant was deleted** - re-link, then publish

These do **not** need one:

- ❌ Renaming the product, or changing its image
- ❌ Stock level changes
- ❌ Making it Active again after it was archived - fix it in Shopify admin and the configurator carries on

## Changing prices safely

If you are repricing several linked products at once, or the work will take a while, **pause the configurator first**. On the project page, the health banner offers **Pause this configurator**: shoppers see a short message you write instead of the configurator, and the product cannot be added to a cart while you work.

A safe sequence for a bigger repricing job:

1. **Pause the configurator** on the project page.
2. Change your product prices in Shopify.
3. Come back - the Pricing catalogue card now shows both figures for each link.
4. **Update prices and republish**.
5. **Resume selling**.

Pausing takes effect immediately and does not require a publish, so you can do it even while a link is broken.

:::note Items already in a cart are not affected
Pausing stops new configurations being added. A shopper who already has one in their cart can still check out.
:::

If you would rather not pause, you can set the Shopify product to **Draft** while you work - but that removes the product page entirely, including for anyone arriving from an ad or a search result.
