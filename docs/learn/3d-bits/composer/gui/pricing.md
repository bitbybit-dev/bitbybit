---
sidebar_position: 6
title: "Pricing in the Panel"
sidebar_label: Pricing
description: The Pricing tab in Composer - the base price, formulas, the floor your product's own price sets, and where to read about charging properly.
tags: [3d-bits, composer, gui, pricing]
---

# Pricing in the Panel

Pricing is a tab inside the GUI section, because a price is built from the same choices the panel collects.

The formula it works to is straightforward:

> base price, plus the amounts on the options chosen, plus any formulas, plus any parts the configuration includes, multiplied by a set multiplier if you have one.

You turn it on in the **Pricing** tab and set the base price there. The amounts attached to individual options are set on the options themselves, back in the [Controls](/learn/3d-bits/composer/gui/controls) tab, since that is where those options live.

To show the total to your shopper, add a **Price** element in the [Layout](/learn/3d-bits/composer/gui/layout) tab. It can show an itemised breakdown, which is worth doing.

## Read this properly before you sell

Pricing is the part of 3D Bits where a mistake costs real money, and it has its own section covering how to set it up, how a configured price becomes a real Shopify charge, and what to check before going live.

**[Pricing](/learn/3d-bits/pricing)** is the place to go, and [Setting up pricing](/learn/3d-bits/pricing/setting-up-pricing) is the walkthrough.

## Your product's own price, and the floor it sets

Under the base price the tab draws a short table. It is the most useful thing on the page, and it is worth learning to read:

| Row | What it means |
|---|---|
| **The product's own price** | What the Shopify product the configurator sits on costs. |
| **Base price** | What you typed above. |
| **Products already in the base price** | Any parts you marked as already covered by the base price. |
| **The shopper sees** | The total for the cheapest configuration. |
| **The cheapest cart can collect** | The least the cart could actually charge for it. |

With **Product lines** charging, the product's own price is posted on every configured order and is never rewritten. So the last row is a floor: if what the shopper sees is below it, the cheapest configuration could not be added to a cart at all, and the tab says so in red.

Publishing enforces the same rule across every configuration a shopper can reach, and refuses rather than going live. The message names the figure your product should carry, and the project page can set it for you.

## What sits in this tab

**Formulas** price continuous choices, such as a width slider, using an expression over the shopper's values. This is what makes anything sold by size, length or area chargeable. Each formula can carry its own condition, so it applies only when it should.

**Quantity control** nominates one of your controls as a multiplier for the whole configured price - the way you price by area or by running metre.

:::warning This is not the purchase quantity
A quantity control multiplies the **price** of one configured set. It does not change how many you ship. If you want a shopper to buy six of what they configured, add a **Quantity** element in the [Layout](/learn/3d-bits/composer/gui/layout) tab instead.
:::

**Disable options that cannot currently be sold** checks the real products behind your priced options when the page loads, and greys out any that are out of stock or whose price no longer matches what you published. It only ever takes a choice away - it never changes what anyone is charged. You can write the message a shopper sees. See [Linked products](/learn/3d-bits/pricing/linked-products#showing-what-cannot-be-bought-right-now).

**Save the configuration on the order** writes the shopper's choices onto the order as line item properties, so your team can read what to make.

**How this will charge** is a summary of the way the current setup will actually collect money. It is the quickest way to confirm you have set things up the way you intended before publishing.

## The neighbouring tabs

**[Parts](/learn/3d-bits/composer/gui/parts)** is where the things the product is *made of* live - the pieces you ship and charge for, and the ones you only need on the works order. Parts used to sit in this tab and now have their own.

**Settings** holds two things about how a configuration is remembered: the **Order snapshot**, an image of the configured scene attached to the order, and the **shareable link**, which keeps the shopper's selections in the page URL so a link restores them.

**[PDF Reports](/learn/3d-bits/composer/gui/pdf-reports)** turns a configuration into a document, for the shopper or for the workshop.
