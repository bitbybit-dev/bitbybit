---
sidebar_position: 5
title: "Order Review"
sidebar_label: Order Review
description: See exactly what each shopper configured, and confirm the price on the order is right.
tags: [shopify, 3d-bits]
topic: shopify.app.order-review
type: how-to
---

# Order Review

When someone buys a configured product, your Shopify order tells you they bought "Dining Table". It does not tell you they picked walnut, 180 cm, with the cable channel. Order review does.

It answers two questions: what did this shopper actually configure, and did they pay the right amount for it.

## Availability

Order review is there from the start. Permission to read your orders is part of what you approve when you install the app, alongside the access it needs to manage products, files and themes, so there is nothing extra to switch on.

If you installed 3D Bits before order review existed, the approval you gave at the time did not cover reading orders. Shopify asks you to approve the updated permissions the next time you open the app, and the section appears once you do.

## The list

Orders from the last 60 days containing a configured product, newest first.

Each one is re-checked when you load the page rather than relying on something recorded earlier, so what you see reflects your current setup rather than a stale note. Anything that does not add up is marked **Needs review**, and you can filter down to just those.

Most stores see an empty needs-review filter and never think about this page again, which is the intended outcome.

## An individual order

Opening an order gives you a sheet you can print and hand to whoever makes the product.

For each configured line it lists every choice the shopper made, with no prices attached. Where an option had an image, such as a fabric or a finish, the image is shown alongside it.

A separate **Price breakdown** table then shows what was actually charged, starting from the base price. Only the rows that carry money appear there, so a choice that cost nothing is in the list of choices and not in the breakdown.

Where the configuration is built from [parts](/learn/3d-bits/composer/gui/parts), the ones that carry a price appear as rows in the price breakdown. The full parts list is not shown on the page - it leaves through **Download parts (CSV)**, which you hand to whoever cuts and assembles the thing. That file carries your internal part numbers, which the shopper-facing documents never do, and it is shaped to open in a spreadsheet or a panel optimiser.

Everything here is read against the version of the configurator the order was actually sold under, not against what you have published since.

On a Product lines order, your own products - the product the configurator sits on, the products it links and the variants its parts pick - are checked at the price Shopify charged for them. Order review judges only the amounts 3D Bits worked out.

If your project generates a PDF for orders, on the Pro plan, it is linked here as well.

There is a link straight through to the same order in your Shopify admin for the usual fulfilment work.

## What a review flag means

Every configured order gets one of six verdicts. Only an order that collected too little, or holds the wrong products, is flagged - collecting *more* than expected is never reported.

| Verdict | What it means | What to do |
|---|---|---|
| **Verified** | The order collected what its configuration should cost | Fulfil as normal |
| **Earlier version** | It was placed before you last published this configurator, so today's rules are not the ones it was sold under | Nothing is wrong. This is the "I repriced afterwards" case |
| **Underpaid** | It collected less, before discounts, than its configuration should have cost | Look before fulfilling, and collect any genuine difference by hand |
| **Doesn't match** | The order collected enough, but its products are not the ones its configuration needs - an extra is missing, or another product stands in its place | Check what was paid for before you fulfil it. Your storefront never builds such a cart, so it was most likely changed by hand |
| **Paid in another currency** | The shopper paid in a currency other than your store's, through Shopify Markets, and the configuration charges amounts your configurator works out (fees, formulas or the price unit), so the comparison cannot be redone here. A configuration made only of your own products is checked in the shopper's currency instead | Nothing is wrong. Checkout verified the price when the order was placed, in the currency the shopper paid |
| **Can't verify** | The check could not be completed for that line | Compare against your price list by hand |

**Paid in another currency** appears once you sell through Shopify Markets in more than one currency, and it is not a problem to solve. It is left out of the review count on the app's home page for that reason.

**Can't verify** also marks a line whose configuration holds a value your configurator does not offer. Your storefront never produces one, so the configuration was most likely changed by hand: check what was ordered before you fulfil it.

**Parts picked from your variants.** For a configuration whose [parts pick one of your variants](/learn/3d-bits/composer/gui/parts#parts-from-your-variants), order review checks that the order carries exactly the variants the configuration picks, in the quantities it needs. Another variant, a missing one or a different quantity is **Doesn't match**. Three more reasons can show as **Can't verify**:

**"Can't verify - checkout's record of the parts picked from your variants could not be read."** Checkout keeps a record of which variants it took for such parts, and the key that reads it could not be read just now, so the variants on this order could not be matched to the configuration. Nothing points at a problem - open the order again in a moment, or check its parts against the configuration before you fulfil it.

**"Can't verify - a variant on this order has since been deleted."** The order carries a product variant you have since deleted from your catalog, so its lines can no longer be matched to checkout's record of the parts picked from your variants. The money it collected is unaffected - check its parts against the configuration before you fulfil it.

**"Can't verify - the key checkout records joined lines with could not be read."** This configured product sits on a cart line of its own. Checkout tells such a line from one it joined with its extras by a key 3D Bits keeps, and that key could not be read just now, so the order could not be judged either way. Nothing points at a problem - open the order again in a moment.

:::warning A later price change does not explain an Underpaid order
Each order is measured against the pricing rules **it was sold under**, or where those are no longer on file, against the price quoted when the order was placed. Orders placed before your last publish are identified separately, as **Earlier version**, rather than compared against today's prices.

So "I changed my prices afterwards" is not the explanation for **Underpaid**. Treat it as a real shortfall until you have looked.
:::

Treat the whole thing as a strong automated cross-check rather than a guarantee: it does not replace your usual review of what was ordered against what was paid.

The sheet shows you the shopper's actual choices and what each one contributed, which is normally enough to see what happened in a few seconds.

## Why you may not need this often

Configured prices are checked at checkout, before the order exists. A cart whose total does not match what the configuration should cost does not get through. Order review is the record afterwards and a second pair of eyes, rather than the thing standing between you and a mispriced order.
