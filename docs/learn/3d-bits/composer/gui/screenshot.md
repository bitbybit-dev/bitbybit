---
sidebar_position: 11
title: "Screenshot"
sidebar_label: Screenshot
description: A button that saves a picture of the 3D view - as the shopper sees it, or from a view you name - at a size and shape the shopper can choose.
tags: [3d-bits, composer, gui, layout, camera]
topic: composer.gui.screenshot
type: how-to
---

# Screenshot

The **Screenshot** element in the [Layout](/learn/3d-bits/composer/gui/layout) tab gives shoppers a button that saves a picture of the product they configured, to keep, compare or send to someone. It needs the Standard or Pro plan.

## What the shopper can capture

- **The current view** - the 3D view exactly as the shopper sees it at that moment. It is on by default; switch **Offer the current view** off to offer only named views.
- **Named views** - views you set up, each pointing at a [focal](/learn/3d-bits/composer/navigation) for its camera and carrying the name shoppers see, such as "Front" or "Seat detail". When the shopper picks one, the camera flies there with an animation, a short flash marks the moment the picture is taken, and the file downloads. A focal that fits to models is refitted for the picture's shape, so the product stays framed even in a square picture.

With more than one choice, a dropdown beside the button lists them and shows the one selected; the button then takes that view. With a single choice the dropdown is left out and the button takes the picture at once. Shoppers who ask their device for reduced motion get a jump instead of the flight and no flash.

The names you give the views, the button text and the file name are translatable like every other text in the panel, under Style and Translations.

## Size and shape

- **Size** is measured along the longer side: HD is 1280 pixels, Full HD 1920 and 4K 3840. **Custom** takes an exact width and height instead, each between 64 and 4096 pixels.
- **Shape** is **As shown in the 3D view** by default, which matches the view exactly. The others - wide 16:9, classic 4:3 and square 1:1 - show more at the sides when wider than the view and less when narrower.

Every size is limited to what the shopper's device can render, at most 4096 pixels a side, and is scaled down whole so the shape never changes.

With **Let shoppers change size and shape** on, a gear beside the button opens a dialog over the middle of the 3D view where shoppers pick the size and shape themselves, including a custom width and height unless you switch **Let shoppers enter a custom size** off. It shows the pixel size the choice will produce, and the choice is remembered on their device for the next picture and the next visit. The dialog takes the theme's colours, fonts, borders and option buttons, so it matches the rest of the panel.

## The file

Pick the **Format** the picture downloads in:

- **JPG** keeps files small, but cannot be transparent.
- **PNG** is lossless, but can run to tens of megabytes at 4K.
- **WebP** is about the size of a JPG and can be transparent. Browsers that cannot write WebP, such as Safari, save a PNG instead, so the shopper still gets the picture.

With PNG or WebP, **Transparent background** leaves the background color, image or gradient, the skybox and its ground projection out of the picture, so the product can be placed on any page or slide. The shadows the product casts on a shadow-catching ground stay.

The file is named after **File name** (`screenshot` by default) with the chosen view's name added, for example `screenshot-front.jpg`.

## Leaving things out of the picture

Points of interest and dimensions are left out of the picture, so it shows only the product and its background. Switch **Include points of interest and dimensions in the picture** on to keep them.

**Models left out of the picture** and **Parts left out of the picture** leave out whatever else should not be in it, such as a scale figure, a backdrop or a packaging box - a whole model, or a single part of one. Picking a part needs the model's glTF structure, parsed in the Models section. They stay in the 3D view: the picture is drawn separately, so the shopper never sees anything vanish, and their shadows are left out with them.

## Saving every view at once

Switch **Offer a button that saves every view at once** on, and a download button appears beside the screenshot button. It saves the current view and each named view in one ZIP file named after **File name**, for example `screenshot.zip` holding `screenshot-current-view.jpg`, `screenshot-front.jpg` and `screenshot-side.jpg`, at the size, shape and format the shopper would get one at a time.

The pictures are taken in the background: the camera does not fly through the views and the 3D view does not change while they are taken. The button appears only when the element offers at least two views.

## The flight

Each named view flies with its focal's own transition, or the camera motion set under [Navigation](/learn/3d-bits/composer/navigation). **Custom flight to the named views** on the element sets its own duration and easing for the screenshot instead. After the picture the camera stays at that view, so the shopper sees what they saved.

While the picture is taken the panel and the 3D view take no input, so a drag or another choice cannot pull the camera away mid-flight.

## Where it lives

The element is a compact row - the button, the views dropdown and the gear - and takes the theme's button and input styling. It is at most 40 pixels tall, or your theme's button height when that is lower, unless you set a button height for this element under Style. It is at home in a canvas corner as an icon-only button, set under Style. In the Layout tab preview the button is there to see but takes no picture - clicking it tells you to press Play - because the picture is taken from the live 3D view; it comes alive in Play, and on your product page.

If you delete a focal that a named view points at, the Composer and the publish step both warn you, and shoppers who pick that view get an error instead of a picture until you pick its focal again.
