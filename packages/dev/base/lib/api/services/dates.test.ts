import { Dates } from "./dates"; // Adjust path as needed

let dates: Dates;

beforeAll(() => {
    dates = new Dates();
});

// Define some fixed dates for consistent testing
// Note: Month is 0-indexed (0 = January, 11 = December)
// Use specific UTC values to avoid local timezone ambiguities where possible
const testTimestamp = 1678881600000; // Represents: Wed Mar 15 2023 12:00:00 GMT+0000 (UTC)
const testDateUTC = new Date(testTimestamp); // March 15, 2023 12:00:00 UTC

// A date specified with local components - its UTC representation depends on test environment timezone
const localYear = 2024;
const localMonth = 0; // January
const localDay = 1;
const localHours = 10;
const localMinutes = 30;
const localSeconds = 15;
const localMilliseconds = 500;
const testDateLocal = new Date(localYear, localMonth, localDay, localHours, localMinutes, localSeconds, localMilliseconds);
// Note: Weekday depends on the date and timezone, e.g., Jan 1, 2024 was a Monday (1)

describe("Dates Class Unit Tests", () => {

    // --- Convert Methods ---
    describe("Convert Methods", () => {
        it("toDateString should return date part as string", () => {
            // Format is implementation-dependent, e.g., "Wed Mar 15 2023"
            const result = dates.toDateString({ date: testDateUTC });
            // Check for presence of key components
            expect(result).toMatch(/Mar/); // Contains month abbreviation
            expect(result).toMatch(/15/);  // Contains day
            expect(result).toMatch(/2023/); // Contains year
            expect(result).toMatch(/Wed/); // Contains weekday abbreviation
        });

        it("toISOString should return date in ISO 8601 format", () => {
            const result = dates.toISOString({ date: testDateUTC });
            expect(result).toBe("2023-03-15T12:00:00.000Z");
        });

        it("toJSON should return date in ISO 8601 format", () => {
            // toJSON typically delegates to toISOString
            const result = dates.toJSON({ date: testDateUTC });
            expect(result).toBe("2023-03-15T12:00:00.000Z");
        });

        it("toString should return implementation-dependent string with timezone", () => {
            const result = dates.toString({ date: testDateLocal });
            // Example: "Mon Jan 01 2024 10:30:15 GMT+XXXX (Your Timezone Name)"
            expect(result).toContain("Jan");
            expect(result).toContain("01");
            expect(result).toContain("2024");
            expect(result).toContain("10:30:15");
            expect(result).toContain("GMT"); // Should indicate timezone offset
        });

        it("toTimeString should return time part as string with timezone", () => {
            const result = dates.toTimeString({ date: testDateLocal });
            // Example: "10:30:15 GMT+XXXX (Your Timezone Name)"
            expect(result).toContain("10:30:15");
            expect(result).toContain("GMT");
        });

        it("toUTCString should return date string in UTC format", () => {
            const result = dates.toUTCString({ date: testDateUTC });
            // Standard format: "Wed, 15 Mar 2023 12:00:00 GMT"
            expect(result).toBe("Wed, 15 Mar 2023 12:00:00 GMT");
        });
    });

    // --- Create Methods ---
    describe("Create Methods", () => {
        // For testing 'now', we use fake timers
        beforeEach(() => {
            jest.useFakeTimers();
        });
        afterEach(() => {
            jest.useRealTimers();
        });

        it("now should return the current date and time", () => {
            const specificTime = 1700000000000; // An arbitrary timestamp
            jest.setSystemTime(specificTime);
            const result = dates.now();
            expect(result).toBeInstanceOf(Date);
            expect(result.getTime()).toBe(specificTime);
        });

        it("createDate should create a date using local time components", () => {
            const result = dates.createDate({
                year: localYear, month: localMonth, day: localDay,
                hours: localHours, minutes: localMinutes, seconds: localSeconds, milliseconds: localMilliseconds
            });
            expect(result).toEqual(testDateLocal); // Compare with the pre-constructed local date
            // Verify local components directly
            expect(result.getFullYear()).toBe(localYear);
            expect(result.getMonth()).toBe(localMonth);
            expect(result.getDate()).toBe(localDay);
            expect(result.getHours()).toBe(localHours);
            // ... and so on
        });

        it("createDate should handle month overflow", () => {
            // Month 12 should become January of the next year
            const result = dates.createDate({ year: 2023, month: 12, day: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
            expect(result.getFullYear()).toBe(2024);
            expect(result.getMonth()).toBe(0); // January
            expect(result.getDate()).toBe(1);
        });

        it("createDateUTC should create a date using UTC components", () => {
            const result = dates.createDateUTC({
                year: 2023, month: 2, day: 15, // March 15th
                hours: 12, minutes: 0, seconds: 0, milliseconds: 0
            });
            // Compare its time value to the known UTC date
            expect(result.getTime()).toBe(testDateUTC.getTime());
            // Verify UTC components directly
            expect(result.getUTCFullYear()).toBe(2023);
            expect(result.getUTCMonth()).toBe(2); // March
            expect(result.getUTCDate()).toBe(15);
            expect(result.getUTCHours()).toBe(12);
        });

        it("createFromUnixTimeStamp should create a date from milliseconds since epoch", () => {
            const timestamp = 0; // Epoch
            const result = dates.createFromUnixTimeStamp({ unixTimeStamp: timestamp });
            expect(result.getTime()).toBe(timestamp);
            expect(result.toUTCString()).toBe("Thu, 01 Jan 1970 00:00:00 GMT");

            const result2 = dates.createFromUnixTimeStamp({ unixTimeStamp: testTimestamp });
            expect(result2.getTime()).toBe(testTimestamp);
        });
    });

    // --- Parse Methods ---
    describe("Parse Methods", () => {
        it("parseDate should parse a valid ISO date string", () => {
            const dateStr = "2023-03-15T12:00:00.000Z";
            const result = dates.parseDate({ dateString: dateStr });
            expect(result).toBe(testTimestamp);
        });

        it("parseDate should parse other common date string formats (may be implementation-dependent)", () => {
            const dateStr1 = "15 Mar 2023 12:00:00 GMT";
            const result1 = dates.parseDate({ dateString: dateStr1 });
            expect(result1).toBe(testTimestamp);

            // Parsing non-standard formats without explicit timezone might vary!
            // const dateStr2 = "01/01/2024"; // Interpretation depends on locale/implementation
            // const result2 = dates.parseDate({ dateString: dateStr2 });
            // // Need to know expected timestamp for this format in the test environment
            // expect(result2).toBe(/* expected timestamp for Jan 1 2024 local time */);
        });

        it("parseDate should return NaN for invalid date string", () => {
            const dateStr = "invalid date string";
            const result = dates.parseDate({ dateString: dateStr });
            expect(result).toBeNaN();
        });
    });

    // --- Get Methods (Local Time) ---
    describe("Get Methods (Local)", () => {
        const input = { date: testDateLocal };

        it("getDayOfMonth should return the day of the month", () => {
            expect(dates.getDayOfMonth(input)).toBe(localDay); // 1
        });
        it("getWeekday should return the day of the week (0=Sun, 6=Sat)", () => {
            expect(dates.getWeekday(input)).toBe(testDateLocal.getDay()); // e.g., 1 for Monday Jan 1 2024
        });
        it("getYear should return the full year", () => {
            expect(dates.getYear(input)).toBe(localYear); // 2024
        });
        it("getMonth should return the month (0-indexed)", () => {
            expect(dates.getMonth(input)).toBe(localMonth); // 0
        });
        it("getHours should return the hours (0-23)", () => {
            expect(dates.getHours(input)).toBe(localHours); // 10
        });
        it("getMinutes should return the minutes (0-59)", () => {
            expect(dates.getMinutes(input)).toBe(localMinutes); // 30
        });
        it("getSeconds should return the seconds (0-59)", () => {
            expect(dates.getSeconds(input)).toBe(localSeconds); // 15
        });
        it("getMilliseconds should return the milliseconds (0-999)", () => {
            expect(dates.getMilliseconds(input)).toBe(localMilliseconds); // 500
        });
        it("getTime should return milliseconds since epoch", () => {
            expect(dates.getTime(input)).toBe(testDateLocal.getTime());
        });
    });

    // --- Get Methods (UTC Time) ---
    describe("Get Methods (UTC)", () => {
        const input = { date: testDateUTC }; // Use the UTC-defined date

        it("getUTCYear should return the UTC year", () => {
            expect(dates.getUTCYear(input)).toBe(2023);
        });
        it("getUTCMonth should return the UTC month (0-indexed)", () => {
            expect(dates.getUTCMonth(input)).toBe(2); // March
        });
        it("getUTCDay should return the UTC day of the month", () => {
            expect(dates.getUTCDay(input)).toBe(15);
        });
        // Note: getUTCDay() is day of *month* in JS, not day of week.
        // There isn't a direct getUTCWeekday equivalent, but getDay() often works as intended
        // if the Date object itself holds the correct UTC time value.

        it("getUTCHours should return the UTC hours", () => {
            expect(dates.getUTCHours(input)).toBe(12);
        });
        it("getUTCMinutes should return the UTC minutes", () => {
            expect(dates.getUTCMinutes(input)).toBe(0);
        });
        it("getUTCSeconds should return the UTC seconds", () => {
            expect(dates.getUTCSeconds(input)).toBe(0);
        });
        it("getUTCMilliseconds should return the UTC milliseconds", () => {
            expect(dates.getUTCMilliseconds(input)).toBe(0);
        });
    });
    // --- Set Methods (UTC Time) ---
    describe("Set Methods (UTC)", () => {
        let originalDate: Date;
        const originalTimestamp = testDateUTC.getTime(); // Store the initial timestamp

        beforeEach(() => {
            originalDate = new Date(originalTimestamp); // Use the fixed timestamp
        });

        // Helper remains the same - ensures the original date object passed in wasn't modified
        const expectOriginalUnchanged = () => {
            expect(originalDate.getTime()).toBe(originalTimestamp);
        };

        it("setUTCYear should set the UTC year and return a new date instance", () => {
            const newYear = 2022;
            const result = dates.setUTCYear({ date: originalDate, year: newYear });
            expect(result).toBeInstanceOf(Date);
            expect(result.getUTCFullYear()).toBe(newYear);
            expect(result).not.toBe(originalDate); // Check if it's a new object instance
            // Timestamp MUST change when year changes
            expect(result.getTime()).not.toBe(originalTimestamp);
            expectOriginalUnchanged();
        });
        it("setUTCMonth should set the UTC month and return a new date instance", () => {
            const newMonth = 11; // December
            const result = dates.setUTCMonth({ date: originalDate, month: newMonth });
            expect(result).toBeInstanceOf(Date);
            expect(result.getUTCMonth()).toBe(newMonth);
            expect(result).not.toBe(originalDate);
            // Timestamp MUST change when month changes (unless it coincidentally lands on same time)
            expect(result.getTime()).not.toBe(originalTimestamp);
            expectOriginalUnchanged();
        });
        it("setUTCDay should set the UTC day and return a new date instance", () => {
            const newDay = 25;
            const result = dates.setUTCDay({ date: originalDate, day: newDay });
            expect(result).toBeInstanceOf(Date);
            expect(result.getUTCDate()).toBe(newDay);
            expect(result).not.toBe(originalDate);
            // Timestamp MUST change when day changes
            expect(result.getTime()).not.toBe(originalTimestamp);
            expectOriginalUnchanged();
        });
        it("setUTCHours should set the UTC hours and return a new date instance", () => {
            const newHours = 0; // Original was 12
            const result = dates.setUTCHours({ date: originalDate, hours: newHours });
            expect(result).toBeInstanceOf(Date);
            expect(result.getUTCHours()).toBe(newHours);
            expect(result).not.toBe(originalDate);
            // Timestamp MUST change when hours change
            expect(result.getTime()).not.toBe(originalTimestamp);
            expectOriginalUnchanged();
        });
        it("setUTCMinutes should set the UTC minutes and return a new date instance", () => {
            const newMinutes = 30; // Original was 0
            const result = dates.setUTCMinutes({ date: originalDate, minutes: newMinutes });
            expect(result).toBeInstanceOf(Date);
            expect(result.getUTCMinutes()).toBe(newMinutes);
            expect(result).not.toBe(originalDate);
            // Timestamp MUST change when minutes change
            expect(result.getTime()).not.toBe(originalTimestamp);
            expectOriginalUnchanged();
        });
        it("setUTCSeconds should set the UTC seconds and return a new date instance", () => {
            const newSeconds = 45; // Original was 0
            const result = dates.setUTCSeconds({ date: originalDate, seconds: newSeconds });
            expect(result).toBeInstanceOf(Date);
            expect(result.getUTCSeconds()).toBe(newSeconds);
            expect(result).not.toBe(originalDate);
            // Timestamp MUST change when seconds change
            expect(result.getTime()).not.toBe(originalTimestamp);
            expectOriginalUnchanged();
        });
        it("setUTCMilliseconds should set the UTC milliseconds and return a new date instance", () => {
            const newMs = 123; // Original was 0
            const result = dates.setUTCMilliseconds({ date: originalDate, milliseconds: newMs });
            expect(result).toBeInstanceOf(Date);
            expect(result.getUTCMilliseconds()).toBe(newMs);
            expect(result).not.toBe(originalDate);
            // Timestamp MUST change when ms change
            expect(result.getTime()).not.toBe(originalTimestamp); // This specific check confirms timestamp changed
            expectOriginalUnchanged();
        });
    });

    // Apply the same logic fix to the Set Methods (Local) block
    describe("Set Methods (Local)", () => {
        let originalDate: Date;
        const originalTimestamp = testDateLocal.getTime(); // Store the initial timestamp

        beforeEach(() => {
            originalDate = new Date(originalTimestamp);
        });
        const expectOriginalUnchanged = () => {
            expect(originalDate.getTime()).toBe(originalTimestamp);
        };

        it("setYear should set the year and return a new date instance", () => {
            const newYear = 2025;
            const result = dates.setYear({ date: originalDate, year: newYear });
            expect(result).toBeInstanceOf(Date);
            expect(result.getFullYear()).toBe(newYear);
            expect(result).not.toBe(originalDate);
            expect(result.getTime()).not.toBe(originalTimestamp);
            expectOriginalUnchanged();
        });
        it("setMonth should set the month and return a new date instance", () => {
            const newMonth = 5; // June
            const result = dates.setMonth({ date: originalDate, month: newMonth });
            expect(result).toBeInstanceOf(Date);
            expect(result.getMonth()).toBe(newMonth);
            expect(result).not.toBe(originalDate);
            expect(result.getTime()).not.toBe(originalTimestamp);
            expectOriginalUnchanged();
        });
        it("setMonth should handle overflow and return a new date instance", () => {
            const newMonth = 12; // Should become Jan of next year
            const result = dates.setMonth({ date: originalDate, month: newMonth });
            expect(result).toBeInstanceOf(Date);
            expect(result.getMonth()).toBe(0);
            expect(result.getFullYear()).toBe(originalDate.getFullYear() + 1);
            expect(result).not.toBe(originalDate);
            expect(result.getTime()).not.toBe(originalTimestamp);
            expectOriginalUnchanged();
        });
        it("setDayOfMonth should set the day and return a new date instance", () => {
            const newDay = 15;
            const result = dates.setDayOfMonth({ date: originalDate, day: newDay });
            expect(result).toBeInstanceOf(Date);
            expect(result.getDate()).toBe(newDay);
            expect(result).not.toBe(originalDate);
            expect(result.getTime()).not.toBe(originalTimestamp);
            expectOriginalUnchanged();
        });
        it("setHours should set the hours and return a new date instance", () => {
            const newHours = 23; // Original was 10
            const result = dates.setHours({ date: originalDate, hours: newHours });
            expect(result).toBeInstanceOf(Date);
            expect(result.getHours()).toBe(newHours);
            expect(result).not.toBe(originalDate);
            expect(result.getTime()).not.toBe(originalTimestamp);
            expectOriginalUnchanged();
        });
        it("setMinutes should set the minutes and return a new date instance", () => {
            const newMinutes = 59; // Original was 30
            const result = dates.setMinutes({ date: originalDate, minutes: newMinutes });
            expect(result).toBeInstanceOf(Date);
            expect(result.getMinutes()).toBe(newMinutes);
            expect(result).not.toBe(originalDate);
            expect(result.getTime()).not.toBe(originalTimestamp);
            expectOriginalUnchanged();
        });
        it("setSeconds should set the seconds and return a new date instance", () => {
            const newSeconds = 1; // Original was 15
            const result = dates.setSeconds({ date: originalDate, seconds: newSeconds });
            expect(result).toBeInstanceOf(Date);
            expect(result.getSeconds()).toBe(newSeconds);
            expect(result).not.toBe(originalDate);
            expect(result.getTime()).not.toBe(originalTimestamp);
            expectOriginalUnchanged();
        });
        it("setMilliseconds should set the milliseconds and return a new date instance", () => {
            const newMs = 999; // Original was 500
            const result = dates.setMilliseconds({ date: originalDate, milliseconds: newMs });
            expect(result).toBeInstanceOf(Date);
            expect(result.getMilliseconds()).toBe(newMs);
            expect(result).not.toBe(originalDate);
            // Check the timestamp DID change
            expect(result.getTime()).not.toBe(originalTimestamp);
            expectOriginalUnchanged();
        });
        it("setTime should set the time value and return a new date instance", () => {
            const newTime = testTimestamp; // Use the other test date's timestamp
            const result = dates.setTime({ date: originalDate, time: newTime });
            expect(result).toBeInstanceOf(Date);
            expect(result.getTime()).toBe(newTime);
            expect(result).not.toBe(originalDate); // Different instance
            expectOriginalUnchanged();
        });
    });

}); // End describe('Dates Class Unit Tests')