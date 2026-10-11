import { describe, it, expect, afterEach } from "vitest";
import type { KernelSteps } from "./kernel-steps";
import { reportKernelSteps, setKernelStepSink } from "./kernel-steps";

describe("kernel steps", () => {
    afterEach(() => {
        setKernelStepSink();
    });

    it("should send each report to the sink that was set, never more done than there are steps", () => {
        // Arrange
        const reports: KernelSteps[] = [];
        setKernelStepSink(steps => reports.push(steps));

        // Act
        reportKernelSteps({ done: 1, total: 4 });
        reportKernelSteps({ done: 5, total: 4 });

        // Assert
        expect(reports).toEqual([{ done: 1, total: 4 }, { done: 4, total: 4 }]);
    });

    it("should send nothing once the sink is taken away, and nothing when none was set", () => {
        // Arrange
        const reports: KernelSteps[] = [];
        setKernelStepSink(steps => reports.push(steps));
        setKernelStepSink();

        // Act
        const report = (): void => reportKernelSteps({ done: 1, total: 2 });

        // Assert
        expect(report).not.toThrow();
        expect(reports).toEqual([]);
    });
});
