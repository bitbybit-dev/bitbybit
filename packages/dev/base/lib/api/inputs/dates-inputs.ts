/* eslint-disable @typescript-eslint/no-namespace */

// tslint:disable-next-line: no-namespace
/**
 * Parameters for date and time values: the date to act on, the unit and amount for arithmetic, and the
 * format and locale used when parsing or printing one.
 */
export namespace Dates {
    /**
     * One date for the reading and formatting methods of `dates`: `getYear`, `getMonth`,
     * `toISOString` and the rest.
     */
    export class DateDto {
        constructor(date?: Date) {
            if (date !== undefined) { this.date = date; }
        }
        /**
         * The date to read or format.
         * @default undefined
         */
        date!: Date;
    }

    /**
     * A date written as text for `dates.parseDate`.
     */
    export class DateStringDto {
        constructor(dateString?: string) {
            if (dateString !== undefined) { this.dateString = dateString; }
        }
        /**
         * The text to read, ideally in ISO 8601 form such as `2024-01-15T14:30:00Z`.
         * @default undefined
         */
        dateString!: string;
    }

    /**
     * A date and a new value for its seconds, for `dates.setSeconds` and `dates.setUTCSeconds`.
     */
    export class DateSecondsDto {
        constructor(date?: Date, seconds?: number) {
            if (date !== undefined) { this.date = date; }
            if (seconds !== undefined) { this.seconds = seconds; }
        }
        /**
         * The date to copy; it is not changed.
         * @default undefined
         */
        date!: Date;
        /**
         * The new seconds from 0 to 59; a value outside the range rolls the date over.
         * @default 30
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        seconds = 30;
    }

    /**
     * A date and a new value for its day, for `dates.setDayOfMonth` and `dates.setUTCDay`.
     */
    export class DateDayDto {
        constructor(date?: Date, day?: number) {
            if (date !== undefined) { this.date = date; }
            if (day !== undefined) { this.day = day; }
        }
        /**
         * The date to copy; it is not changed.
         * @default undefined
         */
        date!: Date;
        /**
         * The new day of the month, from 1 to 31; a value outside the range rolls the date over.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        day = 1;
    }

    /**
     * A date and a new value for its year, for `dates.setYear` and `dates.setUTCYear`.
     */
    export class DateYearDto {
        constructor(date?: Date, year?: number) {
            if (date !== undefined) { this.date = date; }
            if (year !== undefined) { this.year = year; }
        }
        /**
         * The date to copy; it is not changed.
         * @default undefined
         */
        date!: Date;
        /**
         * The new year as a full number such as 2024; a value outside the range rolls the date
         * over.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        year = 1;
    }

    /**
     * A date and a new value for its month, for `dates.setMonth` and `dates.setUTCMonth`.
     */
    export class DateMonthDto {
        constructor(date?: Date, month?: number) {
            if (date !== undefined) { this.date = date; }
            if (month !== undefined) { this.month = month; }
        }
        /**
         * The date to copy; it is not changed.
         * @default undefined
         */
        date!: Date;
        /**
         * The new month counting from 0: 0 is January, 11 December; a value outside the range rolls
         * the date over.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        month = 1;
    }

    /**
     * A date and a new value for its hours, for `dates.setHours` and `dates.setUTCHours`.
     */
    export class DateHoursDto {
        constructor(date?: Date, hours?: number) {
            if (date !== undefined) { this.date = date; }
            if (hours !== undefined) { this.hours = hours; }
        }
        /**
         * The date to copy; it is not changed.
         * @default undefined
         */
        date!: Date;
        /**
         * The new hours from 0 to 23; a value outside the range rolls the date over.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        hours = 1;
    }

    /**
     * A date and a new value for its minutes, for `dates.setMinutes` and `dates.setUTCMinutes`.
     */
    export class DateMinutesDto {
        constructor(date?: Date, minutes?: number) {
            if (date !== undefined) { this.date = date; }
            if (minutes !== undefined) { this.minutes = minutes; }
        }
        /**
         * The date to copy; it is not changed.
         * @default undefined
         */
        date!: Date;
        /**
         * The new minutes from 0 to 59; a value outside the range rolls the date over.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        minutes = 1;
    }

    /**
     * A date and a new value for its milliseconds, for `dates.setMilliseconds` and
     * `dates.setUTCMilliseconds`.
     */
    export class DateMillisecondsDto {
        constructor(date?: Date, milliseconds?: number) {
            if (date !== undefined) { this.date = date; }
            if (milliseconds !== undefined) { this.milliseconds = milliseconds; }
        }
        /**
         * The date to copy; it is not changed.
         * @default undefined
         */
        date!: Date;
        /**
         * The new milliseconds from 0 to 999; a value outside the range rolls the date over.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        milliseconds = 1;
    }

    /**
     * A date and a Unix timestamp for `dates.setTime`.
     */
    export class DateTimeDto {
        constructor(date?: Date, time?: number) {
            if (date !== undefined) { this.date = date; }
            if (time !== undefined) { this.time = time; }
        }
        /**
         * The date to copy; it is not changed.
         * @default undefined
         */
        date!: Date;
        /**
         * The new moment as milliseconds since 1 January 1970 at 00:00 UTC.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        time = 1;
    }
    /**
     * A Unix timestamp for `dates.createFromUnixTimeStamp`, which turns it into a date.
     */
    export class CreateFromUnixTimeStampDto {
        constructor(unixTimeStamp?: number) {
            if (unixTimeStamp !== undefined) { this.unixTimeStamp = unixTimeStamp; }
        }
        /**
         * Milliseconds since 1 January 1970 at 00:00 UTC.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        unixTimeStamp = 1;
    }
    /**
     * The parts of a date for `dates.createDate` and `dates.createDateUTC`; a part outside its
     * range rolls the date over.
     */
    export class CreateDateDto {
        constructor(year?: number, month?: number, day?: number, hours?: number, minutes?: number, seconds?: number, milliseconds?: number) {
            if (year !== undefined) { this.year = year; }
            if (month !== undefined) { this.month = month; }
            if (day !== undefined) { this.day = day; }
            if (hours !== undefined) { this.hours = hours; }
            if (minutes !== undefined) { this.minutes = minutes; }
            if (seconds !== undefined) { this.seconds = seconds; }
            if (milliseconds !== undefined) { this.milliseconds = milliseconds; }
        }
        /**
         * The full year, such as 2024.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        year = 1;
        /**
         * The month counting from 0: 0 is January, 11 December.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        month = 1;
        /**
         * The day of the month, from 1 to 31.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        day = 1;
        /**
         * The hour, from 0 to 23.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        hours = 1;
        /**
         * The minutes, from 0 to 59.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        minutes = 1;
        /**
         * The seconds, from 0 to 59.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        seconds = 1;

        /**
         * The milliseconds, from 0 to 999.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        milliseconds = 1;
    }

}
