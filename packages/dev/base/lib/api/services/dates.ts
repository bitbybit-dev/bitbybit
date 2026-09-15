import * as Inputs from "../inputs";

/**
 * Dates and times as JavaScript `Date` values: creating them, reading and setting their parts, and
 * formatting them as text. Months count from 0 (January is 0, December 11) and weekdays from 0
 * (Sunday); days of the month count from 1. Every setter returns a new date and leaves the given
 * one unchanged. Local-time and UTC variants exist for most operations.
 */
export class Dates {

    /**
     * Formats the date part as text, without the time, in the local time zone.
     *
     * Example: 15 January 2024 at 14:30 -> 'Mon Jan 15 2024'
     * @param inputs - The date
     * @returns The date as text such as 'Mon Jan 15 2024'
     * @group convert
     * @shortname date to string
     * @drawable false
     */
    toDateString(inputs: Inputs.Dates.DateDto): string {
        return inputs.date.toDateString();
    }

    /**
     * Formats the date and time in the ISO 8601 form used for data exchange, always in UTC.
     *
     * Example: 15 January 2024 at 14:30 -> '2024-01-15T14:30:45.000Z'
     * @param inputs - The date
     * @returns The date as text such as '2024-01-15T14:30:45.000Z'
     * @group convert
     * @shortname date to iso string
     * @drawable false
     */
    toISOString(inputs: Inputs.Dates.DateDto): string {
        return inputs.date.toISOString();
    }

    /**
     * Formats the date the way it appears inside JSON, which is the ISO 8601 form in UTC.
     *
     * Example: 15 January 2024 at 14:30 -> '2024-01-15T14:30:00.000Z'
     * @param inputs - The date
     * @returns The date as text such as '2024-01-15T14:30:00.000Z'
     * @group convert
     * @shortname date to json
     * @drawable false
     */
    toJSON(inputs: Inputs.Dates.DateDto): string {
        return inputs.date.toJSON();
    }

    /**
     * Formats the full date and time as text in the local time zone, with the zone offset.
     *
     * Example: 15 January 2024 at 14:30 -> 'Mon Jan 15 2024 14:30:00 GMT+0000'
     * @param inputs - The date
     * @returns The date and time as text
     * @group convert
     * @shortname date to locale string
     * @drawable false
     */
    toString(inputs: Inputs.Dates.DateDto): string {
        return inputs.date.toString();
    }

    /**
     * Formats the time part as text, without the date, in the local time zone with the zone offset.
     *
     * Example: 15 January 2024 at 14:30 -> '14:30:45 GMT+0000'
     * @param inputs - The date
     * @returns The time as text such as '14:30:45 GMT+0000'
     * @group convert
     * @shortname date to time string
     * @drawable false
     */
    toTimeString(inputs: Inputs.Dates.DateDto): string {
        return inputs.date.toTimeString();
    }

    /**
     * Formats the date and time as text in UTC.
     *
     * Example: 15 January 2024 at 14:30 -> 'Mon, 15 Jan 2024 14:30:00 GMT'
     * @param inputs - The date
     * @returns The date and time as UTC text
     * @group convert
     * @shortname date to utc string
     * @drawable false
     */
    toUTCString(inputs: Inputs.Dates.DateDto): string {
        return inputs.date.toUTCString();
    }

    /**
     * Gives the current date and time at the moment of the call.
     * @returns The current date and time
     * @group create
     * @shortname now
     * @drawable false
     */
    now(): Date {
        return new Date(Date.now());
    }

    /**
     * Builds a date from its parts, read in the local time zone.
     *
     * The month counts from 0: 0 is January, 11 December. A part outside its range rolls over, so
     * day 32 of January becomes the first of February.
     * Example: year 2024, month 0, day 15, hours 14, minutes 30 -> 15 January 2024 at 14:30 local
     * time
     * @param inputs - The year, month, day, hours, minutes, seconds and milliseconds
     * @returns The date
     * @group create
     * @shortname create date
     * @drawable false
     * @example
     * ```typescript
     * const date = bitbybit.dates.createDate({ year: 2024, month: 0, day: 15, hours: 14, minutes: 30, seconds: 0, milliseconds: 0 });
     * ```
     */
    createDate(inputs: Inputs.Dates.CreateDateDto): Date {
        return new Date(inputs.year, inputs.month, inputs.day, inputs.hours, inputs.minutes, inputs.seconds, inputs.milliseconds);
    }

