import * as Inputs from "../inputs";

/**
 * Contains various date methods.
 */
export class Dates {

    /**
     * Converts date to human-readable date string (excludes time).
     * Example: Date(2024,0,15,14,30) → 'Mon Jan 15 2024'
     * @param inputs a date
     * @returns date as string
     * @group convert
     * @shortname date to string
     * @drawable false
     */
    toDateString(inputs: Inputs.Dates.DateDto): string {
        return inputs.date.toDateString();
    }

    /**
     * Converts date to ISO 8601 format string (standard format for APIs and data interchange).
     * Example: Date(2024,0,15,14,30,45) → '2024-01-15T14:30:45.000Z'
     * @param inputs a date
     * @returns date as string
     * @group convert
     * @shortname date to iso string
     * @drawable false
     */
    toISOString(inputs: Inputs.Dates.DateDto): string {
        return inputs.date.toISOString();
    }

    /**
     * Converts date to JSON-compatible string (same as ISO format, used in JSON.stringify).
     * Example: Date(2024,0,15,14,30) → '2024-01-15T14:30:00.000Z'
     * @param inputs a date
     * @returns date as string
     * @group convert
     * @shortname date to json
     * @drawable false
     */
    toJSON(inputs: Inputs.Dates.DateDto): string {
        return inputs.date.toJSON();
    }

    /**
     * Converts date to full locale-specific string (includes date, time, and timezone).
     * Example: Date(2024,0,15,14,30) → 'Mon Jan 15 2024 14:30:00 GMT+0000'
     * @param inputs a date
     * @returns date as string
     * @group convert
     * @shortname date to locale string
     * @drawable false
     */
    toString(inputs: Inputs.Dates.DateDto): string {
        return inputs.date.toString();
    }

    /**
     * Converts date to time string (excludes date, includes timezone).
     * Example: Date(2024,0,15,14,30,45) → '14:30:45 GMT+0000'
     * @param inputs a date
     * @returns time as string
     * @group convert
     * @shortname date to time string
     * @drawable false
     */
    toTimeString(inputs: Inputs.Dates.DateDto): string {
        return inputs.date.toTimeString();
    }

    /**
     * Converts date to UTC string format (Universal Coordinated Time, no timezone offset).
     * Example: Date(2024,0,15,14,30) → 'Mon, 15 Jan 2024 14:30:00 GMT'
     * @param inputs a date
     * @returns date as utc string
     * @group convert
     * @shortname date to utc string
     * @drawable false
     */
    toUTCString(inputs: Inputs.Dates.DateDto): string {
        return inputs.date.toUTCString();
    }

    /**
     * Returns the current date and time at the moment of execution.
     * Example: calling now() → Date object representing current moment (e.g., '2024-01-15T14:30:45')
     * @returns date
     * @group create
     * @shortname now
     * @drawable false
     */
    now(): Date {
        return new Date(Date.now());
    }

    /**
     * Creates a new date from individual components using local time.
     * Month is 0-indexed: 0=January, 11=December.
     * Example: year=2024, month=0, day=15, hours=14, minutes=30 → Date(Jan 15, 2024 14:30)
     * @param inputs a date
     * @returns date
     * @group create
     * @shortname create date
     * @drawable false
     */
    createDate(inputs: Inputs.Dates.CreateDateDto): Date {
        return new Date(inputs.year, inputs.month, inputs.day, inputs.hours, inputs.minutes, inputs.seconds, inputs.milliseconds);
    }

    /**
     * Creates a new date from individual components using UTC (ignores timezone).
     * Returns milliseconds since Unix epoch (Jan 1, 1970 00:00:00 UTC).
     * Example: year=2024, month=0, day=15 → Date representing Jan 15, 2024 00:00 UTC
     * @param inputs a date
     * @returns date
     * @group create
     * @shortname create utc date
     * @drawable false
     */
    createDateUTC(inputs: Inputs.Dates.CreateDateDto): Date {
        return new Date(Date.UTC(inputs.year, inputs.month, inputs.day, inputs.hours, inputs.minutes, inputs.seconds, inputs.milliseconds));
    }

    /**
     * Creates a date from Unix timestamp (milliseconds since Jan 1, 1970 UTC).
     * Example: unixTimeStamp=1705329000000 → Date(Jan 15, 2024 14:30:00)
     * @param inputs a unix time stamp
     * @returns date
     * @group create
     * @shortname create from unix timestamp
     * @drawable false
     */
    createFromUnixTimeStamp(inputs: Inputs.Dates.CreateFromUnixTimeStampDto): Date {
        return new Date(inputs.unixTimeStamp);
    }

    /**
     * Parses a date string and returns Unix timestamp (milliseconds since Jan 1, 1970 UTC).
     * Example: dateString='2024-01-15' → 1705276800000
     * @param inputs a date string
     * @returns the number of milliseconds between that date and midnight, January 1, 1970.
     * @group parse
     * @shortname parse date string
     * @drawable false
     */
    parseDate(inputs: Inputs.Dates.DateStringDto): number {
        return Date.parse(inputs.dateString);
    }

