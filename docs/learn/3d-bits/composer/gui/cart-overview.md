---
sidebar_position: 8
title: "Cart Overview"
sidebar_label: Cart Overview
description: The summary card 3D Bits draws under each configured line on the cart page, and how to make it match your theme.
tags: [3d-bits, composer, gui, cart]
---

# Cart Overview

When a shopper configures a product and adds it to the cart, the cart line shows a price with
nothing explaining it. Shopify renders the bundle parent, and the parent carries only the machine
attributes 3D Bits needs - not the readable choices the shopper made.

The **Cart Overview** card fills that gap. It sits under the cart line, collapsed, showing how many
options were configured. Opening it reveals the choices with their swatches, images and prices, the
price breakdown, a picture of the configured product, and a link back to the configurator.

It is available on every plan, and it is on by default.

## Where the card gets its information

Nothing extra is published for it. The card reads the product's own published scene - the same file
the product page renders from - and the shopper's choices, which travel on the cart line itself.

That has two consequences worth knowing:

- **Editing the card takes effect on the next publish**, like any other scene change.
- **A product that has never been published shows no card**, because there is no scene to read.

## What the table shows

| Setting | What it does |
|---|---|
| **Draw the summary card** | Turn the whole card off and leave the cart line exactly as your theme renders it. |
| **Open the table on load** | Show the options expanded instead of waiting for a click. |
| **Image or colour swatch** | The small cell before each option, showing that option's image, or its swatch colours when it has no image. |
| **What each option adds** | The price difference beside each choice. |
| **Header row** | A row naming each column. Off by default - a short table of choices usually reads better without one. |

When the header row is on you can retitle each column. Leave a box empty to keep the built-in
wording, which is translatable like every other built-in string.

## Money rows

The card can print the parts of the price that are not attached to a single option, so the lines
add up to the total the shopper sees:

- **Base price** - the starting price before any choices.
- **Price formulas** - anything computed from the configuration, such as a length or an area.
- **Priced parts** - the individual parts a configuration is made of.
- **Total** - the sum.

:::tip Leave the base price on
Without it, the listed options will not add up to the total, and a shopper who checks the
arithmetic will think something is wrong.
:::

These rows only appear when pricing is switched on for the project.

## Colours

Every colour is optional. Left blank, the card follows your GUI theme, so a configurator you have
already styled produces a matching cart card with no extra work.

- **Accent** - the expand button and the back-to-configurator link. Follows the theme's accent.
- **Outline and dividers** - the table border and the hairlines between rows. Follows the theme's border colour.
- **Alternating row** - the tint on every second row. Derived from the outline colour by default.
- **Table background** - transparent by default, so the cart row shows through.
- **Text** - deliberately **not** taken from the theme.

:::warning Why text colour is different
A configurator panel that floats over a dark 3D scene usually has light text. A cart page is not a
3D scene. Left blank, the card inherits the text colour your store theme already uses for that row,
which is readable on both light and dark themes. Set it only if you have a specific reason.
:::

If you use theme variants, **Take defaults from theme variant** picks which one the card follows.

## Shape and size

Borders, corner rounding, text size and row density. Two of these are worth explaining:

**Row density** switches between comfortable padding, which matches the option panel, and compact,
which suits carts with many lines.

**Stacks below** is the width at which each row stops being a table and starts stacking its label
over its value. It is measured **on the card itself, not on the browser window**. That matters: a
cart drawer is often only 400 pixels wide on a full-size desktop screen, and a card that asked the
window would try to fit four columns into it. Because the card asks its own width, a narrow drawer
stacks exactly the way a phone does.

## Snapshot and reopen link

The card can show the captured picture of the configured product, and a link that reopens the exact
configuration in your configurator.

The reopen link is worth keeping on. 3D Bits also rewrites the theme's own product link on the cart
line, but that depends on recognising your theme's markup. The button inside the card is drawn by
3D Bits, so no theme can defeat it.

## Where it appears in the cart

Most stores need nothing here. 3D Bits finds each configured cart line by the key the cart gives it,
then works outwards to the element your theme uses as that line's row, and puts the card there. On a
cart laid out as a table the card gets its own full-width row beneath the line, so it is never squeezed
into the product column.

Every field in this section is an escape hatch for a theme the automatic detection reads wrongly. They
are CSS selectors, and a bad one is ignored rather than breaking the cart.

**Show the card in** decides what happens when your theme draws the same cart line twice - which most
do, once on the cart page and again in the slide-out cart drawer. Left on the default, the card goes to
the copy outside the drawer whenever there is one, and to the drawer when the drawer is the whole cart.
Pin it to one or the other if you prefer, or pick "everywhere the line appears" to have it in both. The
reopen link is rewritten on every copy regardless.

**Cart line row** names the element that wraps one line - `tr` or `.cart-item`, for example. It is
matched outwards from that line's own quantity or remove control, so it can only ever find that line's
own container: one selector serves every line in the cart. A selector that turns out to wrap more than
one line is ignored, because a card that showed one shopper's choices against another line would be
worse than no card.

**Anchor inside the row** and **Position** place the card against a particular part of the line instead
of at its end. With no anchor set, the position is measured against the line itself.

**Reopen link** names the link that should reopen the configurator with the shopper's choices, for
themes whose product title is not an ordinary product link - a bundle parent, say. 3D Bits never
rewrites your theme's Remove or quantity links, however broad a selector you give it.

**Snapshot image** names the picture the captured configuration should replace, for lines that render
several images and where the automatic guess picks the wrong one.

If you set any of these, open your cart with a configured product in it and check the result. Nothing
here changes what a shopper is charged.

## Translations

The card's own words - the summary line, the back-to-configurator label, and the built-in column
headers - appear in the translations dialog under `cart.builtIn`, alongside every other string.

A column title you type yourself in this tab replaces the built-in header for that column. It is not exempt from translation, though: your typed title appears in the same dialog under `cart.columnLabels`, so you can give it a translation for every language you support, exactly like a control's label.
