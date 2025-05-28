---
slug: introducing-bitbybit-runner
title: "INTRODUCING BITBYBIT-RUNNER.JS"
authors: [ubarevicius]
tags: [bitbybit, cad]
description: "Containment has failed! Run your Bitbybit.dev scripts wherever you are on the internet with the new BITBYBIT-RUNNER.JS."
---

![Runner is on the loose. A free and powerful tiger in the jungle playing with soap bubbles, symbolizing the freedom to run scripts anywhere.](https://ik.imagekit.io/bitbybit/app/assets/blog/introducing-bitbybit-runner/introducing-bitbybit-runner.jpeg "Runner is on the loose. Run your scripts wherever you are on the internet")

In the last couple of weeks, we've been discussing and experimenting with a new way to run and embed Bitbybit.dev scripts. The result of these experiments is a new tool called **BITBYBIT-RUNNER.JS**. You can now run your scripts on your own websites, blogs, webshops, or third-party coding sites!

<!--truncate-->

### Background

In recent months, our community has expressed significant interest in running Bitbybit.dev visual programming scripts *outside* of the native bitbybit.dev editors. Many users are keen on developing 3D configurators for popular e-commerce platforms like Shopify, Woocommerce, and others.

Initially, these requests were sporadic, but over time, a clear pattern emerged. Users desired the ability to execute their scripts on their own websites, blogs, webshops, or even on third-party coding platforms. Through active discussions on our Discord channels and some dedicated brainstorming sessions, the concept of **BITBYBIT-RUNNER.JS** was conceived.

### Challenges

While we've open-sourced much of our codebase and provided NPM packages, setting them up for standalone use isn't always straightforward. Users typically need to integrate these packages into their existing development stacks, often requiring TypeScript coding for professional-grade applications. Moreover, directly executing scripts generated from our visual programming editors (Rete, Blockly) in an external environment was simply not possible before.

### The Solution - BITBYBIT-RUNNER.JS

The primary objective was to simplify this process and offer a seamless solution. The idea was straightforward: create a tool that enables users to run their Bitbybit.dev scripts anywhere on the internet.

Crucially, the tool needed to be **headless**, meaning it wouldn't be tied to any specific UI library (like React, Vue, Angular, etc.). This flexibility is essential because various website platforms (e.g., Wordpress, Shopify, Wix) operate on diverse UI systems, and we wanted the runner to be adaptable.

### Key Features

*   **Platform Agnostic:**
    BITBYBIT-RUNNER.JS is designed to function across various website platforms, ensuring compatibility regardless of the underlying UI system.
*   **Seamless Integration:**
    Users can seamlessly incorporate their visual programming scripts into their websites, blogs, or webshops without the need for complex setup procedures. The tool aims to automatically load necessary WebAssembly libraries, instantiate web workers, physics engines, and all other resources required for the scripts to run.
*   **Single File Simplicity:**
    Your website gets access to all open-source features of the Bitbybit.dev platform from a single JavaScript file, hosted on a fast and reliable CDN.
*   **Interactivity:**
    Users can execute and interact with visual programming scripts originally generated on the bitbybit.dev website. This enables dynamic functionalities such as updating 3D models based on user interactions (e.g., selecting options on a Shopify product page which then reconfigures a 3D model).
*   **Availability For Third-Party Coding Sites:**
    Many great online coding platforms exist, such as StackBlitz, CodePen, JsFiddle, and others. BITBYBIT-RUNNER.JS can be used on these sites to run your Bitbybit.dev scripts, making it easier to share examples and prototypes.

### How to Export Scripts from Bitbybit.dev

You can export scripts created on the Bitbybit.dev website and then execute them using the runner. All our editors (Rete, Blockly, and TypeScript via Monaco) now contain a new button under the "More" menu called **"Export to Runner"**.

![The "Export to Runner" button location within the Bitbybit.dev editor interface.](https://ik.imagekit.io/bitbybit/app/assets/blog/introducing-bitbybit-runner/export-to-runner.jpeg "Button to export script to the runner. It is available for all editors - Rete, Blockly and TypeScript")

When you click this button, a dialog opens up, displaying the generated JavaScript content. You can then choose to save this content as a file or copy it directly to paste into your website's code.

![The dialog showing the generated JavaScript code ready to be used with BITBYBIT-RUNNER.JS.](https://ik.imagekit.io/bitbybit/app/assets/blog/introducing-bitbybit-runner/export-to-runner-dialog.jpeg "Dialog that shows prepared code for the runner")

### Examples of Three Different Kinds of Apps

We've developed and launched three different types of examples to demonstrate a few scenarios of how the runner can be used. More detailed documentation and tutorials will be available in the future.

#### 1. Just Run the Rete Script

When you only need to run a script created in Bitbybit.dev without much external interaction, this is a good starting point. There are several ways to load the exported script file into your website, but perhaps the simplest is to just copy and paste its content and assign it to a variable or return it from a function.

We've provided this example on three popular external coding sites:
*   [StackBlitz Example](https://stackblitz.com/edit/stackblitz-starters-f6d3a2?file=script.js)
*   [JSFiddle Example](https://jsfiddle.net/matas_bitbybitdev/sa5jroqn/11/)
*   [CodePen Example](https://codepen.io/matas-bitbybit-dev/pen/XWQoxmX)

![JSFiddle code editor showing the output of an alloy wheel CAD model designed with Bitbybit.dev and run via BITBYBIT-RUNNER.JS.](https://ik.imagekit.io/bitbybit/app/assets/blog/introducing-bitbybit-runner/jsfiddle-example.jpeg "Alloy wheel CAD 3D model design on JSFiddle")

You'll probably notice that the code on all of these websites produces exactly the same 3D alloy wheel. All of these examples were generated by exporting the following Rete script from Bitbybit.dev:
*   [Original Alloy Wheel 3D Design on Bitbybit.dev](https://bitbybit.dev/projects/public/EMfBhqxbI5DibbwVactv/script/7LRqBI8nFqx32lXiK3G1/script-rete-script-alloy-wheel-cad-model-in-project-3d-alloy-wheel-cad-concept-by-author-matas)

What we did was copy the generated JavaScript code from the "Export to Runner" dialog and returned it from a function called `exportedScript` in the `script.js` file of each example. The code speaks for itself; feel free to navigate through the HTML and CSS in these examples to see how they are set up.

#### 2. Code Bitbybit.dev Logic Directly with the Runner

If you prefer not to import scripts from the Rete, Blockly, or Monaco editors, you can also code directly using the runner's capabilities. This example demonstrates how it can be done. You'll see code that creates a complete physics simulation of rolling balls through a slide using the Havok physics engine.

Once more, we offer examples on three coding sites:
*   [StackBlitz Example](https://stackblitz.com/edit/stackblitz-starters-esabaq?file=script.js)
*   [JSFiddle Example](https://jsfiddle.net/matas_bitbybitdev/eauvkdhc/1/)
*   [CodePen Example](https://codepen.io/matas-bitbybit-dev/pen/abxPXOZ)

**Don't forget to click the "Run Simulation!" button in these examples.**

![CodePen editor showing a 3D slide with a Havok physics simulation of rolling balls, coded using BITBYBIT-RUNNER.JS.](https://ik.imagekit.io/bitbybit/app/assets/blog/introducing-bitbybit-runner/codepen-example.jpeg "3D slide with Havok physics simulation on CodePen")

This code was originally created in our Monaco (TypeScript) editor on Bitbybit.dev. Then, we converted it to JavaScript through the "Export to Runner" dialog and copied it into these external editors.
*   [Original 3D Slide Demo on Bitbybit.dev](https://bitbybit.dev/projects/public/UwnghvO89ocgFv5U3P4m/script/sWwcLOMIjUpdigPv315i/script-3d-slide-with-physics-in-project-3d-slide-from-wire-offsets-by-author-matas)

#### 3. Interact with a Rete Script Through Custom UI Buttons

In many real-world cases, users will build some form of 2D user interface (UI) around the 3D canvas scene. 3D CAD configurators, for example, typically involve selecting criteria that define models and then constructing geometry based on various constraints related to those inputs. Configurators can range from simple to complex.

While this example is basic, it includes all the essential elements of a 3D configurator:
*   Custom CSS for styling the website and buttons.
*   Inclusion of a custom logo.
*   Setup of the runner.
*   Demonstration of how you can provide inputs to your exported Rete script and read outputs from it.

Check out the examples:
*   [StackBlitz Example](https://stackblitz.com/edit/stackblitz-starters-ohhh1g?file=script.js)
*   [JSFiddle Example](https://jsfiddle.net/matas_bitbybitdev/z1pku4gj/3/)
*   [CodePen Example](https://codepen.io/matas-bitbybit-dev/pen/KKYbJdj)

![StackBlitz code editor showing a simple 3D model configurator that interacts with an exported Rete script via BITBYBIT-RUNNER.JS.](https://ik.imagekit.io/bitbybit/app/assets/blog/introducing-bitbybit-runner/stackblitz-example.jpeg "Simple 3D model configurator on StackBlitz that interacts with Rete script")

In these examples, the `+` and `-` buttons adjust the values of the script inputs. The Rete script reads these values and updates the 3D model accordingly. We also read two meshes as outputs from this script so that we can dispose of them when the next result is generated (preventing visual artifacts).

The Rete script used in this configurator example is available here:
*   [Original Rete Script with Inputs/Outputs on Bitbybit.dev](https://bitbybit.dev/projects/public/doiV1zjIIyBcQx7EeGY5/script/79CweyK6FQ4U0ToBQDsL/script-runner-example-with-inputs-and-outputs-in-project-cylindric-industrial-3d-part-by-author-bitbybit) - Check out how it was prepared to read inputs and pass resulting outputs.

### How to Prepare Scripts for Reading Inputs and Writing Outputs

In the Blockly, Rete, and Monaco editors on Bitbybit.dev, there are new functions/components for communicating with the runner (i.e., for defining inputs your script can receive from the external environment and outputs it can send back).

Here, we'll briefly explain how to do it in the **Rete editor**.
In the example below, you can see Rete components specifically designed to read inputs from the runner and write outputs back to it.

**Reading Inputs in Rete for the Runner:**
![Rete editor components that read inputs for the runner. These might appear to return 'undefined' in the editor but get populated by the runner.](https://ik.imagekit.io/bitbybit/app/assets/blog/introducing-bitbybit-runner/rete-editor-runner-inputs2.jpeg "Rete editor components that read the inputs of the runner when executed in the runner")
The components that receive input values from the runner might appear to return `undefined` values while you are using them *within the Bitbybit.dev Rete editor*. However, when the script is executed by `BITBYBIT-RUNNER.JS`, the runner will correctly fill these input values. The runner will ignore any values produced by, for example, number sliders connected to these input components *within the Rete editor's context*. This means that users preparing scripts for the runner should do so proactively, understanding how the runner will supply these inputs. The runner only knows how to execute the exported JavaScript; there's no Rete runtime or UI available to the runner itself, so you can't overwrite the behavior of Rete components *within* the runner. Treat the exported script as a static code snippet.

Due to this streamlined architecture, there's a good chance that the runner will execute your script slightly faster and more efficiently than the Bitbybit.dev editor. It won't be burdened with various UI logic surrounding the scripts.

That said, you can assign any kind of value to any component input through these runner inputs. If you'd like to change the background color, send a hex color string. If you want a 3D text component to display a different word, send the string value as an input. You could even execute two scripts and send the output of one script as an input to the next, creating a chain of scripts with parametric relationships. The possibilities are vast!

**Writing Outputs in Rete for the Runner:**
![Rete editor components that write outputs from the script, which can then be retrieved by the runner.](https://ik.imagekit.io/bitbybit/app/assets/blog/introducing-bitbybit-runner/rete-editor-runner-outputs2.jpeg "Rete editor components that write outputs to be read by the runner")
Outputs play a crucial role in the runner's functionality. With Bitbybit.dev editor scripts, you can generate a variety of outputs, such as numbers, text strings, BabylonJS meshes, or even OCCT hashed objects (pointers to CAD geometry). Depending on your specific needs, you might opt to output an OCCT pointer to a shape, which can then be rendered by your custom code in the runner's environment.

Given that `BITBYBIT-RUNNER.JS` executes scripts directly in the browser, there isn't a significant performance difference between drawing objects *within* the exported script versus drawing them *in your runner's host code* (the JavaScript on your website that calls the runner). However, your choice between these two methods may be influenced by specific application requirements.

Consider scenarios where you need to:
*   Dispose of previously drawn meshes to avoid clutter.
*   Reset internal caches (e.g., OCCT or JSCAD caches).
*   Collect multiple meshes from a script run and display various variants to the user.
*   Simply display the latest output of your script.

Each of these scenarios necessitates different setups for both the runner and the visual script you design in Bitbybit.dev.

Soon, we'll provide more examples of how to set up your code on Bitbybit.dev to read inputs and write outputs in our other editors (Blockly and TypeScript/Monaco). Stay tuned for updates!

### How to Load the Library

While the process is designed to be straightforward, there are still a few steps required to enable your website to run Bitbybit.dev 3D algorithms.

First, you must include the `BITBYBIT-RUNNER.JS` script on your website. This single script will automatically load all the necessary resources, including WebAssembly modules, and instantiate web workers and physics engines. Once that's done, you can run your exported scripts and interact with them.

The JavaScript file is hosted on the JSDelivr CDN and can be included on your website by adding this script tag to your HTML (usually in the `<head>` or before the closing `</body>` tag):
```html
<script src="https://cdn.jsdelivr.net/gh/bitbybit-dev/bitbybit-assets@0.20.3/runner/bitbybit-runner-babylonjs.js"></script>