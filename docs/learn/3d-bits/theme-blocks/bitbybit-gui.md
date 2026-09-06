---
sidebar_position: 3
title: "BITBYBIT GUI CONTROLS Block"
sidebar_label: GUI Controls Block
description: Host one area of your configurator's option panel exactly where you want it in your product template.
tags: [shopify, 3d-bits, theme-blocks, gui]
---

# BITBYBIT GUI CONTROLS

Normally your options panel appears next to the 3D view, and that is the right answer for most stores. This block is for when it is not.

It lets you take one area of your option panel and put it somewhere else entirely in your product template. The 3D view stays where it is, and your colour swatches sit up beside the product title, or your personalisation fields sit down next to the buy button, wherever your template has a place for them.

You add it in the theme editor like any other block: **Customize** your theme, open a product template, then **Add block** and choose **BITBYBIT GUI CONTROLS**.

:::tip You may not need a block at all
The built-in areas are placed for you. The canvas corners and the canvas centre sit on top of the 3D view, the buy area sits next to your add to cart form, and a custom area anchors to a CSS selector of your theme. Assign an element to one of those in Composer's **Layout** tab, publish, and it lands there with no block involved. Reach for this block when you want an area hosted somewhere a selector cannot reach, or you would rather point at the spot in the theme editor.
:::

## How it fits together

This block does not display 3D on its own. It contributes a spot in your template, and the configurator fills that spot with whichever elements you assigned to that area.

So a product using this needs two things. A 3D view on the page, from either the app embed or a BITBYBIT VIEWER block, and one or more of these GUI blocks in the places you want panel content to appear. They find each other automatically as long as they are on the same product page.

The assignment happens in Composer. In the **Layout** tab you give an element an **Area**, and that element then appears in the block claiming that area. Elements you do not assign go to the main panel.

Two rules are worth knowing before you plan a layout.

**Areas are assigned on top-level elements only.** The Area field appears on the outermost elements of your layout. A control tucked inside a section or an accordion travels with the section it belongs to, so if you want a group of controls elsewhere on the page, move the whole group.

**An area that cannot be placed falls back to the main panel.** If no block claims the area, or a custom area's selector matches nothing on the live page, its elements appear in the main panel instead of disappearing. That is a safety net rather than a plan, and it is worth checking a real product page after you place blocks.

If you place this block on a product with no published project, the theme editor shows you a note saying so, rather than leaving you guessing.

## GUI area

Which area of the panel this block hosts. Whatever you assigned to that area in Composer is drawn here, in the block's position, instead of where 3D Bits would otherwise have drawn it.

**Main panel (all unassigned elements)** is the default and holds everything you did not deliberately put elsewhere. Use this when you simply want the whole option panel in a particular place in your template.

**Canvas corner**, in top left, top right, bottom left or bottom right, is the area that would otherwise overlay that corner of the 3D view. Pointing a block at it takes those elements off the canvas and puts them wherever the block sits.

**Buy area** is the area that would otherwise sit next to your add to cart button. It suits things a shopper decides right before buying, such as a quantity or a gift note.

:::warning One block per area
If two blocks on the same template claim the same area, only one of them gets the content. Give each block its own area.
:::

The dropdown does not offer the canvas centre, which Composer shows as **3D canvas - center** and gives by default to the confirmation that appears after adding to cart. If that is the area you want hosted by a block, type `canvas-center` into **Custom area id** below.

## Custom area id

If you defined your own areas in Composer, enter that area's id here and it overrides the selection above. This is how you build a layout with more than the built-in areas, for instance three separate groups of options in three parts of a long product page.

You create these ids in Composer's **Layout** tab, under **Custom areas**, where each one carries an id, a CSS selector and a position. Enter the id exactly as you named it there.

A custom area does not need a block. Its selector already places it on the live page. Naming it here is how you override that selector and host the area at the block instead.

## When to use this instead of the app embed

Use the app embed unless you have a specific reason not to. It is one switch and it covers every product.

These blocks are for a product whose panel needs breaking up and distributing through the template in a way that neither the built-in areas nor a CSS selector can express. You can add GUI CONTROLS blocks alongside the app embed, or, if you also want to position the 3D view by hand, switch the project's **Placement on the product page** to **Theme template blocks** and place a BITBYBIT VIEWER block as well. See [Switching a project to blocks](/learn/3d-bits/theme-blocks/overview#switching-a-project-to-blocks) for what that changes.

Be aware that theme blocks live in your theme, not in the app. If you switch themes, the blocks do not come with you and you place them again, whereas the app embed only needs switching on once in the new theme.
