import type { EdgeSignature } from "../analysis/signatures";

/**
 * One value `design.probeFillet` tried: the radius or distance, whether it built a valid solid, why
 * not when it did not, and how long the try took in milliseconds.
 */
export interface DesignProbeAttempt {
    value: number;
    builds: boolean;
    ms: number;
    message?: string;
}

/**
 * What `design.probeFillet` found for a fillet or chamfer feature, on its body as it is just before
 * the feature. `between` holds the faces each of the edge reference's two face references finds and
 * `edges` what each edge between them is like, after the filter and before any count is checked;
 * `count` is the count the reference expects. `value` is the radius or distance the document gives
 * and `builds` whether it makes a valid solid. `largest` is the largest value tried that built and
 * `smallestFailing` the smallest one above it that did not, so the largest that builds lies between
 * them, found to about 2 percent. `attempts` lists every value tried, in order, with its time: a value
 * that fails just past the largest can take OCCT far longer than one that builds. `messages` says what
 * stopped the probe short.
 */
export interface DesignFilletProbe {
    feature: string;
    type: "fillet" | "chamfer";
    between: [number[], number[]];
    edges: EdgeSignature[];
    count: number;
    value?: number;
    builds: boolean;
    largest?: number;
    smallestFailing?: number;
    attempts: DesignProbeAttempt[];
    messages: string[];
}
