---
sidebar_position: 3
title: "Scene"
sidebar_label: Scene
description: Camera, lighting, background, canvas frame, skybox, the loading screen and parameter bindings. Everything around the product rather than the product itself.
tags: [3d-bits, composer, scene]
---

# Scene

The Scene section is everything that is not the product: how it is lit, what is behind it, how the shopper moves the camera, and what they look at while the model loads.

It makes more difference than people expect. The same model can look like a catalogue photograph or like a grey lump depending on nothing but the lighting and background.

Three of the panels here - the camera, the skybox and the loading screen - start out empty, with an **Add** button. Until you add one, the viewer uses its own defaults. Each can be removed again, and Composer asks you to confirm before it does.

## The scene is already fitted for you

You do not need to set this up from nothing. When you load a model into a project where nothing in this section has been set yet, Composer measures everything on stage and configures the scene around it:

- **The camera** - position and target on the middle of your models, zoom and tilt limits, near and far clipping, and pan and zoom sensitivities scaled to the size of the scene.
- **Two directional lights** - a strong white key light that casts the shadows, and a weaker, cooler fill light from the opposite side that does not.
- **A skybox** - a city environment used for reflections, with **Hide Skybox** on, so it lights the product without appearing behind it.
- **The background** - a soft radial gradient, light in the middle and darker at the edges, which lifts most products away from the page.

The values it picks are derived from the size and position of your models and tuned for performance, and for most products the result is good immediately.

This only happens while the scene has nothing configured yet. As soon as a camera, a skybox, a light or a non-default background exists, Composer stops touching it, because from that point on the settings are yours.

## Re-fitting later

There is a button called **Fit scene to model** at the top of the section, and it runs that same calculation again on demand.

It is worth pressing when the scene has changed size substantially: you have added several more models, or a much larger or much smaller one, or removed the model everything was framed around. Camera distance, shadow coverage and clipping are all derived from the overall size of what is loaded, so a scene that has grown a lot is usually framed for the product it no longer contains.

:::warning It overwrites your camera, lights, skybox and background
Fit scene to model replaces the camera settings, deletes and rebuilds the directional lights, and resets the skybox and the background. Anything you tuned in those four areas is replaced by computed values.

Because that is destructive, Composer asks first. If you have already added a camera or a skybox, or added any light, you get a **Refit the scene to the models?** dialog and nothing happens until you press **Refit**. If none of those exist yet there is nothing to lose, so it simply runs.

It is also an ordinary edit, so **Ctrl+Z** (**Cmd+Z** on a Mac) puts your previous settings back, and **Ctrl+Shift+Z** re-applies the fit.

Undo only reaches back as far as this editing session, so if you have spent real time on your lighting or camera limits, take a copy of the project from **Files** before you experiment. Adding one more light by hand is usually a better answer than re-fitting the lot.
:::

## Camera

The camera orbits around a point, which is the natural way to look at a product. You set where it starts and what it points at, and you can limit how close the shopper may come and how high or low they may tilt.

Clicking into the camera position or target fields brings up a handle in the 3D view, so you can drag the camera into place rather than typing numbers.

Limits are worth setting. Without them a shopper can end up underneath the product or so far away it is a speck, and neither shows off what you make.

- **Lower radius limit** and **Upper radius limit** are how close and how far the shopper may get.
- **Lower beta limit** and **Upper beta limit**, in degrees, are how high and how low they may tilt. This is the pair that stops people looking up at the underside of a table.
- There is no field for restricting the horizontal orbit. Tilt and zoom are the two the form offers, and between them they cover most products.
- **Min Z** and **Max Z** are the near and far clipping planes. If parts of the product vanish when you zoom in close, the near plane is the usual culprit.

Two fields change the character of the shot rather than its limits:

- **Field of view (deg)** is the lens. Lower values flatten the perspective the way a long lens does, which flatters furniture and jewellery; higher values exaggerate it. Left empty it stays at the engine default of about 46 degrees.
- **Inertia** is how much the camera glides after the shopper stops dragging, from 0 for immediate to 0.99 for very floaty, with 0.9 as the default. High values also swallow slow, precise drags - if rotation feels unresponsive rather than smooth, lower it.

