---
sidebar_position: 5
title: "Parts and materials"
sidebar_label: Parts and materials
description: Turn a Designer body into a part - give it a name, a material from the presets, a colour and a finish - and read the volume and mass the Designer works out from its geometry and its material's density.
topic: designer.modelling.parts
type: how-to
verified: 2026-10-09
tags: [designer]
---

# Parts and materials

The features of a part document make bodies. A body becomes a part, which is what an assembly places, what the bill of materials counts and what an export names. Until you say otherwise, each body is a part of its own.

## Part properties

<Shot id="designer.modelling.parts/part" />

Click a part in the <Ui>Parts</Ui> group of the <Ui>Features</Ui> panel, and <Ui>Properties</Ui> shows it:

- <Ui>Name</Ui>: the name the tree, the bill of materials and a STEP export use.
- <Ui>Material</Ui>: a preset such as steel or an aluminium alloy. The preset is added to the document with its density and its look.
- <Ui>Colour</Ui>: the part's own colour, or <Ui>Material colour</Ui> to take the material's.
- <Ui>Metallic</Ui> and <Ui>Roughness</Ui>: the finish, from 0 to 1. Metallic 0 is paint or plastic and 1 bare metal; roughness 0 is a mirror and 1 chalk. Leave them empty to take the material's.
- <Ui>Connectors</Ui>: where an assembly can fasten the part, explained in [Connectors](../assemblies/connectors.md).
- The body it is made from, its volume, and its mass from the volume and the material's density.

The picture shows the desk arm's link: aluminium, white, matt, 0.173 kg.

## See the materials

<Shot id="designer.modelling.parts/realistic" />

<Ui>Realistic</Ui> on the view bar draws every part as its material and finish look, with reflections and soft shadows. The plain look, with it off, is easier to model in: edges read better and nothing reflects. A STEP or GLB export carries the names and colours either way.
