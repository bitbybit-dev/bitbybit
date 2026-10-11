import { reportKernelSteps } from "@bitbybit-dev/base";

/**
 * How far a build has come, in features, reported as kernel steps after each one. It expects the
 * features of every part document the build reaches, each document once; a document built again
 * for another set of values adds its features when that run starts.
 */
export class DesignProgress {
    private done = 0;
    private readonly started = new Set<object>();

    constructor(private expected: number) {
        reportKernelSteps({ done: 0, total: expected });
    }

    /** Notes a run of `document` starting, which adds its features when the document ran before. */
    starting(document: object, features: number): void {
        if (this.started.has(document)) {
            this.expected += features;
        }
        this.started.add(document);
    }

    /** Counts one more feature run, made or taken from the cache, and reports it. */
    stepped(): void {
        this.done++;
        reportKernelSteps({ done: this.done, total: Math.max(this.expected, this.done) });
    }
}
