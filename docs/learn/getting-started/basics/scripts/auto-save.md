---
sidebar_position: 6
title: Understanding Auto Save in Bitbybit
sidebar_label: Auto Save Feature
description: How bitbybit.dev saves a script as you work - in this browser at once and in the cloud seconds later - what the status beside the title says, and how history and cloud backups bring back an earlier version.
topic: platform.scripts.saving
type: explanation
verified: 2026-10-09
tags: [getting-started, scripts]
---

# Understanding Auto Save

Every change you make in an editor is saved, signed in or not, with no button to press.

- **In this browser, at once.** Every change is written to this browser as you make it. That is all a draft or a project in this browser needs.
- **In the cloud, a few seconds later.** A cloud script is sent to your account about three seconds after you stop, or every 15 seconds while you keep working. A large script waits for a longer pause: 30 seconds, and at most a minute. If a save fails, it is tried again on its own.
- **At once, when you ask.** <kbd>Ctrl+S</kbd> (<kbd>⌘S</kbd> on macOS) sends a cloud script to the cloud straight away.

An empty script is never saved over the cloud's: if everything is deleted, the cloud keeps the last version that held something.

## The status beside the title

<Shot id="platform.scripts.saving/status" />

A mark beside the script's title, in the bitbybit.dev header, says where your work stands. Hover over it for its words; click it to open the history. On a small screen the same words are in the menu.

| Status | What it means |
|---|---|
| <Ui>Saved</Ui> | Saved to the cloud and in this browser. |
| <Ui>Saving</Ui> | Saved in this browser and on its way to the cloud. |
| <Ui>Not synced</Ui> | Saved in this browser, not yet in the cloud. It is tried again on its own. |
| <Ui>Not saved</Ui> | The script is empty, so the cloud keeps its last saved version. |
| <Ui>Conflict</Ui> | The script changed somewhere else since you opened it: choose which version to keep. |
| <Ui>Read-only</Ui> | The script is open in another tab, and changes here are not saved. |
| <Ui>Saved in this browser</Ui> | The script is kept in this browser only. Export it or move it to the cloud to keep a copy anywhere else. |
| <Ui>Signed out</Ui> | Changes to this cloud script are no longer saved. Sign in again to keep editing it. |
| <Ui>Deleted in the cloud</Ui> | The script no longer exists in the cloud. Changes are kept in this browser's history; export the script to keep a copy. |
| <Ui>Not saved in this browser</Ui> | This browser could not store the latest change. Export the script to keep a copy. |

## History

<Shot id="platform.scripts.saving/history" />

The history keeps earlier versions of the script in this browser. A version is kept:

- when the script is opened;
- every two minutes while you work;
- before a change that empties the script or removes more than half of it;
- before an import or a paste replaces it;
- when you choose <Ui>Save this version</Ui> and name it.

<Ui>Restore</Ui> brings a version back, and the state it replaces is kept too. <Ui>Download</Ui> saves a version as a file. When the history grows large, the oldest versions go first; the ones you named and the newest one are always kept.

### Cloud backups

A cloud script also has backups in your account, which only you can read and which work from any device. They are listed in the same history: a script keeps up to 5 on the free plan, 20 on Silver and 50 on Gold. Each can be downloaded, restored or deleted.

## When the script changed somewhere else

If the same script is open in two tabs, only one of them saves: the other says <Ui>Read-only</Ui>. If it was saved from another computer, bitbybit.dev asks which version to keep: <Ui>Use the cloud version</Ui> or <Ui>Keep this browser's version</Ui>. The one you do not keep is backed up first.

## Move a script to the cloud

A script in this browser can move to your account once you are signed in: choose <Ui>Save to cloud</Ui> beside its title, or <Ui>Move to the cloud</Ui> on its row in [My Projects](https://bitbybit.dev/projects/my). Its history comes along. The files of its project stay in this browser, so a script that loads files is better moved with its whole project: [Move the project to the cloud](/learn/getting-started/basics/assets/project-files#move-the-project-to-the-cloud-files-and-all).

To keep a copy outside bitbybit.dev, [save the script to a file](/learn/getting-started/basics/scripts/save-to-file).
