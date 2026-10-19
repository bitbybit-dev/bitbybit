---
sidebar_position: 1.4
title: "Showcases"
sidebar_label: Showcases
description: Four projects modelled in the Designer - a six-axis robot arm with four poses, a turbofan engine that opens and explodes, a single-cylinder engine that turns through its four strokes, and the desk arm of the tutorial - with what each one shows, to open in the Designer or download.
topic: designer.showcases
type: landing
verified: 2026-10-19
tags: [designer]
---

# Showcases

Four projects modelled in the Designer, to open or to download:

- **Open in the Designer** opens the project on bitbybit.dev. It comes with the geometry its author's Designer kept, so even the jet engine usually opens in seconds, and what you change is kept as your own copy. Below Gold it opens to view: you can turn it, inspect it and switch its poses, and changing it is part of the Gold plan.
- **Open an example** inside the Designer does the same without leaving it: [<Ui>File</Ui> > <Ui>Open an example</Ui>](./reference/commands.md#designer-file-open-example), or the tile on an empty design, shows each showcase with its picture, and <Ui>Open</Ui> adds its documents to the design you have open, asking first when that design already holds documents.
- **Download** gives you its design documents, a small file anyone can keep. It opens in the Designer with <Ui>File</Ui> > <Ui>Import design documents</Ui> (its documents join the project you have open, so start from a new project to keep them apart), where every part is built in your browser first. The documents are plain JSON, so they also build in code with the free packages and serve an agent as an example: [Design documents](../using-ai-with-bitbybit/design-documents.md) explains the format.

## Robot arm

<Shot id="designer.showcases/robot-arm-cover" />

A six-axis industrial arm on a pedestal, with cable harnesses along its links and a three-finger gripper.

- **28 documents**: 26 parts and 2 assemblies, with 77 components that place 39 different parts.
- **Joints with limits** at every axis and finger, posed by four configurations: *Rest*, *Reach*, *Strike* and *Grasp*.
- **Parameters that drive the pose**, each with a slider, so the arm can be moved by hand as well as by configuration.

<OpenInDesigner showcase="robot-arm" />

<Download id="designer.showcases/robot-arm-project" />

## Jet engine

<Shot id="designer.showcases/jet-engine-cover" />

A turbofan: the fan, the compressor and turbine stages, the casing halves, the pipes and boxes outside them, on a stand.

- **30 documents**: 12 parts and 18 assemblies, with 4,853 parts placed from 130 different ones.
- **Patterned components**: each blade and vane row is one component repeated around the axis, 89 patterns in all.
- **Three configurations**: *Closed*, *Open*, with the casing's upper half lifted, and *Exploded*.

Imported from its file, a model this size takes a while to open, since each different part is built once in your browser and its copies are drawn from it; opened from its link, it arrives built.

<OpenInDesigner showcase="jet-engine" />

<Download id="designer.showcases/jet-engine-project" />

## Single-cylinder engine

{/* shot: designer.showcases/engine-cover */}

A small air-cooled engine: a crankcase and a finned cylinder, the piston on its connecting rod and crankshaft, the valves and their cam, a flywheel, a carburettor and an exhaust.

- **44 documents**: 43 parts and one assembly, with 88 components that place 54 different parts.
- **Machined shafts**: keyways for the flywheel and the timing gear, ring grooves for the piston pin's clips and a knurled grip, made by the Mechanical features.
- **Standard parts** from the library: socket head cap screws, ball bearings, a parallel key and retaining rings.
- **Four configurations**, one for each stroke, *Intake*, *Compression*, *Power* and *Exhaust*, and a crank parameter that turns the whole engine with its valves, clash-free through two full turns.

{/* shot: designer.showcases/engine-project */}

## Desk arm

<Shot id="designer.showcases/desk-arm-cover" />

The desk arm that [the tutorial](./tutorials/desk-arm/index.md) builds step by step: a revolved base, a shoulder, two links from one document, a wrist and a gripper whose two jaws slide in its rails.

- **10 documents**: 9 parts, three of them from the standard parts library, and one assembly, with 26 components that place 14 different parts.
- **Joints**: the turntable turns, the links and the wrist swing within limits, and the jaws slide, clash-free across every limit.
- **Fasteners from the library**: a hex bolt and a nut through each pivot, and socket head cap screws fastened into every hole set, their heads sunk in the counterbores the holes' size gives.

<OpenInDesigner showcase="desk-arm" />

<Download id="designer.showcases/desk-arm-project" />
