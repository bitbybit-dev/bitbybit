/**
 * A compression spring with closed and ground ends, for
 * `engineering.mechanical.springs.compressionSpringPath`: its wire, its coils and its length.
 */
export class CompressionSpringPathDto {
    constructor(wireDiameter?: number, diameter?: number, activeCoils?: number, length?: number) {
        if (wireDiameter !== undefined) { this.wireDiameter = wireDiameter; }
        if (diameter !== undefined) { this.diameter = diameter; }
        if (activeCoils !== undefined) { this.activeCoils = activeCoils; }
        if (length !== undefined) { this.length = length; }
    }
    /**
     * The diameter of the wire, in model units.
     * @default 0.2
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.05
     */
    wireDiameter?: number | undefined = 0.2;
    /**
     * The outside diameter of the coils, in model units; more than three times `wireDiameter`.
     * @default 2
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.1
     */
    diameter?: number | undefined = 2;
    /**
     * How many coils spring, besides the closed coil at each end; it may be a fraction, and at
     * most 1000.
     * @default 6
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum 1000
     * @step 0.5
     */
    activeCoils?: number | undefined = 6;
    /**
     * The spring's length from one ground end to the other, free or compressed; at least the
     * solid length, where every coil touches the next.
     * @default 4
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.1
     */
    length?: number | undefined = 4;
}
