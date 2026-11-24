import { resolveDto } from "@bitbybit-dev/base";
import type { DtoConstructor } from "@bitbybit-dev/base";
import * as Inputs from "./inputs";
import type { DeclaringEvery, DocumentDrawing, DocumentOptionClasses, DocumentPieces, DrawAnnotationsPiece, DrawDocumentPieces, DrawEdgesPiece, DrawHatchedSectionPieces, DrawMeshingPiece, DrawnEdges, HatchedSectionDrawing, HatchedSectionOptionClasses, HatchedSectionPieces } from "./draw-document-options-types";

/**
 * The color of the faces of a part the document gives none, and of their backs: silver, a light
 * neutral grey that reads as unpainted metal under any light and keeps black edges and blue
 * annotations clear against it.
 * @beta
 */
export const DOCUMENT_PART_COLOUR = "#c0c0c0";

const resolved = <T extends object>(Dto: unknown, given: unknown): T => resolveDto(Dto as DtoConstructor<T>, given);

function edgesOf(drawEdges: boolean, edges: unknown, Edges: unknown): DrawnEdges {
    const piece = resolved<DrawEdgesPiece>(Edges, edges);
    return { drawEdges, edgeColour: piece.edgeColour, edgeWidth: piece.edgeWidth, edgeOpacity: piece.edgeOpacity };
}

/**
 * Lays a renderer's document drawing options out flat over its shape options, so the renderer
 * draws a document with the code that draws a shape: the pieces left out take their defaults, the
 * faces show the document's own colors and transparency over `DOCUMENT_PART_COLOUR`, the back of
 * each face shows the color and transparency of its face, and nothing a document has no use for (a
 * face color or material, iso curves, a surface analysis, indexes, vertices, arrows) is drawn. A
 * saved view given as null draws every annotation, as one left out does.
 * @param shape - The renderer's shape options with every default filled, laid under the result
 * @param options - The document drawing options as the caller gave them, or undefined for the defaults
 * @param classes - The renderer's document options class and its pieces' classes, as its `Inputs.Draw` holds them
 * @returns A new object holding the shape options with the document's settings over them
 * @throws InputError when a deprecated up-axis flag asks for another turn than `upAxis`
 * @beta
 */
export function documentDrawOptionsOf<S extends object, C extends DocumentOptionClasses>(shape: S, options: unknown, classes: C & DeclaringEvery<C, DocumentPieces>): S & DocumentDrawing {
    const document = resolved<DrawDocumentPieces>(classes.DrawOcctDocumentOptions, options);
    const meshing = resolved<DrawMeshingPiece>(classes.DrawMeshingOptions, document.meshing);
    const annotations = resolved<DrawAnnotationsPiece>(classes.DrawAnnotationsOptions, document.annotations);
    const drawing: DocumentDrawing = {
        upAxis: document.upAxis,
        precision: meshing.precision,
        angularDeflection: meshing.angularDeflection,
        relativeDeflection: meshing.relativeDeflection,
        forceFaceDeflection: meshing.forceFaceDeflection,
        allowQualityDecrease: meshing.allowQualityDecrease,
        keepMeshData: false,
        precisionShare: 0,
        ...edgesOf(document.drawEdges, document.edges, classes.DrawEdgesOptions),
        faceColour: DOCUMENT_PART_COLOUR,
        faceOpacity: 1,
        faceMaterial: undefined,
        drawFaces: true,
        drawTwoSided: true,
        backFaceColour: DOCUMENT_PART_COLOUR,
        backFaceOpacity: 1,
        drawVertices: false,
        drawEdgeIndexes: false,
        drawFaceIndexes: false,
        drawIsoCurves: false,
        edgeArrowSize: 0,
        surfaceAnalysis: Inputs.OCCT.surfaceAnalysisEnum.none,
        edgeContrast: undefined,
        wireColour: undefined,
        edgeWidthBySize: false,
        drawAnnotations: document.drawAnnotations,
        annotationsView: annotations.annotationsView ?? undefined,
        annotationColour: annotations.annotationColour,
        annotationWidth: annotations.annotationWidth,
        annotationsFilled: annotations.annotationsFilled,
    };
    return { ...shape, ...drawing };
}

/**
 * Lays a renderer's hatched section drawing options out flat over its shape options, so the
 * renderer's section drawing reads them as it always has: the cut faces filled in their color, the
 * edges piece left out taking its defaults.
 * @param shape - The renderer's shape options with every default filled, laid under the result
 * @param options - The hatched section drawing options as the caller gave them, or undefined for the defaults
 * @param classes - The renderer's hatched section options class and its edges piece's class, as its `Inputs.Draw` holds them
 * @returns A new object holding the shape options with the section's settings over them
 * @beta
 */
export function hatchedSectionDrawOptionsOf<S extends object, C extends HatchedSectionOptionClasses>(shape: S, options: unknown, classes: C & DeclaringEvery<C, HatchedSectionPieces>): S & HatchedSectionDrawing {
    const section = resolved<DrawHatchedSectionPieces>(classes.DrawHatchedSectionOptions, options);
    const drawing: HatchedSectionDrawing = {
        precision: section.precision,
        faceColour: section.faceColour,
        faceOpacity: 1,
        drawFaces: true,
        ...edgesOf(section.drawEdges, section.edges, classes.DrawEdgesOptions),
        hatchColour: section.hatchColour,
        hatchWidth: section.hatchWidth,
    };
    return { ...shape, ...drawing };
}
