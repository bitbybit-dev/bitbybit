---
sidebar_position: 2
title: "Set Up Configurator Pricing on a Shopify Product, Step by Step"
sidebar_label: Set up pricing
description: Learn how to turn on configurator pricing, set a base price, price your first option, preview it and publish.
tags: [shopify, 3d-bits, pricing, getting-started]
---

# Set Up Your First Price

This walks through pricing one option on one product, end to end. It takes a few minutes and you can undo any of it.

You need a project with at least one control (a dropdown, radio group or similar) already in its GUI. If you do not have one yet, build that first - pricing sits on top of controls you have already made.

## 1. Turn pricing on

In Composer, open the **GUI** tab and find the **Pricing** section. Switch pricing on.

Nothing is charged yet. Until you publish, everything here is a draft.

## 2. Set a base price

Enter the amount every configuration starts from - for a made-to-order table, the price of the plainest table you sell.

:::warning Your product's own price is a floor
With **Product lines** charging, the Shopify product's own price is posted on every configured order and is never rewritten, so no configuration can cost less than it.

If a configuration a shopper could reach falls below that floor, **publishing is refused**. It does not go live and warn you afterwards. The message names the selections that breach it and the exact price the product should carry, and the project page can often set it for you in one click. It cannot when the cheapest configuration is not simply the base price - when you price with a formula, for instance - and then the message still names the figure for you to type in yourself.

Take the number it gives you. Set the product's price to the figure the message names rather than dropping it to nothing - we have seen a product priced at nothing coincide with a cart that stops bundling the configuration into a single item.

**Variant matrix** and **Single line** charging do not have this floor, so switching method is the other way out.
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
| The configured total is below what the cart can collect | Raise your base price, or set the product's price to the amount the message names |

## 7. Place a real test order

Buy the configured product yourself before you tell anyone about it. Check the price you paid matches what the configurator showed, and that your choices appear on the order.

[Going live](./going-live) covers what else to test, and the review step to build into your routine.

## What appears in your catalogue

Once you publish with pricing on, you will see some new products in your Shopify catalogue with the vendor **3D Bits Fee**. These are how a configured price becomes a real charge - see [Helper products](./helper-products). They are hidden from your storefront, and you should not edit or delete them by hand.
