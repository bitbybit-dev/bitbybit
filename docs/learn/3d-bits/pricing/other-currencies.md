---
sidebar_position: 8
title: "Selling Configured Products in Other Currencies with Shopify Markets"
sidebar_label: Other currencies
description: Learn how configured prices behave in Shopify Markets, which markets can be priced exactly, and what to publish again after changing your Markets setup.
tags: [shopify, 3d-bits, pricing, markets, ecommerce]
---

# Other Currencies

You author one set of prices, in your store's own currency. Shopify shows and charges shoppers elsewhere in theirs. A configured price has more moving parts than a plain product price, so it is worth understanding what happens in between.

## The one idea to hold on to

A plain product has a single price, and Shopify converts it.

A configured product's price is **assembled** when your shopper adds it to the cart: the product itself, plus an amount for each priced choice they made. Shopify applies its market rules - conversion, any adjustment, any rounding - to **each piece separately**, not to the total. So the converted total is not always the exact conversion of the total at home.

3D Bits' job is to keep what is collected equal to what was shown. Where it can prepare a market in advance, it does, and the two match to the penny. Where it cannot, it refuses to sell rather than charge an amount it cannot stand behind - which is why a market that is set up loosely can leave a configurator looking fine and quietly failing at Add to cart.

## Two kinds of market

This is the distinction that matters most, and it is set on the Shopify side, not in 3D Bits.

| How the market is priced | What Shopify does | What it means for configured products |
|---|---|---|
| **With a price list** | You control the prices for that market | 3D Bits prepares exact amounts there when you publish. Charging is exact, the same as at home |
| **Automatic conversion** (no price list) | Converts from your store currency at the live rate, and may round | 3D Bits cannot prepare exact amounts. Some configurations can still be sold there, others cannot |

In an automatically converted market, a configurator built entirely from **discrete priced choices** - dropdowns, radios, checkboxes, switches - generally sells normally, because every amount is carried by something Shopify can price.

A configurator whose price does **not** land neatly on chosen options - a slider, a number field, a formula, a per-unit measurement, anything where the total is calculated rather than picked - may not be sellable in that market. The configurator will show a converted price, and Add to cart will refuse it.

:::tip The fix is on Shopify's side
Give that market a **price list**. It is the single change that makes configured products charge exactly there, and it takes effect on your next publish.
:::

## Percentage adjustments

If a market marks prices up or down by a percentage, 3D Bits reads that figure **when you publish** and uses it for both the price it shows and the price it collects, so the two agree.

That figure is then **fixed until you publish again**. If you change a market's adjustment in Shopify and do not publish, shoppers there keep seeing the old figure, and checkout will not complete the order. The 3D Bits admin shows a notice when it spots this.

## Markets that round converted prices

Shopify can round converted prices to tidy amounts - to a whole unit, or to an ending like `.99`. It applies that rounding to **each cart line on its own**, before anything is added up.

A configured product can post several lines - the product, and the amounts for what was chosen - so several small roundings can land in one order, and the total collected can differ slightly from the single converted total the configurator showed. With Shopify's usual round-up rules the difference goes upward, in your favour rather than the shopper's.

How far it can drift depends on how many lines a configuration posts, so:

- **Charging the options through one combined line** leaves a single line to round instead of several. On the project's page, set **How option charges reach the order** to *One combined charge*.
- **[Variant matrix](./charging-methods) charging** avoids the question entirely - it creates real Shopify variants, so all of Shopify's own per-market pricing applies natively.

**Bundled parts** converts each part on its own, so a converted order can come to a fraction of a unit less per part than a single conversion of the whole. It is a rounding difference of hundredths, not a pricing rule, and it goes the shopper's way rather than yours. In your own store currency there is no difference at all.

When you publish, 3D Bits tells you which of your markets round, and how many lines your busiest configuration posts.

## Markets that include tax in the price

If a market shows prices with tax included **based on the shopper's country**, a configured total cannot follow that. The total is worked out from your store-currency prices, so the shopper pays your gross total wherever they are, and the difference between your tax rate and theirs is absorbed rather than shown.

If the per-country amount has to be exact there, price that market with a price list, or switch it to adding tax at checkout instead.

## Markets where the shopper chooses the currency

Some markets let shoppers pay in their own local currency. 3D Bits cannot know ahead of time which currencies those will be, so it cannot prepare any of them - they behave like automatic conversion above. Price such a market in one fixed currency if exact charging matters.

## Publish again after any Markets change

Your published configurators carry a snapshot of your Markets setup. Publish again after you:

- Add or remove a market
- Change a market's currency
- Change a market's percentage adjustment
- Give a market a price list, or take one away

The 3D Bits admin watches for this and shows a notice on your projects when your live Markets setup no longer matches what you published. Publishing again is always the fix.

## Reviewing orders from other markets

Order review re-checks each configured order against the rules it was sold under, in **your store's currency**. An order paid in another currency shows **Paid in another currency**.

**This is expected, and it is not a warning sign.** It means the comparison could not be made like for like, not that anything is wrong with the order. These orders are deliberately left out of the "needs a price review" count on your dashboard, so that genuine problems stand out instead of being buried under every international sale.

If you want certainty on one, compare it against your price list by hand.

## Before you launch a market

- [ ] Read the warnings on your last publish - market issues are listed there
- [ ] Place a **real test order** in that market, not just a preview
- [ ] Check the configurator total, the cart total and the checkout total against each other
- [ ] Test a configuration with **several priced options**, not just one
- [ ] Test a configuration driven by a **slider, number field or formula**, if your configurator has one
- [ ] Repeat after any change to that market in Shopify

:::info Related
[Charging methods](./charging-methods) explains combined lines and the variant matrix. [Going live](./going-live) is the wider pre-launch routine.
:::
