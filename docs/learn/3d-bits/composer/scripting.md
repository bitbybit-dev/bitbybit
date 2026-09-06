---
sidebar_position: 10
title: "Scripting"
sidebar_label: Scripting
description: Linking a parametric program into a project, for products whose shape has to be calculated.
tags: [3d-bits, composer, scripting]
---

# Scripting

:::info Standard and Pro plans
:::

Almost every configurator works by swapping between objects you prepared. When a shopper can type any width between 40 and 300 centimetres, there is nothing to swap between, and the shape has to be calculated instead.

The Scripting section is where a project connects to a program that does that calculation.

## Do you actually need this?

Often not, and it is worth checking before you commit.

If the shopper picks from a set of sizes, prepare those sizes as separate objects and use variants. If the product simply stretches, a [parameter binding](/learn/3d-bits/composer/scene) in the Scene section can drive scale from a slider with no code at all.

Scripting is for when the geometry genuinely changes rather than merely stretching. A shelf unit that gains an extra shelf every 40 cm. A frame whose joints must stay square as it grows. A part cut from a profile the shopper uploads.

## Where the script comes from

Up to four options in the **Source** setting.

**A linked script project** is the normal route. You build the script in the app's Scripts section, publish it, and link it here. It stays maintained in one place and can be shared between projects. This option only appears when Composer is open inside the app - the standalone editor has no project library to link to, so it offers the other three.

**TypeScript (edit here)** opens a code editor inside Composer, for a short piece of logic that belongs to this project alone. What runs on the storefront is the **compiled** output, not your source, and compilation happens when you press **Save** in that editor. If you close it another way, Composer warns you on the script that it has source but nothing compiled, and the script will not run until you open it and save.

**A pasted export** takes a script exported from the Rete, Blockly or TypeScript editors and drops it in directly. Either the generated code or the exported file is accepted.

**A public URL** loads a script hosted elsewhere. It must be served over `https`, and the host has to allow cross-origin reads from your storefront. An `http` or malformed address is refused at runtime, and Composer flags it before you get that far.

## Passing the shopper's choices in

Your controls arrive on an `inputs` object, keyed by the control's **label**, camel-cased. A control labelled "Table width" is `inputs.tableWidth`; "Shelf count" is `inputs.shelfCount`. It is deliberately the label rather than the key, so the code reads like the panel it came from - and it means the raw control key does not work.

Values arrive already typed, so you do not have to convert them. Number and slider controls come through as numbers, switches and plain checkboxes as booleans, and everything else as a string. A multi-select checkbox contributes one boolean per option rather than a single value, named after the control and the option together. If two controls share a label, the second gets a number appended so nothing is silently overwritten.

Two names are reserved: `inputs.scriptId` and `inputs.scriptContextKey`. The second is how a script keeps a handle on what it made last time - `bitbybitScriptContext(inputs.scriptContextKey)` returns a persistent object you can store a dispose callback on, and calling it at the start of the next run is how you clear the previous geometry. Nothing is cleaned up for you; the scene keeps whatever a run created. The scaffold Composer gives you on a new TypeScript script already has this shape.

In the code editor, typing `inputs.` lists every available control with its type, so you do not have to guess how a label was camel-cased.

## When it runs

Each script has an **Enabled** toggle, on by default. Switch it off and the script never runs, which is a cleaner way to take something out of circulation than deleting it.

You then choose the triggers. Once when the scene loads, on every input change, or only when particular controls change - and a script can have more than one.

A script also carries a **condition**, written in the same editor as everything else in Composer. It behaves as a gate on the change triggers: the named control has to change *and* the condition has to hold. With no change trigger set, the condition becomes the trigger in its own right, running the script once at the moment it becomes true.

Be deliberate here, because calculation costs time on your shopper's device. A script that rebuilds a complicated assembly on every keystroke of a number field feels sluggish. Naming the specific controls that should trigger it, and letting the debounce absorb rapid changes, keeps it responsive.

The **While computing** settings decide what the shopper sees meanwhile. **Show spinner** and **Disable inputs** are both off to begin with, and neither appears until a calculation has run longer than the **Indicator delay**, which starts at 500 ms - so a fast script never flickers the page while a slow one still gets a visible indication that something is happening. **Input debounce** starts at 0; raise it and rapid changes, such as a slider being dragged, collapse into one run of the latest values.

In the editor these triggers do not fire. A script runs when you press **Run** on it, or when you are in Play mode. On the product page it follows the triggers you set.

## Geometry engines

In Composer this section is labelled **CAD kernels**. Scripts that do solid modelling need one, and you switch on the ones your script uses.

**OCCT** is the full CAD kernel, for precise solids, filleting and accurate boolean operations. **JSCAD** and **Manifold** are lighter alternatives suited to simpler solid combination, with Manifold being a good choice for anything destined to be 3D printed.

Turn on only what you use. Each engine is a substantial WebAssembly download for your shopper before your product appears, and changing the selection reloads the preview because the kernels are booted once for the whole scene.

OCCT additionally has an **architecture** choice. **32-bit** is the default and the right answer for almost everything. **64-bit** handles larger models at the cost of a bigger download. **64-bit multi-threaded** can be faster again, but it requires the page to be cross-origin isolated, which is a property of the headers your storefront is served with rather than something the app controls. Test it on your own theme before relying on it.

## Keeping a linked script current

Publishing a script does not change projects already using it. Those keep running the version that was current when the project was last published, which is deliberate, since a change to shared geometry should not silently alter live products.

Publishing the project is the moment the link is resolved, and it always takes the script's latest published version. So the sequence is: publish the script, then republish the project.

When a linked script has moved on since your last publish, the project page raises a **Linked scripts were updated** banner naming the scripts and offering to republish. Test in the editor first, then republish.

A script that has never been published at all blocks publishing outright, with a message naming it. Open it under Scripts and publish it from its editor before trying again.

## Learning to write them

The editors and the geometry library are shared with the wider [bitbybit.dev](https://bitbybit.dev) platform, which has [far more documentation](/learn/getting-started/overview) on them than would fit here, including the full catalogue of operations.
