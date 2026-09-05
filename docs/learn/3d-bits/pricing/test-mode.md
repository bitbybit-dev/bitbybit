---
sidebar_position: 6
title: "Testing Your Prices Before 3D Bits Creates Anything"
sidebar_label: Pricing test mode
description: Check that your configurator charges the right amounts on your real product page, without creating helper products in your Shopify catalogue.
tags: [shopify, 3d-bits, pricing, testing, ecommerce]
---

# Pricing test mode

Turning pricing on and publishing normally creates [helper products](/learn/3d-bits/pricing/helper-products) in your
catalogue straight away. That is what makes the charging work - but it is a lot to commit to when
all you want to know is whether your numbers add up.

Pricing test mode gives you the middle step. Your configurator goes onto your real product page and
shows its computed prices as a shopper would see them, but nothing is created in your catalogue and
nothing can be ordered.

## What it does

| | Normal publish | Pricing test mode |
|---|---|---|
| Configurator on the product page | Yes | Yes |
| Prices shown as the shopper configures | Yes | Yes |
| Helper products created in your catalogue | Yes | **No** |
| Add to cart | Yes | **No - the product cannot be ordered** |

The product cannot be bought while test mode is on. That is deliberate: a price you can see but
cannot correctly collect is worse than no price at all, so 3D Bits takes the product off sale rather
than letting an order through at the wrong amount.

## How to use it

1. Open the project, find **Pricing test mode** in Storefront settings, and switch it on.
2. **Publish.** The result message tells you exactly what a live publish *would* have created -
   which helper products, and how many priced options it found.
3. Open the product page and work through the configurator. The prices you see are the same numbers
   the real charging path would use.
4. When they look right, switch test mode **off**. If the project is published, 3D Bits republishes
   it for you straight away: the helper products are created and the product goes back on sale.

## Good to know

- **It does not undo anything.** If the project was already selling, turning test mode on takes the
  product off sale but leaves everything 3D Bits generated in place, so turning it off and
  publishing puts it straight back on sale.
- **Most problems are still reported.** Test mode runs the same configuration checks as a real
  publish, so a pricing mistake blocks it the same way. A few checks can only run against the real
  helper products, so a clean test publish is not an absolute guarantee that the live one will pass.
- **Test on a product you have not launched.** The best place for test mode is a product that is
  not yet published to your Online Store, or one on an unpublished theme. On a live product a
  shopper sees the configurator and a note saying it cannot be ordered yet, which is not the
  impression you want a real listing to give.
- **Your project list shows a badge** for anything left in test mode, so it is hard to forget.

## If you only want to check the numbers

You do not need test mode - or a publish - to sanity-check a price. The Composer previews prices
live as you author, using exactly the same calculation the storefront uses. Test mode is for the
step after that: seeing it on your own theme, on a real product page.
