---
sidebar_position: 4.5
title: "Agents in the coding editors"
sidebar_label: Agents in the editors
description: The tools the Rete, Blockly and TypeScript editors on bitbybit.dev offer AI agents while they are open - through WebMCP and on the page - to search components and blocks, build and change a script in checked batches that one undo reverses, run it, read what failed and look at the result.
tags: [ai, rete, blockly, typescript]
---

# Agents in the coding editors

While a coding editor is open on bitbybit.dev, it offers tools to AI agents, so an agent working in your browser can build a script with you: find Rete components and wire them, snap Blockly blocks together, write TypeScript files, run the script, read what failed and look at the 3D view. The [Designer](../designer/working-with-agents.md) has tools of its own.

## How an agent reaches them

- **WebMCP.** In a browser that supports WebMCP, the editor registers its tools with the browser, and the browser's own agent can call them. Only the open editor's tools are offered, with the ones every editor shares; opening another editor swaps them.
- **On the page.** The same tools are on the page as `window.bitbybitEditor`: `editor()` names the open editor, `tools()` lists its tools with their inputs, and `call(name, input)` runs one. A test, a browser extension or an agent that drives the page reaches them this way.

```javascript
const editor = window.bitbybitEditor;
await editor.call("rete-apply-edit", {
    ops: [
        { add: "cube", name: "bitbybit.occt.shapes.solid.createCube", values: { size: 2 } },
        { add: "draw", name: "bitbybit.draw.drawAnyAsync" },
        { connect: ["cube.result", "draw.entity"] },
    ],
});
```

## What an edit is like

- **Checked first.** A Rete edit is checked against the editor's own components, fields and [wire rules](../getting-started/coding-editors/rete/features/nodes-and-wires.md); a Blockly edit is tried on a copy of the workspace with Blockly's own connection checks. If any operation is wrong, nothing changes, and the answer names each problem with the real fields and ports to use instead.
- **One undo.** A batch of operations lands as one step, so one <kbd>Ctrl+Z</kbd> takes back everything an agent changed in it. A TypeScript file is written as one undoable edit.
- **Then run.** After an edit the editor runs the script, waiting for the CAD kernels if they are still loading, and reports what was drawn, the console lines and the nodes or blocks that failed, with their errors.

Changes an agent makes are changes to the open script, saved the way yours are. A typical session searches for what it needs, applies an edit, reads the results, and captures the view to check the shape.

{/* tools:start - generated from the editors' own tools; edits between these markers are overwritten */}

## In every coding editor

### editor-read-state {#editor-read-state}

**Read the editor's state.** Says which coding editor is open (rete, blockly or typescript), whether a run is in progress, and gives a short account of the script: for Rete the nodes, wires and the open module, for Blockly the blocks, for TypeScript the files. It reads and changes nothing.

It takes no input.

### editor-run {#editor-run}

**Run the script.** Runs the script as Run The Code does, then waits until the kernels and the 3D view are quiet, a minute at most. Returns whether it failed with the first error, the console lines of the run, what was drawn (meshes, triangles, the bounding box) and the nodes or blocks that failed.

It takes no input.

### editor-read-console {#editor-read-console}

**Read the console.** Returns the latest console lines, newest last: what scripts logged, warnings and errors, each with its level and where it came from. It reads and changes nothing.

Input:

- `limit` (number): How many lines, 40 when left out.
- `level` (one of `"log"`, `"info"`, `"warn"`, `"error"`): Only lines of this level.

### editor-capture-view {#editor-capture-view}

**Capture the 3D view.** Returns a picture of the 3D view as a WebP image, from the camera as it is or, with fit, framed on everything drawn. It reads and changes nothing.

Input:

- `width` (number)
- `height` (number)
- `fit` (boolean): True frames everything drawn first.

## In Rete

### rete-search-components {#rete-search-components}

**Search Rete components.** Finds components the way the editor's search does and lists each one's name, title, category, description, inputs and outputs with their types. It reads and changes nothing.

Input:

- `query` (string, required): Words to look for, such as "cube" or "draw".
- `limit` (number): How many to list, 12 when left out.

### rete-describe-component {#rete-describe-component}

**Describe a Rete component.** Gives one component's inputs with their types, whether each has a field to type into and its default, its outputs, and its other settings. It reads and changes nothing.

Input:

- `name` (string, required): The component's name, such as bitbybit.occt.shapes.solid.createCube.

### rete-read-graph {#rete-read-graph}

**Read the Rete graph.** Returns the graph on screen: where it is (the main graph or a module), its nodes with their ids, component names, titles, the values that differ from the defaults, options and positions, its wires as ["node.output", "node.input"] pairs, and its modules with their ports. It reads and changes nothing.

It takes no input.

### rete-apply-edit {#rete-apply-edit}

