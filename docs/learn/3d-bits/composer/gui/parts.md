---
sidebar_position: 5
title: "Parts: The Bill of Materials Behind a Configured Product"
sidebar_label: Parts
description: List what the configured product is made of, charge for the pieces you ship, and record the ones you only need on the works order.
tags: [3d-bits, composer, gui, pricing]
---

# Parts

:::info Pro plan
Parts need the Pro plan.
:::

A part is something the configured product is **made of** - a panel, a hinge, a mounting kit, a length of edge banding. The Parts tab of the GUI section is where you list them, and where you say when each one is included.

This is the difference between parts and priced options. An option is a question you ask the shopper, and it charges when they choose it. A part is a fact about the product, and it appears whenever its condition holds, whether or not the shopper knows it exists.

## Charged, or only recorded

Every part is one of two things, and the difference is simply whether money is involved.

**Charged.** Either you link it to a real product in your store, or you type a price on it. A linked part is charged at that product's price, ships as its own line on the order, and decrements your stock. A part with a typed price but no product is charged too, but nothing ships for it - use it for a cost that is real but has no item behind it.

**Recorded.** No link and no price. It never costs anything and it never reaches the cart. It exists so that the order, the parts list and the export say what the thing is made of. A part that is only written down is how you get a works order that a person can build from.

The tab shows which is which: each part is labelled *charged* or *recorded* beside its name.

## Adding a part

**Add Part**, then fill in what you know. Only the label really matters to begin with.

