/**
 * A file that does not follow the ISO 10303-21 encoding, holds an entity id twice, names a schema
 * this library does not read or an entity type its schema does not define, with the byte where the
 * problem is. A row is decoded when it is first asked for, so a broken row raises it then.
 * @beta
 */
export class StepSyntaxError extends Error {
    /**
     * The offset of the byte at which the problem was found.
     */
    readonly offset: number;

    /**
     * Makes the error.
     * @param message - What is wrong
     * @param offset - The offset of the byte at which the problem was found
     */
    constructor(message: string, offset: number) {
        super(`${message} at byte ${offset}`);
        this.name = "StepSyntaxError";
        this.offset = offset;
    }
}

/**
 * An attribute value that its schema type does not accept, with the entity and attribute it was
 * given for.
 * @beta
 */
export class IfcValueError extends Error {
    /**
     * Where the value was given, such as `#12 IfcWall.Name` or `#12 IfcPolyline.Points[3]`.
     */
    readonly path: string;

    /**
     * Makes the error.
     * @param path - Where the value was given
     * @param message - What is wrong with it
     */
    constructor(path: string, message: string) {
        super(`${path}: ${message}`);
        this.name = "IfcValueError";
        this.path = path;
    }
}

export class ValueProblem extends Error {
    readonly segments: string[] = [];

    within(segment: string): ValueProblem {
        this.segments.unshift(segment);
        return this;
    }
}
