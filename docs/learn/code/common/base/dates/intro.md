---
sidebar_position: 1
title: Dates in Bitbybit
sidebar_label: Dates in Bitbybit
description: An overview of the Dates class in Bitbybit, explaining how to create, access, modify, and format date and time information.
tags: [code, dates]
---

<img 
  src="https://s.bitbybit.dev/assets/icons/white/dates-icon.svg" 
  alt="Dates category icon" 
  title="Dates category icon"
  width="100" /> 

[View Full Source & Details on GitHub](https://github.com/bitbybit-dev/bitbybit/blob/master/packages/dev/base/lib/api/services/dates.ts)

The `Dates` class in Bitbybit provides a collection of tools for working with dates and times. It largely leverages the built-in JavaScript `Date` object, offering convenient methods to create, manipulate, and query date information.

**What is a Date in Bitbybit?**

A "Date" in Bitbybit refers to a standard JavaScript `Date` object. This object encapsulates a specific moment in time, including the year, month, day, hour, minute, second, and millisecond.

## Core Capabilities of the Dates Class

The `Dates` class simplifies common date and time operations. Here's a high-level look at its features. For the exact input parameters (like DTOs) and detailed behavior (e.g., how months are 0-indexed), please consult the [full Dates API documentation](https://docs.bitbybit.dev/classes/Bit.Dates.html) or the GitHub source linked above.

### 1. Creating Dates

Need to define a specific date or get the current time?
*   **Current Date & Time (`now()`):** Get a `Date` object representing the exact moment the function is called.
*   **Specific Date (`createDate()`):** Create a `Date` object by providing individual components like year, month (0-11), day, hours, minutes, seconds, and milliseconds.
*   **Specific UTC Date (`createDateUTC()`):** Similar to `createDate()`, but interprets the provided components as Coordinated Universal Time (UTC).
*   **From Timestamp (`createFromUnixTimeStamp()`):** Create a `Date` object from a Unix timestamp (the number of milliseconds since January 1, 1970, UTC).

### 2. Converting Dates to Strings (Formatting)

Displaying dates in a human-readable format:
*   **Basic String (`toString()`):** Get a general string representation of the date (format depends on the system's locale).
*   **Date Part Only (`toDateString()`):** Get just the date portion as a string (e.g., "Mon Jan 01 2024").
*   **Time Part Only (`toTimeString()`):** Get just the time portion as a string (e.g., "14:30:00 GMT+0000").
*   **ISO Format (`toISOString()`):** Get the date in the standard ISO 8601 format (e.g., "2024-01-01T14:30:00.000Z"). This is often used for data interchange.
*   **JSON Format (`toJSON()`):** Get the date as a string suitable for JSON serialization (typically ISO format).
*   **UTC String (`toUTCString()`):** Get the date as a string formatted according to UTC conventions (e.g., "Mon, 01 Jan 2024 14:30:00 GMT").

### 3. Getting Specific Parts of a Date

Extracting individual components from a `Date` object. Most "get" methods have both a local time version and a UTC version:
*   **Year:** `getYear()` / `getUTCYear()`
*   **Month:** `getMonth()` (0 for January, 11 for December) / `getUTCMonth()`
*   **Day of the Month:** `getDayOfMonth()` (1-31) / `getUTCDay()` (Note: `getUTCDay()` in JS Date returns day of week for UTC, but here it seems to mean day of month for UTC based on pairing with `setUTCDay` which takes day of month).
*   **Day of the Week:** `getWeekday()` (0 for Sunday, 6 for Saturday - local time)
*   **Hours:** `getHours()` (0-23) / `getUTCHours()`
*   **Minutes:** `getMinutes()` (0-59) / `getUTCMinutes()`
*   **Seconds:** `getSeconds()` (0-59) / `getUTCSeconds()`
*   **Milliseconds:** `getMilliseconds()` (0-999) / `getUTCMilliseconds()`
*   **Total Time (`getTime()`):** Get the raw numeric value of the date, represented as milliseconds since the Unix epoch (January 1, 1970, UTC).

### 4. Setting Parts of a Date (Modifying Dates)

Changing components of an existing `Date` object. These methods typically return a *new* `Date` object with the modification, leaving the original unchanged. Like "get" methods, "set" methods often have local and UTC versions:
*   **Year:** `setYear()` / `setUTCYear()`
*   **Month:** `setMonth()` / `setUTCMonth()`
*   **Day of the Month:** `setDayOfMonth()` / `setUTCDay()`
*   **Hours:** `setHours()` / `setUTCHours()`
*   **Minutes:** `setMinutes()` / `setUTCMinutes()`
*   **Seconds:** `setSeconds()` / `setUTCSeconds()`
*   **Milliseconds:** `setMilliseconds()` / `setUTCMilliseconds()`
*   **Total Time (`setTime()`):** Set the date based on a Unix timestamp (milliseconds since epoch).

### 5. Parsing Date Strings

*   **Parse Date String (`parseDate()`):** Convert a string representation of a date into a Unix timestamp (number of milliseconds since epoch). The success of parsing depends on the format of the string and the browser's parsing capabilities.

## Important Notes:

*   **Local Time vs. UTC:** Be mindful of whether you're working with local time (which depends on the user's system timezone) or UTC (a global time standard). The class provides methods for both.
*   **Month Indexing:** When creating dates or getting/setting months, remember that months are typically 0-indexed in JavaScript (0 for January, 1 for February, ..., 11 for December).
*   **Immutability:** The "set" methods in this class are designed to be immutable: they return a *new* `Date` object with the changes, rather than modifying the original `Date` object you passed in. This is generally a safer approach.
