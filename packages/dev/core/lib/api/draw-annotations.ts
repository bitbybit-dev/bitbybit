import { InputError } from "@bitbybit-dev/base";
import { filledLoopTriangles } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/loop-fill";
import type * as Inputs from "./inputs";
import type * as Models from "./models";
import type { AnnotationsDrawing, DocumentMeshing } from "./draw-annotations-types";

const EVEN_ODD = "evenOdd";
const POINT_SIZE = 3;
const LEAST_POINTS = 2;

/**
 * What the worker's `docToMesh` is asked for to draw an assembly document: its parts meshed with the
 * drawing's settings and turned by the drawing's `upAxis`, as `documentAnnotationsInputs` asks the
 * annotations to be, so the two stay together.
 * @param document - The document the OCCT kernel holds
 * @param meshing - The meshing settings of the drawing options
 * @returns The inputs of `docToMesh`
 * @beta
 */
export function documentMeshInputs<T>(document: T, meshing: DocumentMeshing): Inputs.OCCT.DocToMeshDto<T> {
    return {
        document,
        precision: meshing.precision,
        upAxis: meshing.upAxis,
        keepMeshData: meshing.keepMeshData,
        allowQualityDecrease: meshing.allowQualityDecrease,
        forceFaceDeflection: meshing.forceFaceDeflection,
        angularDeflection: meshing.angularDeflection,
        relativeDeflection: meshing.relativeDeflection,
    };
}

/**
 * What the worker's `assembly.query.getDocumentAnnotations` is asked for to draw a document's
 * annotations: read at the drawing's precision and turned as `documentMeshInputs` turns the parts.
 * @param document - The document the OCCT kernel holds
 * @param meshing - The meshing settings of the drawing options
 * @returns The inputs of `getDocumentAnnotations`
 * @beta
 */
export function documentAnnotationsInputs<T>(document: T, meshing: DocumentMeshing): Inputs.OCCT.DocumentAnnotationsDto<T> {
    return { document, deflection: meshing.precision, upAxis: meshing.upAxis };
}

/**
 * The annotations of a document a drawing shows: all of them, or with `view` named, those the
 * saved views of that name show.
 * @param annotations - The annotations and saved views `assembly.query.getDocumentAnnotations` gives
 * @param view - The name of a saved view, or undefined or empty for every annotation
 * @returns The annotations to draw, in the order the document lists them
 * @throws InputError when no saved view has the name, naming the views there are
 * @beta
 */
export function annotationsInView(annotations: Models.OCCT.DocumentAnnotations, view: string | undefined): Models.OCCT.DocumentAnnotation[] {
    if (view === undefined || view === "") {
        return annotations.annotations;
    }
    const named = annotations.views.filter(saved => saved.name === view);
    if (named.length === 0) {
        const names = annotations.views.map(saved => `"${saved.name}"`).join(", ");
        throw new InputError(`\`annotationsView\` is "${view}", which no saved view of the document is called; ${names === "" ? "it saves no views" : `its views are ${names}`}.`, "annotationsView");
    }
    const shown = new Set(named.flatMap(saved => saved.annotations));
    return annotations.annotations.filter(annotation => shown.has(annotation.label));
}

/**
 * The lines and the letters of annotations as a renderer draws them: every line as a polyline, and
 * the letters either filled, their loops triangulated under the even-odd rule so the inside of an `O`
 * stays open, or, with `filled` false, outlined, each loop drawn closed beside the lines.
 * @param annotations - The annotations to draw
 * @param filled - Whether the letters are filled or only outlined
 * @returns The polylines, and the triangles of the filled letters
 * @beta
 */
export function annotationsDrawingOf(annotations: readonly Models.OCCT.DocumentAnnotation[], filled: boolean): AnnotationsDrawing {
    const lines: Inputs.Base.Point3[][] = [];
    const positions: number[] = [];
    const indices: number[] = [];
    for (const annotation of annotations) {
        for (const line of annotation.lines) {
            if (line.length >= LEAST_POINTS) {
                lines.push(line);
            }
        }
        if (!filled) {
            for (const loop of annotation.fills) {
                if (loop.length >= LEAST_POINTS) {
                    lines.push([...loop, loop[0]!]);
                }
            }
            continue;
        }
        const first = positions.length / POINT_SIZE;
        let next = 0;
        const loops = annotation.fills.map(loop => loop.map(() => next++));
        const corners: number[] = [];
        for (const loop of annotation.fills) {
            for (const [x, y, z] of loop) {
                corners.push(x, y, z);
            }
        }
        const triangles = filledLoopTriangles(corners, loops, EVEN_ODD);
        if (triangles.length === 0) {
            continue;
        }
        for (const coordinate of corners) {
            positions.push(coordinate);
        }
        for (const corner of triangles) {
            indices.push(first + corner);
        }
    }
    return { lines, positions, indices };
}
