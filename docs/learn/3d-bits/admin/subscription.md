---
sidebar_position: 7
title: "Subscription"
sidebar_label: Subscription
description: Your current plan, what your storefront has been told about it, and what to do when the two disagree.
tags: [shopify, 3d-bits, subscription, plans]
---

# Subscription

This page does three things. It tells you which plan you are on and lists what that plan includes, it shows what your **storefront** has been told about your plan, and it carries the **Sync storefront blocks** button for when those two disagree.

It is not where you change plan. Billing is Shopify's - charges appear on your Shopify invoice alongside your other apps, and cancelling happens by uninstalling the app.

## Changing plan

Plan changes are made on Shopify's own app charges page for 3D Bits, not in the app. You reach it from your Shopify admin under **Settings**, then **Apps and sales channels**, or from any **View plans** link inside 3D Bits.

Moving up takes effect as soon as Shopify tells the app about it, which is normally moments. The features appear in the app and in Composer, and your storefront picks up the fuller feature set on its next page load.

Moving down does not take your published configurators off your storefront - as long as you have an active plan, they keep rendering, with whatever feature set your new plan includes. What changes is what you can do next. Composer answers the sections your new plan does not cover with an **Upgrade Required** dialog instead of opening them, and a published project that was charging through a method the lower plan does not include gets a **Republish needed** badge in your Projects list, so you know to revisit it before its next publish.

If you cancel altogether, the storefront blocks are switched off and 3D stops appearing on your products.

[Subscription Plans](/learn/3d-bits/plans/subscription-plans) compares what each plan includes.

## Sync storefront blocks

There is a button with this name, and it exists for one specific situation.

Your storefront needs to know which plan you are on, so it can load the right features and so the theme editor knows which blocks to offer. That normally updates by itself within moments of a plan change. Very occasionally the message does not arrive, and your storefront carries on as though you were still on the old plan, so a feature you have just paid for does not appear.

Pressing this button re-sends it. If you have upgraded and a new feature is missing from your product pages while showing correctly in Composer, this is the first thing to try. It reports back one of a few things:

- **Already in sync**, naming your plan. Nothing was wrong.
- **Synced**, naming your plan. Themes cache rendered pages, so give your storefront a few minutes, and reopen the theme editor to see the app embed and blocks.
- **We could not read your subscription just now.** Nothing was changed - try again in a moment.
- **This app build does not recognise that plan name.** Basic blocks were enabled and nothing was disabled. Get in touch so we can enable the rest.
- **No active subscription was found**, so the blocks were switched off.

## Storefront block visibility

Underneath the button there is a small readout, and it is the one place that tells you what your storefront actually believes.

It lists **Base**, **Standard** and **Pro** as **on**, **off** or **not set**, and then says in words what your theme editor is being offered: Pro blocks, Standard blocks, Basic blocks - or **none**.

:::danger "None" means no 3D anywhere
If the readout says none, the theme editor will not offer the 3D Bits app embed or any 3D Bits block, and 3D cannot appear on any product, however many projects you have published. Press **Sync storefront blocks**. The [Storefront display](/learn/3d-bits/admin/storefront-display) page raises the same alarm and links straight back here.
:::

## Trials

Each plan has a free trial, which starts when you first subscribe. Trial lengths are on the [plans page](/learn/3d-bits/plans/subscription-plans).

If you are evaluating and your model is not ready yet, tell us. We would rather extend a conversation than have you spend a trial waiting on a file.

## Getting help

The page carries our contact details, and they are the same ones as everywhere else: [info@bitbybit.dev](mailto:info@bitbybit.dev), and our [Discord](https://discord.gg/GSe3VMe).

It also asks to see what you have built. We mean it - real projects are how we find the rough edges before a release reaches everyone, and we are happy to show off what our community makes if you are.
