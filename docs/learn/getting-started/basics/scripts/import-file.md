---
sidebar_position: 8
title: Importing Scripts From a Local File
sidebar_label: Import Script From File
description: Import a .bitbybit file into the editor it was made in, or a zip of projects or a single script into this browser from My Projects.
topic: platform.scripts.import
type: how-to
verified: 2026-10-09
tags: [getting-started, scripts]
---

# Importing Scripts From a Local File

## Into the editor

A `.bitbybit` file [exported from an editor](/learn/getting-started/basics/scripts/save-to-file) opens again in an editor of the same kind.

1. In the editor, open <Ui>More</Ui>, the last button of the editor's left bar.
2. Choose <Ui>Import</Ui>.
3. Choose the `.bitbybit` file.

The file replaces what the editor shows, and the version it replaces is kept in the script's [history](/learn/getting-started/basics/scripts/auto-save#history). Choose <Ui>Run The Code</Ui>, the play button at the top of the left bar, to see its result.

The file must come from the same editor: Rete scripts import into the Rete editor, Blockly into Blockly and TypeScript into TypeScript. A file from another editor is refused, and the editor says which editor to open instead; what was on screen stays as it was. A Rete module file imports into the Rete editor as a module.

## Into this browser

{/* shot: platform.scripts.import/my-projects */}

[My Projects](https://bitbybit.dev/projects/my) brings files into the projects kept in this browser:

- <Ui>Import</Ui>, at the top, takes a zip that <Ui>Export</Ui> or <Ui>Export all</Ui> made and adds its projects, or a single `.bitbybit` script, which lands in <Ui>Drafts</Ui>.
- <Ui>Import scripts</Ui>, on a project in this browser, adds scripts to that project.

From there, a project can [move to the cloud](/learn/getting-started/basics/scripts/auto-save#move-a-script-to-the-cloud).
