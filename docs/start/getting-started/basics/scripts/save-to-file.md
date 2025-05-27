---
sidebar_position: 7
title: Saving Your Scripts to a Local File
sidebar_label: Save Script to File
description: Learn how to export your Bitbybit scripts (Blockly, Rete, or TypeScript) to a local file for backup, sharing, or offline storage.
tags: [getting-started, scripts]
---

# Saving Your Scripts to a Local File

## Why Save a Script to a File?

Exporting your Bitbybit scripts to a local file on your computer can be useful in several scenarios:

*   **No Account/Offline Work:** If you don't have a Bitbybit account or are working on a [local, unsaved script](/start/getting-started/basics/scripts/create-script#how-to-create-a-new-local-script-unsaved), saving to a file is the primary way to preserve your work.
*   **Sharing Privately:** If you want to share your work with someone without making your project public on our platform.
*   **Version Control/Backups:** To save different versions or milestones of your scripts for later use or as personal backups, independent of the [cloud auto-save](/start/getting-started/basics/scripts/auto-save).

All script types on our platform (Blockly, Rete, and TypeScript) can be exported to a file and then later imported back into Bitbybit.

## How to Save Your Script to a File

Follow these steps to export your current script:

1.  **Open the "More Actions" Menu:**
    While in any of our editors, locate the "More Actions" menu button. This button often looks like three dots (`...`) or a similar icon indicating additional options. Depending on your screen size and layout, this menu might appear in a vertical or horizontal orientation within the editor's interface.

    ![The "More Actions" menu button in the Bitbybit editor interface.](https://ik.imagekit.io/bitbybit/app/assets/start/general/projects/scripts/more-actions.jpeg "Button To Open More Actions")
    *Button To Open More Actions*

2.  **Click the "Export" Button:**
    Once the "More Actions" menu is open, find and click the **"Export"** button.

    ![The "Export" button within the "More Actions" menu, used to save the current script to a file.](https://ik.imagekit.io/bitbybit/app/assets/start/general/projects/scripts/export.jpeg "Export button that saves script to a file")
    *Export button that saves script to a file*

    This will trigger your browser to download the script as a file.

**File Format and Naming:**
*   All files exported from our platform will have the **`.bitbybit`** extension.
*   While you can open these `.bitbybit` files with a text editor to see their contents (they are typically JSON-based), only the Bitbybit platform editors are designed to import and interpret these files correctly.
*   We also include an indicator in the filename to denote the script type:
    *   Blockly scripts: `your-script-name-bl.bitbybit`
    *   Rete scripts: `your-script-name-rete.bitbybit`
    *   TypeScript scripts: `your-script-name-ts.bitbybit`

---

Now that you know how to save your scripts to a file, you can also learn how to [import them back into the Bitbybit platform](/start/getting-started/basics/scripts/import-file).