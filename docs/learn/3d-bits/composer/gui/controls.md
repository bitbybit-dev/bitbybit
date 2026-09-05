---
sidebar_position: 1
title: "Controls"
sidebar_label: Controls
description: The dropdowns, swatches, sliders and fields your shoppers use to configure your product.
tags: [3d-bits, composer, gui, controls]
---

# Controls

Controls are what your shopper touches. Each one asks a question about the product, and the answer drives the 3D model, the price, or both.

You add them in the **Controls** tab of the GUI section. Give each one a label, since that is what your shopper reads, and a set of choices where it has them.

## Every control has a key

Alongside the label, every control carries a **Key** - a short identifier shown under the label with a pencil beside it. Composer creates one for you, so you can ignore it for a while, but it is worth knowing what it is.

The key is the name everything else in the project uses to refer to this control: a visibility condition, a [logic](/learn/3d-bits/composer/logic) rule, a pricing formula, a part's quantity expression, a focal's trigger, and the Layout element that places the control on the page. The label is only ever wording - changing it breaks nothing.

A key may be at most **24 characters**, made of letters, digits and underscores, and must start with a letter or an underscore. It has to be unique in the project. The limit is tight on purpose: the key travels with the configuration, both into the order data and into the shareable link, so a short one keeps both small.

Renaming is safe. Composer rewrites every reference for you - conditions, formulas, expressions, triggers, element links and your translations - across the whole project, not just the GUI section. It refuses a name that is too long, malformed, or already taken, and tells you why rather than half-applying it.

:::note What a rename cannot reach
Anything that has already left the project. A configuration link a shopper saved before the rename no longer carries that control's choice, and orders already placed keep the old name. [Scripts](/learn/3d-bits/composer/scripting) are a separate case again - they receive your controls by label, not by key.
:::

## A description for the paperwork

Under the label sits an optional **Description**, a sentence explaining what the control is asking for. It is not shown in the configurator - the panel stays as uncluttered as you designed it - and it exists for the [PDF documents](/learn/3d-bits/composer/gui/pdf-reports), which can print it as a small line under that control's row when you switch description lines on.

It is worth filling in where a label alone is ambiguous to whoever reads the sheet rather than the screen: "Length" means one thing to the shopper choosing it and another to the person cutting the material. Like the label, it is translatable.

## Drawn by 3D Bits, or bound to your theme

**Product page rendering** decides who draws the control on the live product page.

**Rendered by 3D Bits** is what a control you add here starts as. The app draws it, in Composer's preview and on the storefront, styled by your Style tab. This is the normal choice and everything else on this page assumes it.

**External** means the control already exists on the page - it belongs to your theme, or to a product options app you already use - and 3D Bits only reads it. Choosing this reveals a **Selector** field, where you put a CSS selector that finds the element at runtime. See [Custom forms](/learn/3d-bits/integrations/custom-forms) for what the app can read and how it listens for changes.

The distinction matters most for conditions. On a rendered control, a visibility condition is live everywhere - the preview and the product page both obey it. On an external control it applies in Composer's preview only, because the theme owns whether its own inputs are on the page. An availability condition on an external control is best effort: the app disables the element it matched, and nothing more.

## Choosing from a fixed set

**Dropdown** is compact and right when there are many choices or when the choice is not the interesting part of the page. Ten wood species belong in a dropdown.

**Radio buttons** show every choice at once, which suits two to five options where you want the shopper to see the range. They make choices feel considered rather than hidden. You can also allow deselecting, so clicking the chosen option again clears it - useful when having no answer is a real answer.

**Checkboxes** are for independent extras, where any combination is allowed. Add a cable channel, add felt feet, add a care kit. Turn multiple selection off and they behave like radio buttons instead; leave it on and you can require a minimum number of ticks, or cap the maximum.

**Switch** is a single yes or no, presented as a toggle. Assembled or flat packed, with or without a lid. It can carry a price of its own for when it is on.

## Numbers and free entry

**Range slider** is for a continuous measurement, like width or length. It pairs naturally with a pricing formula, so the price moves as the shopper drags. Set sensible minimum, maximum and step values, because a slider that allows a 3 mm shelf is a slider you will regret. A **Unit** is shown after the number in the readout and the scale labels - it is a label only, and the value stays a plain number.

**Number** is the same idea when the shopper knows the figure they want and would rather type it than aim at a slider.

