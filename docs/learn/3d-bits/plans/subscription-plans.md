---
sidebar_position: 1
title: "Subscription Plans"
sidebar_label: Plans and Features
description: The three 3D Bits plans, what each one includes, and how to work out which one your products need.
tags: [shopify, 3d-bits]
---

import { PlanIncludedIcon, PlanExcludedIcon, PlanConditionalIcon } from "@site/src/components/Icons";

# Subscription Plans

There are three plans. **Base** gives you the whole configurator: the editor, the option panel your shoppers use, and pricing that Shopify charges at checkout. **Standard** and **Pro** add features for products that need more, and you can move up at any point without rebuilding anything you have already made.

Every plan covers unlimited products and unlimited 3D models. We do not charge per configurator or per view.

## Plans and pricing

| | Base | Standard | Pro |
|---|---|---|---|
| **Monthly** | $25 / month | $75 / month | $120 / month |
| **Annual** | $142 / year | $530 / year | $900 / year |
| **You save annually** | <span style={{color: "lightgreen"}}>53%</span> | <span style={{color: "lightgreen"}}>41%</span> | <span style={{color: "lightgreen"}}>38%</span> |
| **Free trial** | 7 days | 14 days | 21 days |
| **Products and 3D models** | Unlimited | Unlimited | Unlimited |
| **Support** | Documentation and tutorials | Guidance for your team | Hands-on help building your first configurator |

## Features by plan {#composer-features-by-plan}

| Feature | Base | Standard | Pro |
|---|:---:|:---:|:---:|
| 3D models, unlimited | <PlanIncludedIcon /> | <PlanIncludedIcon /> | <PlanIncludedIcon /> |
| Camera, lighting, skybox, loading screen | <PlanIncludedIcon /> | <PlanIncludedIcon /> | <PlanIncludedIcon /> |
| glTF parsing, node and material variants | <PlanIncludedIcon /> | <PlanIncludedIcon /> | <PlanIncludedIcon /> |
| Gaussian Splat scans (SPLAT, PLY) | <PlanIncludedIcon /> | <PlanIncludedIcon /> | <PlanIncludedIcon /> |
| Transform, appearance and animation variants | <PlanIncludedIcon /> | <PlanIncludedIcon /> | <PlanIncludedIcon /> |
| Option panel, styling, themes and translations | <PlanIncludedIcon /> | <PlanIncludedIcon /> | <PlanIncludedIcon /> |
| Logic rules | <PlanIncludedIcon /> | <PlanIncludedIcon /> | <PlanIncludedIcon /> |
| Pricing, formulas and quantity | <PlanIncludedIcon /> | <PlanIncludedIcon /> | <PlanIncludedIcon /> |
| Solid colour background | <PlanIncludedIcon /> | <PlanIncludedIcon /> | <PlanIncludedIcon /> |
| Points of interest and focals | <PlanExcludedIcon /> | <PlanIncludedIcon /> | <PlanIncludedIcon /> |
| Dimensions, all six types | <PlanExcludedIcon /> | <PlanIncludedIcon /> | <PlanIncludedIcon /> |
| Gradient and image backgrounds | <PlanExcludedIcon /> | <PlanIncludedIcon /> | <PlanIncludedIcon /> |
| Scripting | <PlanExcludedIcon /> | <PlanIncludedIcon /> | <PlanIncludedIcon /> |
| Personalisation, image and text on the model | <PlanExcludedIcon /> | <PlanExcludedIcon /> | <PlanIncludedIcon /> |
| Options and parts linked to your own products | <PlanExcludedIcon /> | <PlanExcludedIcon /> | <PlanIncludedIcon /> |
| Parts, the bill of materials | <PlanExcludedIcon /> | <PlanExcludedIcon /> | <PlanIncludedIcon /> |
| PDF documents | <PlanExcludedIcon /> | <PlanExcludedIcon /> | <PlanIncludedIcon /> |
| Shopper downloads the configured model as GLB | <PlanExcludedIcon /> | <PlanExcludedIcon /> | <PlanIncludedIcon /> |

