---
sidebar_position: 3
title: "Set up 3D Bits App for Shopify"
sidebar_label: Setting up 3D Bits app
description: Setting up 3D Bits app with your Shopify store
tags: [shopify, 3d-bits]
---

# Setting up 3D Bits

Now that you've installed the app, let's set up the foundation for your 3D experiences. Remember: building quality configurators takes time and learning, but we'll guide you through each step.

## Understanding Metafields

3D Bits makes heavy use of **Product metafields** - a powerful Shopify feature that allows each product to have custom values. 

### What Problem Do Metafields Solve?

Imagine you create a new Shopify product template for products that should display 3D models. You add the **BITBYBIT VIEWER** theme app extension block to your template (don't worry - you will learn more about templates in the [next tutorial](./theme-app-extension-blocks)). Now - this template has a setting for **Model URL** where you can enter a link to a 3D file (like a GLTF).

**The Problem:** If you enter a model URL directly in the template, that same model will appear on *all* products using that template.

**The Solution:** Create a **Dynamic Link** in your template between the BITBYBIT VIEWER's Model URL setting and a product metafield called "3D Bits Model Url". Now each product can have its own unique model URL, displaying different 3D models on each product page.

Shopify metafields give you the power to customize settings per product, and 3D Bits leverages this for maximum flexibility.

## Creating Metafields: Automatic or Manual

You have two options for creating metafields:

### Option 1: Automatic Creation (Recommended)

We've prepared a convenient script that creates all metafields the 3D Bits app might use.

1. Navigate to the **Metafields** page in the 3D Bits admin dashboard
2. Click **"Create And Pin 3D Bits Metafields"**

![Create Shopify Metafields for 3D Bits App](/img/3d-bits/tutorials/create-metafields.jpg)

3. You should see a success message. If some metafields fail to create, a retry button will appear.

![Metafields created successfully](/img/3d-bits/tutorials/metafields-created-successfully.jpg)

### Option 2: Manual Creation

You're free to create your own Product metafields in Shopify and link them to 3D Bits. This is useful if:
- Your store already uses many metafields
- You only need specific metafields (e.g., just Model URL for static GLTF models)
- You want more control over metafield organization

Learn more about [Shopify metafields here](https://help.shopify.com/en/manual/custom-data/metafields).

:::tip What's next?
Learn about [Theme App Extension Blocks](./theme-app-extension-blocks) provided to your Shopify store via 3D Bits app.
:::
