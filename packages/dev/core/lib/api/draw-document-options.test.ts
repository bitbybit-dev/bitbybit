import { describe, it, expect } from "vitest";
import { Inputs as BaseInputs } from "@bitbybit-dev/base";
import { DOCUMENT_PART_COLOUR, documentDrawOptionsOf, hatchedSectionDrawOptionsOf } from "./draw-document-options";

const { zUpToYUp, yUpToZUp } = BaseInputs.Base.upAxisConversionEnum;

class MeshingOptions {
    precision?: number | undefined = 0.01;
    angularDeflection?: number | undefined = 0.5;
    relativeDeflection?: boolean | undefined = false;
    forceFaceDeflection?: boolean | undefined = false;
    allowQualityDecrease?: boolean | undefined = true;
}

class EdgesOptions {
    edgeColour?: string | undefined = "#000000";
    edgeWidth?: number | undefined = 2;
    edgeOpacity?: number | undefined = 1;
}

class AnnotationsOptions {
    annotationsView?: string | undefined;
    annotationColour?: string | undefined = "#0047ab";
    annotationWidth?: number | undefined = 2;
    annotationsFilled?: boolean | undefined = true;
}

class DocumentOptions {
    upAxis?: BaseInputs.Base.upAxisConversionEnum | undefined = zUpToYUp;
    meshing?: MeshingOptions | undefined;
    drawEdges?: boolean | undefined = true;
    edges?: EdgesOptions | undefined;
    drawAnnotations?: boolean | undefined = false;
    annotations?: AnnotationsOptions | undefined;
}

class SectionOptions {
    precision?: number | undefined = 0.01;
    faceColour?: string | undefined = "#ffffff";
    drawEdges?: boolean | undefined = true;
    edges?: EdgesOptions | undefined;
    hatchColour?: string | undefined = "#000000";
    hatchWidth?: number | undefined = 1;
}

const DOCUMENT_CLASSES = { DrawOcctDocumentOptions: DocumentOptions, DrawMeshingOptions: MeshingOptions, DrawEdgesOptions: EdgesOptions, DrawAnnotationsOptions: AnnotationsOptions };
const SECTION_CLASSES = { DrawHatchedSectionOptions: SectionOptions, DrawEdgesOptions: EdgesOptions };

const SHAPE = {
    faceColour: "#ff0000",
    faceOpacity: 0.5,
    faceMaterial: { name: "steel" } as unknown,
    drawFaces: false,
    drawTwoSided: false,
    backFaceColour: "#0000ff",
    backFaceOpacity: 0.3,
    drawVertices: true,
    drawEdgeIndexes: true,
    drawFaceIndexes: true,
    drawIsoCurves: true,
    edgeArrowSize: 2,
    surfaceAnalysis: "gaussian",
    edgeContrast: 0.5 as number | undefined,
    wireColour: "#00ff00" as string | undefined,
    edgeWidthBySize: true,
    precisionShare: 0.2,
    keepMeshData: true,
    precision: 9,
    edgeColour: "#ffffff",
};

