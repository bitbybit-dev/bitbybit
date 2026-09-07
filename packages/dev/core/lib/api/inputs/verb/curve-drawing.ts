// A fragment of the Verb inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../verb-inputs.ts. Edit here, then regenerate.

export class DrawCurveDto<T> {
    /**
     * Provide options without default values
     */
    constructor(curve?: any, opacity?: number, colours?: string | string[], size?: number, updatable?: boolean, curveMesh?: T) {
        if (curve !== undefined) { this.curve = curve; }
        if (opacity !== undefined) { this.opacity = opacity; }
        if (colours !== undefined) { this.colours = colours; }
        if (size !== undefined) { this.size = size; }
        if (updatable !== undefined) { this.updatable = updatable; }
        if (curveMesh !== undefined) { this.curveMesh = curveMesh; }
    }
    /**
     * Nurbs curve
     */
    curve: any;
    /**
     * Value between 0 and 1
     */
    opacity = 1;
    /**
     * Hex colour string
     */
    colours: string | string[] = "#444444";
    /**
     * Width of the polyline
     */
    size = 3;
    /**
     * Indicates wether the position of this curve will change in time
     */
    updatable = false;
    /**
     * Curve mesh variable in case it already exists and needs updating
     */
    curveMesh?: T | undefined;
}
