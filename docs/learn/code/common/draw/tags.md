---
sidebar_position: 3
title: Text Tags Pinned to Points
sidebar_label: Tags
description: Tags in Bitbybit are text labels pinned to 3D positions that follow the camera - how to describe one, draw one or many, update them in place, and what each editor offers - with a table of every function.
topic: code.draw.tags
type: explanation
tags: [code, draw]
---

# Text tags pinned to points

A **tag** is a line of text pinned to a point in the scene. It is drawn over the 3D view as a page element, not as geometry, so it stays sharp and, unless you ask otherwise, the same size on screen however far the camera is. It moves with its point as the camera turns. Tags name parts, show measurements and mark points while you model.

For text that is part of the model, which can be exported, filleted or printed, use text as geometry instead: `bitbybit.occt.shapes.wire.textWires` gives outlines to extrude, `bitbybit.jscad.text` builds text from strokes, and the platform's `bitbybit.advanced.text3d` builds solid letters in a choice of fonts.

## Describing a tag

`bitbybit.tag.create` describes a tag without drawing it:

- `text`: what it says;
- `position`: the point it is pinned to;
- `colour` and `size`: its text colour, and its size in pixels;
- `adaptDepth`: when on, a tag further from the camera is drawn smaller.

## Drawing tags

`drawTag` draws one tag and `drawTags` a list of them. Both keep the tags following their points until the next run clears the scene. With `updatable` on, a later draw that passes back what the first returned changes those tags in place, adding and removing to match the new list, rather than drawing a second set.

`bitbybit.draw.drawAnyAsync` recognises tags too, so a tag description, or a list of them, can go to the same draw call as everything else.

## In each editor

- **TypeScript:** every function above, as in this snippet that names the corners of a box:

  ```typescript
  const corners: [number, number, number][] = [[0, 0, 0], [4, 0, 0], [4, 0, 2], [0, 0, 2]];
  const tags = corners.map((position, index) => bitbybit.tag.create({ text: `corner ${index + 1}`, position, colour: "#f0cebb", size: 14, adaptDepth: false }));
  bitbybit.tag.drawTags({ tags, updatable: false });
  ```

- **Blockly:** the tag category has the block that describes a tag. Draw it with the draw block, as any other entity.
- **Rete:** has no tag component yet. A code component can call `bitbybit.tag.drawTags` ([Code components](/learn/getting-started/rete/typescript-editor-component)).

## Every function

{/* api:tag:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`create`](https://docs.bitbybit.dev/classes/Bit.Tag#create) | Builds a tag description from its text, position, color, size and depth behavior, without drawing it; `drawTag` or `drawTags` put it on screen. |
| [`drawTag`](https://docs.bitbybit.dev/classes/Bit.Tag#drawTag) | Puts one tag on screen as a text element pinned to its 3D position, and keeps it following that position. |
| [`drawTags`](https://docs.bitbybit.dev/classes/Bit.Tag#drawTags) | Puts several tags on screen, each a text element pinned to its 3D position. |

{/* api:tag:end */}