For both, the fixed minimum, maximum and step can be replaced by an **expression** over your other controls, so a depth can be capped at half the width. When a recomputed bound excludes the current value, the value is pulled back inside it.

**Text** collects a line of words, most often a name or a short message for engraving or printing.

**Textarea** is the same for longer text, such as delivery notes or a message on a plaque.

**Date and time** collect a date or a time, for products where a delivery day or an event time is part of the order.

**Email** collects an address, validated as one.

**File** lets a shopper upload their own artwork. Combined with personalisation on the Pro plan, an uploaded image can appear directly on the product.

**Colour** gives them a colour picker for products where you genuinely offer any colour rather than a chosen range.

**Button** is not a question. It performs an action: the default emits a pulse each click, which a focal or a script can react to, or you can pick **Reset all options to defaults**, **Download the customer PDF report**, or **Download the 3D model (GLB)**. A button carries no value, no price and no order data, and it is never validated.

The two downloads need the **Pro** plan. On any lesser plan both carry a premium badge in the action list and choosing one opens the upgrade dialog instead of setting it. The PDF download also needs the customer document switched on under [PDF Reports](/learn/3d-bits/composer/gui/pdf-reports) - a button with nothing to generate stays inert.

**Download the 3D model** hands the shopper a single `.glb` of what they are looking at - every model currently visible, in the position it is on screen, with the materials they chose baked in. It is a snapshot, not a configurator: the file carries the one chosen material per part, so a shopper cannot reopen it elsewhere and switch variants. Personalisation the shopper applied to the product **is** included - an engraved name or an uploaded logo projected onto the model comes through, because it is part of what they bought. What is left out is the scenery around the product: the background and skybox, points of interest, dimension annotations, and the cameras and lights. A ground plane you modelled and uploaded is a model like any other, so it is included; hide it with a variant if you would rather it were not. You can set the file name; it defaults to `model.glb`.

**Compress with Draco** is worth switching on when your models are heavy - it usually shrinks the download several times over. The trade is compatibility: Blender, three.js and the common glTF viewers read Draco files, but some software does not, and macOS Quick Look is the one your shoppers are most likely to hit when they double-click the file. Leave it off if you expect people to peek at the model with their operating system's own preview. The first export on a page also downloads the ~430KB Draco encoder into the shopper's browser, because the compressing happens there; if it cannot be fetched the file is exported uncompressed rather than failing. This action needs the **Pro** plan. On any lesser plan it carries a premium badge in the action list and choosing it opens the upgrade dialog instead of setting it, and publishing is refused as well - so a button that would do nothing on the storefront never reaches one.

## Making the choices look like the product

For dropdowns, radios and checkboxes, you can change how the options are presented, and this is where a configurator starts to look considered rather than generic.

Plain **text** is the default. **Colour swatches** show the actual colour, which is the only sensible way to pick between fifteen paints. An option can carry more than one colour, drawn as a segmented swatch, which is useful for a two-tone finish or a patterned fabric.

**Image swatches** show a picture per option, which is what you want for wood grain, marble or textile, where a colour name tells the shopper nothing. Swatch and image modes fall back to one another per option, so an option with no picture shows its colour instead of a gap.

**Cards** give each option a roomy tile with its image, for choices that need explaining. A **Card shape** setting sets the proportions of those images for this control alone, so a portrait fabric picker and a wide lifestyle-shot picker can live in the same panel. **Buttons** and **pills** are compact labelled shapes, good for sizes.

Dropdowns have their own presentation choices, including a styled list that matches your theme rather than using the browser's native list, and a version that shows an image beside each entry.

Whichever you pick, an option's **description** is shown. There is nothing to switch on: where the option is a row of text it appears as a second line under the label, where it is a swatch or a chip it appears in the tooltip, and in a plain dropdown it is added to the option's text. Keep descriptions to a phrase - a swatch tooltip is not the place for a paragraph.

## Naming and pricing options

Each option has a value, which is what the configurator matches against, and a label, which is what the shopper reads. Keep values simple and stable, and put the nice wording in the label.

Options can carry a price, which is the amount that choice adds to the total, covered in [Pricing](/learn/3d-bits/pricing).

On the Pro plan an option can also point at **real products in your catalogue**, so choosing it adds your actual stocked items to the order. One option can carry up to ten of them, each with its own quantity - which is how "Oak leg set" becomes four legs and a bracket kit on the picking list. Linking more than one product to a single option decides how the order is charged, so read [Linked products](/learn/3d-bits/pricing/linked-products) before you do it.

