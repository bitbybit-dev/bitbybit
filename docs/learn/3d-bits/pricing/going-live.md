---
sidebar_position: 6
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

You author prices in **your store's own currency**. Shopify converts them for shoppers in other currencies.

**Test each market with a real order before you launch it.** Conversion, rounding and per-market rules mean a total abroad may differ slightly from a simple conversion of the home price.

Two things worth doing:

- **If exact per-market prices matter to you, use the [Variant matrix](./charging-methods) charging method.** It generates real Shopify variants, so all of Shopify's own Markets tooling - per-market prices, rounding rules, adjustments - applies natively.
- **Review configured orders from other markets** before fulfilling them, the same way you would at home. 3D Bits points this out when you publish a configurator into a multi-currency store.

Adding a new market later? Publish your projects again afterwards, so the new currency is set up properly.

## After you sell: review configured orders

**Reviewing configured orders before you fulfil them is part of using configurator pricing.**

Open **Order review** in the 3D Bits admin. Each configured order is re-checked against the pricing rules it was sold under, and badged:

| Badge | Meaning | What to do |
|---|---|---|
| **Verified** | The order collected what its configuration should cost | Fulfil as normal |
| **Underpaid** | It collected less than its configuration should cost | Check before fulfilling, and collect the difference if it is real |
| **Can't verify** | The check could not be completed for that line | Compare against your price list by hand |
| **Earlier version** | Placed before you last published this configurator | Nothing is wrong - it was sold under earlier rules |

Your home dashboard flags orders needing attention, so this is a glance rather than a chore.

:::info This check is yours to run
3D Bits does not watch your orders in the background, and nothing is stored about them - every view is recomputed fresh from Shopify. Build the review into your fulfilment routine the same way you would check stock before shipping.
:::

## After any change

Run a shortened version of the checklist whenever you:

- Change a price, in the configurator or on a linked product
- Add or remove an option
- Change your theme, or update it
- Add a market or change a market's currency
- Switch charging method

Two of these need a republish to take effect: a **linked product's price changing**, and a **linked variant being deleted**. See [Linked products](./linked-products).

## If something is wrong

[Troubleshooting](./troubleshooting) covers the messages a shopper might see and what each one means for you.