    /**
     * Builds a date from its parts, read as UTC so the local time zone plays no part.
     *
     * The month counts from 0: 0 is January, 11 December. A part outside its range rolls over.
     * Example: year 2024, month 0, day 15 -> 15 January 2024 at 00:00 UTC
     * @param inputs - The year, month, day, hours, minutes, seconds and milliseconds
     * @returns The date
     * @group create
     * @shortname create utc date
     * @drawable false
     * @example
     * ```typescript
     * const date = bitbybit.dates.createDateUTC({ year: 2024, month: 0, day: 15, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
     * ```
     */
    createDateUTC(inputs: Inputs.Dates.CreateDateDto): Date {
        return new Date(Date.UTC(inputs.year, inputs.month, inputs.day, inputs.hours, inputs.minutes, inputs.seconds, inputs.milliseconds));
    }

    /**
     * Builds a date from a Unix timestamp: the number of milliseconds since 1 January 1970 at 00:00
     * UTC.
     *
     * Example: 1705329000000 -> 15 January 2024 at 14:30 UTC
     * @param inputs - The timestamp in milliseconds
     * @returns The date
     * @group create
     * @shortname create from unix timestamp
     * @drawable false
     * @example
     * ```typescript
     * const date = bitbybit.dates.createFromUnixTimeStamp({ unixTimeStamp: 1705329000000 });
     * ```
     */
    createFromUnixTimeStamp(inputs: Inputs.Dates.CreateFromUnixTimeStampDto): Date {
        return new Date(inputs.unixTimeStamp);
    }

    /**
     * Reads a date written as text and gives its Unix timestamp, the milliseconds since 1 January
     * 1970 at 00:00 UTC.
     *
     * ISO 8601 text such as '2024-01-15' or '2024-01-15T14:30:00Z' is read reliably; text that
     * cannot be read gives NaN.
     * Example: '2024-01-15' -> 1705276800000
     * @param inputs - The date as text
     * @returns The timestamp in milliseconds, or NaN when the text is not a date
     * @group parse
     * @shortname parse date string
     * @drawable false
     * @example
     * ```typescript
     * const stamp = bitbybit.dates.parseDate({ dateString: "2024-01-15T14:30:00Z" });
     * ```
     */
    parseDate(inputs: Inputs.Dates.DateStringDto): number {
        return Date.parse(inputs.dateString);
    }

    /**
     * Reads the day of the month, from 1 to 31, in the local time zone.
     *
     * Example: 15 January 2024 -> 15
     * @param inputs - The date
     * @returns The day of the month
     * @group get
     * @shortname get date of month
     * @drawable false
     */
    getDayOfMonth(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getDate();
    }

    /**
     * Reads the day of the week in the local time zone: 0 is Sunday, 6 Saturday.
     *
     * Example: 15 January 2024 -> 1, a Monday
     * @param inputs - The date
     * @returns The weekday from 0 to 6
     * @group get
     * @shortname get weekday
     * @drawable false
     */
    getWeekday(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getDay();
    }

    /**
     * Reads the full year in the local time zone.
     *
     * Example: 15 January 2024 -> 2024
     * @param inputs - The date
     * @returns The year
     * @group get
     * @shortname get year
     * @drawable false
     */
    getYear(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getFullYear();
    }

    /**
     * Reads the month in the local time zone, counting from 0: 0 is January, 11 December.
     *
     * Example: 15 January 2024 -> 0
     * @param inputs - The date
     * @returns The month from 0 to 11
     * @group get
     * @shortname get month
     * @drawable false
     */
    getMonth(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getMonth();
    }

    /**
     * Reads the hour, from 0 to 23, in the local time zone.
     *
     * Example: 14:30 -> 14
     * @param inputs - The date
     * @returns The hour
     * @group get
     * @shortname get hours
     * @drawable false
     */
    getHours(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getHours();
    }

    /**
     * Reads the minutes, from 0 to 59, in the local time zone.
     *
     * Example: 14:30 -> 30
     * @param inputs - The date
     * @returns The minutes
     * @group get
     * @shortname get minutes
     * @drawable false
     */
    getMinutes(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getMinutes();
    }

