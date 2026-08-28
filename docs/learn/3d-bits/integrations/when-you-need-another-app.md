---
sidebar_position: 1
title: "When You Need Another Options App"
sidebar_label: Using Another Options App
description: 3D Bits builds your option panel and prices it. Here is when a separate product options app still makes sense, and how to run one alongside.
tags: [shopify, 3d-bits]
---

# When You Need Another Options App

Most likely, you do not need one.

3D Bits builds the option panel your shoppers use and prices what they configure. Dropdowns, radio buttons, checkboxes, switches, colour and image swatches, sliders, number and text fields, date pickers and file uploads are all there, along with conditional logic, styling, translations, and pricing that Shopify charges at checkout. That is the same ground a product options app covers, so for a new configurator you can usually stop here and build everything in [Composer](/learn/3d-bits/composer).

There are still three situations where another app earns its place.

**You already run one and it works.** If you have an options app configured across a catalogue, migrating everything at once is a poor use of your time. Leave it. Switch configurator pricing off for those products, let 3D Bits handle the 3D, and move products over gradually if and when you want to.

**You need an option type we do not have.** Our controls cover the common ground well, but if your business depends on something specific we do not offer, an options app may fill that gap. Tell us what it is, because it may be something we should add.

**Your requirements sit outside what we do.** Subscription logic, complicated bundle rules, quantity break pricing across a whole catalogue and similar concerns are not what 3D Bits is for. A dedicated app will serve you better.

## Running one alongside 3D Bits

The two coexist without any special setup. The options app renders the shopper's choices, and 3D Bits watches those choices and updates the 3D model to match. You switch configurator pricing off for those products so that only one system is deciding the price.

The one requirement is that the app renders real HTML form fields rather than an interface made only of styled `div` elements. Nearly all of them do. [How It Works](/learn/3d-bits/how-it-works) explains why this matters, and [Debug Mode](/learn/3d-bits/tutorials/getting-started/common-settings#enable-debug-mode) shows you exactly what 3D Bits can see on a page, which is the quickest way to confirm compatibility during a trial.

To set it up, install and configure the options app first, publish your 3D Bits project to the same product, then turn on Debug Mode and change an option. If the field names and values appear and update, connect them to your model in Composer and test every combination before going live.

When the options app renders every control, 3D Bits draws no panel of its own. Your Composer rules still run in that arrangement, but not all of them can reach a control that belongs to somebody else - [Logic Without a Panel](./logic-without-a-panel) sets out which half applies.

## Apps merchants have used

We are not affiliated with any of these, we do not receive anything for listing them, and we cannot support them. They are here because merchants have asked which apps tend to work, and this is an honest answer rather than a recommendation. Review counts are approximate as of late 2025.

| App | Notes | Shopify App Store |
|---|---|---|
| **Infinite Product Options** (~2,100 reviews) | Long track record, conditional logic, addon bundles | [View app](https://apps.shopify.com/custom-options) |
| **Easify Custom Product Options** (~1,850 reviews) | Many option types, file upload, 13 languages | [View app](https://apps.shopify.com/easify-product-options) |
| **OPTIS Product Options** (~1,700 reviews) | Swatches, cart page editing, import and export | [View app](https://apps.shopify.com/product-options-by-bss) |
| **Avis Product Options** (~1,480 reviews) | Wide option range, live preview, 10 languages | [View app](https://apps.shopify.com/avisplus-product-options) |
| **Hulk Product Options** (~1,100 reviews) | Conditional logic, file uploads, bulk operations | [View app](https://apps.shopify.com/product-options-by-hulkapps-1) |
| **Zepto Product Personalizer** (~1,000 reviews) | Personalisation focus, custom fonts and colours | [View app](https://apps.shopify.com/product-personalizer) |
| **Tepo Custom Product Options** (~770 reviews) | CSV import and export, POS integration | [View app](https://apps.shopify.com/tepo-product-options) |
| **YMQ Options** (~460 reviews) | Price formula builder, volume discounts | [View app](https://apps.shopify.com/ymq-options) |
| **APO Product Options** (~420 reviews) | Multi-step display, formula pricing | [View app](https://apps.shopify.com/advanced-product-options) |
| **DPO Dynamic Product Options** (~290 reviews) | Price calculators, spreadsheet price lookup | [View app](https://apps.shopify.com/dynamic-product-options) |
| **LPO Live Product Options** (~260 reviews) | Live preview on product images, formula pricing | [View app](https://apps.shopify.com/live-product-options) |

Most offer a trial of a week or two. If you are evaluating one, run it during your 3D Bits trial so you can see both together on a real product before you commit to either.

## If you are unsure

Write to us at [info@bitbybit.dev](mailto:info@bitbybit.dev) and describe the product. We will tell you honestly whether 3D Bits covers it on its own, and if it does not, what we would use instead.
