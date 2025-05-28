---
sidebar_position: 6
title: Understanding Auto Save in Bitbybit
sidebar_label: Auto Save Feature
description: Learn how the auto save feature works for your cloud scripts in Bitbybit and important considerations regarding version history.
tags: [getting-started, scripts]
---

# Understanding Auto Save

## How Auto Save Works

The auto save feature in Bitbybit is designed to help protect your work by periodically saving your progress to our cloud database.

**Key Conditions for Auto Save:**
*   **You must be signed up and logged into the Bitbybit platform.**
*   You must be working on a **Script that is part of a Project** you have created.

Only when these conditions are met does our system have a specific entity in our database to associate your work with and update automatically. If you are working on a [local, unsaved script](/learn/getting-started/basics/scripts/auto-save), you **must manually save your work to a file** if you wish to preserve it.

## IMPORTANT: Auto Save Does NOT Record Version History

It is crucial to understand how our current auto save mechanism functions:

*   **Overwrites Previous Version:** Auto save periodically checks the current state of your script. If it detects changes compared to the last saved version in the cloud, it will **overwrite the previous version with the current one.**
*   **No Undoing Deletions via Auto Save:** This means if you, for example, accidentally delete all the code or blocks from your canvas, and the auto save triggers, this new empty state will become the saved version, and the previous state with your code will be lost from the auto-save history.

While this immediate overwriting is an intentional part of the current auto save feature (designed for simplicity and to ensure the latest changes are captured), we understand that no one wants to lose important work.

**Recommendations to Safeguard Your Work:**

1.  **Manual File Saves:** We strongly advise you to also **save your important scripts to a local file periodically**, especially before making significant changes. This creates a separate backup that auto save won't affect.
2.  **Branch Your Scripts:** If you're about to experiment with major changes or want to try a different approach, consider creating a **new script** (e.g., by duplicating your current one or creating a new one and copying content). This way, your previous version remains untouched and safe in its original script.

We are always considering ways to improve our platform, and features like version history are among those we evaluate for future development. For now, please be mindful of the current auto save behavior.