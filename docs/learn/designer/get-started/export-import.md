---
sidebar_position: 5
title: "Export and import design files"
sidebar_label: Export and import
description: Save a whole Designer project or one document as a file - project, project with geometry, design document, STEP, GLB, BREP or STL - and bring design documents or CAD files back in.
topic: designer.get-started.export-import
type: how-to
verified: 2026-10-09
tags: [designer]
---

# Export and import design files

## Export

Choose <Ui>File</Ui> > <Ui>Export...</Ui>. The dialog offers the whole project or the document that is open:

<Shot id="designer.tour/export" />

| Choice | What you get |
|---|---|
| <Ui>Project</Ui> | Every document of the project in one `.bitbybit` file, to keep, share or open again. |
| <Ui>Project with geometry</Ui> | The same with its built geometry (`.bitbybitz`), so it opens almost at once. |
| <Ui>Design document</Ui> | The open document as a [design document](../../using-ai-with-bitbybit/design-documents.md) (`.design.json`). |
| <Ui>STEP</Ui> | The open document as CAD for other programs, with its assembly tree, names and colours. |
| <Ui>GLB</Ui> | A 3D model for the web and for viewers. |
| <Ui>BREP</Ui> | OpenCascade's own exact format. |
| <Ui>STL</Ui> | A mesh for 3D printing. |

When you view someone else's design below Gold, the dialog offers only what its author allows under <Ui>Visitors can download</Ui>, and greys out the rest with the reason.

## Import

- <Ui>File</Ui> > <Ui>Import design documents</Ui> adds the documents of a `.bitbybit`, `.bitbybitz` or design document file to the project. A document with the same id as one you have replaces it.
- <Ui>File</Ui> > <Ui>Import STEP, IGES or BREP</Ui> brings in a file from another CAD program. A STEP file becomes its assemblies and parts: an assembly document for each assembly and a part document for each part, placed where the file places them, with their names and colours; a part placed many times stays one document. Their shapes are kept with the project as one file, and the status bar says what changed on the way, such as a mirrored placement built into a part of its own. An import is not undone with <Ui>Undo</Ui>: <Ui>File</Ui> > <Ui>Remove the last import</Ui> deletes the documents it added, after asking, while no other document uses them; the file itself stays with the project. Importing the same file again adds a second copy. An IGES or BREP file starts one part that imports it. Both need the project to be open on bitbybit.dev, which keeps the files.
