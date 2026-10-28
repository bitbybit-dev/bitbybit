---
sidebar_position: 5
title: "Parts: The Bill of Materials Behind a Configured Product"
sidebar_label: Parts
description: List what the configured product is made of, charge for the pieces you ship, and record the ones you only need on the works order.
tags: [3d-bits, composer, gui, pricing]
topic: composer.gui.parts
type: how-to
---

# Parts

:::info Pro plan
Parts need the Pro plan.
:::

A part is something the configured product is **made of** - a panel, a hinge, a mounting kit, a length of edge banding. The Parts tab of the GUI section is where you list them, and where you say when each one is included.

This is the difference between parts and priced options. An option is a question you ask the shopper, and it charges when they choose it. A part is a fact about the product, and it appears whenever its condition holds, whether or not the shopper knows it exists.

## Charged, or only recorded

Every part is one of two things, and the difference is simply whether money is involved.

**Charged.** You link it to a real product in your store, let the shopper's choices [pick one of your variants](#parts-from-your-variants), or type a price on it. A linked part is charged at that product's price, ships as its own line on the order, and decrements your stock. A part with a typed price but no product is charged too, but nothing ships for it - use it for a cost that is real but has no item behind it.

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
| **Already part of the base price** | With Bundled parts charging, the part still ships and still decrements stock, but adds nothing on top of your base price. Product lines refuses it on a linked part - see [below](#already-part-of-the-base-price). |
| **Included when** | The condition that decides whether the part is in this configuration at all. |
| **When it runs out** | Which shopper choices to cross out while this part cannot be sold. |
| **Only while** | The same, for a part that exists only under a combination of choices. |

### Linking a product

**Link product** points the part at something real in your catalogue. It is then charged at that product's price and it ships.

If you have typed a price and then link a product, the typed price is removed - a linked part is charged at its own product's price, and a part may not have two prices.

### Creating a product from a part

If a recorded part turns out to be something you actually sell, **Create product** adds it to your store and links it in one step. The product is yours: editable, sellable on its own, and reusable in other configurators. Its stock is left untracked so this configurator is never blocked by inventory you did not mean to manage - turn tracking on in Shopify when you are ready.

## A part that picks one of your variants {#parts-from-your-variants}

A part can be **one of the variants of a product you sell, chosen by the configuration**. A cabinet's body comes in sizes and finishes, and you already sell each combination as a variant of one product. Point the part at that product, tell 3D Bits which of your controls picks each of its options, and the configurator puts the matching variant in the cart.

The variant is charged at the price Shopify sets for it, and it reaches the order as your own product, so your stock counts stay right. It needs **Product lines** charging - see [Charging methods](/learn/3d-bits/pricing/charging-methods).

### Setting one up

1. On a part, choose **Pick a variant**. On a part with a price typed on it, the Composer asks first: the typed price is removed and the variant is charged at its own price.
2. Pick the product. 3D Bits reads its options and variants.
3. For each of the product's options, choose what picks it: one of your dropdowns or radio groups, or **Always** and one value.
4. Match each choice of that control to one of the option's values. Names that already match are filled in for you. Set a choice you do not sell to **Not sold**.

The part keeps everything else a part has: its condition, its quantity or quantity expression, and its place in an assembly. Several parts can pick from the same product - a left and a right door, say. A part cannot pick from a product that is itself a configured product, or from the product this configurator sits on.

The **Refresh** button beside the product's name reads its variants from Shopify again and keeps the matches that still fit. The unlink button beside it stops the part picking from that product, and asks first.

### Reading the summary under the part

A line under the part counts the combinations your choices can reach that have a variant, the ones that have none - shoppers see those crossed out - and any variant of the product no choice reaches. It also names what publishing waits on:

- **An option nothing picks.** Publishing waits until each of the product's options has a control or an **Always** value.
- **A choice its control no longer offers.** If you matched a choice to a value and then removed that choice from its control, the match stays in the list as a row such as *Walnut - no longer offered by the control*, with a remove button that asks first. Publishing waits until you remove it.
- **An optional control.** A radio group a shopper may leave empty is named too: leaving it empty picks no variant, so the shopper cannot add the configuration to the cart until they choose.

A choice set to **Not sold** never stops publishing.

### What shoppers see

- The part is priced at the variant's price in Shopify, in the shopper's currency.
- With **Disable options that cannot currently be sold** switched on in the [Pricing](/learn/3d-bits/composer/gui/pricing) tab, a combination you do not sell - no variant in Shopify, or set to **Not sold** - is treated like a sold-out part, and so is a variant that sells out: the configurator crosses it out, or changes another choice to reach a combination you sell, as described under [When it runs out](#when-it-runs-out).
- With it off, the combination stays selectable, and Add to cart tells the shopper *"This combination of options is not sold - please choose different options and add it to your cart again."*
- When your parts can pick more than 500 variants between them, the configurator checks stock only for the variants the shopper's choices pick, so a sold-out variant shows once the shopper's choices reach it.

### When you change the product in Shopify

| Change | What happens |
|---|---|
| A variant's price | Followed at once: the configurator shows it and checkout charges it |
| A new variant | Not sold until you **Refresh** the part and publish. Publishing warns about it |
| A variant deleted | That choice is treated as not sold. Publishing warns, and **Refresh** clears it |
| An option value renamed or removed | It no longer matches - publishing stops and names it. **Refresh** the part, match it again and publish |
| An option added or removed | Publishing stops and names it. **Refresh** the part, then match its options again |
| The product set to draft or archived, or taken off the Online Store | Publishing stops and names it. Make it active and sold on the Online Store, or remove the part |
| The product deleted | Publishing stops. Pick the part's product again |

### Limits

- Product lines only. Bundled parts refuses such a part, and Single line moves the project to Product lines.
- Each such part takes a little more room in the cart than other lines, so many of them lower how many configured items one cart can hold - see [How many configured items fit in one cart](/learn/3d-bits/pricing/charging-methods#cart-capacity). Publishing tells you the number, and refuses a configuration that could not fit even once.
- Very many choices matched to variants, beside many products the configurator charges, can take more room than checkout reads for one product. Publishing stops and says so: match fewer choices, or charge fewer products.
- A configuration with such a part checks out only as one combined line, and Shopify combines a line of at most 2,000 units. Publishing stops when one line of the group could carry more, and names the configuration.
- A part cannot pick a variant this configurator also charges another way, through an option or another part's link.
- Such a part cannot be **Already part of the base price** - the Composer says so under the part if it is ticked.
- Any number of configurators can pick the same variant.

[Pricing troubleshooting](/learn/3d-bits/pricing/troubleshooting#parts-picked-from-your-variants) lists what each publish message about these parts means.

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

## Already part of the base price {#already-part-of-the-base-price}

Tick this when the base price you typed already covers the part.

With **Bundled parts** charging, the part still ships as its own order line and still decrements stock. It simply adds nothing on top. Use it when your base price is the price of the whole default configuration rather than of a bare product.

With **Product lines** charging, publishing refuses it on a part that links a product or picks one of your variants. There the base price is your product's own price in Shopify, and a linked part reaches the cart at its own price, so it cannot also be inside the base price. Untick it and lower the base price by what the part costs, so shoppers pay the same as before.

## When it runs out

Tell the configurator which shopper choices this part depends on, for when your catalogue says it is sold out. There are two ways to write it, and they behave differently.

**A list of choices** suits a part that one choice decides. While the part is sold out, every choice in the list is crossed out, and a shopper who is already on one is moved off it - the choices are tried in the order you listed them - with a short note saying what changed.

**Only while** suits a part that a combination decides, and is described [below](#a-part-that-exists-only-under-a-combination). Nothing is crossed out outright: the configurator keeps what the shopper just picked, changes as few of the named choices as it can to reach a configuration you can sell, and tells the shopper what changed.

With **Only while**, or with nothing named at all, shoppers see three kinds of choice:

- **Available** - picking it changes nothing else.
- **Marked** - it is out of stock with their current choices, but picking it still works: the configurator changes another choice to make it sellable. The choice is dimmed and its tooltip says what picking it changes, for example *Out of stock with your current choices - picking it changes Finish to Walnut*. After the click, a note beside Add to cart says what changed, and the choice that changed is briefly highlighted.
- **Crossed out** - nothing can make it sellable, so it cannot be picked.

A tick box add-on never changes the main choices: if its kit is sold out for the current size, the add-on is crossed out rather than switching the size.

:::caution Two things have to be true before this field does anything
The part has to **link a store product** - a part with a typed price has no stock to run out of - and the project has to have **Disable options that cannot currently be sold (live catalog)** switched on in the [Pricing](/learn/3d-bits/composer/gui/pricing) tab. With either of those missing, filling this in is harmless but nothing is ever crossed out.
:::

Naming nothing is safe too: the choices the part is included for may change instead, just as with **Only while**, and a configuration that still needs a part you cannot sell is refused at Add to cart. When nothing may change, the shopper keeps what they picked and Add to cart tells them what is out of stock. A choice that needs an answer is never left empty to get around stock; an optional one may be cleared, and an add-on switched off.

### A part that exists only under a combination

Take a handle that comes in two finishes. If the brass bar handle is sold out, a list naming **Bar** would cross it out, and that is too much: the steel bar handle is in stock and perfectly sellable.

**Only while** is that case. Give it the same condition you would write in *Included when* - `Handle Equals Bar` **and** `Finish Equals Brass` - and the choices it names are the ones that may change, in the order written. A shopper on brass who picks **Bar** keeps Bar and is moved to steel, with a short notice saying so; **Bar** is only crossed out when no finish can make it sellable.

Only a choice written with **Equals** may change. Write it with **Includes** (or any other test) and it becomes context: it still decides when the part is needed, but the configurator never changes it. Use that to protect a choice you never want moved.

**Copy from "Included when"** fills it in from the condition the part already carries, which is usually exactly what you want.

Two things to know. A choice named in *When it runs out* wins, so use one field or the other on a given part. And a condition written as a typed expression rather than with the condition builder names no choice that may change - there is no single choice to read out of an expression.

## Where your parts appear

- **The option panel**, if you add a **Parts list** element in the [Layout](/learn/3d-bits/composer/gui/layout) tab. It shows labels and quantities, and can show each part's picture, say what each part costs, fold away behind a toggle, and group rows the way the cart charges them. It never shows SKUs. The **Price** element can draw the same rows inside its breakdown instead - see [Layout](/learn/3d-bits/composer/gui/layout).
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

Checkout works out every part and every condition on it for each configured item, and that work is
budgeted. Publishing measures it and refuses a project that would not finish: as a guide, Bundled
parts holds about 130 linked parts charged at once for one configured item (parts that exclude
each other on the same choice do not count together; fewer as a shopper buys more of it in one cart), and Single line about 300 parts, or about 200 when each carries a few conditions. When a
project is over, the message names what is costing the most - conditions, expressions, or the parts
a bundle has to nest.

Publishing stops rather than going live with parts that could not be charged correctly. It refuses:

- a part carrying **both** a typed price and a linked product;
- a **fractional quantity** on a part you charge for;
- a **negative** price;
- a priced, unlinked part marked as **already part of the base price**, since that would quietly discard the price;
- with Product lines charging, a part that links a product or picks one of your variants and is marked **already part of the base price**;
- a part that is **inside itself**, directly or through a chain;
- a part that [picks one of your variants](#parts-from-your-variants) with Bundled parts charging, or from a product that is itself configured, or from this configurator's own product;
- a part that picks one of your variants while one of the product's options has no control and no **Always** value, or while it matches a choice its control no longer offers;
- a part that picks a variant this configurator also charges through an option or another part.

The other refusals for parts picked from your variants - a product that changed in Shopify, a cart that could not hold one configuration - are listed in [Pricing troubleshooting](/learn/3d-bits/pricing/troubleshooting#parts-picked-from-your-variants).

## Where to go next

- [Pricing](/learn/3d-bits/composer/gui/pricing) - the base price, formulas and the rest of the tab next door.
- [Setting up pricing](/learn/3d-bits/pricing/setting-up-pricing) - the walkthrough, from nothing to a live price.
- [Linked products](/learn/3d-bits/pricing/linked-products) - charging through products you already sell.
- [Managing complexity](/learn/3d-bits/pricing/complexity) - how many parts and options a project can carry, and which choices are expensive.
