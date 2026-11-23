import type * as Inputs from "./inputs";
import type { DtoConstructor } from "@bitbybit-dev/base";
import type { DocumentMeshing } from "./draw-annotations-types";

/**
 * The meshing piece of a renderer's document drawing options, every default present.
 * @beta
 */
export interface DrawMeshingPiece {
    readonly precision: number;
    readonly angularDeflection: number;
    readonly relativeDeflection: boolean;
    readonly forceFaceDeflection: boolean;
    readonly allowQualityDecrease: boolean;
}

/**
 * The edges piece of a renderer's document and hatched section drawing options, every default
 * present.
 * @beta
 */
export interface DrawEdgesPiece {
    readonly edgeColour: string;
    readonly edgeWidth: number;
    readonly edgeOpacity: number;
}

/**
 * The annotations piece of a renderer's document drawing options, every default present.
 * @beta
 */
export interface DrawAnnotationsPiece {
    readonly annotationsView: string | null | undefined;
    readonly annotationColour: string;
    readonly annotationWidth: number;
    readonly annotationsFilled: boolean;
}

/**
 * A renderer's document drawing options, every default present, its pieces as given.
 * @beta
 */
export interface DrawDocumentPieces {
    readonly upAxis: Inputs.Base.upAxisConversionEnum;
    readonly meshing: unknown;
    readonly drawEdges: boolean;
    readonly edges: unknown;
    readonly drawAnnotations: boolean;
    readonly annotations: unknown;
}

/**
 * A renderer's hatched section drawing options, every default present, its edges piece as given.
 * @beta
 */
export interface DrawHatchedSectionPieces {
    readonly precision: number;
    readonly faceColour: string;
    readonly drawEdges: boolean;
    readonly edges: unknown;
    readonly hatchColour: string;
    readonly hatchWidth: number;
}

/**
 * A DTO class whose instances may hold each property of `T`, of its type or left out, as the
 * defaulted properties of a DTO are.
 * @beta
 */
export type DtoOf<T> = DtoConstructor<{ [K in keyof T]?: T[K] | undefined }>;

/**
 * The classes of a renderer's document drawing options and of their three pieces, whose defaults
 * fill what a caller leaves out; a renderer's `Inputs.Draw` namespace holds them.
 * @beta
 */
export interface DocumentOptionClasses {
    readonly DrawOcctDocumentOptions: DtoOf<DrawDocumentPieces>;
    readonly DrawMeshingOptions: DtoOf<DrawMeshingPiece>;
    readonly DrawEdgesOptions: DtoOf<DrawEdgesPiece>;
    readonly DrawAnnotationsOptions: DtoOf<DrawAnnotationsPiece>;
}

/**
 * The classes of a renderer's hatched section drawing options and of their edges piece; a
 * renderer's `Inputs.Draw` namespace holds them.
 * @beta
 */
export interface HatchedSectionOptionClasses {
    readonly DrawHatchedSectionOptions: DtoOf<DrawHatchedSectionPieces>;
    readonly DrawEdgesOptions: DtoOf<DrawEdgesPiece>;
}

/**
 * `C`, the classes a renderer hands over, when each one's instances declare every property its
 * piece in `P` names, and `never` for one that lacks any, so a property renamed in one renderer is
 * refused where the classes are handed over instead of drawing what a missing property gives.
 * @beta
 */
export type DeclaringEvery<C, P> = { readonly [K in keyof P]: K extends keyof C ? C[K] extends DtoConstructor<infer I> ? Exclude<keyof P[K], keyof I> extends never ? C[K] : never : never : never };

/**
 * The resolved piece each document option class gives.
 * @beta
 */
export interface DocumentPieces {
    readonly DrawOcctDocumentOptions: DrawDocumentPieces;
    readonly DrawMeshingOptions: DrawMeshingPiece;
    readonly DrawEdgesOptions: DrawEdgesPiece;
    readonly DrawAnnotationsOptions: DrawAnnotationsPiece;
}

/**
 * The resolved piece each hatched section option class gives.
 * @beta
 */
export interface HatchedSectionPieces {
    readonly DrawHatchedSectionOptions: DrawHatchedSectionPieces;
    readonly DrawEdgesOptions: DrawEdgesPiece;
}

/**
 * The line settings of the edges a document or a section draws, as the edges piece gives them.
 * @beta
 */
export interface DrawnEdges {
    readonly drawEdges: boolean;
    readonly edgeColour: string;
    readonly edgeWidth: number;
    readonly edgeOpacity: number;
}

/**
 * What a renderer reads to draw an assembly document and its annotations, laid out flat over its
 * shape options by `documentDrawOptionsOf`.
 * @beta
 */
export interface DocumentDrawing extends DocumentMeshing, DrawnEdges {
    readonly precisionShare: number;
    readonly faceColour: string;
    readonly faceOpacity: number;
    readonly faceMaterial: undefined;
    readonly drawFaces: boolean;
    readonly drawTwoSided: boolean;
    readonly backFaceColour: string;
    readonly backFaceOpacity: number;
    readonly drawVertices: boolean;
    readonly drawEdgeIndexes: boolean;
    readonly drawFaceIndexes: boolean;
    readonly drawIsoCurves: boolean;
    readonly edgeArrowSize: number;
    readonly surfaceAnalysis: Inputs.OCCT.surfaceAnalysisEnum;
    readonly edgeContrast: undefined;
    readonly wireColour: undefined;
    readonly edgeWidthBySize: boolean;
    readonly drawAnnotations: boolean;
    readonly annotationsView: string | undefined;
    readonly annotationColour: string;
    readonly annotationWidth: number;
    readonly annotationsFilled: boolean;
}

/**
 * What a renderer reads to draw a hatched section, laid out flat over its shape options by
 * `hatchedSectionDrawOptionsOf`.
 * @beta
 */
export interface HatchedSectionDrawing extends DrawnEdges {
    readonly precision: number;
    readonly faceColour: string;
    readonly faceOpacity: number;
    readonly drawFaces: boolean;
    readonly hatchColour: string;
    readonly hatchWidth: number;
}
