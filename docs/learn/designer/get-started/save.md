---
sidebar_position: 4
title: "How your work is saved"
sidebar_label: Saving and history
description: The Designer saves as you work - in this browser at once and in the cloud a few seconds later - with File > Save to send it now, a status beside the script's title, a history to restore from, and cloud backups.
topic: designer.get-started.save
type: how-to
verified: 2026-10-09
tags: [designer]
---

# How your work is saved

Every change is saved as you make it. It is written to this browser at once, and to the cloud about three seconds after you stop, or every 15 seconds while you keep working. A large script waits for a longer pause. <Ui>File</Ui> > <Ui>Save</Ui> (<kbd>Ctrl+S</kbd>, <kbd>⌘S</kbd> on macOS) sends it to the cloud straight away.

<Shot id="designer.get-started.save/status" />

## The status beside the title

A mark beside the script's title in the bitbybit.dev header says where your work stands; hover over it for its words, and click it to open the history.

| Status | What it means |
|---|---|
| <Ui>Saved</Ui> | Saved in this browser and in the cloud. |
| <Ui>Saving</Ui> | On its way to the cloud. |
| <Ui>Not synced</Ui> | Saved in this browser; the cloud is tried again on its own. |
| <Ui>Saved in this browser</Ui> | The script lives in this browser only. Export it or move it to the cloud to keep a copy elsewhere. |
| <Ui>Conflict</Ui> | The script changed somewhere else since you opened it. |
| <Ui>Read-only</Ui> | The script is open in another tab, which keeps the right to save. |

## History

<Shot id="designer.get-started.save/history" />

The history keeps versions of the script in this browser: one when it was opened, one every two minutes while you work, and one before a change that removes much of it or replaces it.

- <Ui>Save this version</Ui> keeps the current state under a name you give it, here and as a cloud backup.
- <Ui>Restore</Ui> brings a version back; the content it replaces is kept in the history too.
- <Ui>Download</Ui> saves a version as a file.

A cloud script also keeps cloud backups, readable only by you: one each session, and one before a save that empties or replaces much of the script. A script keeps up to 5 on the free plan, 20 on Silver and 50 on Gold; once every place is taken, a new backup replaces the oldest automatic one.

## Move to the cloud {#move-to-the-cloud}

A script in this browser can move to the cloud once you are signed in: choose the cloud icon beside its title (<Ui>Save to cloud</Ui>), pick a new or an existing cloud project, and confirm. Its history in this browser comes along.

## When the script changed somewhere else

If the same script was saved from another computer or tab, the Designer asks which version to keep: <Ui>Use the cloud version</Ui> or <Ui>Keep this browser's version</Ui>. The one you do not keep is backed up first.

## The Designer's own History tab

The <Ui>History</Ui> tab in the Designer's dock is a different list: the changes made in this session, with who made each, which [undo](../concepts.md#undo-is-per-author) follows. The versions above are of the whole script.
