---
sidebar_position: 1
title: "Designer commands"
sidebar_label: "Commands"
description: "Every command in the Designer: what it does, where to find it in the menus or toolbar, its key, the values it takes, and the name an agent runs it by."
topic: designer.reference.commands
type: reference
tags: [designer]
---

{/* Generated from the Designer itself; edits to this page are overwritten. */}

# Designer commands

Everything the Designer does is a command. The menus, the toolbar, the right-click menus, the keys, <Ui>Help</Ui> > <Ui>Find a command</Ui> and agents all run the same 169 commands, so a command behaves the same wherever it is started. A command that cannot run yet says why: hover over it in a menu, or read the reason an agent gets back.

Each entry's anchor is the command's help topic, such as `#designer-part-fillet`, so a link to it keeps working when the title changes.

## Files and documents

### New part {#designer-file-new-part}

Adds a part document to the design and opens it.

- **Where:** <Ui>File</Ui> > <Ui>New part</Ui>; the documents list; the start view, in the middle of an empty design, part or assembly
- **Works in:** part documents and assembly documents
- **For agents:** `file.newPart`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `name` (string): The document's name.

### New assembly {#designer-file-new-assembly}

Adds an assembly document to the design and opens it.

- **Where:** <Ui>File</Ui> > <Ui>New assembly</Ui>; the documents list; the start view, in the middle of an empty design, part or assembly
- **Works in:** part documents and assembly documents
- **For agents:** `file.newAssembly`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `name` (string): The document's name.

### Open document {#designer-file-open-document}

Opens a part or assembly document of the design in the view.

- **Where:** the documents list
- **Works in:** part documents and assembly documents
- **For agents:** `file.openDocument`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `document` (string, required): The document's id, as the documents list and designer-list-documents give it.

### Rename document {#designer-file-rename-document}

Renames a part or assembly document; a person's run without a name asks for it in the documents list.

- **Where:** <Ui>File</Ui> > <Ui>Rename document</Ui>; the right-click menu; the documents list
- **Works in:** part documents and assembly documents
- **For agents:** `file.renameDocument`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `document` (string): The document's id; the open one when left out.
  - `name` (string): The new name.

### Delete document {#designer-file-delete-document}

Deletes a part or assembly document from the design, or several at once, once no other assembly uses them.

- **Where:** <Ui>File</Ui> > <Ui>Delete document</Ui>; the right-click menu; the documents list
- **Works in:** part documents and assembly documents
- **For agents:** only a person runs it; agents see it as unavailable
- **Values:**
  - `document` (string): The document's id; the open one when left out.
  - `documents` (array): The ids of several documents to delete at once, in place of document; an assembly among them may place the others.
  - `confirmed` (boolean): A person's run asks first unless this is true.

### Load files from a site {#designer-file-allow-files-from}

Lets the design load the files it names from another site, until the Designer closes.

- **Where:** the dock
- **Works in:** part documents and assembly documents
- **For agents:** only a person runs it; agents see it as unavailable
- **Values:**
  - `host` (string, required): The site the files come from, such as example.com.

### Import design documents {#designer-file-import-documents}

Adds the design documents of .design.json or Designer project files, replacing the ones with the same id.

- **Where:** <Ui>File</Ui> > <Ui>Import design documents</Ui>; the start view, in the middle of an empty design, part or assembly
- **Works in:** part documents and assembly documents
- **For agents:** only a person runs it; agents see it as unavailable
- **Values:**
  - `documents` (array): The design documents to add; a person's run picks files instead.

### Import STEP, IGES or BREP {#designer-file-import-shape}

Imports a STEP file as its parts and assemblies, or an IGES or BREP file as a part, keeping the shapes with the project.

- **Where:** <Ui>File</Ui> > <Ui>Import STEP, IGES or BREP</Ui>; the start view, in the middle of an empty design, part or assembly
- **Works in:** part documents and assembly documents
- **For agents:** only a person runs it; agents see it as unavailable
- **Values:**
  - `uri` (string): The file's full link, imported as one part; a person's run picks a file and keeps it with the project instead, a STEP file as its parts and assemblies.
  - `sha256` (string): The SHA-256 of the file's bytes, 64 lower-case hexadecimal digits.
  - `format` (one of `"step"`, `"iges"`, `"brep"`, `"brep-binary"`): The file's format.
  - `name` (string): The new part document's name.

### Export... {#designer-file-export}

Saves the project, with or without the geometry built in this browser, or the open document as a design document, STEP, GLB, BREP or STL.

- **Where:** <Ui>File</Ui> > <Ui>Export...</Ui>; the export dialog
- **Works in:** part documents and assembly documents
- **For agents:** only a person runs it; agents see it as unavailable
- **Values:**
  - `format` (one of `"step"`, `"glb"`, `"brep"`, `"stl"`, `"document"`, `"project"`, `"projectGeometry"`): What to save; left out, a person chooses in the export dialog.

### Keep geometry for fast opening {#designer-file-keep-geometry}

Keeps the shapes and meshes of the latest builds beside the project on bitbybit.dev, so it opens at once on any machine; only the latest is kept, never in history or backups.

- **Where:** <Ui>File</Ui> > <Ui>Keep geometry for fast opening</Ui>
- **Works in:** part documents and assembly documents
- **For agents:** only a person runs it; agents see it as unavailable
- **Values:**
  - `on` (boolean): Whether to keep it; left out, a person's run switches it.

### Export STEP {#designer-file-export-step}

Saves the open document's build as STEP, with its parts, names and colours.

- **Where:** <Ui>Help</Ui> > <Ui>Find a command</Ui>, then <Ui>Export STEP</Ui>
- **Works in:** part documents and assembly documents
- **For agents:** only a person runs it; agents see it as unavailable

### Export GLB {#designer-file-export-glb}

Saves the open document's build as a binary glTF model.

- **Where:** <Ui>Help</Ui> > <Ui>Find a command</Ui>, then <Ui>Export GLB</Ui>
- **Works in:** part documents and assembly documents
- **For agents:** only a person runs it; agents see it as unavailable

### Export BREP {#designer-file-export-brep}

Saves the open part document's geometry as an OpenCascade BREP file.

- **Where:** <Ui>Help</Ui> > <Ui>Find a command</Ui>, then <Ui>Export BREP</Ui>
- **Works in:** part documents
- **For agents:** only a person runs it; agents see it as unavailable

### Export STL {#designer-file-export-stl}

Saves the open part document's geometry as a binary STL mesh.

- **Where:** <Ui>Help</Ui> > <Ui>Find a command</Ui>, then <Ui>Export STL</Ui>
- **Works in:** part documents
- **For agents:** only a person runs it; agents see it as unavailable

### Export design document {#designer-file-export-document}

Saves the open design document as a .design.json file.

- **Where:** <Ui>Help</Ui> > <Ui>Find a command</Ui>, then <Ui>Export design document</Ui>
- **Works in:** part documents and assembly documents
- **For agents:** only a person runs it; agents see it as unavailable

### Save the steps {#designer-file-export-steps}

Saves what was done in this session as a step file: the commands, in order, that make the project's documents again.

- **Where:** the dock
- **Works in:** part documents and assembly documents
- **For agents:** only a person runs it; agents see it as unavailable

### Save {#designer-file-save}

Saves the project where it was opened from.

