/**
 * The two texts of an OBJ export: `obj`, the mesh, and `mtl`, the material library its `mtllib`
 * line names, empty when the shapes carry no colours or materials.
 */
export interface ObjFiles {
    obj: string;
    mtl: string;
}

/**
 * The product manufacturing information a document holds, as a STEP AP242 file brings it along: its
 * dimensions, its geometric tolerances and the datums the tolerances refer to. Each names the shapes
 * it applies to by their labels, which `assembly.query.getShapeFromLabel` reads.
 */
export interface DocumentPmi {
    dimensions: PmiDimension[];
    tolerances: PmiTolerance[];
    datums: PmiDatum[];
}

/**
 * A dimension: its label, its kind, such as `Size_Diameter` or `Location_LinearDistance`, its name,
 * and its nominal `value`. `upperTolerance` and `lowerTolerance`, both positive, say how far above
 * and below the value it may lie; `lowerBound` and `upperBound` give a range instead, whose middle is
 * the value. `shapes` and `otherShapes` hold the labels of the shapes it measures from and to.
 * Lengths are in the document's length unit and angles in degrees; a value that is not finite reads
 * NaN.
 */
export interface PmiDimension {
    label: string;
    type: string;
    name: string;
    value: number;
    upperTolerance?: number | undefined;
    lowerTolerance?: number | undefined;
    lowerBound?: number | undefined;
    upperBound?: number | undefined;
    shapes: string[];
    otherShapes: string[];
}

/**
 * A geometric tolerance: its label, its kind, such as `Flatness` or `Position`, its name, its value
 * in the document's length unit (NaN when not finite), the labels of the shapes it applies to, and
 * the labels of the datums it refers to, which `datums` of the same `DocumentPmi` describes.
 */
export interface PmiTolerance {
    label: string;
    type: string;
    name: string;
    value: number;
    shapes: string[];
    datums: string[];
}

/**
 * A datum: its label, its name, such as `A`, and the labels of the shapes it is taken from.
 */
export interface PmiDatum {
    label: string;
    name: string;
    shapes: string[];
}
