---
sidebar_position: 8
title: Importing Scripts From a Local File
sidebar_label: Import Script From File
description: Learn how to import previously saved .bitbybit script files (Blockly, Rete, or TypeScript) back into the Bitbybit editors.
tags: [getting-started, scripts]
---

# Importing Scripts From a Local File

## How Importing Works

You can import scripts that you've previously [saved to a `.bitbybit` file](/learn/getting-started/basics/scripts/save-to-file) back into the Bitbybit platform.

**Important Considerations for Importing:**
*   **Editor Context:** You must be in one of our editors (Rete, Blockly, or Monaco for TypeScript) to import a file.
*   **Matching File Type:** The type of file you import must match the editor you are currently using:
    *   You can only import `-rete.bitbybit` files into the **Rete editor**.
    *   You can only import `-bl.bitbybit` files into the **Blockly editor**.
    *   You can only import `-ts.bitbybit` files into the **Monaco (TypeScript) editor**.
*   **Mismatched Types:** If you attempt to import a file of an incompatible type (e.g., trying to import a Blockly script into the Rete editor), the import will likely fail, and the editor canvas will remain unchanged.

## How to Import a Script From a File

Follow these steps to import a `.bitbybit` file into your current editor:

1.  **Open the "More Actions" Menu:**
    While in the appropriate editor (Rete, Blockly, or TypeScript), locate the "More Actions" menu button. This button often looks like three dots (`...`) or a similar icon indicating additional options. Depending on your screen size and layout, this menu might appear in a vertical or horizontal orientation within the editor's interface.

    ![The "More Actions" menu button in the Bitbybit editor interface.](https://ik.imagekit.io/bitbybit/app/assets/start/general/projects/scripts/more-actions.jpeg "Button To Open More Actions")
    *Button To Open More Actions*

2.  **Click the "Import" Button:**
    Once the "More Actions" menu is open, find and click the **"Import"** button.

    ![The "Import" button within the "More Actions" menu, used to load a script from a local file.](https://ik.imagekit.io/bitbybit/app/assets/start/general/projects/scripts/import.jpeg "Import button that loads script from a file")
    *Import button that loads script from a file*

3.  **Select Your File:**
    Your browser will open a file selection dialog. Navigate to and select the `.bitbybit` file you wish to import. Ensure it's the correct type for your current editor.

**After Importing:**
*   The contents of the imported script will be interpreted and loaded onto your editor canvas (or into the code editor for TypeScript).
*   You can then click the **"Run" button** to execute the imported script and see its output.

This feature allows you to easily resume work on previously saved local scripts or share scripts with others via file transfer.