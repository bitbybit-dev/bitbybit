---
sidebar_position: 11
title: "3D Bits Shopify App - FAQ"
sidebar_label: "FAQ"
description: "Common questions about 3D Bits: building configurators without code, pricing what shoppers configure, the app embed, and working with your existing theme and apps."
tags: [shopify, 3d-bits]
---

import Admonition from '@theme/Admonition';

# Frequently Asked Questions

These are the questions merchants ask us most often, answered honestly.

<Admonition type="info" title="Don't see your question answered?">
  <p>If you have other questions or just need some initial guidance, please contact us, we're here to help you out!</p>
  <a href="mailto:info@bitbybit.dev">info@bitbybit.dev</a>
</Admonition>

---

### Can I use 3D Bits with no coding skills at all?

Yes. Everything most stores need is built without code.

You create a project in the app, open Composer, and upload your 3D model. From there you arrange the scene, build the panel of options your shoppers will use, and set what each option costs. Press Play to try it, then Publish to send it to your product pages. At no point are you asked to write anything.

Coding only enters the picture if your product is parametric, meaning the shape itself has to be calculated from the shopper's numbers rather than picked from models you prepared in advance. That is what the Scripting features on the Standard and Pro plans are for, and most merchants never need them.

---

### Do I need a separate app for product options or pricing?

No. 3D Bits builds the option panel and prices what the shopper configures, and Shopify charges that amount at checkout.

There are fourteen control types: dropdowns, radio buttons, checkboxes, switches, sliders, number fields, text fields, long text areas, email fields, colour pickers, date and time pickers, file uploads for shoppers sending you artwork, and buttons that trigger an action rather than carry a value. A radio or checkbox group can present its choices six ways - plain text, colour swatches, image swatches, cards, buttons or pills. You can group controls into sections, accordions and tabs, style them to match your theme, translate them, and show or hide options depending on what else the shopper picked.

On the pricing side you set a starting price, add an amount to particular options, write a formula for anything sold by size or length, and let a shopper choose how many of an option they want with a stepper that appears beside it. On the Pro plan an option can also point at real products in your catalogue - one option links up to ten of them, each with its own quantity - and you can build a parts list that turns every configuration into a bill of materials. See [Pricing](/learn/3d-bits/pricing) for how to set it up.

If you already run an options app you like, that still works. Leave configurator pricing switched off for those products and keep using it. You can mix the two across your catalogue.

---

### What is the app embed, and do I need it?

The app embed is a single switch in your theme that turns 3D Bits on for your whole store. Once it is on, every product you publish from the app shows its configurator automatically, and products you have not published are untouched.

It is the recommended way to run 3D Bits, and the app gives you a button that turns it on for you. You only need to think about theme blocks if you want the 3D view or the option panel in a specific spot in your template that the automatic placement does not reach.

See [Quick Start](/learn/3d-bits/quick-start) for how to turn it on.

---

### What happened to the Viewer Editor?

It is now called Composer, and it does considerably more than it did under the old name. Alongside the 3D scene, it is where you build the shopper-facing option panel, write the rules that connect options to each other, set your prices, design PDF documents, and preview the whole thing in Play mode.

Older tutorials and videos may still say Viewer Editor. It is the same tool, in the same place in the app.

---

### Should I build in Composer or write a script?

Start in Composer. It is the right answer for the large majority of products, including ones with a lot of options, because swapping between prepared parts of a 3D model is fast, reliable and easy to change later.

Reach for a script when the geometry has to be calculated. A shelf whose shape follows the exact width and height the shopper types, a part generated from an uploaded profile, anything where you cannot prepare the variations in advance. You build scripts in our visual node editor or in TypeScript, and then link them into a Composer project, so the option panel, the pricing and the publishing all stay the same.

---

### Can the price change with a slider?

Yes, and this is exactly what formulas are for.

Say you sell worktops by the centimetre. You add a width slider, write a formula such as `width * 2.5`, and the price follows the slider as the shopper drags it. The 3D model resizes at the same time. What they see is what Shopify charges.

Formulas can combine several inputs, round to sensible amounts, and apply only when certain other options are selected. [Setting up pricing](/learn/3d-bits/pricing/setting-up-pricing) walks through it.

---

### Will it work with my theme?

In almost all cases, yes. The app embed places the configurator next to your add to cart form, which every theme has, and you can point it somewhere else if you prefer.

Where themes differ is in how they present their own variant pickers. If you are letting Shopify variants drive the 3D model, 3D Bits reads your theme's own selectors, which works as long as the theme uses ordinary HTML form fields. Nearly all of them do. [How It Works](/learn/3d-bits/how-it-works) covers this and how to check.

If you build the whole option panel in Composer instead, this stops being a concern, because the panel is ours and nothing has to be read from the theme.

---

### I already use bitbybit.dev for my own projects. Can I connect those to Shopify?

Yes. On the Standard and Pro plans you can create a Script in the app using the same Rete, Blockly or TypeScript editors you already know, then link it into a Composer project and publish. The Composer project handles the scene, the options panel, the pricing and the product links, while your script does the geometry.

There is also a Preview block for simply embedding a published bitbybit.dev project on a page, which is useful for showing something off but does not react to product options.

---

### My store is managed by a development team. What are their options?

They can use everything above, and they may prefer to. Scripts written in TypeScript, options linked to real catalogue products, and the ability to drive the configurator from your own product form if you have built one, which is covered in [Custom Forms](/learn/3d-bits/integrations/custom-forms).

---

### We build stores for merchants. Is 3D Bits worth it for us?

We think so, mostly because of what you do not have to build. Model loading, the viewer, mobile behaviour, the option panel, the connection to Shopify variants, and the checkout side of configured pricing are all done and maintained.

That leaves your time for the parts that make each client's store theirs. And when a client wants to change an option or a price six months later, they can do it themselves in Composer instead of coming back to you.

---

### How good does my 3D model need to be?

Good enough to load quickly and look like your product, which is a lower bar than it sounds but not a trivial one.

The main things that matter are file size, sensible geometry, and objects that are separated the way your options need them. If your shopper picks legs separately from the tabletop, the legs need to be their own objects in the file. Our [3D Assets](/learn/3d-bits/3d-assets) guides cover how to prepare models, and we do model preparation as a paid service if you would rather not.

---

### What does 3D Bits not do?

It does not replace Shopify. Tax, shipping rates, discount codes, payment, fraud checks and refunds all stay exactly where they are, and we never process or hold money. 3D Bits decides what the configured product costs, and Shopify collects it.

One detail is worth knowing about tax. With Product lines charging (the default) or Bundled parts, part of the configured price is carried by helper products 3D Bits generates in your catalogue, and Shopify taxes those at your shop's default rate. If you rely on a reduced or zero rate set up as a tax override, it will not necessarily reach them, so check it before you go live - [Helper products](/learn/3d-bits/pricing/helper-products) explains what these generated products are.

It is also not a general page builder. It builds the configurator and its option panel, not the rest of your storefront.