The rest of the panel is pointer tuning: angular sensibility on each axis, panning sensibility, wheel precision, the two pinch settings and **Use Natural Pinch Zoom**, which makes a two-finger zoom track the shopper's fingers exactly.

## Lighting

Directional lights behave like the sun, casting parallel light from an angle. You add as many as you need, and set the direction, colour, intensity and whether each one casts shadows.

Two or three lights is usually right. One strong light gives shape, a weaker one from another angle stops the shadow side going black, and a third from behind can lift the product away from the background. Only one of them normally needs to cast shadows - that is what the automatic fit does, and every extra shadow-casting light costs performance for very little gain.

As with the camera, focusing a light's direction field gives you a handle in the 3D view. Dragging it is the fast way to work, because you can see what the light does as you move it.

Direction, intensity and the diffuse colour are required for every light. Turning on **Enable Shadows** opens the shadow settings for that light: map size, refresh rate, darkness, softer filtering, bias and the shadow depth range. There is also a **Transparency shadows** toggle for the case where semi-transparent materials should cast a shadow too. **Clone Light** copies a light with its settings, which is the quick way to build a matching pair.

### Lights that only appear for some choices

Each light has a **Visibility** block of its own. Leave it empty and the light is always on. Fill it in and the light is only enabled while the shopper's selections match, exactly the way a model or a part is gated.

That is more useful than it sounds. A warm lamp that only comes on when the shopper picks the version with a lamp in it, a rim light that only appears behind the dark finishes that need it - both are a light with a condition rather than a second scene.

A rule in the [Logic](/learn/3d-bits/composer/logic) section can also force a light on or off, and when it does the rule wins over the light's own condition.

### Lights that move with the configuration

Each light also has its own **Transform variants** list. For a light, the only thing a variant can change is the **Direction** - the first variant whose conditions match wins, and the base direction applies when none do. A variant with no conditions never activates.

You can choose whether the change is instant or animated, and an animated one takes a duration in milliseconds and an easing. Swinging the key light around as the product opens, rather than snapping it, is what that is for.

## Background

Four kinds. A **solid colour** on every plan, and **linear gradient**, **radial gradient** and **image** on Standard and Pro.

A plain background in a colour close to your store's is usually the right choice, since it keeps attention on the product. Gradients help when a product is the same tone as a flat background and disappears into it - which is why the automatic fit reaches for a radial gradient rather than flat white.

## Canvas frame

The **Canvas Frame** panel gives the 3D view itself a border, rounded corners and spacing. It is worth a moment, because it is what makes the configurator look built into the page rather than dropped onto it. A hairline border in your theme's border colour, with the same corner radius your product cards use, usually does more than any other single setting here.

- The border takes a colour, a width in pixels, a corner radius and a line style of solid, dashed or dotted. A border only draws once you set a width.
- The margin is set per side and is measured from the view's **own slot**, not from the page. In the **Split** layout a right margin opens a gap between the 3D view and the options column; in the **Overlay** layout, where the panel floats on top of the view, a right margin insets the view without moving the panel; in the **Inline** layout it simply opens a gap against the page.

That is a different thing from the canvas margins in the app's [display settings](/learn/3d-bits/admin/canvas-sizing), which hold the whole block off the edges of the page. Both apply, and they are doing different jobs: this panel travels with the project, that one belongs to the product.

Two things behave the way you would want without being told. The whole frame is dropped in fullscreen, where there is nothing to frame against, and options panels and dropdowns float above the view, so the corner radius never clips them.

## Skybox

The skybox is what the product reflects. Even when you cannot see it, it decides whether metal looks like metal and whether gloss looks like gloss, so it matters most for polished, chrome or glass products.

Once you add the section, **Type** is required - either pick one or remove the skybox again. There are four built-in environments and a **custom** option for supplying your own.

**Hide Skybox** keeps the reflections while showing your chosen background instead of the environment image, which is usually what you want on a product page.

**Size** is how large the skybox is drawn, **Blur** softens reflections so a busy environment looks less distracting, and **Environment intensity** controls how strongly it lights the scene.

### Bringing your own environment, and converting it

