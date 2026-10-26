---
sidebar_position: 9
title: "Units and working in inches"
sidebar_label: Units and inches
description: Set a design's unit of length, model in inches with ANSI standard parts, holes and machining, and bring files in and out of the Designer at their true size.
topic: designer.modelling.units
type: how-to
verified: 2026-10-26
tags: [designer]
---

# Units and working in inches

A design has one unit of length, millimetres until you change it: centimetres, metres or inches. Every length a feature, a sketch, a joint or a parameter holds is in that unit, and every document of the design is in it, so an assembly places each part at the size it was drawn. Angles are always degrees. The design's unit is the one its documents share, so a design written in inches elsewhere opens in inches.

## Set the design's units

Choose <Ui>File</Ui> > <Ui>Units</Ui>, pick the unit and choose <Ui>Set units</Ui>. The numbers stay as they are and their unit changes, so a block 10 millimetres wide becomes a block 10 inches wide: set the unit when you start a design, before its sizes are typed. Every document changes in the one step, and so does every length parameter, while angles and counts keep theirs. A parameter's unit is the design's, degrees or none.

Standard sizes keep their real size: an M8 screw, a 1/4-20 thread or a 608 bearing stays what it is, each standard part's number is rewritten to name its real length, and a fastened screw stays sunk in its counterbore. An imported IGES file keeps its real size too, while a STEP or BREP file imported into the design became shapes in its unit, so those change with the numbers. Undo works in each document on its own; once every document is back in the old unit, so is the design. The tutorials are written in millimetres and start only in a millimetre design.

New documents, solids, sketches and features start at sizes that suit the unit, and in inches they start at binary fractions such as 3/8 or 1/4. The ground grid steps through 1/64, 1/32 and on up to 1 inch, then whole inches, with a heavier line every fourth step.

A document that arrives in another unit, from a file or another design, is listed in the <Ui>Problems</Ui> tab, with a button that gives it the design's unit. Until then an assembly in the design's unit cannot place it.

## Standard parts in inches

The [standard parts library](../assemblies/components.md#standard-parts) has fasteners and ball bearings to ISO and to the ANSI inch standards, and keys and retaining rings to DIN and to ANSI. Pick one with <Ui>Standard</Ui>; in an inch design the library starts on ANSI. Either standard works in any design: lengths you type, such as a screw's length, are in the design's unit, and the size stays as its standard writes it, M8, or 1/4 with a UNC or UNF thread, or R8.

Part numbers follow the standard. An ANSI screw's length is written as a fraction of an inch, `SHCS 1/4 UNC x 1-1/4`, and an ISO screw in an inch design keeps its millimetres, `ISO 4762 M8x25`. [Fasten](../assemblies/replicate.md#fasten-a-screw-in-every-hole-at-once) puts the screw of each hole's standard in it.

Gears from the library, the gear solids and the pen's gear and rack take a <Ui>Diametral pitch</Ui> in an inch design instead of a module: the number of teeth to an inch of pitch diameter, 12 to start. Two gears of the same diametral pitch mesh, and <Ui>Mesh gears</Ui> sets them the right distance apart.

## Holes, threads and machining

A hole's <Ui>Fastener</Ui> takes a <Ui>Standard</Ui>: pick ANSI inch, then the <Ui>Size</Ui>, such as 1/4, and its <Ui>Series</Ui>, UNC or UNF, for an inch screw, or ISO metric and a size such as M6 for a metric one, in any design. A size its standard gives no clearance hole for, such as #12, is marked in the list, and can still be tapped. The [machining features](./features.md) have a <Ui>Standard</Ui> too: a keyway, a ring groove, a knurl and a spline are DIN or ANSI, and a thread is ISO or ANSI. In an inch design the ANSI one is chosen first; an ANSI knurl is sized by its diametral pitch, an ANSI spline by its pitch, such as 16/32, and its number of teeth, and an ANSI thread by its series or its threads per inch.

## Files in and out

- STEP and IGES files say their unit. An export is written at its true size in millimetres, which every CAD program reads at the right size, and an imported STEP or IGES file comes in at its true size, converted into the design's unit; the summary of a STEP import says when the file was in another.
- GLB files are written in metres, the unit every glTF viewer expects, so a part in inches opens at its true size.
- STL files carry no unit, so they hold the design's numbers as they are: tell whoever prints the part which unit it is in.
