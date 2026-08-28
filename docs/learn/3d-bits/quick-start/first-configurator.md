---
sidebar_position: 3
title: "Your First Configurator"
sidebar_label: Your First Configurator
description: Take one product from a 3D file to a live configurator on your storefront, start to finish.
tags: [shopify, 3d-bits]
---

# Your First Configurator

This walks one product all the way through: a 3D file goes in at one end, and a working configurator comes out on your storefront at the other.

Pick something simple for this first run. One product, one or two options. You are learning the shape of the process, and a simpler product makes every step faster.

You will need a 3D model, ideally glTF or GLB, with the objects your options control separated from one another. Composer also loads `.stl`, `.obj`, `.ply` and `.splat`, but glTF and GLB are the ones that carry materials, animations and the node structure a configurator switches between, so start there if you have the choice - [Supported formats](/learn/3d-bits/composer/models/supported-formats) compares all six. If you are not sure your file qualifies, [What to Expect](/learn/3d-bits/quick-start/what-to-expect) explains what to look for.

## 1. Create a project

Open 3D Bits in your Shopify admin. On the home page there is a short checklist, and the first step creates a project. You can also go to **Projects** and choose **New project**.

Give it a title, something you will recognise later like "Oak dining table".

There is a checkbox, **Also create a product for this configurator**, and it is ticked by default. If you are experimenting, leave it ticked and the app creates a draft product and links it for you, so you have something to publish to without touching your real catalogue. If you already have the product you want to use, untick it and link it later.

Creating the project opens Composer.

## 2. Load your model

Composer opens on a screen asking you to upload a 3D file. Drag your `.glb` or `.gltf` onto it.

The model appears in the 3D view, and you land in the **Models** section. Have a look at it. Orbit around with your mouse and check it loaded the way you expected, is the right way up, and is a sensible size on screen.

If it is not framed nicely, go to **Scene** and use **Fit scene to model**. That sets up the camera, lighting and background to suit the size of your model in one click, which is a good starting point you can adjust afterwards.

## 3. Find the parts you will control

Still in **Models**, expand your model and use **Parse Structure**. This reads the file and lists what is inside it: the individual objects, the materials, any animations.

This is the moment of truth for your model. If you see the separate objects your options need, you are in good shape. If the whole product is one object, the file needs re-exporting with those objects separated, and it is much better to discover that now than after you have built everything else.

## 4. Build your options

Go to the **GUI** section. This is the panel your shoppers will use.

In the **Controls** tab, add a control. For a first attempt make it a dropdown or a set of radio buttons, and give it two options, such as Oak and Walnut. Give the control a clear label, since your shopper reads it.

Now connect those options to the model. On the objects you listed in step 3, you set the conditions under which each one is visible. The oak tabletop shows when the material choice is Oak, and the walnut one when it is Walnut. Do that for both, and you have a configurator.

The **Layout** tab controls how the panel is arranged, and **Style** makes it match your theme. Both can wait until the thing works.

## 5. Try it as a shopper would

Press **Play**.

Play runs your configurator exactly as a shopper sees it. Click through your options and watch the model change. This is the fastest way to catch an object that was left visible when it should not be, or a condition connected to the wrong option.

Press **Stop** to go back to editing.

## 6. Add a price

Go back to **GUI** and open the **Pricing** tab, then turn pricing on.

Set a base price, which is what the product costs before any choices.

Now look at the small table Composer draws underneath that field. It lists **the product's own price**, your **base price**, what **the shopper sees**, and **the cheapest cart can collect**. Your Shopify product keeps its own price whatever you do here, and that price is a floor: the total a shopper sees has to cover the product's own price plus anything the configuration adds from your catalogue, or the cheapest configuration cannot be added to a cart at all. If it does not, Composer puts an error under the table naming the figure that would clear it, and publishing is **refused** rather than warned.

If you ticked the checkbox in step 1, the draft product the app created is priced at 0.00, so anything you set as a base price is above the floor and you can carry on. If you linked a real product with a real price, set your base price at or above that price - or open the project's page in the app, which offers to set the product price to a figure that fits and will do it for you. Either way, come back and check this table whenever you change the product's price in Shopify.

Then go back to your control in the Controls tab and give one of its options an amount, in the field labelled **Price +/-** - for example walnut adding 120 to the price.

Press Play again. The total updates as you switch between oak and walnut, and that total is what Shopify will charge.

If you would rather your shoppers see the price in the panel, add a **Price** element in the Layout tab.

Pricing has real depth to it, including formulas over sliders and options that draw from your own catalogue. [Setting up pricing](/learn/3d-bits/pricing/setting-up-pricing) takes it one step at a time, and [Pricing](/learn/3d-bits/pricing) covers all of it when you need it.

## 7. Save and publish

**Save** stores your work in the project. Do it often, the same way you would with any document.

**Publish** is the separate, deliberate step that sends the configurator to your storefront. These are different on purpose, so you can keep working on a project without your changes going live halfway through.

Before publishing, make sure the project is linked to a product. If you ticked the box in step 1, that is already done. Otherwise open the project's page in the app and link one.

Then press Publish. You can do it from Composer's bottom bar without leaving the editor, or from the project's page in the app - they are the same action.

If a **Blocking Publish** bar appears along the bottom of Composer, publishing will not go through until you clear what it lists. Click an entry and Composer takes you to the field it is complaining about. [Publish blockers](/learn/3d-bits/composer/publish-blockers) lists every reason a publish is refused and what to change for each one.

## 8. Switch 3D on for your store

If this is your first project, there is one more thing, and you only ever do it once.

Go to **Storefront** in the app's navigation - the page is titled *Storefront display* - and press **Enable 3D on your store**. This opens your theme editor with 3D Bits switched on, and you press **Save** there. [Enable the app embed](/learn/3d-bits/quick-start/enable-app-embed) covers it in more detail.

From now on, every project you publish appears on its product page automatically, and this step is behind you.

## 9. Look at the real thing

Open your product page on your storefront and use it as a shopper. Change the option, watch the model, watch the price, and put it in the cart.

Then check the order. The app's **Order review** page shows exactly what was configured, which is what your workshop will work from.

## What to do next

You have the whole shape of it now. Everything else is depth in one of these steps.

To make it look right, spend time in [Composer](/learn/3d-bits/composer) on the scene and the panel styling. To price properly, read [Pricing](/learn/3d-bits/pricing). And if your first attempt showed up problems with the model itself, [3D Assets](/learn/3d-bits/3d-assets) is where to go, or send it to us at [info@bitbybit.dev](mailto:info@bitbybit.dev) and we will tell you what needs changing.