    /**
     * Extracts day of the month from date (1-31) using local time.
     * Example: Date(2024,0,15) → 15
     * @returns date
     * @group get
     * @shortname get date of month
     * @drawable false
     */
    getDayOfMonth(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getDate();
    }

    /**
     * Extracts day of the week from date (0=Sunday, 6=Saturday) using local time.
     * Example: Date(2024,0,15) → 1 (Monday)
     * @returns day
     * @group get
     * @shortname get weekday
     * @drawable false
     */
    getWeekday(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getDay();
    }

    /**
     * Extracts full year from date using local time.
     * Example: Date(2024,0,15) → 2024
     * @returns year
     * @group get
     * @shortname get year
     * @drawable false
     */
    getYear(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getFullYear();
    }

    /**
     * Extracts month from date (0=January, 11=December) using local time.
     * Example: Date(2024,0,15) → 0 (January)
     * @returns month
     * @group get
     * @shortname get month
     * @drawable false
     */
    getMonth(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getMonth();
    }

    /**
     * Extracts hours from date (0-23) using local time.
     * Example: Date(2024,0,15,14,30) → 14
     * @returns hours
     * @group get
     * @shortname get hours
     * @drawable false
     */
    getHours(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getHours();
    }

    /**
     * Extracts minutes from date (0-59) using local time.
     * Example: Date(2024,0,15,14,30) → 30
     * @returns minutes
     * @group get
     * @shortname get minutes
     * @drawable false
     */
    getMinutes(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getMinutes();
    }

    /**
     * Extracts seconds from date (0-59) using local time.
     * Example: Date(2024,0,15,14,30,45) → 45
     * @returns seconds
     * @group get
     * @shortname get seconds
     * @drawable false
     */
    getSeconds(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getSeconds();
    }

    /**
     * Extracts milliseconds from date (0-999) using local time.
     * Example: Date(2024,0,15,14,30,45,123) → 123
     * @returns milliseconds
     * @group get
     * @shortname get milliseconds
     * @drawable false
     */
    getMilliseconds(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getMilliseconds();
    }

    /**
     * Converts date to Unix timestamp (milliseconds since Jan 1, 1970 UTC).
     * Example: Date(2024,0,15,14,30) → 1705329000000
     * @returns time
     * @group get
     * @shortname get time
     * @drawable false
     */
    getTime(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getTime();
    }

    /**
     * Extracts full year from date using UTC (ignores timezone).
     * Example: Date(2024,0,15) → 2024
     * @returns year
     * @group get
     * @shortname get utc year
     * @drawable false
     */
    getUTCYear(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getUTCFullYear();
    }

    /**
     * Extracts month from date (0=January, 11=December) using UTC.
     * Example: Date.UTC(2024,0,15) → 0 (January)
     * @returns month
     * @group get
     * @shortname get utc month
     * @drawable false
     */
    getUTCMonth(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getUTCMonth();
    }

    /**
     * Extracts day of the month from date (1-31) using UTC.
     * Example: Date.UTC(2024,0,15) → 15
     * @returns day
     * @group get
     * @shortname get utc day
     * @drawable false
     */
    getUTCDay(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getUTCDate();
    }

    /**
     * Extracts hours from date (0-23) using UTC.
     * Example: Date.UTC(2024,0,15,14) → 14
     * @returns hours
     * @group get
     * @shortname get utc hours
     * @drawable false
     */
    getUTCHours(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getUTCHours();
    }

    /**
     * Extracts minutes from date (0-59) using UTC.
     * Example: Date.UTC(2024,0,15,14,30) → 30
     * @returns minutes
     * @group get
     * @shortname get utc minutes
     * @drawable false
     */
    getUTCMinutes(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getUTCMinutes();
    }

    /**
     * Extracts seconds from date (0-59) using UTC.
     * Example: Date.UTC(2024,0,15,14,30,45) → 45
     * @returns seconds
     * @group get
     * @shortname get utc seconds
     * @drawable false
     */
    getUTCSeconds(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getUTCSeconds();
    }

    /**
     * Extracts milliseconds from date (0-999) using UTC.
     * Example: Date.UTC(2024,0,15,14,30,45,123) → 123
     * @returns milliseconds
     * @group get
     * @shortname get utc milliseconds
     * @drawable false
     */
    getUTCMilliseconds(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getUTCMilliseconds();
    }

    /**
     * Creates new date with modified year (returns new date, original unchanged).
     * Example: Date(2024,0,15) with year=2025 → Date(2025,0,15)
     * @param inputs a date and the year
     * @returns date
     * @group set
     * @shortname set year
     * @drawable false
     * */
    setYear(inputs: Inputs.Dates.DateYearDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setFullYear(inputs.year);
        return dateCopy;
    }

