---
sidebar_position: 3
title: "Assets"
sidebar_label: Assets
description: Your library of 3D models, images and textures, how files get in, and where they actually live.
tags: [shopify, 3d-bits, assets, cdn]
---

# Assets

Assets is your library of uploaded files: 3D models, images, textures and the occasional configuration file. Anything you upload in Composer appears here too, since it is the same library.

## Where your files live

On Shopify's own file storage, alongside everything else you have uploaded to your store. They are served from Shopify's content network, the same one your product photos come from.

This matters for two reasons. Your files are not dependent on us staying up, and they benefit from Shopify's delivery network, which is fast and close to your shoppers.

You can see them in your Shopify admin under **Content**, then **Files**, mixed in with your other uploads.

## Uploading

There are two ways in, and dragging files onto the page is not one of them.

**Upload files**, the button at the top right of the library, opens a file picker. You can select several at once, and the page shows how many are still going up.

**Import from URL** takes a link to a file that is already hosted somewhere public, and copies it into your store's files. Paste the address into the field and press **Import URL**.

The third way is Composer itself: upload at the point you need the file, which is usually the most convenient of the three. It lands in this same library.

Large files take a moment after upload while Shopify processes them. The list shows a **Processing** badge while that is happening and refreshes itself when it turns to **Ready**. A file that did not make it shows **Failed**.

The size limit for a single file is 100 MB, and anything larger is refused before the upload starts. That is far larger than a model you should put on a product page - see [What to Expect](/learn/3d-bits/quick-start/what-to-expect) on why smaller is better.

Every row has a **Copy URL** button, which is what you want when a setting somewhere asks for a link to a file.

## Filtering

Buttons across the top of the list filter it by kind: **All**, **3D models**, **Images**, **JSON config**, **JS runner** and **Other**. On a store with a lot of files this is the quickest way to find what you want. The list is paginated, and you can change how many rows it shows at a time.

## Files a project owns

When a project publishes, it writes its configuration out as a file, and a project built around a script writes the compiled program out as another. Both appear in the library with a **Published** badge, and instead of a Delete button they say **Managed by**, followed by the project's name as a link you can follow.

You cannot delete those from here, because the product pages using them would break. Deleting the project removes them.

Everything you uploaded yourself - your models, your images, your textures - stays ordinary. It carries no badge and it has a Delete button, so take a moment before you use it: deleting a model that a published configurator loads will break that configurator, and the app cannot warn you which ones.

## A note on privacy

Files on Shopify's storage are publicly reachable by anyone who has the URL. That is how they get to your shoppers' browsers, and it is true of your product photos as well.

It means a 3D model on your storefront is, in practice, downloadable by someone determined enough. If your models represent designs you would rather not hand out, [Asset Security](/learn/3d-bits/3d-assets/asset-security) discusses what you can and cannot do about it.