Every row is described in plain language further down, under [What every plan includes](#what-every-plan-includes), [What Standard adds](#what-standard-adds) and [What Pro adds](#what-pro-adds).

## Charging methods by plan

Configurator pricing works on every plan. What differs is how the charge is assembled, which is covered in full in [Charging methods](/learn/3d-bits/pricing/charging-methods).

| Charging method | Base | Standard | Pro |
|---|:---:|:---:|:---:|
| Product lines, the default | <PlanIncludedIcon /> | <PlanIncludedIcon /> | <PlanIncludedIcon /> |
| Bundled parts | <PlanIncludedIcon /> | <PlanIncludedIcon /> | <PlanIncludedIcon /> |
| Variant matrix | <PlanIncludedIcon /> | <PlanIncludedIcon /> | <PlanIncludedIcon /> |
| Single line | <PlanExcludedIcon /> | <PlanConditionalIcon /><br />Shopify Plus or a development store | <PlanConditionalIcon /><br />Shopify Plus or a development store |

## Which plan do you need?

If your product is made from pieces you can prepare in advance and your shoppers pick between them, Base does everything. That covers most furniture, most equipment, and most made-to-order goods with a fixed set of choices.

Move to Standard when you want the camera to help you sell, when shoppers need to see measurements, or when the product's shape has to be calculated from numbers they type.

Move to Pro when shoppers put their own name, image or artwork on the product, when an option should draw from your real stock, or when your workshop needs a bill of materials and a document with every order.

## What every plan includes

You get Composer, where you build the whole thing. Load your 3D models, arrange the scene, set up the camera, lighting and skybox, and connect objects in the model to the choices your shoppers make.

You get the option panel your shoppers see on the product page. There are fourteen control types: dropdowns, radio buttons, checkboxes, switches, sliders, number fields, single-line text fields, long text areas, email fields, colour pickers, date pickers, time pickers, file uploads for shoppers sending you artwork, and buttons that trigger an action rather than carry a value. A radio or checkbox group can present its choices six ways - plain text, colour swatches, image swatches, cards, buttons or pills - and a dropdown can be the device's native list or a styled one with images. You arrange them into sections, accordions and tabs, style them to match your theme, and translate them into the languages you sell in.

You get the logic that ties it together, so an option can appear only when it makes sense, and choosing one thing can change or restrict another.

You get pricing. A starting price, an amount per option, formulas over sliders and number fields, and a quantity control that scales the price of one configured set - buying several of the finished item is the separate Quantity element in the Layout tab. The shopper sees the total update as they choose, and Shopify charges that amount at checkout.

You get the live catalogue check - the Pricing tab calls it *Disable options that cannot currently be sold (live catalog)* - and no plan restricts it. When the product page loads, it looks up the real store products behind the configuration and greys out any choice whose product has sold out, or whose price no longer matches what you published, with a short message on the choice itself. It never changes what a shopper is charged. It has something to look up once your options or your parts link real products, which is the Pro feature described below.

You get the app embed, which puts your published configurators on your product pages with one switch, and the theme blocks if you would rather place things yourself. You also get the Assets library, project versions and backups, and the Order review page where you can check exactly what each shopper configured.

Composer loads six file extensions: `.gltf` and `.glb` for regular 3D models, `.splat` and `.ply` for Gaussian Splat scans, and `.stl` and `.obj` for plain geometry out of CAD and older pipelines. glTF and GLB are what a configurator wants, because they are the ones that carry materials, textures, animations and the node structure you switch objects in. Material variants exported from Blender are picked up automatically, and [Supported formats](/learn/3d-bits/composer/models/supported-formats) compares all six.

## What Standard adds

Standard is about showing a product properly, and about products whose shape is calculated rather than prepared in advance.

**Points of interest and focals** move the camera for your shopper. A point of interest is a marker they can click to fly to a detail worth seeing, like the stitching on a seat or the joint on a frame. A focal does the same thing on its own when a particular option is chosen, so switching to the engraved version can bring the camera to the engraving.

**Dimensions** annotate the model with real measurements. There are six kinds, covering straight lengths, angles, radii, diameters, ordinates and automatic bounding boxes, and they update as the shopper changes the size.

**Gradient and image backgrounds** go beyond a flat colour behind the product.

**Scripting** is for parametric products. You build the geometry in our visual node editor or write it in TypeScript, link the script into your Composer project, and the model is calculated from what the shopper enters. Standard also unlocks the Scripts section of the app, where those scripts live.

**Single line charging** shows a configured product as one clean line at its exact price. It needs Standard or Pro, and it also needs your store to be on Shopify Plus or to be a partner development store, which is a Shopify restriction rather than ours. Everything works without it, and [Charging methods](/learn/3d-bits/pricing/charging-methods) explains the alternatives.

## What Pro adds

Pro is for personalised products, and for the paperwork that comes with making things to order.

**Personalisation** puts your shopper's own content onto the model. They upload an image or type a line of text, and it appears printed or engraved on the product itself, in the right place, following the surface. This is what you want for a monogrammed case, a named jersey or an engraved plaque.

**Linking options to your own products** lets an option point at something real in your catalogue. Choosing oak legs adds your actual Oak Legs product to the order at its own price, so your stock and your picking list stay correct. One option can link up to ten products, each with its own quantity, so a single choice can add a whole set. An option that links more than one product is always charged as separate product lines, because several real items cannot ride on a single generated variant - [Charging methods](/learn/3d-bits/pricing/charging-methods) covers what that means for your orders.

**[Parts](/learn/3d-bits/composer/gui/parts)** are the bill of materials behind a configured product. A part can link a real product, so it is charged and shipped like any other item, or it can simply be recorded on the order and in the report - which is how a works order gets the pieces that cost nothing extra but still have to be made. Parts nest into assemblies, and their quantities can be worked out from what the shopper chose.

**PDF documents** are generated from the configuration. One is for your shopper, a summary they can download of what they designed. The other is attached to the order for the people who make it, and it can carry publishable manufacturer references for each chosen option alongside rendered views of the finished item.

**Downloading the configured model** gives the shopper a button that hands them a single `.glb` of exactly what they are looking at - every visible model, in position, with the materials they chose and any personalisation they applied baked in. Useful when your shopper is an architect dropping the piece into their own scene, or when you want them to be able to show someone else what they configured. It is a [Button control](/learn/3d-bits/composer/gui/controls) with the **Download the 3D model (GLB)** action.

The action carries a premium badge in Composer on any lesser plan, and choosing it opens the upgrade dialog rather than setting it. Publishing is refused as well, so a project that reached a lesser plan another way is still caught before it goes live.

## Support

Base support means documentation, tutorials and answers to your questions. Standard means we look at your specific product and guide your team through the setup. Pro means we work alongside you to get your first configurator built and live.

We are reachable either way.

- Email: [info@bitbybit.dev](mailto:info@bitbybit.dev)
- Discord: [join our community](https://discord.gg/GSe3VMe)

We also prepare 3D models and set up configurators as a paid service, quoted per job. If you have a product and no model, that is a good place to start.
