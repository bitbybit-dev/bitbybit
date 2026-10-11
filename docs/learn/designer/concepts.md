---
sidebar_position: 3
title: "How the Designer works"
sidebar_label: How it works
description: The ideas behind the Designer - documents, features built in order, sketches, parameters and expressions, references that survive edits, parts, and assemblies with connectors and joints.
topic: designer.concepts
type: explanation
verified: 2026-10-08
tags: [designer]
---

# How the Designer works

A few ideas explain almost everything the Designer does. Once they are clear, the menus hold few surprises.

## A project holds documents

A Designer project holds any number of documents, listed at the top of the <Ui>Features</Ui> panel:

- a **part document** builds parts from features;
- an **assembly document** places parts of other documents, and whole assemblies, as components, and holds them together with joints. It has no geometry of its own.

<Ui>File</Ui> > <Ui>New part</Ui> and <Ui>File</Ui> > <Ui>New assembly</Ui> add one. A part document can be inserted into many assemblies, and many times into one, each time at its own sizes.

## A part is a list of features

A part document is a list of features, built in order: a sketch, an extrude made from it, a fillet on the extrude's edges, and so on. The <Ui>Features</Ui> panel shows them in that order, and each feature can use only what comes before it.

- **The shape is never stored.** The Designer keeps the list and rebuilds the shape from it after every change, so editing a feature far up the list rebuilds everything after it.
- **Editing.** Right-click a feature for <Ui>Edit feature</Ui>, <Ui>Suppress or restore</Ui> or <Ui>Delete</Ui>. A feature that something later uses cannot just be deleted; <Ui>Delete with what uses it</Ui> takes both.
- **Reordering.** Drag a feature to another place in the list. A move that puts a feature before what it uses, or after what uses it, is refused with both names.
- **Rolling back.** <Ui>Roll back to here</Ui> builds the part only up to that feature, so you can see or change the part as it was. New features go in at that point, and <Ui>Roll to the end</Ui> builds the whole list again.

Adding a feature opens its dialog. The dialog shows what the feature needs, previews it in the view, and <Ui>OK</Ui> adds it. Solids from <Ui>Insert</Ui>, such as a box or a cylinder, work the same way.

## Sketches are flat outlines

A sketch is a flat outline drawn on a plane or on a flat face of the part. The planes are XY, XZ and YZ, each at an offset if you like; with Y up, XZ is the ground. While you draw, the sketch bar holds the tools: lines, arcs, rectangles, circles, polygons, and rounded or bevelled corners.

- A **closed** outline is a profile: extrude it, revolve it, or loft between profiles.
- An **open** outline is a path: sweep a profile along it.
- A sketch on a face is what a boss adds and a pocket cuts.

## Parameters make a part adjustable

Parameters are named values, such as `width` or `thickness`, added with <Ui>Insert</Ui> > <Ui>Parameter</Ui> and listed in the <Ui>Features</Ui> panel. Any number in a feature can be an expression over them, such as `width / 2 - 8`. Change a parameter in <Ui>Properties</Ui>, and every feature that reads it rebuilds. A parameter with a range shows a slider. A parameter that something uses keeps its name and cannot be deleted.

## References name faces and edges by what made them

A fillet needs edges and a hole needs a face. The Designer names them by what made them, not by a number:

- a face by the feature that made it and its role, such as the end face of an extrude, the start face, or the side made by one line of its sketch;
- an edge by the two faces it lies between.

So when the part changes size, or a feature before it changes, the fillet still finds the edges between the top and the sides. When a change does take a reference away, the feature turns red in the <Ui>Features</Ui> panel, the <Ui>Problems</Ui> tab says what was lost, and <Ui>Repair reference</Ui> lets you pick the face it should use now.

## Bodies become parts

The features of a part document make bodies. Each body is a part until you say otherwise, and <Ui>Part properties</Ui> names it and gives it a material; <Ui>Properties</Ui> then shows its volume and mass. An extrude, a revolve and the other features that make shape start a new body unless you name one in their <Ui>Body</Ui> field; then <Ui>Join</Ui> says whether the result is added to it, cut from it or intersected with it. <Ui>Boolean</Ui> combines whole bodies by <Ui>Union</Ui>, <Ui>Difference</Ui> or <Ui>Intersection</Ui>.

## Assemblies place parts with joints

- **Components.** <Ui>Insert component</Ui> places a part of a part document, or a whole assembly as a sub-assembly. Each component can take its own values for its document's parameters, so one link document makes a long link and a short one.
- **Connectors.** A connector marks where a part attaches: a flat face, a hole's wall or rim, a cylinder or a circular edge. <Ui>Add connector</Ui> adds one, and a hole feature makes a set of them, one per hole.
- **Joints.** <Ui>Joint</Ui> joins a component's connector to another's: fastened, or turning, sliding or both about their shared axis, within limits you set. A joint's angle or offset can be a parameter, so the assembly moves when it changes.
- **Replicate.** <Ui>Replicate</Ui> places a component on every connector of a set, such as a screw in every hole of a flange, in one step.

The dock's <Ui>Bill of materials</Ui> counts the parts, and <Ui>Check clashes</Ui> finds parts that overlap. A configuration is a named set of parameter values; <Ui>Show configuration</Ui> builds the assembly with one.

## Undo is per author

Every change is recorded with who made it. <Ui>Undo</Ui> takes back your own last change, even when an agent changed something since, and refuses, naming the other change, when someone else changed the same place after you. The <Ui>History</Ui> tab lists the changes in order. What an agent changes is reviewed separately, in [the Review tab](./working-with-agents.md#review).

## Files

- <Ui>Export...</Ui> writes the open document as STEP, GLB, STL or BREP, or the project as a design document file.
- <Ui>Import STEP, IGES or BREP</Ui> brings a shape from another CAD program into a part, and <Ui>Import design documents</Ui> adds documents from a design document file.

Everything the Designer saves is a [design document](../using-ai-with-bitbybit/design-documents.md): plain JSON that `bitbybit.occt.design.build` also builds in code, in the browser, in Node or on CAD Cloud.
