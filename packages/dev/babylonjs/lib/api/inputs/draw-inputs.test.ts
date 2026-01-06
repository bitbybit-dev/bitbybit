import { Draw } from "./draw-inputs";
import { Base } from "./base-inputs";

describe("Draw DTO unit tests", () => {
    describe("DrawAny", () => {
        it("should set properties from constructor parameters", () => {
            // Arrange
            const entity = [0, 0, 0] as Base.Point3;
            const options = new Draw.DrawOcctShapeOptions();

            // Act
            const result = new Draw.DrawAny(entity, options);

            // Assert
            expect(result.entity).toBe(entity);
            expect(result.options).toBe(options);
        });

        it("should have correct default values when no parameters are provided", () => {
            // Arrange & Act
            const result = new Draw.DrawAny();

            // Assert
            expect(result.entity).toBeUndefined();
            expect(result.options).toBeUndefined();
            expect(result.babylonMesh).toBeUndefined();
        });
    });

    describe("DrawManifoldOrCrossSectionOptions", () => {
        it("should set properties from constructor parameters", () => {
            // Arrange
            const faceOpacity = 0.5;
            const faceMaterial = { name: "testMaterial" } as Base.Material;
            const faceColour = "#00ff00";
            const crossSectionColour = "#00ffff";
            const crossSectionWidth = 5;
            const crossSectionOpacity = 0.8;
            const computeNormals = true;
            const drawTwoSided = false;
            const backFaceColour = "#ffff00";
            const backFaceOpacity = 0.6;

            // Act
            const result = new Draw.DrawManifoldOrCrossSectionOptions(
                faceOpacity,
                faceMaterial,
                faceColour,
                crossSectionColour,
                crossSectionWidth,
                crossSectionOpacity,
                computeNormals,
                drawTwoSided,
                backFaceColour,
                backFaceOpacity
            );

            // Assert
            expect(result.faceOpacity).toBe(0.5);
            expect(result.faceMaterial).toBe(faceMaterial);
            expect(result.faceColour).toBe("#00ff00");
            expect(result.crossSectionColour).toBe("#00ffff");
            expect(result.crossSectionWidth).toBe(5);
            expect(result.crossSectionOpacity).toBe(0.8);
            expect(result.computeNormals).toBe(true);
            expect(result.drawTwoSided).toBe(false);
            expect(result.backFaceColour).toBe("#ffff00");
            expect(result.backFaceOpacity).toBe(0.6);
        });

        it("should have correct default values when no parameters are provided", () => {
            // Arrange & Act
            const result = new Draw.DrawManifoldOrCrossSectionOptions();

            // Assert
            expect(result.faceOpacity).toBe(1);
            expect(result.faceColour).toBe("#ff0000");
            expect(result.faceMaterial).toBeUndefined();
            expect(result.crossSectionColour).toBe("#ff00ff");
            expect(result.crossSectionWidth).toBe(2);
            expect(result.crossSectionOpacity).toBeUndefined();
            expect(result.computeNormals).toBe(false);
            expect(result.drawTwoSided).toBe(true);
            expect(result.backFaceColour).toBe("#0000ff");
            expect(result.backFaceOpacity).toBe(1);
        });
    });

    describe("DrawOcctShapeOptions", () => {
        it("should set properties from constructor parameters", () => {
            // Arrange
            const faceOpacity = 0.7;
            const edgeOpacity = 0.8;
            const edgeColour = "#00ff00";
            const faceMaterial = { name: "testMaterial" } as Base.Material;
            const faceColour = "#0000ff";
            const edgeWidth = 3;
            const drawEdges = false;
            const drawFaces = false;
            const drawVertices = true;
            const vertexColour = "#ff0000";
            const vertexSize = 0.05;
            const precision = 0.02;
            const drawEdgeIndexes = true;
            const edgeIndexHeight = 0.08;
            const edgeIndexColour = "#00ffff";
            const drawFaceIndexes = true;
            const faceIndexHeight = 0.09;
            const faceIndexColour = "#ffff00";
            const drawTwoSided = false;
            const backFaceColour = "#ff00ff";
            const backFaceOpacity = 0.5;
            const edgeArrowSize = 0.1;
            const edgeArrowAngle = 45;

            // Act
            const result = new Draw.DrawOcctShapeOptions(
                faceOpacity,
                edgeOpacity,
                edgeColour,
                faceMaterial,
                faceColour,
                edgeWidth,
                drawEdges,
                drawFaces,
                drawVertices,
                vertexColour,
                vertexSize,
                precision,
                drawEdgeIndexes,
                edgeIndexHeight,
                edgeIndexColour,
                drawFaceIndexes,
                faceIndexHeight,
                faceIndexColour,
                drawTwoSided,
                backFaceColour,
                backFaceOpacity,
                edgeArrowSize,
                edgeArrowAngle
            );

            // Assert
            expect(result.faceOpacity).toBe(0.7);
            expect(result.edgeOpacity).toBe(0.8);
            expect(result.edgeColour).toBe("#00ff00");
            expect(result.faceMaterial).toBe(faceMaterial);
            expect(result.faceColour).toBe("#0000ff");
            expect(result.edgeWidth).toBe(3);
            expect(result.drawEdges).toBe(false);
            expect(result.drawFaces).toBe(false);
            expect(result.drawVertices).toBe(true);
            expect(result.vertexColour).toBe("#ff0000");
            expect(result.vertexSize).toBe(0.05);
            expect(result.precision).toBe(0.02);
            expect(result.drawEdgeIndexes).toBe(true);
            expect(result.edgeIndexHeight).toBe(0.08);
            expect(result.edgeIndexColour).toBe("#00ffff");
            expect(result.drawFaceIndexes).toBe(true);
            expect(result.faceIndexHeight).toBe(0.09);
            expect(result.faceIndexColour).toBe("#ffff00");
            expect(result.drawTwoSided).toBe(false);
            expect(result.backFaceColour).toBe("#ff00ff");
            expect(result.backFaceOpacity).toBe(0.5);
            expect(result.edgeArrowSize).toBe(0.1);
            expect(result.edgeArrowAngle).toBe(45);
        });

        it("should have correct default values when no parameters are provided", () => {
            // Arrange & Act
            const result = new Draw.DrawOcctShapeOptions();

            // Assert
            expect(result.faceOpacity).toBe(1);
            expect(result.edgeOpacity).toBe(1);
            expect(result.edgeColour).toBe("#ffffff");
            expect(result.faceColour).toBe("#ff0000");
            expect(result.vertexColour).toBe("#ffaaff");
            expect(result.faceMaterial).toBeUndefined();
            expect(result.edgeWidth).toBe(2);
            expect(result.vertexSize).toBe(0.03);
            expect(result.drawEdges).toBe(true);
            expect(result.drawFaces).toBe(true);
            expect(result.drawVertices).toBe(false);
            expect(result.precision).toBe(0.01);
            expect(result.drawEdgeIndexes).toBe(false);
            expect(result.edgeIndexHeight).toBe(0.06);
            expect(result.edgeIndexColour).toBe("#ff00ff");
            expect(result.drawFaceIndexes).toBe(false);
            expect(result.faceIndexHeight).toBe(0.06);
            expect(result.faceIndexColour).toBe("#0000ff");
            expect(result.drawTwoSided).toBe(true);
            expect(result.backFaceColour).toBe("#0000ff");
            expect(result.backFaceOpacity).toBe(1);
            expect(result.edgeArrowSize).toBe(0);
            expect(result.edgeArrowAngle).toBe(15);
        });
    });

    describe("DrawBasicGeometryOptions", () => {
        it("should set properties from constructor parameters", () => {
            // Arrange
            const colours = ["#ff0000", "#00ff00", "#0000ff"];
            const size = 0.5;
            const opacity = 0.8;
            const updatable = true;
            const hidden = true;
            const drawTwoSided = false;
            const backFaceColour = "#ffff00";
            const backFaceOpacity = 0.6;
            const colorMapStrategy = Base.colorMapStrategyEnum.repeatColors;
            const arrowSize = 0.2;
            const arrowAngle = 45;

            // Act
            const result = new Draw.DrawBasicGeometryOptions(
                colours,
                size,
                opacity,
                updatable,
                hidden,
                drawTwoSided,
                backFaceColour,
                backFaceOpacity,
                colorMapStrategy,
                arrowSize,
                arrowAngle
            );

            // Assert
            expect(result.colours).toBe(colours);
            expect(result.size).toBe(0.5);
            expect(result.opacity).toBe(0.8);
            expect(result.updatable).toBe(true);
            expect(result.hidden).toBe(true);
            expect(result.drawTwoSided).toBe(false);
            expect(result.backFaceColour).toBe("#ffff00");
            expect(result.backFaceOpacity).toBe(0.6);
            expect(result.colorMapStrategy).toBe(Base.colorMapStrategyEnum.repeatColors);
            expect(result.arrowSize).toBe(0.2);
            expect(result.arrowAngle).toBe(45);
        });

        it("should have correct default values when no parameters are provided", () => {
            // Arrange & Act
            const result = new Draw.DrawBasicGeometryOptions();

            // Assert
            expect(result.colours).toBe("#ff0000");
            expect(result.colorMapStrategy).toBe(Base.colorMapStrategyEnum.lastColorRemainder);
            expect(result.size).toBe(1);
            expect(result.opacity).toBe(1);
            expect(result.updatable).toBe(false);
            expect(result.hidden).toBe(false);
            expect(result.drawTwoSided).toBe(true);
            expect(result.backFaceColour).toBe("#0000ff");
            expect(result.backFaceOpacity).toBe(1);
            expect(result.arrowSize).toBe(0);
            expect(result.arrowAngle).toBe(15);
        });
    });

    describe("GenericTextureDto", () => {
        it("should set properties from constructor parameters", () => {
            // Arrange
            const url = "https://example.com/texture.png";
            const name = "TestTexture";
            const uScale = 2;
            const vScale = 3;
            const uOffset = 0.5;
            const vOffset = 0.7;
            const wAng = 1.57;
            const invertY = true;
            const invertZ = true;
            const samplingMode = Draw.samplingModeEnum.trilinear;

            // Act
            const result = new Draw.GenericTextureDto(
                url,
                name,
                uScale,
                vScale,
                uOffset,
                vOffset,
                wAng,
                invertY,
                invertZ,
                samplingMode
            );

            // Assert
            expect(result.url).toBe("https://example.com/texture.png");
            expect(result.name).toBe("TestTexture");
            expect(result.uScale).toBe(2);
            expect(result.vScale).toBe(3);
            expect(result.uOffset).toBe(0.5);
            expect(result.vOffset).toBe(0.7);
            expect(result.wAng).toBe(1.57);
            expect(result.invertY).toBe(true);
            expect(result.invertZ).toBe(true);
            expect(result.samplingMode).toBe(Draw.samplingModeEnum.trilinear);
        });

        it("should have correct default values when no parameters are provided", () => {
            // Arrange & Act
            const result = new Draw.GenericTextureDto();

            // Assert
            expect(result.url).toBeUndefined();
            expect(result.name).toBe("Texture");
            expect(result.uScale).toBe(1);
            expect(result.vScale).toBe(1);
            expect(result.uOffset).toBe(0);
            expect(result.vOffset).toBe(0);
            expect(result.wAng).toBe(0);
            expect(result.invertY).toBe(false);
            expect(result.invertZ).toBe(false);
            expect(result.samplingMode).toBe(Draw.samplingModeEnum.nearest);
        });
    });

    describe("GenericPBRMaterialDto", () => {
        it("should set properties from constructor parameters", () => {
            // Arrange
            const name = "TestMaterial";
            const baseColor = "#ff00ff";
            const metallic = 0.8;
            const roughness = 0.3;
            const alpha = 0.9;
            const emissiveColor = "#ffff00";
            const emissiveIntensity = 2.5;
            const backFaceCulling = true;
            const zOffset = 0.5;
            const zOffsetUnits = 2;
            const baseColorTexture = { url: "base.png" } as Base.Texture;
            const metallicRoughnessTexture = { url: "metal.png" } as Base.Texture;
            const normalTexture = { url: "normal.png" } as Base.Texture;
            const emissiveTexture = { url: "emissive.png" } as Base.Texture;
            const occlusionTexture = { url: "occlusion.png" } as Base.Texture;
            const alphaMode = Draw.alphaModeEnum.blend;
            const alphaCutoff = 0.7;
            const doubleSided = false;
            const wireframe = true;
            const unlit = true;

            // Act
            const result = new Draw.GenericPBRMaterialDto(
                name,
                baseColor,
                metallic,
                roughness,
                alpha,
                emissiveColor,
                emissiveIntensity,
                backFaceCulling,
                zOffset,
                zOffsetUnits,
                baseColorTexture,
                metallicRoughnessTexture,
                normalTexture,
                emissiveTexture,
                occlusionTexture,
                alphaMode,
                alphaCutoff,
                doubleSided,
                wireframe,
                unlit
            );

            // Assert
            expect(result.name).toBe("TestMaterial");
            expect(result.baseColor).toBe("#ff00ff");
            expect(result.metallic).toBe(0.8);
            expect(result.roughness).toBe(0.3);
            expect(result.alpha).toBe(0.9);
            expect(result.emissiveColor).toBe("#ffff00");
            expect(result.emissiveIntensity).toBe(2.5);
            expect(result.backFaceCulling).toBe(true);
            expect(result.zOffset).toBe(0.5);
            expect(result.zOffsetUnits).toBe(2);
            expect(result.baseColorTexture).toBe(baseColorTexture);
            expect(result.metallicRoughnessTexture).toBe(metallicRoughnessTexture);
            expect(result.normalTexture).toBe(normalTexture);
            expect(result.emissiveTexture).toBe(emissiveTexture);
            expect(result.occlusionTexture).toBe(occlusionTexture);
            expect(result.alphaMode).toBe(Draw.alphaModeEnum.blend);
            expect(result.alphaCutoff).toBe(0.7);
            expect(result.doubleSided).toBe(false);
            expect(result.wireframe).toBe(true);
            expect(result.unlit).toBe(true);
        });

        it("should have correct default values when no parameters are provided", () => {
            // Arrange & Act
            const result = new Draw.GenericPBRMaterialDto();

            // Assert
            expect(result.name).toBe("PBRMaterial");
            expect(result.baseColor).toBe("#0000ff");
            expect(result.metallic).toBe(0.5);
            expect(result.roughness).toBe(0.5);
            expect(result.alpha).toBe(1);
            expect(result.emissiveColor).toBe("#000000");
            expect(result.emissiveIntensity).toBe(1);
            expect(result.backFaceCulling).toBe(false);
            expect(result.zOffset).toBe(0);
            expect(result.zOffsetUnits).toBe(0);
            expect(result.baseColorTexture).toBeUndefined();
            expect(result.metallicRoughnessTexture).toBeUndefined();
            expect(result.normalTexture).toBeUndefined();
            expect(result.emissiveTexture).toBeUndefined();
            expect(result.occlusionTexture).toBeUndefined();
            expect(result.alphaMode).toBe(Draw.alphaModeEnum.opaque);
            expect(result.alphaCutoff).toBe(0.5);
            expect(result.doubleSided).toBe(false);
            expect(result.wireframe).toBe(false);
            expect(result.unlit).toBe(false);
        });
    });
});
