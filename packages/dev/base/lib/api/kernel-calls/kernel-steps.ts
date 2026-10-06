/** How far a call that works in steps has come: `done` of `total` steps, such as the features of a design build. */
export interface KernelSteps {
    done: number;
    total: number;
}

let stepSink: ((steps: KernelSteps) => void) | undefined;

/**
 * Where `reportKernelSteps` sends the steps of the call running now; by default nowhere. A worker
 * sets it to share them with the thread that waits on the call, and a caller that runs the kernel
 * on its own thread may set it to show progress. Passing nothing stops the reports.
 * @param next - The function that receives each report, or undefined for none
 */
export function setKernelStepSink(next?: (steps: KernelSteps) => void): void {
    stepSink = next;
}

/**
 * Says how many steps of the call running now are done, out of how many, to the sink
 * `setKernelStepSink` set, if any. `total` may grow while the call runs, as when a build finds more
 * to make; `done` never passes it.
 * @param steps - The steps done and the steps there are
 */
export function reportKernelSteps(steps: KernelSteps): void {
    stepSink?.({ done: Math.min(steps.done, steps.total), total: steps.total });
}
