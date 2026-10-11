---
sidebar_position: 2
title: Uploading Local Assets to Browser Storage
sidebar_label: Uploading Local Assets
description: Upload a file to this browser's local asset storage with the editor's Assets dialog - name it, choose or drop the file, upload - and read it in any script you open in the same browser.
topic: platform.assets.local-upload
type: how-to
verified: 2026-10-09
tags: [getting-started, assets]
---

# Uploading Local Assets to Browser Storage

## Introduction

This section explains how to upload files to the **browser asset catalog**, which keeps them in this browser for every script you open here, without cloud storage or an account. It is meant for quick tests: catalog files cannot be moved to the cloud, so for files you keep, [add them to the project](/learn/getting-started/basics/assets/project-files) instead.

For this exercise, please download the following sample asset file:
*   [BoomBox.glb](https://bitbybit.dev/files/site/start/blockly/local-assets/BoomBox.glb) (Click to download)

We will use this `BoomBox.glb` file to walk through the local asset upload process.

## How to Upload a Local Asset

The Assets dialog is the same in Rete, Blockly and TypeScript.

1.  **Open the Assets dialog.** Click <Ui>Assets</Ui>, the folder button at the lower left of the editor. The dialog lists the <Ui>Local assets stored in browser cache:</Ui>, none at first.

    {/* shot: platform.assets.local-upload/dialog */}

2.  **Start an upload.** Click <Ui>Upload Local Asset</Ui>.
3.  **Name the asset.** Type **BoomBox** under <Ui>Asset Name</Ui>. Scripts find the asset by this name, so it must be one no other local asset has.
4.  **Choose the file.** Click <Ui>Click to choose files or drop them here</Ui> and pick `BoomBox.glb` where you saved it, or drop the file there. It appears below with its size. The allowed formats are listed under the drop area.

    {/* shot: platform.assets.local-upload/form */}

5.  **Upload.** Click <Ui>Upload</Ui>. The file is kept in this browser, and the dialog lists it under its name, with buttons to download it again or delete it.

    {/* shot: platform.assets.local-upload/list */}

6.  **Close the dialog** with <Ui>Close</Ui>.

Your `BoomBox.glb` file is now stored locally in your browser and ready to be used in your Bitbybit scripts! While this asset isn't yet visible in your 3D environment, from this point on, you can access it programmatically within your scripts.

Proceed to the other sections of this guide to see how this locally uploaded file can be used in our various editors.