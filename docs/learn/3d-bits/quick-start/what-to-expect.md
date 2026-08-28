---
sidebar_position: 4
title: "What to Expect"
sidebar_label: What to Expect
description: How long a first configurator takes, what the 3D model needs to be like, and where the real effort goes.
tags: [shopify, 3d-bits]
---

# What to Expect

You can have a product spinning on your storefront in an afternoon. Building a configurator you are proud of takes longer, and almost all of that time goes into one thing: the 3D model.

## The model is the work

The app is straightforward. Upload, arrange, add options, set prices, publish. If your model is ready, that part goes quickly.

What decides whether the result is any good is the file you upload. Three things matter.

**Size.** Your shopper downloads this model before they see anything. A 70 MB file on a phone over mobile data is a shopper who has already left, and on iPhone Safari the app refuses to load a single model over 30 MB rather than risk crashing the page. A good model for a complex product is a few megabytes, and getting there is a normal part of preparing 3D for the web rather than a compromise. One of our merchants ships a full power rack assembly at around 3 MB.

**Separated objects.** If a shopper chooses the legs separately from the tabletop, the legs need to be their own objects in the file. A model exported as one merged lump looks fine but cannot be configured, and no amount of work in the app fixes that. This is the single most common reason a first attempt stalls, and it is worth checking before you start.

**Honest materials.** The colours and finishes in the model are what your shopper will judge. Getting oak to look like oak is worth the effort.

Our [3D Assets](/learn/3d-bits/3d-assets) guides cover all of this, including how to get a model out of CAD and ready for the web.

## If you do not have a model

Plenty of merchants do not, and there are three normal routes.

If your product exists as CAD, from your manufacturing or from your designer, that converts well and we have a [converter](/learn/3d-bits/3d-assets/preparing-gltf) built into the app for STEP files.

If your product is physical and you can put it in front of a phone, 3D scanning has become genuinely good. Gaussian Splat scans are supported directly and can look remarkable for products with complicated surfaces.

Or you can have a model made. We do this as a paid service, and we are happy to quote. If you tell us what you make, we will tell you honestly what would be involved.

## What you will need to understand

Not much, and less than the tool's depth suggests.

You will want to know how to get around your Shopify admin, and how to upload a file. If you are letting Shopify variants drive the model, it helps to have your variants organised sensibly first, since the configurator follows them.

You do not need to understand code, theme development, metafields, or how any of the 3D machinery works. Those exist for people who want them and stay out of the way otherwise.

## A sensible order to work in

Get one product live before you plan the catalogue. Take your simplest product, or even a single option on a complicated one, and take it all the way through to a real product page. You will learn more from that than from reading, and you will find out early whether your model is separated the way you need.

Once one works, the rest goes much faster.

## When to ask us

Sooner than you think. Most of the problems merchants write to us about after a week of struggling would have taken us five minutes at the start, and usually they trace back to how the model was exported.

Write to [info@bitbybit.dev](mailto:info@bitbybit.dev). Tell us what you make and send the model if you have one. We will look at it properly.
