import type { Base } from "../../inputs";

/**
 * What an annotation is: a `dimension`, a geometric `tolerance` or a `datum`.
 * @beta
 */
export type DocumentAnnotationKind = "dimension" | "tolerance" | "datum";

/**
 * The annotations a document holds, as a STEP AP242 file shows them, and the views the file saved,
 * as `assembly.query.getDocumentAnnotations` reads them. Everything stands in the document's own
 * axes and units, where `assembly.query.getShapeFromLabel` and the document's meshes put its parts.
 * Experimental: the shape of this record may still change.
 * @beta
 */
export interface DocumentAnnotations {
    /** Every annotation, dimensions first, then tolerances, then datums; one of a part placed several times comes once for each placement. */
    annotations: DocumentAnnotation[];
    /** The views the file saved, each with the annotations it shows. */
    views: DocumentSavedView[];
    /** How many annotations and views were left out because the document held more than the kernel writes in one answer. */
    leftOut: DocumentAnnotationsLeftOut;
}

/**
 * One annotation as it is drawn: its label and what it is, the plane it stands in, and its
 * presentation as lines and filled letters, placed where the parts it belongs to stand. Lengths
 * are in the document's units; a number the file holds as infinite reads NaN.
 * @beta
 */
export interface DocumentAnnotation {
    /** The annotation's label in the document, the same as `assembly.query.getDocumentPmi` gives it. */
    label: string;
    /** Whether it is a dimension, a tolerance or a datum. */
    kind: DocumentAnnotationKind;
    /** Its type, such as `Size_Diameter` or `Flatness`, or a datum's letter; empty when the file names none. */
    type: string;
    /** The name of its presentation, empty when it has none. */
    name: string;
    /** The nominal value of a dimension or the value of a tolerance; 0 for a datum. */
    value: number;
    /** How many shapes it refers to; 0 for a note that stands by itself. */
    attached: number;
    /** The number of the product it belongs to, as the document's product tree numbers it; left out when it belongs to the model as a whole. */
    product?: number | undefined;
    /** Which placement of its product this copy stands at, counted from 0 in the order of the product tree; left out without a product. */
    instance?: number | undefined;
    /** The plane it stands in, when the file gives one. */
    plane?: DocumentAnnotationPlane | undefined;
    /** Where its text is attached, when the file gives that point. */
    textPoint?: Base.Point3 | undefined;
    /** Its drawn lines, each a polyline of points; empty without a presentation. */
    lines: Base.Point3[][];
    /** Its filled marks, letters above all, each a closed loop of points to fill under the even-odd rule, the first point not repeated. */
    fills: Base.Point3[][];
    /** The unit direction its filled marks face, the side they read from; given only with fills. */
    facing?: Base.Vector3 | undefined;
}

/**
 * The plane an annotation stands in: its `origin`, its unit `normal` and the unit `direction` of
 * its X axis.
 * @beta
 */
export interface DocumentAnnotationPlane {
    origin: Base.Point3;
    normal: Base.Vector3;
    direction: Base.Vector3;
}

/**
 * A view a file saved: its label and name, whether it projects in parallel, the `eye` point it looks
 * from, the unit `direction` it looks along and the unit `up` of its picture, the `width` and
 * `height` of its window in the document's units, and the labels of the annotations it shows.
 * @beta
 */
export interface DocumentSavedView {
    label: string;
    name: string;
    isParallel: boolean;
    eye: Base.Point3;
    direction: Base.Vector3;
    up: Base.Vector3;
    width: number;
    height: number;
    annotations: string[];
}

/**
 * How many annotations and how many views a document holds beyond what one answer carries.
 * @beta
 */
export interface DocumentAnnotationsLeftOut {
    annotations: number;
    views: number;
}