**Edit the Rete graph.** Changes the Rete graph on screen in one step that one undo reverses, checking every operation first against the editor's own components and wire rules, so nothing changes when any of them is wrong. ops is a list of: \{"add": ref, "name": component name, "values"?: \{field: value\}, "at"?: [x, y], "title"?, "options"?: \{oneToOne, forceExec, flatten, hide\}, "code"?, "module"?\}; \{"set": node, ...the same fields but name\}; \{"connect": ["node.output", "node.input"]\}; \{"disconnect": ["node.output", "node.input"]\}; \{"remove": node\}. A node is an id rete-read-graph gave or a ref an earlier add in the same list named. Several wires into one input make the node run once per value; options.oneToOne pairs lists by position instead. code is the body of a code component, written as const start = async (inputs, index) =&gt; \{ ... return value; \} (the tool names the function for the node). Groups make a large graph readable: add bitbybit.groups.group with a title (values: description, groupColor, groupOpacity) and give other ops "group": its ref to put nodes in it; a bitbybit.comments.comment (values: commentText in Markdown) explains a group from inside it. rete-arrange then lays each group out and the groups beside one another. A module: add bitbybit.modules.definition with a title, then rete-enter-module, build its graph between its Module Input and Module Output nodes (their titles are its port names), rete-leave-module, and add bitbybit.modules.module with "module" naming the definition. Components that make geometry draw their result unless options.hide is true: hide the steps on the way to a part, and draw parts with bitbybit.draw.drawAnyAsync and its options to colour them. Runs the graph afterwards unless run is false, and reports what failed.

Input:

- `ops` (array, required): The operations, in order.
- `run` (boolean): False leaves the graph unrun.

### rete-read-results {#rete-read-results}

**Read node results.** Gives each node's error if it failed, how many times it ran per input when lists fed it, and a short account of each output's value: numbers, text, points, lists by length, shapes by kind. It reads and changes nothing.

Input:

- `nodes` (list of strings): Node ids; every node when left out.
- `failed` (boolean): True lists only the nodes that failed.

### rete-enter-module {#rete-enter-module}

**Go inside a module.** Opens a module's own graph on screen, as a double-click on its definition does; the other Rete tools then read and edit that graph until rete-leave-module.

Input:

- `module` (string, required): The module's id, or the id of its definition node.

### rete-leave-module {#rete-leave-module}

**Leave the module.** Returns to the graph around the module, keeping its changes; every instance of the module takes them.

It takes no input.

### rete-show-nodes {#rete-show-nodes}

**Show nodes.** Frames the canvas on the nodes named, and with select, selects one, which draws its geometry glowing in the 3D view even when the node is hidden: a way to show the person what changed.

Input:

- `nodes` (list of strings, required): Node ids to frame.
- `select` (string): A node id to select.

### rete-arrange {#rete-arrange}

**Arrange the graph.** Lays the graph on screen out from left to right as the toolbar's Arrange does.

It takes no input.

## In Blockly

### blockly-search-blocks {#blockly-search-blocks}

**Search Blockly blocks.** Finds blocks in the toolbox by words in their type and category, and gives each one's category, whether it gives a value (valueTypes null means any type) or stacks as a statement, its inputs with the types they accept (null means any), and its fields with their default values. It reads and changes nothing.

Input:

- `query` (string, required)
- `limit` (number)

### blockly-read-workspace {#blockly-read-workspace}

**Read the Blockly workspace.** Returns the workspace in Blockly's JSON: every top block with its fields, the blocks plugged into its inputs and stacked under it, and the variables; with code, the JavaScript the blocks make. It reads and changes nothing.

Input:

- `code` (boolean)

### blockly-apply-edit {#blockly-apply-edit}

**Edit the Blockly workspace.** Changes the Blockly workspace in one step that one undo reverses; the operations are tried on a copy first, so nothing changes when any of them fails. ops is a list of: \{"add": ref, "type": block type (it arrives as the toolbox has it, with its default values) or "block": a block in Blockly's JSON, "at"?: [x, y], "defaults"?: true to give every bitbybit block in the JSON the toolbox's values for the inputs it leaves out\}; \{"set": block, "field": "NAME" or "Input.Input" through plugged blocks, "value"\}; \{"plug": block, "into": "block.Input"\}; \{"stack": block, "under": block\}; \{"remove": block\}; \{"variable": name\}. A block is an id blockly-read-workspace gave or a ref an earlier add named. Blocks run from top to bottom; a block with no block above it in a stack still runs. Runs the script afterwards unless run is false, and reports the blocks that failed.

Input:

- `ops` (array, required)
- `run` (boolean)

## In the TypeScript editor

### typescript-list-files {#typescript-list-files}

**List the files.** Lists the script's files with their line counts and error counts, the entry file the run starts from, and the open one. It reads and changes nothing.

It takes no input.

### typescript-read-file {#typescript-read-file}

**Read a file.** Returns a file's code with its line count and its current errors and warnings; the open file when no path is given. It reads and changes nothing.

Input:

- `path` (string): Such as main.ts or parts/plate.ts.

### typescript-write-file {#typescript-write-file}

**Write a file.** Replaces a file's whole code as one undoable edit, or makes the file (and its folders) when it does not exist yet. bitbybit and Bit need no import; files import each other by relative path without .ts.

Input:

- `path` (string, required)
- `content` (string, required)

### typescript-delete-file {#typescript-delete-file}

**Delete a file.** Deletes a file; the entry file cannot be deleted. A browser may ask the person before its agent runs it.

Input:

- `path` (string, required)

### typescript-read-diagnostics {#typescript-read-diagnostics}

**Read errors.** Counts the errors the TypeScript checker finds in every file, and lists one file's errors with their lines; the editor marks these before anything runs. It reads and changes nothing.

Input:

- `path` (string): The file to list errors for; the open one when left out.

{/* tools:end */}
