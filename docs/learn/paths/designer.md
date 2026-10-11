---
sidebar_position: 3
title: Computational Designers
sidebar_label: Designer
description: Getting started with visual and code-based parametric design on the Bitbybit platform.
topic: platform.paths.designer
type: landing
tags: [design, parametric, rete, blockly, visual-programming]
---

import ImageGallery from '@site/src/components/ImageGallery';

# For Computational Designers

Whether you are new to parametric design or if you are familiar with tools like Grasshopper, Dynamo, or Blender Geometry Nodes, Bitbybit gives you a browser-based environment to work in - with nothing to install.

<ImageGallery
  images={['/img/blog/coding-editors-revamp/hero.webp']}
  columns={1}
  altPrefix="A drone built in the Rete editor, its node graph organised in groups beside the finished quadcopter"
/>

The drone above is built step by step in the [Rete tutorial](/learn/getting-started/rete/tutorials/drone), and the same drone in [Blockly](/learn/getting-started/blockly/showcases) and [TypeScript](/learn/getting-started/typescript/showcases).

## If You Are Just Starting Out

1. Open the [Blockly editor](https://bitbybit.dev/app?editor=blockly). It uses drag-and-drop blocks to teach geometry logic without syntax errors.
2. Browse [public projects](https://bitbybit.dev/projects/public) to see how other users approach problems.
3. Take structured courses in the [Bitbybit School](https://bitbybit.dev/school).

## If You Are Experienced

- The [Rete editor](https://bitbybit.dev/app?editor=rete) provides a node-based workflow familiar to Grasshopper and Geometry Nodes users.
- The [TypeScript editor](https://bitbybit.dev/app?editor=typescript) gives you full programmatic control with autocomplete and type safety.

## If You Prefer to Model by Clicking

The [Designer](../designer/intro.md) is a parametric CAD modeller in the style of desktop CAD programs: sketch, extrude, fillet and assemble parts with the mouse, while every step stays editable. It is part of the Gold plan, and [Make your first part](../designer/tutorials/first-part.md) is the place to start.

{/* shot: designer.showcases/robot-arm-cover designer.showcases/desk-arm-cover */}

## Deploying Your Work

You don't need frontend engineering skills to put your designs on the web. Export your script from any visual editor, then use a [Bitbybit Runner](../runners/intro) to execute it on any webpage - your portfolio, a client presentation, or a sandbox like CodePen. You can also write custom JavaScript against our type definition files for more advanced deployments.
