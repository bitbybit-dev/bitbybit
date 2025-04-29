import * as Inputs from "../inputs";

/**
 * Contains various date methods.
 */
export class Dates {

    /**
     * Returns a date as a string value.
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
     * Returns a date as a string value in ISO format.
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
     * Returns a date as a string value in JSON format.
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
     * Returns a string representation of a date. The format of the string depends on the locale.
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
     * Returns a time as a string value.
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
     * Returns a date converted to a string using Universal Coordinated Time (UTC).
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
     * Returns the current date and time.
     * @returns date
     * @group create
     * @shortname now
     * @drawable false
     */
    now(): Date {
        return new Date(Date.now());
    }

    /**
     * Creates a new date object using the provided date params.
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
     * Returns the number of milliseconds between midnight, January 1, 1970 Universal Coordinated Time (UTC) (or GMT) and the specified date.
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
     * Creates a new date object using the provided unix time stamp.
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
     * Parses a string containing a date, and returns the number of milliseconds between that date and midnight, January 1, 1970.
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
     * Gets the day-of-the-month, using local time.
     * @returns date
     * @group get
     * @shortname get date of month
     * @drawable false
     */
    getDayOfMonth(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getDate();
    }

    /**
     * Gets the day of the week, using local time.
     * @returns day
     * @group get
     * @shortname get weekday
     * @drawable false
     */
    getWeekday(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getDay();
    }

    /**
     * Gets the year, using local time.
     * @returns year
     * @group get
     * @shortname get year
     * @drawable false
     */
    getYear(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getFullYear();
    }

    /**
     * Gets the month, using local time.
     * @returns month
     * @group get
     * @shortname get month
     * @drawable false
     */
    getMonth(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getMonth();
    }

    /**
     * Gets the hours in a date, using local time.
     * @returns hours
     * @group get
     * @shortname get hours
     * @drawable false
     */
    getHours(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getHours();
    }

    /**
     * Gets the minutes of a Date object, using local time.
     * @returns minutes
     * @group get
     * @shortname get minutes
     * @drawable false
     */
    getMinutes(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getMinutes();
    }

    /**
     * Gets the seconds of a Date object, using local time.
     * @returns seconds
     * @group get
     * @shortname get seconds
     * @drawable false
     */
    getSeconds(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getSeconds();
    }

    /**
     * Gets the milliseconds of a Date, using local time.
     * @returns milliseconds
     * @group get
     * @shortname get milliseconds
     * @drawable false
     */
    getMilliseconds(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getMilliseconds();
    }

    /**
     * Returns the stored time value in milliseconds since midnight, January 1, 1970 UTC.
     * @returns time
     * @group get
     * @shortname get time
     * @drawable false
     */
    getTime(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getTime();
    }

    /**
     * Gets the year using Universal Coordinated Time (UTC).
     * @returns year
     * @group get
     * @shortname get utc year
     * @drawable false
     */
    getUTCYear(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getUTCFullYear();
    }

    /**
     * Gets the month of a Date object using Universal Coordinated Time (UTC).
     * @returns month
     * @group get
     * @shortname get utc month
     * @drawable false
     */
    getUTCMonth(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getUTCMonth();
    }

    /**
     * Gets the day-of-the-month, using Universal Coordinated Time (UTC).
     * @returns day
     * @group get
     * @shortname get utc day
     * @drawable false
     */
    getUTCDay(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getUTCDate();
    }

    /**
     * Gets the hours value in a Date object using Universal Coordinated Time (UTC).
     * @returns hours
     * @group get
     * @shortname get utc hours
     * @drawable false
     */
    getUTCHours(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getUTCHours();
    }

    /**
     * Gets the minutes of a Date object using Universal Coordinated Time (UTC).
     * @returns minutes
     * @group get
     * @shortname get utc minutes
     * @drawable false
     */
    getUTCMinutes(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getUTCMinutes();
    }

    /**
     * Gets the seconds of a Date object using Universal Coordinated Time (UTC).
     * @returns seconds
     * @group get
     * @shortname get utc seconds
     * @drawable false
     */
    getUTCSeconds(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getUTCSeconds();
    }

    /**
     * Gets the milliseconds of a Date object using Universal Coordinated Time (UTC).
     * @returns milliseconds
     * @group get
     * @shortname get utc milliseconds
     * @drawable false
     */
    getUTCMilliseconds(inputs: Inputs.Dates.DateDto): number {
        return inputs.date.getUTCMilliseconds();
    }

    /**
     * Sets the year of the Date object using local time.
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
     * Sets the month value in the Date object using local time.
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
     * Sets the numeric day-of-the-month value of the Date object using local time.
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
