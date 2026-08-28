---
sidebar_position: 7
title: "Going Live with Configurator Pricing: Testing and Order Review"
sidebar_label: Going live
description: Learn what to test before selling a configured product, how to sell in several currencies, and how to review configured orders.
tags: [shopify, 3d-bits, pricing, orders, markets]
---

# Going Live

Configurator pricing produces many possible outcomes - every combination of options, quantities and currencies can give a different result. This page is the routine that keeps them right.

## Before you sell: the checklist

**Test the combinations, not just one.**

- [ ] The cheapest configuration, and the most expensive one
- [ ] Each priced option on its own, so you can see its amount land in the total
- [ ] The extremes of any slider or number field - its minimum and its maximum
- [ ] Every variant of the product, if it has more than one
- [ ] The cheapest configuration on the **dearest** product, if the project drives more than one
- [ ] A quantity above one, if you offer that

**Place real test orders.** At least the plainest configuration and the most complex. For each, check:

- [ ] The amount charged matches what the configurator showed
- [ ] Your choices are readable on the order
- [ ] Any uploaded file arrived
- [ ] Everything you need to actually make the item is there

**Check the surroundings.**

- [ ] Your theme's own Add to cart still behaves as you expect
- [ ] Discount codes apply the way you want them to
- [ ] If you have express checkout buttons (Shop Pay, Apple Pay, Google Pay, PayPal) on the product page, consider turning them off for configured products - they let a shopper skip the cart, and a configured price needs the cart

## Selling in more than one currency

You author prices in **your store's own currency**, and Shopify converts them for shoppers elsewhere. A configured price is assembled from several pieces, and each one is converted on its own, so a market needs a little more care than a plain product does.

**Test each market with a real order before you launch it**, and **publish your projects again after any change to your Markets setup**.

[Other currencies](./other-currencies) covers which markets can be priced exactly, what rounding and per-market adjustments do to a configured total, and how orders from abroad are reviewed.

## After you sell: review configured orders

**Reviewing configured orders before you fulfil them is part of using configurator pricing.**

Open **Order review** in the 3D Bits admin. Each configured order is re-checked against the pricing rules it was sold under, and badged:

| Badge | Meaning | What to do |
|---|---|---|
| **Verified** | The order collected what its configuration should cost | Fulfil as normal |
| **Underpaid** | It collected less than its configuration should cost | Check before fulfilling, and collect the difference if it is real |
| **Can't verify** | The pricing rules could not be read, or the cart carried too many configured lines | Check the project is still published with pricing on |
| **Paid in another currency** | The order was paid in a currency other than your store's, so the check could not be made like for like | Nothing to do - see [Other currencies](./other-currencies#reviewing-orders-from-other-markets) |
| **Earlier version** | Placed before you last published this configurator | Nothing is wrong - it was sold under earlier rules |

Your home dashboard flags orders needing attention, so this is a glance rather than a chore.

:::info This check is yours to run
3D Bits does not watch your orders in the background, and nothing is stored about them - every view is recomputed fresh from Shopify. Build the review into your fulfilment routine the same way you would check stock before shipping.
:::

## After any change

Run a shortened version of the checklist whenever you:

- Change a price, in the configurator or on a linked product
- Change the price of the product the configurator is attached to
- Add or remove an option
- Change your theme, or update it
- Add a market or change a market's currency
- Switch charging method

Most of these need a publish before they take effect. The ones people forget are the two that happen in Shopify rather than in Composer: **a linked product's price changing**, and **the price of the product the configurator sits on changing**. Both are checked when you publish, and publishing is refused if the result could not be charged. See [Linked products](./linked-products#which-changes-need-a-publish).

## If something is wrong

[Troubleshooting](./troubleshooting) covers the messages a shopper might see and what each one means for you.