describe("documentDrawOptionsOf", () => {
    it("should draw a document left without options turned Y-up, in its own colors over grey, edges on and annotations off", () => {
        // Act
        const flat = documentDrawOptionsOf(SHAPE, undefined, DOCUMENT_CLASSES);

        // Assert
        expect(flat).toMatchObject({
            upAxis: zUpToYUp, precision: 0.01, angularDeflection: 0.5, relativeDeflection: false, forceFaceDeflection: false, allowQualityDecrease: true,
            keepMeshData: false, precisionShare: 0, drawEdges: true, edgeColour: "#000000", edgeWidth: 2, edgeOpacity: 1,
            drawAnnotations: false, annotationsView: undefined, annotationColour: "#0047ab", annotationWidth: 2, annotationsFilled: true,
        });
    });

    it("should give the faces the document's own colors over a neutral grey, and the backs the same grey, with nothing else on them", () => {
        // Act
        const flat = documentDrawOptionsOf(SHAPE, {}, DOCUMENT_CLASSES);

        // Assert
        expect(DOCUMENT_PART_COLOUR).toBe("#c0c0c0");
        expect(flat).toMatchObject({
            faceColour: DOCUMENT_PART_COLOUR, faceOpacity: 1, faceMaterial: undefined, drawFaces: true,
            drawTwoSided: true, backFaceColour: DOCUMENT_PART_COLOUR, backFaceOpacity: 1,
            drawVertices: false, drawEdgeIndexes: false, drawFaceIndexes: false, drawIsoCurves: false, edgeArrowSize: 0,
            surfaceAnalysis: "none", edgeContrast: undefined, wireColour: undefined, edgeWidthBySize: false,
        });
    });

    it("should take the pieces that are wired and the defaults of those that are not", () => {
        // Arrange
        const given = {
            upAxis: yUpToZUp,
            meshing: { precision: 0.2, angularDeflection: 0.1 },
            drawEdges: false,
            drawAnnotations: true,
            annotations: { annotationsView: "FRONT", annotationsFilled: false },
        };

        // Act
        const flat = documentDrawOptionsOf(SHAPE, given, DOCUMENT_CLASSES);

        // Assert
        expect(flat).toMatchObject({
            upAxis: yUpToZUp, precision: 0.2, angularDeflection: 0.1, allowQualityDecrease: true, drawEdges: false, edgeColour: "#000000",
            drawAnnotations: true, annotationsView: "FRONT", annotationColour: "#0047ab", annotationsFilled: false,
        });
    });

    it("should take a saved view given as null as none, so every annotation is drawn", () => {
        // Act
        const flat = documentDrawOptionsOf(SHAPE, { drawAnnotations: true, annotations: { annotationsView: null } }, DOCUMENT_CLASSES);

        // Assert
        expect(flat.annotationsView).toBeUndefined();
    });

    it("should still read the deprecated adjustZtoY of a caller that gives it", () => {
        // Act
        const flat = documentDrawOptionsOf(SHAPE, { adjustZtoY: false }, DOCUMENT_CLASSES);

        // Assert
        expect(flat.upAxis).toBe(BaseInputs.Base.upAxisConversionEnum.keep);
    });

    it("should leave the options it was given as they were", () => {
        // Arrange
        const given = { meshing: { precision: 0.2 } };

        // Act
        documentDrawOptionsOf(SHAPE, given, DOCUMENT_CLASSES);

        // Assert
        expect(given).toEqual({ meshing: { precision: 0.2 } });
    });
});

describe("hatchedSectionDrawOptionsOf", () => {
    it("should draw a section left without options in white with black outlines and a black hatch one wide", () => {
        // Act
        const flat = hatchedSectionDrawOptionsOf(SHAPE, undefined, SECTION_CLASSES);

        // Assert
        expect(flat).toMatchObject({
            precision: 0.01, faceColour: "#ffffff", faceOpacity: 1, drawFaces: true,
            drawEdges: true, edgeColour: "#000000", edgeWidth: 2, edgeOpacity: 1, hatchColour: "#000000", hatchWidth: 1,
        });
    });

    it("should take the edges piece and the section's own colors as given", () => {
        // Act
        const flat = hatchedSectionDrawOptionsOf(SHAPE, { precision: 0.5, faceColour: "#eeeeee", edges: { edgeColour: "#333333", edgeWidth: 4 }, hatchColour: "#ff0000", hatchWidth: 3 }, SECTION_CLASSES);

        // Assert
        expect(flat).toMatchObject({ precision: 0.5, faceColour: "#eeeeee", edgeColour: "#333333", edgeWidth: 4, edgeOpacity: 1, hatchColour: "#ff0000", hatchWidth: 3 });
    });
});