- **Where:** <Ui>File</Ui> > <Ui>Save</Ui>
- **Key:** <kbd>Ctrl+S</kbd>, <kbd>⌘S</kbd> on macOS
- **Works in:** part documents and assembly documents
- **For agents:** `file.save`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Remove the last import {#designer-file-remove-import}

Deletes the documents the last import of this session added, while no other document uses them; the imported file stays with the project.

- **Where:** <Ui>File</Ui> > <Ui>Remove the last import</Ui>; the question in the middle of the view, before starting over or placing an import
- **Works in:** part documents and assembly documents
- **For agents:** only a person runs it; agents see it as unavailable
- **Values:**
  - `confirmed` (boolean): A person's run asks first unless this is true.

### Reorder document {#designer-file-move-document}

Moves a document before or after another in the design, as dragging its row in the documents list does; a design opens on its first top-level assembly.

- **Where:** the documents list
- **Works in:** part documents and assembly documents
- **For agents:** `file.moveDocument`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `document` (string, required): The id of the document to move.
  - `target` (string, required): The id of the document it goes next to.
  - `after` (boolean): After the target; before it when false.

### Delete with its parts {#designer-file-delete-with-parts}

Deletes an assembly with the part documents and sub-assemblies it places that no other assembly uses.

- **Where:** the right-click menu
- **Works in:** part documents and assembly documents
- **For agents:** only a person runs it; agents see it as unavailable
- **Values:**
  - `document` (string): The assembly's id; the open document when left out.
  - `confirmed` (boolean): A person's run asks first unless this is true.

### Start over {#designer-file-start-over}

Removes every document of this design, back to an empty start; on bitbybit.dev, History keeps the design as it was.

- **Where:** <Ui>File</Ui> > <Ui>Start over</Ui>; the question in the middle of the view, before starting over or placing an import
- **Works in:** part documents and assembly documents
- **For agents:** only a person runs it; agents see it as unavailable
- **Values:**
  - `confirmed` (boolean): A person's run asks first unless this is true.

### New design {#designer-file-new-design}

Makes a new, empty design in this project and opens it, keeping this one as it is; where no project holds the design, it starts this one over.

- **Where:** <Ui>File</Ui> > <Ui>New design</Ui>
- **Works in:** part documents and assembly documents
- **For agents:** only a person runs it; agents see it as unavailable
- **Values:**
  - `title` (string): The new design's name; New design when left out.

### Put the import in place {#designer-file-finish-import}

Adds what an import read to this design, or opens it as a new design in this project, when the design already held documents.

- **Where:** the question in the middle of the view, before starting over or placing an import
- **Works in:** part documents and assembly documents
- **For agents:** only a person runs it; agents see it as unavailable
- **Values:**
  - `into` (one of `"this"`, `"new"`, required): this adds it to this design; new opens it as a new design.

### Standard part {#designer-file-standard-part}

Adds a standard part from the library, a screw, bolt, nut, washer, set screw, dowel pin, gear, rack, bearing, spring, key or retaining ring, as a part document sized by its parameters; in an assembly it places it too, one document for each kind with each component's own sizes. With no kind it opens the library.

- **Where:** <Ui>Insert</Ui> > <Ui>Standard part</Ui>; the start view, in the middle of an empty design, part or assembly; the standard parts library, in the <Ui>Properties</Ui> panel
- **Works in:** part documents and assembly documents
- **For agents:** `file.standardPart`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `kind` (one of `"screw"`, `"bolt"`, `"nut"`, `"washer"`, `"setScrew"`, `"dowel"`, `"gear"`, `"helicalGear"`, `"bevelGear"`, `"ringGear"`, `"rack"`, `"bearing"`, `"spring"`, `"key"`, `"retainingRing"`): Which part, one of screw, bolt, nut, washer, setScrew, dowel, gear, helicalGear, bevelGear, ringGear, rack, bearing, spring, key, retainingRing; a person's run with none opens the library.
  - `values` (object): Its sizes by parameter name, each left out taking its starting value: screw: size, length, modelledThread; bolt: size, length, fullyThreaded, modelledThread; nut: size; washer: size, chamfered; setScrew: size, length, point; dowel: diameter, length; gear: module, teeth, width, bore, keyway, hub, hubLength, pressureAngle, profileShift, backlash; helicalGear: module, teeth, helixAngle, herringbone, width, bore, keyway, hub, hubLength, pressureAngle, profileShift, backlash; bevelGear: module, teeth, mateTeeth, shaftAngle, faceWidth, bore, pressureAngle, backlash; ringGear: module, teeth, width, rim, pressureAngle, backlash; rack: module, teeth, width, height, pressureAngle, backlash; bearing: designation, shields; spring: wireDiameter, diameter, activeCoils, length; key: shaftDiameter, length; retainingRing: kind, diameter.
  - `name` (string): The new part document's name; the part's own when left out.
  - `id` (string): The component's id in an assembly; the kind and the next free number when left out.

### New assembly from these {#designer-file-new-assembly-from}

Adds an assembly document placing the parts of the chosen part documents, and the chosen assemblies as sub-assemblies, side by side, and opens it.

- **Where:** <Ui>File</Ui> > <Ui>New assembly from these</Ui>; the right-click menu
- **Works in:** part documents and assembly documents
- **For agents:** `file.newAssemblyFrom`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `documents` (list of strings): The documents to place; the ones chosen in the documents list when left out.
  - `document` (string): One document to place.
  - `name` (string): The new assembly's name; "Assembly" when left out.

### Open an example {#designer-file-open-example}

Adds one of the showcase designs learn.bitbybit.dev publishes, such as the robot arm, to take apart and learn from; a person's run with none named shows them all.

- **Where:** <Ui>File</Ui> > <Ui>Open an example</Ui>; the examples gallery, in the middle of the view; the start view, in the middle of an empty design, part or assembly
- **Works in:** part documents and assembly documents
- **For agents:** `file.openExample`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `example` (one of `"desk-arm"`, `"jet-engine"`, `"robot-arm"`): Which example: desk-arm (Desk arm), jet-engine (Jet engine), robot-arm (Robot arm).

## Editing

### Apply a patch {#designer-edit-apply-patch}

Changes the open design document, or the one named, by an RFC 6902 patch (add, remove, replace and test), as one undoable change under a label.

- **Where:** <Ui>Help</Ui> > <Ui>Find a command</Ui>, then <Ui>Apply a patch</Ui>
- **Works in:** part documents and assembly documents
- **For agents:** `edit.applyPatch`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `patch` (list of objects, required): The operations, applied in order.
  - `label` (string): What the change does, as the history shows it.
  - `baseRevision` (number): The revision the patch was made against.
  - `document` (string): The document's id; the open one when left out.

### Keep the agent's change {#designer-review-keep}

Keeps an agent's change that waits for review: one entry, or every one in the document.

- **Where:** <Ui>Edit</Ui> > <Ui>Keep the agent's change</Ui>; the dock
- **Works in:** part documents and assembly documents
- **For agents:** only a person runs it; agents see it as unavailable
- **Values:**
  - `document` (string): The document's id; the open one when left out.
  - `entry` (string): One entry, such as feature:fillet2 or parameter:width; every entry waiting when left out.

### Undo the agent's change {#designer-review-undo}

Puts back what an agent changed that waits for review, as it was before: one entry, or every one in the document.

- **Where:** <Ui>Edit</Ui> > <Ui>Undo the agent's change</Ui>; the dock
- **Works in:** part documents and assembly documents
- **For agents:** only a person runs it; agents see it as unavailable
- **Values:**
  - `document` (string): The document's id; the open one when left out.
  - `entry` (string): One entry, such as feature:fillet2 or parameter:width; every entry waiting when left out.

### Keep agents' changes without review {#designer-review-auto-keep}

Agents' changes are kept as they are made, without waiting for review, until the page is loaded again.

- **Where:** <Ui>Edit</Ui> > <Ui>Keep agents' changes without review</Ui>; the dock
- **Works in:** part documents and assembly documents
- **For agents:** only a person runs it; agents see it as unavailable

### Show in the view {#designer-selection-show}

Selects a component, sub-assembly or part and glows it in the view until the next click, without moving the camera.

- **Where:** the <Ui>Features</Ui> panel
- **Works in:** part documents and assembly documents
- **For agents:** `selection.show`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `row` (string, required): The tree row to select and glow: component:&lt;id&gt;, occurrence:&lt;path&gt; or part:&lt;id&gt;.

### Select one level deeper {#designer-selection-deeper}

Selects the next level down the picked part's place: in an assembly its component, then each sub-assembly, then the part; in a part document the part.

- **Where:** <Ui>Edit</Ui> > <Ui>Select one level deeper</Ui>
- **Works in:** part documents and assembly documents
- **For agents:** `selection.deeper`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Repair reference {#designer-edit-repair-reference}

Makes a feature's face reference name other faces, such as those the build found most like the faces it lost.

- **Where:** the dock; a feature's dialog
- **Works in:** part documents
- **For agents:** `edit.repairReference`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `id` (string, required): The feature's id.
  - `path` (string, required): The face reference's JSON pointer inside the feature, such as /on/face or /edges/between/0: a build repair's path after /features/&lt;index&gt;.
  - `faces` (list of numbers, required): The faces to name, numbered as a build repair numbers them.

### Undo {#designer-edit-undo}

Undoes your last change to this document.

- **Where:** <Ui>Edit</Ui> > <Ui>Undo</Ui>; the right-click menu
- **Key:** <kbd>Ctrl+Z</kbd>, <kbd>⌘Z</kbd> on macOS
- **Works in:** part documents and assembly documents
- **For agents:** `edit.undo`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Redo {#designer-edit-redo}

Does again what you last undid.

- **Where:** <Ui>Edit</Ui> > <Ui>Redo</Ui>; the right-click menu
- **Key:** <kbd>Ctrl+Shift+Z</kbd>, <kbd>⌘⇧Z</kbd> on macOS
- **Works in:** part documents and assembly documents
- **For agents:** `edit.redo`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Edit feature {#designer-edit-feature}

Opens the selected feature's dialog; given fields, a run by an agent changes them at once.

- **Where:** <Ui>Edit</Ui> > <Ui>Edit feature</Ui>; the right-click menu; the <Ui>Features</Ui> panel; the <Ui>Properties</Ui> panel
- **Works in:** part documents
- **For agents:** `edit.editFeature`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `id` (string): The feature's id.

### Delete {#designer-edit-delete}

Deletes the selected feature, with withDependents also everything that uses it; with faces picked in the view and no feature selected, removes those faces (Delete face).

- **Where:** <Ui>Edit</Ui> > <Ui>Delete</Ui>; the right-click menu; the <Ui>Features</Ui> panel; the <Ui>Properties</Ui> panel
- **Key:** <kbd>Del</kbd>
- **Works in:** part documents
- **For agents:** `edit.delete`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `id` (string): The feature's id.
  - `withDependents` (boolean): Also delete every feature and part that uses it.

### Delete with what uses it {#designer-edit-delete-with-dependents}

Deletes the selected feature and every feature and part that uses it, in one step.

- **Where:** <Ui>Edit</Ui> > <Ui>Delete with what uses it</Ui>; the right-click menu; the <Ui>Properties</Ui> panel
- **Works in:** part documents
- **For agents:** `edit.deleteWithDependents`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `id` (string): The feature's id.

### Suppress or restore {#designer-edit-suppress}

Leaves the selected feature out of the build, or brings it back.

- **Where:** <Ui>Edit</Ui> > <Ui>Suppress or restore</Ui>; the right-click menu; the <Ui>Properties</Ui> panel
- **Works in:** part documents
- **For agents:** `edit.suppress`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `id` (string): The feature's id.

### Reorder feature {#designer-edit-move-feature}

Moves a feature before or after another; refused when it would come before what it uses or after what uses it.

- **Where:** the <Ui>Features</Ui> panel
- **Works in:** part documents
- **For agents:** `edit.moveFeature`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `id` (string, required): The feature to move.
  - `target` (string, required): The feature it goes next to.
  - `after` (boolean): After the target; before it when false.

### Roll back to here {#designer-edit-roll-back}

Builds the part only up to the selected feature, and adds new features right after it.

- **Where:** <Ui>Edit</Ui> > <Ui>Roll back to here</Ui>; the right-click menu
- **Works in:** part documents
- **For agents:** `edit.rollBack`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `id` (string): The feature to roll back to; it stays built.

### Roll to the end {#designer-edit-roll-to-end}

Builds every feature again and adds new features at the end.

- **Where:** <Ui>Edit</Ui> > <Ui>Roll to the end</Ui>; the right-click menu; the <Ui>Features</Ui> panel
- **Works in:** part documents
- **For agents:** `edit.rollToEnd`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Clear selection {#designer-selection-clear}

Unpicks every face and edge picked in the view.

- **Where:** <Ui>Edit</Ui> > <Ui>Clear selection</Ui>; the right-click menu; the <Ui>Properties</Ui> panel
- **Key:** <kbd>Esc</kbd>
- **Works in:** part documents and assembly documents
- **For agents:** `selection.clear`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Pick faces and edges {#designer-selection-pick-all}

Lets a click in the view pick a face or an edge, whichever is under the pointer.

- **Where:** <Ui>Edit</Ui> > <Ui>Pick faces and edges</Ui>; the status bar
- **Key:** <kbd>1</kbd>
- **Works in:** part documents and assembly documents
- **For agents:** `selection.pickAll`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Pick faces only {#designer-selection-pick-faces}

Lets a click in the view pick only faces, passing over the edges near the pointer.

- **Where:** <Ui>Edit</Ui> > <Ui>Pick faces only</Ui>; the status bar
- **Key:** <kbd>2</kbd>
- **Works in:** part documents and assembly documents
- **For agents:** `selection.pickFaces`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Pick edges only {#designer-selection-pick-edges}

Lets a click in the view pick only edges, so faces are never picked by mistake.

- **Where:** <Ui>Edit</Ui> > <Ui>Pick edges only</Ui>; the status bar
- **Key:** <kbd>3</kbd>
- **Works in:** part documents and assembly documents
- **For agents:** `selection.pickEdges`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Show in tree {#designer-selection-show-in-tree}

Selects the feature that made the picked face or edge.

- **Where:** <Ui>Edit</Ui> > <Ui>Show in tree</Ui>
- **Works in:** part documents
- **For agents:** `selection.showInTree`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### OK {#designer-dialog-ok}

Applies the open dialog: adds the feature or solid, or keeps the edit.

- **Where:** a feature's dialog; a solid's dialog
- **Key:** <kbd>Enter</kbd>
- **Works in:** part documents and assembly documents
- **For agents:** `dialog.ok`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Cancel {#designer-dialog-cancel}

Closes the open dialog and drops what it would add or change.

- **Where:** a feature's dialog; a solid's dialog
- **Works in:** part documents and assembly documents
- **For agents:** `dialog.cancel`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Copy {#designer-assembly-copy}

Copies the selected components with their sizes, where they stand, to paste into this or another assembly.

- **Where:** <Ui>Edit</Ui> > <Ui>Copy</Ui>; the right-click menu
- **Key:** <kbd>Ctrl+C</kbd>, <kbd>⌘C</kbd> on macOS
- **Works in:** assembly documents
- **For agents:** only a person runs it; agents see it as unavailable
- **Values:**
  - `ids` (list of strings): The components' ids; the selected ones, or the one picked in the view, when left out.

### Paste {#designer-assembly-paste}

Places the copied components again beside where they stood, each with its sizes and its pattern, under new ids.

- **Where:** <Ui>Edit</Ui> > <Ui>Paste</Ui>
- **Key:** <kbd>Ctrl+V</kbd>, <kbd>⌘V</kbd> on macOS
- **Works in:** assembly documents
- **For agents:** only a person runs it; agents see it as unavailable

### Duplicate {#designer-assembly-duplicate}

Places a copy of each selected component beside it, with its sizes and its pattern, under a new id.

- **Where:** <Ui>Edit</Ui> > <Ui>Duplicate</Ui>; the right-click menu
- **Key:** <kbd>Ctrl+D</kbd>, <kbd>⌘D</kbd> on macOS
- **Works in:** assembly documents
- **For agents:** `assembly.duplicate`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `ids` (list of strings): The components' ids; the selected ones, or the one picked in the view, when left out.

## The view

### Follow agent {#designer-view-follow-agent}

Lets an agent's view commands turn your camera; while off, an agent's views are its own and its captures show them.

- **Where:** <Ui>View</Ui> > <Ui>Follow agent</Ui>
- **Works in:** part documents and assembly documents
- **For agents:** only a person runs it; agents see it as unavailable

### Zoom to selection {#designer-view-focus}

Zooms onto a component, sub-assembly or part, glowing it until the next click; with none named, onto the selected one, else the part the last pick lies on.

- **Where:** <Ui>View</Ui> > <Ui>Zoom to selection</Ui>; the dock; the <Ui>Features</Ui> panel; the <Ui>Properties</Ui> panel
- **Key:** <kbd>Shift+F</kbd>, <kbd>⇧F</kbd> on macOS
- **Works in:** part documents and assembly documents
- **For agents:** `view.focus`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `row` (string): The tree row to select and zoom onto: component:&lt;id&gt;, occurrence:&lt;path&gt; or part:&lt;id&gt;.
  - `rows` (list of strings): Several such rows, selected and framed together, such as the two parts of a clash.

### Faces {#designer-view-faces}

Shows or hides the faces; with them hidden every edge shows through.

- **Where:** <Ui>View</Ui> > <Ui>Faces</Ui>
- **Works in:** part documents and assembly documents
- **For agents:** `view.faces`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Edges {#designer-view-edges}

Shows or hides the edges, in shaded and in realistic views alike.

- **Where:** <Ui>View</Ui> > <Ui>Edges</Ui>
- **Works in:** part documents and assembly documents
- **For agents:** `view.edges`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Triangles {#designer-view-triangles}

Draws the faces as the triangles the view meshes them into.

- **Where:** <Ui>View</Ui> > <Ui>Triangles</Ui>
- **Works in:** part documents and assembly documents
- **For agents:** `view.triangles`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Realistic {#designer-view-realistic}

Lights the parts as their materials and finishes look, from a city environment and a sun casting soft shadows; off is the matte CAD look.

- **Where:** <Ui>View</Ui> > <Ui>Realistic</Ui>
- **Works in:** part documents and assembly documents
- **For agents:** `view.realistic`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Fit all {#designer-view-fit}

Frames the whole model.

- **Where:** <Ui>View</Ui> > <Ui>Fit all</Ui>; the right-click menu; the view bar
- **Key:** <kbd>F</kbd>
- **Works in:** part documents and assembly documents
- **For agents:** `view.fit`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Iso view {#designer-view-iso}

Turns the camera to the iso view.

- **Where:** <Ui>View</Ui> > <Ui>Iso view</Ui>; the view cube
- **Key:** <kbd>Shift+7</kbd>, <kbd>⇧7</kbd> on macOS
- **Works in:** part documents and assembly documents
- **For agents:** `view.iso`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Front view {#designer-view-front}

Turns the camera to the front view.

- **Where:** <Ui>View</Ui> > <Ui>Front view</Ui>
- **Key:** <kbd>Shift+1</kbd>, <kbd>⇧1</kbd> on macOS
- **Works in:** part documents and assembly documents
- **For agents:** `view.front`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Back view {#designer-view-back}

Turns the camera to the back view.

- **Where:** <Ui>View</Ui> > <Ui>Back view</Ui>
- **Key:** <kbd>Shift+2</kbd>, <kbd>⇧2</kbd> on macOS
- **Works in:** part documents and assembly documents
- **For agents:** `view.back`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Left view {#designer-view-left}

Turns the camera to the left view.

- **Where:** <Ui>View</Ui> > <Ui>Left view</Ui>
- **Key:** <kbd>Shift+3</kbd>, <kbd>⇧3</kbd> on macOS
- **Works in:** part documents and assembly documents
- **For agents:** `view.left`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Right view {#designer-view-right}

Turns the camera to the right view.

- **Where:** <Ui>View</Ui> > <Ui>Right view</Ui>
- **Key:** <kbd>Shift+4</kbd>, <kbd>⇧4</kbd> on macOS
- **Works in:** part documents and assembly documents
- **For agents:** `view.right`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Top view {#designer-view-top}

Turns the camera to the top view.

- **Where:** <Ui>View</Ui> > <Ui>Top view</Ui>
- **Key:** <kbd>Shift+5</kbd>, <kbd>⇧5</kbd> on macOS
- **Works in:** part documents and assembly documents
- **For agents:** `view.top`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Bottom view {#designer-view-bottom}

Turns the camera to the bottom view.

- **Where:** <Ui>View</Ui> > <Ui>Bottom view</Ui>
- **Key:** <kbd>Shift+6</kbd>, <kbd>⇧6</kbd> on macOS
- **Works in:** part documents and assembly documents
- **For agents:** `view.bottom`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Turn up {#designer-view-turn-up}

Turns the view a quarter round, to the face above on screen.

- **Where:** <Ui>View</Ui> > <Ui>Turn up</Ui>
- **Works in:** part documents and assembly documents
- **For agents:** `view.turn.up`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Turn down {#designer-view-turn-down}

Turns the view a quarter round, to the face below on screen.

- **Where:** <Ui>View</Ui> > <Ui>Turn down</Ui>
- **Works in:** part documents and assembly documents
- **For agents:** `view.turn.down`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Turn left {#designer-view-turn-left}

Turns the view a quarter round, to the face on the left of the screen.

- **Where:** <Ui>View</Ui> > <Ui>Turn left</Ui>
- **Works in:** part documents and assembly documents
- **For agents:** `view.turn.left`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Turn right {#designer-view-turn-right}

Turns the view a quarter round, to the face on the right of the screen.

- **Where:** <Ui>View</Ui> > <Ui>Turn right</Ui>
- **Works in:** part documents and assembly documents
- **For agents:** `view.turn.right`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Roll left {#designer-view-turn-roll-left}

Rolls the view a quarter round counter-clockwise about the line of sight.

- **Where:** <Ui>View</Ui> > <Ui>Roll left</Ui>
- **Works in:** part documents and assembly documents
- **For agents:** `view.turn.rollLeft`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Roll right {#designer-view-turn-roll-right}

Rolls the view a quarter round clockwise about the line of sight.

- **Where:** <Ui>View</Ui> > <Ui>Roll right</Ui>
- **Works in:** part documents and assembly documents
- **For agents:** `view.turn.rollRight`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Look at {#designer-view-look-at}

Turns the camera square onto the picked face.

- **Where:** <Ui>View</Ui> > <Ui>Look at</Ui>; the view bar
- **Key:** <kbd>N</kbd>
- **Works in:** part documents and assembly documents
- **For agents:** `view.lookAt`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Perspective {#designer-view-perspective}

Draws the view in perspective instead of the orthographic projection CAD drawings use.

- **Where:** <Ui>View</Ui> > <Ui>Perspective</Ui>; the view bar
- **Works in:** part documents and assembly documents
- **For agents:** `view.perspective`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Lock rotation {#designer-view-lock-rotation}

A left drag draws a selection box instead of turning the view; the right button still pans. On while a sketch is open.

- **Where:** <Ui>View</Ui> > <Ui>Lock rotation</Ui>; the view bar
- **Works in:** part documents and assembly documents
- **For agents:** `view.lockRotation`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Show or hide the grid {#designer-view-grid}

The ground grid, scaled to the model.

- **Where:** <Ui>View</Ui> > <Ui>Show or hide the grid</Ui>; the view bar
- **Key:** <kbd>G</kbd>
- **Works in:** part documents and assembly documents
- **For agents:** `view.grid`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Try a value {#designer-view-try-parameter}

Rebuilds a shared design with another value of a parameter its author lets visitors change, between its min and max; only this view changes and nothing is saved.

- **Where:** the values a shared design lets its visitors try
- **Works in:** part documents and assembly documents
- **For agents:** `view.tryParameter`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `name` (string, required): The parameter.
  - `value` (number, required)

### Back to the author's values {#designer-view-reset-parameters}

Rebuilds a shared design with the values its author saved, after trying others.

- **Where:** the values a shared design lets its visitors try
- **Works in:** part documents and assembly documents
- **For agents:** `view.resetParameters`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Play parameter {#designer-view-play-parameter}

Runs a parameter between its least and most values, on and on, so every joint and feature that reads it moves in the view; an angle over a whole turn keeps turning. Nothing is saved.

- **Where:** the <Ui>Properties</Ui> panel
- **Works in:** part documents and assembly documents
- **For agents:** `view.playParameter`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `name` (string, required): The parameter to play; it needs a min and a max.
  - `seconds` (number): How many seconds one run from the least value to the most takes; 4 when left out.

### Stop playing {#designer-view-stop-playing}

Stops the parameter that is playing, and the view shows the model as it stands again.

- **Where:** the <Ui>Properties</Ui> panel
- **Works in:** part documents and assembly documents
- **For agents:** `view.stopPlaying`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Stop building {#designer-view-stop-build}

Stops the build the kernel is making now; what was drawn before stays, and a change or Build again builds it anew.

- **Where:** the build progress card, while a long build runs
- **Key:** <kbd>Ctrl+.</kbd>, <kbd>⌘.</kbd> on macOS
- **Works in:** part documents and assembly documents
- **For agents:** `view.stopBuild`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Build again {#designer-view-build-again}

Builds the open document again after its build was stopped.

- **Where:** the build progress card, while a long build runs
- **Works in:** part documents and assembly documents
- **For agents:** `view.buildAgain`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Hide {#designer-view-hide}

Hides the selected components or sub-assemblies in the view, or the ones the picks lie on, until Show all or another document opens; the tree marks them hidden and the design is unchanged.

- **Where:** <Ui>View</Ui> > <Ui>Hide</Ui>; the right-click menu
- **Key:** <kbd>H</kbd>
- **Works in:** assembly documents
- **For agents:** `view.hide`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `rows` (list of strings): The tree rows: component:&lt;id&gt; or occurrence:&lt;path&gt;; with none, the selected ones, else the components the picks lie on.

### Show only these {#designer-view-show-only}

Hides every other component of this assembly, keeping the selected ones, or the ones the picks lie on, in the view.

- **Where:** <Ui>View</Ui> > <Ui>Show only these</Ui>; the right-click menu
- **Works in:** assembly documents
- **For agents:** `view.showOnly`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `rows` (list of strings): The tree rows: component:&lt;id&gt; or occurrence:&lt;path&gt;; with none, the selected ones, else the components the picks lie on.

### Show all {#designer-view-show-all}

Shows every hidden component again.

- **Where:** <Ui>View</Ui> > <Ui>Show all</Ui>; the right-click menu; the status bar
- **Key:** <kbd>Shift+H</kbd>, <kbd>⇧H</kbd> on macOS
- **Works in:** assembly documents
- **For agents:** `view.showAll`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Show {#designer-view-show}

Shows hidden components or sub-assemblies again: the selected ones, or the ones named; showing one inside a hidden sub-assembly shows that sub-assembly too.

- **Where:** the right-click menu
- **Works in:** assembly documents
- **For agents:** `view.show`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `rows` (list of strings): The tree rows: component:&lt;id&gt; or occurrence:&lt;path&gt;; with none, the selected ones, else the components the picks lie on.

## Solids

### Box {#designer-part-box}

A block standing on a plane or a face: a rectangle sketch and an extrude.

- **Where:** <Ui>Insert</Ui> > <Ui>Box</Ui>; the toolbar; the start view, in the middle of an empty design, part or assembly
- **Works in:** part documents
- **For agents:** `part.box`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `width`: Along the sketch's x axis.
  - `depth`: Along the sketch's y axis.
  - `height`: How far it rises.
  - `on`: The plane it stands on, or a flat face it rises from.
  - `x` (number): How far along the plane's x axis its centre sits, when it stands on a plane; 0 when left out, and beside the part's bodies when a person opens the dialog.
  - `id` (string): The solid feature's id, its sketch taking the id with -sketch; the next free one when left out.

### Cylinder {#designer-part-cylinder}

A cylinder standing on a plane or a face: a circle sketch and an extrude.

- **Where:** <Ui>Insert</Ui> > <Ui>Cylinder</Ui>; the toolbar; the start view, in the middle of an empty design, part or assembly
- **Works in:** part documents
- **For agents:** `part.cylinder`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `radius`: The circle's radius.
  - `height`: How far it rises.
  - `on`: The plane it stands on, or a flat face it rises from.
  - `x` (number): How far along the plane's x axis its centre sits, when it stands on a plane; 0 when left out, and beside the part's bodies when a person opens the dialog.
  - `id` (string): The solid feature's id, its sketch taking the id with -sketch; the next free one when left out.

### Prism {#designer-part-prism}

A regular polygon standing on a plane or a face: a polygon sketch and an extrude.

- **Where:** <Ui>Insert</Ui> > <Ui>Prism</Ui>; the toolbar
- **Works in:** part documents
- **For agents:** `part.prism`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `sides`: How many sides the polygon has.
  - `radius`: From the centre to each corner.
  - `height`: How far it rises.
  - `on`: The plane it stands on, or a flat face it rises from.
  - `x` (number): How far along the plane's x axis its centre sits, when it stands on a plane; 0 when left out, and beside the part's bodies when a person opens the dialog.
  - `id` (string): The solid feature's id, its sketch taking the id with -sketch; the next free one when left out.

### Sphere {#designer-part-sphere}

A ball resting on the ground: a half-disc sketch turned about the vertical axis.

- **Where:** <Ui>Insert</Ui> > <Ui>Sphere</Ui>; the toolbar; the start view, in the middle of an empty design, part or assembly
- **Works in:** part documents
- **For agents:** `part.sphere`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `radius`: The ball's radius.
  - `offset`: How far above the ground it rests.
  - `x` (number): How far along the plane's x axis its centre sits, when it stands on a plane; 0 when left out, and beside the part's bodies when a person opens the dialog.
  - `id` (string): The solid feature's id, its sketch taking the id with -sketch; the next free one when left out.

### Cone {#designer-part-cone}

A cone or a truncated cone on the ground: its side profile turned about the vertical axis.

- **Where:** <Ui>Insert</Ui> > <Ui>Cone</Ui>; the toolbar
- **Works in:** part documents
- **For agents:** `part.cone`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `radius`: The radius at the ground.
  - `topRadius`: 0 for a point.
  - `height`: How tall it is.
  - `offset`: How far above the ground it starts.
  - `x` (number): How far along the plane's x axis its centre sits, when it stands on a plane; 0 when left out, and beside the part's bodies when a person opens the dialog.
  - `id` (string): The solid feature's id, its sketch taking the id with -sketch; the next free one when left out.

### Gear {#designer-part-gear}

An involute spur gear standing on a plane or a face: a sketch of its teeth and its bore, and an extrude.

- **Where:** <Ui>Insert</Ui> > <Ui>Gear</Ui>; the toolbar; the start view, in the middle of an empty design, part or assembly
- **Works in:** part documents
- **For agents:** `part.gear`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `module`: The size of the teeth: the pitch circle's diameter divided by the number of teeth; gears mesh only with gears of the same module.
  - `teeth`: How many teeth it has, at least 3.
  - `height`: How thick the gear is.
  - `bore`: The diameter of the hole through its middle; 0 leaves it whole.
  - `on`: The plane it stands on, or a flat face it rises from.
  - `x` (number): How far along the plane's x axis its centre sits, when it stands on a plane; 0 when left out, and beside the part's bodies when a person opens the dialog.
  - `id` (string): The solid feature's id, its sketch taking the id with -sketch; the next free one when left out.

### Ring gear {#designer-part-ring-gear}

An involute ring gear standing on a plane or a face, its teeth pointing in: a sketch of its rim and teeth, and an extrude.

- **Where:** <Ui>Insert</Ui> > <Ui>Ring gear</Ui>; the toolbar; the start view, in the middle of an empty design, part or assembly
- **Works in:** part documents
- **For agents:** `part.ringGear`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `module`: The size of the teeth: the pitch circle's diameter divided by the number of teeth; a gear meshes inside only with the same module.
  - `teeth`: How many teeth it has, at least 34 so their tips stay outside the base circle.
  - `height`: How thick the ring is.
  - `rim`: How thick the ring is outside the bottoms of its gaps.
  - `on`: The plane it stands on, or a flat face it rises from.
  - `x` (number): How far along the plane's x axis its centre sits, when it stands on a plane; 0 when left out, and beside the part's bodies when a person opens the dialog.
  - `id` (string): The solid feature's id, its sketch taking the id with -sketch; the next free one when left out.

## Sketching

### Line {#designer-sketch-line}

Draws straight segments point by point; click the start again to close the outline, Enter to stop.

- **Where:** the sketch bar, while you draw a sketch
- **Key:** <kbd>L</kbd>
- **Works in:** part documents
- **For agents:** `sketch.line`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Arc {#designer-sketch-arc}

Draws an arc on from the pen: click where it ends, then a point it passes through.

- **Where:** the sketch bar, while you draw a sketch
- **Key:** <kbd>A</kbd>
- **Works in:** part documents
- **For agents:** `sketch.arc`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Tangent arc {#designer-sketch-tangent-arc}

Draws an arc that leaves the last segment smoothly: click where it ends.

- **Where:** the sketch bar, while you draw a sketch
- **Key:** <kbd>T</kbd>
- **Works in:** part documents
- **For agents:** `sketch.tangentArc`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Rectangle {#designer-sketch-rectangle}

Draws a rectangle from two opposite corners.

- **Where:** the sketch bar, while you draw a sketch
- **Key:** <kbd>R</kbd>
- **Works in:** part documents
- **For agents:** `sketch.rectangle`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Centre rectangle {#designer-sketch-centre-rectangle}

Draws a rectangle from its centre and a corner.

- **Where:** the sketch bar, while you draw a sketch
- **Works in:** part documents
- **For agents:** `sketch.centreRectangle`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Circle {#designer-sketch-circle}

Draws a circle from its centre and a point on it.

- **Where:** the sketch bar, while you draw a sketch
- **Key:** <kbd>C</kbd>
- **Works in:** part documents
- **For agents:** `sketch.circle`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Polygon {#designer-sketch-polygon}

Draws a regular polygon from its centre and a corner.

- **Where:** the sketch bar, while you draw a sketch
- **Key:** <kbd>P</kbd>
- **Works in:** part documents
- **For agents:** `sketch.polygon`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Round corner {#designer-sketch-fillet}

Rounds a corner where two lines or arcs meet: click it, or pick the tool with corner points selected; type a radius to change the corners just rounded.

- **Where:** the sketch bar, while you draw a sketch
- **Works in:** part documents
- **For agents:** `sketch.fillet`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Bevel corner {#designer-sketch-chamfer}

Bevels a corner where two lines or arcs meet: click it, or pick the tool with corner points selected; type a distance to change the corners just beveled.

- **Where:** the sketch bar, while you draw a sketch
- **Works in:** part documents
- **For agents:** `sketch.chamfer`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Close outline {#designer-sketch-close-outline}

Draws a straight segment back to where the outline started.

- **Where:** the sketch bar, while you draw a sketch
- **Works in:** part documents
- **For agents:** `sketch.closeOutline`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Finish the outline {#designer-sketch-finish}

Stops drawing the current outline and leaves it open.

- **Where:** <Ui>Help</Ui> > <Ui>Find a command</Ui>, then <Ui>Finish the outline</Ui>
- **Key:** <kbd>Enter</kbd>
- **Works in:** part documents
- **For agents:** `sketch.finish`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Stop drawing {#designer-sketch-cancel-step}

Drops the point just placed, then stops the outline, then puts the tool down.

- **Where:** <Ui>Help</Ui> > <Ui>Find a command</Ui>, then <Ui>Stop drawing</Ui>
- **Key:** <kbd>Esc</kbd>
- **Works in:** part documents
- **For agents:** `sketch.cancelStep`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Snap {#designer-sketch-snap}

Pulls the pointer to the sketch's points, to lines level or upright with them, and to the grid.

- **Where:** the sketch bar, while you draw a sketch
- **Works in:** part documents
- **For agents:** `sketch.snap`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Sketch {#designer-part-sketch}

An outline drawn by pen commands on a plane, a frame or a flat face; a closed outline makes a face.

- **Where:** <Ui>Insert</Ui> > <Ui>Sketch</Ui>; the toolbar; the start view, in the middle of an empty design, part or assembly
- **Works in:** part documents
- **For agents:** `part.sketch`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `on`: Where the sketch lies: a plane through the origin, a frame, or a flat face of a body.
  - `start`: Where the pen starts, in the sketch's coordinates.
  - `pen`: The commands the pen draws, in order; each command's id names the sides features sweep from it.
  - `loops`: Several closed outlines making one face: the first is its outside, each further one a hole.
  - `face`: Makes a closed outline a face; turn off to keep it a wire, such as a closed path to sweep along. Close the outline with the pen's Close command.

## Features that make shape

### Extrude {#designer-part-extrude}

Sweeps a sketch's face straight along its normal, or along a direction.

- **Where:** <Ui>Insert</Ui> > <Ui>Extrude</Ui>; the toolbar
- **Key:** <kbd>E</kbd>
- **Works in:** part documents
- **For agents:** `part.extrude`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `profile`: The sketch whose face is used.
  - `distance`: How far the face is swept; negative goes the other way.
  - `direction`: Sweep along this vector instead of the sketch's normal.
  - `body`: The body to join; leave it empty to start a new body named after this feature, as an extrude does by default.
  - `join`: How the result joins the body: added to it, cut from it or intersected with it.

### Revolve {#designer-part-revolve}

Turns a sketch's face about an axis.

- **Where:** <Ui>Insert</Ui> > <Ui>Revolve</Ui>; the toolbar
- **Works in:** part documents
- **For agents:** `part.revolve`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `profile`: The sketch whose face is used.
  - `axis`: The axis, by a point on it and its direction.
  - `angle`: How far it turns; a whole turn by default.
  - `body`: The body to join; leave it empty to start a new body named after this feature, as a revolve does by default.
  - `join`: How the result joins the body: added to it, cut from it or intersected with it.

### Sweep {#designer-part-sweep}

Sweeps a sketch's outline along the outline of another sketch.

- **Where:** <Ui>Insert</Ui> > <Ui>Sweep</Ui>; the toolbar
- **Works in:** part documents
- **For agents:** `part.sweep`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `profile`: The sketch whose face is used.
  - `path`: The sketch the profile travels along.
  - `body`: The body to join; leave it empty to start a new body named after this feature, as a sweep does by default.
  - `join`: How the result joins the body: added to it, cut from it or intersected with it.

### Loft {#designer-part-loft}

Skins a solid through two or more sketches in order.

- **Where:** <Ui>Insert</Ui> > <Ui>Loft</Ui>; the toolbar
- **Works in:** part documents
- **For agents:** `part.loft`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `profiles`: The sketches to pass through, in order.
  - `solid`: Close the skin into a solid.
  - `body`: The body to join; leave it empty to start a new body named after this feature, as a loft does by default.
  - `join`: How the result joins the body: added to it, cut from it or intersected with it.

### Import {#designer-part-import}

Starts a body from a STEP, IGES or BREP file the document lists as an asset.

- **Where:** <Ui>Insert</Ui> > <Ui>Import</Ui>
- **Works in:** part documents
- **For agents:** `part.import`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `asset`: The id of the document's asset to read.
  - `format`: The file's format; read from the asset when left out.
  - `child`: Takes only this shape of the file's compound, counted from 0, as each part of an imported STEP file does.

## Features that change shape

### Fillet {#designer-part-fillet}

Rounds edges of a body.

- **Where:** <Ui>Insert</Ui> > <Ui>Fillet</Ui>; the toolbar
- **Works in:** part documents
- **For agents:** `part.fillet`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `body`: The body this feature changes.
  - `edges`: The edges to round, named by the faces they lie between.
  - `radius`: The radius of the rounds.

### Chamfer {#designer-part-chamfer}

Bevels edges of a body.

- **Where:** <Ui>Insert</Ui> > <Ui>Chamfer</Ui>; the toolbar
- **Works in:** part documents
- **For agents:** `part.chamfer`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `body`: The body this feature changes.
  - `edges`: The edges to bevel, named by the faces they lie between.
  - `distance`: How far the bevel cuts back along each face.

### Shell {#designer-part-shell}

Hollows a body into walls, leaving the named faces open.

- **Where:** <Ui>Insert</Ui> > <Ui>Shell</Ui>; the toolbar
- **Works in:** part documents
- **For agents:** `part.shell`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `body`: The body this feature changes.
  - `thickness`: Wall thickness, inward; negative grows outward.
  - `open`: The faces left open.

### Hole {#designer-part-hole}

Drills holes through a flat face at positions on it.

- **Where:** <Ui>Insert</Ui> > <Ui>Hole</Ui>; the toolbar
- **Works in:** part documents
- **For agents:** `part.hole`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `body`: The body this feature changes.
  - `on`: The flat face the holes start from.
  - `at`: Where the holes go, as x and y on the face; give a position an id to name its walls.
  - `diameter`: The hole's diameter.
  - `fastener`: Sizes the holes for a metric screw instead of a diameter, such as \{ "size": "M8", "fit": "normal" \}: a close, normal or loose clearance, or tapped for its thread.
  - `depth`: How deep; 0 drills through.
  - `tipAngle`: A drill point at the bottom of a blind hole.
  - `counterbore`: Widen each mouth to a diameter and depth.
  - `countersink`: Widen each mouth to a cone of a diameter and angle.
  - `origin`: Where positions are measured from on the face.
  - `direction`: The face's x axis, needed on a face not facing along a world axis.

### Boss {#designer-part-boss}

Raises a sketch drawn on a face of a body out of that face.

- **Where:** <Ui>Insert</Ui> > <Ui>Boss</Ui>; the toolbar
- **Works in:** part documents
- **For agents:** `part.boss`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `profile`: A sketch drawn on a flat face of the body.
  - `body`: The body this feature changes.
  - `distance`: How far it rises.
  - `until`: Rise until this face instead of a distance.

### Pocket {#designer-part-pocket}

Sinks a sketch drawn on a face of a body into it.

- **Where:** <Ui>Insert</Ui> > <Ui>Pocket</Ui>; the toolbar
- **Works in:** part documents
- **For agents:** `part.pocket`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `profile`: A sketch drawn on a flat face of the body.
  - `body`: The body this feature changes.
  - `distance`: How deep it sinks.
  - `through`: Cut through the whole body.
  - `until`: Sink until this face.

### Push/pull {#designer-part-push-pull}

Moves a face of a body along its normal, out or in: extruded straight, or offset with the faces around it following; the face keeps its names.

- **Where:** <Ui>Insert</Ui> > <Ui>Push/pull</Ui>; the toolbar
- **Works in:** part documents
- **For agents:** `part.pushPull`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `body`: The body this feature changes.
  - `face`: The face to move: a flat one to extrude, flat or curved to offset.
  - `mode`: Extrude adds or cuts the flat face straight along its normal, whatever is around it; Offset moves the face, and the faces around it stretch to follow.
  - `distance`: How far: above 0 pulls the face out, below 0 pushes it in.

### Delete face {#designer-part-remove-faces}

Removes faces of a body and closes the gap from the faces around them, as when a hole or a round is deleted.

- **Where:** <Ui>Insert</Ui> > <Ui>Delete face</Ui>; the toolbar
- **Works in:** part documents
- **For agents:** `part.removeFaces`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `body`: The body this feature changes.
  - `faces`: The faces to remove.

### Move {#designer-part-transform}

Moves and turns a body as one piece; its faces keep their names.

- **Where:** <Ui>Insert</Ui> > <Ui>Move</Ui>; the toolbar
- **Works in:** part documents
- **For agents:** `part.transform`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `body`: The body this feature changes.
  - `translate`: How far the body moves, after it turns.
  - `rotate`: Degrees about X, then Y, then Z, through the pivot.
  - `pivot`: The point the body turns about; the origin when left out.

## Combining bodies

### Boolean {#designer-part-boolean}

Combines bodies: the body goes on as the union, difference or intersection with the tools, which are used up.

- **Where:** <Ui>Insert</Ui> > <Ui>Boolean</Ui>; the toolbar
- **Works in:** part documents
- **For agents:** `part.boolean`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `operation`: Union adds, difference cuts, intersection keeps what is shared.
  - `body`: The body this feature changes.
  - `tools`: The bodies combined with it; they are used up.

## Patterns

### Linear pattern {#designer-part-linear-pattern}

Repeats a body in a row and fuses the copies.

- **Where:** <Ui>Insert</Ui> > <Ui>Linear pattern</Ui>; the toolbar
- **Works in:** part documents
- **For agents:** `part.linearPattern`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `body`: The body this feature changes.
  - `direction`: The direction the copies step along.
  - `spacing`: The distance between copies.
  - `count`: How many, the original included.

### Polar pattern {#designer-part-polar-pattern}

Repeats a body around an axis and fuses the copies.

- **Where:** <Ui>Insert</Ui> > <Ui>Polar pattern</Ui>; the toolbar
- **Works in:** part documents
- **For agents:** `part.polarPattern`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `body`: The body this feature changes.
  - `axis`: The axis, by a point on it and its direction.
  - `count`: How many, the original included.
  - `angle`: The angle the copies spread over; a whole turn by default.

### Mirror {#designer-part-mirror}

Mirrors a body across a plane and fuses the image with it.

- **Where:** <Ui>Insert</Ui> > <Ui>Mirror</Ui>; the toolbar
- **Works in:** part documents
- **For agents:** `part.mirror`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `body`: The body this feature changes.
  - `plane`: The mirror plane, by a point on it and its normal.
  - `keepOriginal`: Keep the original and fuse the image with it.

## undefined

### Keyway {#designer-part-keyway}

Mills a DIN 6885 keyway into a shaft, or cuts one through a hub's bore, sized for its diameter.

- **Where:** <Ui>Insert</Ui> > <Ui>Keyway</Ui>; the toolbar
- **Works in:** part documents
- **For agents:** `part.keyway`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `body`: The body this feature changes.
  - `on`: The round face to machine: a shaft's side or a bore's wall.
  - `at`: How far along the axis the cut starts, from the end the axis points away from.
  - `length`: How long the keyway runs along the axis; through a bore, its length.
  - `angle`: Turns the keyway about the axis, from facing world X (world Y on an axis along X).
  - `flip`: Measure from the other end of the face.

### Flat {#designer-part-flat}

Takes a flat off a shaft, such as the one a set screw bears on.

- **Where:** <Ui>Insert</Ui> > <Ui>Flat</Ui>; the toolbar
- **Works in:** part documents
- **For agents:** `part.flat`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `body`: The body this feature changes.
  - `on`: The shaft's round side.
  - `at`: How far along the axis the cut starts, from the end the axis points away from.
  - `length`: How long the flat runs along the axis.
  - `depth`: How deep the flat is cut in from the surface.
  - `angle`: Turns the flat about the axis, from facing world X (world Y on an axis along X).
  - `flip`: Measure from the other end of the face.

### Ring groove {#designer-part-ring-groove}

Cuts the groove a DIN 471 retaining ring sits in on a shaft, or a DIN 472 ring in a bore.

- **Where:** <Ui>Insert</Ui> > <Ui>Ring groove</Ui>; the toolbar
- **Works in:** part documents
- **For agents:** `part.ringGroove`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `body`: The body this feature changes.
  - `on`: The round face to machine: a shaft's side or a bore's wall.
  - `at`: How far along the axis the cut starts, from the end the axis points away from.
  - `flip`: Measure from the other end of the face.

### Knurl {#designer-part-knurl}

Knurls a shaft for grip, with DIN 82 grooves.

- **Where:** <Ui>Insert</Ui> > <Ui>Knurl</Ui>; the toolbar
- **Works in:** part documents
- **For agents:** `part.knurl`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `body`: The body this feature changes.
  - `on`: The shaft's round side.
  - `at`: How far along the axis the cut starts, from the end the axis points away from.
  - `length`: How long the knurl runs along the axis.
  - `pattern`: Straight ridges along the shaft, ridges leaning left or right, or a raised diamond.
  - `pitch`: How far apart the ridges are.
  - `flip`: Measure from the other end of the face.

### Spline {#designer-part-spline}

Cuts DIN 5480 involute spline teeth into a bore, for the splined shaft that slides into it.

- **Where:** <Ui>Insert</Ui> > <Ui>Spline</Ui>; the toolbar
- **Works in:** part documents
- **For agents:** `part.spline`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `body`: The body this feature changes.
  - `on`: The bore's wall.
  - `at`: How far along the axis the cut starts, from the end the axis points away from.
  - `length`: How long the teeth run along the axis.
  - `module`: The teeth's size, one of DIN 5480's modules.
  - `diameter`: The spline's reference diameter; left empty, the spline whose hub teeth end on the bore.
  - `flip`: Measure from the other end of the face.

### Thread {#designer-part-thread}

Models an ISO metric thread on a shaft of its size, or in a bore drilled for its tap.

- **Where:** <Ui>Insert</Ui> > <Ui>Thread</Ui>; the toolbar
- **Works in:** part documents
- **For agents:** `part.thread`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `body`: The body this feature changes.
  - `on`: The round face to machine: a shaft's side or a bore's wall.
  - `at`: How far along the axis the cut starts, from the end the axis points away from.
  - `length`: How long the thread runs along the axis.
  - `size`: The metric size, such as M8; left empty, it is found from the face's diameter, a shaft's nominal or a bore's tap drill.
  - `pitch`: The pitch; the size's coarse pitch when left empty.
  - `flip`: Measure from the other end of the face.

## Parts, parameters and connectors

### Add connector {#designer-product-add-connector}

Puts a connector where an assembly can fasten this part: at the middle of a picked flat face, where a hole's or a cylinder's axis crosses the face it meets, or at a circular edge's centre; on a hole of several positions it is one connector per hole.

- **Where:** <Ui>Insert</Ui> > <Ui>Add connector</Ui>
- **Works in:** part documents
- **For agents:** `product.addConnector`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `part` (string)
  - `id` (string)
  - `on` (object): A face reference to the one flat face it sits on.
  - `origin`: A point on the face.
  - `axis` (object): A face reference to cylindrical faces, such as a hole's wall; the connector sits where their axis crosses the face.
  - `centre` (object): An edge reference to one circular edge; the connector sits at its centre.
  - `direction`: Its x axis, needed on a slanted face.
  - `every` (boolean): On a hole's wall, one connector per position of the hole, named &lt;id&gt;.&lt;position&gt;; true when left out.

### Connector holes {#designer-product-set-connector}

Puts a connector on a hole's wall on every position of the hole, one connector each named &lt;id&gt;.&lt;position&gt;, or on one position alone.

- **Where:** the <Ui>Properties</Ui> panel
- **Works in:** part documents
- **For agents:** `product.setConnector`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `part` (string, required)
  - `id` (string, required)
  - `position` (string): The hole position's id; every position when left out.

### Remove connector {#designer-product-remove-connector}

Takes a connector off a part.

- **Where:** the <Ui>Properties</Ui> panel
- **Works in:** part documents
- **For agents:** `product.removeConnector`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `part` (string, required)
  - `id` (string, required)

### Part properties {#designer-product-set-part}

Names a part, gives it a material (a preset is added to the document), a colour or a finish (metallic, roughness); every body is a part until the document lists them.

- **Where:** the <Ui>Properties</Ui> panel
- **Works in:** part documents
- **For agents:** `product.setPart`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `id` (string, required): The part; a body's id while the document lists no parts.
  - `name` (string)
  - `material` (string): A material id, or a preset such as steel or aluminium-6061; empty clears it.
  - `color` (string): #rrggbb; empty clears it.
  - `metallic`: From 0, paint or plastic, to 1, bare metal; empty takes the material's.
  - `roughness`: From 0, a mirror, to 1, chalk; empty takes the material's.

### Parameter {#designer-parameter-add}

Adds a named value that expressions in any field can use.

- **Where:** <Ui>Insert</Ui> > <Ui>Parameter</Ui>; the <Ui>Features</Ui> panel
- **Works in:** part documents and assembly documents
- **For agents:** `parameter.add`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `name` (string): Its name; the next free paramN when left out.
  - `value`: A number or an expression.
  - `unit` (string): mm, cm, m, in, deg or none.

### Change parameter {#designer-parameter-set}

Sets a parameter's value, unit, limits or description, or renames it while nothing uses it.

- **Where:** the <Ui>Properties</Ui> panel
- **Works in:** part documents and assembly documents
- **For agents:** `parameter.set`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `name` (string, required): The parameter.
  - `rename` (string): A new name.
  - `value`: A number or an expression.
  - `unit` (string): mm, cm, m, in, deg or none; null drops it.
  - `min` (number)
  - `max` (number)
  - `step` (number)
  - `description` (string)
  - `configuration` (string): A configuration to set the value in, instead of the parameter's own.

### Visitors can change it {#designer-parameter-offer-to-visitors}

Gives visitors of the shared design a slider for this parameter, between its min and max; what they try rebuilds only their own view and is never saved.

- **Where:** the <Ui>Properties</Ui> panel
- **Works in:** part documents and assembly documents
- **For agents:** `parameter.offerToVisitors`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `name` (string): The parameter.
  - `offered` (boolean): Whether visitors get its slider; left out, it switches.

### Delete parameter {#designer-parameter-delete}

Removes a parameter nothing uses.

- **Where:** the <Ui>Features</Ui> panel; the <Ui>Properties</Ui> panel
- **Works in:** part documents and assembly documents
- **For agents:** `parameter.delete`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `name` (string): The parameter.

## Assemblies

### Open its document {#designer-assembly-open-source}

Opens the document a component, or a part inside a sub-assembly, comes from, with that part selected, to change its features.

- **Where:** the right-click menu; the <Ui>Features</Ui> panel; the <Ui>Properties</Ui> panel
- **Works in:** assembly documents
- **For agents:** `assembly.openSource`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `row` (string): The tree row whose document to open: component:&lt;id&gt; or occurrence:&lt;path&gt;; with none, the selected one, else the last pick's.

### Insert component {#designer-assembly-insert}

Places a part of a part document, or a whole assembly as a sub-assembly, in this assembly.

- **Where:** <Ui>Insert</Ui> > <Ui>Insert component</Ui>; the toolbar; the <Ui>Properties</Ui> panel; the start view, in the middle of an empty design, part or assembly
- **Works in:** assembly documents
- **For agents:** `assembly.insert`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `document` (string): The id of the part document, or of an assembly document to place as a sub-assembly.
  - `part` (string): The part, or a body's id while that document lists no parts; left out for a sub-assembly.
  - `id` (string): The component's id; the part's name and the next free number when left out.
  - `at` (object): Where it goes, as a frame \{ origin, normal, direction \}; where its document has it when left out, and beside the assembly when a person inserts it.
  - `parameters` (object): Its own values for its document's parameters, \{ name: value \}: a number, a boolean, text, or an expression over this assembly's parameters.

### Show configuration {#designer-assembly-show-configuration}

Builds and shows the assembly with one of its configurations' values, or with the document's own values.

- **Where:** the <Ui>Features</Ui> panel; a design's preview
- **Works in:** assembly documents
- **For agents:** `assembly.showConfiguration`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `configuration` (string): The configuration's id; the document's own values when left out.

### Place component {#designer-assembly-place}

Moves a component to a frame: its own origin, X and Z axes onto the frame's origin, direction and normal.

- **Where:** the <Ui>Properties</Ui> panel
- **Works in:** assembly documents
- **For agents:** `assembly.place`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `id` (string, required)
  - `at` (object, required): \{ origin, normal, direction \}.

### Component parameters {#designer-assembly-component-parameters}

Gives a component its own values for its document's parameters, such as a link's length; null brings back the document's value.

- **Where:** the <Ui>Properties</Ui> panel
- **Works in:** assembly documents
- **For agents:** `assembly.setComponentParameters`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `id` (string, required)
  - `parameters` (object, required): Its own values for its document's parameters, \{ name: value \}: a number, a boolean, text, or an expression over this assembly's parameters; null drops the component's own value.

### Remove component {#designer-assembly-remove}

Takes a component out of the assembly with the joints that hold it: the one selected in the tree, or picked in the view.

- **Where:** <Ui>Edit</Ui> > <Ui>Remove component</Ui>; the right-click menu; the <Ui>Features</Ui> panel; the <Ui>Properties</Ui> panel
- **Key:** <kbd>Del</kbd>
- **Works in:** assembly documents
- **For agents:** `assembly.remove`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `id` (string, required)

### Joint {#designer-assembly-joint}

Joins a component by one of its connectors to another's: fastened, or turning, sliding or both about the shared axis.

- **Where:** <Ui>Insert</Ui> > <Ui>Joint</Ui>; the toolbar; the <Ui>Properties</Ui> panel
- **Works in:** assembly documents
- **For agents:** `assembly.joint`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `id` (string)
  - `type` (one of `"fastened"`, `"revolute"`, `"slider"`, `"cylindrical"`)
  - `component` (string): The component the joint moves.
  - `connector` (string): Its connector.
  - `to` (object): \{ component, connector \} it is joined to.
  - `flip` (boolean)
  - `angle`: Degrees about the shared axis.
  - `offset`: Along the shared axis.
  - `limits` (object): How far it may move: \{ angle: [least, most] \} in degrees, \{ offset: [least, most] \} along the axis.

### Change joint {#designer-assembly-set-joint}

Sets a joint's type, connectors, flip, angle, offset or limits; null drops a value.

- **Where:** the <Ui>Properties</Ui> panel
- **Works in:** assembly documents
- **For agents:** `assembly.setJoint`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `id` (string, required)
  - `type` (one of `"fastened"`, `"revolute"`, `"slider"`, `"cylindrical"`)
  - `component` (string): The component the joint moves.
  - `connector` (string): Its connector.
  - `to` (object): \{ component, connector \} it is joined to.
  - `flip` (boolean)
  - `angle`: Degrees about the shared axis.
  - `offset`: Along the shared axis.
  - `limits` (object): How far it may move: \{ angle: [least, most] \} in degrees, \{ offset: [least, most] \} along the axis.

### Remove joint {#designer-assembly-remove-joint}

Takes a joint out; its component stays where its frame puts it.

- **Where:** the right-click menu; the <Ui>Features</Ui> panel; the <Ui>Properties</Ui> panel
- **Key:** <kbd>Del</kbd>
- **Works in:** assembly documents
- **For agents:** `assembly.removeJoint`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `id` (string, required)

### Replicate {#designer-assembly-replicate}

Places a component once on every connector of a set, such as a bolt in every hole of a flange: its own connector fastened to each member; on a component replicated already it changes the replicate, and null drops flip, angle or offset.

- **Where:** <Ui>Insert</Ui> > <Ui>Replicate</Ui>; the right-click menu; the <Ui>Properties</Ui> panel
- **Works in:** assembly documents
- **For agents:** `assembly.replicate`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `id` (string, required): The component placed on every member.
  - `connector` (string): Its own connector, fastened to each member.
  - `to` (object): \{ component, connector \}: the component placed once, and its connector set, or one connector for one occurrence.
  - `flip` (boolean)
  - `angle`: Degrees about each shared axis.
  - `offset`: Along each shared axis.

### Stop replicating {#designer-assembly-unreplicate}

Places a replicated component once again, where its document has it.

- **Where:** the <Ui>Properties</Ui> panel
- **Works in:** assembly documents
- **For agents:** `assembly.unreplicate`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `id` (string, required)

### Pattern {#designer-assembly-pattern}

Places copies of a component turned about an axis (polar) or stepped along a direction (linear), each counted in the bill of materials; on a patterned component it changes the pattern, and null takes it away.

- **Where:** <Ui>Insert</Ui> > <Ui>Pattern</Ui>; the right-click menu; the <Ui>Properties</Ui> panel
- **Works in:** assembly documents
- **For agents:** `assembly.pattern`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `id` (string, required): The component to pattern.
  - `pattern` (object): \{ polar: \{ axis: \{ origin, direction \}, count, angle?, start? \} \} or \{ linear: \{ direction, spacing, count \} \}, every number a value or an expression; null takes the pattern away; left out, a person's run starts a polar pattern about the up axis.

### Fasten {#designer-assembly-fasten}

Puts a screw or a bolt in every hole of a connector set, sized by the holes' fastener unless a size is named, its head down in the counterbore when the holes are counterbored for a socket head: one screw part document serves every size, and each set is one replicated component.

- **Where:** <Ui>Insert</Ui> > <Ui>Fasten</Ui>
- **Works in:** assembly documents
- **For agents:** `assembly.fasten`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `to` (object): \{ component, connector \}: the component whose holes take the fasteners, and its connector set on their axes; the selected component's one hole set when left out.
  - `kind` (one of `"screw"`, `"bolt"`): Which fastener, a socket head cap screw or a hex bolt; screw when left out.
  - `size` (string): The metric size, such as M8; the holes' fastener size when left out.
  - `length` (number): How long under the head; the part's default when left out.
  - `id` (string): The component's id; the fastener's kind and the next free number when left out.

### Drop a part {#designer-assembly-drop}

Places a part, a sub-assembly or a standard part where it was dropped in the view, lying on the face or ground under it, and joins it to the connector it was dropped on, all as one change.

- **Where:** <Ui>Help</Ui> > <Ui>Find a command</Ui>, then <Ui>Drop a part</Ui>
- **Works in:** assembly documents
- **For agents:** `assembly.drop`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `document` (string): The id of the part document, or of an assembly to place as a sub-assembly.
  - `part` (string): The part of that document; left out for a sub-assembly.
  - `kind` (string): A standard part's kind, instead of a document.
  - `values` (object): The standard part's sizes, by parameter name.
  - `at` (object, required): Where it goes, as a frame \{ origin, normal, direction \}.
  - `join` (object): \{ component, connector, own, type \}: joins its own connector to a placed component's, fastened or revolute; its frame then comes from the joint.

### Insert again {#designer-assembly-insert-again}

Places another of the part last inserted, with the same sizes, beside the rest.

- **Where:** <Ui>Insert</Ui> > <Ui>Insert again</Ui>
- **Works in:** assembly documents
- **For agents:** `assembly.insertAgain`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Mesh gears {#designer-assembly-mesh-gears}

Sets two spur gears of one module turning together: each on a revolute joint about its axis, their centres as far apart as the pair needs, the teeth in mesh, both turned by one angle parameter.

- **Where:** <Ui>Insert</Ui> > <Ui>Mesh gears</Ui>; the right-click menu
- **Works in:** assembly documents
- **For agents:** `assembly.meshGears`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `driver` (string): The gear the angle turns; the first of the two selected when left out.
  - `driven` (string): The gear it turns, placed beside it on the side it stands.
  - `turn` (string): The assembly parameter that turns the driver, in degrees; "turn" when left out, added when the assembly has none.

## Inspecting

### Check clashes {#designer-assembly-check-clashes}

Finds placed parts of the assembly as built that overlap, touch or come closer than the clearance; a touch a joint asks for is left out.

- **Where:** <Ui>Inspect</Ui> > <Ui>Check clashes</Ui>; the toolbar; the dock
- **Works in:** assembly documents
- **For agents:** `assembly.checkClashes`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `clearance` (number): How close two parts may come before they are listed, 0 or more, in the document's length unit; 0 or left out lists only overlaps and touches.

### Measure {#designer-view-measure}

Measures the picked faces or edges: one gives its length or area and any radius, two the distance between them and their angle when both are flat or straight.

- **Where:** <Ui>Inspect</Ui> > <Ui>Measure</Ui>; the toolbar
- **Works in:** part documents and assembly documents
- **For agents:** `view.measure`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `picks` (list of objects): The faces or edges to measure, up to 2, each \{ part, path, kind, index \} as the build names them; the current picks when left out.

### Section view {#designer-view-section}

Cuts the view with a plane across X, Y or Z, hiding what lies on the side it faces and filling the faces it cuts; alone it turns on facing the camera, or off again.

- **Where:** <Ui>Inspect</Ui> > <Ui>Section view</Ui>; the toolbar; the section bar, while a section is on
- **Key:** <kbd>X</kbd>
- **Works in:** part documents and assembly documents
- **For agents:** `view.section`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `axis` (one of `"x"`, `"y"`, `"z"`): The axis the plane stands square to.
  - `offset` (number): Where the plane crosses the axis, in the document's length unit.
  - `flip` (boolean): Hides the other side of the plane: with false what lies beyond the offset along the axis is hidden.
  - `off` (boolean): Turns the section view off.

### Sweep clashes {#designer-assembly-sweep-clashes}

Checks the assembly for clashes at steps of a parameter from its least to its most value, so parts that collide only part way through a motion are found, with the values where each pair clashes.

- **Where:** <Ui>Inspect</Ui> > <Ui>Sweep clashes</Ui>; the dock
- **Works in:** assembly documents
- **For agents:** `assembly.sweepClashes`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `name` (string): The parameter to sweep, one with a min and a max; the one playing, else the first that has both, when left out.
  - `steps` (integer): How many steps between its least and most values, 1 to 360; 24 when left out. An angle over a whole turn wraps, so its last step is not checked twice.
  - `clearance` (number): How close two parts may come before they are listed, 0 or more, in the document's length unit; 0 when left out.

### Stop sweeping {#designer-assembly-stop-clash-sweep}

Stops a clash sweep through a parameter before its last step; what it found so far is dropped.

- **Where:** <Ui>Inspect</Ui> > <Ui>Stop sweeping</Ui>; the dock
- **Works in:** assembly documents
- **For agents:** `assembly.stopClashSweep`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

## Operations

### Operation {#designer-part-operation}

Runs any operation of the CAD API by its dotted path, with its inputs.

- **Where:** <Ui>Insert</Ui> > <Ui>Operation</Ui>; the toolbar
- **Works in:** part documents
- **For agents:** `part.operation`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `operation`: The operation's dotted path, such as occt.operations.offset.
  - `params`: The operation's inputs; \{ "body": "&lt;id&gt;" \} passes a body.
  - `body`: Go on as this body instead of starting a new one.

### Script {#designer-part-script}

Runs a script the document carries as an asset on the document's geometry.

- **Where:** <Ui>Insert</Ui> > <Ui>Script</Ui>
- **Works in:** part documents
- **For agents:** `part.script`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `script`: The id of the script asset.
  - `params`: The script's inputs.
  - `body`: Go on as this body instead of starting a new one.

## Help and review

### Tutorials {#designer-help-tutorials}

Lists the tutorials, or starts the one named: each shows the way step by step while you do the work, and can do a step for you.

- **Where:** <Ui>Help</Ui> > <Ui>Tutorials</Ui>; the start view, in the middle of an empty design, part or assembly
- **Works in:** part documents and assembly documents
- **For agents:** `help.tutorials`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
- **Values:**
  - `topic` (string): The tutorial's topic id: designer.tutorials.first-part, designer.tutorials.desk-arm.

### Copy crash report {#designer-help-copy-crash-report}

Copies what the geometry kernel crashed on in this document, with the document itself, to send to Bitbybit.

- **Where:** <Ui>Help</Ui> > <Ui>Copy crash report</Ui>; the dock
- **Works in:** part documents and assembly documents
- **For agents:** only a person runs it; agents see it as unavailable
- **Values:**
  - `feature` (string): The feature the kernel crashed making; the latest crash when left out.

### Clear the kernel caches {#designer-help-clear-caches}

Empties what the geometry kernels keep of shapes they already made, so the next build makes every one again.

- **Where:** <Ui>Help</Ui> > <Ui>Clear the kernel caches</Ui>
- **Works in:** part documents and assembly documents
- **For agents:** `help.clearCaches`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Designer guide {#designer-help-guide}

Opens the Designer's guide on learn.bitbybit.dev: how it works, the tutorials and every command.

- **Where:** <Ui>Help</Ui> > <Ui>Designer guide</Ui>
- **Works in:** part documents and assembly documents
- **For agents:** `help.guide`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Community {#designer-help-community}

Opens the Bitbybit community on Discord, to ask a question or show what you made.

- **Where:** <Ui>Help</Ui> > <Ui>Community</Ui>
- **Works in:** part documents and assembly documents
- **For agents:** `help.community`, through [`designer-run-command`](./agent-tools.md#designer-run-command)

### Find a command {#designer-help-commands}

Searches every command by name.

- **Where:** <Ui>Help</Ui> > <Ui>Find a command</Ui>; the right-click menu
- **Key:** <kbd>Ctrl+K</kbd>, <kbd>⌘K</kbd> on macOS
- **Works in:** part documents and assembly documents
- **For agents:** only a person runs it; agents see it as unavailable

### Showcases {#designer-help-showcases}

Opens the Designer's showcase projects on learn.bitbybit.dev: a desk arm, a robot arm and a jet engine to open, take apart and learn from.

- **Where:** <Ui>Help</Ui> > <Ui>Showcases</Ui>
- **Works in:** part documents and assembly documents
- **For agents:** `help.showcases`, through [`designer-run-command`](./agent-tools.md#designer-run-command)
