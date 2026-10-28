---
sidebar_position: 1
title: "Projects"
sidebar_label: Projects
description: Creating configurators, linking them to products, publishing, and reading the warnings the project page raises.
tags: [shopify, 3d-bits, projects]
topic: shopify.app.projects
type: how-to
---

# Projects

A project is one configurator. It holds a 3D scene, the panel of options your shoppers use, the logic between those options, and the prices. You build it in Composer and publish it to the products it belongs to.

Most stores end up with one project per product family. A dining table available in three woods and four sizes is one project, not twelve.

## Creating one

**New project** asks for a title and then opens Composer.

Below the title there is a checkbox, **Also create a product for this configurator**, and it is ticked by default. It makes a draft product named after the project, with the vendor 3D Bits, and links it. Handy when you are trying things out and do not want to touch your real catalogue yet. If you already have the product, untick it and link that product instead on the project page.

:::warning The starter product arrives with no price
The product it creates is a draft priced at zero, so it is hidden from your storefront until you set it active in Shopify admin. Before you go live, give it a price, images and details like any other product - and read [Setting up pricing](/learn/3d-bits/pricing/setting-up-pricing) before you decide what that price should be, because with Product lines charging it is not a free choice.
:::

## The project page

Opening a project from the list gives you everything about it apart from the design itself, which is in Composer. The page is organised into a few cards, with any warnings stacked above them - those are explained in [What the banners on this page mean](#what-the-banners-on-this-page-mean).

The title bar carries the project's status, an **Edit** button that opens Composer, and the **Download JSON** and **Delete** actions.

### Publishing

Where you link products and publish. Publishing takes the current state of the project and sends it to every linked product, and until you do, changes you save in Composer stay private to you.

A project can be linked to more than one product, up to 100, which is how you reuse one configurator across a range that shares a design. Choosing more than 100 is refused with *"Too many products are selected - link at most 100 products to one project."*, and the products already linked stay as they were. Each linked product is listed with a badge saying whether it is **Live**, a **Draft** or **Not on storefront**, and an **Out of stock** badge if it cannot currently be bought.

You can also unpublish, which removes the configurator from its products and leaves the products themselves untouched.

Unpublishing, deleting the project and changing its linked products all wait while the project is being published, and say so: try again once the publish has finished. If Shopify does not confirm that the pricing rules came off every product, the project is left as it is and the message asks you to try again in a moment.

### Storefront settings

How this configurator presents itself and behaves on the storefront. The card is five sections, each closed to a single line that sums up its current settings; open the one you want to change and it closes the others.

- **Placement and layout** - **Placement on the product page**: App embed, which places everything for you, or theme template blocks, which hands placement to you (this is the setting that decides whether the two sections after it apply at all). Then **Storefront layout** - Inline or Split - with **Controls side**, **Controls panel content** and **Theme product controls**, which decides how much of your theme's own product block the configurator replaces.
- **Sizes per device** - a drawing of the product page for desktop, laptop, tablet and phone screens, each with the settings that apply to it beside it: the side-by-side and stacked heights, the panel width per kind of screen, whether tablets stack or sit side by side, the max width, side offset and side margin.
- **Spacing and advanced selectors** - the top and bottom margins, for every screen, and the CSS selectors the Split layout falls back to when a theme's structure is not detected.
- **Storefront behaviour** - **Show fullscreen button** and **Show loading spinner**, then **Receive input names as variants** and **Input collection mode**, which only matter when the configurator reads your theme's own inputs rather than drawing its own panel, and **Debug mode**, which prints on the product page every input 3D Bits is reading.
- **Pricing and charging** - the charging method, explained in [Charging methods](/learn/3d-bits/pricing/charging-methods); **How option charges reach the order**, explained in [Charging methods](/learn/3d-bits/pricing/charging-methods#one-line-per-option-or-one-combined-charge); the **Generated product name prefix** that brands the products the app generates; and **Pricing test mode**, which publishes your prices for inspection without taking orders.

**Save settings** puts them onto your published products immediately. Three of them wait for your next publish instead: the charging method, the generated product name prefix and the placement strategy.

Canvas sizing has [its own page](/learn/3d-bits/admin/canvas-sizing), since it is the setting people most often want to adjust.

:::info Pausing is not in this card
Putting a configurator in front of your shoppers or taking it away is not a Storefront setting. **Pause this configurator** appears as a button on the health banner when a linked product has a problem, and **Resume selling** on the banner that then replaces it. Both take effect immediately, without a publish.
:::

### Used by Composer projects

This card is on a **script's** page, not a configurator's. It lists the Composer projects that link to that script, so you can see who depends on it before you change it. A script cannot be deleted while any project still references it.

A Composer project sees the same relationship from the other side, as a **Linked scripts were updated** banner: a script it uses has been republished since this project last was, so a republish is needed to pick up the newer version.

### Pricing catalog

Everything that carries this configurator's prices, in two labelled groups.

**Your linked products** are items from your own catalogue that options point at. The app only references them - it never edits your products - and each entry carries a badge saying whether the link is healthy. There are six states:

| Badge | What it means |
|---|---|
| Up to date | Nothing to do. |
| Price changed | The product costs something different from what the configurator was published with. With Product lines charging, shoppers already pay the new price, and republishing only brings the configurator's saved copy up to date. With Bundled parts charging, you are selling at the old price until you republish. A Product lines project marked **Republish needed** refuses carts with the product at its new price until you republish. |
| Out of stock | Inventory has run out and the product is set to stop selling when out of stock. |
| Not purchasable | The product is not active, or not published to the Online Store. |
| Link broken | The product no longer exists, or the app can no longer see it. |
| Not checked | Shopify did not answer when the page loaded. Nothing is known to be wrong - reload to check again. |

**Generated by 3D Bits** lists what the app created to carry the prices your own products do not: the hidden helper products for priced options, the shared price item, and the generated variants if you are using the variant matrix method. Each is **Live** or **Archived**. Removing a priced option archives its item on the next publish, because past orders refer to it; an archived item then offers **Delete permanently**, which is genuinely permanent - past orders keep their own copies, but reports referencing it will no longer resolve.

[Helper products](/learn/3d-bits/pricing/helper-products) explains what those are and why they exist, and [Linked products](/learn/3d-bits/pricing/linked-products) covers keeping the links healthy.

### Versions

Every publish keeps a snapshot, and you can take a manual backup at any time with **Create backup**. The list shows your current draft, the live version, your backups, and older published versions behind a **Show older published versions** toggle. History keeps the newest 20 published versions and 20 backups; older entries drop off as new ones are created.

Every entry can be downloaded. **Restore** appears on backups only - published versions are there to download and inspect, not to roll back to directly.

:::warning Restoring is not rolling back
**Restore** writes that backup into your current **draft**, replacing whatever is in it. Your storefront carries on showing the published version until you publish again. So a rollback is two steps: restore, check it in Composer's Play mode, then publish.
:::

## What the banners on this page mean

Warnings stack above the cards, worst first. These are the ones you will meet.

**Linked scripts were updated.** A script this project links to has been republished since this project was. Republish when you have checked the experience still behaves.

**Pricing test mode is on - this configurator is not selling.** Publishing shows the configurator and its prices on the product page but creates no helper products and takes no orders, and the buy buttons are hidden. **Turn off and go live** republishes straight away.

**This configurator is paused.** Shoppers see your pause message instead of the configurator, and the product cannot be added to a cart. Items already in a shopper's cart are unaffected. **Resume selling** puts it back.

**Helper products were edited in Shopify**, or **Helper products are not on the Online Store.** The app owns these products and your Composer prices are the source of truth, so there is nothing to choose here, only to restore. Edit prices in Composer, not in Shopify, and republish.

**A linked product is not available / out of stock / its price changed.** One of your own products, linked to an option, has moved underneath the published configurator. The banner offers **Pause this configurator** while you sort it out, and for a price change it says what the change does - with Product lines charging, shoppers already pay Shopify's current price - and can offer **Update prices and publish** to save the new prices and republish in one go.

**A warning about your product's own price.** This one sits inside the Publishing card, next to your linked products, and it only appears when the project charges through Product lines. With that method the configurator's base price is the product's price in Shopify, and a shopper who picks a variant pays that variant's price as the base. The banner appears when a linked product has no variant priced at the base price, and says publishing is refused until they match. Its button, **Set the product price to** the base price, writes that price onto the product for you - with a confirmation first, because anything else selling that product at its own price is affected too. When the product's variants have several prices, only the cheapest ones get the base price, and the others keep theirs. Or set the base price to the product's price in the Composer instead.

[Setting up pricing](/learn/3d-bits/pricing/setting-up-pricing) is the full explanation, and it is worth reading before your first publish rather than after it.

:::danger Do not set the product's price to zero
Older guidance said to zero the product's price to keep it out of the way. Do not. With Product lines charging the product's price is the base price, so publishing refuses a product priced at zero while the configurator's base price is not.
:::

## Saving and publishing are different

Worth repeating because it catches people out. **Save** keeps your work in the project. **Publish** puts it on your storefront. You can save as often as you like without any of it reaching a shopper.

Publishing from this page asks you to confirm whenever the project charges through Product lines or Bundled parts, because those are the methods that create and update hidden helper products in your store. Pricing test mode suppresses the question, since it creates nothing. The same dialog offers to add the exclusion rule that keeps those products out of your automated collections, and that offer is ticked by default.

## Deleting a project

Deleting removes the configurator from its products, clears their 3D Bits metafields and cleans up the files it published. Helper products it created are archived rather than deleted, because past orders refer to them and those orders must keep making sense.

### What stays on your variants {#what-stays-on-your-variants}

When a part picks one of your variants, publishing writes a small note on each variant it can pick, which checkout reads to recognise the variant. One note serves every configurator that picks the variant. Unpublishing or deleting a project takes the note off a variant no other published project picks. If Shopify does not answer at that moment, the note can stay, and it does nothing while no configurator picks that variant. You cannot edit these notes in the Shopify admin.

If you uninstall the app, the notes stay on your variants, like the app's other data on your products, and do nothing once the app is gone. Unpublishing the projects that use such parts before you uninstall takes them off - see [Your data and uninstalling](/learn/3d-bits/admin/storefront-display#your-data-and-uninstalling).
