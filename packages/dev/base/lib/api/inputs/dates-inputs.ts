/* eslint-disable @typescript-eslint/no-namespace */

// tslint:disable-next-line: no-namespace
export namespace Dates {
    export class DateDto {
        constructor(date?: Date) {
            if (date !== undefined) { this.date = date; }
        }
        /**
         * The date
         * @default undefined
         */
        date: Date;
    }

    export class DateStringDto {
        constructor(dateString?: string) {
            if (dateString !== undefined) { this.dateString = dateString; }
        }
        /**
         * The date string
         * @default undefined
         */
        dateString: string;
    }

    export class DateSecondsDto {
        constructor(date?: Date, seconds?: number) {
            if (date !== undefined) { this.date = date; }
            if (seconds !== undefined) { this.seconds = seconds; }
        }
        /**
         * The date to update the seconds for
         * @default undefined
         */
        date: Date;
        /**
         * The seconds of the date
         * @default 30
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        seconds = 30;
    }

    export class DateDayDto {
        constructor(date?: Date, day?: number) {
            if (date !== undefined) { this.date = date; }
            if (day !== undefined) { this.day = day; }
        }
        /**
         * The date
         * @default undefined
         */
        date: Date;
        /**
         * The day of the date
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        day = 1;
    }

    export class DateYearDto {
        constructor(date?: Date, year?: number) {
            if (date !== undefined) { this.date = date; }
            if (year !== undefined) { this.year = year; }
        }
        /**
         * The date
         * @default undefined
         */
        date: Date;
        /**
         * The year of the date
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        year = 1;
    }

    export class DateMonthDto {
        constructor(date?: Date, month?: number) {
            if (date !== undefined) { this.date = date; }
            if (month !== undefined) { this.month = month; }
        }
        /**
         * The date
         * @default undefined
         */
        date: Date;
        /**
         * The month of the date
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        month = 1;
    }

    export class DateHoursDto {
        constructor(date?: Date, hours?: number) {
            if (date !== undefined) { this.date = date; }
            if (hours !== undefined) { this.hours = hours; }
        }
        /**
         * The date
         * @default undefined
         */
        date: Date;
        /**
         * The hours of the date
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        hours = 1;
    }

    export class DateMinutesDto {
        constructor(date?: Date, minutes?: number) {
            if (date !== undefined) { this.date = date; }
            if (minutes !== undefined) { this.minutes = minutes; }
        }
        /**
         * The date
         * @default undefined
         */
        date: Date;
        /**
         * The minutes of the date
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        minutes = 1;
    }

    export class DateMillisecondsDto {
        constructor(date?: Date, milliseconds?: number) {
            if (date !== undefined) { this.date = date; }
            if (milliseconds !== undefined) { this.milliseconds = milliseconds; }
        }
        /**
         * The date
         * @default undefined
         */
        date: Date;
        /**
         * The milliseconds of the date
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        milliseconds = 1;
    }

    export class DateTimeDto {
        constructor(date?: Date, time?: number) {
            if (date !== undefined) { this.date = date; }
            if (time !== undefined) { this.time = time; }
        }
        /**
         * The date
         * @default undefined
         */
        date: Date;
        /**
         * The time of the date
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        time = 1;
    }
    export class CreateFromUnixTimeStampDto {
        constructor(unixTimeStamp?: number) {
            if (unixTimeStamp !== undefined) { this.unixTimeStamp = unixTimeStamp; }
        }
        /**
         * The unix time stamp
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        unixTimeStamp = 1;
    }
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
         * The year of the date
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        year = 1;
        /**
         * The month of the date
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        month = 1;
        /**
         * The day of the month
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        day = 1;
        /**
         * The hours of the date
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        hours = 1;
        /**
         * The minutes of the date
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        minutes = 1;
        /**
         * The seconds of the date
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        seconds = 1;

        /**
         * The milliseconds of the date
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        milliseconds = 1;
    }

}
