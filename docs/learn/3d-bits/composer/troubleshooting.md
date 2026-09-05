---
sidebar_position: 12
title: "When Something Is Not Working"
sidebar_label: Troubleshooting
description: The handful of things that go wrong in Composer, and what each one actually means.
tags: [3d-bits, composer, troubleshooting, errors]
---

# When Something Is Not Working

Most problems in Composer are one of a small number of things. Work down this page before assuming something is broken.

## An edit seems to do nothing

**This is almost always a form error somewhere else in the editor.**

Composer will not assemble a configuration while any field is invalid. When that happens the live preview stops updating, the automatic background save stops, and Save, Publish, Play, Download and Copy all stop working.

None of that is silent. Every action you press yourself says why it could not run - *"Cannot save the project - the configuration has 3 problems. Fix them and try again."* is the shape of the message. Alongside that, Composer shows the problems in bars you can open and click through, and each bar takes you straight to the field.

**Needs attention** sits over the 3D view while you are editing. It counts the invalid form fields, and the arrow beside it walks you through them one at a time. This is the bar you will see most.

**Setup problems** sits on the bottom bar. These are the problems the form itself cannot see: a condition pointing at a control that no longer exists, an effect on the wrong kind of rule, two controls sharing a key, a control placed twice in the layout. Composer runs many of the publish rules here so you meet them while you are still working, rather than at the moment you press Publish. See [Publish blockers](./publish-blockers) for what each one means.

**Blocking Publish** appears when you press Publish and the configuration was rejected before the request left Composer. It behaves the same way: open it and click a row to land on the field.

**Fix in UI** exists only in the JSON view. In the default form view you will never see it, so if a page or a colleague sends you looking for it, the three bars above are the ones you want instead.

If the preview pane has been replaced by **Preview paused while the configuration cannot be built**, that pane carries its own list under **Fix these to resume the preview**.

The offending field is often in a section you are not currently looking at, which is why the cause is rarely where the symptom is.

:::info A download is refused, never stale
Downloading or copying a configuration while a form is invalid does not quietly give you an older version. It is refused, with a message naming the number of problems. The same is true of Save, Publish and Play.

While this is happening the automatic background save also stops, and a broken-sync icon appears next to **Save**. Hover it and it tells you why: *"Not autosaved - 2 form problems."* It is the one thing that does not raise a message of its own, because it happens without you asking.
:::

## A part will not hide or show

First, check in **Play** rather than in edit mode. Edit mode deliberately shows models and objects regardless of their conditions, so you can work on something that would normally be hidden - an object visible in the editor but correctly hidden in Play is working properly. To get something out of your way while authoring, use the eye buttons in the Models list and in the parsed structure; those hides are an editor convenience and are never published. [Edit Mode and Play](./preview-vs-play) is the full table of what applies where.

If it is wrong in Play too, the usual causes are these.

**The objects are not separate in the 3D file.** Use **Parse Structure** in the Models section and look at what is actually there. If the thing you want to hide is not listed as its own item, the model needs re-exporting.

**The condition points at a name nothing answers to.** This is the most common cause by a distance, and renaming a control is how you get there. Composer looks for the exact control key first. Failing that it falls back to a single unambiguous partial match, so if the name you typed matches two control keys, the condition matches neither and quietly evaluates to false. Open the condition and pick the control from the list rather than typing the name.

**The value is not the value.** Match on the option's **value**, not the label you show the shopper, and watch for a stray space at either end.

:::note Case does not matter
A common piece of advice says a rule matching `Oak` will not match an option whose value is `oak`. That is not how it works. **Equals**, **Not Equals**, **Includes** and **Not Includes** all compare without regard to case, so `Oak` and `oak` are the same value.

There is one exception. In the free-text expression editor, `==` compares exactly, so `finish == "Oak"` is not the same test as `finish == "oak"`. The `contains()` helper in that editor ignores case; `includes()` does not.
:::

**Two rules both match, so one object appears on top of another.** The **Overview** view in the [Logic](/learn/3d-bits/composer/logic) section shows every condition in one place, which makes overlaps visible.

## The model does not appear at all

Check the file loaded without an error in the Models section, and check its size. Very large files take a while and can fail on slower connections.

If it loaded but you cannot see it, it may be far outside the camera's view or extremely small or large relative to the scene. Press **Fit scene to model** in the Scene section, which reframes everything around what is actually loaded. It also replaces your camera, lights, skybox and background, so if you already have a camera, lights or a skybox configured it asks you to confirm first - and if you accept and regret it, Ctrl+Z undoes it like any other edit.

## The model looks wrong

Wrong orientation, lying on its side or upside down, usually comes from how it was exported. You can correct it with rotation on the model, and it is better to fix it in the software that made it.

Materials looking flat or grey generally means lighting rather than materials. Check your skybox first, since reflective surfaces get most of their character from it, and check that you have a light with reasonable intensity. **Fit scene to model** rebuilds the lights and skybox for you, at the cost of discarding whatever is there now.

## Everything is slow

Look at the file size first. This is the cause the overwhelming majority of the time, and [What to Expect](/learn/3d-bits/quick-start/what-to-expect) covers what a reasonable size is.

If you are using scripts, check how often they are triggered. A script recalculating on every keystroke will feel sluggish, and naming the specific controls that should trigger it fixes that.

The Models section shows a total size for everything loaded, and warns you once that total passes 40 MB.

## The 3D view gets stuck

**Reset Scene** rebuilds the preview from scratch. If the view has got into a strange state after a lot of editing, this clears it without losing your work.

Switching the rendering engine between WebGL and WebGPU also rebuilds the view. That is expected rather than a fault.

## An option is missing on the storefront but fine in Composer

Check that you published rather than only saved, since those are different actions. Saving never reaches your storefront.

If you published, check the app embed is switched on and saved in your live theme, and that the product is linked to the project.

If publishing was refused rather than completed, the message says why. [Publish blockers](./publish-blockers) lists every refusal and its fix.

If a feature works in Composer but not on the storefront right after a plan upgrade, your storefront may not have been told about the new plan yet. There is a **Sync storefront blocks** button on the Subscription page for exactly this.

## Still stuck

Send us the project file, which you get from **Files**, then **Download project file**. It contains everything we need to see what you are seeing, including your editor state.

[info@bitbybit.dev](mailto:info@bitbybit.dev), or our [Discord](https://discord.gg/GSe3VMe) if you would rather ask in the open.
