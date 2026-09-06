---
sidebar_position: 6
title: "Helpers"
sidebar_label: Helpers
description: The CAD converter, the 3D inspector, and the metafields page you need once at the very end.
tags: [shopify, 3d-bits, cad, metafields]
---

# Helpers

A few tools that do not belong anywhere else. You will use the first two occasionally, and the third twice: once if you inherited an old setup, and once on the way out.

## Converters

Turns CAD files into a format the web can display.

If your product exists as a STEP file, which is what most CAD packages export for sharing, this converts it to glTF. That is the format 3D Bits and every web 3D viewer works with. Compressed STEP files carrying the `.stpz` extension are handled too.

Conversion is a starting point rather than a finished asset. CAD models carry far more detail than a web page needs, so the result usually wants a pass to reduce its size and to check the parts are grouped the way your options need. [Preparing 3D Assets](/learn/3d-bits/3d-assets/preparing-gltf) covers that.

## 3D Inspector

Opens a 3D file and shows you what is inside it.

This is the tool for answering "why is my model not working". It shows the parts and how they are named and nested, the materials and the textures, and the triangle and vertex counts that decide how heavy the model is - with warnings when any of those is too high for a product page. When a configurator will not switch between parts the way you expected, the reason is almost always visible here, and it is usually that parts you thought were separate are not.

It does not list animations. For those, open the model in Composer and use **Parse Structure** in the Models section, which lists the animation clips a glTF file carries alongside its nodes, materials and variants. See [Model Properties](/learn/3d-bits/composer/models/model-properties).

Useful before you build anything, to check a model is fit for the job.

## Metafields

The original way to put 3D on a product, from before projects existed. You created metafield definitions here, then pasted a model link or a scene configuration onto each product by hand.

It still works, and stores set up this way keep running. It is marked as advanced because there is no reason to start here now. Projects do the same job without hand-editing anything per product, and give you the options panel, pricing and version history as well. Publishing a project creates whatever definitions it needs by itself, so you never have to visit this page for a project you built in the app.

If you have products set up the old way, [Metafields](/learn/3d-bits/admin/metafields) documents the workflow. Moving one over means rebuilding it as a project and publishing, and the app leaves your existing setup alone until you do.

### The one modern reason to open this page

Cleanup before uninstalling. The 3D Bits product metafields belong to your store rather than to us, so they survive an uninstall and we cannot remove them afterwards. If you want them gone, clear them from this page while the app is still installed - or unpublish your projects, which clears them as it goes. [Storefront Display](/learn/3d-bits/admin/storefront-display) covers the rest of the uninstall tidy-up.

:::danger Deleting here reaches further than the list on the page
The delete button removes **all** 3D Bits metafield definitions, including the ones your published projects run on - not only the manual ones this page lists. It then asks whether to erase the saved values on your products as well. If you say yes, every published configurator disappears from its product page immediately, configured pricing stops being enforced, and the app cannot put the values back - each project has to be published again. That is exactly what you want on the way out, and never what you want otherwise.
:::
