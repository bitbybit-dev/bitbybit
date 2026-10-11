---
sidebar_position: 7
title: Saving Your Scripts to a Local File
sidebar_label: Save Script to File
description: Export a script from its editor as a .bitbybit file, or every project in this browser as one zip, to keep a copy, share it privately or move it to another browser.
topic: platform.scripts.export
type: how-to
verified: 2026-10-09
tags: [getting-started, scripts]
---

# Saving Your Scripts to a Local File

A file keeps a copy of your work outside bitbybit.dev:

- **a backup** of a script or a version you want to keep, beside its [history](/learn/getting-started/basics/scripts/auto-save#history);
- **a private share**, sent to someone without making the project public;
- **a move** of drafts and projects in this browser to another browser or computer.

## Export a script

{/* shot: platform.scripts.export/more-menu */}

1. In the editor, open <Ui>More</Ui>, the last button of the editor's left bar.
2. Choose <Ui>Export</Ui>.

Your browser downloads the script as a `.bitbybit` file, named after its editor and the moment you exported it:

| Editor | File name |
|---|---|
| Rete | `workspace-rete_2026-10-09_14-30-00.bitbybit` |
| Blockly | `workspace-bl_2026-10-09_14-30-00.bitbybit` |
| TypeScript | `workspace-ts_2026-10-09_14-30-00.bitbybit` |

A `.bitbybit` file is JSON, so a text editor can show it, but only the bitbybit.dev editors read it back: see [Importing Scripts](/learn/getting-started/basics/scripts/import-file). The Designer exports its own way, from its <Ui>File</Ui> menu: see [Export and import design files](/learn/designer/get-started/export-import).

<Ui>Copy to Clipboard</Ui>, in the same menu, copies the script instead, to paste into another editor of the same kind with <Ui>Paste from Clipboard</Ui>.

## Export projects in this browser

Projects kept in this browser export whole, as zip files, from [My Projects](https://bitbybit.dev/projects/my):

- <Ui>Export</Ui>, on a project, saves that project as one zip.
- <Ui>Export all</Ui>, at the top, saves every project in this browser, <Ui>Drafts</Ui> included, as one zip.

A cloud project is kept in your account, which works from any device; export its scripts one by one from their editors to keep copies of your own.