    /**
     * Reads the seconds, from 0 to 59, in the local time zone.
     *
     * Example: 14:30:45 -> 45
     * @param inputs - The date
     * @returns The seconds
     * @group get
     * @shortname get seconds
     * @drawable false
     */
    getSeconds(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getSeconds();
    }

    /**
     * Reads the milliseconds, from 0 to 999, in the local time zone.
     *
     * Example: 14:30:45.123 -> 123
     * @param inputs - The date
     * @returns The milliseconds
     * @group get
     * @shortname get milliseconds
     * @drawable false
     */
    getMilliseconds(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getMilliseconds();
    }

    /**
     * Gives the date as a Unix timestamp: the milliseconds since 1 January 1970 at 00:00 UTC.
     *
     * Example: 15 January 2024 at 14:30 UTC -> 1705329000000
     * @param inputs - The date
     * @returns The timestamp in milliseconds
     * @group get
     * @shortname get time
     * @drawable false
     */
    getTime(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getTime();
    }

    /**
     * Reads the full year in UTC.
     *
     * Example: 15 January 2024 -> 2024
     * @param inputs - The date
     * @returns The year
     * @group get
     * @shortname get utc year
     * @drawable false
     */
    getUTCYear(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getUTCFullYear();
    }

    /**
     * Reads the month in UTC, counting from 0: 0 is January, 11 December.
     *
     * Example: 15 January 2024 -> 0
     * @param inputs - The date
     * @returns The month from 0 to 11
     * @group get
     * @shortname get utc month
     * @drawable false
     */
    getUTCMonth(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getUTCMonth();
    }

    /**
     * Reads the day of the month, from 1 to 31, in UTC.
     *
     * Example: 15 January 2024 -> 15
     * @param inputs - The date
     * @returns The day of the month
     * @group get
     * @shortname get utc day
     * @drawable false
     */
    getUTCDay(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getUTCDate();
    }

    /**
     * Reads the hour, from 0 to 23, in UTC.
     *
     * Example: 14:00 UTC -> 14
     * @param inputs - The date
     * @returns The hour
     * @group get
     * @shortname get utc hours
     * @drawable false
     */
    getUTCHours(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getUTCHours();
    }

    /**
     * Reads the minutes, from 0 to 59, in UTC.
     *
     * Example: 14:30 UTC -> 30
     * @param inputs - The date
     * @returns The minutes
     * @group get
     * @shortname get utc minutes
     * @drawable false
     */
    getUTCMinutes(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getUTCMinutes();
    }

    /**
     * Reads the seconds, from 0 to 59, in UTC.
     *
     * Example: 14:30:45 UTC -> 45
     * @param inputs - The date
     * @returns The seconds
     * @group get
     * @shortname get utc seconds
     * @drawable false
     */
    getUTCSeconds(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getUTCSeconds();
    }

    /**
     * Reads the milliseconds, from 0 to 999, in UTC.
     *
     * Example: 14:30:45.123 UTC -> 123
     * @param inputs - The date
     * @returns The milliseconds
     * @group get
     * @shortname get utc milliseconds
     * @drawable false
     */
    getUTCMilliseconds(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getUTCMilliseconds();
    }

    /**
     * Makes a copy of the date with another year, in the local time zone. The given date is not
     * changed.
     *
     * Example: 15 January 2024 with year 2025 -> 15 January 2025
     * @param inputs - The date and the year
     * @returns A new date with the year changed
     * @group set
     * @shortname set year
     * @drawable false
     * @example
     * ```typescript
     * const changed = bitbybit.dates.setYear({ date: bitbybit.dates.now(), year: 2025 });
     * ```
     */
    setYear(inputs: Inputs.Dates.DateYearDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setFullYear(inputs.year);
        return dateCopy;
    }

    /**
     * Makes a copy of the date with another month, in the local time zone; months count from 0. The
     * given date is not changed.
     *
     * Example: 15 January 2024 with month 5 -> 15 June 2024
     * @param inputs - The date and the month from 0 to 11
     * @returns A new date with the month changed
     * @group set
     * @shortname set month
     * @drawable false
     * @example
     * ```typescript
     * const changed = bitbybit.dates.setMonth({ date: bitbybit.dates.now(), month: 5 });
     * ```
     */
    setMonth(inputs: Inputs.Dates.DateMonthDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setMonth(inputs.month);
        return dateCopy;
    }

