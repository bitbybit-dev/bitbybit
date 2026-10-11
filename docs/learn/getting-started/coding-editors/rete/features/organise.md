---
sidebar_position: 4
slug: /getting-started/rete/organise
title: Organising a Rete Script
sidebar_label: Organising a Script
description: How to keep a large Rete script readable - select several nodes, put them in a group, read wires between groups by their labelled ends, write Markdown comments, auto-arrange and fit the graph, find any node on the canvas, undo and redo.
topic: rete.canvas.organise
type: how-to
verified: 2026-10-10
tags: [getting-started, rete]
---

# Organising a script

A script of five nodes explains itself; one of fifty needs help. Rete gives you groups, comments and a search over the canvas.

## Select

- **Click** a node to select it. <kbd>Ctrl</kbd>+click (<kbd>⌘</kbd>+click on a Mac) adds a node to the selection.
- **Draw a box** with <kbd>Ctrl</kbd> (<kbd>⌘</kbd> on a Mac) held and the mouse dragged over empty canvas: every node it touches is selected.
- **<kbd>Esc</kbd>** clears the selection.

Drag any selected node to move them all. Drag the empty canvas to pan, and use the wheel to zoom.

## Groups

<Shot id="rete.canvas.organise/group" />

Select the nodes that belong together and press <Ui>Group selected components</Ui> in the toolbar: a frame is drawn around them. Name it in its title, and give it a <Ui>Description</Ui> below. Dragging the group moves everything in it.

A wire from a component in one group to a component in another is drawn as two short ends instead of a long line across the canvas: the end at the output names where the wire goes (the component, or the groups when it goes to several), and the end at the input names the component it comes from. Point at a label to see the whole wire, or select a node to see all of its wires; [the settings](../../../basics/editor-settings.md) can draw every wire in full.

With a group selected, the toolbar offers <Ui>Remove selected group(s)</Ui>, which leaves the nodes where they are, the <Ui>Group color</Ui> and its <Ui>Group transparency</Ui>. <Ui>Add a group</Ui> starts an empty group; select it with some nodes and <Ui>Add selected components to the group</Ui> puts them in, and <Ui>Arrange components inside the group</Ui> tidies them.

## Comments

<Shot id="rete.canvas.organise/comment" />

<Ui>Add a comment</Ui> puts a note on the canvas. Double-click it to edit its text in <Ui>Edit comment (Markdown)</Ui>: headings, bold, lists and links all render on the canvas. With a comment selected, the toolbar sets its <Ui>Comment text color</Ui>, <Ui>Comment background color</Ui> and <Ui>Comment text scale</Ui>.

## Find on canvas

<Shot id="rete.canvas.organise/find" />

Right-click the canvas and switch the search to <Ui>Find on canvas</Ui>. Type at least three letters: every node whose component, title, inputs, outputs, group or comment matches is listed, with where it matched, and the canvas moves to the first one and makes it pulse. <kbd>Enter</kbd> or the arrows step to the next match.

## Arrange and fit

- <Ui>Auto-arrange the graph</Ui> lays every node out by the wires between them. In a script with groups, each group's nodes are laid out inside it, its comments first, and the groups are placed beside one another in the order the wires run, so nothing leaves its group and no two groups overlap. A group of many nodes is folded into a block close to square rather than a long row, so the whole script stays compact.
- <Ui>Fit the whole script to screen</Ui> zooms the canvas until every node shows.

## Undo, clear and run again

- <kbd>Ctrl</kbd>+<kbd>Z</kbd> undoes the last change on the canvas, and <kbd>Ctrl</kbd>+<kbd>Y</kbd> redoes it (<kbd>⌘</kbd> on a Mac). They work when the focus is not in a field, where they undo your typing instead.
- <Ui>Clear all cache and components</Ui> empties the canvas, after asking.
- <Ui>Clears cache and recomputes</Ui> forgets every node's kept result and runs the whole script again from scratch.
