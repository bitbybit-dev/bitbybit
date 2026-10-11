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
- <Ui>File</Ui> > <Ui>Import STEP, IGES or BREP</Ui> keeps a file from another CAD program with the project and starts a part that imports it. It needs the project to be open on bitbybit.dev, which keeps the file.
