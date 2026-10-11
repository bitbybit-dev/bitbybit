---
sidebar_position: 6
title: "History: undo, edit, suppress, reorder and roll back"
sidebar_label: History and changes
description: Change a Designer part after the fact - undo and redo your own changes, edit, suppress or delete a feature, drag it to another place in the list, and roll the part back to build it only up to a feature.
topic: designer.modelling.history
type: how-to
verified: 2026-10-09
tags: [designer]
---

# History: undo, edit, suppress, reorder and roll back

A part keeps the list of features that make it, never the shape itself, so nothing you did is fixed: any feature can be changed, left out or moved, and the part is built again from the list.

## Change a feature

<Shot id="designer.modelling.history/menu" />

Right-click a feature in the <Ui>Features</Ui> panel, or select it and use the buttons in <Ui>Properties</Ui>:

- <Ui>Edit feature</Ui> opens its dialog as you left it. <Ui>OK</Ui> rebuilds it and everything after it.
- <Ui>Suppress or restore</Ui> leaves the feature out of the build, or brings it back, without deleting it. The features that use it are built without it, and say so if they cannot be.
- <Ui>Delete</Ui> removes it. A feature that something later uses cannot just be deleted: <Ui>Properties</Ui> names what uses it, and <Ui>Delete with what uses it</Ui> takes them all in one step.

The picture shows the desk arm link's `lighten` pocket, which the two fillets after it use.

## Reorder

Drag a feature up or down the list. Features are built in order, so a move that would put a feature before something it uses, or after something that uses it, is refused, naming both.

## Roll back

<Shot id="designer.modelling.history/rolled-back" />

<Ui>Roll back to here</Ui> builds the part only up to the feature you chose. A <Ui>Rolled back here</Ui> row marks the place, and the features after it are greyed and left out. New features go in at that point, so you can add something early in the part's life without moving every later feature by hand.

<Ui>Roll to the end</Ui>, or a double-click on the marker, builds the whole list again.

## Undo and redo

<Ui>Undo</Ui> (<kbd>Ctrl+Z</kbd>, <kbd>⌘Z</kbd> on macOS) takes back your own last change to the document, and <Ui>Redo</Ui> (<kbd>Ctrl+Shift+Z</kbd>) does it again. Undo is per author: when an agent works in the same document, your undo takes back your change, not the agent's. If someone else has changed the same place since, the undo refuses and names that change. The agent's changes are kept or undone in [the Review tab](../working-with-agents.md#review).

## The History tab

<Shot id="designer.modelling.history/history" />

The dock's <Ui>History</Ui> tab lists the changes of this session in order, each with who made it. <Ui>Save the steps</Ui> saves them as a step file that makes the documents again.

This history is the session's. The versions of a whole project, which you can restore, are kept by the save: [Saving your work](../get-started/save.md) explains them.
