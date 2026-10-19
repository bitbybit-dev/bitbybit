import type { HeapRow } from "./heap-types";

export function meanOfWindows(bytesPerCall: readonly number[]): number {
    return bytesPerCall.reduce((sum, bytes) => sum + bytes, 0) / bytesPerCall.length;
}

export function growsTheHeap(bytesPerCall: readonly number[], threshold: number): boolean {
    return meanOfWindows(bytesPerCall) > threshold;
}

export function growthFailure(rows: readonly HeapRow[], threshold: number): string {
    const described = rows.map(row => `${row.case} (${Number(row.meanBytesPerCall.toFixed(1))} on average; ${row.bytesPerCall.join(", ")} by window)`);
    return `${rows.length} case(s) grow the heap by more than ${threshold} bytes a call on average over their windows: ${described.join("; ")}`;
}