Ticking **Quantity** on an option lets the shopper choose how many of it to add, with a `+/-` stepper that appears once they select it. The price beside the option is then charged for **each one**. You set **Max** (required, and enforced at checkout), **Min**, **Step** and **Start at**, and a button copies those settings to every option in the control. A shopper-chosen quantity also affects how the order is charged, so it is worth reading the same page.

There is also a manufacturer code field, which is never shown to your shopper but does appear on the order document your workshop receives, so the person making the thing sees "RAL 9005" rather than "Soft black".

:::warning This field is not private
It is never displayed to a shopper, but it **is** published. The configuration your product page downloads carries it, so anyone who views the page source can read it. Use a reference you are happy to publish - a RAL or Pantone code is exactly right. Do not put supplier names, cost codes or internal part numbers here.
:::

## Showing an option only when it applies

An option can be set to appear only under certain conditions, so a lining colour is offered only once the shopper has chosen a lined version. The same applies to whole controls.

For simple dependencies, set the condition on the control or the option directly. For anything involving several things at once, [Logic](/learn/3d-bits/composer/logic) is the better tool.

:::note A greyed-out choice is never charged
Disabling cascades: switch off a section and everything inside it is greyed out too, however deeply nested. Anything a shopper cannot reach is also not charged for, since billing someone for a choice they could not make would be wrong.
:::

## Hiding versus greying out

Every control, and every option inside it, carries two independent conditions, and they answer different questions.

**Visibility** takes the choice off the page. Use it when the choice is irrelevant - a lining colour on an unlined bag is noise, not information.

**Availability** - the *Enabled when* condition, with a **Disabled hint** beside it - leaves the choice on the page and greys it out. Use it when the absence itself is worth knowing: a size you do not make in that material is better shown crossed out with "not available in oak" than quietly removed, because a shopper who cannot find an option assumes you do not offer it at all.

Both stop the choice being charged. A hidden option never prices, a greyed one never prices, and checkout applies the same conditions, so what the shopper saw and what they pay cannot drift apart. A hidden or disabled control is also skipped by validation, so a field marked required that the shopper cannot reach never blocks Add to cart.

A disabled choice can never stay selected. If the shopper has already picked something and your condition then turns against it, **When the selected option becomes disabled** decides where the selection goes: *Switch to default option* moves to the option you marked as the default, or to the first one still available, and *Clear the selection* empties the control - which only truly empties it on a control that allows deselecting, and otherwise falls back the same way.

## What reaches the order

Under **Order data**, a rendered control decides what your fulfilment team sees.

**Save the selected value on the order** writes the shopper's choice as a line item property, so it appears under the cart line and on the order. It is on by default, because the choices a shopper made are the point of the order. **Property name** changes the wording shown there, defaulting to the control's label. **Visible to the shopper in cart and checkout** can be unticked to keep a value on the order while hiding it from the cart and checkout display - useful for something you need internally that would only confuse a shopper.

A **File** control has its own switch instead: **Attach the uploaded file to the order** sends the file through Shopify's native cart upload, so you receive a link on the order. It is on by default.

Buttons carry no order data at all. External controls carry none either - they are your theme's own inputs, and they already reach the order the way your theme sends them.

:::warning Order data hides the express checkout buttons
Shop Pay, Apple Pay and the other accelerated buttons take a shopper from the product page straight to checkout, skipping the cart - which is where this data is attached. So as soon as anything in your configurator writes to the order, the app hides those buttons by default rather than letting a configured product be bought without its configuration. If you want them back, that is a decision to make deliberately, knowing what is lost.
:::

## Validation

Controls can require an answer, and text fields can be limited in length or checked against a pattern. If something is required and missing, the shopper is told rather than being allowed to buy the wrong thing.

Each rule can carry your own message, or use the built-in one. Your messages are translatable along with everything else.

There is a validation summary element you can place in the layout, which collects every outstanding problem in one spot instead of leaving them scattered.

## Keeping it manageable

The temptation with a good configurator tool is to expose everything you are capable of making. Resist it a little. A shopper facing forty controls buys nothing, while the same product with six well-chosen questions sells.

If you genuinely have many options, group them with sections, accordions or tabs in the [Layout](/learn/3d-bits/composer/gui/layout) tab, and consider hiding advanced ones behind a condition until they are relevant.
