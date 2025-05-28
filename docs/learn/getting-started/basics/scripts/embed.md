---
sidebar_position: 5
title: Embedding Bitbybit Scripts in Your Website
sidebar_label: Embedding Scripts
description: Learn how to embed public Bitbybit scripts into your own website using iframes for broader sharing and integration.
tags: [getting-started, scripts]
---

# Embedding Bitbybit Scripts

## What is Embedding?

Embedding allows you to take a script you've created on Bitbybit and display it directly within your own website. This means visitors to your site can see and interact with your 3D creations without leaving your page.

**Important Considerations:**
*   **Only Public Projects/Scripts Can Be Embedded:** You can only embed scripts that are part of a **Public Project**. Scripts from private projects or those with Silver/Gold community visibility cannot be embedded.
*   **Public Accessibility:** Be aware that if a project is public, all assets (like 3D models or images) and scripts within it are also public and easily accessible to everyone on the internet.

## How to Embed Public Scripts

All Bitbybit scripts can be embedded into your website using an HTML `<iframe>` element. An iframe allows you to display another HTML page within your own.

For the purpose of this tutorial, we'll demonstrate embedding a script that opens in one of our editors. To do this, you'll add an `<iframe>` element to your website's HTML and set its `src` attribute to the URL of the Bitbybit script you want to embed.

**Example `<iframe>` Code:**

```html
<iframe 
  src="https://bitbybit.dev/app/your-username/your-project-id/your-script-id?editor=rete"
  width="100%" 
  height="600px"
  sandbox="allow-scripts allow-same-origin allow-downloads allow-forms allow-popups"
  frameborder="0"
  title="Embedded Bitbybit Script with Editor">
</iframe>