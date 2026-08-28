---
sidebar_position: 4
title: "Variants: Making the Model React"
sidebar_label: Variants
description: The seven ways a 3D scene can change in response to what your shopper picks, and which panel each one lives in.
tags: [3d-bits, composer, variants]
---

# Variants

A variant is a rule saying "when the shopper picks this, the scene does that". Everything that makes a configurator a configurator rather than a 3D photograph comes down to these.

There are seven kinds, and they solve different problems. Most configurators use two or three.

This page is the map. It explains what each kind is for and what it can and cannot do, then sends you to the panel where you actually set it up, because that is where the field-by-field detail lives.

| Kind | Where you set it up |
|------|---------------------|
| Showing and hiding models and parts | [Model Properties](/learn/3d-bits/composer/models/model-properties) |
| Material variants baked into the file | [Model Properties](/learn/3d-bits/composer/models/model-properties) |
| Colours and textures defined here | [Model Properties](/learn/3d-bits/composer/models/model-properties) |
| Moving, rotating and scaling | On the element itself - a model, a part, a light, a marker, a dimension or a decal |
| Animations baked into the file | [Model Properties](/learn/3d-bits/composer/models/model-properties) |
| Lights coming on and going off | [Scene](./scene) |
| Markers, dimensions and decals appearing | [Navigation](./navigation), [Dimensions](./dimensions), [Personalisation](./personalization) |

## Showing and hiding parts

The workhorse. A part of your model is visible only when a particular option is chosen.

Your table has an oak top and a walnut top, both present in the file. The oak one appears when the material choice is Oak and the walnut one when it is Walnut. The shopper sees one table that changes wood, when really it is two tops taking turns.

This is how most configurators are built, and it works because it is honest about what it does: you prepared both, so both look exactly right.

You set these conditions on models, and on individual parts inside a glTF file after using **Parse Structure** in the Models section.

:::warning Put the rule on one level, not two
If you put a condition on a whole model **and** conditions on parts inside it that could never be true at the same time, the model's own condition is set aside so the part rules can still do their job. It is a rescue, not a feature - the safe habit is to gate the whole model, or gate the parts, but not both.
:::

If you want an option value that hides things rather than showing something - a "None" or "No handle" choice - you do not need a placeholder model for it. The **Void Entity** panel at the bottom of the Models section holds variant rules with no model attached, purely so that option value exists for everything else to react to.

## Material variants from your 3D file

If your model was exported from Blender with material variants, those come across automatically. Composer detects them and you connect each one to an option.

This is the neatest route for colour and finish changes, because the alternatives are already defined in the file by whoever made it. One chair, five fabrics, no duplicated geometry.

Each variant in the list has a play button that puts that material on the model right there in the editor, so you can see what you are connecting before you write the condition.

## Colours and textures set here instead

When the file does not carry material variants, you can define the alternatives in Composer directly.

Two things to be clear about, because this is where the most time gets lost. You do not point at a **part**. You point at a **material** and give it a different base colour, or at a **texture** and give it a different image. A material is shared by every mesh that was painted with it, and copies of the same model file share their materials and textures too - so a swap lands on all of them together. The materials and textures lists show you which meshes use each entry, which is the fastest way to find out how wide the blast radius is before you commit.

If your file paints the seat and the armrests with one material and you only want the seat to change, no colour rule can separate them. That is a job for the software that made the model.

Entries are checked in order and the first one whose condition matches wins. When none match, the material or texture goes back to what the file shipped with, so you do not need a rule for the default.

Colours are ideal for products that come in many shades, since defining twenty colours here is far lighter than shipping twenty copies of the model. Texture swaps suit patterned finishes where you have the images, and the replacement should match the original's UV layout or it will land in the wrong place.

## Moving, rotating and scaling

A transform variant changes where an element sits, how it is turned, or how big it is, when a condition matches.

This is what you use for an adjustable shelf that moves up a notch, a lid that opens, or a component that shifts when a longer frame is chosen. If several rules could apply at once, the first one in the list wins, so you can order them from most specific to most general. When none match, the element returns to its ordinary position.

Six kinds of element take transform variants, and they do not all honour the same fields:

