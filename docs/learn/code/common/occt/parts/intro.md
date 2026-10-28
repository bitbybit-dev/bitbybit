---
sidebar_position: 1
title: "Standard Parts: Sizes, Solids, Frames and Roles"
sidebar_label: Standard Parts
description: How Bitbybit builds standard parts - bolts, gears, bearings, keys, rings and springs to ISO, ANSI and DIN - from the tables in bitbybit.engineering.mechanical, places each by a frame, and names the role of every face.
topic: code.occt.parts
type: explanation
tags: [code, occt]
---

# Standard parts

Bitbybit builds the parts a mechanism is made of to the standards a supplier sells them by: an ISO 4017 bolt, a 6204 ball bearing, a DIN 6885 key. Ask for a size, such as M8 or 1/4 inch, and the part comes out with the dimensions its standard gives, ready to place in a model.

## Two halves: the tables and the solids

- `bitbybit.engineering.mechanical` holds the **tables**. Given a size, it gives the numbers: a nut's width across flats, the drill for a tapped hole, the centre distance of two gears. The tables need no CAD kernel, so they also serve a script that only plans or checks a design.
- `bitbybit.occt.parts.mechanical` builds the **solids** from the same tables with the Bitbybit OCCT Kernel: the bolt, the bearing, the gear, and the threads, keyways and grooves machined to take them.

The tables size what goes around a part: the clearance hole a bolt passes through, the bore a bearing sits in, how far apart two gears stand. [Fasteners](./fasteners) builds a bolted joint that way, from a clearance hole and a washer's thickness.

## Standards and units

Each family is split by standard: `iso` for metric parts, `ansi` for inch parts to the ASME and ANSI standards, and `din` where a German standard is the usual one, for keys, retaining rings, splines and knurls. A size names its standard's thread or designation whatever unit you build in, and `unit` sets the unit every length is given and returned in: millimetres unless you choose otherwise for `iso` and `din`, inches for `ansi`. An inch screw in a model built in millimetres takes `unit` set to millimetres and comes out at its true size.

The examples on these pages are in millimetres, so a part is tens of units across, and the editors' camera, which starts about 22 units from the origin, would stand inside it. Each example therefore ends by moving the camera out with `bitbybit.babylon.scene.adjustActiveArcRotateCamera`: `position` is where the camera stands and `lookAt` the point it looks at.

The tables also list what each standard holds, for a dropdown or a loop over sizes:

- `bitbybit.engineering.mechanical.threads.iso.sizes` lists the metric thread sizes, from M1.6 to M24, and `bitbybit.engineering.mechanical.threads.ansi.sizes` the Unified inch sizes, from #0 to 1 inch.
- `bitbybit.engineering.mechanical.bearings.iso.designations` lists the metric ball bearings, such as 608 and 6204, and `bitbybit.engineering.mechanical.bearings.ansi.designations` the inch R-series.
- `bitbybit.engineering.mechanical.retainingRings.din.diameters` and `bitbybit.engineering.mechanical.retainingRings.ansi.diameters` list the shaft and bore diameters a retaining ring is made for.

## Placing a part with a frame

Every part takes a **frame** and is placed as a fitter would hold it. For a bolt, a nut or a washer the frame's origin is where the part bears, under a head or under a nut's face, and its normal runs along the part's axis away from what it sits on: a bolt's head rises along the normal and its shank runs the other way, so a frame on top of a plate, its normal pointing up, seats the bolt in a hole drilled there. A gear sits with its centre on the origin and a tooth along the frame's direction, and a keyway or a groove machined into a shaft starts at the origin and runs along the normal. Each page says where its parts sit on their frame; left out, most parts stand on the ground, facing +Y.

## Roles: which face is which

Every part has a `...WithRoles` twin that builds the same part and names the role each of its faces plays: a bolt's `head`, `seat`, `shank`, `thread` and `end`, a gear's `tip`, `flank`, `root` and `bore`. It returns `{ shape, roles, frames }`. `roles` lists, for each role, the faces playing it by their index, as `shapes.face.getFaces` numbers them, and every face plays exactly one role. `frames` holds named frames on the part, such as a bolt's `seat` or a gear's `axis`, to place the next part on.

