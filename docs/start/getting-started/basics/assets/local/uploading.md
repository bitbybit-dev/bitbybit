---
sidebar_position: 2
title: Uploading Local Assets to Browser Storage
sidebar_label: Uploading Local Assets
description: Learn the step-by-step process for uploading local assets (like .glb files) to your browser's storage for use in your Bitbybit scripts.
tags: [getting-started, assets]
---

# Uploading Local Assets to Browser Storage

## Introduction

This section explains how to upload **local assets** to your web browser's storage. This makes them available for use in your Bitbybit scripts without needing to use cloud storage or have a Bitbybit account (for this specific feature).

For this exercise, please download the following sample asset file:
*   [BoomBox.glb](https://ik.imagekit.io/bitbybit/app/assets/start/blockly/local-assets/BoomBox.glb) (Click to download)

We will use this `BoomBox.glb` file to walk through the local asset upload process.

## How to Upload a Local Asset

The process for uploading local assets is consistent across all Bitbybit editors (TypeScript, Blockly, and Rete).

1.  **Find the "Manage Local Assets" Button:**
    In any editor, look for a button that typically resembles a **folder icon**. This button is used to manage your local assets.

    ![The "Manage Local Assets" button, usually depicted as a folder icon, in the Bitbybit editor interface.](https://ik.imagekit.io/bitbybit/app/assets/start/general/assets/local/local-asset-icon.jpeg "Button To Manage Local Assets")
    *Button To Manage Local Assets*
    *(Note: On larger screens, this button might be part of a vertical panel, but the folder icon should remain consistent.)*

2.  **Open the Local Asset Manager Dialog:**
    Clicking the "Manage Local Assets" button will open a dialog window. This dialog allows you to upload new local assets and view existing ones.

    ![The initial dialog for managing local assets, showing an option to upload files.](https://ik.imagekit.io/bitbybit/app/assets/start/general/assets/local/upload-local-asset.jpeg "Dialog for uploading local assets")

3.  **Prepare to Upload:**
    Within this dialog, you'll find an area to initiate a new asset upload. You'll typically need to:
    *   **Enter Asset Name:** Type a name for your asset. For this example, type "**BoomBox**" into the name input field.
    *   **Choose File(s):** Click the "Choose files" (or similar) button. This will open your computer's file navigator.

    ![The form within the local asset manager for naming the asset and choosing a file to upload.](https://ik.imagekit.io/bitbybit/app/assets/start/general/assets/local/upload-local-asset-form.jpeg "Form For Local Asset")
    *Form For Local Asset*

4.  **Select the File:**
    In the file navigator, navigate to your "Downloads" folder (or wherever you saved `BoomBox.glb`) and select the `BoomBox.glb` file.

5.  **Confirm and Upload:**
    *   After selecting the file, its name (`BoomBox.glb`) should appear in the dialog, indicating it's ready for upload.
    *   Click the **"Upload"** button.

6.  **View Uploaded Asset:**
    The file will be uploaded to your browser's local storage. You will then be returned to the list of all your local assets within the dialog. You should now see "BoomBox" (or `BoomBox.glb`) listed.
    This local asset manager also allows you to:
    *   Delete existing local assets.
    *   Upload more assets if needed.
    *   Potentially download previously uploaded local assets from your browser back to your computer's file system.

    ![The local asset manager dialog showing the "BoomBox" asset successfully uploaded and listed.](https://ik.imagekit.io/bitbybit/app/assets/start/general/assets/local/uploaded.jpeg "Local Asset Manager With Uploaded BoomBox Asset")
    *Local Asset Manager With Uploaded BoomBox Asset*

7.  **Close the Dialog:**
    If you see the "BoomBox" asset listed, you have successfully uploaded it. You can now close the local asset manager dialog by clicking anywhere on the semi-transparent background area outside the dialog.

Your `BoomBox.glb` file is now stored locally in your browser and ready to be used in your Bitbybit scripts! While this asset isn't yet visible in your 3D environment, from this point on, you can access it programmatically within your scripts.

Proceed to the other sections of this guide to see how this locally uploaded file can be used in our various editors.