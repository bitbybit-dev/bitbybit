---
sidebar_position: 7
title: "When a build has problems"
sidebar_label: Problems
description: What the Designer's Problems tab tells you when a feature cannot be built, how a failure carries through the features after it, and what to do - edit, undo, suppress, copy the problem or send a crash report.
topic: designer.modelling.problems
type: how-to
verified: 2026-10-09
tags: [designer]
---

# When a build has problems

After every change the Designer builds the part again. When a feature cannot be built, such as a fillet too large for its edges or a hole on a face that is gone, the build carries on as far as it can and tells you what went wrong.

<Shot id="designer.modelling.problems/problems" />

## Where it shows

- **The <Ui>Problems</Ui> tab** in the dock counts the problems and lists each one: where it is, as a path into the document such as the field of the feature, and what went wrong in words.
- **The <Ui>Features</Ui> panel** marks the feature that failed in red, and the ones after it on the same body that could not be built for that reason.
- **The status bar** says the part was built with problems.
- **The feature's dialog** shows the message under the field it concerns.

The first problem in the list is usually the cause; the ones after it often say only that something earlier failed. Fix the first, and the rest tend to go with it.

## What to do

- **Change the value.** Open the feature with <Ui>Edit feature</Ui> and try a smaller radius, a thinner wall or another face. The view previews it before you press <Ui>OK</Ui>.
- **Undo** the change that caused it.
- **Suppress** the failing feature to see the part without it while you think, then restore it.
- **Repair a reference** the problem offers to fix: [References](./references.md) explains when it can.

## Copy a problem

<Ui>Copy this problem</Ui> beside a problem, or <Ui>Copy every problem</Ui> under the list, puts the text on the clipboard: where it is and what it says, ready to paste to a colleague, an agent or a forum.

## When the kernel crashed

Rarely, the geometry kernel itself fails on a shape rather than reporting a problem. The dock then offers <Ui>Copy crash report</Ui>, also in <Ui>Help</Ui>, which copies what the kernel was making, with the document, to send to Bitbybit, for example on the [community Discord](https://discord.gg/GSe3VMe).

<Ui>Clear the kernel caches</Ui> in <Ui>Help</Ui> empties the shapes the kernels keep from earlier builds, so the next build makes every one again. Use it when a build looks wrong although its features are right.
