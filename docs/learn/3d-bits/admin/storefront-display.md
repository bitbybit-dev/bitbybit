---
sidebar_position: 4
title: "Storefront Display"
sidebar_label: Storefront Display
description: Switching 3D on for your store, checking whether it is actually on, and what to clear up before uninstalling.
tags: [shopify, 3d-bits, app-embed, theme-blocks]
---

# Storefront Display

This page answers one question: is 3D currently switched on for your store, and if not, how do you switch it on.

It is reached from **Storefront** in the app's navigation - the page itself is titled Storefront display.

## Before anything else, two possible alarms

The page opens with a banner when something is stopping 3D from appearing, and there are two of them.

**"Your plan is not switched through to your theme yet"** is the serious one. Your storefront has not been told which plan you are on, so the theme editor will not offer the 3D Bits app embed or any 3D Bits block, and 3D cannot appear on your products no matter what you have published. There is one remedy, and the banner links to it: open the [Subscription](/learn/3d-bits/admin/subscription) page and press **Sync storefront blocks**.

**"The 3D Bits app embed is not switched on in your live theme"** is the ordinary one, and the button on this page fixes it.

## Show 3D on your products

The **Enable 3D on your store** button turns on the app embed, which is the switch that lets 3D Bits appear on your storefront. It opens your theme editor with 3D Bits already enabled, and you press Save there.

You do this once. From then on, every project you publish appears on its product page by itself, and products without a published project are untouched.

Once it is on, this card turns into a status panel: a green **3D is live on your storefront** with an **Active** badge, naming the theme it checked. That is the readout to trust - not what you remember doing in the theme editor.

:::warning A draft theme does not count
The check looks at your **live** theme, and so does your storefront. Enabling the app embed on a draft theme does nothing for the theme your shoppers see. If you are working on a copy, remember to enable it again after you publish that theme.
:::

By default the viewer sits at your add-to-cart form, which works on every theme. You can move it to any CSS selector from the app embed's settings in the theme editor.

[Enable the app embed](/learn/3d-bits/quick-start/enable-app-embed) has the detail, including what to do if the automatic switch does not work on your theme.

## If you would rather place things yourself

The page also points you at theme blocks, which are for when you want the 3D view or parts of the options panel in specific places in your product template rather than in the default spot.

That is a real need for some stores and unnecessary for most. Note that you add a block per template, where the embed is switched on once for the whole store, and that the two can coexist. **Add to product page**, on a project's own page, deep-links the theme editor with the block already placed on the template your linked products use.

[Theme Blocks](/learn/3d-bits/theme-blocks) explains the trade-off and covers each block.

## Your data and uninstalling

The page carries a short note about what happens if you remove the app, and it is worth reading before you act rather than after.

**Uninstalling starts a grace period of about 48 hours.** Reinstall within that window and all your projects and asset records come back. After it, Shopify sends us the data-erasure notice and everything we hold for your shop is permanently deleted.

**Two things stay in your store, because they belong to it.** The files you uploaded to your Shopify CDN, which you will find under **Content**, then **Files**; and the 3D Bits product metafields on the products you published to. Both are inert once the app is gone - nothing renders from them - but we can no longer touch either after uninstall.

:::warning Clear them before you uninstall, not after
If you want those gone, do it while the app is still installed. Delete the files from Content, then Files, and clear the metafields from the [Metafields](/learn/3d-bits/admin/metafields) page - or simply unpublish your projects, which clears them as it goes. Once the app is uninstalled, that tidying is a manual job in Shopify admin.
:::

If you are about to uninstall and want to keep your configurations, download them from each project first. The project page's **Download JSON** saves a project to a file that can be loaded back later.

## Per-project settings are elsewhere

How tall the canvas is, how wide the options panel is, which side it sits on and so forth are set per project, on the project's own page under Storefront settings. They live there rather than here because they usually differ between products.

See [Canvas Sizing](/learn/3d-bits/admin/canvas-sizing).