    /**
     * Makes a copy of the date with another day of the month, in the local time zone. The given
     * date is not changed.
     *
     * Example: 15 January 2024 with day 20 -> 20 January 2024
     * @param inputs - The date and the day from 1 to 31
     * @returns A new date with the day changed
     * @group set
     * @shortname set day of month
     * @drawable false
     * @example
     * ```typescript
     * const changed = bitbybit.dates.setDayOfMonth({ date: bitbybit.dates.now(), day: 20 });
     * ```
     */
    setDayOfMonth(inputs: Inputs.Dates.DateDayDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setDate(inputs.day);
        return dateCopy;
    }

    /**
     * Makes a copy of the date with another hour, in the local time zone. The given date is not
     * changed.
     *
     * Example: 14:30 with hours 9 -> 09:30
     * @param inputs - The date and the hour from 0 to 23
     * @returns A new date with the hour changed
     * @group set
     * @shortname set hours
     * @drawable false
     * @example
     * ```typescript
     * const changed = bitbybit.dates.setHours({ date: bitbybit.dates.now(), hours: 9 });
     * ```
     */
    setHours(inputs: Inputs.Dates.DateHoursDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setHours(inputs.hours);
        return dateCopy;
    }

    /**
     * Makes a copy of the date with other minutes, in the local time zone. The given date is not
     * changed.
     *
     * Example: 14:30 with minutes 45 -> 14:45
     * @param inputs - The date and the minutes from 0 to 59
     * @returns A new date with the minutes changed
     * @group set
     * @shortname set minutes
     * @drawable false
     * @example
     * ```typescript
     * const changed = bitbybit.dates.setMinutes({ date: bitbybit.dates.now(), minutes: 45 });
     * ```
     */
    setMinutes(inputs: Inputs.Dates.DateMinutesDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setMinutes(inputs.minutes);
        return dateCopy;
    }

    /**
     * Makes a copy of the date with other seconds, in the local time zone. The given date is not
     * changed.
     *
     * Example: 14:30:00 with seconds 30 -> 14:30:30
     * @param inputs - The date and the seconds from 0 to 59
     * @returns A new date with the seconds changed
     * @group set
     * @shortname set seconds
     * @drawable false
     * @example
     * ```typescript
     * const changed = bitbybit.dates.setSeconds({ date: bitbybit.dates.now(), seconds: 30 });
     * ```
     */
    setSeconds(inputs: Inputs.Dates.DateSecondsDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setSeconds(inputs.seconds);
        return dateCopy;
    }

    /**
     * Makes a copy of the date with other milliseconds, in the local time zone. The given date is
     * not changed.
     *
     * Example: 14:30:00.000 with milliseconds 500 -> 14:30:00.500
     * @param inputs - The date and the milliseconds from 0 to 999
     * @returns A new date with the milliseconds changed
     * @group set
     * @shortname set milliseconds
     * @drawable false
     * @example
     * ```typescript
     * const changed = bitbybit.dates.setMilliseconds({ date: bitbybit.dates.now(), milliseconds: 500 });
     * ```
     */
    setMilliseconds(inputs: Inputs.Dates.DateMillisecondsDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setMilliseconds(inputs.milliseconds);
        return dateCopy;
    }

    /**
     * Makes a copy of the date moved to a Unix timestamp, the milliseconds since 1 January 1970 at
     * 00:00 UTC. The given date is not changed.
     *
     * Example: any date with time 0 -> 1 January 1970 at 00:00 UTC
     * @param inputs - The date and the timestamp in milliseconds
     * @returns A new date with the timestamp changed
     * @group set
     * @shortname set time
     * @drawable false
     * @example
     * ```typescript
     * const changed = bitbybit.dates.setTime({ date: bitbybit.dates.now(), time: 1705329000000 });
     * ```
     */
    setTime(inputs: Inputs.Dates.DateTimeDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setTime(inputs.time);
        return dateCopy;
    }


    /**
     * Makes a copy of the date with another year, in UTC. The given date is not changed.
     *
     * Example: 15 January 2024 with year 2025 -> 15 January 2025
     * @param inputs - The date and the year
     * @returns A new date with the year changed
     * @group set
     * @shortname set utc year
     * @drawable false
     * @example
     * ```typescript
     * const changed = bitbybit.dates.setUTCYear({ date: bitbybit.dates.now(), year: 2025 });
     * ```
     */
    setUTCYear(inputs: Inputs.Dates.DateYearDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setUTCFullYear(inputs.year);
        return dateCopy;
    }

