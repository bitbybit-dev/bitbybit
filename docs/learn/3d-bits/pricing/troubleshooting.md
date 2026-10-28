---
sidebar_position: 10
title: "Troubleshooting Configurator Pricing: What Each Message Means"
sidebar_label: Troubleshooting
description: Learn what to do when a shopper cannot check out a configured product, or a publish is refused.
tags: [shopify, 3d-bits, pricing, checkout, validation]
topic: shopify.pricing.troubleshooting
type: how-to
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

**What happened.** The configuration in the cart no longer matches your current pricing, or the cart was edited after the item was added and no longer pays for every item it holds.

**What to do.**

1. Open the project and check the **Pricing catalog** card for a **Price changed** badge. If there is one, click **Update prices and publish** - see [Linked products](./linked-products).
2. If everything looks healthy, the cart is simply older than your last publish. Ask the shopper to reconfigure.
3. If it happens only to shoppers in one country, that country may be in a market that includes tax based on the shopper's country, with a tax rate lower than yours - see [Tax that depends on the shopper's country](./other-currencies#per-country-tax).

### "The extras for … no longer match its quantity"

**What happened.** The cart was edited after the item was added - usually the quantity was changed on the cart page, or part of it was removed. It also appears when two configured items in the cart share one set of extras.

**What to do.** Ask the shopper to remove the item and configure it again. Changing quantity on the cart page is not reliable for configured products; configuring twice is.

### "The price of … in your cart no longer matches its configuration"

**What happened.** The cart charges more than the configuration costs. Usually the quantity was lowered on the cart page after the item was added, which leaves part of the price behind for the items taken away. It also happens when a product the configuration adds costs more in Shopify than when you last published, and in a market that includes tax based on the shopper's country, for a shopper whose country's tax rate is higher than yours.

**What to do.** Ask the shopper to remove the item and configure it again. If a product's price changed, publish the project again. If shoppers in one country keep seeing it, see [Tax that depends on the shopper's country](./other-currencies#per-country-tax).

### "This option is temporarily unavailable"

**What happened.** Something the configuration needs cannot be bought right now - most often a linked product that has been deleted, archived, or taken out of the Online Store channel.

**What to do.** Open the project. The **Pricing catalog** card will show **Link broken** or **Not purchasable** against the culprit. Treat this as urgent: while it lasts, that configurator sells nothing.

### "We couldn't confirm the price for …"

**What happened.** Deliberately different wording from "out of date": the price could not be *read*, so it is not known to be wrong - only unconfirmable. Usually the project was unpublished, or republished with pricing switched off, while that item sat in a cart.

**What to do.** Check the project is still published with pricing on. Then ask the shopper to reconfigure.

### "The configuration for … is incomplete or invalid"

**What happened.** The item was submitted with a required field empty, a value failing a rule you set, or a value the configurator does not offer - usually by skipping the configurator's own Add to cart. An item added before your last publish can be refused the same way when that publish removed a choice it uses or narrowed a range. While such an item stays in the cart, nothing else can be added either.

**What to do.** Ask the shopper to remove the item and configure it again on the product page. If it recurs, check your required fields and validation rules are reachable in the layout - a required control hidden inside a collapsed section is easy to miss.

### "We could not work out the price for this configuration right now"

**What happened.** The configuration costs less than the cart would have to collect for it, so the add was refused rather than charged at the wrong amount. With **Product lines** charging, that means an option or a part charges less than the products it adds to the cart.

**What to do.** This should rarely reach a shopper - publishing checks the whole range of configurations and refuses to go live when one of them costs less than what it adds. Publish the project again: it either succeeds, or stops and names the selections and how much to raise the options chosen there. Raising the base price alone does not help in Product lines: the base price is your product's price in Shopify, so raise both together. See [Linked products](./linked-products#which-changes-need-a-publish).

**If it only happens in one market**, the cause is different: that market cannot be priced exactly, so the configuration was refused rather than charged at an amount that would not match what was shown. Giving the market a price list is the fix - see [Other currencies](./other-currencies#two-kinds-of-market). If that market includes tax based on the shopper's country instead, Product lines charging can refuse a configured product with amounts 3D Bits works out in countries whose tax rate differs from yours - see [Other currencies](./other-currencies#per-country-tax).

### "Your cart already has N customized products"

**What happened.** There is a limit on how many configured products one cart can carry, and this cart has reached it. The message names the number, and that number is this configurator's own: publishing works it out from how much checking the project asks for, and it can be anywhere from one to four - see [Managing complexity](./complexity). The limit is checked again at checkout, so the same refusal can be reported there instead, in checkout's own wording.

**What to do.** Ask the shopper to remove configured items until the number the message names remain, check out, then place a second order for the rest.

### "This cart has too many configured extras for us to check the prices"

**What happened.** With Product lines charging, every priced option and part a configured item adds reaches the cart as a line of its own, and checkout can check only so many lines in one cart. Several large configurations together can pass that, even when each fits on its own.

**What to do.** Ask the shopper to remove an item, check out, then place a second order for the rest. If shoppers meet it often, combine the option lines into one charge or switch to Bundled parts - see [Managing complexity](./complexity).

### "…could not be checked out together with everything else in your cart"

**What happened.** A configuration with [parts picked from your variants](/learn/3d-bits/composer/gui/parts#parts-from-your-variants) checks out only when checkout joins it to its product, and this time it could not - usually because the cart holds too much for checkout to join every configuration in it.

**What to do.** Ask the shopper to remove some other items, or to remove the product and add it again. If it happens with a small cart, contact us.

### "This combination of options is not sold"

**What happened.** A part picks one of your variants, and the shopper's choices land on a combination with no variant in Shopify, or one you set to **Not sold**.

**What to do.** Nothing, if you do not sell it. To sell it, create the variant in Shopify, refresh the part in the Composer and publish. Switching on **Disable options that cannot currently be sold** crosses such combinations out before the shopper reaches Add to cart.

## When a publish is refused

Publishing stops rather than going live with a setup that would charge incorrectly. The message names the cause.

| Message mentions | What to do |
|---|---|
| A linked price is missing | Re-link that option in Composer, or give it a plain amount |
| A linked product costs more than the option charges | Raise the option's amount, or unlink it |
| A product is draft, archived, or not in the Online Store channel | Fix it in Shopify admin, then publish again |
| A product is out of stock and set to stop selling | Restock it, or unlink it |
| A configuration cannot be charged, naming selections and a shortfall | The options or parts chosen there charge less than the products they add. Raise their prices by at least the amount the message names. Raising the base price needs the product's price raised too, since in Product lines one is the other |
| A product has no variant priced at the base price | Set the product's price to the base price - on the project page or in Shopify - or set the base price to the product's price in the Composer |
| A part linked to a product is marked as included in the base price | Untick **Already part of the base price** on the part, and lower the base price by what the part costs |
| A linked product costs something different now, and is saved at more than one price | Sync the prices, or give the product the same price everywhere this configurator links it, and publish again |
| A linked product costs something different now, with Bundled parts charging | **Sync prices and publish** saves the new price and publishes. Until then you are selling at the old price |
| The store's currency could not be read | Try again - this is usually transient |
| The pricing rules are too large | Reduce priced options or conditions, or switch to Variant matrix, which carries no rules ([charging methods](./charging-methods)) |
| Working out the prices costs more than checkout is given | Fewer parts, simpler conditions, plain numbers instead of expressions, one expression reused rather than many. Single line charging holds more parts than Bundled parts, which also pays for every part it nests |
| Two projects target one product | One product can only be driven by one published project. Unlink it from the other |

### "…3D Bits also could not put this configurator's helper products back the way your published version uses them, so publish again as soon as you can."

**What happened.** A publish can be refused after it has already updated the hidden [helper products](./helper-products). 3D Bits then puts them back the way your live configurator uses them. This sentence, at the end of a refusal, means it could not, and the projects list marks the project **Republish needed**.

**What to do.** Fix what the rest of the message names and publish again as soon as you can. Until then, shoppers may be charged or refused differently from what the live configurator shows.

## Parts picked from your variants {#parts-picked-from-your-variants}

These messages come from a [part that picks one of your variants](/learn/3d-bits/composer/gui/parts#parts-from-your-variants). Each heading quotes the start of the message publishing shows.

### "a part picks a product's variant, which only Product lines can charge"

Bundled parts cannot charge a part that picks one of your variants. Switch the project to Product lines charging, or link the part to one fixed product.

### "a part picks a product's variant, and 3D Bits' checkout does not check such parts yet"

3D Bits' checkout cannot check parts picked from your variants yet. Until it can, link the part to one fixed product to publish this configurator.

### "… picks from this configurator's own product"

A part cannot pick from the product the configurator sits on. Pick it from another product, one without a configurator.

### "… picks from "…", which is itself a configured product"

Another configurator is published to that product, and checkout would check its pricing again with every line of it. Pick the part from a product without a configurator, or unpublish the project that configures it.

### "… picks from "…", which is …"

The product is a draft, archived, or not published to the Online Store sales channel. Set it to Active and publish it to the Online Store, or remove the part.

### "… picks from a product that no longer exists, or the app can no longer see it"

The product was deleted, or is out of the app's reach. Pick the part's product again in the Composer.

### "the variants of the product "…" picks from could not be read from Shopify"

Shopify did not answer. Publish again.

### "the product "…" picks from no longer has …"

An option of the product, or a value a choice picks, was removed or renamed in Shopify. The message names which. Refresh the part in the Composer, match its options or that value again, and publish.

### "the product "…" picks from has the option …, which the part does not match"

An option was added to the product in Shopify, so one choice could stand for more than one variant. Refresh the part and choose what picks the new option.

### "a variant of the product "…" picks from changed in Shopify since the part was set up"

The message starts with the number of variants when there are several. Their option values were renamed in Shopify, so the part no longer recognises them. Refresh the part in the Composer, match the values again and publish.

### "none of the choices of "…" picks a value of …"

Every choice of the control that picks that option is set to **Not sold**, so the part could never be sold. Match a choice to a value in the Composer.

### "… picks its "…" by a control the configurator no longer has"

The control the part picks an option by was deleted, or changed to a kind that cannot pick a variant - only a dropdown or a radio group can. The same refusal starts *"… matches "…" of "…", which that control no longer offers"* when a matched choice was removed from its control; the part shows it as a row ending *no longer offered by the control*. Match the part's options to your controls again in the Composer, or remove the stale row.

### "a part picks a variant this configurator also charges another way"

An option or another part links the same variant, and checkout counts that variant's line for the part alone, so every cart carrying both would be refused. Pick the variant for one of them only, or link another product.

### "checkout cannot read the record 3D Bits keeps of …"

3D Bits keeps a short record of each variant a part can pick, so checkout can recognise it, and checkout could not read it back for the variants the message names. Nothing you set up causes this. Contact us with the message.

### "the choices your parts pick variants by, beside the products this configurator charges, take more room than checkout reads for one product"

Match fewer choices to variants, or charge fewer products through this configurator.

### More than 2,000 units on one cart line

A configuration with a part picked from your variants checks out only as one line joined to its product, and Shopify joins a line of at most 2,000 units. Three messages say so:

- *"… puts more than 2000 units on one cart line for a single configuration"* - a part's own quantity is that large. Lower the quantity, or sell the part in packs.
- *"with … one line of the group carries … units, more than the 2000 Shopify joins to its product"* - the configuration the message names reaches it. Lower that quantity, or sell the part in packs.
- *"with … the part of the price collected through the price-unit line needs … units on one cart line, more than the 2000 Shopify joins to its product"* - too much of the price is an amount 3D Bits works out. Charge more of it through options or linked products, so less of it rides the price line.

### Parts picked from your variants and the cart limit

A part picked from your variants takes a little more room in a cart than other lines, so many of them lower how many configured items one cart holds - see [How many configured items fit in one cart](./charging-methods#cart-capacity).

- A warning that starts *"Shoppers can add … configured items of this product to one cart"* and goes on *"Each configuration adds up to … cart lines for its parts and options, and the … for parts chosen from your variants take a little more room each, because checkout also reads which options their variants have"* names the cart limit. Fewer parts per configuration raises it; charging the options through one combined line also helps.
- *"even a single configured item cannot be verified at checkout: one configuration adds up to … cart lines"*, going on to *"a cart holds at most … of them beside the rest of one configuration"*, stops the publish. Pick fewer parts from your variants in one configuration - a part that stays the same whatever the shopper chooses can link one fixed product instead. Where the message names options on lines of their own, charging them through one combined line also frees lines.
- A cart-limit warning that goes on *"At checkout each configuration's parts chosen from your variants are merged under it"* means a whole cart's joined configurations must fit what checkout can write. Fewer parts per configuration, fewer choices, or fewer products linked to it raise the limit.
- *"even a single configured item cannot be verified at checkout: at checkout … are joined to the configured product with everything the shopper chose and typed"* stops the publish for the same reason, at one configuration. Pick fewer parts from your variants, or offer fewer choices and text fields.

### "Long product names take room too" {#long-product-names}

A cart-limit warning, or a message that stops the publish, can end with *"Long product names take room too: checkout reads the name of every product in the cart, and … has a name long enough that fewer lines fit"*. Checkout reads the name of every product a configuration puts in the cart, and a name longer than about 200 characters (fewer when it has accented letters or characters of other scripts) takes room from the other lines. Shorten the names the message lists - your product's own name, or the name of a linked product or part - and publish again.

### "3D Bits could not finish setting up checkout for the parts chosen from your variants"

Nothing is wrong with your setup. Publish again in a moment, and if it keeps happening, contact us.

### "Shopify did not save what checkout needs to know about the variants your parts pick from"

Shopify did not take what 3D Bits records about your variants. Publish again in a moment. If the message says *"Shopify no longer has a variant a part picks from"* instead, refresh the part in the Composer and publish.

### "the Cart Transform could not be activated, so the parts chosen from your variants could not be joined to their product"

The checkout mechanism that joins these parts to their product is not available on your store right now. Open the app from your Shopify admin, accept any permission prompt, and publish again.

## Warnings after a publish

### "A price formula reads "…", which has no minimum value" {#warning-no-minimum}

**What happened.** A number control that a price depends on has no minimum value.

**What to do.** Set a minimum on that control in Composer, usually 0, and publish again. If a logic rule or a script changes the control's range, give that range a minimum too.

### "A price formula names an input it reads with an expression rather than in quotes" {#warning-input-name-in-quotes}

**What happened.** A price formula works out the name of an input it reads instead of naming it - `input("size_" + n)`, for example, or `selectedCount("ext" + "ras")`.

**What to do.** Name each input the formula reads, either plainly, such as `width`, or in quotes, such as `input("extra-panels")` for a key a plain name cannot spell. Then publish again. A formula that picks between several inputs can name each one.

### "A linked product costs something different in Shopify now"

**What happened.** With Product lines charging, a product the configurator links has a new price in Shopify. Shoppers already pay Shopify's current price for it, and the configurator shows it.

**What to do.** **Sync prices and publish** saves the new price in the configurator. Nothing is mis-charged in the meantime.

### "In Product lines a shopper who picks a variant of the product pays that variant's price as the base"

**What happened.** Some variants of the product the configurator sits on cost more or less than the base price. The message names each one and what a shopper choosing it pays.

**What to do.** Nothing, if that is what you intend. If every shopper should pay the same, give every variant the base price in Shopify.

### "3D Bits could not finish setting up checkout for this configurator"

**What happened.** The configurator was published, but until 3D Bits finishes setting up checkout, checkout holds it to the prices it was published with. A price you change in Shopify for this product, or for a product it links to, can then stop shoppers checking out.

**What to do.** Publish again to finish the setup. If the warning keeps coming back, contact us.

### "Shopify has a variant of the product "…" picks from that the part was not set up with"

**What happened.** A variant was added in Shopify after the part was set up, so the configurator does not sell it yet. The message starts with the number of variants when there are several.

**What to do.** Refresh the part in the Composer and publish to sell it.

### "With "…", a combination the choices can reach has no variant in Shopify, so shoppers see it crossed out"

**What happened.** Some combinations of the choices a part picks variants by have no variant in your product.

**What to do.** Create the variant in Shopify and refresh the part, or leave the combination unsold.

### "a variant "…" was set up with no longer exists in Shopify"

**What happened.** A variant the part picks was deleted in Shopify, so shoppers see that choice crossed out. The message starts with the number of variants when there are several.

**What to do.** Refresh the part in the Composer and publish.

## Nothing is wrong, but nothing appears

**No price shows on the product page.** Check the project is published, that pricing is switched on, and that the product is linked to the project.

**The configurator is replaced by a short message.** The project is paused - see [Linked products](./linked-products#changing-prices-safely). Resume it on the project page.

**Prices look right in Composer but not on the storefront.** You have unpublished changes. Publish.

**No discounts on the Price element.** They appear only when Shopify gives this configuration a discount and prices it at exactly the total shown. Check that the discount is active and covers this product, that the code is on the shopper's cart (or the discount is automatic), and that the shopper pays in your store currency - in a converted currency the rows are usually hidden. Discounts that need other items in the cart, and customer-only discounts, show at checkout instead. [Pricing test mode](/learn/3d-bits/pricing/test-mode) shows no rows, and a subscription price usually hides them. The Price element's **Show the store's discounts** must be ticked.

**The promo code chip never states a saving.** The code does not lower this configuration's price - it may be misspelled, expired, limited to other products, or waiting for a minimum spend. Other reasons the saving is not stated: the shopper pays in another currency, the store is in Pricing test mode, or the code is the third or later different code across your Price elements (only the first two are checked). A code limited to logged-in customers or B2B buyers never states a saving on the product page, because the page asks Shopify without knowing who the shopper is; after Apply the chip says the code is on the cart and any saving applies at checkout, and checkout gives the saving to a shopper who qualifies. For any other code, press Apply on the product page and, if no saving appears, check the discount's conditions in your Shopify admin.

## Still stuck?

Tell us the store, the product, and what the shopper saw - see [Please reach out](/learn/3d-bits/reaching-out). Knowing your product pages helps us help you.
