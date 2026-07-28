---
sidebar_position: 7
title: "Troubleshooting Configurator Pricing: What Each Message Means"
sidebar_label: Troubleshooting
description: Learn what to do when a shopper cannot check out a configured product, or a publish is refused.
tags: [shopify, 3d-bits, pricing, checkout, validation]
---

# Troubleshooting

3D Bits would rather stop a sale than let a customer be charged the wrong amount. That is the right trade, but it means a shopper occasionally sees a message. This page turns each one into an action.

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

1. Open the project and check the **Pricing catalogue** card for a **Price changed** badge. If there is one, click **Update prices and republish** - see [Linked products](./linked-products).
2. If everything looks healthy, the cart is simply older than your last publish. Ask the shopper to reconfigure.

### "The extras for … no longer match its quantity"

**What happened.** The cart was edited after the item was added - usually the quantity was changed on the cart page, or part of it was removed.

**What to do.** Ask the shopper to remove the item and configure it again. Changing quantity on the cart page is not reliable for configured products; configuring twice is.

### "This option is temporarily unavailable"

**What happened.** Something the configuration needs cannot be bought right now - most often a linked product that has been deleted, archived, or taken out of the Online Store channel.

**What to do.** Open the project. The **Pricing catalogue** card will show **Link broken** or **Not purchasable** against the culprit. Treat this as urgent: while it lasts, that configurator sells nothing.

### "We couldn't confirm the price for …"

**What happened.** Deliberately different wording from "out of date": the price could not be *read*, so it is not known to be wrong - only unconfirmable. Usually the project was unpublished, or republished with pricing switched off, while that item sat in a cart.

**What to do.** Check the project is still published with pricing on. Then ask the shopper to reconfigure.

### "The configuration for … is incomplete or invalid"

**What happened.** The item was submitted with a required field empty, or a value failing a rule you set - usually by skipping the configurator's own Add to cart.

**What to do.** Ask the shopper to configure it again on the product page. If it recurs, check your required fields and validation rules are reachable in the layout - a required control hidden inside a collapsed section is easy to miss.

### "Your cart already has 4 customized products"

**What happened.** There is a limit on how many configured products one order can carry, and the product page stopped the add before it happened.

**What to do.** Ask the shopper to check out with what they have and place a second order for the rest.

### "This order has too many customized products to verify at checkout"

**What happened.** The same limit, but reached *after* the items were already in the cart - so it surfaces at checkout rather than on the product page. Most often a logged-out cart merging with the shopper's saved cart on sign-in.

**What to do.** Ask them to remove items until four or fewer configured products remain, check out, then order the rest separately.

## When a publish is refused

Publishing stops rather than going live with a setup that would charge incorrectly. The message names the cause.

| Message mentions | What to do |
|---|---|
| A linked price is missing | Re-link that option in the Composer, or give it a plain amount |
| A linked product costs more than the option charges | Raise the option's amount, or unlink it |
| A product is draft, archived, or not in the Online Store channel | Fix it in Shopify admin, then publish again |
| A product is out of stock and set to stop selling | Restock it, allow overselling on that variant, or unlink it |
| The store's currency could not be read | Try again - this is usually transient |
| The pricing rules are too large | Reduce priced options or conditions, or switch to Variant matrix or Single line ([charging methods](./charging-methods)) |
| Two projects target one product | One product can only be driven by one published project. Unlink it from the other |

## Nothing is wrong, but nothing appears

**No price shows on the product page.** Check the project is published, that pricing is switched on, and that the product is linked to the project.

**The configurator is replaced by a short message.** The project is paused - see [Linked products](./linked-products#changing-prices-safely). Resume it on the project page.

**Prices look right in the Composer but not on the storefront.** You have unpublished changes. Publish.

## Still stuck?

Tell us the store, the product, and what the shopper saw - see [Please reach out](/learn/3d-bits/reaching-out). Knowing your product pages helps us help you.
