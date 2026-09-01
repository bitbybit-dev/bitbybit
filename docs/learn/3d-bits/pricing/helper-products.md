---
sidebar_position: 4
title: "The Hidden Helper Products 3D Bits Creates in Your Shopify Catalogue"
sidebar_label: Helper products
description: Learn what the 3D Bits Fee products in your catalogue are for, and the rules for living with them safely.
tags: [shopify, 3d-bits, pricing, fees, ecommerce]
---

# Helper Products

When you publish with **Product lines** or **Bundled parts** charging, 3D Bits creates some products in your Shopify catalogue carrying the vendor name **3D Bits Fee**. This page explains what they are and, more importantly, what not to do with them.

:::tip You can see your prices before any of this is created
[Pricing test mode](./test-mode) puts your configurator on a real product page and shows its computed prices without creating a single helper product.
:::

## Why they exist

Shopify charges for real things in a cart. An option worth +90 has to *be* something before it can be charged, so 3D Bits creates a hidden product to represent it. Your shopper does not normally see these as separate items - the cart and checkout both show one line at the configured price, with the choices summarised beneath it. The exception is a configuration that posts more than 2,000 units on one of those lines: Shopify will not combine a group that large, so the parts stay listed separately. Publishing warns you when a configuration of yours will do that.

## What you will see

| Product | What it is for |
|---|---|
| One per priced control, named `3D Bits - <project> - <control>` | Carries the amount for each priced option in that control, one variant per option |
| *"3D Bits - Configured price"* | Carries amounts that have no fixed option, such as a formula or slider result |
| *"3D Bits - Uploaded file"* | Carries shopper file uploads and configuration images onto the order |

The **"3D Bits"** part is a prefix you can change - set **Generated product name prefix** in the project's Storefront settings if you would rather they carried your own brand name. The vendor is always **3D Bits Fee**, because that is what the collection-exclusion rule matches on.

They are published to your Online Store channel - they have to be, or they could not be added to a cart - but they are not meant to be browsed, and 3D Bits can keep them out of your automated collections for you.

## The rules

:::danger Do not delete or edit them by hand
Past orders point at these products. Deleting one breaks the order history that references it, and your records will no longer show what a shopper actually bought.
:::

- ❌ **Do not delete them.** When an option is removed or a project is retired, 3D Bits **archives** them instead, for exactly this reason.
- ❌ **Do not change their prices.** Their amounts come from your configurator. Editing one in Shopify makes the price shown and the price collected disagree, and checkout will start refusing orders on that configurator.
- ❌ **Do not rename or unpublish them.**
- ✅ **Do let 3D Bits manage them.** Republishing keeps them in step with what you authored.

## Keeping them out of your storefront

Because they must be published to the Online Store channel, they can appear in automated collections that match broadly (for example "all products").

When you publish, 3D Bits offers to add a rule to your automated collections excluding the vendor **3D Bits Fee**. Accepting it keeps them out of your collection pages.

This only narrows collections - it never adds products to one. Collections you built by hand are untouched, so if you use those, check that helper products have not been swept in.

## Removing them later

Turning pricing off, switching to another charging method, or deleting the project all retire the helper products that are no longer needed - they are archived, not deleted.

If Shopify refuses to archive one, 3D Bits tells you which product it was. That matters: an un-archived helper product is still live in your catalogue, and it is worth going and archiving it yourself.

## If you use Variant matrix or Single line

Neither creates any. Helper products are made for **Product lines** and **Bundled parts** charging.

**Variant matrix** generates variants on your own product instead. **Single line** sets the price of the product's own cart line, so there is nothing to assemble it from.

**Bundled parts** uses exactly the same helper products as Product lines - the same fee products, the same price unit. The difference is where they end up: nested under one cart line instead of combined into it. Switching between those two methods creates nothing new and archives nothing.
