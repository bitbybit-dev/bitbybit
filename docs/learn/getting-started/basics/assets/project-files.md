---
sidebar_position: 2
title: Files of a Project
sidebar_label: Files of a Project
description: The recommended way to give scripts their files - add them to the project, kept in this browser or in the cloud, load them by name or title, and take them along when a project in this browser moves to the cloud.
topic: platform.assets.project-files
type: how-to
verified: 2026-10-11
tags: [getting-started, assets, projects]
---

# Files of a project

The recommended place for a script's files is **its project**. A STEP model, a font, a texture or a table added to a project belongs to that project: every script in it can load the file, an export of the project carries it, and when a project kept in this browser moves to the cloud, its files go with it. Start every piece of work this way, whether the project is in the cloud or in this browser.

The editor's [browser asset catalog](/learn/getting-started/basics/assets/local/intro) is the other way, for quick tests: its files are open to every project in this browser, but they belong to none, so they cannot be moved to the cloud or exported with a project.

## Add files to a project

1. Open the project in the projects list: on [My Projects](https://bitbybit.dev/projects/my), or from an editor by clicking the script's title. Projects kept in this browser are under <Ui>This browser</Ui>.
2. Below the project's scripts is <Ui>Files</Ui>. Click <Ui>Add files</Ui> and pick one or more files.
3. Give each file a **title**, which starts as its file name without the extension. Scripts load a file by its title or by its file name. <Ui>One title for all</Ui> puts several files under one title, such as a glTF model and its textures, so they can be loaded together as a list.
4. Add them. The list shows each file under its title.

A project kept in this browser takes any type of file, kept in this browser only; its files can only be deleted from the list, and an <Ui>Export</Ui> of the project carries them in its file. A cloud project takes the file types and names the cloud allows, within your plan's limits, and each of its files can be downloaded or its address copied: [Uploading cloud assets](/learn/getting-started/basics/assets/cloud/uploading) covers those details.

The Designer cannot add files to a project kept in this browser: move the project to the cloud first.

## Load a file in a script

Every editor loads a project's files the same way:

- the <Ui>get file</Ui> component or block, and `bitbybit.asset.getFile` in TypeScript, give the file as a File, to hand to a loader such as the STEP or glTF import;
- <Ui>get text file</Ui>, `bitbybit.asset.getTextFile`, gives its text, for JSON, CSV or SVG.

Name the file by its file name or by its title. In a project kept in this browser, the project's own files are looked up first; a script copied from someone else's cloud project still finds that project's files.

<Ui>get local file</Ui>, `bitbybit.asset.getLocalFile`, finds a project's files too, after the browser asset catalog, and gives every file under a title as a list: the way to load a model with its textures. [Using cloud assets](/learn/getting-started/basics/assets/cloud/using) shows the calls in Rete, Blockly and TypeScript.

## Move the project to the cloud, files and all

A project kept in this browser can become a cloud project, so it is backed up, opens on any device and can be shared. Open the project and choose <Ui>Move to the cloud</Ui>: its scripts and its files go to a new private cloud project, and then leave this browser, their history coming along.

- **Your plan is checked first**, before anything moves: the number of files a project keeps, the size of each file, your cloud storage, the number and size of scripts. A project that does not fit stays as it is, and the message says why.
- **The cloud's file rules apply.** A file of a type or a name the cloud does not take, or one whose name is already used by a different file in the cloud project, stays in this browser, and so does the project until it has moved. Rename or replace the file, then <Ui>Resume</Ui> the move from the project.
- **Move the whole project, not one script.** <Ui>Save to cloud</Ui> in an editor, and the cloud button beside a script, move that script alone: the project's files stay in this browser, and the script will not find them in the cloud. Move the project instead, or add the files to the cloud project yourself.

Files in the browser asset catalog never move: download them from the editor's <Ui>Assets</Ui> dialog and add them to the project before you move it.
