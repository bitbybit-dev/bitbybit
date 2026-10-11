---
sidebar_position: 9
title: Editor settings
sidebar_label: Editor Settings
description: The settings every coding editor on bitbybit.dev shares - split screen, monochrome wires, right-angled wires, labelled ends for wires between groups, the camera gizmo, the language, the rendering engine and the CAD kernel's 32 or 64-bit architecture - what each changes and which ones reload the editor.
topic: platform.basics.settings
type: reference
verified: 2026-10-10
tags: [getting-started, rete, blockly, typescript]
---

# Editor settings

{/* shot: platform.basics.settings/dialog */}

Rete, Blockly and the TypeScript editor share one set of settings: open <Ui>More</Ui> > <Ui>Settings</Ui> in any of them. They are kept in this browser, so they follow you from script to script but not to another computer.

| Setting | What it changes |
|---|---|
| <Ui>Split-screen mode</Ui> | On, the editor and the 3D view sit side by side, with a divider to drag. Off, each takes the whole window and <Ui>Swap Canvas</Ui> (<kbd>F4</kbd>) switches between them. A phone always works one at a time. |
| <Ui>Monochrome colors</Ui> | Draws Rete's sockets and wires in one colour instead of a colour per type, for a calmer canvas. |
| <Ui>Right-angled wires</Ui> | Draws Rete's wires as horizontal and vertical runs with rounded corners, each output of a node turning in a lane of its own, so wires side by side never overlap. Off, wires are curves. On by default. |
| <Ui>Shorten wires between groups to labelled ends</Ui> | A wire from one [group](../coding-editors/rete/features/organise.md) to another is drawn as two short ends, each labelled with what is at the other end. Point at a label, or select either node, to see the whole wire. On by default. |
| <Ui>Camera gizmo over the 3D view</Ui> | Shows the axes widget and zoom buttons in the corner of the 3D view; click an axis to look along it. |
| Language | The language of the editors' menus, components and blocks: English, Lietuvių, Latviešu, Eesti, Svenska, 简体中文, Español, हिन्दी, Français, Polski, Suomi, العربية, বাংলা, Português, Українська, Bahasa Indonesia, Deutsch or Русский. These docs are in English. |
| <Ui>Rendering engine</Ui> | WebGL works in every browser; WebGPU is newer and faster where the browser supports it. |
| <Ui>CAD kernel (OCCT) architecture</Ui> | 32-bit is the default, smaller to download and right for almost every script; it can use up to 2 GB of memory. 64-bit can use up to 16 GB, for very large models and big STEP files, and takes longer to load. |

The five switches apply as you flip them. The language, the rendering engine and the kernel architecture apply when you press <Ui>Save</Ui>: the editor reloads to change them, and asks first, so save your script before you confirm with <Ui>Reload</Ui>.