```typescript
const M8 = Bit.Inputs.Engineering.isoThreadSizeEnum.m8;
const { shape, roles, frames } = await bitbybit.occt.parts.mechanical.fasteners.iso.hexBoltWithRoles({ size: M8, length: 30 });
const faces = await bitbybit.occt.shapes.face.getFaces({ shape });
const threadFaces = roles.thread.map((index) => faces[index]);
```

A history follows faces through an operation ([picking faces and edges](../../concepts/picking-faces-and-edges#by-history)); roles name the faces of a part as it is made, so a step can fillet a gear's tips or mate a bearing's bore without counting faces.

## The families

- [Fasteners](./fasteners): hex bolts, socket head cap screws, nuts, set screws, washers and dowel pins, with clearance holes.
- [Gears](./gears): spur, helical, bevel and ring gears and racks, and how gears mesh, in pairs and planetary sets.
- [Bearings, keys, rings and springs](./bearings-keys-rings-springs): ball bearings, parallel keys, retaining rings and compression springs.
- [Machining](./machining): threads, keyways, ring grooves, splines, knurls and flats cut into shafts, holes and hubs.

{/* namespaces:occt.parts.mechanical:start - generated from the API index; edits between these markers are overwritten */}

| Namespace | What it is for | Functions | Explained in |
|---|---|---|---|
| `machining` | Machining on round shafts and bores, by the standard that sizes it. | 24 | [read](/learn/code/common/occt/parts/machining) |
| `fasteners` | Fasteners as solids, by the standard that sizes them. | 22 | [read](/learn/code/common/occt/parts/fasteners) |
| `gears` | Involute gears, made from their sizes rather than drawn. | 13 | [read](/learn/code/common/occt/parts/gears) |
| `bearings` | Rolling bearings as solids, by the standard that sizes them. | 4 | [read](/learn/code/common/occt/parts/bearings-keys-rings-springs) |
| `keys` | Keys as solids, by the standard that sizes them. | 4 | [read](/learn/code/common/occt/parts/bearings-keys-rings-springs) |
| `retainingRings` | Retaining rings as solids, by the standard that sizes them. | 4 | [read](/learn/code/common/occt/parts/bearings-keys-rings-springs) |
| `springs` | Springs made from their wire and coils. | 3 | [read](/learn/code/common/occt/parts/bearings-keys-rings-springs) |

{/* namespaces:occt.parts.mechanical:end */}

{/* namespaces:engineering.mechanical:start - generated from the API index; edits between these markers are overwritten */}

| Namespace | What it is for | Functions | Explained in |
|---|---|---|---|
| `gears` | Involute gears by their numbers, with no CAD kernel needed. | 14 | [read](/learn/code/common/occt/parts/gears) |
| `fasteners` | The sizes of fasteners by the standard that sets them, with no CAD kernel needed. | 13 | [read](/learn/code/common/occt/parts/fasteners) |
| `bearings` | The sizes of deep groove ball bearings by the standard that sets them, with no CAD kernel needed. | 4 | [read](/learn/code/common/occt/parts/bearings-keys-rings-springs) |
| `retainingRings` | The sizes of retaining rings and their grooves by the standard that sets them, with no CAD kernel needed. | 4 | [read](/learn/code/common/occt/parts/bearings-keys-rings-springs) |
| `threads` | The sizes of screw threads by the standard that sets them, with no CAD kernel needed: iso holds the ISO metric threads, ansi the Unified inch threads. | 4 | [read](/learn/code/common/occt/parts/machining) |
| `keys` | The sizes of parallel keys and their keyways by the standard that sets them, with no CAD kernel needed. | 2 | [read](/learn/code/common/occt/parts/bearings-keys-rings-springs) |
| `knurls` | The grooves of knurls on a cylinder by the standard that sets them, with no CAD kernel needed. | 2 | [read](/learn/code/common/occt/parts/machining) |
| `splines` | The sizes of involute splines by the standard that sets them, with no CAD kernel needed. | 2 | [read](/learn/code/common/occt/parts/machining) |
| `springs` | Compression springs with closed and ground ends, with no CAD kernel needed: the path of the wire's centre, its pitch and its solid length. | 1 | [read](/learn/code/common/occt/parts/bearings-keys-rings-springs) |

{/* namespaces:engineering.mechanical:end */}
