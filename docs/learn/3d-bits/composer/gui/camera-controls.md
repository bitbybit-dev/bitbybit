---
sidebar_position: 10
title: "Camera controls"
sidebar_label: Camera controls
description: Zoom buttons, orbit and tilt sliders and an axis gizmo shoppers use instead of dragging, and how to switch the default pointer navigation off.
tags: [3d-bits, composer, gui, layout, camera]
---

# Camera controls

The **Camera controls** element in the [Layout](/learn/3d-bits/composer/gui/layout) tab gives shoppers a deliberate way to move the camera: two zoom buttons, a slider that turns the view left and right, a slider that tilts it up and down, and an axis gizmo whose X, Y and Z handles look at the model from that side. It needs the Standard or Pro plan.

It exists because dragging a 3D view is not always what you want on a product page. A drag on a phone that was meant to scroll the page spins the product instead; a wheel that was meant to scroll the page zooms the model; and a shopper who has never seen a 3D viewer may not know the product turns at all. The controls make the movement visible, and they pair with the pointer switches described below so you can decide exactly which gestures still move the camera.

## The parts

Every part can be switched off on the element, so a merchant who only wants zoom buttons keeps those and nothing else.

- **Zoom buttons** move the camera closer to or further from the point it looks at. **Zoom step** is how much one click changes that distance, as a percentage of the current distance, so the buttons feel the same close up and far away. The camera's radius limits still apply.
- **Left-right slider** turns the view around the model, a full circle from 0 to 360 degrees. If you set both alpha limits under Scene > Camera the slider spans those instead.
- **Up-down slider** tilts the view from directly above to directly below, within the beta limits set under Scene > Camera - by default the whole way from 0 to 180 degrees.
- **Axis gizmo** is the small disc with the X, Y and Z handles. It turns with the camera, so the shopper always sees which way the model is facing. Clicking a handle flies the camera to look at the model from that side: the Y handle from the top, the X handle from the right, and so on. Clicking the handle the camera already faces flips to the opposite side, so the top handle is also the way to see the underside. The handles are buttons, so they work with a keyboard too.

The sliders follow the camera: when a focal fires or the shopper clicks a point of interest, the sliders move with it, and while the shopper is dragging a slider the camera follows the slider. The sliders move the camera immediately. The buttons and the gizmo fly to their view with a short move of 350 milliseconds; **Custom flight for the buttons and the gizmo** on the element lets you set your own duration and easing curve for those two, separately from the navigation-wide [camera motion](/learn/3d-bits/composer/navigation).

The element renders like any other in the panel and takes the theme's button and slider styling. It is at home in one of the canvas corner areas, where it sits over the 3D view, and it wraps to the width it is given, so a narrow area stacks the parts and a wide one lays them out in a row. The colours of the three axis handles can be changed with the `--bb-gizmo-x`, `--bb-gizmo-y` and `--bb-gizmo-z` custom properties in the theme's custom CSS, and `--bb-gizmo-size` sets the disc's size.

In the Layout tab preview the element shows its parts but takes no input, because there is no scene there to move. It comes alive in Play, and on your product page.

## Switching the default navigation off

Under **Scene > Camera**, the **Shopper pointer input** switches decide which gestures still move the camera on your product page:

- **Rotate by dragging** - a mouse drag, a one-finger drag and the arrow keys orbit the camera. Off, a one-finger swipe over the model scrolls the page on a phone, the way it does over a picture.
- **Zoom with the wheel and pinch** - the mouse wheel and a two-finger pinch change the distance. Off, the wheel scrolls the page over the model again.
- **Pan** - a right-drag, a Ctrl-drag and a two-finger drag move the point the camera looks at sideways.

They are all on until you change them, so nothing changes for a configurator that never touches them. Switch them off when the camera controls, [focals and points of interest](/learn/3d-bits/composer/navigation) are meant to be the only way the view moves. The switches are on every plan; the Camera controls element itself needs Standard or Pro.

They apply on the product page and in Play. The camera you edit with in the Composer always stays free, whatever the switches say, so authoring is never locked out.

If every gesture is off and the project has no Camera controls element, no focals and no points of interest, the Composer's issues panel says so and publishing warns about it, because shoppers would see the model from one fixed view and could do nothing about it.

:::note
Switching every gesture off does not prevent a theme's own page scripts from reacting to the wheel over the model; it only stops the 3D view from consuming it. And on a scene set to the WebGPU engine, check the page-scroll behaviour over the model on a real device before you rely on it.
:::
