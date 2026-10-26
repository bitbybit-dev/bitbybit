---
sidebar_position: 3
title: "Parameters and expressions"
sidebar_label: Parameters
description: Name the sizes that matter in a Designer part or assembly, write other numbers as expressions of them, drag a slider to see the model follow, and keep sets of values as configurations.
topic: designer.modelling.parameters
type: how-to
verified: 2026-10-15
tags: [designer]
---

# Parameters and expressions

A parameter is a named value, such as `length` or `width`. Any number in a feature, a sketch or a joint can be an expression of the document's parameters, so changing one parameter changes everything written in it.

## Add a parameter

Choose <Ui>Insert</Ui> > <Ui>Parameter</Ui>, or click <Ui>Add parameter</Ui> at the foot of the <Ui>Parameters</Ui> group in the <Ui>Features</Ui> panel. The new parameter is selected, and <Ui>Properties</Ui> shows it:

<Shot id="designer.modelling.parameters/parameter" />

- <Ui>Name</Ui>: what expressions call it. Rename it while nothing uses it yet.
- <Ui>Value</Ui>: a number, or an expression of other parameters, such as `length / 2`.
- <Ui>Unit</Ui>: mm, cm, m, in, deg, or none for a plain number such as a count.
- <Ui>Limits and description</Ui>: the least and the most it may be, the step of its slider, and a line on what it is for.
- <Ui>Visitors can change it</Ui>: gives the people you share the design with a slider for it (see below).
- Under them, the features that use it. A parameter something uses cannot be deleted.

The picture shows the desk arm link's `length`, which its sketches and its end hole are written in.

## Drag and watch

<Shot id="designer.modelling.parameters/changed" />

Type a new value, or drag the slider, and the part rebuilds as you go: every feature that reads the parameter, and everything built after it. Here the link's `length` went from 160 to 220, and its outline, its slot and the hole at its end followed. <Ui>Undo</Ui> puts the old value back.

## Play a parameter

<Ui>Play</Ui>, at the top of a parameter's panel, runs it between its least and its most value, four seconds each way, starting from where it stands, so everything that reads it moves: a crank turns, a slide slides, a jaw opens and closes. An angle in degrees whose range covers a whole turn or more keeps turning the same way instead. <Ui>Stop</Ui> shows the model as it stands again.

Playing changes nothing in the document and saves nothing. It needs a min and a max, like the slider. In an assembly, a joint whose angle or distance reads the parameter, by its name or through an expression such as `crank / 2`, moves at once; a feature that reads it rebuilds as fast as the build allows. Agents run it as `view.playParameter` and `view.stopPlaying`, and visitors who open a shared design can play it too.

## Writing expressions

An expression is arithmetic over the parameters' names:

- `+`, `-`, `*`, `/`, `^` for a power, and brackets;
- `min`, `max`, `abs`, `sqrt`, `round`, `floor` and `ceil`;
- `sin`, `cos` and `tan`, with angles in degrees, and `asin`, `acos`, `atan` and `atan2`, which give degrees;
- comparisons and `if(condition, then, otherwise)`, such as `if(length > 200, 3, 2)`;
- `fraction(value, denominator)`, which writes a number as inch sizes are written, rounded to a `1/denominator`: `fraction(1.25, 64)` is `1-1/4`. It gives text, for a part number or a name, such as `"Pin {fraction(length, 64)}"`;
- `pi`, `tau` and `e`.

A field shows the expression as you wrote it. A name that is not a parameter is reported in the <Ui>Problems</Ui> tab with the field it is in.

Good names make a part easy to change later, by you or by an agent: name the sizes someone would ask for (`length`, `width`, `wall`), and write the rest from them.

## A component's own values

When a part document is placed in an assembly, each placement can have its own values for the part's parameters. The desk arm uses one link document twice, at two lengths. [Components](../assemblies/components.md) shows where to set them, and an assembly's own parameters can drive them.

## Let visitors try values

When you share a design, you can let its visitors try other values of some parameters, such as the pose of an arm or the width of a shelf. They get a slider for each, and the design rebuilds in their browser as they drag it.

1. Give the parameter a min and a max under <Ui>Limits and description</Ui>. The slider runs between them, by the step you set there.
2. Tick <Ui>Visitors can change it</Ui>.

<Shot id="designer.modelling.parameters/offer" />

Visitors see the parameters you chose in <Ui>Try other values</Ui>, at the top left of the view, whether they open the design to view or open its [preview](../get-started/share.md#share-a-preview-or-embed-it). A parameter's label names its slider, and its description is the slider's tip.

<Shot id="designer.modelling.parameters/try" />

Nothing a visitor tries is saved, and <Ui>Back to the author's values</Ui> returns to yours. You keep editing as usual: the sliders are for visitors only.

The choice is kept in the project, beside its documents, not in the design document itself, so exporting a design document leaves it out.

## Configurations

An assembly can keep configurations: named sets of its parameters' values, such as a pose of an arm. The <Ui>Configurations</Ui> group of the <Ui>Features</Ui> panel lists them; click one to build the assembly with its values, and <Ui>Document values</Ui> to go back to the parameters' own. [The robot arm](../showcases.md) keeps four poses this way.
