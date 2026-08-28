---
sidebar_position: 4.5
title: "Edit Mode and Play"
sidebar_label: Edit vs Play
description: What the editor shows you, what only Play shows you, and how to preview each kind of behaviour while you are still authoring.
tags: [3d-bits, composer, variants, troubleshooting]
---

# Edit Mode and Play

Composer has two modes and they deliberately show you different things.

**Edit mode** is a workshop. Its job is to let you reach everything, including the parts a shopper would never see at the same time. **Play** is your shopper's view: conditions apply, the option panel behaves as it will on the product page, prices update and the camera does what you told it to.

Almost every "my variant does not work" question turns out to be a mode question. This page is the table that answers it.

## Edit mode holds no selection

This one fact explains most of the table below. In edit mode the option panel is not running, so nothing is selected - there is no "Oak", no "Large", no size in millimetres. Every condition you have written is therefore being asked about values that are not there, and the honest answer is no.

The editor then makes one deliberate exception, and it is a big one: **models, the parts inside them, markers and decals are shown anyway**, because you cannot position something you cannot see. Everything else takes the answer at face value.

:::info The older variant panel behaves slightly differently
If your project predates the option panel and still drives the scene from bare variant names, the editor fills in each option's first value instead of leaving them empty. Everything else on this page is the same.
:::

## What applies where

| Behaviour | In edit mode | In Play | How to check it while authoring |
|-----------|--------------|---------|---------------------------------|
| **Showing and hiding models and parts** | Everything is shown, conditions set aside | Conditions decide what is on screen | Press Play. To get something out of your way in the meantime, use the eye button in the Models list or in the parsed structure - that hide is an editor convenience and is never published |
| **Moving, rotating and scaling** | Nothing matches, so every element sits at its base position | The first matching variant wins | Click into a transform variant's position, rotation, scaling or direction fields and the element jumps to that variant's pose; move away and it returns |
| **Material variants from the file** | Not applied | Applied | The play button beside each entry in Material Variants puts that material on the model in the editor |
| **Colours and textures set in Composer** | Not applied | Applied | Press Play |
| **Animations** | Not applied | Applied | The play button beside each clip in Animations previews it in the editor |
| **Lights switching on and off** | Every light stays on, whatever condition it carries, so you can see what you are doing | Conditions decide | Press Play |
| **Points of interest** | Every marker is drawn, conditions ignored | Conditions decide which markers exist | Press Play. **Focus point of interest camera** flies the editor camera to a marker's saved view |
| **Focals** | Never fire | Fire the moment their condition becomes true | **Preview focal** flies the editor camera to that focal's view |
| **Dimensions** | Conditions are honoured, so a dimension that has one is hidden. Dimensions with no condition are drawn | Conditions decide | Press Play. A dimension missing from the editor is usually a working condition, not a broken dimension |
| **Decals - image and text** | Every decal is projected, conditions ignored | Conditions decide which decals exist | Press Play |
| **The option panel - controls, layout, style, translations** | Not drawn over the 3D view | Drawn exactly as on the product page | The live preview in the GUI section, which renders the panel on its own while the 3D view stays paused |
| **Logic rules** | Do not reach the 3D scene | Applied to the panel and to the scene | The GUI section's preview runs the rules against the panel; Play runs them against the 3D scene as well |
| **Prices** | Not drawn over the 3D view | Shown as on the product page | The GUI section's preview |
| **Scripts** | Only when you press **Run** on that script | Follow the triggers you gave them | **Run**, in the Scripting section |
| **The opening camera view** | The editor camera is yours to move and stays where you left it | The camera starts from the view you set | **Focus run camera** flies the editor camera to the opening view |
| **Scene rotation animation** | The editor keeps the scene still while you work | Spins | Press Play |
| **Skybox, background, lights, shadows** | Applied | Applied | Nothing special needed |
| **PDF documents** | Not produced on their own | Produced when asked for | **Preview PDF**, in the PDF Reports section |

## The three that catch everyone

**Models and parts are all visible in edit mode.** This is on purpose. It also means edit mode can never tell you whether a visibility condition is right. A part that is visible in the editor and correctly hidden in Play is working exactly as intended - that is not a bug report.

**Markers and decals are drawn regardless of their conditions.** Same reason: you need to see a marker to place it and a decal to size it. So a marker showing in the editor proves nothing about its condition, and a decal in the editor does not mean the shopper will get one.

**A dimension or a transform variant that "does nothing" in the editor is usually fine.** These two do take their conditions seriously, and with no selection to match against, a conditional dimension stays hidden and an element stays at its base position. Press Play, or click into the variant's fields to see its pose without leaving edit mode.

:::tip Play is the test that counts
The option panel, the logic rules and the price you see in Play are produced by the same code the storefront runs, driven by the configuration exactly as it would be published. That is why Play is a real rehearsal rather than an approximation, and why "it works in the editor" is not evidence of anything.
:::

## Where to go next

- [Variants](./variants) - what each kind of variant does and where it is set up.
- [Composer Interface](./interface) - the rest of what the two modes change.
- [Troubleshooting](./troubleshooting) - when it is wrong in Play too.
