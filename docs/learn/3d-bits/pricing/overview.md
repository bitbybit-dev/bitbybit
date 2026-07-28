---
sidebar_position: 1
title: "Configurator Pricing for Shopify: Charge for What Customers Choose"
sidebar_label: Overview
description: Learn how 3D Bits builds a price from the options a shopper picks and charges it through Shopify at checkout.
tags: [shopify, 3d-bits, pricing, ecommerce]
---

# Configurator Pricing for Shopify

Your customer picks oak legs instead of pine, drags a width slider to 180 cm, and ticks "add a mounting kit". The 3D model updates as they go. **Configurator pricing** means the price updates too - and that the amount Shopify charges at checkout is the amount they were shown.

You author it once in the Composer. There is no code, and no third-party pricing app required.

:::info Works with what you already have
Configurator pricing is built into 3D Bits, so most stores need nothing else. It is also **fully compatible** with how you price today: keep Shopify variants for what you already sell, keep a product-options app if it does something you need, and switch configurator pricing off for those products. Both approaches are supported, and you can mix them across your catalogue.
:::

## A worked example

Here is a made-to-order table. The merchant authored four things:

| What the merchant set up | Amount |
|---|---|
| Base price for the table | 400.00 |
| Legs option: **Oak** (Pine adds nothing) | + 90.00 |
| A formula over the width slider: `width * 2.5` | + 200.00 at 80 cm |
| Included product: **Mounting kit**, added with every table | + 35.00 |

A customer who picks oak and drags the width to 80 cm sees **725.00**, and pays 725.00 at checkout.

If they switch back to pine, the model changes, the total drops to 635.00, and checkout follows.

## What you can price

- **A base price** - where every configuration starts.
- **An amount per option** - "+90 for oak", "+15 for engraving". Works with dropdowns, radio buttons, checkboxes and switches.
- **Your own products, linked to an option** - point an option at a real product in your catalogue and it is charged at that product's price, and appears on the order so your team knows to pick it.
- **Formulas** - an expression over a slider or number field, like `width * 2.5` or `round(area * 45)`. This is what makes continuous choices (size, length, area) priceable.
- **Included products** - items that always ship with certain configurations, like a mounting kit or a care pack.
- **A quantity control** - let a shopper buy several of the configured set at once.

## What the shopper sees

The price element updates live as they change options, and can show an itemised breakdown - base, each chosen option, each formula, each included product - so nothing about the total is a mystery.

At checkout the configured product appears as a single line at the price they were shown. Their choices travel with the order, so your team can see exactly what to make.

## What stays with Shopify

Configurator pricing decides **what the product costs**. Everything around that stays where it already is:

- ✅ Taxes, shipping rates and discount codes - Shopify, exactly as for any other product
- ✅ Payment, fraud analysis and refunds - Shopify
- ✅ Your existing variants for anything you do not configure - Shopify
- ❌ 3D Bits never processes payments and never holds money

## Where to go next

1. **[Set up your first price](./setting-up-pricing)** - turn it on and price one option, start to finish.
2. **[Choose a charging method](./charging-methods)** - three ways to turn a configured price into a real Shopify charge, and how to pick.
3. **[Link your own products](./linked-products)** - charge through products you already sell.
4. **[Go live](./going-live)** - what to test, and how to review configured orders.
