---
sidebar_position: 9
title: "Personalisation"
sidebar_label: Personalisation
description: Putting a shopper's own text or image onto the product itself, printed or engraved on the surface.
tags: [3d-bits, composer, personalization]
---

# Personalisation

:::info Pro plan
:::

A shopper types their name and sees it on the product. Not next to it in a text box, but on it, following the curve of the surface, in the position it will actually be made.

That is what personalisation does, and it is the difference between "we will engrave this for you" and a shopper who can already see theirs.

The section holds a list of **decals**. Each one is either an image decal or a text decal, and each one is bound to a control in your panel. You can name them, reorder them, clone one to make a near-identical second, and remove them.

## Text

Add a text decal and bind it to a control. Whatever the shopper types appears on the model.

A text decal accepts a **text** or **textarea** control. The **Create** button beside the field makes one for you, already of the right type, and jumps you to it on the Controls tab so you can finish naming it.

Three fields shape what is drawn:

- **Fallback text** is what appears before the shopper has typed anything. Leave it empty and nothing is drawn until they type.
- **Max characters** truncates what is drawn. It is a safety net on the decal, not a limit on the field, so set a maximum length on the control as well if you want the shopper to be told.
- **Font size (px)** sets the size of the rendered lettering inside the projection box.

### Fonts and colour

Fonts are registered once for the whole project, in the **Style** tab of the GUI section, and the same list serves text decals, your panel's typography and any font picker control. Personalisation has a **Manage fonts** button that takes you there, and shows you which fonts are currently registered.

Each decal then has its own **Supported fonts** list, chosen from that registry. The first one in the list is the default, and you can drag them into the order you want. If you leave the list empty, the decal renders in the browser's default sans-serif rather than in any font you registered - so add at least one if the lettering matters.

To let the shopper choose, bind a **Shopper font control** - a dropdown or a radio group. **Create** builds one with an option per supported font and variant. If you later add or remove a supported font, the control's options no longer match, Composer says so, and **Sync** rewrites them.

Colour works the same way: a **Text colour** to use by default, and an optional **Shopper colour control** that overrides it live.

## Images

An image decal works the same way, with the picture coming either from you or from the shopper.

An image decal binds only to a **file upload** control - that is the one control type the field offers. The shopper uploads a logo, it appears on the product, and the uploaded file travels with the order so you have the original to print from.

For a fixed set of designs, do not try to bind the decal to a dropdown; it will not accept one. Instead make **one decal per design**, give each its **Fallback image URL** pointing at that artwork, and put a condition on each so only the right one is showing. The shopper picks from an ordinary dropdown of your own making, and you never have to accept an arbitrary upload.

The fallback URL is also the sensible default for an upload decal on its own: it is what the model shows before anything has been uploaded.

:::warning Uploads and express checkout
An uploaded file reaches you through the platform's own cart upload, which the accelerated checkout buttons - Shop Pay, Apple Pay and the like - bypass entirely. That is why the app's default **Theme product controls** setting hides those buttons when your configuration is saving data on the order. Leave that on, or hide the buttons yourself, or the file will not arrive. The upload itself is set up on the control, not the decal - see [Controls](/learn/3d-bits/composer/gui/controls).
:::

### Recolour

One piece of artwork can serve every colour you sell. Set a recolour mode on an image decal (the section is labelled **Recolor** in the editor) and the colour comes from you, or from the shopper, rather than from the file.

There are two modes.

**Solid colour** repaints every visible pixel in the chosen colour. This is the right choice for a flat one-colour logo or a monogram.

**Multiply** tints the artwork while keeping its own shading, so gradients and shadows survive. It cannot lighten, though: multiplying a black logo by any colour leaves it black.

Both modes read the shape of the artwork from its **transparent background**, so this needs a PNG with real transparency. A logo saved on a solid white background cannot be recoloured - the whole square is opaque, so the whole square gets painted.

As with text, you set a default colour and can optionally bind a **Shopper colour control**. Recolouring is instant when the shopper changes it, with no reprojection.

## Placement

Decals project onto the surface, so they follow curves rather than floating flat. On a curved mug or a moulded case, that is what makes it look real.

A decal is positioned by a projection box, described by three fields:

- **Position** is where the centre of the box sits.
- **Box size (X, Y, Depth)** sets how large the decal is and how deep it projects. Depth matters: the decal only lands on surfaces the box actually reaches.
- **Projection direction** is the direction the box projects along, which is what makes the artwork wrap correctly rather than smear.

You can type these numbers directly, and you can drag them. Clicking into any of the three groups raises the matching handle in the 3D view - a move gumball for position, a scale box for the size, a direction handle for the projection - so typing and dragging are two ways at the same value.

Separate from the direction is the **Projection angle**, a single number in degrees. It spins the artwork around the projection axis without changing where the box points. Getting the direction right is what makes the wrap look correct; the angle is how you get the lettering level once it does.

A decal lands on every **visible** mesh the box overlaps, across every model in the scene. It is not tied to one model, which is what lets a logo cross a seam between two pieces of the model - and also why it is worth checking the result from several angles once the box is roughly right.

Like everything else, decals can be conditional, so the engraved version shows the engraving and the plain version does not. They can also carry transform variants, so the same decal can move, resize or spin when the configuration changes rather than needing a second decal.

## Practical advice

**Set limits on the text.** A name field with no length limit will receive a paragraph, and it will not fit. Set a maximum length on the control, and check the longest allowed string still looks right.

**Decide what you will accept before you offer uploads.** A shopper uploading a photograph for laser engraving will be disappointed by the result. Say what works, in a message element next to the control, before they upload rather than after they order.

**Charge for it.** Personalisation is work, and it makes the item non-returnable. Attach a price to the option that enables it.

**Check it in Play.** Type the longest name, the shortest name and an awkward one with unusual characters, and look at all three on the model.

## What your workshop sees

The shopper's text and their uploaded file both travel with the order. The [Order review](/learn/3d-bits/admin/order-review) page shows exactly what was configured, and the order PDF can carry it in a form suitable for whoever makes the thing.
