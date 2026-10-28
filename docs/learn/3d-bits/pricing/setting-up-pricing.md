---
sidebar_position: 2
title: "Set Up Configurator Pricing on a Shopify Product, Step by Step"
sidebar_label: Set up pricing
description: Learn how to turn on configurator pricing, set a base price, price your first option, preview it and publish.
tags: [shopify, 3d-bits, pricing, getting-started]
topic: shopify.pricing.setting-up
type: tutorial
---

# Set Up Your First Price

This walks through pricing one option on one product, end to end. It takes a few minutes and you can undo any of it.

You need a project with at least one control (a dropdown, radio group or similar) already in its GUI. If you do not have one yet, build that first - pricing sits on top of controls you have already made.

## 1. Turn pricing on

In Composer, open the **GUI** tab and find the **Pricing** section. Switch pricing on.

Nothing is charged yet. Until you publish, everything here is a draft.

## 2. Set a base price

Enter the amount every configuration starts from - for a made-to-order table, the price of the plainest table you sell.

:::warning In Product lines, the base price is your product's price
With **Product lines** charging, Shopify charges the product the configurator sits on at its own price, so the base price is that price. Set one to match the other.

If no variant of the product costs the base price you set, **publishing is refused** and names the product. The project page offers to set the product's price to the base price in one click, or you can change the base price in the Composer to the product's price. Variants at other prices still publish, with a warning naming what a shopper choosing each one pays.

Change the product's price in Shopify later, and checkout follows it at once. Change the base price to match before you next publish.

**Bundled parts** charging prices the cart entirely from its parts, so your product's own price does not reach the order there.
:::

## 3. Price an option

Pick a control, then a single option inside it, and give it an amount.

- A dropdown option "Oak" with **+90** adds 90 whenever oak is chosen.
- Leave "Pine" empty and it adds nothing - it is the no-cost choice.
- A checkbox or switch works the same way: the amount applies while it is ticked.

Amounts are in your **store's own currency**. If you sell in other currencies, see [Selling in more than one currency](./going-live#selling-in-more-than-one-currency).

An option does not have to carry a typed amount. It can point at real products you already sell - see [Linked products](./linked-products) - and it can let the shopper choose how many of it they want, which turns its amount into a per-unit price.

Two other things are priced elsewhere, once you need them:

- **Formulas** price continuous choices such as a width slider, using an expression over what the shopper entered.
- **[Parts](/learn/3d-bits/composer/gui/parts)** are the things the configured product is made of. A part can be a real product you ship and charge for, or simply a line on the works order that costs nothing.

## 4. Preview it

Use Composer's preview to change the option back and forth. The total updates as you go, and the breakdown shows each part that makes it up.

This is the same renderer your shoppers get, so what you see here is what they will see.

## 5. Choose how it is charged

Open the project's **Storefront settings** and pick a charging method. If you are unsure, leave it on **Product lines** - it works on every Shopify plan.

[Charging methods](./charging-methods) explains the three options and when each is worth switching to.

## 6. Publish

Publishing pushes the configurator and its prices to every product linked to the project.

If something about the setup cannot be charged correctly, **publishing stops and tells you why** rather than going live half-configured. Common first-time messages:

| Message | What to do |
|---|---|
| A linked product has no price | Open that option in Composer and re-link it, or give it a plain amount instead |
| A linked product costs more than the option charges | Raise the option's amount, or unlink it |
| A linked product is a draft, or not in the Online Store channel | Set it Active and publish it to Online Store |
| The product has no variant priced at the base price | Set the product's price to the base price on the project page, or the base price to the product's price in the Composer |
| The configured total is below what the cart would collect | The options chosen there charge less than the products they add. Raise their prices by at least the amount the message names |

## 7. Place a real test order

Buy the configured product yourself before you tell anyone about it. Check the price you paid matches what the configurator showed, and that your choices appear on the order.

[Going live](./going-live) covers what else to test, and the review step to build into your routine.

## What appears in your catalogue

Once you publish with pricing on, you will see some new products in your Shopify catalogue with the vendor **3D Bits Fee**. These are how a configured price becomes a real charge - see [Helper products](./helper-products). They are hidden from your storefront, and you should not edit or delete them by hand.
