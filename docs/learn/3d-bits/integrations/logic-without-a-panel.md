---
sidebar_position: 3
title: "Logic Without a Panel"
sidebar_label: Logic Without a Panel
description: What Composer's Logic rules still do when 3D Bits draws no option panel and every choice comes from your theme or another app.
tags: [3d-bits, shopify, logic, integration]
---

# Logic Without a Panel

A configurator does not have to render anything. If every control in your configuration is set to **External** - each one bound by selector to a field your theme or your options app already shows - 3D Bits draws no panel of its own. The shopper sees your form, and only your form.

Your [Logic](/learn/3d-bits/composer/logic) rules still run. Not all of them can do everything, though, and knowing which half you have is the difference between a rule that quietly works and one that quietly does not.

## When your configurator is running without a panel

3D Bits renders a panel when either of these is true:

- at least one control has **Product page rendering** set to **Rendered by 3D Bits**, or
- the Layout tab holds anything besides plain control placements - a heading, an image, a price, an add-to-cart button, or a tab group with at least one tab in it.

If neither is true there is nothing to draw, and your rules run without one. It is always one or the other, never both.

This is worth checking rather than assuming, because a single rendered control anywhere in the configuration puts you back on the ordinary route where everything applies.

## What still runs

Everything that decides a **value** or changes the **3D scene**:

**Set a control's value**, and **reset it to its default**. The written value goes straight into the configuration and drives the model.

**Override the minimum, maximum or step** of a number or a slider. A value that falls outside the resulting range is pulled back into it.

**Selection fallbacks.** When a rule takes away the option that is currently chosen, the configuration falls back to the option you marked as the default, or to the first one still available. The scene follows the fallback, exactly as it would with a panel.

**Show or hide a 3D element** - a model, a part of a glTF file, a marker, a dimension, a decal or a light.

**Force a material variant**, or a **colour or texture variant**.

**Run a script**, on the plans that include scripting.

All three triggers behave normally: **on load** fires once when the page opens, **on change** fires once at the moment something changes, and **while matching** holds for as long as its condition is true. Conditions that look at what a value used to be work too, because the rule engine keeps its own history of every settled pass.

## What does not run

**Showing, hiding, enabling or disabling a control or an option.** These need a control that 3D Bits draws. A dropdown that belongs to your theme is not ours to grey out, so the effect is evaluated but nothing changes on screen.

The value half of the same rule still applies, and that gap is the thing to watch:

:::warning Your form keeps showing the choice the rule removed
Say a rule disables the oak finish above 200 cm. Without a panel, the theme's own finish picker still shows oak, and still shows it as selected. The configuration falls back to another finish, so the 3D model changes - but the shopper's form was not touched, and it is your form that submits to Shopify.

If your rules take options away, either render the affected controls in 3D Bits so the shopper sees what happened, or reflect the same restriction in your own form.
:::

**Messages.** A **Show a message** effect has nowhere to appear. With [Debug Mode](/learn/3d-bits/tutorials/getting-started/common-settings#enable-debug-mode) on, messages are printed to the browser console instead, which is how you confirm a rule fired - but the shopper sees nothing.

**Blocking add-to-cart with an error message.** With no panel there is no add-to-cart button of ours to block. Publishing refuses that combination outright when the configuration is priced, and names the rule:

> blocking logic messages cannot gate add-to-cart when no GUI renders on the storefront - render at least one control or layout element, or drop the blocking message

Rendering one control is usually the better answer, because the shopper then sees the reason as well as the refusal.

:::info Configurator pricing needs a rendered panel too
3D Bits attaches the information a configured price needs to your product form only when it renders something on the page. A configuration that draws no panel therefore does not charge configured prices - the shopper buys at the product's own price, through your theme's own add-to-cart button.

That is the right arrangement when another system already owns the price, which is the usual reason for running this way. If you want 3D Bits to price the configuration, render at least the controls that carry money. See [Pricing](/learn/3d-bits/pricing/overview).
:::

## Seeing what it is doing

Turn on **Debug Mode** in the project's Storefront settings, open a product page and open your browser's console alongside the debug panel. The two show different things, and the difference is the point:

- The panel's **Live** tab lists the field names and values read from your page. It shows what is on the page, not what logic did with it, so a value a rule has overwritten still appears here as the shopper left it.
- The **console** shows what logic did. Every key whose settled value changed is printed as it changes, matched and fired rules are printed as a trace, and message effects are printed as they fire.

A rule that fights another rule warns in the console too, whether or not Debug Mode is on, naming the value the two disagree about. That is the signal to simplify rather than to add a third rule.

Turn Debug Mode off before the page goes live. The panel is visible to shoppers.

## Where to go next

[Custom Forms](./custom-forms) is the contract your form has to meet for any of this to read correctly. [Using Another Options App](./when-you-need-another-app) covers running 3D Bits beside an app that renders the form for you. [Logic](/learn/3d-bits/composer/logic) covers writing the rules themselves.
