---
sidebar_position: 2
title: Creating Scripts in Bitbybit
sidebar_label: Create a New Script
description: Start a script without a project and find it again in Drafts, or add a script to a project in the cloud or in this browser, and read where a script lives from its address.
topic: platform.scripts.create
type: how-to
verified: 2026-10-09
tags: [getting-started, scripts]
---

# Creating Scripts in Bitbybit

## Without a project

Open an editor from <Ui>Apps</Ui> in the bitbybit.dev header, or by its address, and start working. No account is needed.

- **Rete:** [`https://bitbybit.dev/app?editor=rete`](https://bitbybit.dev/app?editor=rete)
- **Blockly:** [`https://bitbybit.dev/app?editor=blockly`](https://bitbybit.dev/app?editor=blockly)
- **TypeScript:** [`https://bitbybit.dev/app?editor=typescript`](https://bitbybit.dev/app?editor=typescript)
- **Designer:** [`https://bitbybit.dev/app?editor=designer`](https://bitbybit.dev/app?editor=designer), on the Gold plan

[`https://bitbybit.dev/app`](https://bitbybit.dev/app) alone asks which editor to start.

Nothing is stored until the script holds something. From your first change, it is kept as a draft in this browser, in the <Ui>Drafts</Ui> project, named after its editor and the time you started. You can rename it, move it to the cloud, or import it into another project later. A draft lives on this device only, like every project in this browser: [export it](/learn/getting-started/basics/scripts/save-to-file) to keep a copy anywhere else.

## In a project

{/* shot: platform.scripts.create/new-script */}

1. In [My Projects](https://bitbybit.dev/projects/my), choose the project: one in the cloud or one in this browser.
2. Choose <Ui>New script</Ui>.
3. Give it a <Ui>Title</Ui> and choose its <Ui>Editor</Ui>.
4. Choose <Ui>Create and open</Ui>.

The editor opens with a small example to change or delete. A cloud script is saved to your account as you work ([how saving works](/learn/getting-started/basics/scripts/auto-save)). When a project holds as many scripts as your plan allows, <Ui>New script</Ui> is greyed out.

## Where a script lives, from its address

A cloud script's address names its author, project and script, and works on any device for whoever may open it:

`https://bitbybit.dev/app/[public-user-name]/[project-id]/[script-id]?editor=[rete|blockly|typescript|designer]`

For example: [`https://bitbybit.dev/app/matas/mlN4ge3rHJbe0R9suBns/CS3ulgvY7eVh2di8FXHK?editor=rete`](https://bitbybit.dev/app/matas/mlN4ge3rHJbe0R9suBns/CS3ulgvY7eVh2di8FXHK?editor=rete)

A script in this browser has an address that starts with `https://bitbybit.dev/app/_local/`. It opens only in the browser that keeps it.