    /**
     * Makes a copy of the date with another month, in UTC; months count from 0. The given date is
     * not changed.
     *
     * Example: 15 January 2024 with month 5 -> 15 June 2024
     * @param inputs - The date and the month from 0 to 11
     * @returns A new date with the month changed
     * @group set
     * @shortname set utc month
     * @drawable false
     * @example
     * ```typescript
     * const changed = bitbybit.dates.setUTCMonth({ date: bitbybit.dates.now(), month: 5 });
     * ```
     */
    setUTCMonth(inputs: Inputs.Dates.DateMonthDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setUTCMonth(inputs.month);
        return dateCopy;
    }

    /**
     * Makes a copy of the date with another day of the month, in UTC. The given date is not
     * changed.
     *
     * Example: 15 January 2024 with day 20 -> 20 January 2024
     * @param inputs - The date and the day from 1 to 31
     * @returns A new date with the day changed
     * @group set
     * @shortname set utc day
     * @drawable false
     * @example
     * ```typescript
     * const changed = bitbybit.dates.setUTCDay({ date: bitbybit.dates.now(), day: 20 });
     * ```
     */
    setUTCDay(inputs: Inputs.Dates.DateDayDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setUTCDate(inputs.day);
        return dateCopy;
    }

    /**
     * Makes a copy of the date with another hour, in UTC. The given date is not changed.
     *
     * Example: 14:30 UTC with hours 9 -> 09:30 UTC
     * @param inputs - The date and the hour from 0 to 23
     * @returns A new date with the hour changed
     * @group set
     * @shortname set utc hours
     * @drawable false
     * @example
     * ```typescript
     * const changed = bitbybit.dates.setUTCHours({ date: bitbybit.dates.now(), hours: 9 });
     * ```
     */
    setUTCHours(inputs: Inputs.Dates.DateHoursDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setUTCHours(inputs.hours);
        return dateCopy;
    }

    /**
     * Makes a copy of the date with other minutes, in UTC. The given date is not changed.
     *
     * Example: 14:30 UTC with minutes 45 -> 14:45 UTC
     * @param inputs - The date and the minutes from 0 to 59
     * @returns A new date with the minutes changed
     * @group set
     * @shortname set utc minutes
     * @drawable false
     * @example
     * ```typescript
     * const changed = bitbybit.dates.setUTCMinutes({ date: bitbybit.dates.now(), minutes: 45 });
     * ```
     */
    setUTCMinutes(inputs: Inputs.Dates.DateMinutesDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setUTCMinutes(inputs.minutes);
        return dateCopy;
    }

    /**
     * Makes a copy of the date with other seconds, in UTC. The given date is not changed.
     *
     * Example: 14:30:00 UTC with seconds 30 -> 14:30:30 UTC
     * @param inputs - The date and the seconds from 0 to 59
     * @returns A new date with the seconds changed
     * @group set
     * @shortname set utc seconds
     * @drawable false
     * @example
     * ```typescript
     * const changed = bitbybit.dates.setUTCSeconds({ date: bitbybit.dates.now(), seconds: 30 });
     * ```
     */
    setUTCSeconds(inputs: Inputs.Dates.DateSecondsDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setUTCSeconds(inputs.seconds);
        return dateCopy;
    }

    /**
     * Makes a copy of the date with other milliseconds, in UTC. The given date is not changed.
     *
     * Example: 14:30:00.000 UTC with milliseconds 500 -> 14:30:00.500 UTC
     * @param inputs - The date and the milliseconds from 0 to 999
     * @returns A new date with the milliseconds changed
     * @group set
     * @shortname set utc milliseconds
     * @drawable false
     * @example
     * ```typescript
     * const changed = bitbybit.dates.setUTCMilliseconds({ date: bitbybit.dates.now(), milliseconds: 500 });
     * ```
     */
    setUTCMilliseconds(inputs: Inputs.Dates.DateMillisecondsDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setUTCMilliseconds(inputs.milliseconds);
        return dateCopy;
    }

}
