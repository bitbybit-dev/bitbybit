---
sidebar_position: 1
title: Dates in Bitbybit
sidebar_label: Dates in Bitbybit
description: How bitbybit.dates creates JavaScript dates, reads and sets their parts in local time or UTC without changing the input, formats them as text and converts to and from Unix timestamps.
topic: code.base.dates
type: explanation
tags: [code, dates]
---

<img 
  class="category-icon-small" 
  src="https://s.bitbybit.dev/assets/icons/white/dates-icon.svg" 
  alt="Dates category icon" 
  title="Dates category icon" /> 

[View Full Source & Details on GitHub](https://github.com/bitbybit-dev/bitbybit/blob/master/packages/dev/base/lib/api/services/dates.ts)

`bitbybit.dates` works with dates and times as standard JavaScript `Date` values: a single moment, with its year, month, day, hour, minute, second and millisecond.

## Three counting rules

- **Months count from 0**: 0 is January, 11 is December. This holds for `createDate`, `getMonth`, `setMonth` and their UTC twins.
- **Days of the month count from 1**, from 1 to 31.
- **Weekdays count from 0**: `getWeekday` gives 0 for Sunday and 6 for Saturday.

## Local time or UTC

Most functions come in two forms. The plain one reads and writes the date in the time zone of the computer running the script; the one with `UTC` in its name uses Coordinated Universal Time, so the result is the same everywhere. Choose UTC when the date travels between people or machines.

## Creating dates

- `now` gives the moment of the call.
- `createDate` builds a date from year, month, day, hours, minutes, seconds and milliseconds, read in local time; `createDateUTC` reads the same parts as UTC. A part outside its range rolls over, so day 32 of January becomes 1 February.
- `createFromUnixTimeStamp` builds a date from a Unix timestamp, the milliseconds since 1 January 1970 at 00:00 UTC.
- `parseDate` reads a date written as text and gives its Unix timestamp, not a date; pass the number to `createFromUnixTimeStamp` to get one. ISO 8601 text such as `2024-01-15T14:30:00Z` is read reliably, and text that cannot be read gives `NaN`.

## Reading parts

- `getYear` / `getUTCYear` give the full year, such as 2024.
- `getMonth` / `getUTCMonth` give the month, from 0.
- `getDayOfMonth` / `getUTCDay` give the day of the month, from 1 to 31. Unlike JavaScript's own `getUTCDay`, `getUTCDay` here gives the day of the month, not the weekday.
- `getWeekday` gives the day of the week in local time; there is no UTC form.
- `getHours` / `getUTCHours`, `getMinutes` / `getUTCMinutes`, `getSeconds` / `getUTCSeconds` and `getMilliseconds` / `getUTCMilliseconds` give the time parts.
- `getTime` gives the date as a Unix timestamp in milliseconds.

## Setting parts

Every setter gives a new date and leaves the one you pass in unchanged, so the same date can feed several branches of a script. A value outside its range rolls the date over.

- `setYear` / `setUTCYear`, `setMonth` / `setUTCMonth`, `setDayOfMonth` / `setUTCDay`
- `setHours` / `setUTCHours`, `setMinutes` / `setUTCMinutes`, `setSeconds` / `setUTCSeconds`, `setMilliseconds` / `setUTCMilliseconds`
- `setTime` moves the copy to a Unix timestamp.

## Formatting as text

- `toISOString` and `toJSON` give the ISO 8601 form, always in UTC, such as `2024-01-15T14:30:00.000Z`. Use it for data that other programs read.
- `toUTCString` gives a readable form in UTC, such as `Mon, 15 Jan 2024 14:30:00 GMT`.
- `toString` gives the date and time in local time with the zone offset; `toDateString` gives only the date, such as `Mon Jan 15 2024`, and `toTimeString` only the time with the offset.

## Every function

{/* api:dates:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`createDate`](https://docs.bitbybit.dev/classes/Bit.Dates#createDate) | Builds a date from its parts, read in the local time zone. |
| [`createDateUTC`](https://docs.bitbybit.dev/classes/Bit.Dates#createDateUTC) | Builds a date from its parts, read as UTC so the local time zone plays no part. |
| [`createFromUnixTimeStamp`](https://docs.bitbybit.dev/classes/Bit.Dates#createFromUnixTimeStamp) | Builds a date from a Unix timestamp: the number of milliseconds since 1 January 1970 at 00:00 UTC. |
| [`getDayOfMonth`](https://docs.bitbybit.dev/classes/Bit.Dates#getDayOfMonth) | Reads the day of the month, from 1 to 31, in the local time zone. |
| [`getHours`](https://docs.bitbybit.dev/classes/Bit.Dates#getHours) | Reads the hour, from 0 to 23, in the local time zone. |
| [`getMilliseconds`](https://docs.bitbybit.dev/classes/Bit.Dates#getMilliseconds) | Reads the milliseconds, from 0 to 999, in the local time zone. |
| [`getMinutes`](https://docs.bitbybit.dev/classes/Bit.Dates#getMinutes) | Reads the minutes, from 0 to 59, in the local time zone. |
| [`getMonth`](https://docs.bitbybit.dev/classes/Bit.Dates#getMonth) | Reads the month in the local time zone, counting from 0: 0 is January, 11 December. |
| [`getSeconds`](https://docs.bitbybit.dev/classes/Bit.Dates#getSeconds) | Reads the seconds, from 0 to 59, in the local time zone. |
| [`getTime`](https://docs.bitbybit.dev/classes/Bit.Dates#getTime) | Gives the date as a Unix timestamp: the milliseconds since 1 January 1970 at 00:00 UTC. |
| [`getUTCDay`](https://docs.bitbybit.dev/classes/Bit.Dates#getUTCDay) | Reads the day of the month, from 1 to 31, in UTC. |
| [`getUTCHours`](https://docs.bitbybit.dev/classes/Bit.Dates#getUTCHours) | Reads the hour, from 0 to 23, in UTC. |
| [`getUTCMilliseconds`](https://docs.bitbybit.dev/classes/Bit.Dates#getUTCMilliseconds) | Reads the milliseconds, from 0 to 999, in UTC. |
| [`getUTCMinutes`](https://docs.bitbybit.dev/classes/Bit.Dates#getUTCMinutes) | Reads the minutes, from 0 to 59, in UTC. |
| [`getUTCMonth`](https://docs.bitbybit.dev/classes/Bit.Dates#getUTCMonth) | Reads the month in UTC, counting from 0: 0 is January, 11 December. |
| [`getUTCSeconds`](https://docs.bitbybit.dev/classes/Bit.Dates#getUTCSeconds) | Reads the seconds, from 0 to 59, in UTC. |
| [`getUTCYear`](https://docs.bitbybit.dev/classes/Bit.Dates#getUTCYear) | Reads the full year in UTC. |
| [`getWeekday`](https://docs.bitbybit.dev/classes/Bit.Dates#getWeekday) | Reads the day of the week in the local time zone: 0 is Sunday, 6 Saturday. |
| [`getYear`](https://docs.bitbybit.dev/classes/Bit.Dates#getYear) | Reads the full year in the local time zone. |
| [`now`](https://docs.bitbybit.dev/classes/Bit.Dates#now) | Gives the current date and time at the moment of the call. |
| [`parseDate`](https://docs.bitbybit.dev/classes/Bit.Dates#parseDate) | Reads a date written as text and gives its Unix timestamp, the milliseconds since 1 January 1970 at 00:00 UTC. |
| [`setDayOfMonth`](https://docs.bitbybit.dev/classes/Bit.Dates#setDayOfMonth) | Makes a copy of the date with another day of the month, in the local time zone. |
| [`setHours`](https://docs.bitbybit.dev/classes/Bit.Dates#setHours) | Makes a copy of the date with another hour, in the local time zone. |
| [`setMilliseconds`](https://docs.bitbybit.dev/classes/Bit.Dates#setMilliseconds) | Makes a copy of the date with other milliseconds, in the local time zone. |
| [`setMinutes`](https://docs.bitbybit.dev/classes/Bit.Dates#setMinutes) | Makes a copy of the date with other minutes, in the local time zone. |
| [`setMonth`](https://docs.bitbybit.dev/classes/Bit.Dates#setMonth) | Makes a copy of the date with another month, in the local time zone; months count from 0. |
| [`setSeconds`](https://docs.bitbybit.dev/classes/Bit.Dates#setSeconds) | Makes a copy of the date with other seconds, in the local time zone. |
| [`setTime`](https://docs.bitbybit.dev/classes/Bit.Dates#setTime) | Makes a copy of the date moved to a Unix timestamp, the milliseconds since 1 January 1970 at 00:00 UTC. |
| [`setUTCDay`](https://docs.bitbybit.dev/classes/Bit.Dates#setUTCDay) | Makes a copy of the date with another day of the month, in UTC. |
| [`setUTCHours`](https://docs.bitbybit.dev/classes/Bit.Dates#setUTCHours) | Makes a copy of the date with another hour, in UTC. |
| [`setUTCMilliseconds`](https://docs.bitbybit.dev/classes/Bit.Dates#setUTCMilliseconds) | Makes a copy of the date with other milliseconds, in UTC. |
| [`setUTCMinutes`](https://docs.bitbybit.dev/classes/Bit.Dates#setUTCMinutes) | Makes a copy of the date with other minutes, in UTC. |
| [`setUTCMonth`](https://docs.bitbybit.dev/classes/Bit.Dates#setUTCMonth) | Makes a copy of the date with another month, in UTC; months count from 0. |
| [`setUTCSeconds`](https://docs.bitbybit.dev/classes/Bit.Dates#setUTCSeconds) | Makes a copy of the date with other seconds, in UTC. |
| [`setUTCYear`](https://docs.bitbybit.dev/classes/Bit.Dates#setUTCYear) | Makes a copy of the date with another year, in UTC. |
| [`setYear`](https://docs.bitbybit.dev/classes/Bit.Dates#setYear) | Makes a copy of the date with another year, in the local time zone. |
| [`toDateString`](https://docs.bitbybit.dev/classes/Bit.Dates#toDateString) | Formats the date part as text, without the time, in the local time zone. |
| [`toISOString`](https://docs.bitbybit.dev/classes/Bit.Dates#toISOString) | Formats the date and time in the ISO 8601 form used for data exchange, always in UTC. |
| [`toJSON`](https://docs.bitbybit.dev/classes/Bit.Dates#toJSON) | Formats the date the way it appears inside JSON, which is the ISO 8601 form in UTC. |
| [`toString`](https://docs.bitbybit.dev/classes/Bit.Dates#toString) | Formats the full date and time as text in the local time zone, with the zone offset. |
| [`toTimeString`](https://docs.bitbybit.dev/classes/Bit.Dates#toTimeString) | Formats the time part as text, without the date, in the local time zone with the zone offset. |
| [`toUTCString`](https://docs.bitbybit.dev/classes/Bit.Dates#toUTCString) | Formats the date and time as text in UTC. |

{/* api:dates:end */}
