---
sidebar_position: 0
title: "Finding Your Way Around the App"
sidebar_label: Overview
description: What each section of the 3D Bits app in your Shopify admin is for.
tags: [shopify, 3d-bits, overview]
---

# Finding Your Way Around

3D Bits lives inside your Shopify admin, under Apps. Everything you manage about your configurators is here, and Composer opens from it.

## The sections

**Home** is where you land. If you have not published anything yet it shows a three step checklist that takes you from nothing to a live product, and it disappears once you are up and running. After that, Home is where warnings surface, such as an order whose price needs a look, or a configurator whose linked products have changed underneath it.

**[Projects](/learn/3d-bits/admin/projects)** holds your configurators. A project is one 3D scene with its options, its logic and its prices, and it is what you publish to your products. This is where you spend most of your time.

**[Scripts](/learn/3d-bits/admin/scripts)** holds parametric programs, built in the visual node editor or written in TypeScript, that calculate geometry rather than swapping between prepared models. You link a script into a project rather than publishing it directly. This item appears on the Standard and Pro plans only.

**[Storefront](/learn/3d-bits/admin/storefront-display)** is where you switch 3D on for your store, and where the app tells you whether it is currently on. The page itself is titled Storefront display.

**[Order review](/learn/3d-bits/admin/order-review)** shows what each shopper actually configured and confirms the price adds up. It appears once the app has permission to read your orders.

**[Assets](/learn/3d-bits/admin/assets)** is your library of uploaded files: 3D models, images and textures. They live on Shopify's own file storage, not ours.

**Composer** opens the editor without a project attached. Useful for trying something out or opening a configuration file you have been sent. For real work, open Composer from a project instead, so that saving and publishing are available.

**[Helpers](/learn/3d-bits/admin/helpers)** collects the occasional tools: a converter for CAD files, an inspector for looking inside a 3D model, and the older metafields workflow.

**[Subscription](/learn/3d-bits/admin/subscription)** shows your plan, what it includes, and what your storefront has been told about it.

**Learn** opens this documentation inside the app.

## Projects and Scripts are different things

This is the one distinction worth getting straight early.

A **project** is a configurator. It has a scene, an options panel, prices, and links to the products it belongs to. You publish a project, and it appears on those product pages.

A **script** is a program that produces geometry. It has no options panel and no prices, and you do not publish it to a product. Instead you link it into a project, and the project provides everything around it.

So even a heavily parametric product is a project. The script is one part inside it.

## The first three steps

If you are new, the checklist on Home is the shortest route through, and [Your First Configurator](/learn/3d-bits/quick-start/first-configurator) is the same journey with more explanation.
