---
sidebar_position: 1
title: "App Embed Settings"
sidebar_label: App Embed
description: Reference for the 3D Bits app embed, the two settings that still live in the theme editor, and the ones a published project overrides.
tags: [shopify, 3d-bits, app-embed]
---

# App Embed

In the Shopify theme editor this appears under **App embeds** as **3D Bits - Auto 3D on product pages**. It is the recommended way to run 3D Bits and the only thing most stores need.

Switching it on lets 3D Bits render on your storefront. On each product page it checks whether that product has a published 3D Bits project, and if it does, it draws the configurator. Products without one are left alone.

If you have not turned it on yet, [Enable 3D on Your Store](/learn/3d-bits/quick-start/enable-app-embed) walks through it.

:::info Two settings here, the rest in the app
The embed applies to your whole store, and presentation usually needs to differ between products, so nearly everything is set per project in the 3D Bits admin instead. Only **Placement** and **Runner CDN Link** are read from the theme editor. The other settings you can see there are carried by each published project and the project's value wins, so changing them here has no effect on a product you have published from the app.
:::

## Placement {#embed-placement}

**Default:** `form[action*="/cart/add"]`

A CSS selector saying where on the product page the 3D viewer is inserted.

The default targets your add to cart form, which every Shopify theme has. This is why the embed works on any theme without setup.

To put the viewer somewhere else, enter that element's selector instead. A common choice is the product gallery or media area, for example `div.product__media-wrapper`. The exact selector depends on your theme, and your theme developer or your browser's inspector will tell you what it is.

If the selector matches nothing, 3D Bits falls straight back to your add to cart form - it does not wait first. It only keeps retrying, for about ten seconds, if it cannot find that form either, which is what happens on a theme that renders the product page late. So a typo does not usually leave the page blank, it leaves the viewer in the default place. Check on a real product page after changing it rather than trusting the theme editor preview.

This is also the anchor the Split and Overlay layouts build around, so it affects those layouts as much as the plain inline one.

## Runner CDN Link

Pins which version of the 3D Bits runtime your storefront loads. Leave it as it comes unless we have asked you to change it, or unless you are hosting the runtime files yourself.

Fuller explanation in [Runner CDN Link](/learn/3d-bits/tutorials/getting-started/common-settings#runner-cdn-link).

## When the embed stays out of the way

There are two situations where the embed deliberately does nothing, both to avoid drawing a second viewer on top of one that is already there.

The first is a project whose **Placement on the product page** is set to **Theme template blocks**. You have told us you want to position things yourself, so the embed leaves those products to your blocks. See [Switching a project to blocks](/learn/3d-bits/theme-blocks/overview#switching-a-project-to-blocks).

The second is a product configured before the app embed existed, using a BITBYBIT VIEWER or RUNNER block placed into a template with the product's metafields filled in by hand. Those keep working as they always did, and the embed recognises them and leaves them alone.

## In your cart

The embed also loads a small script for the cart, and it has two jobs.

The first is drawing the configuration summary. When you charge configured amounts as product lines, a Cart Transform merges each charge group into a single bundle line, and a merge keeps only the machine attributes the merge itself re-stamps - so the row your theme draws has a price with nothing on it explaining the price. The script fetches the product's published scene and rebuilds the summary from the shopper's own configuration, using the same row builder the [PDF report](/learn/3d-bits/composer/gui/pdf-reports) uses, so the cart, the PDF and the order cannot disagree about what was ordered. You control how that summary looks, and where in the row it sits, from the Composer's [Cart Overview](/learn/3d-bits/composer/gui/cart-overview) tab.

The second is tidying up. A configured item is accompanied by [helper product](/learn/3d-bits/pricing/helper-products) lines that carry its option amounts. If a shopper removes the configured item itself, those lines would be left behind on their own, and checkout would refuse them. The script spots lines whose configured item has gone and removes them, so the cart adds up again without the shopper having to work it out.

This runs on every page, not just `/cart`. That is deliberate: a cart **drawer** is the same cart opened on a collection or home page, and if the script only ran on the cart page a drawer opened anywhere else would show a bare row with no summary, and would never register the orphaned-line cleanup at all.

## Settings that live in the app instead

Canvas height on desktop and mobile, maximum width, side offset, top and bottom margins, the storefront layout, which side the options panel sits on and how wide it is are all set per project, in the 3D Bits admin, under a project's **Storefront settings**. Saving there applies them to your published products straight away, without a republish. [Canvas and layout sizing](/learn/3d-bits/admin/canvas-sizing) covers them.

Taking a configurator off sale temporarily is also a per-project action, but it is not in Storefront settings either. You pause it from the project's own page, with **Pause this configurator**, and **Resume selling** puts it back. See [Projects](/learn/3d-bits/admin/projects).

The settings below are still shown in the theme editor, and are still what an older hand-built setup falls back to, but a project published by the app always carries its own value and that value wins.

### Show Fullscreen Button

Adds a button that expands the 3D view to fill the screen. Worth keeping for products with detail people want to look at closely. Set per project as **Show fullscreen button**.

Fuller explanation in [Show Fullscreen Button](/learn/3d-bits/tutorials/getting-started/common-settings#show-fullscreen-button).

### Show Spinner

Shows a loading indicator while the 3D scene is being prepared or recalculated. Leave this on. Without it a slower model looks like a page that is not responding. Set per project as **Show loading spinner**.

Fuller explanation in [Show Spinner](/learn/3d-bits/tutorials/getting-started/common-settings#show-spinner).

### Receive Input Names As Variants

Decides whether 3D Bits identifies your theme's product options by their technical field names or by the labels a shopper reads.

Technical names are more reliable, because they survive translation and rewording, so this should normally stay on. It only matters when the configurator reads your theme's own inputs, such as its variant pickers or a third-party options app, rather than a panel you built in Composer. Set per project as **Receive input names as variants**.

Fuller explanation in [Receive Input Names As Variants](/learn/3d-bits/tutorials/getting-started/common-settings#receive-input-names-as-variants).

### Input Collection Mode

Chooses how much of the page 3D Bits reads. **Standard** covers the product form. **All Inputs** scans the whole page, which you need when your theme or another app adds fields elsewhere that should affect the 3D scene. Like the setting above, it only matters when the configurator is reading the theme's own inputs. Set per project as **Input collection mode**.

Fuller explanation in [Input Collection Mode](/learn/3d-bits/tutorials/getting-started/common-settings#input-collection-mode).

### Enable OCCT, Enable JSCAD, Enable Manifold

These load geometry engines used by parametric configurators built with scripts. Each one adds to what the page has to download, so only what a script actually uses should be switched on.

A project built in Composer chooses its own engines in the Scripting section and boots nothing else, so these three do not apply to it. [Scripting](/learn/3d-bits/composer/scripting) covers that.

The individual settings are explained under [Enable OCCT](/learn/3d-bits/tutorials/bitbybit-runner/settings#enable-occt), [Enable JSCAD](/learn/3d-bits/tutorials/bitbybit-runner/settings#enable-jscad) and [Enable Manifold](/learn/3d-bits/tutorials/bitbybit-runner/settings#enable-manifold).
