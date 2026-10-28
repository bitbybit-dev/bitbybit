---
sidebar_position: 5
title: "Linking Your Own Shopify Products to Configurator Options"
sidebar_label: Linked products
description: Learn how to charge an option through the real products you already sell, link several of them to one choice, and keep the links healthy when prices change.
tags: [shopify, 3d-bits, pricing, product-options, ecommerce]
topic: shopify.pricing.linked-products
type: how-to
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

When you link, 3D Bits records the product's price **at that moment** - its snapshot - so the Composer can show prices while you build.

**With Product lines charging, shoppers pay Shopify's current price**, in your currency and in every other currency you sell in, and the configurator shows it to them. Change a price in Shopify and the configurator and checkout follow it without a publish; publishing again only brings the snapshot up to date. The exception is a project marked **Republish needed**, published before 3D Bits worked this way: it follows only after one more publish, and until then checkout refuses carts with the moved product at its new price - see [Charging methods](./charging-methods#moving-a-project-over).

**With Bundled parts charging, every part is charged at the price you published.** The snapshot does not follow the product afterwards, so until you publish again you are selling at the old price.

## When a linked product changes

Open the project and look at the **Pricing catalog** card. Every link shows its state:

| State | Meaning | What to do |
|---|---|---|
| *(no badge)* | The link matches your catalogue | Nothing |
| **Price changed** | The product now costs something different | In Product lines, shoppers already pay the new price, and **Update prices and publish** saves it in the configurator. In Bundled parts, publish to stop selling at the old price |
| **Out of stock** | The product cannot be bought right now | Restock it, or unlink the option |
| **Not purchasable** | The product is a draft, archived, or not in the Online Store channel | Fix it in Shopify admin - no republish needed |
| **Link broken** | The variant no longer exists | Re-link the option in Composer, then publish |
| **Not checked** | Shopify could not be reached just now | Reload the page |

They are listed in order of severity, and the worst one is what the project list badges and your home dashboard warn about.

:::danger A broken link stops the configurator selling
If a linked variant has been deleted, shoppers cannot add that product to their cart at all - not just that option. Treat **Link broken** as urgent.
:::

## Which changes need a publish

- ✅ **A linked product's price changed** - with Bundled parts only; with Product lines shoppers already pay the new price
- ✅ **A linked variant was deleted** - re-link, then publish
- ✅ **Your own product's price changed** - see below

These do **not** need one:

- ❌ Renaming the product, or changing its image
- ❌ Making it Active again after it was archived - fix it in Shopify admin and the configurator carries on

:::warning Your own product's price is the base price
With **Product lines** charging, the configurator's base price is the price of the product it sits on, and checkout follows that price at once. If you change it in Shopify, change the base price in the Composer to match before you next publish - publishing stops while no variant of the product costs the base price, and the project page can set the product's price for you. See [Setting up pricing](./setting-up-pricing).
:::

Publishing checks every linked product's price:

- **Product lines:** publishing goes through, tells you which prices moved, and offers **Sync prices and publish** to save what your catalogue says.
- **Bundled parts:** publishing stops until the prices are synced, and the same button does it in one click.

Stock level changes do not need a publish, but they are not nothing either: a linked product that has run out stops the choices that need it from being bought. Switching on the live catalogue check below is how you make that visible rather than surprising.

## Showing what cannot be bought right now

In the **Pricing** tab there is a switch called **Disable options that cannot currently be sold**.

With it on, the configurator checks the real products behind your priced options and parts when the page loads, again while the shopper configures, and right before Add to cart. When something the shopper's configuration needs is out of stock, it keeps the choice they just clicked and changes as few other choices as it can to reach one you can sell, telling the shopper what changed - the choices each part may change are set under [When it runs out](/learn/3d-bits/composer/gui/parts#when-it-runs-out). A choice nothing can make sellable - or, where checkout still charges the price you published, one whose price no longer matches it - is crossed out with a short message instead of the shopper discovering the problem at checkout. When nothing may change, the shopper keeps their configuration and Add to cart tells them what is out of stock.

Three things worth knowing:

- **It never changes what anyone is charged.** It can take a choice away or move the shopper to another choice they could have picked themselves, never add a paid extra or alter a price. To change the prices you set in the Composer you still publish.
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

**Refresh linked products**, in the project page's action menu, re-reads every product this configurator links - options and parts alike - and saves anything that has moved: the **price**, the product's **name**, and its **picture**. It backs the project up first, then publishes, so the configurator carries what your catalogue says - and, with Bundled parts charging, so shoppers are charged it.

It is the same action the health banner offers as **Update prices and publish**. The difference is that the banner appears only once a price has already drifted, while this one is always there - so you can re-pull after a sale ends without waiting to be told, and on a configurator built product by product it is the fastest way to fill in every picture at once.

:::tip This is how a parts list gets its pictures
`imageUrl` is recorded when you pick a product, so a link made before pictures were shown in the parts list has none, and a configuration imported as JSON has none at all. One refresh fills them in for every link in the project.
:::

## Parts are linked the same way

The things a configured product is **made of** are linked from their own tab, not from an option. A part can link a product exactly as an option does, and the same health states apply to it. With Product lines charging, a part can also pick one of a product's variants from the shopper's choices - see [A part that picks one of your variants](/learn/3d-bits/composer/gui/parts#parts-from-your-variants).

:::warning Link a part to a variant, not just a product
A part has to be linked to a specific **variant**, not just to a product. A product on its own has no variant to put on the order, and the cart line would carry the product where a variant is required - so nobody could add the product to their cart at all. **Publishing refuses it** and names the part. Open it and pick a variant, or clear the link and give the part its own price instead.
:::

See [Parts](/learn/3d-bits/composer/gui/parts).
