---
sidebar_position: 1
title: Lists in Bitbybit
sidebar_label: Lists in Bitbybit
description: An overview of the Lists class in Bitbybit, explaining how to create, access, modify, and organize lists (arrays) of data.
tags: [code, lists]
---

<img 
  class="category-icon-small" 
  src="https://s.bitbybit.dev/assets/icons/white/lists-icon.svg" 
  alt="Lists category icon" 
  title="Lists category icon" /> 

[View Full Source & Details on GitHub](https://github.com/bitbybit-dev/bitbybit/blob/master/packages/dev/base/lib/api/services/lists.ts)

The `Lists` class in Bitbybit provides a comprehensive suite of tools for working with lists (which are standard JavaScript arrays). Whether you need to create, access, modify, or organize data, this class has you covered.

**What is a List in Bitbybit?**

A "list" in Bitbybit is simply a standard JavaScript array. This means it can hold any type of data: numbers, text (strings), points, vectors, other lists (for multi-dimensional arrays), or even complex objects.

Example: `[1, 2, 3]`, `["apple", "banana", "cherry"]`, `[[0,0,0], [1,1,1]]`

## Core Capabilities of the Lists Class

The `Lists` class is designed to make common array manipulations straightforward. Here's a high-level look at its features. For the exact input parameters, options, and specific behaviors, please refer to the [full Lists API documentation](https://docs.bitbybit.dev/classes/Bit.Lists.html) or the GitHub source linked above.

### 1. Creating and Populating Lists

Getting started with new lists:
*   **Empty List:** Create a brand new, empty list (`createEmptyList()`).
*   **Repeating Items:**
    *   Create a list by repeating a single item a certain number of times (`repeat()`).
    *   Create a list by repeating the items from an existing list in a pattern until a desired length is reached (`repeatInPattern()`).

### 2. Accessing Items (Getting Data Out)

Retrieving elements from your lists:
*   **Specific Item:** Get an item by its position (index) in the list (`getItem()`). Remember, indexing is usually 0-based (the first item is at index 0).
*   **Sub-sections:** Extract a portion of a list, creating a new sub-list based on start and end indexes (`getSubList()`).
*   **Pattern-Based Retrieval:**
    *   Get every Nth item from a list, optionally with an offset (`getNthItem()`).
    *   Select items based on a repeating boolean pattern (e.g., get items where the pattern is `true`) (`getByPattern()`).
*   **Random Selection:** Get a random subset of items from a list based on a probability threshold (`randomGetThreshold()`).
*   **List Information:**
    *   Find out how many items are in a list (`listLength()`).
    *   Determine the maximum "depth" or number of nested levels in a list of lists (`getListDepth()`).
    *   For a list containing other lists, find the length of the longest inner list (`getLongestListLength()`).

### 3. Modifying Lists (Adding & Removing Items)

Changing the content of your lists:
*   **Adding Items:**
    *   Add a single item to the end (`addItem()`) or beginning (`prependItem()`) of a list.
    *   Insert an item at a specific index (`addItemAtIndex()`).
    *   Insert the same item at multiple specified indexes (`addItemAtIndexes()`).
    *   Insert different items at different specified indexes (one-to-one mapping) (`addItemsAtIndexes()`).
    *   Conveniently add an item to either the first or last position (`addItemFirstLast()`).
*   **Removing Items:**
    *   Remove an item from a specific index (`removeItemAtIndex()`).
    *   Remove items from multiple specified indexes (`removeItemsAtIndexes()`).
    *   Clear all items from a list, making it empty (`removeAllItems()`).
    *   Remove every Nth item from a list (`removeNthItem()`).
    *   Randomly remove items based on a probability threshold (`randomRemoveThreshold()`).
*   **Removing Duplicates:**
    *   For lists of numbers, remove duplicate values (`removeDuplicateNumbers()`).
    *   Remove duplicate numbers, but use a tolerance to consider "close" numbers as duplicates (`removeDuplicateNumbersTolerance()`).

### 4. Restructuring and Transforming Lists

Changing the shape or order of your lists:
*   **Reversing:** Flip the order of items in a list (`reverse()`).
*   **Grouping:** Take a flat list and group its items into sub-lists, each containing a specified number of elements (`groupNth()`).
*   **Flipping (Matrix Transposition):** For a list of lists (like a 2D grid or matrix), transpose it so rows become columns and columns become rows (`flipLists()`). All inner lists must have the same length for this to work.
*   **Merging Elements from Nested Lists:** A more advanced operation (`mergeElementsOfLists()`) that can take lists of lists, flatten them to a certain level, and then merge corresponding elements from the inner lists.

### 5. Sorting Lists

Organizing your list items:
*   **Numbers:** Sort a list of numbers in ascending (smallest to largest) or descending order (`sortNumber()`).
*   **Text:** Sort a list of text strings alphabetically, in ascending or descending order (`sortTexts()`).
*   **Objects by Property:** If you have a list of objects, you can sort them based on the numerical value of one of their properties (`sortByPropValue()`).

## Important Note: Cloning

Many methods in the `Lists` class offer a `clone` option in their input parameters (e.g., `inputs.clone`).
*   If `clone` is `true` (or if the method inherently creates a new list), the original list you provided remains unchanged, and a new, modified list is returned.
*   If `clone` is `false` (and the operation can be done in-place), the original list itself might be modified.

It's good practice to be aware of this, especially if you need to preserve the original list. When in doubt, cloning is often safer. The `structuredClone()` function is used internally for deep cloning.
