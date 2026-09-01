---
sidebar_position: 10
title: "Troubleshooting Configurator Pricing: What Each Message Means"
sidebar_label: Troubleshooting
description: Learn what to do when a shopper cannot check out a configured product, or a publish is refused.
tags: [shopify, 3d-bits, pricing, checkout, validation]
---

# Troubleshooting

3D Bits would rather stop a sale than let a shopper be charged the wrong amount. That is the right trade, but it means a shopper occasionally sees a message. This page turns each one into an action.

## Messages a shopper might see

### "…is made to order and has to be configured on its product page"

**What happened.** The product reached the cart without going through the configurator - so there is no configuration to price it from.

**Usual causes**, in order of likelihood:

- A **quick-add button** on a collection, search or home page
- A direct cart link, or a "buy it again" flow
- A cart that has been sitting since before you published pricing
- The configurator failed to load on that pageview

**What to do.** Ask the shopper to remove it and add it from the product page. Then prevent it happening again: turn off quick-add for your configured products in the theme editor, and check any app that adds to cart from outside the product page.

### "The configured price for … is out of date"

**What happened.** The configuration in the cart no longer matches your current pricing.

**What to do.**

1. Open the project and check the **Pricing catalog** card for a **Price changed** badge. If there is one, click **Update prices and publish** - see [Linked products](./linked-products).
2. If everything looks healthy, the cart is simply older than your last publish. Ask the shopper to reconfigure.

### "The extras for … no longer match its quantity"

**What happened.** The cart was edited after the item was added - usually the quantity was changed on the cart page, or part of it was removed.

**What to do.** Ask the shopper to remove the item and configure it again. Changing quantity on the cart page is not reliable for configured products; configuring twice is.

### "This option is temporarily unavailable"

**What happened.** Something the configuration needs cannot be bought right now - most often a linked product that has been deleted, archived, or taken out of the Online Store channel.

**What to do.** Open the project. The **Pricing catalog** card will show **Link broken** or **Not purchasable** against the culprit. Treat this as urgent: while it lasts, that configurator sells nothing.

### "We couldn't confirm the price for …"

**What happened.** Deliberately different wording from "out of date": the price could not be *read*, so it is not known to be wrong - only unconfirmable. Usually the project was unpublished, or republished with pricing switched off, while that item sat in a cart.

**What to do.** Check the project is still published with pricing on. Then ask the shopper to reconfigure.

### "The configuration for … is incomplete or invalid"

**What happened.** The item was submitted with a required field empty, or a value failing a rule you set - usually by skipping the configurator's own Add to cart.

**What to do.** Ask the shopper to configure it again on the product page. If it recurs, check your required fields and validation rules are reachable in the layout - a required control hidden inside a collapsed section is easy to miss.

### "We could not work out the price for this configuration right now"

**What happened.** The configuration costs less than the cart would have to collect for it, so the add was refused rather than charged at the wrong amount. With **Product lines** charging, the price of the product itself is posted on every configured order, and no configuration can come to less than that.

**What to do.** This should never reach a shopper - publishing checks the whole range of configurations and refuses to go live when one of them breaches the floor. Seeing it means the product's own price in Shopify has been raised since you last published. Publish the project again: it will either succeed, or stop and name the price the product should carry. See [Linked products](./linked-products#which-changes-need-a-publish).

**If it only happens in one market**, the cause is different: that market cannot be priced exactly, so the configuration was refused rather than charged at an amount that would not match what was shown. Giving the market a price list is the fix - see [Other currencies](./other-currencies#two-kinds-of-market).

### "Your cart already has N customized products"

**What happened.** There is a limit on how many configured products one cart can carry, and this cart has reached it. The message names the number, and that number is this configurator's own: publishing works it out from how much checking the project asks for, and it can be anywhere from one to four - see [Managing complexity](./complexity). The limit is checked again at checkout, so the same refusal can be reported there instead, in checkout's own wording.

**What to do.** Ask the shopper to remove configured items until the number the message names remain, check out, then place a second order for the rest.

## When a publish is refused

Publishing stops rather than going live with a setup that would charge incorrectly. The message names the cause.

| Message mentions | What to do |
|---|---|
| A linked price is missing | Re-link that option in Composer, or give it a plain amount |
| A linked product costs more than the option charges | Raise the option's amount, or unlink it |
| A product is draft, archived, or not in the Online Store channel | Fix it in Shopify admin, then publish again |
| A product is out of stock and set to stop selling | Restock it, or unlink it |
| A configuration cannot be charged, naming selections and a shortfall | Raise your base price, set the product's price to the figure the message names, or switch to Bundled parts charging, which has no such floor |
| The store's currency could not be read | Try again - this is usually transient |
| The pricing rules are too large | Reduce priced options or conditions, or switch to Bundled parts, Variant matrix or Single line ([charging methods](./charging-methods)) |
| Two projects target one product | One product can only be driven by one published project. Unlink it from the other |

## Nothing is wrong, but nothing appears

**No price shows on the product page.** Check the project is published, that pricing is switched on, and that the product is linked to the project.

**The configurator is replaced by a short message.** The project is paused - see [Linked products](./linked-products#changing-prices-safely). Resume it on the project page.

**Prices look right in Composer but not on the storefront.** You have unpublished changes. Publish.

## Still stuck?

Tell us the store, the product, and what the shopper saw - see [Please reach out](/learn/3d-bits/reaching-out). Knowing your product pages helps us help you.