| Element | What a variant can change |
|---------|---------------------------|
| A model | Position, rotation and scaling |
| A part inside a glTF file | Position, rotation and scaling, applied locally to that part |
| A directional light | Direction only |
| A point of interest | The position of the 3D marker only |
| A decal | Position, projection direction, size and spin |
| A dimension | A position offset that shifts the whole measurement rigidly. Bounding-box dimensions have none, because they follow the model already |

Models, parts and lights can move **smoothly** rather than jumping, which looks considerably better when a shopper is clicking between options. Markers, decals and dimensions always apply instantly. Leaving a variant is animated with the transition of the variant you are leaving, so a move that eases out also eases back.

:::warning A variant with no conditions never activates
An empty condition is not "always" - it is "never". If a transform variant appears to do nothing at all, check that it actually has a condition on it.
:::

:::note Do not mix a rotation variant with scene rotation on the same model
Rotating a model with a transform variant while the same model is also under the continuous **animated rotations** setting is not supported, and the result is not something you can predict. Pick one.
:::

## Animations baked into the file

If your glTF contains animation clips, you decide when they play. A drawer that slides open when the shopper selects the drawer option, or a fan that spins while a particular mode is chosen.

You can preview a clip in the editor with a play button rather than guessing which one is which. The rules themselves - whether a clip runs while a condition holds or fires once when something changes, how it loops, how fast it runs and what happens when it stops - are set in [Model Properties](/learn/3d-bits/composer/models/model-properties).

## Lights that come and go

A directional light can carry a condition of its own, so it is only on while that condition holds. A light with no condition is always on.

This is how you light a configuration differently rather than uniformly - a spotlight that only exists once the display case option is chosen, or a second fill light for the darker finishes. Lights also take transform variants, which swing the light direction rather than moving anything solid.

Both are set up in the [Scene](./scene) section, on the light itself.

## Markers, dimensions and decals

Three more things carry conditions, and they are easy to forget because they are configured elsewhere:

- **Points of interest** - a marker appears only for the configurations where the feature it points at exists. Set in [Navigation](./navigation).
- **Dimensions** - a measurement is drawn only while its condition matches, so a dimension can come and go with the part it belongs to. Set in [Dimensions](./dimensions).
- **Decals** - an image or a piece of text is projected onto the product only when the shopper has asked for it. Set in [Personalisation](./personalization).

**Focals** - the camera moves - are also condition-driven, but they behave differently enough to be worth reading about separately in [Navigation](./navigation): they fire at the moment their condition becomes true rather than staying applied while it holds.

## Writing the conditions

Every kind of variant uses the same condition editor, so you learn it once.

The simple form is a pairing: this option equals this value. That covers the large majority of cases.

The advanced form lets you combine conditions, so a part can appear only when the material is oak **and** the size is large, or when either of two options is chosen. You build these as nested groups rather than by writing anything.

Both of those compare text without regard to capitals, so `Oak` and `oak` are the same thing.

There is also a free text expression form for the rare case that neither shape fits. That one compares exactly, capitals included, so reach for it last.

The field you fill in is labelled **Variant name**, and what it wants is the **key** of the control you are reacting to. Renaming a key from the Controls tab rewrites every condition, expression and translation that pointed at it, so a rename does not quietly leave a rule pointing at nothing. See [Controls](/learn/3d-bits/composer/gui/controls) for what a key is and where else it travels.

## Getting the parts right in the first place

None of this works if the parts are not separate in your 3D file. If the tabletop and the legs are one merged object, no rule can show one without the other.

Use **Parse Structure** in the Models section early, before you build anything. It lists what is actually inside the file, and it will tell you in ten seconds whether your model is ready. If it is not, the fix is in the software that made it, not here.

## Checking your work

Press **Play** and click through every option. Edit mode and Play do not show you the same thing, and knowing which is which saves a lot of confusion - models and parts, for instance, are all shown in edit mode regardless of their conditions, while dimensions already obey theirs.

[Edit Mode and Play](./preview-vs-play) has the full table: what applies where, and how to preview each kind while you are still authoring.

Once you are in Play, watch particularly for two things: a part that stays visible when it should be gone, which usually means a missing condition, and two parts appearing in the same spot, which usually means two rules both match.

If something still will not behave, [Troubleshooting](./troubleshooting) works through the usual causes.
