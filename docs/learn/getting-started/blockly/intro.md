---
sidebar_position: 1
title: Introduction to Blockly
sidebar_label: What is Blockly?
description: Learn about Blockly, the visual programming framework used on the Bitbybit platform, its benefits, and how to interact with Blockly scripts.
tags: [getting-started, blockly, occt]
---

import Admonition from '@theme/Admonition';

# What is Blockly?

<a href="https://developers.google.com/blockly" target="_blank" rel="noopener noreferrer">Blockly</a> is a visual programming framework developed by Google. It allows programmers to create their own visual programming languages by assembling blocks, making coding more accessible and intuitive.

![Logo of Blockly](https://ik.imagekit.io/bitbybit/app/assets/start/blockly/blockly-logo.svg)
*Blockly Logo*

## Why Blockly?

Visual programming has proven incredibly useful in industries like Computer-Aided Design (CAD) and Gaming. It offers a fast and efficient way to create 3D parametric models and interactive environments.

Blockly is a familiar interface for many, especially those who have encountered beginner-friendly coding environments such as:

*   Scratch
*   Blockly Games
*   TinkerCad
*   micro:bit

One of Blockly's key strengths is how well it abstracts the concepts of traditional text-based code. Programming in Blockly helps build a strong mental model of programming logic that is highly valuable for anyone aspiring to become a programmer. Experienced programmers also find Blockly intuitive, as they can quickly grasp its underlying functionality. This is why we've chosen Blockly as a primary programming editor for the Bitbybit Developers platform.

Blockly allows for the creation of complex, real-world programs through visual scripts. You can define variables, create functions, implement loops, manage lists, and utilize many other fundamental programming constructs. Ultimately, Blockly is a visual layer on top of JavaScript, the language that powers web browsers. This means that almost anything achievable in JavaScript can also be expressed through Blockly, often with added benefits in the context of game creation and computer-aided design compared to purely text-based approaches.

## Understanding Blockly Scripts

Blockly scripts are composed by connecting visual blocks together. You generally "read" a script by following the connections from one block to another, often in a sequence from top to bottom or based on how events trigger them.

While we don't expect you to fully understand the script in the following image immediately, take a look. You can likely reason about some of its functionality:

![Example of Blockly component composition from one of the Bitbybit Developers scripts](https://ik.imagekit.io/bitbybit/app/assets/start/blockly/blockly-composition-example.webp)
*Example of a Blockly Script Excerpt*

Here's a breakdown of what's happening in this example script excerpt:

1.  **Event Trigger:** The script (or this part of it) executes only when the user clicks a mouse button (pointer button).
2.  **State Update:** It sets a global variable, likely to inform other parts of the script that a mouse press has occurred.
3.  **Raycasting:** It uses the mouse's position to cast a "picking ray" into the 3D scene to check if the mouse click hit any 3D objects.
4.  **Conditional Action:** If an object was hit:
    *   It changes the material of the hit object(s), which means the object's appearance (like color or texture) will change.
    *   It toggles a "rotation" value, suggesting the object's rotation behavior will be altered.

This is just an excerpt from a real script. You can explore the full, interactive script by following this link:
<a href="https://bitbybit.dev/app/bitbybit/XPeuGrTysubPnOzrlWln/UNIL8Ir8ZG5RNmyVuLNK?editor=blockly" target="_blank" rel="noopener noreferrer">Open Example Blockly Script</a>

### Interacting with the Example Script

1.  **Run the Script:**
    Once the script is open in the Blockly editor, find the **"Run"** button (it often looks like a play icon ▶️) in the user interface and click it. For now, you can ignore the rest of the UI elements; we'll cover them in later tutorials.
    ![Picture shows how to run Bitbybit Developers Blockly based script](https://ik.imagekit.io/bitbybit/app/assets/start/blockly/logo-script-editor-run.webp)
    *Run Script Button*

2.  **Enter the 3D View:**
    To interact with the 3D scene generated by the script, find the **"Swap Canvas"** button (often depicted with two arrows ⇄) and click it.
    ![Picture shows how to enter the 3D environment of the script result](https://ik.imagekit.io/bitbybit/app/assets/start/blockly/logo-script-editor-swap-canvas.webp)
    *Swap Canvas Button*

3.  **Interact with the 3D Scene:**
    After swapping to the 3D view, you should see our logo spinning. Click on the different parts of the 3D logo with your mouse. You'll observe that they change color and their rotation direction alters. This is the behavior implemented by the script excerpt we discussed earlier!
    ![Picture shows how to click 3D object of the logo in the scene](https://ik.imagekit.io/bitbybit/app/assets/start/blockly/logo-script-editor-3d-click.webp)
    *Clicking the 3D Object*

To make a complete, functional script like this example, more blocks are needed than what was shown in the initial excerpt image. That's why the script you opened in the editor is larger.

If you're up for a challenge, click the "Swap Canvas" button again to return to the Blockly editor. Use your mouse scroll wheel to zoom in on the script, review the blocks, and try to understand how the entire script works together to create the interactive logo.

## Summary

In this lesson, you've learned:

*   What Blockly is and why it's a valuable tool for visual programming.
*   How we use Blockly on the Bitbybit platform to create scripts.
*   How to open an existing Blockly script.
*   How to inspect its code, run the script, and enter the 3D result canvas to interact with the output.

You're now warmed up and ready to try writing your first [**Hello World**](/learn/getting-started/blockly/hello-world) script on our platform yourself!