A custom skybox takes a texture URL pointing at an `.hdr` or an `.env` file. You can paste a link or upload the file from the field itself.

`.hdr` files are the format you will usually be given, and they are the heavier of the two: every shopper's device has to process one into a usable environment before the product can be reflected in it. `.env` is Babylon's prefiltered format - one file, already processed, much faster to load everywhere.

So Composer converts for you. Point the field at an `.hdr` and a **Convert to .env** button appears beneath it:

1. Press **Convert to .env**. The conversion runs in your browser and reports the size of the result.
2. Press **Download .env** to keep the file, or **Use on Shopify CDN** to upload it to your store's files and repoint the texture URL at the new copy in one step. The second button only appears when Composer is running inside the app, where it has access to your files.
3. Publish as usual. From then on your shoppers load the `.env`.

Whichever format the field holds, a small preview sphere is rendered next to it so you can see what the environment actually looks like before you commit, and it can be downloaded as an image. **Texture size** only applies to `.hdr` sources - an `.env` carries its own resolution.

## Loading screen

Your shopper sees this before they see the product, so it is worth two minutes.

Start with the **overlay colour**, because it is the whole screen: it is what covers the canvas while the model loads, and matching it to your page background is what stops the configurator flashing white on arrival. Next to it, a fade-out time in seconds controls how gently it clears.

On top of that you can put a logo with its own width and height, a progress bar with its own track and fill colours and a height, and a line of text with a title, size and colour. Putting your own logo here makes the wait feel like part of your store rather than a blank pause.

Keep in mind that the best loading screen is a short one. If yours is on screen long enough to read, the model is probably too heavy. See [What to Expect](/learn/3d-bits/quick-start/what-to-expect).

## Rendering engine

A choice between **WebGL** and **WebGPU**, at the top of the section.

WebGL is the default and runs everywhere. WebGPU is newer and faster on the browsers and devices that support it. If you are unsure, leave it on WebGL, since compatibility matters more than frame rate on a product page.

Switching between them rebuilds the 3D view, which takes a moment. That is expected and your settings are kept.

Beneath it is a right-handed coordinate system toggle. Leave it as it is unless a model comes in mirrored or rotated in a way nothing else explains.

## Parameter bindings

These connect a shopper's choice directly to a number in the scene.

Say you have a slider for width. A binding can drive the actual scale of a model from that slider, so the product physically stretches as they drag, without any script involved.

A binding is three things:

- **A target.** A whole model, a single node inside a glTF file, or a directional light.
- **A property.** Position, rotation or scaling on one axis for models and nodes; direction on one axis, or intensity, for a light. Rotations are in degrees.
- **An expression.** A small formula over your control values, written the same way price formulas are: the names in it are control **keys**, and functions such as `min`, `max`, `clamp` and `round` are available. `ctrl_width / 100` and `clamp(ctrl_x, 0, 50)` are both valid.

The result is applied continuously, on every change, as the last word on top of the base transform and any transform variant that happens to be active. If an expression produces something that is not a usable number, that binding is simply skipped for that combination rather than breaking the scene. Each binding can be named, and switched off with its **Enabled** checkbox without deleting it.

:::tip Make a slider move the model while it is being dragged
By default a range slider reports its value when the shopper lets go. Set that control's **Emit mode** to **On Change** in the [Controls](/learn/3d-bits/composer/gui/controls) tab and the binding updates live as they drag.
:::

This is the simplest way to make a product respond continuously rather than in fixed steps, and it covers a lot of ground before you need [Scripting](/learn/3d-bits/composer/scripting). For discrete states - open or closed, position one or position two - use a [transform variant](/learn/3d-bits/composer/variants) instead.

## Scene rotation

A slow automatic turn, set as degrees per second around each of the three axes independently. Good for a hero product that should look alive while a shopper reads the page, and easy to overdo. If your configurator has many options to click through, a moving product can make it harder to use.

It turns the scene **content** like a turntable around the world origin - your models together with their points of interest, dimensions, decals and directional lights, so the lighting stays put relative to the product. The camera, skybox and background do not move.

It runs in Play mode and on the live product page. The editor deliberately keeps the scene still while you are working, so nothing drifts out from under a gizmo while you are placing something.