    /**
     * Creates new date with modified month (0=January, 11=December, returns new date).
     * Example: Date(2024,0,15) with month=5 → Date(2024,5,15) (June 15)
     * @param inputs a date and the month
     * @returns date
     * @group set
     * @shortname set month
     * @drawable false
     * */
    setMonth(inputs: Inputs.Dates.DateMonthDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setMonth(inputs.month);
        return dateCopy;
    }

    /**
     * Creates new date with modified day of month (1-31, returns new date).
     * Example: Date(2024,0,15) with day=20 → Date(2024,0,20)
     * @param inputs a date and the day
     * @returns date
     * @group set
     * @shortname set day of month
     * @drawable false
     */
    setDayOfMonth(inputs: Inputs.Dates.DateDayDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setDate(inputs.day);
        return dateCopy;
    }

    /**
     * Sets the hour value in the Date object using local time.
     * @param inputs a date and the hours
     * @returns date
     * @group set
     * @shortname set hours
     * @drawable false
     * */
    setHours(inputs: Inputs.Dates.DateHoursDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setHours(inputs.hours);
        return dateCopy;
    }

    /**
     * Sets the minutes value in the Date object using local time.
     * @param inputs a date and the minutes
     * @returns date
     * @group set
     * @shortname set minutes
     * @drawable false
     * */
    setMinutes(inputs: Inputs.Dates.DateMinutesDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setMinutes(inputs.minutes);
        return dateCopy;
    }

    /**
     * Sets the seconds value in the Date object using local time.
     * @param inputs a date and the seconds
     * @returns date
     * @group set
     * @shortname set seconds
     * @drawable false
     */
    setSeconds(inputs: Inputs.Dates.DateSecondsDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setSeconds(inputs.seconds);
        return dateCopy;
    }

    /**
     * Sets the milliseconds value in the Date object using local time.
     * @param inputs a date and the milliseconds
     * @returns date
     * @group set
     * @shortname set milliseconds
     * @drawable false
     */
    setMilliseconds(inputs: Inputs.Dates.DateMillisecondsDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setMilliseconds(inputs.milliseconds);
        return dateCopy;
    }

    /**
     * Sets the date and time value in the Date object.
     * @param inputs a date and the time
     * @returns date
     * @group set
     * @shortname set time
     * @drawable false
     */
    setTime(inputs: Inputs.Dates.DateTimeDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setTime(inputs.time);
        return dateCopy;
    }


    /**
     * Sets the year value in the Date object using Universal Coordinated Time (UTC).
     * @param inputs a date and the year
     * @returns date
     * @group set
     * @shortname set utc year
     * @drawable false
     * */
    setUTCYear(inputs: Inputs.Dates.DateYearDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setUTCFullYear(inputs.year);
        return dateCopy;
    }

    /**
     * Sets the month value in the Date object using Universal Coordinated Time (UTC).
     * @param inputs a date and the month
     * @returns date
     * @group set
     * @shortname set utc month
     * @drawable false
     * */
    setUTCMonth(inputs: Inputs.Dates.DateMonthDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setUTCMonth(inputs.month);
        return dateCopy;
    }

    /**
     * Sets the numeric day of the month in the Date object using Universal Coordinated Time (UTC).
     * @param inputs a date and the day
     * @returns date
     * @group set
     * @shortname set utc day
     * @drawable false
     */
    setUTCDay(inputs: Inputs.Dates.DateDayDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setUTCDate(inputs.day);
        return dateCopy;
    }

    /**
     * Sets the hours value in the Date object using Universal Coordinated Time (UTC).
     * @param inputs a date and the hours
     * @returns date
     * @group set
     * @shortname set utc hours
     * @drawable false
     * */
    setUTCHours(inputs: Inputs.Dates.DateHoursDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setUTCHours(inputs.hours);
        return dateCopy;
    }

    /**
     * Sets the minutes value in the Date object using Universal Coordinated Time (UTC).
     * @param inputs a date and the minutes
     * @returns date
     * @group set
     * @shortname set utc minutes
     * @drawable false
     * */
    setUTCMinutes(inputs: Inputs.Dates.DateMinutesDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setUTCMinutes(inputs.minutes);
        return dateCopy;
    }

    /**
     * Sets the seconds value in the Date object using Universal Coordinated Time (UTC).
     * @param inputs a date and the seconds
     * @returns date
     * @group set
     * @shortname set utc seconds
     * @drawable false
     */
    setUTCSeconds(inputs: Inputs.Dates.DateSecondsDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setUTCSeconds(inputs.seconds);
        return dateCopy;
    }

    /**
     * Sets the milliseconds value in the Date object using Universal Coordinated Time (UTC).
     * @param inputs a date and the milliseconds
     * @returns date
     * @group set
     * @shortname set utc milliseconds
     * @drawable false
     */
    setUTCMilliseconds(inputs: Inputs.Dates.DateMillisecondsDto): Date {
        const dateCopy = new Date(inputs.date.getTime());
        dateCopy.setUTCMilliseconds(inputs.milliseconds);
        return dateCopy;
    }

}
