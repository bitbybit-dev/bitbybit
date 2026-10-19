import { describe, expect, it } from "vitest";
import { growsTheHeap, growthFailure, meanOfWindows } from "./heap-verdict";
import type { HeapRow } from "./heap-types";

const THRESHOLD = 8;

const rowOf = (name: string, bytesPerCall: number[]): HeapRow => ({ case: name, bytesPerCall, meanBytesPerCall: meanOfWindows(bytesPerCall), leaks: growsTheHeap(bytesPerCall, THRESHOLD), unexpected: 0 });

describe("the heap probe's verdict", () => {
    it.each([
        ["grows by more than the threshold in every window", [9, 12, 10], true],
        ["grows in one step that lifts its mean past the threshold", [0, 0, 30], true],
        ["grows by exactly the threshold in every window", [8, 8, 8], false],
        ["grows once early but too little on average", [20, 0, 0], false],
        ["shrinks", [-40, -4, 0], false],
    ])("should judge a case that %s by its mean bytes a call over the windows alone", (_name, bytesPerCall, leaks) => {
        // Act
        const grows = growsTheHeap(bytesPerCall, THRESHOLD);

        // Assert
        expect([grows, meanOfWindows(bytesPerCall) > THRESHOLD]).toEqual([leaks, leaks]);
    });

    it("should say a case grew by more than the threshold on average, with its windows, never that it grew in every window", () => {
        // Arrange
        const rows = [rowOf("a step", [0, 0, 30]), rowOf("a steady growth", [9, 12, 10])];

        // Act
        const message = growthFailure(rows, THRESHOLD);

        // Assert
        expect(message).toBe("2 case(s) grow the heap by more than 8 bytes a call on average over their windows: a step (10 on average; 0, 0, 30 by window); a steady growth (10.3 on average; 9, 12, 10 by window)");
    });
});
