---
sidebar_position: 3
title: "Designer tools for agents"
sidebar_label: "Tools for agents"
description: "The tools the Designer offers AI agents while it is open: reading documents and builds, running any command, applying patches, selecting, locating, capturing the view and undoing."
topic: designer.reference.agent-tools
type: reference
tags: [designer]
---

{/* Generated from the Designer itself; edits to this page are overwritten. */}

# Designer tools for agents

While the Designer is open, it offers these tools to agents in two ways: on the page as `window.bitbybitDesigner`, where `tools()` lists them and `call(name, input)` runs one, and to the browser's own agent through WebMCP, in browsers that support it. Closing the Designer takes them away.

Every [command](./commands.md) is reached through `designer-run-command`, so a new command needs no new tool. What an agent changes waits for the person in the <Ui>Review</Ui> tab, and a tool that changes the design returns once the build has settled. [Working with agents](../working-with-agents.md) describes the session from the person's side.

## designer-list-documents {#designer-list-documents}

**List design documents.** Lists the project's part and assembly documents with their ids, names and kinds, and which one is open. It reads and changes nothing.

It takes no input.

## designer-read-document {#designer-read-document}

**Read a design document.** Returns a design document's JSON and its revision: the open one, or the one named. Patches name the revision they were made against. It reads and changes nothing.

Input:

- `document` (string): The document's id; the open one when left out.

## designer-read-build {#designer-read-build}

**Read the build.** Waits for the open document's build to settle, then returns its state, problems, features with their status, parts with volume, mass and connectors, and for an assembly its components, joints and bill of materials. It reads and changes nothing.

Input:

- `wait` (boolean): False returns at once, settled or not.

## designer-read-selection {#designer-read-selection}

**Read the selection.** Returns the selected tree rows and the faces and edges picked in the view, with their labels and the references a command would write for them. It reads and changes nothing.

It takes no input.

## designer-list-commands {#designer-list-commands}

**List commands.** Lists the Designer's commands with their arguments, and whether each can run now or why not. A query narrows the list by words in the title or description. It reads and changes nothing.

Input:

- `query` (string): Words to look for.

## designer-run-command {#designer-run-command}

**Run a command.** Runs one Designer command with its arguments, as the toolbar and menus do, once the view is ready and the last build has settled, and waits for its build. Returns the change it made, the new revision and the build's state, or why the command refused. It changes the design, and the person reviews the change. A browser may ask the person before its agent runs it.

Input:

- `id` (string, required): The command's id, such as part.extrude.
- `args` (object): The command's arguments, as designer-list-commands describes them.

## designer-apply-patch {#designer-apply-patch}

**Apply a patch.** Changes a design document by an RFC 6902 patch (add, remove, replace and test), as one undoable change under a label, and waits for the build. A baseRevision says which revision the patch was made against. It changes the design, and the person reviews the change. A browser may ask the person before its agent runs it.

Input:

- `patch` (list of objects, required): The operations, applied in order.
- `baseRevision` (number)
- `label` (string): What the change does, as the history shows it.
- `document` (string): The document's id; the open one when left out.

## designer-select {#designer-select}

**Select.** Selects tree rows (such as feature:extrude1, component:arm-1 or joint:j1), or picks faces and edges in the view by the names the document gives them, as a click would before a command that takes picks. It changes the session, such as what is selected, but not the design.

Input:

- `rows` (list of strings)
- `faces` (list of objects)
- `edges` (list of objects)
- `additive` (boolean): Adds to the picks instead of replacing them.
- `part` (string): Only faces and edges of this part.
- `path` (string): Only this occurrence, as an assembly's tree names it.

## designer-locate {#designer-locate}

**Locate in the view.** Waits for the build to settle, then finds where a face, an edge or a component can be clicked in the view: page coordinates of a point a click there picks, with the label the status bar shows for it, or why no such point is visible. It reads and changes nothing.

Input:

- `face` (object): A face as the document names it: the feature that made it (of), its role, the hole position or sketch command it comes from (from), and the copy a mirror or pattern made (copy).
- `edge` (object): The edges between two faces.
- `component` (string): A component's id or occurrence path.
- `part` (string): Only faces and edges of this part.
- `path` (string): Only this occurrence, as an assembly's tree names it.

## designer-capture-view {#designer-capture-view}

**Capture the view.** Waits for the build to settle, then returns an image as a data URL: of the view as the person sees it, or of a named view framing the model (front, back, left, right, top, bottom, iso) or one tree row (detail:component:arm-1), taken without moving the person's camera, drawn at up to twice its size and scaled down so edges are smooth. It reads and changes nothing.

Input:

- `view` (string): A named view, or detail: and a tree row; the person's view when left out.
- `width` (number): The image's width in pixels, with height; the view's size when left out.
- `height` (number): The image's height in pixels, with width.
- `background` (one of `"view"`, `"studio"`): view keeps the view's own background; studio draws the model on a dark backdrop lit from behind, without the grid.
- `grid` (boolean): false leaves the grid out; it is drawn as in the view when left out.
- `format` (one of `"png"`, `"webp"`): png (the default) or webp.

## designer-read-steps {#designer-read-steps}

**Read the recorded steps.** Returns this session's changes as a step file: each command with its arguments, in order, that makes the project's documents again. A tutorial is such a file with a say line on the steps it explains. It reads and changes nothing.

Input:

- `topic` (string): The file's topic id, such as designer.tutorials.desk-arm.
- `title` (string): The file's title.

## designer-undo-turn {#designer-undo-turn}

**Undo my last change.** Undoes the calling agent's last change to the open document. It refuses when someone changed the same place since, naming the change. It changes the design, and the person reviews the change. A browser may ask the person before its agent runs it.

It takes no input.
