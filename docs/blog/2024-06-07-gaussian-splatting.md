---
slug: gaussian-splatting
title: "GAUSSIAN SPLATTING: Bringing Realistic 3D Scans to Your Projects"
authors: [ubarevicius]
tags: [bitbybit, cad]
description: "Explore the power of 3D Gaussian Splatting for creating realistic 3D scans of real-world objects and scenes, and learn how to integrate them into your Bitbybit.dev projects."
---

![Rete editor showing a Gaussian Splatting 3D scan of a plant placed within a CAD-designed vase.](https://ik.imagekit.io/bitbybit/app/assets/blog/gaussian-splatting/gaussian-splatting.jpeg "Rete editor with Gaussian Splatting 3D scan of a plant in the CAD vase")

The ability to include realistic 3D scans of real-world objects and environments directly into your Bitbybit.dev scenes opens up a multitude of new creative and practical scenarios. In this blog post, we'll dive into what Gaussian Splatting is, its potential uses, and how you can leverage it on our platform.

<!-- truncate -->

### What is 3D Gaussian Splatting?

3D Gaussian Splatting is an innovative and relatively new technique that allows for the creation of volumetric 3D scans of scenes and objects using a collection of photos taken from different angles. It represents the 3D scene not with traditional polygons or point clouds, but by turning each point into a soft, blended, semi-transparent ellipsoid (a "Gaussian splat").

This method makes 3D models look remarkably smooth and realistic, often improving the overall visual quality and performance when compared to other, usually more complicated, 3D scanning and rasterization techniques.

In the video below, we demonstrate several 3D models scanned using this technique. You can also find these examples in our Public Projects section.

<div class="responsive-video-container">
<iframe width="560" height="315" src="https://www.youtube.com/embed/rzrL01vvK_c" title="Gaussian Splatting 3D Scans on Bitbybit.dev" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</div>

### Potential Use Cases

While the technique is still evolving, it has already found its place in various industries. Here are some potential use cases for Gaussian Splatting in conjunction with Bitbybit.dev:

*   **Interior Design:** Scan an existing room and then place your parametrically designed furniture or decor (created in Bitbybit.dev) within it. This allows you to visualize how your objects will look in a real-world context and make necessary adjustments before production.
*   **Art & Archival:** Scan your art pieces, sculptures, or historical artifacts and present them in interactive 3D. This offers a new, innovative way to showcase art and can reach a wider audience.
*   **E-Commerce:** Scan your products and present them in attractive, realistic 3D environments for your online store, allowing buyers to inspect items from all angles.
*   **Engineering & Product Design:** Imagine you're designing a custom alloy wheel in Bitbybit.dev. You could scan a production car, perhaps remove its existing wheels in an editor like SUPERSPLAT, and then place your newly designed wheel onto the car scan to see how it looks.
*   **Game Development & Virtual Environments:** Quickly capture real-world locations or objects to use as assets in games or simulations.

We are sure there are many more ways this powerful feature can be important and beneficial for your projects!

### How To Create And Edit Gaussian Splats

Several user-friendly apps make scanning and creating 3D splats quite accessible:
*   **Luma AI:** A popular choice for capturing and processing Gaussian Splats.
*   **Polycam:** Another well-regarded app offering 3D scanning capabilities, including support for Gaussian Splatting.
You should be able to find these and similar apps on the iOS App Store and Google Play Store.

When it comes to editing your 3D scans (e.g., cleaning up artifacts, cropping, or adjusting density), we found that the PlayCanvas web editor called **SUPERSPLAT** is incredibly easy to use. It works really fast in the browser and does a great job of presenting the scans in an intuitive way.

*   **Try SUPERSPLAT Editor:** [playcanvas.com/supersplat/editor](https://playcanvas.com/supersplat/editor)

![Screenshot of the SUPERSPLAT editor by PlayCanvas, showing a Gaussian Splat being edited.](https://ik.imagekit.io/bitbybit/app/assets/blog/gaussian-splatting/supersplat.jpeg "SUPERSPLAT editor from PlayCanvas")

**Recommendation:** When exporting from SUPERSPLAT or other tools, we strongly advise you to export to the binary `.splat` file format. It is compatible with our platform and is generally much lighter in file size compared to other formats like `.ply` when used for splats.

### How To Import Gaussian Splats To BITBYBIT.DEV

There are a couple of ways to bring your Gaussian Splat files into Bitbybit.dev:

1.  **Using Local Files (for private use/testing):**
    If you want to use your 3D scan locally without uploading it to our cloud and sharing it, you can upload the `.splat` or `.ply` file directly from your computer into your browser's memory for the current session. Follow this guide:
    *   [Guide: Upload Local Assets](https://bitbybit.dev/start/getting-started/general/assets/local)

2.  **Uploading as Cloud Assets (for sharing and persistent storage):**
    If you have a 3D scan that you'd like to upload to Bitbybit.dev as a cloud asset (making it accessible across your projects and potentially shareable):
    *   You'll first need to be subscribed to one of our paid plans.
    *   Check that your `.splat` file size fits within the asset size limits assigned to your particular plan.
    *   You can then upload your file as an asset to your projects.
    *   [Guide: Upload Cloud Assets](https://bitbybit.dev/start/getting-started/general/assets/cloud)

**Using Gaussian Splats in Your Scripts:**
Once you have your asset accessible (either via a local object URL or a cloud asset URL), you can use the `bitbybit.babylon.gaussianSplatting.create` method in Rete, Blockly, or TypeScript.
This method expects you to provide a publicly accessible URL to the `.splat` (or `.ply`) file.
*   You can copy-paste the public URL if your asset is hosted elsewhere.
*   If using Bitbybit.dev cloud assets, you can use `bitbybit.assets.getFile` to load the asset by its file name directly from our cloud storage, create an object URL from that file, and then pass this object URL to the `gaussianSplatting.create` component/function.

Feel free to check out these open-source projects on Bitbybit.dev to see how we have implemented this feature:
*   [Project: 3D Ruta (Girl in a dress)](https://bitbybit.dev/projects/public/UBzXJuiF3BaG3Yuu2Kaa/project-3d-ruta-by-author-bitbybit)
*   [Project: 3D Bike Scan Gaussian Splatting](https://bitbybit.dev/projects/public/JKpvUltDwDVhSb43fg8f/project-3d-bike-scan-gaussian-splatting-by-author-bitbybit)
*   [Project: 3D Plant Gaussian Splatting](https://bitbybit.dev/projects/public/ydUspjyfKUpXgIi1ON6A/project-3d-plant-gaussian-splatting-by-author-bitbybit)
*   [Project: Parametric Table With Gaussian Splatting Palm Tree](https://bitbybit.dev/projects/public/ns2SZOxIjoCgavvJM3yF/project-parametric-table-with-gaussian-splatting-palm-tree-by-author-bitbybit)

We're excited to see what you create with Gaussian Splatting on Bitbybit.dev!