| Field | What it is for |
|---|---|
| **Label** | What the part is called. This is what the shopper sees in a parts list and on the PDF. |
| **SKU** | Your internal part number. See [What is published](#what-is-published-and-what-is-not) below. |
| **Part of** | Puts this part inside another one, making an assembly. |
| **Find number** | A stable number for drawings and works orders. It is yours to set, and deleting a part never renumbers the others. |
| **Unit** | What one of them is - a piece, a kit, an hour. |
| **Unit shown to people** | Your own wording for that unit, if the standard one is not how you say it. |
| **Price each** | A price when there is no product to link. Offered only while the part is unlinked. |
| **Quantity** | How many, when it is always the same number. |
| **Quantity expression** | How many, when it depends on what the shopper chose. |
| **Already part of the base price** | The part still ships and still decrements stock, but adds nothing on top of your base price. |
| **Included when** | The condition that decides whether the part is in this configuration at all. |
| **When it runs out** | Which shopper choices to cross out while this part cannot be sold. |

### Linking a product

**Link product** points the part at something real in your catalogue. It is then charged at that product's price and it ships.

If you have typed a price and then link a product, the typed price is removed - a linked part is charged at its own product's price, and a part may not have two prices.

### Creating a product from a part

If a recorded part turns out to be something you actually sell, **Create product** adds it to your store and links it in one step. The product is yours: editable, sellable on its own, and reusable in other configurators. Its stock is left untracked so this configurator is never blocked by inventory you did not mean to manage - turn tracking on in Shopify when you are ready.

## Assemblies

**Part of** nests one part inside another, which is how you describe a real build.

Two things follow from nesting, and both are what you would want:

- **Conditions add up.** A child is included only when its own condition holds *and* every condition above it does. A hinge inside an assembly that only appears on the large size is itself only on the large size.
- **Quantities multiply.** Two of an assembly, each containing four screws, is eight screws.
- **A condition follows the answer, not the question.** If a part is included when *Finish* is *Oak*,
  and *Finish* itself is only shown when *Material* is *Wood*, the part is still included when
  *Finish* is hidden - because *Oak* is still the stored answer, kept in case the shopper switches
  back. A priced *option* on a hidden control is not charged, so the two behave differently on
  purpose. If a part should only be included while its control is actually on screen, add that
  control's condition to the part as well.

A parent does not have to be a real product. Leave it unlinked and it is a **grouping**: it ships nothing itself, while the parts inside it ship and are charged normally. That is the right shape for "Door assembly" as a heading over the pieces that actually go in the box.

:::warning Parts add up, they do not roll up
If you link a product to an assembly **and** to the parts inside it, all of them are charged and all of them ship. That is correct when the pieces go in the box loose, and wrong when the assembly product already contains them.

Only you know which. Publishing raises an advisory naming both, and clearing the link on the assembly keeps its grouping and its condition while stopping it charging twice.
:::

## How many

**Quantity** is a plain number for the parts that never change. **Quantity expression** is for the ones that do, written over your control keys the same way a pricing formula is - `width / 300`, say, for the number of brackets a run needs.

When you write an expression, a **Round** selector appears, because the answer will rarely be whole.

Where several parts need the same expression, write it the **same way** on each of them rather than
varying it slightly. Checkout works out each distinct expression once and reuses the answer, so
thirty parts sharing one expression cost about what one part costs, while thirty near-identical
expressions cost thirty times as much. It is the difference between a project that publishes and one
that is refused - see [Managing complexity](/learn/3d-bits/pricing/complexity).

| Round | Use it for |
|---|---|
| **Up - the covering quantity** | Almost always. Three and a bit brackets means you need four. |
| **To the nearest** | When over and under are equally acceptable. |
| **Down** | When a partial one is simply not fitted. |
| **Not rounded** | Only for a recorded part, where the fraction *is* the answer. |

New parts round **up**, because a covering quantity is what a real build almost always needs.

:::caution A charged part has to be a whole number
Anything you charge for ships as a whole number of things. Type a fractional quantity on a charged part and publishing refuses it outright. Leave a quantity *expression* unrounded and publishing warns instead, because it cannot know what the expression will work out to - at checkout the result is cut down to a whole number, so 2.35 is charged as 2. Either round it, or take the price and the product link off and record the measurement instead.

That is exactly why "Not rounded" exists: 2.35 metres of edge banding is the honest figure for a cutting list, and it is only honest while nobody is being charged for 2.35 of something.
:::

## Units

A unit says **what one of them is**. Piece, Each, Kit, Hour.

Units never touch the price. The price comes from the linked product or from what you typed, and both are prices for **one of the thing**. This is why there are no metres, kilograms or square metres in the list: offering "per kilogram" beside a price invites a reading that nothing here performs.

If you want a measurement in front of people, put it in **Unit shown to people**. It is your own wording and it is only ever displayed.

## Already part of the base price

Tick this when the base price you typed already covers the part.

The part still ships as its own order line and still decrements stock. It simply adds nothing on top. Use it when your base price is the price of the whole default configuration rather than of a bare product.

## When it runs out

Name the shopper choices that should be crossed out while this part cannot be sold, and they are marked unavailable as soon as your catalogue says so.

:::caution Two things have to be true before this field does anything
The part has to **link a store product** - a part with a typed price has no stock to run out of - and the project has to have **Disable options that cannot currently be sold (live catalog)** switched on in the [Pricing](/learn/3d-bits/composer/gui/pricing) tab. With either of those missing, filling this in is harmless but nothing is ever crossed out.
:::

Nothing is guessed from the part's own condition, because a condition like "oak **and** large" does not point at any single choice. Naming nothing is safe: a shopper who picks a configuration needing a part you cannot sell is refused at Add to cart regardless. The only thing this field decides is whether they find out early or late.

## Where your parts appear

- **The option panel**, if you add a **Parts list** element in the [Layout](/learn/3d-bits/composer/gui/layout) tab. It shows labels and quantities. It never shows SKUs.
- **The PDF documents**, if you add a **Parts table** section. See [PDF Reports](/learn/3d-bits/composer/gui/pdf-reports). It shows labels, quantities and units, never SKUs.
- **Order review** in the 3D Bits app, against the version the order was actually sold under.
- **A parts export**, downloadable from Order review as a spreadsheet, shaped for a cutting list.

## What is published, and what is not

:::warning The SKU field is the only private one
When you publish, your configuration is uploaded to a public address that every product page downloads. **The SKU is removed from that copy** and is the only field that is.

Everything else on a part is published: its **label**, its **price**, its **quantity** and expression, its unit, its position in the assembly, and the product it links to. Anyone who views your product page source can read them.

Two things follow. Do not put cost codes or supplier names in a part's **label** - it is shown to shoppers and it is public either way. And do not carry the "SKUs are stripped" conclusion across to the manufacturer code field on an option, which is [published in full](/learn/3d-bits/composer/gui/controls#naming-and-pricing-options).
:::

The SKU still reaches you, in the parts export on the order page - it simply never reaches the shopper's browser, and it is on no order property and in no PDF.

### Downloading or copying is a different path

"Removed on publish" means removed by publishing. **Download scene config** and **Copy to clipboard** give you the configuration as it stands, SKUs included, because the documented uses for those files - a backup, moving a project to another store, sending it to support - all want them.

If any part has a SKU, Composer asks before it hands you the file, and you choose. Keep them for a backup. Remove them if you are going to paste the file into a product metafield by hand through the [older metafields workflow](/learn/3d-bits/admin/metafields), since anything pasted onto a product is downloaded by every visitor to that page.

**Download project file** never asks and never strips: it exists to restore your work exactly, and a backup missing your part numbers is not a backup.

## What publishing refuses

Publishing stops rather than going live with parts that could not be charged correctly. It refuses:

- a part carrying **both** a typed price and a linked product;
- a **fractional quantity** on a part you charge for;
- a **negative** price;
- a priced, unlinked part marked as **already part of the base price**, since that would quietly discard the price;
- a part that is **inside itself**, directly or through a chain.

## Where to go next

- [Pricing](/learn/3d-bits/composer/gui/pricing) - the base price, formulas and the rest of the tab next door.
- [Setting up pricing](/learn/3d-bits/pricing/setting-up-pricing) - the walkthrough, from nothing to a live price.
- [Linked products](/learn/3d-bits/pricing/linked-products) - charging through products you already sell.
- [Managing complexity](/learn/3d-bits/pricing/complexity) - how many parts and options a project can carry, and which choices are expensive.
