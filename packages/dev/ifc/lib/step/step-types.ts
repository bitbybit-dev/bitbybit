/**
 * A reference to another entity of the same file, by its express id: `#12` in the file.
 * @beta
 */
export interface IfcReference {
    /**
     * The express id of the entity referred to.
     */
    readonly ref: number;
}

/**
 * An enumeration value, written between dots: `.ELEMENT.` in the file.
 * @beta
 */
export interface IfcEnumerationValue {
    /**
     * The value, in upper case.
     */
    readonly enum: string;
}

/**
 * A value carried with its defined type, as a select needs it: `IFCLABEL('Wall')` in the file.
 * @beta
 */
export interface IfcTypedValue {
    /**
     * The defined type, in the schema's spelling, such as `IfcLabel`.
     */
    readonly type: string;
    /**
     * The value itself.
     */
    readonly value: IfcValue;
}

/**
 * A binary value: its bits as hexadecimal digits, after a first digit that counts the unused
 * leading bits.
 * @beta
 */
export interface IfcBinaryValue {
    /**
     * The digits as the file writes them.
     */
    readonly binary: string;
}

/**
 * An attribute a subtype derives from its other attributes, written `*` in the file.
 * @beta
 */
export interface IfcDerivedValue {
    /**
     * Always true.
     */
    readonly derived: true;
}

/**
 * One attribute value of an IFC entity. `null` is an unset optional attribute (`$` in the file), a
 * number is a real or an integer as the schema says, and a list is an aggregate.
 * @beta
 */
export type IfcValue = null | boolean | number | string | IfcReference | IfcEnumerationValue | IfcTypedValue | IfcBinaryValue | IfcDerivedValue | readonly IfcValue[];

/**
 * One entity instance: its express id, its type in the schema's spelling, and its attribute values
 * in the order the schema lists them.
 * @beta
 */
export interface IfcEntity {
    /**
     * The express id, unique within the file.
     */
    readonly id: number;
    /**
     * The entity type, in the schema's spelling, such as `IfcWall`.
     */
    readonly type: string;
    /**
     * The attribute values, inherited attributes first, in the order a file writes them.
     */
    readonly args: readonly IfcValue[];
}

/**
 * The HEADER section of an IFC file: what the file declares about itself.
 * @beta
 */
export interface IfcFileHeader {
    /**
     * Free texts describing the file; IFC uses the first to declare the model view, such as
     * `ViewDefinition [ReferenceView_V1.2]`.
     */
    readonly description: readonly string[];
    /**
     * The conformance level of the file's encoding, `2;1` for files written by this library.
     */
    readonly implementationLevel: string;
    /**
     * The name of the file.
     */
    readonly name: string;
    /**
     * When the file was written, as ISO 8601 date and time.
     */
    readonly timeStamp: string;
    /**
     * The people who wrote the file.
     */
    readonly author: readonly string[];
    /**
     * The organizations of those people.
     */
    readonly organization: readonly string[];
    /**
     * The software that encoded the file.
     */
    readonly preprocessorVersion: string;
    /**
     * The software the data comes from.
     */
    readonly originatingSystem: string;
    /**
     * Who approved the file.
     */
    readonly authorization: string;
    /**
     * The schemas the data follows, such as `IFC4`.
     */
    readonly schemaIdentifiers: readonly string[];
}

export interface StepHeaderEntity {
    readonly type: string;
    readonly args: readonly IfcValue[];
    readonly text: string;
    readonly offset: number;
}

export interface StepIndex {
    readonly bytes: Uint8Array;
    readonly count: number;
    readonly ids: Int32Array;
    readonly typeCodes: Uint16Array;
    readonly typeTable: readonly string[];
    readonly argStart: Uint32Array;
    readonly argEnd: Uint32Array;
    readonly rowStart: Uint32Array;
    readonly rowEnd: Uint32Array;
    readonly header: readonly StepHeaderEntity[];
    readonly headerEnd: number;
    readonly sectionStarts: readonly number[];
}

export interface StepRows {
    count: number;
    ids: Int32Array;
    typeCodes: Uint16Array;
    readonly typeTable: string[];
    readonly codesOfHash: Map<number, number[]>;
    argStart: Uint32Array;
    argEnd: Uint32Array;
    rowStart: Uint32Array;
    rowEnd: Uint32Array;
}

export interface RowSpans {
    readonly rowStart: number;
    readonly argStart: number;
    readonly argEnd: number;
    readonly rowEnd: number;
}

export interface ParseFrame {
    readonly items: IfcValue[];
    readonly typeName: string | undefined;
}

export type TypeSpelling = (typeName: string) => string;
