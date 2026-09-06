---
sidebar_position: 5
title: "Linking Your Own Shopify Products to Configurator Options"
sidebar_label: Linked products
description: Learn how to charge an option through the real products you already sell, link several of them to one choice, and keep the links healthy when prices change.
tags: [shopify, 3d-bits, pricing, product-options, ecommerce]
---

# Linking Your Own Products

Instead of typing an amount for an option, you can point it at **real products in your catalogue**. Pick "Oak legs" in the configurator and your actual *Oak Legs* product is what gets charged and what appears on the order.

This is worth doing when the option is a thing you genuinely stock and want to see on the picking list.

:::info Pro plan
Linking options to your own products needs the Pro plan.
:::

## How to link

1. In Composer, open the **Controls** tab and find the option you want to price.
2. Use the **link** button on that option and pick the product, or drill into a specific variant.
3. Set **Quantity** if one selection should charge several of them - a set of four legs.

The option now charges that product's price, and the product appears on the order.

**Picking a variant is optional for a priced option.** If you link a product without choosing one, 3D Bits charges that product's **default (first) variant**, and re-resolves it on every publish - so if you later reorder the product's variants, the link follows. Drill into a variant when the product has several and you mean a particular one.

## One option, several products

An option is not limited to one product. Use **Link another product** and a single choice can carry up to **ten**, each with its own Quantity.

This is how you sell a set. "Oak leg set" links four of your *Oak Leg* product and one *Bracket kit*, and choosing it puts all five on the order at the right counts.

The option charges the total of the products you linked to it. Each one ships as its own line, so your stock and your picking list stay correct for every piece.

:::warning An option with more than one product cannot use Variant matrix or Single line
The linked goods have to reach the order as their own lines, so a configuration with a multi-product option cannot use **Variant matrix**, and a **Single line** choice is moved down to **Product lines** when you publish. **Bundled parts** handles them too, and prices each linked product separately on the order. See [Charging methods](./charging-methods).
:::

**A typed amount still wins.** If you put a figure in **Price +/-** as well, that figure is what the shopper is charged. It may not be *less* than the products you linked come to, and publishing tells you if it is.

## What a price snapshot is

When you link, 3D Bits records the product's price **at that moment**. That recorded price is what the configurator shows shoppers.

It does not follow the product afterwards. This is deliberate - your configurator's prices should not silently change because someone edited a product in another tab - but it means **the two can drift apart**, and you have to close the gap when they do. A snapshot that no longer matches your catalogue is not a cosmetic problem: it is what turns into a refused order.

## When a linked product changes

Open the project and look at the **Pricing catalog** card. Every link shows its state:

| State | Meaning | What to do |
|---|---|---|
| *(no badge)* | The link matches your catalogue | Nothing |
| **Price changed** | The product now costs something different | Click **Update prices and publish** |
| **Out of stock** | The product cannot be bought right now | Restock it, or unlink the option |
| **Not purchasable** | The product is a draft, archived, or not in the Online Store channel | Fix it in Shopify admin - no republish needed |
| **Link broken** | The variant no longer exists | Re-link the option in Composer, then publish |
| **Not checked** | Shopify could not be reached just now | Reload the page |

They are listed in order of severity, and the worst one is what the project list badges and your home dashboard warn about.

:::danger A broken link stops the configurator selling
If a linked variant has been deleted, shoppers cannot add that product to their cart at all - not just that option. Treat **Link broken** as urgent.
:::

## Which changes need a publish

- ✅ **A linked product's price changed** - publish
- ✅ **A linked variant was deleted** - re-link, then publish
- ✅ **Your own product's price changed** - see below

These do **not** need one:

- ❌ Renaming the product, or changing its image
- ❌ Making it Active again after it was archived - fix it in Shopify admin and the configurator carries on

:::warning Your own product's price is the one people forget
With **Product lines** charging, the price of the product the configurator sits on is posted on every configured order and acts as a floor. Raising it in Shopify without republishing can put configurations below that floor, and a shopper meets it as an add to cart that will not complete. **Bundled parts** has no such floor - the bundle is priced from its parts alone.

Whenever you change that price, publish the project again. Publishing checks the whole range of configurations and stops with an explanation if any of them no longer works. See [Setting up pricing](./setting-up-pricing).
:::

Stock level changes do not need a publish, but they are not nothing either: a linked product that has run out stops the choices that need it from being bought. Switching on the live catalogue check below is how you make that visible rather than surprising.

## Showing what cannot be bought right now

In the **Pricing** tab there is a switch called **Disable options that cannot currently be sold**.

With it on, the configurator checks the real products behind your priced options when the page loads, and greys out any that are out of stock or whose price no longer matches what you published. The shopper sees the choice crossed out with a short message instead of discovering the problem at checkout.

Three things worth knowing:

- **It never changes what anyone is charged.** It can only take a choice away, never add one or alter a price. To change prices you still publish.
- **If the check cannot run, nothing changes.** A slow or failed lookup leaves the configurator behaving exactly as it does without the switch.
- **You can write the message.** It defaults to "Out of stock", or "Temporarily unavailable" when it is the price that has moved.

## Changing prices safely

If you are repricing several linked products at once, or the work will take a while, **pause the configurator first**. On the project page, the health banner offers **Pause this configurator**: shoppers see a short message you write instead of the configurator, and the product cannot be added to a cart while you work.

A safe sequence for a bigger repricing job:

1. **Pause the configurator** on the project page.
2. Change your product prices in Shopify.
3. Come back - the Pricing catalog card now shows both figures for each link.
4. **Update prices and publish**.
5. **Resume selling**.

Pausing takes effect immediately and does not require a publish, so you can do it even while a link is broken.

:::note Items already in a cart are not affected
Pausing stops new configurations being added. A shopper who already has one in their cart can still check out.
:::

If you would rather not pause, you can set the Shopify product to **Draft** while you work - but that removes the product page entirely, including for anyone arriving from an ad or a search result.

## Refreshing every link at once

**Refresh linked products**, in the project page's action menu, re-reads every product this configurator links - options and parts alike - and saves anything that has moved: the **price**, the product's **name**, and its **picture**. It backs the project up first, then publishes, because a price only reaches shoppers when you publish.

It is the same action the health banner offers as **Update prices and publish**. The difference is that the banner appears only once a price has already drifted, while this one is always there - so you can re-pull after a sale ends without waiting to be told, and on a configurator built product by product it is the fastest way to fill in every picture at once.

:::tip This is how a parts list gets its pictures
`imageUrl` is recorded when you pick a product, so a link made before pictures were shown in the parts list has none, and a configuration imported as JSON has none at all. One refresh fills them in for every link in the project.
:::

## Parts are linked the same way

The things a configured product is **made of** are linked from their own tab, not from an option. A part can link a product exactly as an option does, and the same health states apply to it.

:::warning Link a part to a variant, not just a product
A part has to be linked to a specific **variant**, not just to a product. A product on its own has no variant to put on the order, and the cart line would carry the product where a variant is required - so nobody could add the product to their cart at all. **Publishing refuses it** and names the part. Open it and pick a variant, or clear the link and give the part its own price instead.
:::

See [Parts](/learn/3d-bits/composer/gui/parts).
