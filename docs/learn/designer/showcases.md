---
sidebar_position: 1.4
title: "Showcases"
sidebar_label: Showcases
description: Three projects modelled in the Designer - a six-axis robot arm with four poses, a turbofan engine that opens and explodes, and the desk arm of the tutorial - with what each one shows, to open in the Designer or download.
topic: designer.showcases
type: landing
verified: 2026-10-09
tags: [designer]
---

# Showcases

Three projects modelled in the Designer, each in two forms:

- **Open in the Designer** opens the project on bitbybit.dev. It comes with the geometry its author's Designer kept, so even the jet engine usually opens in seconds, and what you change is kept as your own copy. Below Gold it opens to view: you can turn it, inspect it and switch its poses, and changing it is part of the Gold plan.
- **Download** gives you its design documents, a small file anyone can keep. It opens in the Designer with <Ui>File</Ui> > <Ui>Import design documents</Ui> (its documents join the project you have open, so start from a new project to keep them apart), where every part is built in your browser first. The documents are plain JSON, so they also build in code with the open-source packages and serve an agent as an example: [Design documents](../using-ai-with-bitbybit/design-documents.md) explains the format.

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

## Desk arm

<Shot id="designer.showcases/desk-arm-cover" />

The desk arm that [the tutorial](./tutorials/desk-arm/index.md) builds step by step: a revolved base, a shoulder, two links from one document, a wrist and a gripper whose two jaws slide in its rails.

- **9 documents**: 8 parts and one assembly, with 26 components that place 14 different parts.
- **Joints**: the turntable turns, the links and the wrist swing within limits, and the jaws slide.
- **Fasteners on every hole**, placed by replicating one screw over a hole pattern.

<OpenInDesigner showcase="desk-arm" />

<Download id="designer.showcases/desk-arm-project" />
