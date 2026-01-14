---
title: Bitbybit API Surface Overview
description: An explanation of the Bitbybit API surface, mirroring the bitbybit.d.ts file, covering both open-source and proprietary components for developers and AI agents.
tags: [api]
---

# Bitbybit API Surface Overview

## API Explanation

This section aims to provide an understanding of the complete Application Programming Interface (API) surface of Bitbybit. It essentially mirrors the structure and content you would find in our `bitbybit.d.ts` TypeScript definition file. This definition file represents the full scope of the Bitbybit API, encompassing both its **open-source** components and its **proprietary** (commercial) parts.

*   **Open-Source Components:** A significant portion of the API is open-source, providing a rich set of tools for 3D modeling, geometry manipulation, and integration with web technologies.
*   **Proprietary Components:** Advanced functionalities and specialized modules are typically found under namespaces like `bitbybit.advanced` and `bitbybit.things`. Access to these proprietary parts usually requires a commercial license or subscription.

This comprehensive API definition serves two primary purposes:
1.  **For Developers:** It acts as a reference for developers using Bitbybit, detailing the available functions, classes, types, and modules.
2.  **For Artificial Intelligence Agents:** This structured information can be consumed and understood by AI agents to learn about the platform's technical capabilities, potentially assisting in code generation, automated tasks, or providing intelligent support.

## How It's Used in Code

When developers integrate Bitbybit functionalities into their TypeScript or JavaScript codebases (for example, when using the [Bitbybit Runner](/runner/introduction) or our NPM packages), they typically interact with the API through a global or imported variable, commonly named `bitbybit`.

This `bitbybit` variable is an instance of, or conforms to, the `BitByBitBase` type (root class defined in `bitbybit.d.ts`). All accessible modules, functions, and classes of the Bitbybit platform are then accessed as properties of this `bitbybit` object.

**Example that you can run on [TypeScript Monaco Editor](https://bitbybit.dev/app?editor=typescript): **
```typescript
// Assuming 'bitbybit' is available in the scope
// (e.g., after initializing the Bitbybit Runner or importing from an NPM package)

async function createAndDrawCube(size: number) {
    // Accessing an open-source OCCT function
    const cubeOptions = new Bit.Inputs.OCCT.CubeDto(); // 'Bit' often holds input DTOs
    cubeOptions.size = size;
    const occtCube = await bitbybit.occt.shapes.solid.createCube(cubeOptions);

    // Accessing an open-source drawing function
    const drawOptions = new Bit.Inputs.Draw.DrawOcctShapeOptions();
    drawOptions.faceColour = "#00ff00"; // Green
    await bitbybit.draw.drawAnyAsync({ entity: occtCube, options: drawOptions });

    // Accessing a hypothetical advanced (proprietary) function
    // if (bitbybit.advanced && bitbybit.advanced.analysis) {
    //     const analysisResult = await bitbybit.advanced.analysis.performComplexCheck(occtCube);
    //     console.log("Advanced Analysis:", analysisResult);
    // }
}

// Use the code like this
createAndDrawCube(3);
```

### IMPORTANT - THESE ARE THE FULL CONTENTS OF THE LATEST VERSION BITBYBIT.D.TS FILE

```typescript
declare namespace Bit {
    declare namespace Inputs {
        declare namespace Base {
            type Color = string;
            type ColorRGB = {
                r: number;
                g: number;
                b: number;
            };
            type Point2 = [
                number,
                number
            ];
            type Vector2 = [
                number,
                number
            ];
            type Point3 = [
                number,
                number,
                number
            ];
            type Vector3 = [
                number,
                number,
                number
            ];
            type Axis3 = {
                origin: Base.Point3;
                direction: Base.Vector3;
            };
            type Axis2 = {
                origin: Base.Point2;
                direction: Base.Vector2;
            };
            type Segment2 = [
                Point2,
                Point2
            ];
            type Segment3 = [
                Point3,
                Point3
            ];
            type TrianglePlane3 = {
                normal: Vector3;
                d: number;
            };
            type Triangle3 = [
                Base.Point3,
                Base.Point3,
                Base.Point3
            ];
            type Mesh3 = Triangle3[];
            type Plane3 = {
                origin: Base.Point3;
                normal: Base.Vector3;
                direction: Base.Vector3;
            };
            type BoundingBox = {
                min: Base.Point3;
                max: Base.Point3;
                center?: Base.Point3;
                width?: number;
                height?: number;
                length?: number;
            };
            type Line2 = {
                start: Base.Point2;
                end: Base.Point2;
            };
            type Line3 = {
                start: Base.Point3;
                end: Base.Point3;
            };
            type Polyline3 = {
                points: Base.Point3[];
                isClosed?: boolean;
            };
            type Polyline2 = {
                points: Base.Point2[];
                isClosed?: boolean;
            };
            type VerbCurve = {
                tessellate: (options: any) => any;
            };
            type VerbSurface = {
                tessellate: (options: any) => any;
            };
            type TransformMatrix3x3 = [
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number
            ];
            type TransformMatrixes3x3 = TransformMatrix3x3[];
            type TransformMatrix = [
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number
            ];
            type TransformMatrixes = TransformMatrix[];
        }
        declare namespace JSCAD {
            type JSCADEntity = any;
            class PolylinePropertiesDto {
                constructor(points?: Base.Point3[], isClosed?: boolean);
                points: Base.Point3[];
                isClosed?: boolean;
                color?: string | number[];
            }
            enum solidCornerTypeEnum {
                edge = "edge",
                round = "round",
                chamfer = "chamfer"
            }
            enum jscadTextAlignEnum {
                left = "left",
                center = "center",
                right = "right"
            }
            class MeshDto {
                constructor(mesh?: JSCADEntity);
                mesh: JSCADEntity;
            }
            class MeshesDto {
                constructor(meshes?: JSCADEntity[]);
                meshes: JSCADEntity[];
            }
            class DrawSolidMeshDto<T> {
                constructor(mesh?: JSCADEntity, opacity?: number, colours?: string | string[], updatable?: boolean, hidden?: boolean, jscadMesh?: T, drawTwoSided?: boolean, backFaceColour?: string, backFaceOpacity?: number);
                mesh: JSCADEntity;
                opacity: number;
                colours: string | string[];
                updatable: boolean;
                hidden: boolean;
                jscadMesh?: T;
                drawTwoSided: boolean;
                backFaceColour: string;
                backFaceOpacity: number;
            }
            class DrawSolidMeshesDto<T> {
                constructor(meshes?: JSCADEntity[], opacity?: number, colours?: string | string[], updatable?: boolean, hidden?: boolean, jscadMesh?: T, drawTwoSided?: boolean, backFaceColour?: string, backFaceOpacity?: number);
                meshes: JSCADEntity[];
                opacity: number;
                colours: string | string[];
                updatable: boolean;
                hidden: boolean;
                jscadMesh?: T;
                drawTwoSided: boolean;
                backFaceColour: string;
                backFaceOpacity: number;
            }
            class DrawPathDto<T> {
                constructor(path?: JSCADEntity, colour?: string, opacity?: number, width?: number, updatable?: boolean, pathMesh?: T);
                path: JSCADEntity;
                colour: string;
                opacity: number;
                width: number;
                updatable: boolean;
                pathMesh?: T;
            }
            class TransformSolidsDto {
                constructor(meshes?: JSCADEntity[], transformation?: Base.TransformMatrixes);
                meshes: JSCADEntity[];
                transformation: Base.TransformMatrixes;
            }
            class TransformSolidDto {
                constructor(mesh?: JSCADEntity, transformation?: Base.TransformMatrixes);
                mesh: JSCADEntity;
                transformation: Base.TransformMatrixes;
            }
            class DownloadSolidDto {
                constructor(mesh?: JSCADEntity, fileName?: string);
                mesh: JSCADEntity;
                fileName: string;
            }
            class DownloadGeometryDto {
                constructor(geometry?: JSCADEntity | JSCADEntity[], fileName?: string, options?: any);
                geometry: JSCADEntity | JSCADEntity[];
                fileName: string;
                options: any;
            }
            class DownloadSolidsDto {
                constructor(meshes?: JSCADEntity[], fileName?: string);
                meshes: JSCADEntity[];
                fileName: string;
            }
            class ColorizeDto {
                constructor(geometry?: JSCADEntity, color?: string);
                geometry: JSCADEntity | JSCADEntity[];
                color: string;
            }
            class BooleanObjectsDto {
                constructor(meshes?: JSCADEntity[]);
                meshes: JSCADEntity[];
            }
            class BooleanTwoObjectsDto {
                constructor(first?: JSCADEntity, second?: JSCADEntity);
                first: JSCADEntity;
                second: JSCADEntity;
            }
            class BooleanObjectsFromDto {
                constructor(from?: JSCADEntity, meshes?: JSCADEntity[]);
                from: JSCADEntity;
                meshes: JSCADEntity[];
            }
            class ExpansionDto {
                constructor(geometry?: JSCADEntity, delta?: number, corners?: solidCornerTypeEnum, segments?: number);
                geometry: JSCADEntity;
                delta: number;
                corners: solidCornerTypeEnum;
                segments: number;
            }
            class OffsetDto {
                constructor(geometry?: JSCADEntity, delta?: number, corners?: solidCornerTypeEnum, segments?: number);
                geometry: JSCADEntity;
                delta: number;
                corners: solidCornerTypeEnum;
                segments: number;
            }
            class ExtrudeLinearDto {
                constructor(geometry?: JSCADEntity, height?: number, twistAngle?: number, twistSteps?: number);
                geometry: JSCADEntity;
                height: number;
                twistAngle: number;
                twistSteps: number;
            }
            class HullDto {
                constructor(meshes?: JSCADEntity[]);
                meshes: JSCADEntity[];
            }
            class ExtrudeRectangularDto {
                constructor(geometry?: JSCADEntity, height?: number, size?: number);
                geometry: JSCADEntity;
                height: number;
                size: number;
            }
            class ExtrudeRectangularPointsDto {
                constructor(points?: Base.Point3[], height?: number, size?: number);
                points: Base.Point3[];
                height: number;
                size: number;
            }
            class ExtrudeRotateDto {
                constructor(polygon?: JSCADEntity, angle?: number, startAngle?: number, segments?: number);
                polygon: JSCADEntity;
                angle: number;
                startAngle: number;
                segments: number;
            }
            class PolylineDto {
                constructor(polyline?: PolylinePropertiesDto);
                polyline: PolylinePropertiesDto;
            }
            class CurveDto {
                constructor(curve?: any);
                curve: any;
            }
            class PointsDto {
                constructor(points?: Base.Point3[]);
                points: Base.Point3[];
            }
            class PathDto {
                constructor(path?: JSCADEntity);
                path: JSCADEntity;
            }
            class PathFromPointsDto {
                constructor(points?: Base.Point2[], closed?: boolean);
                points: Base.Point2[];
                closed: boolean;
            }
            class PathsFromPointsDto {
                constructor(pointsLists?: Base.Point3[][] | Base.Point2[][]);
                pointsLists: Base.Point3[][] | Base.Point2[][];
            }
            class PathFromPolylineDto {
                constructor(polyline?: PolylinePropertiesDto, closed?: boolean);
                polyline: PolylinePropertiesDto;
                closed: boolean;
            }
            class PathAppendCurveDto {
                constructor(curve?: JSCADEntity, path?: JSCADEntity);
                curve: JSCADEntity;
                path: JSCADEntity;
            }
            class PathAppendPointsDto {
                constructor(points?: Base.Point2[], path?: JSCADEntity);
                points: Base.Point2[];
                path: JSCADEntity;
            }
            class PathAppendPolylineDto {
                constructor(polyline?: PolylinePropertiesDto, path?: JSCADEntity);
                polyline: PolylinePropertiesDto;
                path: JSCADEntity;
            }
            class PathAppendArcDto {
                constructor(path?: JSCADEntity, endPoint?: Base.Point2, xAxisRotation?: number, clockwise?: boolean, large?: boolean, segments?: number, radiusX?: number, radiusY?: number);
                path: JSCADEntity;
                endPoint: Base.Point2;
                xAxisRotation: number;
                clockwise: boolean;
                large: boolean;
                segments: number;
                radiusX: number;
                radiusY: number;
            }
            class CircleDto {
                constructor(center?: Base.Point2, radius?: number, segments?: number);
                center: Base.Point2;
                radius: number;
                segments: number;
            }
            class EllipseDto {
                constructor(center?: Base.Point2, radius?: Base.Point2, segments?: number);
                center: Base.Point2;
                radius: Base.Point2;
                segments: number;
            }
            class SquareDto {
                constructor(center?: Base.Point2, size?: number);
                center: Base.Point2;
                size: number;
            }
            class RectangleDto {
                constructor(center?: Base.Point2, width?: number, length?: number);
                center: Base.Point2;
                width: number;
                length: number;
            }
            class RoundedRectangleDto {
                constructor(center?: Base.Point2, roundRadius?: number, segments?: number, width?: number, length?: number);
                center: Base.Point2;
                roundRadius: number;
                segments: number;
                width: number;
                length: number;
            }
            class StarDto {
                constructor(center?: Base.Point2, vertices?: number, density?: number, outerRadius?: number, innerRadius?: number, startAngle?: number);
                center: Base.Point2;
                vertices: number;
                density: number;
                outerRadius: number;
                innerRadius: number;
                startAngle: number;
            }
            class CubeDto {
                constructor(center?: Base.Point3, size?: number);
                center: Base.Point3;
                size: number;
            }
            class CubeCentersDto {
                constructor(centers?: Base.Point3[], size?: number);
                centers: Base.Point3[];
                size: number;
            }
            class CuboidDto {
                constructor(center?: Base.Point3, width?: number, length?: number, height?: number);
                center: Base.Point3;
                width: number;
                length: number;
                height: number;
            }
            class CuboidCentersDto {
                constructor(centers?: Base.Point3[], width?: number, length?: number, height?: number);
                centers: Base.Point3[];
                width: number;
                length: number;
                height: number;
            }
            class RoundedCuboidDto {
                constructor(center?: Base.Point3, roundRadius?: number, width?: number, length?: number, height?: number, segments?: number);
                center: Base.Point3;
                roundRadius: number;
                width: number;
                length: number;
                height: number;
                segments: number;
            }
            class RoundedCuboidCentersDto {
                constructor(centers?: Base.Point3[], roundRadius?: number, width?: number, length?: number, height?: number, segments?: number);
                centers: Base.Point3[];
                roundRadius: number;
                width: number;
                length: number;
                height: number;
                segments: number;
            }
            class CylidnerEllipticDto {
                constructor(center?: Base.Point3, height?: number, startRadius?: Base.Point2, endRadius?: Base.Point2, segments?: number);
                center: Base.Point3;
                height: number;
                startRadius: Base.Vector2;
                endRadius: Base.Vector2;
                segments: number;
            }
            class CylidnerCentersEllipticDto {
                constructor(centers?: Base.Point3[], height?: number, startRadius?: Base.Point2, endRadius?: Base.Point2, segments?: number);
                centers: Base.Point3[];
                height: number;
                startRadius: Base.Point2;
                endRadius: Base.Point2;
                segments: number;
            }
            class CylidnerDto {
                constructor(center?: Base.Point3, height?: number, radius?: number, segments?: number);
                center: Base.Point3;
                height: number;
                radius: number;
                segments: number;
            }
            class RoundedCylidnerDto {
                constructor(center?: Base.Point3, roundRadius?: number, height?: number, radius?: number, segments?: number);
                center: Base.Point3;
                roundRadius: number;
                height: number;
                radius: number;
                segments: number;
            }
            class EllipsoidDto {
                constructor(center?: Base.Point3, radius?: Base.Point3, segments?: number);
                center: Base.Point3;
                radius: Base.Point3;
                segments: number;
            }
            class EllipsoidCentersDto {
                constructor(centers?: Base.Point3[], radius?: Base.Point3, segments?: number);
                centers: Base.Point3[];
                radius: Base.Point3;
                segments: number;
            }
            class GeodesicSphereDto {
                constructor(center?: Base.Point3, radius?: number, frequency?: number);
                center: Base.Point3;
                radius: number;
                frequency: number;
            }
            class GeodesicSphereCentersDto {
                constructor(centers?: Base.Point3[], radius?: number, frequency?: number);
                centers: Base.Point3[];
                radius: number;
                frequency: number;
            }
            class CylidnerCentersDto {
                constructor(centers?: Base.Point3[], height?: number, radius?: number, segments?: number);
                centers: Base.Point3[];
                height: number;
                radius: number;
                segments: number;
            }
            class RoundedCylidnerCentersDto {
                constructor(centers?: Base.Point3[], roundRadius?: number, height?: number, radius?: number, segments?: number);
                centers: Base.Point3[];
                roundRadius: number;
                height: number;
                radius: number;
                segments: number;
            }
            class SphereDto {
                constructor(center?: Base.Point3, radius?: number, segments?: number);
                center: Base.Point3;
                radius: number;
                segments: number;
            }
            class SphereCentersDto {
                constructor(centers?: Base.Point3[], radius?: number, segments?: number);
                centers: Base.Point3[];
                radius: number;
                segments: number;
            }
            class TorusDto {
                constructor(center?: Base.Point3, innerRadius?: number, outerRadius?: number, innerSegments?: number, outerSegments?: number, innerRotation?: number, outerRotation?: number, startAngle?: number);
                center: Base.Point3;
                innerRadius: number;
                outerRadius: number;
                innerSegments: number;
                outerSegments: number;
                innerRotation: number;
                outerRotation: number;
                startAngle: number;
            }
            class TextDto {
                constructor(text?: string, segments?: number, xOffset?: number, yOffset?: number, height?: number, lineSpacing?: number, letterSpacing?: number, align?: jscadTextAlignEnum, extrudeOffset?: number);
                text: string;
                segments: number;
                xOffset: number;
                yOffset: number;
                height: number;
                lineSpacing: number;
                letterSpacing: number;
                align: jscadTextAlignEnum;
                extrudeOffset: number;
            }
            class CylinderTextDto {
                constructor(text?: string, extrusionHeight?: number, extrusionSize?: number, segments?: number, xOffset?: number, yOffset?: number, height?: number, lineSpacing?: number, letterSpacing?: number, align?: jscadTextAlignEnum, extrudeOffset?: number);
                text: string;
                extrusionHeight: number;
                extrusionSize: number;
                segments: number;
                xOffset: number;
                yOffset: number;
                height: number;
                lineSpacing: number;
                letterSpacing: number;
                align: jscadTextAlignEnum;
                extrudeOffset: number;
            }
            class SphereTextDto {
                constructor(text?: string, radius?: number, segments?: number, xOffset?: number, yOffset?: number, height?: number, lineSpacing?: number, letterSpacing?: number, align?: jscadTextAlignEnum, extrudeOffset?: number);
                text: string;
                radius: number;
                segments: number;
                xOffset: number;
                yOffset: number;
                height: number;
                lineSpacing: number;
                letterSpacing: number;
                align: jscadTextAlignEnum;
                extrudeOffset: number;
            }
            class FromPolygonPoints {
                constructor(polygonPoints?: Base.Point3[][]);
                polygonPoints?: Base.Point3[][];
            }
        }
        declare namespace Base {
            type Color = string;
            type ColorRGB = {
                r: number;
                g: number;
                b: number;
            };
            type Point2 = [
                number,
                number
            ];
            type Vector2 = [
                number,
                number
            ];
            type Point3 = [
                number,
                number,
                number
            ];
            type Vector3 = [
                number,
                number,
                number
            ];
            type Axis3 = {
                origin: Base.Point3;
                direction: Base.Vector3;
            };
            type Axis2 = {
                origin: Base.Point2;
                direction: Base.Vector2;
            };
            type Segment2 = [
                Point2,
                Point2
            ];
            type Segment3 = [
                Point3,
                Point3
            ];
            type TrianglePlane3 = {
                normal: Vector3;
                d: number;
            };
            type Triangle3 = [
                Base.Point3,
                Base.Point3,
                Base.Point3
            ];
            type Mesh3 = Triangle3[];
            type Plane3 = {
                origin: Base.Point3;
                normal: Base.Vector3;
                direction: Base.Vector3;
            };
            type BoundingBox = {
                min: Base.Point3;
                max: Base.Point3;
                center?: Base.Point3;
                width?: number;
                height?: number;
                length?: number;
            };
            type Line2 = {
                start: Base.Point2;
                end: Base.Point2;
            };
            type Line3 = {
                start: Base.Point3;
                end: Base.Point3;
            };
            type Polyline3 = {
                points: Base.Point3[];
                isClosed?: boolean;
            };
            type Polyline2 = {
                points: Base.Point2[];
                isClosed?: boolean;
            };
            type VerbCurve = {
                tessellate: (options: any) => any;
            };
            type VerbSurface = {
                tessellate: (options: any) => any;
            };
            type TransformMatrix3x3 = [
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number
            ];
            type TransformMatrixes3x3 = TransformMatrix3x3[];
            type TransformMatrix = [
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number
            ];
            type TransformMatrixes = TransformMatrix[];
        }
        declare namespace Manifold {
            type ManifoldPointer = {
                hash: number;
                type: string;
            };
            type CrossSectionPointer = {
                hash: number;
                type: string;
            };
            type MeshPointer = {
                hash: number;
                type: string;
            };
            enum fillRuleEnum {
                evenOdd = "EvenOdd",
                nonZero = "NonZero",
                positive = "Positive",
                negative = "Negative"
            }
            enum manifoldJoinTypeEnum {
                square = "Square",
                round = "Round",
                miter = "Miter",
                bevel = "Bevel"
            }
            class DecomposedManifoldMeshDto {
                numProp: number;
                vertProperties: Float32Array;
                triVerts: Uint32Array;
                mergeFromVert?: Uint32Array;
                mergeToVert?: Uint32Array;
                runIndex?: Uint32Array;
                runOriginalID?: Uint32Array;
                runTransform?: Float32Array;
                faceID?: Uint32Array;
                halfedgeTangent?: Float32Array;
            }
            class DrawManifoldOrCrossSectionDto<T, M> {
                constructor(manifoldOrCrossSection?: T, faceOpacity?: number, faceMaterial?: M, faceColour?: Base.Color, crossSectionColour?: Base.Color, crossSectionWidth?: number, crossSectionOpacity?: number, computeNormals?: boolean, drawTwoSided?: boolean, backFaceColour?: Base.Color, backFaceOpacity?: number);
                manifoldOrCrossSection?: T;
                faceOpacity: number;
                faceMaterial?: M;
                faceColour: Base.Color;
                crossSectionColour: Base.Color;
                crossSectionWidth: number;
                crossSectionOpacity: number;
                computeNormals: boolean;
                drawTwoSided: boolean;
                backFaceColour: Base.Color;
                backFaceOpacity: number;
            }
            class DrawManifoldsOrCrossSectionsDto<T, M> {
                constructor(manifoldsOrCrossSections?: T[], faceOpacity?: number, faceMaterial?: M, faceColour?: Base.Color, crossSectionColour?: Base.Color, crossSectionWidth?: number, crossSectionOpacity?: number, computeNormals?: boolean, drawTwoSided?: boolean, backFaceColour?: Base.Color, backFaceOpacity?: number);
                manifoldsOrCrossSections?: T[];
                faceMaterial?: M;
                faceColour: Base.Color;
                faceOpacity: number;
                crossSectionColour: Base.Color;
                crossSectionWidth: number;
                crossSectionOpacity: number;
                computeNormals: boolean;
                drawTwoSided: boolean;
                backFaceColour: Base.Color;
                backFaceOpacity: number;
            }
            class CreateFromMeshDto {
                constructor(mesh?: DecomposedManifoldMeshDto);
                mesh: DecomposedManifoldMeshDto;
            }
            class FromPolygonPointsDto {
                constructor(polygonPoints?: Base.Point3[][]);
                polygonPoints?: Base.Point3[][];
            }
            class CrossSectionFromPolygonPointsDto {
                constructor(points?: Base.Point3[], fillRule?: fillRuleEnum, removeDuplicates?: boolean, tolerance?: number);
                points: Base.Point3[];
                fillRule?: fillRuleEnum;
                removeDuplicates?: boolean;
                tolerance?: number;
            }
            class CrossSectionFromPolygonsPointsDto {
                constructor(polygonPoints?: Base.Point3[][], fillRule?: fillRuleEnum, removeDuplicates?: boolean, tolerance?: number);
                polygonPoints: Base.Point3[][];
                fillRule?: fillRuleEnum;
                removeDuplicates?: boolean;
                tolerance?: number;
            }
            class CubeDto {
                constructor(center?: boolean, size?: number);
                center: boolean;
                size: number;
            }
            class CreateContourSectionDto {
                constructor(polygons?: Base.Vector2[][], fillRule?: fillRuleEnum);
                polygons: Base.Vector2[][];
                fillRule: fillRuleEnum;
            }
            class SquareDto {
                constructor(center?: boolean, size?: number);
                center: boolean;
                size: number;
            }
            class SphereDto {
                constructor(radius?: number, circularSegments?: number);
                radius: number;
                circularSegments: number;
            }
            class CylinderDto {
                constructor(height?: number, radiusLow?: number, radiusHigh?: number, circularSegments?: number, center?: boolean);
                height: number;
                radiusLow: number;
                radiusHigh: number;
                circularSegments: number;
                center: boolean;
            }
            class CircleDto {
                constructor(radius?: number, circularSegments?: number);
                radius: number;
                circularSegments: number;
            }
            class RectangleDto {
                constructor(length?: number, height?: number, center?: boolean);
                length: number;
                height: number;
                center: boolean;
            }
            class ManifoldDto<T> {
                constructor(manifold?: T);
                manifold: T;
            }
            class CalculateNormalsDto<T> {
                constructor(manifold?: T, normalIdx?: number, minSharpAngle?: number);
                manifold: T;
                normalIdx: number;
                minSharpAngle: number;
            }
            class CalculateCurvatureDto<T> {
                constructor(manifold?: T);
                manifold: T;
                gaussianIdx: number;
                meanIdx: number;
            }
            class CountDto {
                constructor(count?: number);
                count: number;
            }
            class ManifoldsMinGapDto<T> {
                constructor(manifold1?: T, manifold2?: T, searchLength?: number);
                manifold1: T;
                manifold2: T;
                searchLength: number;
            }
            class ManifoldRefineToleranceDto<T> {
                constructor(manifold?: T, tolerance?: number);
                manifold: T;
                tolerance: number;
            }
            class ManifoldRefineLengthDto<T> {
                constructor(manifold?: T, length?: number);
                manifold: T;
                length: number;
            }
            class ManifoldRefineDto<T> {
                constructor(manifold?: T, number?: number);
                manifold: T;
                number: number;
            }
            class ManifoldSmoothByNormalsDto<T> {
                constructor(manifold?: T, normalIdx?: number);
                manifold: T;
                normalIdx: number;
            }
            class ManifoldSimplifyDto<T> {
                constructor(manifold?: T, tolerance?: number);
                manifold: T;
                tolerance?: number;
            }
            class ManifoldSetPropertiesDto<T> {
                constructor(manifold?: T, numProp?: number, propFunc?: (newProp: number[], position: Base.Vector3, oldProp: number[]) => void);
                manifold: T;
                numProp: number;
                propFunc: (newProp: number[], position: Base.Vector3, oldProp: number[]) => void;
            }
            class ManifoldSmoothOutDto<T> {
                constructor(manifold?: T, minSharpAngle?: number, minSmoothness?: number);
                manifold: T;
                minSharpAngle: number;
                minSmoothness: number;
            }
            class HullPointsDto<T> {
                constructor(points?: T);
                points: T;
            }
            class SliceDto<T> {
                constructor(manifold?: T);
                manifold: T;
                height: number;
            }
            class MeshDto<T> {
                constructor(mesh?: T);
                mesh: T;
            }
            class MeshVertexIndexDto<T> {
                constructor(mesh?: T, vertexIndex?: number);
                mesh: T;
                vertexIndex: number;
            }
            class MeshTriangleRunIndexDto<T> {
                constructor(mesh?: T, triangleRunIndex?: number);
                mesh: T;
                triangleRunIndex: number;
            }
            class MeshHalfEdgeIndexDto<T> {
                constructor(mesh?: T, halfEdgeIndex?: number);
                mesh: T;
                halfEdgeIndex: number;
            }
            class MeshTriangleIndexDto<T> {
                constructor(mesh?: T, triangleIndex?: number);
                mesh: T;
                triangleIndex: number;
            }
            class CrossSectionDto<T> {
                constructor(crossSection?: T);
                crossSection: T;
            }
            class CrossSectionsDto<T> {
                constructor(crossSections?: T[]);
                crossSections: T[];
            }
            class ExtrudeDto<T> {
                constructor(crossSection?: T);
                crossSection: T;
                height: number;
                nDivisions: number;
                twistDegrees: number;
                scaleTopX: number;
                scaleTopY: number;
                center: boolean;
            }
            class RevolveDto<T> {
                constructor(crossSection?: T, revolveDegrees?: number, matchProfile?: boolean, circularSegments?: number);
                crossSection: T;
                revolveDegrees: number;
                matchProfile: boolean;
                circularSegments: number;
            }
            class OffsetDto<T> {
                constructor(crossSection?: T, delta?: number, joinType?: manifoldJoinTypeEnum, miterLimit?: number, circularSegments?: number);
                crossSection: T;
                delta: number;
                joinType: manifoldJoinTypeEnum;
                miterLimit: number;
                circularSegments: number;
            }
            class SimplifyDto<T> {
                constructor(crossSection?: T, epsilon?: number);
                crossSection: T;
                epsilon: number;
            }
            class ComposeDto<T> {
                constructor(polygons?: T);
                polygons: T;
            }
            class MirrorCrossSectionDto<T> {
                constructor(crossSection?: T, normal?: Base.Vector2);
                crossSection: T;
                normal: Base.Vector2;
            }
            class Scale2DCrossSectionDto<T> {
                constructor(crossSection?: T, vector?: Base.Vector2);
                crossSection: T;
                vector: Base.Vector2;
            }
            class TranslateCrossSectionDto<T> {
                constructor(crossSection?: T, vector?: Base.Vector2);
                crossSection: T;
                vector: Base.Vector2;
            }
            class RotateCrossSectionDto<T> {
                constructor(crossSection?: T, degrees?: number);
                crossSection: T;
                degrees: number;
            }
            class ScaleCrossSectionDto<T> {
                constructor(crossSection?: T, factor?: number);
                crossSection: T;
                factor: number;
            }
            class TranslateXYCrossSectionDto<T> {
                constructor(crossSection?: T, x?: number, y?: number);
                crossSection: T;
                x: number;
                y: number;
            }
            class TransformCrossSectionDto<T> {
                constructor(crossSection?: T, transform?: Base.TransformMatrix3x3);
                crossSection: T;
                transform: Base.TransformMatrix3x3;
            }
            class CrossSectionWarpDto<T> {
                constructor(crossSection?: T, warpFunc?: (vert: Base.Vector2) => void);
                crossSection: T;
                warpFunc: (vert: Base.Vector2) => void;
            }
            class MirrorDto<T> {
                constructor(manifold?: T, normal?: Base.Vector3);
                manifold: T;
                normal: Base.Vector3;
            }
            class Scale3DDto<T> {
                constructor(manifold?: T, vector?: Base.Vector3);
                manifold: T;
                vector: Base.Vector3;
            }
            class TranslateDto<T> {
                constructor(manifold?: T, vector?: Base.Vector3);
                manifold: T;
                vector: Base.Vector3;
            }
            class TranslateByVectorsDto<T> {
                constructor(manifold?: T, vectors?: Base.Vector3[]);
                manifold: T;
                vectors: Base.Vector3[];
            }
            class RotateDto<T> {
                constructor(manifold?: T, vector?: Base.Vector3);
                manifold: T;
                vector: Base.Vector3;
            }
            class RotateXYZDto<T> {
                constructor(manifold?: T, x?: number, y?: number, z?: number);
                manifold: T;
                x: number;
                y: number;
                z: number;
            }
            class ScaleDto<T> {
                constructor(manifold?: T, factor?: number);
                manifold: T;
                factor: number;
            }
            class TranslateXYZDto<T> {
                constructor(manifold?: T, x?: number, y?: number, z?: number);
                manifold: T;
                x: number;
                y: number;
                z: number;
            }
            class TransformDto<T> {
                constructor(manifold?: T, transform?: Base.TransformMatrix);
                manifold: T;
                transform: Base.TransformMatrix;
            }
            class TransformsDto<T> {
                constructor(manifold?: T, transforms?: Base.TransformMatrixes);
                manifold: T;
                transforms: Base.TransformMatrixes;
            }
            class ManifoldWarpDto<T> {
                constructor(manifold?: T, warpFunc?: (vert: Base.Vector3) => void);
                manifold: T;
                warpFunc: (vert: Base.Vector3) => void;
            }
            class TwoCrossSectionsDto<T> {
                constructor(crossSection1?: T, crossSection2?: T);
                crossSection1: T;
                crossSection2: T;
            }
            class TwoManifoldsDto<T> {
                constructor(manifold1?: T, manifold2?: T);
                manifold1: T;
                manifold2: T;
            }
            class SplitManifoldsDto<T> {
                constructor(manifoldToSplit?: T, manifoldCutter?: T);
                manifoldToSplit: T;
                manifoldCutter: T;
            }
            class TrimByPlaneDto<T> {
                constructor(manifold?: T, normal?: Base.Vector3, originOffset?: number);
                manifold: T;
                normal: Base.Vector3;
                originOffset: number;
            }
            class SplitByPlaneDto<T> {
                constructor(manifold?: T, normal?: Base.Vector3, originOffset?: number);
                manifold: T;
                normal: Base.Vector3;
                originOffset: number;
            }
            class SplitByPlaneOnOffsetsDto<T> {
                constructor(manifold?: T, normal?: Base.Vector3, originOffsets?: number[]);
                manifold: T;
                normal: Base.Vector3;
                originOffsets: number[];
            }
            class ManifoldsDto<T> {
                constructor(manifolds?: T[]);
                manifolds: T[];
            }
            class ManifoldToMeshDto<T> {
                constructor(manifold?: T, normalIdx?: number);
                manifold: T;
                normalIdx?: number;
            }
            class ManifoldsToMeshesDto<T> {
                constructor(manifolds?: T[], normalIdx?: number[]);
                manifolds: T[];
                normalIdx?: number[];
            }
            class DecomposeManifoldOrCrossSectionDto<T> {
                constructor(manifoldOrCrossSection?: T, normalIdx?: number);
                manifoldOrCrossSection: T;
                normalIdx?: number;
            }
            class ManifoldOrCrossSectionDto<T> {
                constructor(manifoldOrCrossSection?: T);
                manifoldOrCrossSection: T;
            }
            class ManifoldsOrCrossSectionsDto<T> {
                constructor(manifoldsOrCrossSections?: T[]);
                manifoldsOrCrossSections: T[];
            }
            class DecomposeManifoldsOrCrossSectionsDto<T> {
                constructor(manifoldsOrCrossSections?: T[], normalIdx?: number[]);
                manifoldsOrCrossSections: T[];
                normalIdx?: number[];
            }
        }
        declare namespace OCCT {
            type GeomCurvePointer = {
                hash: number;
                type: string;
            };
            type Geom2dCurvePointer = {
                hash: number;
                type: string;
            };
            type GeomSurfacePointer = {
                hash: number;
                type: string;
            };
            type TopoDSVertexPointer = {
                hash: number;
                type: string;
            };
            type TopoDSEdgePointer = {
                hash: number;
                type: string;
            };
            type TopoDSWirePointer = {
                hash: number;
                type: string;
            };
            type TopoDSFacePointer = {
                hash: number;
                type: string;
            };
            type TopoDSShellPointer = {
                hash: number;
                type: string;
            };
            type TopoDSSolidPointer = {
                hash: number;
                type: string;
            };
            type TopoDSCompSolidPointer = {
                hash: number;
                type: string;
            };
            type TopoDSCompoundPointer = {
                hash: number;
                type: string;
            };
            type TopoDSShapePointer = TopoDSVertexPointer | TopoDSEdgePointer | TopoDSWirePointer | TopoDSFacePointer | TopoDSShellPointer | TopoDSSolidPointer | TopoDSCompoundPointer;
            enum joinTypeEnum {
                arc = "arc",
                intersection = "intersection",
                tangent = "tangent"
            }
            enum bRepOffsetModeEnum {
                skin = "skin",
                pipe = "pipe",
                rectoVerso = "rectoVerso"
            }
            enum approxParametrizationTypeEnum {
                approxChordLength = "approxChordLength",
                approxCentripetal = "approxCentripetal",
                approxIsoParametric = "approxIsoParametric"
            }
            enum directionEnum {
                outside = "outside",
                inside = "inside",
                middle = "middle"
            }
            enum fileTypeEnum {
                iges = "iges",
                step = "step"
            }
            enum topAbsOrientationEnum {
                forward = "forward",
                reversed = "reversed",
                internal = "internal",
                external = "external"
            }
            enum topAbsStateEnum {
                in = "in",
                out = "out",
                on = "on",
                unknown = "unknown"
            }
            enum shapeTypeEnum {
                unknown = "unknown",
                vertex = "vertex",
                edge = "edge",
                wire = "wire",
                face = "face",
                shell = "shell",
                solid = "solid",
                compSolid = "compSolid",
                compound = "compound",
                shape = "shape"
            }
            enum gccEntPositionEnum {
                unqualified = "unqualified",
                enclosing = "enclosing",
                enclosed = "enclosed",
                outside = "outside",
                noqualifier = "noqualifier"
            }
            enum positionResultEnum {
                keepSide1 = "keepSide1",
                keepSide2 = "keepSide2",
                all = "all"
            }
            enum circleInclusionEnum {
                none = "none",
                keepSide1 = "keepSide1",
                keepSide2 = "keepSide2"
            }
            enum twoCircleInclusionEnum {
                none = "none",
                outside = "outside",
                inside = "inside",
                outsideInside = "outsideInside",
                insideOutside = "insideOutside"
            }
            enum fourSidesStrictEnum {
                outside = "outside",
                inside = "inside",
                outsideInside = "outsideInside",
                insideOutside = "insideOutside"
            }
            enum twoSidesStrictEnum {
                outside = "outside",
                inside = "inside"
            }
            enum combinationCirclesForFaceEnum {
                allWithAll = "allWithAll",
                inOrder = "inOrder",
                inOrderClosed = "inOrderClosed"
            }
            enum typeSpecificityEnum {
                curve = 0,
                edge = 1,
                wire = 2,
                face = 3
            }
            enum pointProjectionTypeEnum {
                all = "all",
                closest = "closest",
                furthest = "furthest",
                closestAndFurthest = "closestAndFurthest"
            }
            enum geomFillTrihedronEnum {
                isCorrectedFrenet = "isCorrectedFrenet",
                isFixed = "isFixed",
                isFrenet = "isFrenet",
                isConstantNormal = "isConstantNormal",
                isDarboux = "isDarboux",
                isGuideAC = "isGuideAC",
                isGuidePlan = "isGuidePlan",
                isGuideACWithContact = "isGuideACWithContact",
                isGuidePlanWithContact = "isGuidePlanWithContact",
                isDiscreteTrihedron = "isDiscreteTrihedron"
            }
            enum dxfColorFormatEnum {
                aci = "aci",
                truecolor = "truecolor"
            }
            enum dxfAcadVersionEnum {
                AC1009 = "AC1009",
                AC1015 = "AC1015"
            }
            enum dimensionEndTypeEnum {
                none = "none",
                arrow = "arrow"
            }
            class DecomposedMeshDto {
                constructor(faceList?: DecomposedFaceDto[], edgeList?: DecomposedEdgeDto[]);
                faceList: DecomposedFaceDto[];
                edgeList: DecomposedEdgeDto[];
                pointsList: Base.Point3[];
            }
            class DecomposedFaceDto {
                face_index: number;
                normal_coord: number[];
                number_of_triangles: number;
                tri_indexes: number[];
                vertex_coord: number[];
                vertex_coord_vec: Base.Vector3[];
                center_point: Base.Point3;
                center_normal: Base.Vector3;
                uvs: number[];
            }
            class DecomposedEdgeDto {
                edge_index: number;
                middle_point: Base.Point3;
                vertex_coord: Base.Vector3[];
            }
            class ShapesDto<T> {
                constructor(shapes?: T[]);
                shapes: T[];
            }
            class PointDto {
                constructor(point?: Base.Point3);
                point: Base.Point3;
            }
            class XYZDto {
                constructor(x?: number, y?: number, z?: number);
                x: number;
                y: number;
                z: number;
            }
            class PointsDto {
                constructor(points?: Base.Point3[]);
                points: Base.Point3[];
            }
            class ConstraintTanLinesFromPtToCircleDto<T> {
                constructor(circle?: T, point?: Base.Point3, tolerance?: number, positionResult?: positionResultEnum, circleRemainder?: circleInclusionEnum);
                circle: T;
                point: Base.Point3;
                tolerance: number;
                positionResult: positionResultEnum;
                circleRemainder: circleInclusionEnum;
            }
            class ConstraintTanLinesFromTwoPtsToCircleDto<T> {
                constructor(circle?: T, point1?: Base.Point3, point2?: Base.Point3, tolerance?: number, positionResult?: positionResultEnum, circleRemainder?: circleInclusionEnum);
                circle: T;
                point1: Base.Point3;
                point2: Base.Point3;
                tolerance: number;
                positionResult: positionResultEnum;
                circleRemainder: circleInclusionEnum;
            }
            class ConstraintTanLinesOnTwoCirclesDto<T> {
                constructor(circle1?: T, circle2?: T, tolerance?: number, positionResult?: positionResultEnum, circleRemainders?: twoCircleInclusionEnum);
                circle1: T;
                circle2: T;
                tolerance: number;
                positionResult: positionResultEnum;
                circleRemainders: twoCircleInclusionEnum;
            }
            class ConstraintTanCirclesOnTwoCirclesDto<T> {
                constructor(circle1?: T, circle2?: T, tolerance?: number, radius?: number);
                circle1: T;
                circle2: T;
                tolerance: number;
                radius: number;
            }
            class ConstraintTanCirclesOnCircleAndPntDto<T> {
                constructor(circle?: T, point?: Base.Point3, tolerance?: number, radius?: number);
                circle: T;
                point: Base.Point3;
                tolerance: number;
                radius: number;
            }
            class CurveAndSurfaceDto<T, U> {
                constructor(curve?: T, surface?: U);
                curve: T;
                surface: U;
            }
            class FilletTwoEdgesInPlaneDto<T> {
                constructor(edge1?: T, edge2?: T, planeOrigin?: Base.Point3, planeDirection?: Base.Vector3, radius?: number, solution?: number);
                edge1: T;
                edge2: T;
                planeOrigin: Base.Point3;
                planeDirection: Base.Vector3;
                radius: number;
                solution?: number;
            }
            class ClosestPointsOnShapeFromPointsDto<T> {
                constructor(shape?: T, points?: Base.Point3[]);
                shape: T;
                points: Base.Point3[];
            }
            class BoundingBoxDto {
                constructor(bbox?: BoundingBoxPropsDto);
                bbox?: BoundingBoxPropsDto;
            }
            class BoundingBoxPropsDto {
                constructor(min?: Base.Point3, max?: Base.Point3, center?: Base.Point3, size?: Base.Vector3);
                min: Base.Point3;
                max: Base.Point3;
                center: Base.Point3;
                size: Base.Vector3;
            }
            class BoundingSpherePropsDto {
                constructor(center?: Base.Point3, radius?: number);
                center: Base.Point3;
                radius: number;
            }
            class SplitWireOnPointsDto<T> {
                constructor(shape?: T, points?: Base.Point3[]);
                shape: T;
                points: Base.Point3[];
            }
            class ClosestPointsOnShapesFromPointsDto<T> {
                constructor(shapes?: T[], points?: Base.Point3[]);
                shapes: T[];
                points: Base.Point3[];
            }
            class ClosestPointsBetweenTwoShapesDto<T> {
                constructor(shape1?: T, shape2?: T);
                shape1: T;
                shape2: T;
            }
            class FaceFromSurfaceAndWireDto<T, U> {
                constructor(surface?: T, wire?: U, inside?: boolean);
                surface: T;
                wire: U;
                inside: boolean;
            }
            class WireOnFaceDto<T, U> {
                constructor(wire?: T, face?: U);
                wire: T;
                face: U;
            }
            class DrawShapeDto<T> {
                constructor(shape?: T, faceOpacity?: number, edgeOpacity?: number, edgeColour?: Base.Color, faceMaterial?: Base.Material, faceColour?: Base.Color, edgeWidth?: number, drawEdges?: boolean, drawFaces?: boolean, drawVertices?: boolean, vertexColour?: Base.Color, vertexSize?: number, precision?: number, drawEdgeIndexes?: boolean, edgeIndexHeight?: number, edgeIndexColour?: Base.Color, drawFaceIndexes?: boolean, faceIndexHeight?: number, faceIndexColour?: Base.Color, drawTwoSided?: boolean, backFaceColour?: Base.Color, backFaceOpacity?: number);
                shape?: T;
                faceOpacity: number;
                edgeOpacity: number;
                edgeColour: Base.Color;
                faceMaterial?: Base.Material;
                faceColour: Base.Color;
                edgeWidth: number;
                drawEdges: boolean;
                drawFaces: boolean;
                drawVertices: boolean;
                vertexColour: string;
                vertexSize: number;
                precision: number;
                drawEdgeIndexes: boolean;
                edgeIndexHeight: number;
                edgeIndexColour: Base.Color;
                drawFaceIndexes: boolean;
                faceIndexHeight: number;
                faceIndexColour: Base.Color;
                drawTwoSided: boolean;
                backFaceColour: Base.Color;
                backFaceOpacity: number;
            }
            class DrawShapesDto<T> {
                constructor(shapes?: T[], faceOpacity?: number, edgeOpacity?: number, edgeColour?: Base.Color, faceMaterial?: Base.Material, faceColour?: Base.Color, edgeWidth?: number, drawEdges?: boolean, drawFaces?: boolean, drawVertices?: boolean, vertexColour?: Base.Color, vertexSize?: number, precision?: number, drawEdgeIndexes?: boolean, edgeIndexHeight?: number, edgeIndexColour?: Base.Color, drawFaceIndexes?: boolean, faceIndexHeight?: number, faceIndexColour?: Base.Color, drawTwoSided?: boolean, backFaceColour?: Base.Color, backFaceOpacity?: number);
                shapes: T[];
                faceOpacity: number;
                edgeOpacity: number;
                edgeColour: Base.Color;
                faceMaterial?: Base.Material;
                faceColour: Base.Color;
                edgeWidth: number;
                drawEdges: boolean;
                drawFaces: boolean;
                drawVertices: boolean;
                vertexColour: string;
                vertexSize: number;
                precision: number;
                drawEdgeIndexes: boolean;
                edgeIndexHeight: number;
                edgeIndexColour: Base.Color;
                drawFaceIndexes: boolean;
                faceIndexHeight: number;
                faceIndexColour: Base.Color;
                drawTwoSided: boolean;
                backFaceColour: Base.Color;
                backFaceOpacity: number;
            }
            class FaceSubdivisionDto<T> {
                constructor(shape?: T, nrDivisionsU?: number, nrDivisionsV?: number, shiftHalfStepU?: boolean, removeStartEdgeU?: boolean, removeEndEdgeU?: boolean, shiftHalfStepV?: boolean, removeStartEdgeV?: boolean, removeEndEdgeV?: boolean);
                shape: T;
                nrDivisionsU: number;
                nrDivisionsV: number;
                shiftHalfStepU: boolean;
                removeStartEdgeU: boolean;
                removeEndEdgeU: boolean;
                shiftHalfStepV: boolean;
                removeStartEdgeV: boolean;
                removeEndEdgeV: boolean;
            }
            class FaceSubdivisionToWiresDto<T> {
                constructor(shape?: T, nrDivisions?: number, isU?: boolean, shiftHalfStep?: boolean, removeStart?: boolean, removeEnd?: boolean);
                shape: T;
                nrDivisions: number;
                isU: boolean;
                shiftHalfStep: boolean;
                removeStart: boolean;
                removeEnd: boolean;
            }
            class FaceSubdivideToRectangleWiresDto<T> {
                constructor(shape?: T, nrRectanglesU?: number, nrRectanglesV?: number, scalePatternU?: number[], scalePatternV?: number[], filletPattern?: number[], inclusionPattern?: boolean[], offsetFromBorderU?: number, offsetFromBorderV?: number);
                shape: T;
                nrRectanglesU: number;
                nrRectanglesV: number;
                scalePatternU: number[];
                scalePatternV: number[];
                filletPattern: number[];
                inclusionPattern: boolean[];
                offsetFromBorderU: number;
                offsetFromBorderV: number;
            }
            class FaceSubdivideToHexagonWiresDto<T> {
                constructor(shape?: T, nrHexagonsU?: number, nrHexagonsV?: number, flatU?: boolean, scalePatternU?: number[], scalePatternV?: number[], filletPattern?: number[], inclusionPattern?: boolean[], offsetFromBorderU?: number, offsetFromBorderV?: number, extendUUp?: boolean, extendUBottom?: boolean, extendVUp?: boolean, extendVBottom?: boolean);
                shape?: T;
                nrHexagonsU?: number;
                nrHexagonsV?: number;
                flatU: boolean;
                scalePatternU?: number[];
                scalePatternV?: number[];
                filletPattern?: number[];
                inclusionPattern?: boolean[];
                offsetFromBorderU?: number;
                offsetFromBorderV?: number;
                extendUUp?: boolean;
                extendUBottom?: boolean;
                extendVUp?: boolean;
                extendVBottom?: boolean;
            }
            class FaceSubdivideToHexagonHolesDto<T> {
                constructor(shape?: T, nrHexagonsU?: number, nrHexagonsV?: number, flatU?: boolean, holesToFaces?: boolean, scalePatternU?: number[], scalePatternV?: number[], filletPattern?: number[], inclusionPattern?: boolean[], offsetFromBorderU?: number, offsetFromBorderV?: number);
                shape?: T;
                nrHexagonsU?: number;
                nrHexagonsV?: number;
                flatU: boolean;
                holesToFaces?: boolean;
                scalePatternU?: number[];
                scalePatternV?: number[];
                filletPattern?: number[];
                inclusionPattern?: boolean[];
                offsetFromBorderU?: number;
                offsetFromBorderV?: number;
            }
            class FaceSubdivideToRectangleHolesDto<T> {
                constructor(shape?: T, nrRectanglesU?: number, nrRectanglesV?: number, scalePatternU?: number[], scalePatternV?: number[], filletPattern?: number[], inclusionPattern?: boolean[], holesToFaces?: boolean, offsetFromBorderU?: number, offsetFromBorderV?: number);
                shape: T;
                nrRectanglesU: number;
                nrRectanglesV: number;
                scalePatternU: number[];
                scalePatternV: number[];
                filletPattern: number[];
                inclusionPattern: boolean[];
                holesToFaces: boolean;
                offsetFromBorderU: number;
                offsetFromBorderV: number;
            }
            class FaceSubdivisionControlledDto<T> {
                constructor(shape?: T, nrDivisionsU?: number, nrDivisionsV?: number, shiftHalfStepNthU?: number, shiftHalfStepUOffsetN?: number, removeStartEdgeNthU?: number, removeStartEdgeUOffsetN?: number, removeEndEdgeNthU?: number, removeEndEdgeUOffsetN?: number, shiftHalfStepNthV?: number, shiftHalfStepVOffsetN?: number, removeStartEdgeNthV?: number, removeStartEdgeVOffsetN?: number, removeEndEdgeNthV?: number, removeEndEdgeVOffsetN?: number);
                shape: T;
                nrDivisionsU: number;
                nrDivisionsV: number;
                shiftHalfStepNthU: number;
                shiftHalfStepUOffsetN: number;
                removeStartEdgeNthU: number;
                removeStartEdgeUOffsetN: number;
                removeEndEdgeNthU: number;
                removeEndEdgeUOffsetN: number;
                shiftHalfStepNthV: number;
                shiftHalfStepVOffsetN: number;
                removeStartEdgeNthV: number;
                removeStartEdgeVOffsetN: number;
                removeEndEdgeNthV: number;
                removeEndEdgeVOffsetN: number;
            }
            class FaceLinearSubdivisionDto<T> {
                constructor(shape?: T, isU?: boolean, param?: number, nrPoints?: number, shiftHalfStep?: boolean, removeStartPoint?: boolean, removeEndPoint?: boolean);
                shape: T;
                isU: boolean;
                param: number;
                nrPoints: number;
                shiftHalfStep: boolean;
                removeStartPoint: boolean;
                removeEndPoint: boolean;
            }
            class WireAlongParamDto<T> {
                constructor(shape?: T, isU?: boolean, param?: number);
                shape: T;
                isU: boolean;
                param: number;
            }
            class WiresAlongParamsDto<T> {
                constructor(shape?: T, isU?: boolean, params?: number[]);
                shape: T;
                isU: boolean;
                params: number[];
            }
            class DataOnUVDto<T> {
                constructor(shape?: T, paramU?: number, paramV?: number);
                shape: T;
                paramU: number;
                paramV: number;
            }
            class DataOnUVsDto<T> {
                constructor(shape?: T, paramsUV?: [
                    number,
                    number
                ][]);
                shape: T;
                paramsUV: [
                    number,
                    number
                ][];
            }
            class PolygonDto {
                constructor(points?: Base.Point3[]);
                points: Base.Point3[];
            }
            class PolygonsDto {
                constructor(polygons?: PolygonDto[], returnCompound?: boolean);
                polygons: PolygonDto[];
                returnCompound: boolean;
            }
            class PolylineDto {
                constructor(points?: Base.Point3[]);
                points: Base.Point3[];
            }
            class PolylineBaseDto {
                constructor(polyline?: Base.Polyline3);
                polyline: Base.Polyline3;
            }
            class PolylinesBaseDto {
                constructor(polylines?: Base.Polyline3[]);
                polylines: Base.Polyline3[];
            }
            class LineBaseDto {
                constructor(line?: Base.Line3);
                line: Base.Line3;
            }
            class LinesBaseDto {
                constructor(lines?: Base.Line3[]);
                lines: Base.Line3[];
            }
            class SegmentBaseDto {
                constructor(segment?: Base.Segment3);
                segment: Base.Segment3;
            }
            class SegmentsBaseDto {
                constructor(segments?: Base.Segment3[]);
                segments: Base.Segment3[];
            }
            class TriangleBaseDto {
                constructor(triangle?: Base.Triangle3);
                triangle: Base.Triangle3;
            }
            class MeshBaseDto {
                constructor(mesh?: Base.Mesh3);
                mesh: Base.Mesh3;
            }
            class PolylinesDto {
                constructor(polylines?: PolylineDto[], returnCompound?: boolean);
                polylines: PolylineDto[];
                returnCompound: boolean;
            }
            class SquareDto {
                constructor(size?: number, center?: Base.Point3, direction?: Base.Vector3);
                size: number;
                center: Base.Point3;
                direction: Base.Vector3;
            }
            class RectangleDto {
                constructor(width?: number, length?: number, center?: Base.Point3, direction?: Base.Vector3);
                width: number;
                length: number;
                center: Base.Point3;
                direction: Base.Vector3;
            }
            class LPolygonDto {
                constructor(widthFirst?: number, lengthFirst?: number, widthSecond?: number, lengthSecond?: number, align?: directionEnum, rotation?: number, center?: Base.Point3, direction?: Base.Vector3);
                widthFirst: number;
                lengthFirst: number;
                widthSecond: number;
                lengthSecond: number;
                align: directionEnum;
                rotation: number;
                center: Base.Point3;
                direction: Base.Vector3;
            }
            class IBeamProfileDto {
                constructor(width?: number, height?: number, webThickness?: number, flangeThickness?: number, alignment?: Base.basicAlignmentEnum, rotation?: number, center?: Base.Point3, direction?: Base.Vector3);
                width: number;
                height: number;
                webThickness: number;
                flangeThickness: number;
                alignment: Base.basicAlignmentEnum;
                rotation: number;
                center: Base.Point3;
                direction: Base.Vector3;
            }
            class HBeamProfileDto {
                constructor(width?: number, height?: number, webThickness?: number, flangeThickness?: number, alignment?: Base.basicAlignmentEnum, rotation?: number, center?: Base.Point3, direction?: Base.Vector3);
                width: number;
                height: number;
                webThickness: number;
                flangeThickness: number;
                alignment: Base.basicAlignmentEnum;
                rotation: number;
                center: Base.Point3;
                direction: Base.Vector3;
            }
            class TBeamProfileDto {
                constructor(width?: number, height?: number, webThickness?: number, flangeThickness?: number, alignment?: Base.basicAlignmentEnum, rotation?: number, center?: Base.Point3, direction?: Base.Vector3);
                width: number;
                height: number;
                webThickness: number;
                flangeThickness: number;
                alignment: Base.basicAlignmentEnum;
                rotation: number;
                center: Base.Point3;
                direction: Base.Vector3;
            }
            class UBeamProfileDto {
                constructor(width?: number, height?: number, webThickness?: number, flangeThickness?: number, flangeWidth?: number, alignment?: Base.basicAlignmentEnum, rotation?: number, center?: Base.Point3, direction?: Base.Vector3);
                width: number;
                height: number;
                webThickness: number;
                flangeThickness: number;
                flangeWidth: number;
                alignment: Base.basicAlignmentEnum;
                rotation: number;
                center: Base.Point3;
                direction: Base.Vector3;
            }
            class ExtrudedSolidDto {
                constructor(extrusionLengthFront?: number, extrusionLengthBack?: number, center?: Base.Point3, direction?: Base.Vector3);
                extrusionLengthFront: number;
                extrusionLengthBack: number;
                center: Base.Point3;
                direction: Base.Vector3;
            }
            class IBeamProfileSolidDto extends IBeamProfileDto {
                constructor(width?: number, height?: number, webThickness?: number, flangeThickness?: number, alignment?: Base.basicAlignmentEnum, rotation?: number, center?: Base.Point3, direction?: Base.Vector3, extrusionLengthFront?: number, extrusionLengthBack?: number);
                extrusionLengthFront: number;
                extrusionLengthBack: number;
            }
            class HBeamProfileSolidDto extends HBeamProfileDto {
                constructor(width?: number, height?: number, webThickness?: number, flangeThickness?: number, alignment?: Base.basicAlignmentEnum, rotation?: number, center?: Base.Point3, direction?: Base.Vector3, extrusionLengthFront?: number, extrusionLengthBack?: number);
                extrusionLengthFront: number;
                extrusionLengthBack: number;
            }
            class TBeamProfileSolidDto extends TBeamProfileDto {
                constructor(width?: number, height?: number, webThickness?: number, flangeThickness?: number, alignment?: Base.basicAlignmentEnum, rotation?: number, center?: Base.Point3, direction?: Base.Vector3, extrusionLengthFront?: number, extrusionLengthBack?: number);
                extrusionLengthFront: number;
                extrusionLengthBack: number;
            }
            class UBeamProfileSolidDto extends UBeamProfileDto {
                constructor(width?: number, height?: number, webThickness?: number, flangeThickness?: number, flangeWidth?: number, alignment?: Base.basicAlignmentEnum, rotation?: number, center?: Base.Point3, direction?: Base.Vector3, extrusionLengthFront?: number, extrusionLengthBack?: number);
                extrusionLengthFront: number;
                extrusionLengthBack: number;
            }
            class BoxDto {
                constructor(width?: number, length?: number, height?: number, center?: Base.Point3, originOnCenter?: boolean);
                width: number;
                length: number;
                height: number;
                center: Base.Point3;
                originOnCenter?: boolean;
            }
            class CubeDto {
                constructor(size?: number, center?: Base.Point3, originOnCenter?: boolean);
                size: number;
                center: Base.Point3;
                originOnCenter?: boolean;
            }
            class BoxFromCornerDto {
                constructor(width?: number, length?: number, height?: number, corner?: Base.Point3);
                width: number;
                length: number;
                height: number;
                corner: Base.Point3;
            }
            class SphereDto {
                constructor(radius?: number, center?: Base.Point3);
                radius: number;
                center: Base.Point3;
            }
            class ConeDto {
                constructor(radius1?: number, radius2?: number, height?: number, angle?: number, center?: Base.Point3, direction?: Base.Vector3);
                radius1: number;
                radius2: number;
                height: number;
                angle: number;
                center: Base.Point3;
                direction: Base.Point3;
            }
            class LineDto {
                constructor(start?: Base.Point3, end?: Base.Point3);
                start: Base.Point3;
                end: Base.Point3;
            }
            class LineWithExtensionsDto {
                constructor(start?: Base.Point3, end?: Base.Point3, extensionStart?: number, extensionEnd?: number);
                start: Base.Point3;
                end: Base.Point3;
                extensionStart: number;
                extensionEnd: number;
            }
            class LinesDto {
                constructor(lines?: LineDto[], returnCompound?: boolean);
                lines: LineDto[];
                returnCompound: boolean;
            }
            class ArcEdgeTwoPointsTangentDto {
                constructor(start?: Base.Point3, tangentVec?: Base.Vector3, end?: Base.Point3);
                start: Base.Point3;
                tangentVec: Base.Vector3;
                end: Base.Point3;
            }
            class ArcEdgeCircleTwoPointsDto<T> {
                constructor(circle?: T, start?: Base.Point3, end?: Base.Point3, sense?: boolean);
                circle: T;
                start: Base.Point3;
                end: Base.Point3;
                sense: boolean;
            }
            class ArcEdgeCircleTwoAnglesDto<T> {
                constructor(circle?: T, alphaAngle1?: number, alphaAngle2?: number, sense?: boolean);
                circle: T;
                alphaAngle1: number;
                alphaAngle2: number;
                sense: boolean;
            }
            class ArcEdgeCirclePointAngleDto<T> {
                constructor(circle?: T, alphaAngle?: number, alphaAngle2?: number, sense?: boolean);
                circle: T;
                point: Base.Point3;
                alphaAngle: number;
                sense: boolean;
            }
            class ArcEdgeThreePointsDto {
                constructor(start?: Base.Point3, middle?: Base.Point3, end?: Base.Point3);
                start: Base.Point3;
                middle: Base.Point3;
                end: Base.Point3;
            }
            class CylinderDto {
                constructor(radius?: number, height?: number, center?: Base.Point3, direction?: Base.Vector3, angle?: number, originOnCenter?: boolean);
                radius: number;
                height: number;
                center: Base.Point3;
                direction?: Base.Vector3;
                angle?: number;
                originOnCenter?: boolean;
            }
            class CylindersOnLinesDto {
                constructor(radius?: number, lines?: Base.Line3[]);
                radius: number;
                lines: Base.Line3[];
            }
            class FilletDto<T> {
                constructor(shape?: T, radius?: number, radiusList?: number[], indexes?: number[]);
                shape: T;
                radius?: number;
                radiusList?: number[];
                indexes?: number[];
            }
            class FilletShapesDto<T> {
                constructor(shapes?: T[], radius?: number, radiusList?: number[], indexes?: number[]);
                shapes: T[];
                radius?: number;
                radiusList?: number[];
                indexes?: number[];
            }
            class FilletEdgesListDto<T, U> {
                constructor(shape?: T, edges?: U[], radiusList?: number[]);
                shape: T;
                edges: U[];
                radiusList: number[];
            }
            class FilletEdgesListOneRadiusDto<T, U> {
                constructor(shape?: T, edges?: U[], radius?: number);
                shape: T;
                edges: U[];
                radius: number;
            }
            class FilletEdgeVariableRadiusDto<T, U> {
                constructor(shape?: T, edge?: U, radiusList?: number[], paramsU?: number[]);
                shape: T;
                edge: U;
                radiusList: number[];
                paramsU: number[];
            }
            class FilletEdgesVariableRadiusDto<T, U> {
                constructor(shape?: T, edges?: U[], radiusLists?: number[][], paramsULists?: number[][]);
                shape: T;
                edges: U[];
                radiusLists: number[][];
                paramsULists: number[][];
            }
            class FilletEdgesSameVariableRadiusDto<T, U> {
                constructor(shape?: T, edges?: U[], radiusList?: number[], paramsU?: number[]);
                shape: T;
                edges: U[];
                radiusList: number[];
                paramsU: number[];
            }
            class Fillet3DWiresDto<T> {
                constructor(shapes?: T[], radius?: number, direction?: Base.Vector3, radiusList?: number[], indexes?: number[]);
                shapes: T[];
                radius?: number;
                radiusList?: number[];
                indexes?: number[];
                direction: Base.Vector3;
            }
            class Fillet3DWireDto<T> {
                constructor(shape?: T, radius?: number, direction?: Base.Vector3, radiusList?: number[], indexes?: number[]);
                shape: T;
                radius?: number;
                radiusList?: number[];
                indexes?: number[];
                direction: Base.Vector3;
            }
            class ChamferDto<T> {
                constructor(shape?: T, distance?: number, distanceList?: number[], indexes?: number[]);
                shape: T;
                distance?: number;
                distanceList?: number[];
                indexes?: number[];
            }
            class ChamferEdgesListDto<T, U> {
                constructor(shape?: T, edges?: U[], distanceList?: number[]);
                shape: T;
                edges: U[];
                distanceList: number[];
            }
            class ChamferEdgeDistAngleDto<T, U, F> {
                constructor(shape?: T, edge?: U, face?: F, distance?: number, angle?: number);
                shape: T;
                edge: U;
                face: F;
                distance: number;
                angle: number;
            }
            class ChamferEdgeTwoDistancesDto<T, U, F> {
                constructor(shape?: T, edge?: U, face?: F, distance1?: number, distance2?: number);
                shape: T;
                edge: U;
                face: F;
                distance1: number;
                distance2: number;
            }
            class ChamferEdgesTwoDistancesListsDto<T, U, F> {
                constructor(shape?: T, edges?: U[], faces?: F[], distances1?: number[], distances2?: number[]);
                shape: T;
                edges: U[];
                faces: F[];
                distances1: number[];
                distances2: number[];
            }
            class ChamferEdgesTwoDistancesDto<T, U, F> {
                constructor(shape?: T, edges?: U[], faces?: F[], distance1?: number, distance2?: number);
                shape: T;
                edges: U[];
                faces: F[];
                distance1: number;
                distance2: number;
            }
            class ChamferEdgesDistsAnglesDto<T, U, F> {
                constructor(shape?: T, edges?: U[], faces?: F[], distances?: number[], angles?: number[]);
                shape: T;
                edges: U[];
                faces: F[];
                distances: number[];
                angles: number[];
            }
            class ChamferEdgesDistAngleDto<T, U, F> {
                constructor(shape?: T, edges?: U[], faces?: F[], distance?: number, angle?: number);
                shape: T;
                edges: U[];
                faces: F[];
                distance: number;
                angle: number;
            }
            class BSplineDto {
                constructor(points?: Base.Point3[], closed?: boolean);
                points: Base.Point3[];
                closed: boolean;
            }
            class BSplinesDto {
                constructor(bSplines?: BSplineDto[], returnCompound?: boolean);
                bSplines: BSplineDto[];
                returnCompound: boolean;
            }
            class WireFromTwoCirclesTanDto<T> {
                constructor(circle1?: T, circle2?: T, keepLines?: twoSidesStrictEnum, circleRemainders?: fourSidesStrictEnum, tolerance?: number);
                circle1: T;
                circle2: T;
                keepLines: twoSidesStrictEnum;
                circleRemainders: fourSidesStrictEnum;
                tolerance: number;
            }
            class FaceFromMultipleCircleTanWiresDto<T> {
                constructor(circles?: T[], combination?: combinationCirclesForFaceEnum, unify?: boolean, tolerance?: number);
                circles: T[];
                combination: combinationCirclesForFaceEnum;
                unify: boolean;
                tolerance: number;
            }
            class FaceFromMultipleCircleTanWireCollectionsDto<T> {
                constructor(listsOfCircles?: T[][], combination?: combinationCirclesForFaceEnum, unify?: boolean, tolerance?: number);
                listsOfCircles: T[][];
                combination: combinationCirclesForFaceEnum;
                unify: boolean;
                tolerance: number;
            }
            class ZigZagBetweenTwoWiresDto<T> {
                constructor(wire1?: T, wire2?: T, nrZigZags?: number, inverse?: boolean, divideByEqualDistance?: boolean, zigZagsPerEdge?: boolean);
                wire1: T;
                wire2: T;
                nrZigZags: number;
                inverse: boolean;
                divideByEqualDistance: boolean;
                zigZagsPerEdge: boolean;
            }
            class InterpolationDto {
                constructor(points?: Base.Point3[], periodic?: boolean, tolerance?: number);
                points: Base.Point3[];
                periodic: boolean;
                tolerance: number;
            }
            class InterpolateWiresDto {
                constructor(interpolations?: InterpolationDto[], returnCompound?: boolean);
                interpolations: InterpolationDto[];
                returnCompound: boolean;
            }
            class BezierDto {
                constructor(points?: Base.Point3[], closed?: boolean);
                points: Base.Point3[];
                closed: boolean;
            }
            class BezierWeightsDto {
                constructor(points?: Base.Point3[], weights?: number[], closed?: boolean);
                points: Base.Point3[];
                weights: number[];
                closed: boolean;
            }
            class BezierWiresDto {
                constructor(bezierWires?: BezierDto[], returnCompound?: boolean);
                bezierWires: BezierDto[];
                returnCompound: boolean;
            }
            class DivideDto<T> {
                constructor(shape?: T, nrOfDivisions?: number, removeStartPoint?: boolean, removeEndPoint?: boolean);
                shape?: T;
                nrOfDivisions?: number;
                removeStartPoint?: boolean;
                removeEndPoint?: boolean;
            }
            class ProjectWireDto<T, U> {
                constructor(wire?: T, shape?: U, direction?: Base.Vector3);
                wire: T;
                shape: U;
                direction: Base.Vector3;
            }
            class ProjectPointsOnShapeDto<T> {
                constructor(points?: Base.Point3[], shape?: T, direction?: Base.Vector3, projectionType?: pointProjectionTypeEnum);
                points: Base.Point3[];
                shape: T;
                direction: Base.Vector3;
                projectionType: pointProjectionTypeEnum;
            }
            class WiresToPointsDto<T> {
                constructor(shape?: T, angularDeflection?: number, curvatureDeflection?: number, minimumOfPoints?: number, uTolerance?: number, minimumLength?: number);
                shape: T;
                angularDeflection: number;
                curvatureDeflection: number;
                minimumOfPoints: number;
                uTolerance: number;
                minimumLength: number;
            }
            class EdgesToPointsDto<T> {
                constructor(shape?: T, angularDeflection?: number, curvatureDeflection?: number, minimumOfPoints?: number, uTolerance?: number, minimumLength?: number);
                shape: T;
                angularDeflection: number;
                curvatureDeflection: number;
                minimumOfPoints: number;
                uTolerance: number;
                minimumLength: number;
            }
            class ProjectWiresDto<T, U> {
                constructor(wires?: T[], shape?: U, direction?: Base.Vector3);
                wires: T[];
                shape: U;
                direction: Base.Vector3;
            }
            class DivideShapesDto<T> {
                constructor(shapes: T[], nrOfDivisions?: number, removeStartPoint?: boolean, removeEndPoint?: boolean);
                shapes: T[];
                nrOfDivisions: number;
                removeStartPoint: boolean;
                removeEndPoint: boolean;
            }
            class DataOnGeometryAtParamDto<T> {
                constructor(shape: T, param?: number);
                shape: T;
                param: number;
            }
            class DataOnGeometryesAtParamDto<T> {
                constructor(shapes: T[], param?: number);
                shapes: T[];
                param: number;
            }
            class PointInFaceDto<T> {
                constructor(face: T, edge: T, tEdgeParam?: number, distance2DParam?: number);
                face: T;
                edge: T;
                tEdgeParam: number;
                distance2DParam: number;
            }
            class PointsOnWireAtEqualLengthDto<T> {
                constructor(shape: T, length?: number, tryNext?: boolean, includeFirst?: boolean, includeLast?: boolean);
                shape: T;
                length: number;
                tryNext: boolean;
                includeFirst: boolean;
                includeLast: boolean;
            }
            class PointsOnWireAtPatternOfLengthsDto<T> {
                constructor(shape: T, lengths?: number[], tryNext?: boolean, includeFirst?: boolean, includeLast?: boolean);
                shape: T;
                lengths: number[];
                tryNext: boolean;
                includeFirst: boolean;
                includeLast: boolean;
            }
            class DataOnGeometryAtLengthDto<T> {
                constructor(shape: T, length?: number);
                shape: T;
                length: number;
            }
            class DataOnGeometryesAtLengthDto<T> {
                constructor(shapes: T[], length?: number);
                shapes: T[];
                length: number;
            }
            class DataOnGeometryAtLengthsDto<T> {
                constructor(shape: T, lengths?: number[]);
                shape: T;
                lengths: number[];
            }
            class CircleDto {
                constructor(radius?: number, center?: Base.Point3, direction?: Base.Vector3);
                radius: number;
                center: Base.Point3;
                direction: Base.Vector3;
            }
            class HexagonsInGridDto {
                constructor(wdith?: number, height?: number, nrHexagonsInHeight?: number, nrHexagonsInWidth?: number, flatTop?: boolean, extendTop?: boolean, extendBottom?: boolean, extendLeft?: boolean, extendRight?: boolean, scalePatternWidth?: number[], scalePatternHeight?: number[], filletPattern?: number[], inclusionPattern?: boolean[]);
                width?: number;
                height?: number;
                nrHexagonsInWidth?: number;
                nrHexagonsInHeight?: number;
                flatTop?: boolean;
                extendTop?: boolean;
                extendBottom?: boolean;
                extendLeft?: boolean;
                extendRight?: boolean;
                scalePatternWidth?: number[];
                scalePatternHeight?: number[];
                filletPattern?: number[];
                inclusionPattern?: boolean[];
            }
            class LoftDto<T> {
                constructor(shapes?: T[], makeSolid?: boolean);
                shapes: T[];
                makeSolid: boolean;
            }
            class LoftAdvancedDto<T> {
                constructor(shapes?: T[], makeSolid?: boolean, closed?: boolean, periodic?: boolean, straight?: boolean, nrPeriodicSections?: number, useSmoothing?: boolean, maxUDegree?: number, tolerance?: number, parType?: approxParametrizationTypeEnum, startVertex?: Base.Point3, endVertex?: Base.Point3);
                shapes: T[];
                makeSolid: boolean;
                closed: boolean;
                periodic: boolean;
                straight: boolean;
                nrPeriodicSections: number;
                useSmoothing: boolean;
                maxUDegree: number;
                tolerance: number;
                parType: approxParametrizationTypeEnum;
                startVertex?: Base.Point3;
                endVertex?: Base.Point3;
            }
            class OffsetDto<T, U> {
                constructor(shape?: T, face?: U, distance?: number, tolerance?: number);
                shape: T;
                face?: U;
                distance: number;
                tolerance: number;
            }
            class OffsetAdvancedDto<T, U> {
                constructor(shape?: T, face?: U, distance?: number, tolerance?: number, joinType?: joinTypeEnum, removeIntEdges?: boolean);
                shape: T;
                face?: U;
                distance: number;
                tolerance: number;
                joinType: joinTypeEnum;
                removeIntEdges: boolean;
            }
            class RevolveDto<T> {
                constructor(shape?: T, angle?: number, direction?: Base.Vector3, copy?: boolean);
                shape: T;
                angle: number;
                direction: Base.Vector3;
                copy: boolean;
            }
            class ShapeShapesDto<T, U> {
                constructor(shape?: T, shapes?: U[]);
                shape: T;
                shapes: U[];
            }
            class WiresOnFaceDto<T, U> {
                constructor(wires?: T[], face?: U);
                wires: T[];
                face: U;
            }
            class PipeWiresCylindricalDto<T> {
                constructor(shapes?: T[], radius?: number, makeSolid?: boolean, trihedronEnum?: geomFillTrihedronEnum, forceApproxC1?: boolean);
                shapes: T[];
                radius: number;
                makeSolid: boolean;
                trihedronEnum: geomFillTrihedronEnum;
                forceApproxC1: boolean;
            }
            class PipeWireCylindricalDto<T> {
                constructor(shape?: T, radius?: number, makeSolid?: boolean, trihedronEnum?: geomFillTrihedronEnum, forceApproxC1?: boolean);
                shape: T;
                radius: number;
                makeSolid: boolean;
                trihedronEnum: geomFillTrihedronEnum;
                forceApproxC1: boolean;
            }
            class PipePolygonWireNGonDto<T> {
                constructor(shapes?: T, radius?: number, nrCorners?: number, makeSolid?: boolean, trihedronEnum?: geomFillTrihedronEnum, forceApproxC1?: boolean);
                shape: T;
                radius: number;
                nrCorners: number;
                makeSolid: boolean;
                trihedronEnum: geomFillTrihedronEnum;
                forceApproxC1: boolean;
            }
            class ExtrudeDto<T> {
                constructor(shape?: T, direction?: Base.Vector3);
                shape: T;
                direction: Base.Vector3;
            }
            class ExtrudeShapesDto<T> {
                constructor(shapes?: T[], direction?: Base.Vector3);
                shapes: T[];
                direction: Base.Vector3;
            }
            class SplitDto<T> {
                constructor(shape?: T, shapes?: T[]);
                shape: T;
                shapes: T[];
                localFuzzyTolerance: number;
                nonDestructive: boolean;
            }
            class UnionDto<T> {
                constructor(shapes?: T[], keepEdges?: boolean);
                shapes: T[];
                keepEdges: boolean;
            }
            class DifferenceDto<T> {
                constructor(shape?: T, shapes?: T[], keepEdges?: boolean);
                shape: T;
                shapes: T[];
                keepEdges: boolean;
            }
            class IntersectionDto<T> {
                constructor(shapes?: T[], keepEdges?: boolean);
                shapes: T[];
                keepEdges: boolean;
            }
            class ShapeDto<T> {
                constructor(shape?: T);
                shape: T;
            }
            class MeshMeshIntersectionTwoShapesDto<T> {
                constructor(shape1?: T, shape2?: T, precision1?: number, precision2?: number);
                shape1: T;
                precision1?: number;
                shape2: T;
                precision2?: number;
            }
            class MeshMeshesIntersectionOfShapesDto<T> {
                constructor(shape?: T, shapes?: T[], precision?: number, precisionShapes?: number[]);
                shape?: T;
                precision?: number;
                shapes?: T[];
                precisionShapes?: number[];
            }
            class CompareShapesDto<T> {
                constructor(shape?: T, otherShape?: T);
                shape: T;
                otherShape: T;
            }
            class FixSmallEdgesInWireDto<T> {
                constructor(shape?: T, lockvtx?: boolean, precsmall?: number);
                shape: T;
                lockvtx: boolean;
                precsmall: number;
            }
            class BasicShapeRepairDto<T> {
                constructor(shape?: T, precision?: number, maxTolerance?: number, minTolerance?: number);
                shape: T;
                precision: number;
                maxTolerance: number;
                minTolerance: number;
            }
            class FixClosedDto<T> {
                constructor(shape?: T, precision?: number);
                shape: T;
                precision: number;
            }
            class ShapesWithToleranceDto<T> {
                constructor(shapes?: T[], tolerance?: number);
                shapes: T[];
                tolerance: number;
            }
            class ShapeWithToleranceDto<T> {
                constructor(shape?: T, tolerance?: number);
                shape: T;
                tolerance: number;
            }
            class ShapeIndexDto<T> {
                constructor(shape?: T, index?: number);
                shape: T;
                index: number;
            }
            class EdgeIndexDto<T> {
                constructor(shape?: T, index?: number);
                shape: T;
                index: number;
            }
            class RotationExtrudeDto<T> {
                constructor(shape?: T, height?: number, angle?: number, makeSolid?: boolean);
                shape: T;
                height: number;
                angle: number;
                makeSolid: boolean;
            }
            class ThickSolidByJoinDto<T> {
                constructor(shape?: T, shapes?: T[], offset?: number, tolerance?: number, intersection?: boolean, selfIntersection?: boolean, joinType?: joinTypeEnum, removeIntEdges?: boolean);
                shape: T;
                shapes: T[];
                offset: number;
                tolerance: number;
                intersection: boolean;
                selfIntersection: boolean;
                joinType: joinTypeEnum;
                removeIntEdges: boolean;
            }
            class TransformDto<T> {
                constructor(shape?: T, translation?: Base.Vector3, rotationAxis?: Base.Vector3, rotationAngle?: number, scaleFactor?: number);
                shape: T;
                translation: Base.Vector3;
                rotationAxis: Base.Vector3;
                rotationAngle: number;
                scaleFactor: number;
            }
            class TransformShapesDto<T> {
                constructor(shapes?: T[], translation?: Base.Vector3[], rotationAxes?: Base.Vector3[], rotationDegrees?: number[], scaleFactors?: number[]);
                shapes: T[];
                translations: Base.Vector3[];
                rotationAxes: Base.Vector3[];
                rotationAngles: number[];
                scaleFactors: number[];
            }
            class TranslateDto<T> {
                constructor(shape?: T, translation?: Base.Vector3);
                shape: T;
                translation: Base.Vector3;
            }
            class TranslateShapesDto<T> {
                constructor(shapes?: T[], translations?: Base.Vector3[]);
                shapes: T[];
                translations: Base.Vector3[];
            }
            class AlignNormAndAxisDto<T> {
                constructor(shape?: T, fromOrigin?: Base.Point3, fromNorm?: Base.Vector3, fromAx?: Base.Vector3, toOrigin?: Base.Point3, toNorm?: Base.Vector3, toAx?: Base.Vector3);
                shape: T;
                fromOrigin: Base.Point3;
                fromNorm: Base.Vector3;
                fromAx: Base.Vector3;
                toOrigin: Base.Point3;
                toNorm: Base.Vector3;
                toAx: Base.Vector3;
            }
            class AlignDto<T> {
                constructor(shape?: T, fromOrigin?: Base.Point3, fromDirection?: Base.Vector3, toOrigin?: Base.Point3, toDirection?: Base.Vector3);
                shape: T;
                fromOrigin: Base.Point3;
                fromDirection: Base.Vector3;
                toOrigin: Base.Point3;
                toDirection: Base.Vector3;
            }
            class AlignShapesDto<T> {
                constructor(shapes?: T[], fromOrigins?: Base.Vector3[], fromDirections?: Base.Vector3[], toOrigins?: Base.Vector3[], toDirections?: Base.Vector3[]);
                shapes: T[];
                fromOrigins: Base.Point3[];
                fromDirections: Base.Vector3[];
                toOrigins: Base.Point3[];
                toDirections: Base.Vector3[];
            }
            class MirrorDto<T> {
                constructor(shape?: T, origin?: Base.Point3, direction?: Base.Vector3);
                shape: T;
                origin: Base.Point3;
                direction: Base.Vector3;
            }
            class MirrorShapesDto<T> {
                constructor(shapes?: T[], origins?: Base.Point3[], directions?: Base.Vector3[]);
                shapes: T[];
                origins: Base.Point3[];
                directions: Base.Vector3[];
            }
            class MirrorAlongNormalDto<T> {
                constructor(shape?: T, origin?: Base.Point3, normal?: Base.Vector3);
                shape: T;
                origin: Base.Point3;
                normal: Base.Vector3;
            }
            class MirrorAlongNormalShapesDto<T> {
                constructor(shapes?: T[], origins?: Base.Point3[], normals?: Base.Vector3[]);
                shapes: T[];
                origins: Base.Point3[];
                normals: Base.Vector3[];
            }
            class AlignAndTranslateDto<T> {
                constructor(shape?: T, direction?: Base.Vector3, center?: Base.Vector3);
                shape: T;
                direction: Base.Vector3;
                center: Base.Vector3;
            }
            class UnifySameDomainDto<T> {
                constructor(shape?: T, unifyEdges?: boolean, unifyFaces?: boolean, concatBSplines?: boolean);
                shape: T;
                unifyEdges: boolean;
                unifyFaces: boolean;
                concatBSplines: boolean;
            }
            class FilterFacesPointsDto<T> {
                constructor(shapes?: T[], points?: Base.Point3[], tolerance?: number, useBndBox?: boolean, gapTolerance?: number, keepIn?: boolean, keepOn?: boolean, keepOut?: boolean, keepUnknown?: boolean, flatPointsArray?: boolean);
                shapes: T[];
                points: Base.Point3[];
                tolerance: number;
                useBndBox: boolean;
                gapTolerance: number;
                keepIn: boolean;
                keepOn: boolean;
                keepOut: boolean;
                keepUnknown: boolean;
                flatPointsArray: boolean;
            }
            class FilterFacePointsDto<T> {
                constructor(shape?: T, points?: Base.Point3[], tolerance?: number, useBndBox?: boolean, gapTolerance?: number, keepIn?: boolean, keepOn?: boolean, keepOut?: boolean, keepUnknown?: boolean);
                shape: T;
                points: Base.Point3[];
                tolerance: number;
                useBndBox: boolean;
                gapTolerance: number;
                keepIn: boolean;
                keepOn: boolean;
                keepOut: boolean;
                keepUnknown: boolean;
            }
            class FilterSolidPointsDto<T> {
                constructor(shape?: T, points?: Base.Point3[], tolerance?: number, keepIn?: boolean, keepOn?: boolean, keepOut?: boolean, keepUnknown?: boolean);
                shape: T;
                points: Base.Point3[];
                tolerance: number;
                keepIn: boolean;
                keepOn: boolean;
                keepOut: boolean;
                keepUnknown: boolean;
            }
            class AlignAndTranslateShapesDto<T> {
                constructor(shapes?: T[], directions?: Base.Vector3[], centers?: Base.Vector3[]);
                shapes: T[];
                directions: Base.Vector3[];
                centers: Base.Vector3[];
            }
            class RotateDto<T> {
                constructor(shape?: T, axis?: Base.Vector3, angle?: number);
                shape: T;
                axis: Base.Vector3;
                angle: number;
            }
            class RotateAroundCenterDto<T> {
                constructor(shape?: T, angle?: number, center?: Base.Point3, axis?: Base.Vector3);
                shape: T;
                angle: number;
                center: Base.Point3;
                axis: Base.Vector3;
            }
            class RotateShapesDto<T> {
                constructor(shapes?: T[], axes?: Base.Vector3[], angles?: number[]);
                shapes: T[];
                axes: Base.Vector3[];
                angles: number[];
            }
            class RotateAroundCenterShapesDto<T> {
                constructor(shapes?: T[], angles?: number[], centers?: Base.Point3[], axes?: Base.Vector3[]);
                shapes: T[];
                angles: number[];
                centers: Base.Point3[];
                axes: Base.Vector3[];
            }
            class ScaleDto<T> {
                constructor(shape?: T, factor?: number);
                shape: T;
                factor: number;
            }
            class ScaleShapesDto<T> {
                constructor(shapes?: T[], factors?: number[]);
                shapes: T[];
                factors: number[];
            }
            class Scale3DDto<T> {
                constructor(shape?: T, scale?: Base.Vector3, center?: Base.Point3);
                shape: T;
                scale: Base.Vector3;
                center: Base.Point3;
            }
            class Scale3DShapesDto<T> {
                constructor(shapes?: T[], scales?: Base.Vector3[], centers?: Base.Point3[]);
                shapes: T[];
                scales: Base.Vector3[];
                centers: Base.Point3[];
            }
            class ShapeToMeshDto<T> {
                constructor(shape?: T, precision?: number, adjustYtoZ?: boolean);
                shape: T;
                precision: number;
                adjustYtoZ: boolean;
            }
            class ShapeFacesToPolygonPointsDto<T> {
                constructor(shape?: T, precision?: number, adjustYtoZ?: boolean, reversedPoints?: boolean);
                shape: T;
                precision: number;
                adjustYtoZ: boolean;
                reversedPoints: boolean;
            }
            class ShapesToMeshesDto<T> {
                constructor(shapes?: T[], precision?: number, adjustYtoZ?: boolean);
                shapes: T[];
                precision: number;
                adjustYtoZ: boolean;
            }
            class SaveStepDto<T> {
                constructor(shape?: T, fileName?: string, adjustYtoZ?: boolean, tryDownload?: boolean);
                shape: T;
                fileName: string;
                adjustYtoZ: boolean;
                fromRightHanded?: boolean;
                tryDownload?: boolean;
            }
            class SaveStlDto<T> {
                constructor(shape?: T, fileName?: string, precision?: number, adjustYtoZ?: boolean, tryDownload?: boolean, binary?: boolean);
                shape: T;
                fileName: string;
                precision: number;
                adjustYtoZ: boolean;
                tryDownload?: boolean;
                binary?: boolean;
            }
            class ShapeToDxfPathsDto<T> {
                constructor(shape?: T, angularDeflection?: number, curvatureDeflection?: number, minimumOfPoints?: number, uTolerance?: number, minimumLength?: number);
                shape: T;
                angularDeflection: number;
                curvatureDeflection: number;
                minimumOfPoints: number;
                uTolerance: number;
                minimumLength: number;
            }
            class DxfPathsWithLayerDto {
                constructor(paths?: IO.DxfPathDto[], layer?: string, color?: Base.Color);
                paths: IO.DxfPathDto[];
                layer: string;
                color: Base.Color;
            }
            class DxfPathsPartsListDto {
                constructor(pathsParts?: IO.DxfPathsPartDto[], colorFormat?: dxfColorFormatEnum, acadVersion?: dxfAcadVersionEnum, tryDownload?: boolean);
                pathsParts: IO.DxfPathsPartDto[];
                colorFormat: dxfColorFormatEnum;
                acadVersion: dxfAcadVersionEnum;
                fileName?: string;
                tryDownload?: boolean;
            }
            class SaveDxfDto<T> {
                constructor(shape?: T, fileName?: string, tryDownload?: boolean, angularDeflection?: number, curvatureDeflection?: number, minimumOfPoints?: number, uTolerance?: number, minimumLength?: number);
                shape: T;
                fileName: string;
                tryDownload?: boolean;
                angularDeflection: number;
                curvatureDeflection: number;
                minimumOfPoints: number;
                uTolerance: number;
                minimumLength: number;
            }
            class ImportStepIgesFromTextDto {
                constructor(text?: string, fileType?: fileTypeEnum, adjustZtoY?: boolean);
                text: string;
                fileType: fileTypeEnum;
                adjustZtoY: boolean;
            }
            class ImportStepIgesDto {
                constructor(assetFile?: File, adjustZtoY?: boolean);
                assetFile: File;
                adjustZtoY: boolean;
            }
            class LoadStepOrIgesDto {
                constructor(filetext?: string | ArrayBuffer, fileName?: string, adjustZtoY?: boolean);
                filetext: string | ArrayBuffer;
                fileName: string;
                adjustZtoY: boolean;
            }
            class CompoundShapesDto<T> {
                constructor(shapes?: T[]);
                shapes: T[];
            }
            class ThisckSolidSimpleDto<T> {
                constructor(shape?: T, offset?: number);
                shape: T;
                offset: number;
            }
            class Offset3DWireDto<T> {
                constructor(shape?: T, offset?: number, direction?: Base.Vector3);
                shape: T;
                offset: number;
                direction: Base.Vector3;
            }
            class FaceFromWireDto<T> {
                constructor(shape?: T, planar?: boolean);
                shape: T;
                planar: boolean;
            }
            class FaceFromWireOnFaceDto<T, U> {
                constructor(wire?: T, face?: U, inside?: boolean);
                wire: T;
                face: U;
                inside: boolean;
            }
            class FacesFromWiresOnFaceDto<T, U> {
                constructor(wires?: T[], face?: U, inside?: boolean);
                wires: T[];
                face: U;
                inside: boolean;
            }
            class FaceFromWiresDto<T> {
                constructor(shapes?: T[], planar?: boolean);
                shapes: T[];
                planar: boolean;
            }
            class FacesFromWiresDto<T> {
                constructor(shapes?: T[], planar?: boolean);
                shapes: T[];
                planar: boolean;
            }
            class FaceFromWiresOnFaceDto<T, U> {
                constructor(wires?: T[], face?: U, inside?: boolean);
                wires: T[];
                face: U;
                inside: boolean;
            }
            class SewDto<T> {
                constructor(shapes?: T[], tolerance?: number);
                shapes: T[];
                tolerance: number;
            }
            class FaceIsoCurveAtParamDto<T> {
                constructor(shape?: T, param?: number, dir?: "u" | "v");
                shape: T;
                param: number;
                dir: "u" | "v";
            }
            class DivideFaceToUVPointsDto<T> {
                constructor(shape?: T, nrOfPointsU?: number, nrOfPointsV?: number, flat?: boolean);
                shape: T;
                nrOfPointsU: number;
                nrOfPointsV: number;
                flat: boolean;
            }
            class Geom2dEllipseDto {
                constructor(center?: Base.Point2, direction?: Base.Vector2, radiusMinor?: number, radiusMajor?: number, sense?: boolean);
                center: Base.Point2;
                direction: Base.Vector2;
                radiusMinor: number;
                radiusMajor: number;
                sense: boolean;
            }
            class Geom2dCircleDto {
                constructor(center?: Base.Point2, direction?: Base.Vector2, radius?: number, sense?: boolean);
                center: Base.Point2;
                direction: Base.Vector2;
                radius: number;
                sense: boolean;
            }
            class ChristmasTreeDto {
                constructor(height?: number, innerDist?: number, outerDist?: number, nrSkirts?: number, trunkHeight?: number, trunkWidth?: number, half?: boolean, rotation?: number, origin?: Base.Point3, direction?: Base.Vector3);
                height: number;
                innerDist: number;
                outerDist: number;
                nrSkirts: number;
                trunkHeight: number;
                trunkWidth: number;
                half: boolean;
                rotation: number;
                origin: Base.Point3;
                direction: Base.Vector3;
            }
            class StarDto {
                constructor(outerRadius?: number, innerRadius?: number, numRays?: number, center?: Base.Point3, direction?: Base.Vector3, offsetOuterEdges?: number, half?: boolean);
                center: Base.Point3;
                direction: Base.Vector3;
                numRays: number;
                outerRadius: number;
                innerRadius: number;
                offsetOuterEdges?: number;
                half: boolean;
            }
            class ParallelogramDto {
                constructor(center?: Base.Point3, direction?: Base.Vector3, aroundCenter?: boolean, width?: number, height?: number, angle?: number);
                center: Base.Point3;
                direction: Base.Vector3;
                aroundCenter: boolean;
                width: number;
                height: number;
                angle: number;
            }
            class Heart2DDto {
                constructor(center?: Base.Point3, direction?: Base.Vector3, rotation?: number, sizeApprox?: number);
                center: Base.Point3;
                direction: Base.Vector3;
                rotation: number;
                sizeApprox: number;
            }
            class NGonWireDto {
                constructor(center?: Base.Point3, direction?: Base.Vector3, nrCorners?: number, radius?: number);
                center: Base.Point3;
                direction: Base.Vector3;
                nrCorners: number;
                radius: number;
            }
            class EllipseDto {
                constructor(center?: Base.Point3, direction?: Base.Vector3, radiusMinor?: number, radiusMajor?: number);
                center: Base.Point3;
                direction: Base.Vector3;
                radiusMinor: number;
                radiusMajor: number;
            }
            class TextWiresDto {
                constructor(text?: string, xOffset?: number, yOffset?: number, height?: number, lineSpacing?: number, letterSpacing?: number, align?: Base.horizontalAlignEnum, extrudeOffset?: number, origin?: Base.Point3, rotation?: number, direction?: Base.Vector3, centerOnOrigin?: boolean);
                text?: string;
                xOffset?: number;
                yOffset?: number;
                height?: number;
                lineSpacing?: number;
                letterSpacing?: number;
                align?: Base.horizontalAlignEnum;
                extrudeOffset?: number;
                centerOnOrigin: boolean;
            }
            class GeomCylindricalSurfaceDto {
                constructor(radius?: number, center?: Base.Point3, direction?: Base.Vector3);
                radius: number;
                center: Base.Point3;
                direction: Base.Vector3;
            }
            class Geom2dTrimmedCurveDto<T> {
                constructor(shape?: T, u1?: number, u2?: number, sense?: boolean, adjustPeriodic?: boolean);
                shape: T;
                u1: number;
                u2: number;
                sense: boolean;
                adjustPeriodic: boolean;
            }
            class Geom2dSegmentDto {
                constructor(start?: Base.Point2, end?: Base.Point2);
                start: Base.Point2;
                end: Base.Point2;
            }
            class SliceDto<T> {
                constructor(shape?: T, step?: number, direction?: Base.Vector3);
                shape: T;
                step: number;
                direction: Base.Vector3;
            }
            class SliceInStepPatternDto<T> {
                constructor(shape?: T, steps?: number[], direction?: Base.Vector3);
                shape: T;
                steps: number[];
                direction: Base.Vector3;
            }
            class SimpleLinearLengthDimensionDto {
                constructor(start?: Base.Point3, end?: Base.Point3, direction?: Base.Vector3, offsetFromPoints?: number, crossingSize?: number, labelSuffix?: string, labelSize?: number, labelOffset?: number, labelRotation?: number, arrowType?: dimensionEndTypeEnum, arrowSize?: number, arrowAngle?: number, arrowsFlipped?: boolean, labelFlipHorizontal?: boolean, labelFlipVertical?: boolean, labelOverwrite?: string, removeTrailingZeros?: boolean);
                start: Base.Point3;
                end?: Base.Point3;
                direction?: Base.Vector3;
                offsetFromPoints?: number;
                crossingSize?: number;
                decimalPlaces?: number;
                labelSuffix?: string;
                labelSize?: number;
                labelOffset?: number;
                labelRotation?: number;
                endType?: dimensionEndTypeEnum;
                arrowSize?: number;
                arrowAngle?: number;
                arrowsFlipped?: boolean;
                labelFlipHorizontal?: boolean;
                labelFlipVertical?: boolean;
                labelOverwrite?: string;
                removeTrailingZeros?: boolean;
            }
            class SimpleAngularDimensionDto {
                constructor(direction1?: Base.Point3, direction2?: Base.Point3, center?: Base.Point3, radius?: number, offsetFromCenter?: number, crossingSize?: number, radians?: boolean, labelSuffix?: string, labelSize?: number, labelOffset?: number, endType?: dimensionEndTypeEnum, arrowSize?: number, arrowAngle?: number, arrowsFlipped?: boolean, labelRotation?: number, labelFlipHorizontal?: boolean, labelFlipVertical?: boolean, labelOverwrite?: string, removeTrailingZeros?: boolean);
                direction1: Base.Point3;
                direction2: Base.Point3;
                center: Base.Point3;
                radius: number;
                offsetFromCenter: number;
                extraSize: number;
                decimalPlaces: number;
                labelSuffix: string;
                labelSize: number;
                labelOffset: number;
                radians: boolean;
                endType?: dimensionEndTypeEnum;
                arrowSize?: number;
                arrowAngle?: number;
                arrowsFlipped?: boolean;
                labelRotation?: number;
                labelFlipHorizontal?: boolean;
                labelFlipVertical?: boolean;
                labelOverwrite?: string;
                removeTrailingZeros?: boolean;
            }
            class PinWithLabelDto {
                constructor(startPoint?: Base.Point3, endPoint?: Base.Point3, direction?: Base.Vector3, offsetFromStart?: number, label?: string, labelOffset?: number, labelSize?: number, endType?: dimensionEndTypeEnum, arrowSize?: number, arrowAngle?: number, arrowsFlipped?: boolean, labelRotation?: number, labelFlipHorizontal?: boolean, labelFlipVertical?: boolean);
                startPoint: Base.Point3;
                endPoint?: Base.Point3;
                direction?: Base.Vector3;
                offsetFromStart?: number;
                label?: string;
                labelOffset?: number;
                labelSize?: number;
                endType?: dimensionEndTypeEnum;
                arrowSize?: number;
                arrowAngle?: number;
                arrowsFlipped?: boolean;
                labelRotation?: number;
                labelFlipHorizontal?: boolean;
                labelFlipVertical?: boolean;
            }
            class StarSolidDto extends StarDto {
                constructor(outerRadius?: number, innerRadius?: number, numRays?: number, center?: Base.Point3, direction?: Base.Vector3, offsetOuterEdges?: number, half?: boolean, extrusionLengthFront?: number, extrusionLengthBack?: number);
                extrusionLengthFront: number;
                extrusionLengthBack: number;
            }
            class NGonSolidDto extends NGonWireDto {
                constructor(center?: Base.Point3, direction?: Base.Vector3, nrCorners?: number, radius?: number, extrusionLengthFront?: number, extrusionLengthBack?: number);
                extrusionLengthFront: number;
                extrusionLengthBack: number;
            }
            class ParallelogramSolidDto extends ParallelogramDto {
                constructor(center?: Base.Point3, direction?: Base.Vector3, aroundCenter?: boolean, width?: number, height?: number, angle?: number, extrusionLengthFront?: number, extrusionLengthBack?: number);
                extrusionLengthFront: number;
                extrusionLengthBack: number;
            }
            class HeartSolidDto extends Heart2DDto {
                constructor(center?: Base.Point3, direction?: Base.Vector3, rotation?: number, sizeApprox?: number, extrusionLengthFront?: number, extrusionLengthBack?: number);
                extrusionLengthFront: number;
                extrusionLengthBack: number;
            }
            class ChristmasTreeSolidDto extends ChristmasTreeDto {
                constructor(height?: number, innerDist?: number, outerDist?: number, nrSkirts?: number, trunkHeight?: number, trunkWidth?: number, half?: boolean, rotation?: number, origin?: Base.Point3, direction?: Base.Vector3, extrusionLengthFront?: number, extrusionLengthBack?: number);
                extrusionLengthFront: number;
                extrusionLengthBack: number;
            }
            class LPolygonSolidDto extends LPolygonDto {
                constructor(widthFirst?: number, lengthFirst?: number, widthSecond?: number, lengthSecond?: number, align?: directionEnum, rotation?: number, center?: Base.Point3, direction?: Base.Vector3, extrusionLengthFront?: number, extrusionLengthBack?: number);
                extrusionLengthFront: number;
                extrusionLengthBack: number;
            }
        }
        declare namespace BabylonCamera {
            class ArcRotateCameraDto {
                constructor(radius?: number, alpha?: number, beta?: number, lowerRadiusLimit?: number, upperRadiusLimit?: number, lowerAlphaLimit?: number, upperAlphaLimit?: number, lowerBetaLimit?: number, upperBetaLimit?: number, angularSensibilityX?: number, angularSensibilityY?: number, panningSensibility?: number, wheelPrecision?: number, maxZ?: number);
                radius: number;
                target: Base.Point3;
                alpha: number;
                beta: number;
                lowerRadiusLimit: any;
                upperRadiusLimit: any;
                lowerAlphaLimit: any;
                upperAlphaLimit: any;
                lowerBetaLimit: number;
                upperBetaLimit: number;
                angularSensibilityX: number;
                angularSensibilityY: number;
                panningSensibility: number;
                wheelPrecision: number;
                maxZ: number;
            }
            class FreeCameraDto {
                constructor(position?: Base.Point3, target?: Base.Point3);
                position: Base.Point3;
                target: Base.Point3;
            }
            class TargetCameraDto {
                constructor(position?: Base.Point3, target?: Base.Point3);
                position: Base.Point3;
                target: Base.Point3;
            }
            class PositionDto {
                constructor(camera?: BABYLON.TargetCamera, position?: Base.Point3);
                camera: BABYLON.TargetCamera;
                position: Base.Point3;
            }
            class SpeedDto {
                constructor(camera?: BABYLON.TargetCamera, speed?: number);
                camera: BABYLON.TargetCamera;
                speed: number;
            }
            class TargetDto {
                constructor(camera?: BABYLON.TargetCamera, target?: Base.Point3);
                camera: BABYLON.TargetCamera;
                target: Base.Point3;
            }
            class MinZDto {
                constructor(camera?: BABYLON.Camera, minZ?: number);
                camera: BABYLON.Camera;
                minZ: number;
            }
            class MaxZDto {
                constructor(camera?: BABYLON.Camera, maxZ?: number);
                camera: BABYLON.Camera;
                maxZ: number;
            }
            class OrthographicDto {
                constructor(camera?: BABYLON.Camera, orthoLeft?: number, orthoRight?: number, orthoTop?: number, orthoBottom?: number);
                camera: BABYLON.Camera;
                orthoLeft: number;
                orthoRight: number;
                orthoBottom: number;
                orthoTop: number;
            }
            class CameraDto {
                constructor(camera?: BABYLON.Camera);
                camera: BABYLON.Camera;
            }
        }
        declare namespace BabylonGaussianSplatting {
            class CreateGaussianSplattingMeshDto {
                constructor(url?: string);
                url: string;
            }
            class GaussianSplattingMeshDto {
                constructor(babylonMesh?: BABYLON.GaussianSplattingMesh);
                babylonMesh: BABYLON.GaussianSplattingMesh;
            }
        }
        declare namespace BabylonGizmo {
            enum positionGizmoObservableSelectorEnum {
                onDragStartObservable = "onDragStartObservable",
                onDragObservable = "onDragObservable",
                onDragEndObservable = "onDragEndObservable"
            }
            enum rotationGizmoObservableSelectorEnum {
                onDragStartObservable = "onDragStartObservable",
                onDragObservable = "onDragObservable",
                onDragEndObservable = "onDragEndObservable"
            }
            enum scaleGizmoObservableSelectorEnum {
                onDragStartObservable = "onDragStartObservable",
                onDragObservable = "onDragObservable",
                onDragEndObservable = "onDragEndObservable"
            }
            enum boundingBoxGizmoObservableSelectorEnum {
                onDragStartObservable = "onDragStartObservable",
                onScaleBoxDragObservable = "onScaleBoxDragObservable",
                onScaleBoxDragEndObservable = "onScaleBoxDragEndObservable",
                onRotationSphereDragObservable = "onRotationSphereDragObservable",
                onRotationSphereDragEndObservable = "onRotationSphereDragEndObservable"
            }
            class CreateGizmoDto {
                constructor(positionGizmoEnabled?: boolean, rotationGizmoEnabled?: boolean, scaleGizmoEnabled?: boolean, boundingBoxGizmoEnabled?: boolean, attachableMeshes?: BABYLON.AbstractMesh[], clearGizmoOnEmptyPointerEvent?: boolean, scaleRatio?: number, usePointerToAttachGizmos?: boolean);
                positionGizmoEnabled: boolean;
                rotationGizmoEnabled: boolean;
                scaleGizmoEnabled: boolean;
                boundingBoxGizmoEnabled: boolean;
                usePointerToAttachGizmos: boolean;
                clearGizmoOnEmptyPointerEvent: boolean;
                scaleRatio: number;
                attachableMeshes: BABYLON.AbstractMesh[];
            }
            class GizmoDto {
                constructor(gizmo?: BABYLON.IGizmo);
                gizmo: BABYLON.IGizmo;
            }
            class SetGizmoScaleRatioDto {
                constructor(gizmo?: BABYLON.IGizmo, scaleRatio?: number);
                gizmo: BABYLON.IGizmo;
                scaleRatio: number;
            }
            class GizmoManagerDto {
                constructor(gizmoManager?: BABYLON.GizmoManager);
                gizmoManager: BABYLON.GizmoManager;
            }
            class PositionGizmoDto {
                constructor(gizmoManager?: BABYLON.IPositionGizmo);
                positionGizmo: BABYLON.IPositionGizmo;
            }
            class SetPlanarGizmoEnabled {
                constructor(positionGizmo?: BABYLON.IPositionGizmo, planarGizmoEnabled?: boolean);
                positionGizmo: BABYLON.IPositionGizmo;
                planarGizmoEnabled: boolean;
            }
            class SetScaleGizmoSnapDistanceDto {
                constructor(scaleGizmo?: BABYLON.IScaleGizmo, snapDistance?: number);
                scaleGizmo: BABYLON.IScaleGizmo;
                snapDistance: number;
            }
            class SetScaleGizmoIncrementalSnapDto {
                constructor(scaleGizmo?: BABYLON.IScaleGizmo, incrementalSnap?: boolean);
                scaleGizmo: BABYLON.IScaleGizmo;
                incrementalSnap: boolean;
            }
            class SetScaleGizmoSensitivityDto {
                constructor(scaleGizmo?: BABYLON.IScaleGizmo, sensitivity?: number);
                scaleGizmo: BABYLON.IScaleGizmo;
                sensitivity: number;
            }
            class ScaleGizmoDto {
                constructor(scaleGizmo?: BABYLON.IScaleGizmo);
                scaleGizmo: BABYLON.IScaleGizmo;
            }
            class BoundingBoxGizmoDto {
                constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo);
                boundingBoxGizmo: BABYLON.BoundingBoxGizmo;
            }
            class SetBoundingBoxGizmoRotationSphereSizeDto {
                constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, rotationSphereSize?: number);
                boundingBoxGizmo: BABYLON.BoundingBoxGizmo;
                rotationSphereSize: number;
            }
            class SetBoundingBoxGizmoFixedDragMeshScreenSizeDto {
                constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, fixedDragMeshScreenSize?: boolean);
                boundingBoxGizmo: BABYLON.BoundingBoxGizmo;
                fixedDragMeshScreenSize: boolean;
            }
            class SetBoundingBoxGizmoFixedDragMeshBoundsSizeDto {
                constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, fixedDragMeshBoundsSize?: boolean);
                boundingBoxGizmo: BABYLON.BoundingBoxGizmo;
                fixedDragMeshBoundsSize: boolean;
            }
            class SetBoundingBoxGizmoFixedDragMeshScreenSizeDistanceFactorDto {
                constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, fixedDragMeshScreenSizeDistanceFactor?: number);
                boundingBoxGizmo: BABYLON.BoundingBoxGizmo;
                fixedDragMeshScreenSizeDistanceFactor: number;
            }
            class SetBoundingBoxGizmoScalingSnapDistanceDto {
                constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, scalingSnapDistance?: number);
                boundingBoxGizmo: BABYLON.BoundingBoxGizmo;
                scalingSnapDistance: number;
            }
            class SetBoundingBoxGizmoRotationSnapDistanceDto {
                constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, rotationSnapDistance?: number);
                boundingBoxGizmo: BABYLON.BoundingBoxGizmo;
                rotationSnapDistance: number;
            }
            class SetBoundingBoxGizmoScaleBoxSizeDto {
                constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, scaleBoxSize?: number);
                boundingBoxGizmo: BABYLON.BoundingBoxGizmo;
                scaleBoxSize: number;
            }
            class SetBoundingBoxGizmoIncrementalSnapDto {
                constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, incrementalSnap?: boolean);
                boundingBoxGizmo: BABYLON.BoundingBoxGizmo;
                incrementalSnap: boolean;
            }
            class SetBoundingBoxGizmoScalePivotDto {
                constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, scalePivot?: Base.Vector3);
                boundingBoxGizmo: BABYLON.BoundingBoxGizmo;
                scalePivot: Base.Vector3;
            }
            class SetBoundingBoxGizmoAxisFactorDto {
                constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, axisFactor?: Base.Vector3);
                boundingBoxGizmo: BABYLON.BoundingBoxGizmo;
                axisFactor: Base.Vector3;
            }
            class SetBoundingBoxGizmoScaleDragSpeedDto {
                constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, scaleDragSpeed?: number);
                boundingBoxGizmo: BABYLON.BoundingBoxGizmo;
                scaleDragSpeed: number;
            }
            class SetPositionGizmoSnapDistanceDto {
                constructor(positionGizmo?: BABYLON.IPositionGizmo, snapDistance?: number);
                positionGizmo: BABYLON.IPositionGizmo;
                snapDistance: number;
            }
            class SetRotationGizmoSnapDistanceDto {
                constructor(rotationGizmo?: BABYLON.IRotationGizmo, snapDistance?: number);
                rotationGizmo: BABYLON.IRotationGizmo;
                snapDistance: number;
            }
            class SetRotationGizmoSensitivityDto {
                constructor(rotationGizmo?: BABYLON.IRotationGizmo, sensitivity?: number);
                rotationGizmo: BABYLON.IRotationGizmo;
                sensitivity: number;
            }
            class RotationGizmoDto {
                constructor(rotationGizmo?: BABYLON.IRotationGizmo);
                rotationGizmo: BABYLON.IRotationGizmo;
            }
            class AxisScaleGizmoDto {
                constructor(axisScaleGizmo?: BABYLON.IAxisScaleGizmo);
                axisScaleGizmo: BABYLON.IAxisScaleGizmo;
            }
            class SetIsEnabledAxisScaleGizmoDto {
                constructor(gizmoManager?: BABYLON.IAxisScaleGizmo, isEnabled?: boolean);
                axisScaleGizmo: BABYLON.IAxisScaleGizmo;
                isEnabled: boolean;
            }
            class AxisDragGizmoDto {
                constructor(axisDragGizmo?: BABYLON.IAxisDragGizmo);
                axisDragGizmo: BABYLON.IAxisDragGizmo;
            }
            class SetIsEnabledAxisDragGizmoDto {
                constructor(gizmoManager?: BABYLON.IAxisDragGizmo, isEnabled?: boolean);
                axisDragGizmo: BABYLON.IAxisDragGizmo;
                isEnabled: boolean;
            }
            class SetIsEnabledPlaneRotationGizmoDto {
                constructor(planeRotationGizmo?: BABYLON.IPlaneRotationGizmo, isEnabled?: boolean);
                planeRotationGizmo: BABYLON.IPlaneRotationGizmo;
                isEnabled: boolean;
            }
            class SetIsEnabledPlaneDragGizmoDto {
                constructor(planeDragGizmo?: BABYLON.IPlaneDragGizmo, isEnabled?: boolean);
                planeDragGizmo: BABYLON.IPlaneDragGizmo;
                isEnabled: boolean;
            }
            class PlaneDragGizmoDto {
                constructor(planeDragGizmo?: BABYLON.IPlaneDragGizmo);
                planeDragGizmo: BABYLON.IPlaneDragGizmo;
            }
            class PlaneRotationGizmoDto {
                constructor(planeRotationGizmo?: BABYLON.IPlaneRotationGizmo);
                planeRotationGizmo: BABYLON.IPlaneRotationGizmo;
            }
            class AttachToMeshDto {
                constructor(mesh: BABYLON.AbstractMesh, gizmoManager: BABYLON.GizmoManager);
                mesh: BABYLON.AbstractMesh;
                gizmoManager: BABYLON.GizmoManager;
            }
            class PositionGizmoObservableSelectorDto {
                constructor(selector: positionGizmoObservableSelectorEnum);
                selector: positionGizmoObservableSelectorEnum;
            }
            class BoundingBoxGizmoObservableSelectorDto {
                constructor(selector: boundingBoxGizmoObservableSelectorEnum);
                selector: boundingBoxGizmoObservableSelectorEnum;
            }
            class RotationGizmoObservableSelectorDto {
                constructor(selector: rotationGizmoObservableSelectorEnum);
                selector: rotationGizmoObservableSelectorEnum;
            }
            class ScaleGizmoObservableSelectorDto {
                constructor(selector: scaleGizmoObservableSelectorEnum);
                selector: scaleGizmoObservableSelectorEnum;
            }
        }
        declare namespace BabylonGui {
            enum horizontalAlignmentEnum {
                left = "left",
                center = "center",
                right = "right"
            }
            enum verticalAlignmentEnum {
                top = "top",
                center = "center",
                bottom = "bottom"
            }
            enum inputTextObservableSelectorEnum {
                onTextChangedObservable = "onTextChangedObservable",
                onBeforeKeyAddObservable = "onBeforeKeyAddObservable",
                onTextHighlightObservable = "onTextHighlightObservable",
                onTextCopyObservable = "onTextCopyObservable",
                onTextCutObservable = "onTextCutObservable",
                onTextPasteObservable = "onTextPasteObservable"
            }
            enum sliderObservableSelectorEnum {
                onValueChangedObservable = "onValueChangedObservable"
            }
            enum colorPickerObservableSelectorEnum {
                onValueChangedObservable = "onValueChangedObservable"
            }
            enum textBlockObservableSelectorEnum {
                onTextChangedObservable = "onTextChangedObservable"
            }
            enum checkboxObservableSelectorEnum {
                onIsCheckedChangedObservable = "onIsCheckedChangedObservable"
            }
            enum radioButtonObservableSelectorEnum {
                onIsCheckedChangedObservable = "onIsCheckedChangedObservable"
            }
            enum controlObservableSelectorEnum {
                onFocusObservable = "onFocusObservable",
                onBlurObservable = "onBlurObservable",
                onAccessibilityTagChangedObservable = "onAccessibilityTagChangedObservable",
                onWheelObservable = "onWheelObservable",
                onPointerMoveObservable = "onPointerMoveObservable",
                onPointerOutObservable = "onPointerOutObservable",
                onPointerDownObservable = "onPointerDownObservable",
                onPointerUpObservable = "onPointerUpObservable",
                onPointerClickObservable = "onPointerClickObservable",
                onEnterPressedObservable = "onEnterPressedObservable",
                onPointerEnterObservable = "onPointerEnterObservable",
                onDirtyObservable = "onDirtyObservable",
                onBeforeDrawObservable = "onBeforeDrawObservable",
                onAfterDrawObservable = "onAfterDrawObservable",
                onDisposeObservable = "onDisposeObservable",
                onIsVisibleChangedObservable = "onIsVisibleChangedObservable"
            }
            class CreateFullScreenUIDto {
                constructor(name?: string, foreground?: boolean, adaptiveScaling?: boolean);
                name: string;
                foreground?: boolean;
                adaptiveScaling?: boolean;
            }
            class CreateForMeshDto {
                constructor(mesh?: BABYLON.AbstractMesh, width?: number, height?: number, supportPointerMove?: boolean, onlyAlphaTesting?: boolean, invertY?: boolean, sampling?: BabylonTexture.samplingModeEnum);
                mesh: BABYLON.AbstractMesh;
                width?: number;
                height?: number;
                supportPointerMove: boolean;
                onlyAlphaTesting: boolean;
                invertY: boolean;
                sampling: BabylonTexture.samplingModeEnum;
            }
            class CreateStackPanelDto {
                constructor(name?: string, isVertical?: boolean, spacing?: number, width?: number | string, height?: number | string, color?: string, background?: string);
                name: string;
                isVertical: boolean;
                spacing: number;
                width: number | string;
                height: number | string;
                color: string;
                background: string;
            }
            class SetStackPanelIsVerticalDto {
                constructor(stackPanel?: BABYLON.GUI.StackPanel, isVertical?: boolean);
                stackPanel: BABYLON.GUI.StackPanel;
                isVertical: boolean;
            }
            class SetStackPanelSpacingDto {
                constructor(stackPanel?: BABYLON.GUI.StackPanel, spacing?: number);
                stackPanel: BABYLON.GUI.StackPanel;
                spacing: number;
            }
            class SetStackPanelWidthDto {
                constructor(stackPanel?: BABYLON.GUI.StackPanel, width?: number | string);
                stackPanel: BABYLON.GUI.StackPanel;
                width: number | string;
            }
            class SetStackPanelHeightDto {
                constructor(stackPanel?: BABYLON.GUI.StackPanel, height?: number | string);
                stackPanel: BABYLON.GUI.StackPanel;
                height: number | string;
            }
            class StackPanelDto {
                constructor(stackPanel?: BABYLON.GUI.StackPanel);
                stackPanel: BABYLON.GUI.StackPanel;
            }
            class SliderObservableSelectorDto {
                constructor(selector: sliderObservableSelectorEnum);
                selector: sliderObservableSelectorEnum;
            }
            class ColorPickerObservableSelectorDto {
                constructor(selector: colorPickerObservableSelectorEnum);
                selector: colorPickerObservableSelectorEnum;
            }
            class InputTextObservableSelectorDto {
                constructor(selector: inputTextObservableSelectorEnum);
                selector: inputTextObservableSelectorEnum;
            }
            class RadioButtonObservableSelectorDto {
                constructor(selector: radioButtonObservableSelectorEnum);
                selector: radioButtonObservableSelectorEnum;
            }
            class CheckboxObservableSelectorDto {
                constructor(selector: checkboxObservableSelectorEnum);
                selector: checkboxObservableSelectorEnum;
            }
            class ControlObservableSelectorDto {
                constructor(selector: controlObservableSelectorEnum);
                selector: controlObservableSelectorEnum;
            }
            class TextBlockObservableSelectorDto {
                constructor(selector: textBlockObservableSelectorEnum);
                selector: textBlockObservableSelectorEnum;
            }
            class ContainerDto {
                constructor(container?: BABYLON.GUI.Container);
                container: BABYLON.GUI.Container;
            }
            class AddControlsToContainerDto {
                constructor(container?: BABYLON.GUI.StackPanel, controls?: BABYLON.GUI.Control[], clearControlsFirst?: boolean);
                container: BABYLON.GUI.Container;
                controls: BABYLON.GUI.Control[];
                clearControlsFirst: boolean;
            }
            class GetControlByNameDto {
                constructor(container?: BABYLON.GUI.Container, name?: string);
                container: BABYLON.GUI.Container;
                name: string;
            }
            class SetControlIsVisibleDto {
                constructor(control?: BABYLON.GUI.Control, isVisible?: boolean);
                control: BABYLON.GUI.Control;
                isVisible: boolean;
            }
            class SetControlIsReadonlyDto {
                constructor(control?: BABYLON.GUI.Control, isReadOnly?: boolean);
                control: BABYLON.GUI.Control;
                isReadOnly: boolean;
            }
            class SetControlIsEnabledDto {
                constructor(control?: BABYLON.GUI.Control, isEnabled?: boolean);
                control: BABYLON.GUI.Control;
                isEnabled: boolean;
            }
            class CreateImageDto {
                constructor(name?: string, url?: string, color?: string, width?: number | string, height?: number | string);
                name: string;
                url: string;
                color: string;
                width?: number | string;
                height?: number | string;
            }
            class SetImageUrlDto {
                constructor(image?: BABYLON.GUI.Image, url?: string);
                image: BABYLON.GUI.Image;
                url: string;
            }
            class ImageDto {
                constructor(image?: BABYLON.GUI.Image);
                image: BABYLON.GUI.Image;
            }
            class CreateButtonDto {
                constructor(name?: string, label?: string, color?: string, background?: string, width?: number | string, height?: number | string, fontSize?: number);
                name: string;
                label: string;
                color: string;
                background: string;
                width?: number | string;
                height?: number | string;
                fontSize: number;
            }
            class SetButtonTextDto {
                constructor(button?: BABYLON.GUI.Button, text?: string);
                button: BABYLON.GUI.Button;
                text: string;
            }
            class ButtonDto {
                constructor(button?: BABYLON.GUI.Button);
                button: BABYLON.GUI.Button;
            }
            class CreateColorPickerDto {
                constructor(name?: string, defaultColor?: string, color?: string, width?: number | string, height?: number | string, size?: number | string);
                name: string;
                defaultColor: string;
                color: string;
                width?: number | string;
                height?: number | string;
                size?: number | string;
            }
            class SetColorPickerValueDto {
                constructor(colorPicker?: BABYLON.GUI.ColorPicker, color?: string);
                colorPicker: BABYLON.GUI.ColorPicker;
                color: string;
            }
            class SetColorPickerSizeDto {
                constructor(colorPicker?: BABYLON.GUI.ColorPicker, size?: number | string);
                colorPicker: BABYLON.GUI.ColorPicker;
                size?: number | string;
            }
            class ColorPickerDto {
                constructor(colorPicker?: BABYLON.GUI.ColorPicker);
                colorPicker: BABYLON.GUI.ColorPicker;
            }
            class CreateCheckboxDto {
                constructor(name?: string, isChecked?: boolean, checkSizeRatio?: number, color?: string, background?: string, width?: number | string, height?: number | string);
                name: string;
                isChecked: boolean;
                checkSizeRatio: number;
                color: string;
                background: string;
                width?: number | string;
                height?: number | string;
            }
            class SetControlFontSizeDto {
                constructor(control?: BABYLON.GUI.Control, fontSize?: number);
                control: BABYLON.GUI.Control;
                fontSize: number;
            }
            class SetControlHeightDto {
                constructor(control?: BABYLON.GUI.Control, height?: number | string);
                control: BABYLON.GUI.Control;
                height: number | string;
            }
            class SetControlWidthDto {
                constructor(control?: BABYLON.GUI.Control, width?: number | string);
                control: BABYLON.GUI.Control;
                width: number | string;
            }
            class SetControlColorDto {
                constructor(control?: BABYLON.GUI.Control, color?: string);
                control: BABYLON.GUI.Control;
                color: string;
            }
            class SetContainerBackgroundDto {
                constructor(container?: BABYLON.GUI.Container, background?: string);
                container: BABYLON.GUI.Container;
                background: string;
            }
            class SetContainerIsReadonlyDto {
                constructor(container?: BABYLON.GUI.Container, isReadOnly?: boolean);
                container: BABYLON.GUI.Container;
                isReadOnly: boolean;
            }
            class SetCheckboxBackgroundDto {
                constructor(checkbox?: BABYLON.GUI.Checkbox, background?: string);
                checkbox: BABYLON.GUI.Checkbox;
                background: string;
            }
            class SetCheckboxCheckSizeRatioDto {
                constructor(checkbox?: BABYLON.GUI.Checkbox, checkSizeRatio?: number);
                checkbox: BABYLON.GUI.Checkbox;
                checkSizeRatio: number;
            }
            class CheckboxDto {
                constructor(checkbox?: BABYLON.GUI.Checkbox);
                checkbox: BABYLON.GUI.Checkbox;
            }
            class ControlDto {
                constructor(control?: BABYLON.GUI.Control);
                control: BABYLON.GUI.Control;
            }
            class SetCheckboxIsCheckedDto {
                constructor(checkbox?: BABYLON.GUI.Checkbox, isChecked?: boolean);
                checkbox: BABYLON.GUI.Checkbox;
                isChecked: boolean;
            }
            class CreateInputTextDto {
                constructor(name?: string, color?: string, background?: string, width?: number | string, height?: number | string);
                name: string;
                text: string;
                placeholder: string;
                color: string;
                background: string;
                width?: number | string;
                height?: number | string;
            }
            class SetInputTextBackgroundDto {
                constructor(inputText?: BABYLON.GUI.InputText, background?: string);
                inputText: BABYLON.GUI.InputText;
                background: string;
            }
            class SetInputTextTextDto {
                constructor(inputText?: BABYLON.GUI.InputText, text?: string);
                inputText: BABYLON.GUI.InputText;
                text: string;
            }
            class SetInputTextPlaceholderDto {
                constructor(inputText?: BABYLON.GUI.InputText, placeholder?: string);
                inputText: BABYLON.GUI.InputText;
                placeholder: string;
            }
            class InputTextDto {
                constructor(inputText?: BABYLON.GUI.InputText);
                inputText: BABYLON.GUI.InputText;
            }
            class CreateRadioButtonDto {
                constructor(name?: string, group?: string, isChecked?: boolean, checkSizeRatio?: number, color?: string, background?: string, width?: number | string, height?: number | string);
                name: string;
                group: string;
                isChecked: boolean;
                checkSizeRatio: number;
                color: string;
                background: string;
                width?: number | string;
                height?: number | string;
            }
            class SetRadioButtonCheckSizeRatioDto {
                constructor(radioButton?: BABYLON.GUI.RadioButton, checkSizeRatio?: number);
                radioButton: BABYLON.GUI.RadioButton;
                checkSizeRatio: number;
            }
            class SetRadioButtonGroupDto {
                constructor(radioButton?: BABYLON.GUI.RadioButton, group?: string);
                radioButton: BABYLON.GUI.RadioButton;
                group: string;
            }
            class SetRadioButtonBackgroundDto {
                constructor(radioButton?: BABYLON.GUI.RadioButton, background?: string);
                radioButton: BABYLON.GUI.RadioButton;
                background: string;
            }
            class RadioButtonDto {
                constructor(radioButton?: BABYLON.GUI.RadioButton);
                radioButton: BABYLON.GUI.RadioButton;
            }
            class CreateSliderDto {
                constructor(name?: string, minimum?: number, maximum?: number, value?: number, step?: number, isVertical?: boolean, color?: string, background?: string, width?: number | string, height?: number | string, displayThumb?: boolean);
                name: string;
                minimum: number;
                maximum: number;
                value: number;
                step: number;
                isVertical: boolean;
                color: string;
                background: string;
                width?: number | string;
                height?: number | string;
                displayThumb: boolean;
            }
            class CreateTextBlockDto {
                constructor(name?: string, text?: string, color?: string, width?: number | string, height?: number | string);
                name: string;
                text: string;
                color: string;
                width?: number | string;
                height?: number | string;
                fontSize: number;
            }
            class SetTextBlockTextDto {
                constructor(textBlock?: BABYLON.GUI.TextBlock, text?: string);
                textBlock: BABYLON.GUI.TextBlock;
                text: string;
            }
            class SetTextBlockResizeToFitDto {
                constructor(textBlock?: BABYLON.GUI.TextBlock, resizeToFit?: boolean);
                textBlock: BABYLON.GUI.TextBlock;
                resizeToFit: boolean;
            }
            class SetTextBlockTextWrappingDto {
                constructor(textBlock?: BABYLON.GUI.TextBlock, textWrapping?: boolean);
                textBlock: BABYLON.GUI.TextBlock;
                textWrapping: boolean | BABYLON.GUI.TextWrapping;
            }
            class SetTextBlockLineSpacingDto {
                constructor(textBlock?: BABYLON.GUI.TextBlock, lineSpacing?: string | number);
                textBlock: BABYLON.GUI.TextBlock;
                lineSpacing: string | number;
            }
            class TextBlockDto {
                constructor(textBlock?: BABYLON.GUI.TextBlock);
                textBlock: BABYLON.GUI.TextBlock;
            }
            class SliderThumbDto {
                constructor(slider?: BABYLON.GUI.Slider, isThumbCircle?: boolean, thumbColor?: string, thumbWidth?: string | number, isThumbClamped?: boolean, displayThumb?: boolean);
                slider: BABYLON.GUI.Slider;
                isThumbCircle: boolean;
                thumbColor: string;
                thumbWidth?: string | number;
                isThumbClamped: boolean;
                displayThumb: boolean;
            }
            class SliderDto {
                constructor(slider?: BABYLON.GUI.Slider);
                slider: BABYLON.GUI.Slider;
            }
            class SliderBorderColorDto {
                constructor(slider?: BABYLON.GUI.Slider, borderColor?: string);
                slider: BABYLON.GUI.Slider;
                borderColor: string;
            }
            class SliderBackgroundColorDto {
                constructor(slider?: BABYLON.GUI.Slider, backgroundColor?: string);
                slider: BABYLON.GUI.Slider;
                backgroundColor: string;
            }
            class SetSliderValueDto {
                constructor(slider?: BABYLON.GUI.Slider, value?: number);
                slider: BABYLON.GUI.Slider;
                value: number;
            }
            class PaddingLeftRightTopBottomDto {
                constructor(control?: BABYLON.GUI.Control, paddingLeft?: number | string, paddingRight?: number | string, paddingTop?: number | string, paddingBottom?: number | string);
                control: BABYLON.GUI.Control;
                paddingLeft: number | string;
                paddingRight: number | string;
                paddingTop: number | string;
                paddingBottom: number | string;
            }
            class CloneControlDto {
                constructor(control?: BABYLON.GUI.Control, container?: BABYLON.GUI.Container, name?: string, host?: BABYLON.GUI.AdvancedDynamicTexture);
                control: BABYLON.GUI.Control;
                container?: BABYLON.GUI.Container;
                name: string;
                host?: BABYLON.GUI.AdvancedDynamicTexture;
            }
            class AlignmentDto<T> {
                constructor(control?: T, horizontalAlignment?: horizontalAlignmentEnum, verticalAlignment?: verticalAlignmentEnum);
                control: T;
                horizontalAlignment: horizontalAlignmentEnum;
                verticalAlignment: verticalAlignmentEnum;
            }
            class SetTextBlockTextOutlineDto {
                constructor(textBlock?: BABYLON.GUI.TextBlock, outlineWidth?: number, outlineColor?: string);
                textBlock: BABYLON.GUI.TextBlock;
                outlineWidth: number;
                outlineColor: string;
            }
        }
        declare namespace BabylonIO {
            class ExportSceneGlbDto {
                constructor(fileName?: string, discardSkyboxAndGrid?: boolean);
                fileName: string;
                discardSkyboxAndGrid?: boolean;
            }
            class ExportSceneDto {
                constructor(fileName?: string);
                fileName: string;
            }
            class ExportMeshToStlDto {
                constructor(mesh?: BABYLON.Mesh, fileName?: string);
                mesh: BABYLON.Mesh;
                fileName: string;
            }
            class ExportMeshesToStlDto {
                constructor(meshes?: BABYLON.Mesh[], fileName?: string);
                meshes: BABYLON.Mesh[];
                fileName: string;
            }
        }
        declare namespace BabylonLight {
            class ShadowLightDirectionToTargetDto {
                constructor(shadowLight?: BABYLON.ShadowLight, target?: Base.Vector3);
                shadowLight: BABYLON.ShadowLight;
                target?: Base.Vector3;
            }
            class ShadowLightPositionDto {
                constructor(shadowLight?: BABYLON.ShadowLight, position?: Base.Vector3);
                shadowLight: BABYLON.ShadowLight;
                position?: Base.Vector3;
            }
        }
        declare namespace BabylonMaterial {
            class PBRMetallicRoughnessDto {
                constructor(name?: string, baseColor?: Base.Color, emissiveColor?: Base.Color, metallic?: number, roughness?: number, alpha?: number, backFaceCulling?: boolean, zOffset?: number);
                name: string;
                baseColor: Base.Color;
                emissiveColor?: Base.Color;
                metallic: number;
                roughness: number;
                alpha: number;
                backFaceCulling: boolean;
                zOffset: number;
            }
            class BaseColorDto {
                constructor(material?: BABYLON.PBRMetallicRoughnessMaterial, baseColor?: Base.Color);
                material: BABYLON.PBRMetallicRoughnessMaterial;
                baseColor?: Base.Color;
            }
            class MaterialPropDto {
                constructor(material?: BABYLON.PBRMetallicRoughnessMaterial);
                material: BABYLON.PBRMetallicRoughnessMaterial;
            }
            class SkyMaterialPropDto {
                constructor(skyMaterial?: MATERIALS.SkyMaterial);
                skyMaterial: MATERIALS.SkyMaterial;
            }
            class MetallicDto {
                constructor(material?: BABYLON.PBRMetallicRoughnessMaterial, metallic?: number);
                material: BABYLON.PBRMetallicRoughnessMaterial;
                metallic?: number;
            }
            class RoughnessDto {
                constructor(material?: BABYLON.PBRMetallicRoughnessMaterial, roughness?: number);
                material: BABYLON.PBRMetallicRoughnessMaterial;
                roughness?: number;
            }
            class AlphaDto {
                constructor(material?: BABYLON.PBRMetallicRoughnessMaterial, alpha?: number);
                material: BABYLON.PBRMetallicRoughnessMaterial;
                alpha?: number;
            }
            class BackFaceCullingDto {
                constructor(material?: BABYLON.PBRMetallicRoughnessMaterial, backFaceCulling?: boolean);
                material: BABYLON.PBRMetallicRoughnessMaterial;
                backFaceCulling?: boolean;
            }
            class BaseTextureDto {
                constructor(material?: BABYLON.PBRMetallicRoughnessMaterial, baseTexture?: BABYLON.Texture);
                material: BABYLON.PBRMetallicRoughnessMaterial;
                baseTexture: BABYLON.Texture;
            }
            class SkyMaterialDto {
                constructor(luminance?: number, turbidity?: number, rayleigh?: number, mieCoefficient?: number, mieDirectionalG?: number, distance?: number, inclination?: number, azimuth?: number, sunPosition?: Base.Vector3, useSunPosition?: boolean, cameraOffset?: Base.Vector3, up?: Base.Vector3, dithering?: boolean);
                luminance: number;
                turbidity: number;
                rayleigh: number;
                mieCoefficient: number;
                mieDirectionalG: number;
                distance: number;
                inclination: number;
                azimuth: number;
                sunPosition: Base.Vector3;
                useSunPosition: boolean;
                cameraOffset: Base.Vector3;
                up: number[];
                dithering: boolean;
            }
            class LuminanceDto {
                constructor(material?: MATERIALS.SkyMaterial, luminance?: number);
                material: MATERIALS.SkyMaterial;
                luminance?: number;
            }
            class TurbidityDto {
                constructor(material?: MATERIALS.SkyMaterial, turbidity?: number);
                material: MATERIALS.SkyMaterial;
                turbidity?: number;
            }
            class RayleighDto {
                constructor(material?: MATERIALS.SkyMaterial, rayleigh?: number);
                material: MATERIALS.SkyMaterial;
                rayleigh?: number;
            }
            class MieCoefficientDto {
                constructor(material?: MATERIALS.SkyMaterial, mieCoefficient?: number);
                material: MATERIALS.SkyMaterial;
                mieCoefficient?: number;
            }
            class MieDirectionalGDto {
                constructor(material?: MATERIALS.SkyMaterial, mieDirectionalG?: number);
                material: MATERIALS.SkyMaterial;
                mieDirectionalG?: number;
            }
            class DistanceDto {
                constructor(material?: MATERIALS.SkyMaterial, distance?: number);
                material: MATERIALS.SkyMaterial;
                distance?: number;
            }
            class InclinationDto {
                constructor(material?: MATERIALS.SkyMaterial, inclination?: number);
                material: MATERIALS.SkyMaterial;
                inclination?: number;
            }
            class AzimuthDto {
                constructor(material?: MATERIALS.SkyMaterial, azimuth?: number);
                material: MATERIALS.SkyMaterial;
                azimuth?: number;
            }
            class SunPositionDto {
                constructor(material?: MATERIALS.SkyMaterial, sunPosition?: Base.Vector3);
                material: MATERIALS.SkyMaterial;
                sunPosition?: Base.Vector3;
            }
            class UseSunPositionDto {
                constructor(material?: MATERIALS.SkyMaterial, useSunPosition?: boolean);
                material: MATERIALS.SkyMaterial;
                useSunPosition?: boolean;
            }
            class CameraOffsetDto {
                constructor(material?: MATERIALS.SkyMaterial, cameraOffset?: Base.Vector3);
                material: MATERIALS.SkyMaterial;
                cameraOffset?: Base.Vector3;
            }
            class UpDto {
                constructor(material?: MATERIALS.SkyMaterial, up?: Base.Vector3);
                material: MATERIALS.SkyMaterial;
                up?: Base.Vector3;
            }
            class DitheringDto {
                constructor(material?: MATERIALS.SkyMaterial, dithering?: boolean);
                material: MATERIALS.SkyMaterial;
                dithering?: boolean;
            }
        }
        declare namespace BabylonMeshBuilder {
            class CreateBoxDto {
                constructor(width?: number, depth?: number, height?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean);
                width: number;
                depth: number;
                height: number;
                sideOrientation: BabylonMesh.sideOrientationEnum;
                enableShadows: boolean;
            }
            class CreateCubeDto {
                constructor(size?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean);
                size: number;
                sideOrientation: BabylonMesh.sideOrientationEnum;
                enableShadows: boolean;
            }
            class CreateSquarePlaneDto {
                constructor(size?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean);
                size: number;
                sideOrientation: BabylonMesh.sideOrientationEnum;
                enableShadows: boolean;
            }
            class CreateSphereDto {
                constructor(diameter?: number, segments?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean);
                diameter: number;
                segments: number;
                sideOrientation: BabylonMesh.sideOrientationEnum;
                enableShadows: boolean;
            }
            class CreateIcoSphereDto {
                constructor(radius?: number, radiusX?: number, radiusY?: number, radiusZ?: number, flat?: boolean, subdivisions?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean);
                radius: number;
                radiusX: number;
                radiusY: number;
                radiusZ: number;
                flat: boolean;
                subdivisions: number;
                sideOrientation: BabylonMesh.sideOrientationEnum;
                enableShadows: boolean;
            }
            class CreateDiscDto {
                constructor(radius?: number, tessellation?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean);
                radius: number;
                tessellation: number;
                arc: number;
                sideOrientation: BabylonMesh.sideOrientationEnum;
                enableShadows: boolean;
            }
            class CreateRibbonDto {
                constructor(pathArray?: Base.Vector3[][], closeArray?: boolean, closePath?: boolean, offset?: number, updatable?: boolean, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean);
                pathArray: Base.Vector3[][];
                closeArray: boolean;
                closePath: boolean;
                offset: number;
                updatable: boolean;
                sideOrientation: BabylonMesh.sideOrientationEnum;
                enableShadows: boolean;
            }
            class CreateTorusDto {
                constructor(diameter?: number, thickness?: number, tessellation?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean);
                diameter: number;
                thickness: number;
                tessellation: number;
                sideOrientation: BabylonMesh.sideOrientationEnum;
                enableShadows: boolean;
            }
            class CreateTorusKnotDto {
                constructor(radius?: number, tube?: number, radialSegments?: number, tubularSegments?: number, p?: number, q?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean);
                radius: number;
                tube: number;
                radialSegments: number;
                tubularSegments: number;
                p: number;
                q: number;
                sideOrientation: BabylonMesh.sideOrientationEnum;
                enableShadows: boolean;
            }
            class CreatePolygonDto {
                constructor(shape?: Base.Vector3[], holes?: Base.Vector3[][], depth?: number, smoothingThreshold?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, wrap?: boolean, enableShadows?: boolean);
                shape: Base.Vector3[];
                holes?: Base.Vector3[][];
                depth: number;
                smoothingThreshold: number;
                sideOrientation: BabylonMesh.sideOrientationEnum;
                wrap: boolean;
                enableShadows: boolean;
            }
            class ExtrudePolygonDto {
                constructor(shape?: Base.Vector3[], holes?: Base.Vector3[][], depth?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, wrap?: boolean, enableShadows?: boolean);
                shape: Base.Vector3[];
                holes?: Base.Vector3[][];
                depth: number;
                sideOrientation: BabylonMesh.sideOrientationEnum;
                wrap: boolean;
                enableShadows: boolean;
            }
            class CreatePolyhedronDto {
                constructor(size?: number, type?: number, sizeX?: number, sizeY?: number, sizeZ?: number, custom?: number[], flat?: boolean, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean);
                size: number;
                type: number;
                sizeX: number;
                sizeY: number;
                sizeZ: number;
                custom?: number[];
                flat: boolean;
                sideOrientation: BabylonMesh.sideOrientationEnum;
                enableShadows: boolean;
            }
            class CreateGeodesicDto {
                constructor(m?: number, n?: number, size?: number, sizeX?: number, sizeY?: number, sizeZ?: number, flat?: boolean, subdivisions?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean);
                m: number;
                n: number;
                size: number;
                sizeX: number;
                sizeY: number;
                sizeZ: number;
                flat: boolean;
                subdivisions: number;
                sideOrientation: BabylonMesh.sideOrientationEnum;
                enableShadows: boolean;
            }
            class CreateCapsuleDto {
                constructor(orientation?: Base.Vector3, subdivisions?: number, tessellation?: number, height?: number, radius?: number, capSubdivisions?: number, radiusTop?: number, radiusBottom?: number, topCapSubdivisions?: number, bottomCapSubdivisions?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean);
                orientation: Base.Vector3;
                subdivisions: number;
                tessellation: number;
                height: number;
                radius: number;
                capSubdivisions: number;
                radiusTop: number;
                radiusBottom: number;
                topCapSubdivisions: number;
                bottomCapSubdivisions: number;
                sideOrientation: BabylonMesh.sideOrientationEnum;
                enableShadows: boolean;
            }
            class CreateGoldbergDto {
                constructor(m?: number, n?: number, size?: number, sizeX?: number, sizeY?: number, sizeZ?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean);
                m: number;
                n: number;
                size: number;
                sizeX: number;
                sizeY: number;
                sizeZ: number;
                sideOrientation: BabylonMesh.sideOrientationEnum;
                enableShadows: boolean;
            }
            class CreateTubeDto {
                constructor(path?: Base.Vector3[], radius?: number, tessellation?: number, cap?: number, arc?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean);
                path: Base.Vector3[];
                radius: number;
                tessellation: number;
                cap: number;
                arc: number;
                sideOrientation: BabylonMesh.sideOrientationEnum;
                enableShadows: boolean;
            }
            class CreateExtrudedShapeDto {
                constructor(shape?: Base.Vector3[], path?: Base.Vector3[], scale?: number, rotation?: number, cap?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean);
                shape: Base.Vector3[];
                path: Base.Vector3[];
                scale: number;
                rotation: number;
                closeShape: boolean;
                closePath: boolean;
                cap: number;
                sideOrientation: BabylonMesh.sideOrientationEnum;
                enableShadows: boolean;
            }
            class CreateCylinderDto {
                constructor(height?: number, diameterTop?: number, diameterBottom?: number, tessellation?: number, subdivisions?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean);
                height: number;
                diameterTop: number;
                diameterBottom: number;
                tessellation: number;
                subdivisions: number;
                sideOrientation: BabylonMesh.sideOrientationEnum;
                enableShadows: boolean;
            }
            class CreateLatheDto {
                constructor(shape?: Base.Vector3[], radius?: number, tessellation?: number, arc?: number, closed?: boolean, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean);
                shape: Base.Vector3[];
                radius: number;
                tessellation: number;
                arc: number;
                closed: boolean;
                sideOrientation: BabylonMesh.sideOrientationEnum;
                enableShadows: boolean;
            }
            class CreateGroundDto {
                constructor(width?: number, height?: number, subdivisionsX?: number, subdivisionsY?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean);
                width: number;
                height: number;
                subdivisionsX: number;
                subdivisionsY: number;
                sideOrientation: BabylonMesh.sideOrientationEnum;
                enableShadows: boolean;
            }
            class CreateRectanglePlaneDto {
                constructor(width?: number, height?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean);
                width: number;
                height: number;
                sideOrientation: BabylonMesh.sideOrientationEnum;
                enableShadows: boolean;
            }
        }
        declare namespace BabylonMesh {
            enum sideOrientationEnum {
                frontside = "frontside",
                backside = "backside",
                doubleside = "doubleside"
            }
            class UpdateDrawnBabylonMesh {
                constructor(babylonMesh?: BABYLON.Mesh, position?: Base.Point3, rotation?: Base.Vector3, scaling?: Base.Vector3, colours?: string | string[]);
                babylonMesh: BABYLON.Mesh;
                position: Base.Point3;
                rotation: Base.Vector3;
                scaling: Base.Vector3;
                colours: string | string[];
            }
            class SetParentDto {
                constructor(babylonMesh?: BABYLON.Mesh | BABYLON.InstancedMesh | BABYLON.AbstractMesh, parentMesh?: BABYLON.Mesh | BABYLON.InstancedMesh | BABYLON.AbstractMesh);
                babylonMesh: BABYLON.Mesh | BABYLON.InstancedMesh | BABYLON.AbstractMesh;
                parentMesh: BABYLON.Mesh | BABYLON.InstancedMesh | BABYLON.AbstractMesh;
            }
            class UpdateDrawnBabylonMeshPositionDto {
                constructor(babylonMesh?: BABYLON.Mesh | BABYLON.InstancedMesh, position?: Base.Point3);
                babylonMesh: BABYLON.Mesh | BABYLON.InstancedMesh;
                position: Base.Point3;
            }
            class UpdateDrawnBabylonMeshRotationDto {
                constructor(babylonMesh?: BABYLON.Mesh | BABYLON.InstancedMesh, rotation?: Base.Vector3);
                babylonMesh: BABYLON.Mesh | BABYLON.InstancedMesh;
                rotation: Base.Vector3;
            }
            class UpdateDrawnBabylonMeshScaleDto {
                constructor(babylonMesh?: BABYLON.Mesh | BABYLON.InstancedMesh, scale?: Base.Vector3);
                babylonMesh: BABYLON.Mesh | BABYLON.InstancedMesh;
                scale: Base.Vector3;
            }
            class ScaleInPlaceDto {
                constructor(babylonMesh?: BABYLON.Mesh | BABYLON.InstancedMesh, scale?: number);
                babylonMesh: BABYLON.Mesh | BABYLON.InstancedMesh;
                scale: number;
            }
            class IntersectsMeshDto {
                constructor(babylonMesh?: BABYLON.Mesh | BABYLON.InstancedMesh, babylonMesh2?: BABYLON.Mesh | BABYLON.InstancedMesh, precise?: boolean, includeDescendants?: boolean);
                babylonMesh: BABYLON.Mesh | BABYLON.InstancedMesh;
                babylonMesh2: BABYLON.Mesh | BABYLON.InstancedMesh;
                precise: boolean;
                includeDescendants: boolean;
            }
            class IntersectsPointDto {
                constructor(babylonMesh?: BABYLON.Mesh | BABYLON.InstancedMesh, point?: Base.Point3);
                babylonMesh: BABYLON.Mesh | BABYLON.InstancedMesh;
                point: Base.Point3;
            }
            class BabylonMeshDto {
                constructor(babylonMesh?: BABYLON.Mesh);
                babylonMesh: BABYLON.Mesh;
            }
            class CloneToPositionsDto {
                constructor(babylonMesh?: BABYLON.Mesh, positions?: Base.Point3[]);
                babylonMesh: BABYLON.Mesh;
                positions: Base.Point3[];
            }
            class MergeMeshesDto {
                constructor(arrayOfMeshes?: BABYLON.Mesh[], disposeSource?: boolean, allow32BitsIndices?: boolean, meshSubclass?: BABYLON.Mesh, subdivideWithSubMeshes?: boolean, multiMultiMaterials?: boolean);
                arrayOfMeshes: BABYLON.Mesh[];
                disposeSource: boolean;
                allow32BitsIndices: boolean;
                meshSubclass?: BABYLON.Mesh;
                subdivideWithSubMeshes: boolean;
                multiMultiMaterials: boolean;
            }
            class BabylonMeshWithChildrenDto {
                constructor(babylonMesh?: BABYLON.Mesh);
                babylonMesh: BABYLON.Mesh;
                includeChildren: boolean;
            }
            class ShowHideMeshDto {
                constructor(babylonMesh?: BABYLON.Mesh, includeChildren?: boolean);
                babylonMesh: BABYLON.Mesh;
                includeChildren: boolean;
            }
            class CloneBabylonMeshDto {
                constructor(babylonMesh?: BABYLON.Mesh);
                babylonMesh: BABYLON.Mesh;
            }
            class ChildMeshesBabylonMeshDto {
                constructor(babylonMesh?: BABYLON.Mesh, directDescendantsOnly?: boolean);
                babylonMesh: BABYLON.Mesh;
                directDescendantsOnly: boolean;
            }
            class TranslateBabylonMeshDto {
                constructor(babylonMesh?: BABYLON.Mesh, distance?: number);
                babylonMesh: BABYLON.Mesh;
                distance: number;
            }
            class NameBabylonMeshDto {
                constructor(babylonMesh?: BABYLON.Mesh, name?: string, includeChildren?: boolean);
                babylonMesh?: BABYLON.Mesh;
                name: string;
                includeChildren?: boolean;
            }
            class ByNameBabylonMeshDto {
                constructor(name?: string);
                name: string;
            }
            class MaterialBabylonMeshDto {
                constructor(babylonMesh?: BABYLON.Mesh, material?: BABYLON.Material, includeChildren?: boolean);
                babylonMesh?: BABYLON.Mesh;
                material: BABYLON.Material;
                includeChildren: boolean;
            }
            class IdBabylonMeshDto {
                constructor(babylonMesh?: BABYLON.Mesh, id?: string);
                babylonMesh?: BABYLON.Mesh;
                id: string;
            }
            class ByIdBabylonMeshDto {
                constructor(id?: string);
                id: string;
            }
            class UniqueIdBabylonMeshDto {
                constructor(uniqueId?: number);
                uniqueId: number;
            }
            class PickableBabylonMeshDto {
                constructor(babylonMesh?: BABYLON.Mesh, pickable?: boolean, includeChildren?: boolean);
                babylonMesh: BABYLON.Mesh;
                pickable: boolean;
                includeChildren: boolean;
            }
            class CheckCollisionsBabylonMeshDto {
                constructor(babylonMesh?: BABYLON.Mesh, checkCollisions?: boolean, includeChildren?: boolean);
                babylonMesh: BABYLON.Mesh;
                checkCollisions: boolean;
                includeChildren: boolean;
            }
            class RotateBabylonMeshDto {
                constructor(babylonMesh?: BABYLON.Mesh, rotate?: number);
                babylonMesh: BABYLON.Mesh;
                rotate: number;
            }
            class SetMeshVisibilityDto {
                constructor(babylonMesh?: BABYLON.Mesh, visibility?: number, includeChildren?: boolean);
                babylonMesh: BABYLON.Mesh;
                visibility: number;
                includeChildren: boolean;
            }
            class MeshInstanceAndTransformDto {
                constructor(mesh?: BABYLON.Mesh, position?: Base.Point3, rotation?: Base.Vector3, scaling?: Base.Vector3);
                mesh: BABYLON.Mesh;
                position: Base.Point3;
                rotation: Base.Vector3;
                scaling: Base.Vector3;
            }
            class MeshInstanceDto {
                constructor(mesh?: BABYLON.Mesh);
                mesh: BABYLON.Mesh;
            }
            class RotateAroundAxisNodeDto {
                constructor(mesh?: BABYLON.Mesh, position?: Base.Point3, axis?: Base.Vector3, angle?: number);
                mesh: BABYLON.Mesh;
                position: Base.Point3;
                axis: Base.Vector3;
                angle: number;
            }
        }
        declare namespace BabylonPick {
            class RayDto {
                constructor(ray?: BABYLON.Ray);
                ray: BABYLON.Ray;
            }
            class PickInfo {
                constructor(pickInfo?: BABYLON.PickingInfo);
                pickInfo: BABYLON.PickingInfo;
            }
        }
        declare namespace BabylonRay {
            class BaseRayDto {
                constructor(origin?: Base.Point3, direction?: Base.Vector3, length?: number);
                origin: Base.Point3;
                direction: Base.Vector3;
                length?: number;
            }
            class RayDto {
                constructor(ray?: BABYLON.Ray);
                ray: BABYLON.Ray;
            }
            class FromToDto {
                constructor(from?: Base.Point3, to?: Base.Point3);
                from: Base.Point3;
                to: Base.Point3;
            }
        }
        interface InitBabylonJSResult {
            scene: BABYLON.Scene;
            engine: BABYLON.Engine;
            hemisphericLight: BABYLON.HemisphericLight;
            directionalLight: BABYLON.DirectionalLight;
            ground: BABYLON.Mesh | null;
            arcRotateCamera: BABYLON.ArcRotateCamera | null;
            startRenderLoop: (onRender?: () => void) => void;
            dispose: () => void;
        }
        declare namespace BabylonJSScene {
            class InitBabylonJSDto {
                constructor(canvasId?: string, sceneSize?: number, backgroundColor?: string, enableShadows?: boolean, enableGround?: boolean, groundCenter?: Base.Point3, groundScaleFactor?: number, groundColor?: string, groundOpacity?: number, hemisphereLightSkyColor?: string, hemisphereLightGroundColor?: string, hemisphereLightIntensity?: number, directionalLightColor?: string, directionalLightIntensity?: number, shadowMapSize?: number);
                canvasId?: string;
                sceneSize: number;
                backgroundColor: string;
                enableShadows: boolean;
                enableGround: boolean;
                groundCenter: Base.Point3;
                groundScaleFactor: number;
                groundColor: string;
                groundOpacity: number;
                hemisphereLightSkyColor: string;
                hemisphereLightGroundColor: string;
                hemisphereLightIntensity: number;
                directionalLightColor: string;
                directionalLightIntensity: number;
                shadowMapSize: number;
                enableArcRotateCamera: boolean;
                arcRotateCameraOptions?: BabylonCamera.ArcRotateCameraDto;
            }
        }
        declare namespace BabylonTexture {
            enum samplingModeEnum {
                nearest = "nearest",
                bilinear = "bilinear",
                trilinear = "trilinear"
            }
            class TextureSimpleDto {
                constructor(name?: string, url?: string, invertY?: boolean, invertZ?: boolean, wAng?: number, uScale?: number, vScale?: number, uOffset?: number, vOffset?: number, samplingMode?: samplingModeEnum);
                name: string;
                url: string;
                invertY: boolean;
                invertZ: boolean;
                wAng: number;
                uScale: number;
                vScale: number;
                uOffset: number;
                vOffset: number;
                samplingMode: samplingModeEnum;
            }
        }
        declare namespace BabylonTools {
            class ScreenshotDto {
                constructor(camera?: BABYLON.Camera, width?: number, height?: number, mimeType?: string, quality?: number);
                camera: BABYLON.Camera;
                width: number;
                height: number;
                mimeType: string;
                quality: number;
            }
        }
        declare namespace BabylonTransforms {
            class RotationCenterAxisDto {
                constructor(angle?: number, axis?: Base.Vector3, center?: Base.Point3);
                angle: number;
                axis: Base.Vector3;
                center: Base.Point3;
            }
            class TransformBabylonMeshDto {
                constructor(mesh?: BABYLON.Mesh, transformation?: Base.TransformMatrixes);
                mesh: BABYLON.Mesh;
                transformation: Base.TransformMatrixes;
            }
            class RotationCenterDto {
                constructor(angle?: number, center?: Base.Point3);
                angle: number;
                center: Base.Point3;
            }
            class RotationCenterYawPitchRollDto {
                constructor(yaw?: number, pitch?: number, roll?: number, center?: Base.Point3);
                yaw: number;
                pitch: number;
                roll: number;
                center: Base.Point3;
            }
            class ScaleXYZDto {
                constructor(scaleXyz?: Base.Vector3);
                scaleXyz: Base.Vector3;
            }
            class ScaleCenterXYZDto {
                constructor(center?: Base.Point3, scaleXyz?: Base.Vector3);
                center: Base.Point3;
                scaleXyz: Base.Vector3;
            }
            class UniformScaleDto {
                constructor(scale?: number);
                scale: number;
            }
            class UniformScaleFromCenterDto {
                constructor(scale?: number, center?: Base.Point3);
                scale: number;
                center: Base.Point3;
            }
            class TranslationXYZDto {
                constructor(translation?: Base.Vector3);
                translation: Base.Vector3;
            }
            class TranslationsXYZDto {
                constructor(translations?: Base.Vector3[]);
                translations: Base.Vector3[];
            }
        }
        declare namespace BabylonWebXR {
            class WebXRDefaultExperienceOptions {
                constructor(disableDefaultUI?: boolean);
                disableDefaultUI?: boolean;
                disablePointerSelection?: boolean;
                disableTeleportation?: boolean;
                disableNearInteraction?: boolean;
                disableHandTracking?: boolean;
                floorMeshes?: BABYLON.AbstractMesh[];
                ignoreNativeCameraTransformation?: boolean;
                inputOptions?: Partial<BABYLON.IWebXRInputOptions>;
                pointerSelectionOptions?: Partial<BABYLON.IWebXRControllerPointerSelectionOptions>;
                nearInteractionOptions?: Partial<BABYLON.IWebXRNearInteractionOptions>;
                handSupportOptions?: Partial<BABYLON.IWebXRHandTrackingOptions>;
                teleportationOptions?: Partial<BABYLON.IWebXRTeleportationOptions>;
                outputCanvasOptions?: BABYLON.WebXRManagedOutputCanvasOptions;
                uiOptions?: Partial<BABYLON.WebXREnterExitUIOptions>;
                useStablePlugins?: boolean;
                renderingGroupId?: number;
                optionalFeatures?: boolean | string[];
            }
            class DefaultWebXRWithTeleportationDto {
                constructor(groundMeshes?: BABYLON.Mesh[]);
                groundMeshes: BABYLON.Mesh[];
            }
            class WebXRDefaultExperienceDto {
                constructor(webXRDefaultExperience?: BABYLON.WebXRDefaultExperience);
                webXRDefaultExperience: BABYLON.WebXRDefaultExperience;
            }
            class WebXRExperienceHelperDto {
                constructor(baseExperience?: BABYLON.WebXRExperienceHelper);
                baseExperience: BABYLON.WebXRExperienceHelper;
            }
        }
        declare namespace Base {
            enum colorMapStrategyEnum {
                firstColorForAll = "firstColorForAll",
                lastColorRemainder = "lastColorRemainder",
                repeatColors = "repeatColors",
                reversedColors = "reversedColors"
            }
            enum skyboxEnum {
                default = "default",
                clearSky = "clearSky",
                city = "city",
                greyGradient = "greyGradient"
            }
            enum fogModeEnum {
                none = "none",
                exponential = "exponential",
                exponentialSquared = "exponentialSquared",
                linear = "linear"
            }
            enum gradientDirectionEnum {
                toTop = "to top",
                toTopRight = "to top right",
                toRight = "to right",
                toBottomRight = "to bottom right",
                toBottom = "to bottom",
                toBottomLeft = "to bottom left",
                toLeft = "to left",
                toTopLeft = "to top left",
                deg0 = "0deg",
                deg45 = "45deg",
                deg90 = "90deg",
                deg135 = "135deg",
                deg180 = "180deg",
                deg225 = "225deg",
                deg270 = "270deg",
                deg315 = "315deg"
            }
            enum gradientPositionEnum {
                center = "center",
                top = "top",
                topLeft = "top left",
                topRight = "top right",
                bottom = "bottom",
                bottomLeft = "bottom left",
                bottomRight = "bottom right",
                left = "left",
                right = "right",
                centerTop = "50% 0%",
                centerBottom = "50% 100%",
                leftCenter = "0% 50%",
                rightCenter = "100% 50%"
            }
            enum gradientShapeEnum {
                circle = "circle",
                ellipse = "ellipse"
            }
            enum backgroundRepeatEnum {
                repeat = "repeat",
                repeatX = "repeat-x",
                repeatY = "repeat-y",
                noRepeat = "no-repeat",
                space = "space",
                round = "round"
            }
            enum backgroundSizeEnum {
                auto = "auto",
                cover = "cover",
                contain = "contain"
            }
            enum backgroundAttachmentEnum {
                scroll = "scroll",
                fixed = "fixed",
                local = "local"
            }
            enum backgroundOriginClipEnum {
                paddingBox = "padding-box",
                borderBox = "border-box",
                contentBox = "content-box"
            }
            enum verticalAlignmentEnum {
                top = "top",
                middle = "middle",
                bottom = "bottom"
            }
            enum topBottomEnum {
                top = "top",
                bottom = "bottom"
            }
            type Color = string;
            type ColorRGB = {
                r: number;
                g: number;
                b: number;
            };
            type Material = any;
            type Texture = any;
            type Point2 = [
                number,
                number
            ];
            type Vector2 = [
                number,
                number
            ];
            type Point3 = [
                number,
                number,
                number
            ];
            type Vector3 = [
                number,
                number,
                number
            ];
            type Axis3 = {
                origin: Base.Point3;
                direction: Base.Vector3;
            };
            type Axis2 = {
                origin: Base.Point2;
                direction: Base.Vector2;
            };
            type Segment2 = [
                Point2,
                Point2
            ];
            type Segment3 = [
                Point3,
                Point3
            ];
            type TrianglePlane3 = {
                normal: Vector3;
                d: number;
            };
            type Triangle3 = [
                Base.Point3,
                Base.Point3,
                Base.Point3
            ];
            type Mesh3 = Triangle3[];
            type Plane3 = {
                origin: Base.Point3;
                normal: Base.Vector3;
                direction: Base.Vector3;
            };
            type BoundingBox = {
                min: Base.Point3;
                max: Base.Point3;
                center?: Base.Point3;
                width?: number;
                height?: number;
                length?: number;
            };
            type Line2 = {
                start: Base.Point2;
                end: Base.Point2;
            };
            type Line3 = {
                start: Base.Point3;
                end: Base.Point3;
            };
            type Polyline3 = {
                points: Base.Point3[];
                isClosed?: boolean;
            };
            type Polyline2 = {
                points: Base.Point2[];
                isClosed?: boolean;
            };
            type VerbCurve = {
                tessellate: (options: any) => any;
            };
            type VerbSurface = {
                tessellate: (options: any) => any;
            };
            type TransformMatrix3x3 = [
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number
            ];
            type TransformMatrixes3x3 = TransformMatrix3x3[];
            type TransformMatrix = [
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number
            ];
            type TransformMatrixes = TransformMatrix[];
        }
        declare namespace Draw {
            type DrawOptions = DrawBasicGeometryOptions | DrawManifoldOrCrossSectionOptions | DrawOcctShapeOptions | DrawOcctShapeSimpleOptions | DrawOcctShapeMaterialOptions | DrawNodeOptions;
            type Entity = number[] | [
                number,
                number,
                number
            ] | Base.Point3 | Base.Vector3 | Base.Line3 | Base.Segment3 | Base.Polyline3 | Base.VerbCurve | Base.VerbSurface | Inputs.OCCT.TopoDSShapePointer | Inputs.Tag.TagDto | {
                type: string;
                name?: string;
                entityName?: string;
            } | number[][] | Base.Point3[] | Base.Vector3[] | Base.Line3[] | Base.Segment3[] | Base.Polyline3[] | Base.VerbCurve[] | Base.VerbSurface[] | Inputs.OCCT.TopoDSShapePointer[] | Inputs.Tag.TagDto[] | {
                type: string[];
                name?: string;
                entityName?: string;
            };
            class DrawAny {
                constructor(entity?: Entity, options?: DrawOptions, babylonMesh?: BABYLON.Mesh | BABYLON.LinesMesh);
                entity: Entity;
                options?: DrawOptions;
                babylonMesh?: BABYLON.Mesh | BABYLON.LinesMesh;
            }
            class SceneDrawGridMeshDto {
                constructor(width?: number, height?: number, subdivisions?: number, majorUnitFrequency?: number, minorUnitVisibility?: number, gridRatio?: number, opacity?: number, backFaceCulling?: boolean, mainColor?: Base.Color, secondaryColor?: Base.Color);
                width: number;
                height: number;
                subdivisions: number;
                majorUnitFrequency: number;
                minorUnitVisibility: number;
                gridRatio: number;
                opacity: number;
                backFaceCulling: boolean;
                mainColor: Base.Color;
                secondaryColor: Base.Color;
            }
            class DrawBasicGeometryOptions {
                constructor(colours?: string | string[], size?: number, opacity?: number, updatable?: boolean, hidden?: boolean, drawTwoSided?: boolean, backFaceColour?: Base.Color, backFaceOpacity?: number, colorMapStrategy?: Base.colorMapStrategyEnum, arrowSize?: number, arrowAngle?: number);
                colours: string | string[];
                colorMapStrategy: Base.colorMapStrategyEnum;
                size: number;
                opacity: number;
                updatable: boolean;
                hidden: boolean;
                drawTwoSided: boolean;
                backFaceColour: Base.Color;
                backFaceOpacity: number;
                arrowSize: number;
                arrowAngle: number;
            }
            class DrawNodeOptions {
                constructor(colourX?: Base.Color, colourY?: Base.Color, colourZ?: Base.Color, size?: number);
                colorX: Base.Color;
                colorY: Base.Color;
                colorZ: Base.Color;
                size: number;
            }
            class DrawManifoldOrCrossSectionOptions {
                constructor(faceOpacity?: number, faceMaterial?: Base.Material, faceColour?: Base.Color, crossSectionColour?: Base.Color, crossSectionWidth?: number, crossSectionOpacity?: number, computeNormals?: boolean, drawTwoSided?: boolean, backFaceColour?: Base.Color, backFaceOpacity?: number);
                faceOpacity: number;
                faceColour: Base.Color;
                faceMaterial?: Base.Material;
                crossSectionColour: Base.Color;
                crossSectionWidth: number;
                crossSectionOpacity: number;
                computeNormals: boolean;
                drawTwoSided: boolean;
                backFaceColour: Base.Color;
                backFaceOpacity: number;
            }
            class DrawOcctShapeOptions {
                constructor(faceOpacity?: number, edgeOpacity?: number, edgeColour?: Base.Color, faceMaterial?: Base.Material, faceColour?: Base.Color, edgeWidth?: number, drawEdges?: boolean, drawFaces?: boolean, drawVertices?: boolean, vertexColour?: Base.Color, vertexSize?: number, precision?: number, drawEdgeIndexes?: boolean, edgeIndexHeight?: number, edgeIndexColour?: Base.Color, drawFaceIndexes?: boolean, faceIndexHeight?: number, faceIndexColour?: Base.Color, drawTwoSided?: boolean, backFaceColour?: Base.Color, backFaceOpacity?: number, edgeArrowSize?: number, edgeArrowAngle?: number);
                faceOpacity: number;
                edgeOpacity: number;
                edgeColour: Base.Color;
                faceColour: Base.Color;
                vertexColour: Base.Color;
                faceMaterial?: Base.Material;
                edgeWidth: number;
                vertexSize: number;
                drawEdges: boolean;
                drawFaces: boolean;
                drawVertices: boolean;
                precision: number;
                drawEdgeIndexes: boolean;
                edgeIndexHeight: number;
                edgeIndexColour: Base.Color;
                drawFaceIndexes: boolean;
                faceIndexHeight: number;
                faceIndexColour: Base.Color;
                drawTwoSided: boolean;
                backFaceColour: Base.Color;
                backFaceOpacity: number;
                edgeArrowSize: number;
                edgeArrowAngle: number;
            }
            class DrawOcctShapeSimpleOptions {
                constructor(precision?: number, drawFaces?: boolean, faceColour?: Base.Color, drawEdges?: boolean, edgeColour?: Base.Color, edgeWidth?: number, drawTwoSided?: boolean, backFaceColour?: Base.Color, backFaceOpacity?: number);
                precision: number;
                drawFaces: boolean;
                faceColour?: Base.Color;
                drawEdges: boolean;
                edgeColour: Base.Color;
                edgeWidth: number;
                drawTwoSided: boolean;
                backFaceColour: Base.Color;
                backFaceOpacity: number;
            }
            class DrawOcctShapeMaterialOptions {
                constructor(precision?: number, faceMaterial?: any, drawEdges?: boolean, edgeColour?: Base.Color, edgeWidth?: number);
                precision: number;
                faceMaterial: any;
                drawEdges: boolean;
                edgeColour: Base.Color;
                edgeWidth: number;
            }
            enum samplingModeEnum {
                nearest = "nearest",
                bilinear = "bilinear",
                trilinear = "trilinear"
            }
            class GenericTextureDto {
                constructor(url?: string, name?: string, uScale?: number, vScale?: number, uOffset?: number, vOffset?: number, wAng?: number, invertY?: boolean, invertZ?: boolean, samplingMode?: samplingModeEnum);
                url: string;
                name: string;
                uScale: number;
                vScale: number;
                uOffset: number;
                vOffset: number;
                wAng: number;
                invertY: boolean;
                invertZ: boolean;
                samplingMode: samplingModeEnum;
            }
            enum alphaModeEnum {
                opaque = "opaque",
                mask = "mask",
                blend = "blend"
            }
            class GenericPBRMaterialDto {
                constructor(name?: string, baseColor?: Base.Color, metallic?: number, roughness?: number, alpha?: number, emissiveColor?: Base.Color, emissiveIntensity?: number, zOffset?: number, zOffsetUnits?: number, baseColorTexture?: Base.Texture, metallicRoughnessTexture?: Base.Texture, normalTexture?: Base.Texture, emissiveTexture?: Base.Texture, occlusionTexture?: Base.Texture, alphaMode?: alphaModeEnum, alphaCutoff?: number, doubleSided?: boolean, wireframe?: boolean, unlit?: boolean);
                name: string;
                baseColor: Base.Color;
                metallic: number;
                roughness: number;
                alpha: number;
                emissiveColor?: Base.Color;
                emissiveIntensity: number;
                zOffset: number;
                zOffsetUnits: number;
                baseColorTexture?: Base.Texture;
                metallicRoughnessTexture?: Base.Texture;
                normalTexture?: Base.Texture;
                emissiveTexture?: Base.Texture;
                occlusionTexture?: Base.Texture;
                alphaMode: alphaModeEnum;
                alphaCutoff: number;
                doubleSided: boolean;
                wireframe: boolean;
                unlit: boolean;
            }
            enum drawingTypes {
                point = 0,
                points = 1,
                line = 2,
                lines = 3,
                node = 4,
                nodes = 5,
                polyline = 6,
                polylines = 7,
                verbCurve = 8,
                verbCurves = 9,
                verbSurface = 10,
                verbSurfaces = 11,
                jscadMesh = 12,
                jscadMeshes = 13,
                occt = 14,
                manifold = 15,
                tag = 16,
                tags = 17
            }
        }
        declare namespace BabylonNode {
            class NodeDto {
                constructor(node?: BABYLON.TransformNode);
                node: BABYLON.TransformNode;
            }
            class NodeTranslationDto {
                constructor(node?: BABYLON.TransformNode, direction?: Base.Vector3, distance?: number);
                node: BABYLON.TransformNode;
                direction: Base.Vector3;
                distance: number;
            }
            class NodeParentDto {
                constructor(node?: BABYLON.TransformNode, parentNode?: BABYLON.TransformNode);
                node: BABYLON.TransformNode;
                parentNode: BABYLON.TransformNode;
            }
            class NodeDirectionDto {
                constructor(node?: BABYLON.TransformNode, direction?: Base.Vector3);
                node: BABYLON.TransformNode;
                direction: number[];
            }
            class NodePositionDto {
                constructor(node?: BABYLON.TransformNode, position?: Base.Point3);
                node: BABYLON.TransformNode;
                position: Base.Point3;
            }
            class RotateNodeDto {
                constructor(node?: BABYLON.TransformNode, axis?: Base.Vector3, angle?: number);
                node: BABYLON.TransformNode;
                axis: Base.Vector3;
                angle: number;
            }
            class RotateAroundAxisNodeDto {
                constructor(node?: BABYLON.TransformNode, position?: Base.Point3, axis?: Base.Vector3, angle?: number);
                node: BABYLON.TransformNode;
                position: Base.Point3;
                axis: Base.Vector3;
                angle: number;
            }
            class CreateNodeFromRotationDto {
                constructor(parent?: BABYLON.TransformNode, origin?: Base.Point3, rotation?: Base.Vector3);
                parent: BABYLON.TransformNode | null;
                origin: Base.Point3;
                rotation: Base.Vector3;
            }
            class DrawNodeDto {
                constructor(node?: BABYLON.TransformNode, colorX?: string, colorY?: string, colorZ?: string, size?: number);
                node: BABYLON.TransformNode;
                colorX: string;
                colorY: string;
                colorZ: string;
                size: number;
            }
            class DrawNodesDto {
                constructor(nodes?: BABYLON.TransformNode[], colorX?: string, colorY?: string, colorZ?: string, size?: number);
                nodes: BABYLON.TransformNode[];
                colorX: string;
                colorY: string;
                colorZ: string;
                size: number;
            }
        }
        declare namespace BabylonScene {
            class SceneBackgroundColourDto {
                constructor(colour?: string);
                colour: Base.Color;
            }
            class SceneDto {
                constructor(scene?: BABYLON.Scene);
                scene: BABYLON.Scene;
            }
            class EnablePhysicsDto {
                constructor(vector?: Base.Vector3);
                vector: Base.Vector3;
            }
            class PointLightDto {
                constructor(position?: Base.Point3, intensity?: number, diffuse?: Base.Color, specular?: Base.Color, radius?: number, shadowGeneratorMapSize?: number, enableShadows?: boolean, shadowDarkness?: number, transparencyShadow?: boolean, shadowUsePercentageCloserFiltering?: boolean, shadowContactHardeningLightSizeUVRatio?: number, shadowBias?: number, shadowNormalBias?: number, shadowMaxZ?: number, shadowMinZ?: number, shadowRefreshRate?: number);
                position: Base.Point3;
                intensity: number;
                diffuse: Base.Color;
                specular: Base.Color;
                radius: number;
                shadowGeneratorMapSize?: number;
                enableShadows?: boolean;
                shadowDarkness?: number;
                transparencyShadow: boolean;
                shadowUsePercentageCloserFiltering: boolean;
                shadowContactHardeningLightSizeUVRatio: number;
                shadowBias: number;
                shadowNormalBias: number;
                shadowMaxZ: number;
                shadowMinZ: number;
                shadowRefreshRate: number;
            }
            class ActiveCameraDto {
                constructor(camera?: BABYLON.Camera);
                camera: BABYLON.Camera;
            }
            class UseRightHandedSystemDto {
                constructor(use?: boolean);
                use: boolean;
            }
            class DirectionalLightDto {
                constructor(direction?: Base.Vector3, intensity?: number, diffuse?: Base.Color, specular?: Base.Color, shadowGeneratorMapSize?: number, enableShadows?: boolean, shadowDarkness?: number, shadowUsePercentageCloserFiltering?: boolean, shadowContactHardeningLightSizeUVRatio?: number, shadowBias?: number, shadowNormalBias?: number, shadowMaxZ?: number, shadowMinZ?: number, shadowRefreshRate?: number);
                direction: Base.Vector3;
                intensity: number;
                diffuse: Base.Color;
                specular: Base.Color;
                shadowGeneratorMapSize?: number;
                enableShadows?: boolean;
                shadowDarkness?: number;
                shadowUsePercentageCloserFiltering: boolean;
                transparencyShadow: boolean;
                shadowContactHardeningLightSizeUVRatio: number;
                shadowBias: number;
                shadowNormalBias: number;
                shadowMaxZ: number;
                shadowMinZ: number;
                shadowRefreshRate: number;
            }
            class CameraConfigurationDto {
                constructor(position?: Base.Point3, lookAt?: Base.Point3, lowerRadiusLimit?: number, upperRadiusLimit?: number, lowerAlphaLimit?: number, upperAlphaLimit?: number, lowerBetaLimit?: number, upperBetaLimit?: number, angularSensibilityX?: number, angularSensibilityY?: number, maxZ?: number, panningSensibility?: number, wheelPrecision?: number);
                position: Base.Point3;
                lookAt: Base.Point3;
                lowerRadiusLimit: any;
                upperRadiusLimit: any;
                lowerAlphaLimit: any;
                upperAlphaLimit: any;
                lowerBetaLimit: number;
                upperBetaLimit: number;
                angularSensibilityX: number;
                angularSensibilityY: number;
                maxZ: number;
                panningSensibility: number;
                wheelPrecision: number;
            }
            class SkyboxDto {
                constructor(skybox?: Base.skyboxEnum, size?: number, blur?: number, environmentIntensity?: number, hideSkybox?: boolean);
                skybox: Base.skyboxEnum;
                size: number;
                blur: number;
                environmentIntensity: number;
                hideSkybox?: boolean;
            }
            class SkyboxCustomTextureDto {
                constructor(textureUrl?: string, textureSize?: number, size?: number, blur?: number, environmentIntensity?: number, hideSkybox?: boolean);
                textureUrl?: string;
                textureSize?: number;
                size: number;
                blur: number;
                environmentIntensity: number;
                hideSkybox?: boolean;
            }
            class PointerDto {
                statement_update: () => void;
            }
            class FogDto {
                constructor(mode?: Base.fogModeEnum, color?: Base.Color, density?: number, start?: number, end?: number);
                mode: Base.fogModeEnum;
                color: Base.Color;
                density: number;
                start: number;
                end: number;
            }
            class SceneCanvasCSSBackgroundImageDto {
                constructor(cssBackgroundImage?: string);
                cssBackgroundImage: string;
            }
            class SceneTwoColorLinearGradientDto {
                constructor(colorFrom?: Base.Color, colorTo?: Base.Color, direction?: Base.gradientDirectionEnum, stopFrom?: number, stopTo?: number);
                colorFrom: Base.Color;
                colorTo: Base.Color;
                direction: Base.gradientDirectionEnum;
                stopFrom: number;
                stopTo: number;
            }
            class SceneTwoColorRadialGradientDto {
                constructor(colorFrom?: Base.Color, colorTo?: Base.Color, position?: Base.gradientPositionEnum, stopFrom?: number, stopTo?: number, shape?: Base.gradientShapeEnum);
                colorFrom: Base.Color;
                colorTo: Base.Color;
                position: Base.gradientPositionEnum;
                stopFrom: number;
                stopTo: number;
                shape: Base.gradientShapeEnum;
            }
            class SceneMultiColorLinearGradientDto {
                constructor(colors?: Base.Color[], stops?: number[], direction?: Base.gradientDirectionEnum);
                colors: Base.Color[];
                stops: number[];
                direction: Base.gradientDirectionEnum;
            }
            class SceneMultiColorRadialGradientDto {
                constructor(colors?: Base.Color[], stops?: number[], position?: Base.gradientPositionEnum, shape?: Base.gradientShapeEnum);
                colors: Base.Color[];
                stops: number[];
                position: Base.gradientPositionEnum;
                shape: Base.gradientShapeEnum;
            }
            class SceneCanvasBackgroundImageDto {
                constructor(imageUrl?: string, repeat?: Base.backgroundRepeatEnum, size?: Base.backgroundSizeEnum, position?: Base.gradientPositionEnum, attachment?: Base.backgroundAttachmentEnum, origin?: Base.backgroundOriginClipEnum, clip?: Base.backgroundOriginClipEnum);
                imageUrl?: string;
                repeat: Base.backgroundRepeatEnum;
                size: Base.backgroundSizeEnum;
                position: Base.gradientPositionEnum;
                attachment: Base.backgroundAttachmentEnum;
                origin: Base.backgroundOriginClipEnum;
                clip: Base.backgroundOriginClipEnum;
            }
        }
        declare namespace Base {
            type Color = string;
            type ColorRGB = {
                r: number;
                g: number;
                b: number;
            };
            type Material = any;
            type Point2 = [
                number,
                number
            ];
            type Vector2 = [
                number,
                number
            ];
            type Point3 = [
                number,
                number,
                number
            ];
            type Vector3 = [
                number,
                number,
                number
            ];
            type Axis3 = {
                origin: Base.Point3;
                direction: Base.Vector3;
            };
            type Axis2 = {
                origin: Base.Point2;
                direction: Base.Vector2;
            };
            type Segment2 = [
                Point2,
                Point2
            ];
            type Segment3 = [
                Point3,
                Point3
            ];
            type TrianglePlane3 = {
                normal: Vector3;
                d: number;
            };
            type Triangle3 = [
                Base.Point3,
                Base.Point3,
                Base.Point3
            ];
            type Mesh3 = Triangle3[];
            type Plane3 = {
                origin: Base.Point3;
                normal: Base.Vector3;
                direction: Base.Vector3;
            };
            type BoundingBox = {
                min: Base.Point3;
                max: Base.Point3;
                center?: Base.Point3;
                width?: number;
                height?: number;
                length?: number;
            };
            type Line2 = {
                start: Base.Point2;
                end: Base.Point2;
            };
            type Line3 = {
                start: Base.Point3;
                end: Base.Point3;
            };
            type Polyline3 = {
                points: Base.Point3[];
                isClosed?: boolean;
                color?: number[];
            };
            type Polyline2 = {
                points: Base.Point2[];
                isClosed?: boolean;
                color?: number[];
            };
            type TransformMatrix3x3 = [
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number
            ];
            type TransformMatrixes3x3 = TransformMatrix3x3[];
            type TransformMatrix = [
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number
            ];
            type TransformMatrixes = TransformMatrix[];
            enum horizontalAlignEnum {
                left = "left",
                center = "center",
                right = "right"
            }
            enum verticalAlignmentEnum {
                top = "top",
                middle = "middle",
                bottom = "bottom"
            }
            enum topBottomEnum {
                top = "top",
                bottom = "bottom"
            }
            enum basicAlignmentEnum {
                topLeft = "topLeft",
                topMid = "topMid",
                topRight = "topRight",
                midLeft = "midLeft",
                midMid = "midMid",
                midRight = "midRight",
                bottomLeft = "bottomLeft",
                bottomMid = "bottomMid",
                bottomRight = "bottomRight"
            }
        }
        declare namespace Color {
            class HexDto {
                constructor(color?: Base.Color);
                color: Base.Color;
            }
            class InvertHexDto {
                constructor(color?: Base.Color);
                color: Base.Color;
                blackAndWhite: boolean;
            }
            class HexDtoMapped {
                constructor(color?: Base.Color, from?: number, to?: number);
                color: Base.Color;
                from: number;
                to: number;
            }
            class RGBObjectMaxDto {
                constructor(rgb?: Base.ColorRGB, max?: number);
                rgb: Base.ColorRGB;
                min: number;
                max: number;
            }
            class RGBMinMaxDto {
                constructor(r?: number, g?: number, b?: number, min?: number, max?: number);
                r: number;
                g: number;
                b: number;
                min: number;
                max: number;
            }
            class RGBObjectDto {
                constructor(rgb?: Base.ColorRGB);
                rgb: Base.ColorRGB;
            }
        }
        declare namespace Dates {
            class DateDto {
                constructor(date?: Date);
                date: Date;
            }
            class DateStringDto {
                constructor(dateString?: string);
                dateString: string;
            }
            class DateSecondsDto {
                constructor(date?: Date, seconds?: number);
                date: Date;
                seconds: number;
            }
            class DateDayDto {
                constructor(date?: Date, day?: number);
                date: Date;
                day: number;
            }
            class DateYearDto {
                constructor(date?: Date, year?: number);
                date: Date;
                year: number;
            }
            class DateMonthDto {
                constructor(date?: Date, month?: number);
                date: Date;
                month: number;
            }
            class DateHoursDto {
                constructor(date?: Date, hours?: number);
                date: Date;
                hours: number;
            }
            class DateMinutesDto {
                constructor(date?: Date, minutes?: number);
                date: Date;
                minutes: number;
            }
            class DateMillisecondsDto {
                constructor(date?: Date, milliseconds?: number);
                date: Date;
                milliseconds: number;
            }
            class DateTimeDto {
                constructor(date?: Date, time?: number);
                date: Date;
                time: number;
            }
            class CreateFromUnixTimeStampDto {
                constructor(unixTimeStamp?: number);
                unixTimeStamp: number;
            }
            class CreateDateDto {
                constructor(year?: number, month?: number, day?: number, hours?: number, minutes?: number, seconds?: number, milliseconds?: number);
                year: number;
                month: number;
                day: number;
                hours: number;
                minutes: number;
                seconds: number;
                milliseconds: number;
            }
        }
        declare namespace IO {
            class DxfLineSegmentDto {
                constructor(start?: Base.Point2, end?: Base.Point2);
                start: Base.Point2;
                end: Base.Point2;
            }
            class DxfArcSegmentDto {
                constructor(center?: Base.Point2, radius?: number, startAngle?: number, endAngle?: number);
                center: Base.Point2;
                radius: number;
                startAngle: number;
                endAngle: number;
            }
            class DxfCircleSegmentDto {
                constructor(center?: Base.Point2, radius?: number);
                center: Base.Point2;
                radius: number;
            }
            class DxfPolylineSegmentDto {
                constructor(points?: Base.Point2[], closed?: boolean, bulges?: number[]);
                points: Base.Point2[];
                closed?: boolean;
                bulges?: number[];
            }
            class DxfSplineSegmentDto {
                constructor(controlPoints?: Base.Point2[], degree?: number, closed?: boolean);
                controlPoints: Base.Point2[];
                degree?: number;
                closed?: boolean;
            }
            class DxfPathDto {
                constructor(segments?: (DxfLineSegmentDto | DxfArcSegmentDto | DxfCircleSegmentDto | DxfPolylineSegmentDto | DxfSplineSegmentDto)[]);
                segments: (DxfLineSegmentDto | DxfArcSegmentDto | DxfCircleSegmentDto | DxfPolylineSegmentDto | DxfSplineSegmentDto)[];
            }
            class DxfPathsPartDto {
                constructor(layer?: string, color?: Base.Color, paths?: DxfPathDto[]);
                layer: string;
                color: Base.Color;
                paths: DxfPathDto[];
            }
            class DxfModelDto {
                constructor(dxfPathsParts?: DxfPathsPartDto[], colorFormat?: "aci" | "truecolor", acadVersion?: "AC1009" | "AC1015");
                dxfPathsParts: DxfPathsPartDto[];
                colorFormat?: "aci" | "truecolor";
                acadVersion?: "AC1009" | "AC1015";
            }
        }
        declare namespace Line {
            class LinePointsDto {
                constructor(start?: Base.Point3, end?: Base.Point3);
                start?: Base.Point3;
                end?: Base.Point3;
            }
            class LineStartEndPointsDto {
                constructor(startPoints?: Base.Point3[], endPoints?: Base.Point3[]);
                startPoints: Base.Point3[];
                endPoints: Base.Point3[];
            }
            class DrawLineDto<T> {
                constructor(line?: LinePointsDto, opacity?: number, colours?: string | string[], size?: number, updatable?: boolean, lineMesh?: T);
                line?: LinePointsDto;
                opacity?: number;
                colours?: string | string[];
                size?: number;
                updatable?: boolean;
                lineMesh?: T;
            }
            class DrawLinesDto<T> {
                constructor(lines?: LinePointsDto[], opacity?: number, colours?: string | string[], size?: number, updatable?: boolean, linesMesh?: T);
                lines?: LinePointsDto[];
                opacity?: number;
                colours?: string | string[];
                size?: number;
                updatable?: boolean;
                linesMesh?: T;
            }
            class PointsLinesDto {
                constructor(points?: Base.Point3[]);
                points?: Base.Point3[];
            }
            class LineDto {
                constructor(line?: LinePointsDto);
                line?: LinePointsDto;
            }
            class SegmentDto {
                constructor(segment?: Base.Segment3);
                segment?: Base.Segment3;
            }
            class SegmentsDto {
                constructor(segments?: Base.Segment3[]);
                segments?: Base.Segment3[];
            }
            class LinesDto {
                constructor(lines?: LinePointsDto[]);
                lines?: LinePointsDto[];
            }
            class LineLineIntersectionDto {
                constructor(line1?: LinePointsDto, line2?: LinePointsDto, tolerance?: number);
                line1?: LinePointsDto;
                line2?: LinePointsDto;
                checkSegmentsOnly?: boolean;
                tolerance?: number;
            }
            class PointOnLineDto {
                constructor(line?: LinePointsDto, param?: number);
                line?: LinePointsDto;
                param?: number;
            }
            class TransformLineDto {
                constructor(line?: LinePointsDto, transformation?: Base.TransformMatrixes);
                line?: LinePointsDto;
                transformation?: Base.TransformMatrixes;
            }
            class TransformsLinesDto {
                constructor(lines?: LinePointsDto[], transformation?: Base.TransformMatrixes[]);
                lines?: LinePointsDto[];
                transformation?: Base.TransformMatrixes[];
            }
            class TransformLinesDto {
                constructor(lines?: LinePointsDto[], transformation?: Base.TransformMatrixes);
                lines?: LinePointsDto[];
                transformation?: Base.TransformMatrixes;
            }
        }
        declare namespace Lists {
            enum firstLastEnum {
                first = "first",
                last = "last"
            }
            class ListItemDto<T> {
                constructor(list?: T[], index?: number, clone?: boolean);
                list: T[];
                index: number;
                clone?: boolean;
            }
            class SubListDto<T> {
                constructor(list?: T[], indexStart?: number, indexEnd?: number, clone?: boolean);
                list: T[];
                indexStart: number;
                indexEnd: number;
                clone?: boolean;
            }
            class ListCloneDto<T> {
                constructor(list?: T[], clone?: boolean);
                list: T[];
                clone?: boolean;
            }
            class RepeatInPatternDto<T> {
                constructor(list?: T[]);
                list: T[];
                clone?: boolean;
                lengthLimit: number;
            }
            class SortDto<T> {
                constructor(list?: T[], clone?: boolean, orderAsc?: boolean);
                list: T[];
                clone?: boolean;
                orderAsc: boolean;
            }
            class SortJsonDto<T> {
                constructor(list?: T[], clone?: boolean, orderAsc?: boolean);
                list: T[];
                clone?: boolean;
                orderAsc: boolean;
                property: string;
            }
            class ListDto<T> {
                constructor(list?: T[]);
                list: T[];
            }
            class GroupListDto<T> {
                constructor(list?: T[], nrElements?: number, keepRemainder?: boolean);
                list: T[];
                nrElements: number;
                keepRemainder: boolean;
            }
            class MultiplyItemDto<T> {
                constructor(item?: T, times?: number);
                item: T;
                times: number;
            }
            class AddItemAtIndexDto<T> {
                constructor(list?: T[], item?: T, index?: number, clone?: boolean);
                list: T[];
                item: T;
                index: number;
                clone?: boolean;
            }
            class AddItemAtIndexesDto<T> {
                constructor(list?: T[], item?: T, indexes?: number[], clone?: boolean);
                list: T[];
                item: T;
                indexes: number[];
                clone?: boolean;
            }
            class AddItemsAtIndexesDto<T> {
                constructor(list?: T[], items?: T[], indexes?: number[], clone?: boolean);
                list: T[];
                items: T[];
                indexes: number[];
                clone?: boolean;
            }
            class RemoveItemAtIndexDto<T> {
                constructor(list?: T[], index?: number, clone?: boolean);
                list: T[];
                index: number;
                clone?: boolean;
            }
            class RemoveItemsAtIndexesDto<T> {
                constructor(list?: T[], indexes?: number[], clone?: boolean);
                list: T[];
                indexes: number[];
                clone?: boolean;
            }
            class RemoveNthItemDto<T> {
                constructor(list?: T[], nth?: number, offset?: number, clone?: boolean);
                list: T[];
                nth: number;
                offset: number;
                clone?: boolean;
            }
            class RandomThresholdDto<T> {
                constructor(list?: T[], threshold?: number, clone?: boolean);
                list: T[];
                threshold: number;
                clone?: boolean;
            }
            class RemoveDuplicatesDto<T> {
                constructor(list?: T[], clone?: boolean);
                list: T[];
                clone?: boolean;
            }
            class RemoveDuplicatesToleranceDto<T> {
                constructor(list?: T[], clone?: boolean, tolerance?: number);
                list: T[];
                tolerance: number;
                clone?: boolean;
            }
            class GetByPatternDto<T> {
                constructor(list?: T[], pattern?: boolean[]);
                list: T[];
                pattern: boolean[];
            }
            class GetNthItemDto<T> {
                constructor(list?: T[], nth?: number, offset?: number, clone?: boolean);
                list: T[];
                nth: number;
                offset: number;
                clone?: boolean;
            }
            class GetLongestListLength<T> {
                constructor(lists?: T[]);
                lists: T[];
            }
            class MergeElementsOfLists<T> {
                constructor(lists?: T[], level?: number);
                lists: T[];
                level: number;
            }
            class AddItemDto<T> {
                constructor(list?: T[], item?: T, clone?: boolean);
                list: T[];
                item: T;
                clone?: boolean;
            }
            class AddItemFirstLastDto<T> {
                constructor(list?: T[], item?: T, position?: firstLastEnum, clone?: boolean);
                list: T[];
                item: T;
                position: firstLastEnum;
                clone?: boolean;
            }
            class ConcatenateDto<T> {
                constructor(lists?: T[][], clone?: boolean);
                lists: T[][];
                clone?: boolean;
            }
            class IncludesDto<T> {
                constructor(list?: T[], item?: T);
                list: T[];
                item: T;
            }
            class InterleaveDto<T> {
                constructor(lists?: T[][], clone?: boolean);
                lists: T[][];
                clone?: boolean;
            }
        }
        declare namespace Logic {
            enum BooleanOperatorsEnum {
                less = "<",
                lessOrEqual = "<=",
                greater = ">",
                greaterOrEqual = ">=",
                tripleEqual = "===",
                tripleNotEqual = "!==",
                equal = "==",
                notEqual = "!="
            }
            class ComparisonDto<T> {
                constructor(first?: T, second?: T, operator?: BooleanOperatorsEnum);
                first: T;
                second: T;
                operator: BooleanOperatorsEnum;
            }
            class BooleanDto {
                constructor(boolean?: boolean);
                boolean: boolean;
            }
            class BooleanListDto {
                constructor(booleans?: boolean);
                booleans: any;
            }
            class ValueGateDto<T> {
                constructor(value?: T, boolean?: boolean);
                value: T;
                boolean: boolean;
            }
            class TwoValueGateDto<T, U> {
                constructor(value1?: T, value2?: U);
                value1?: T;
                value2?: U;
            }
            class RandomBooleansDto {
                constructor(length?: number);
                length: number;
                trueThreshold: number;
            }
            class TwoThresholdRandomGradientDto {
                numbers: number[];
                thresholdTotalTrue: number;
                thresholdTotalFalse: number;
                nrLevels: number;
            }
            class ThresholdBooleanListDto {
                numbers: number[];
                threshold: number;
                inverse: boolean;
            }
            class ThresholdGapsBooleanListDto {
                numbers: number[];
                gapThresholds: Base.Vector2[];
                inverse: boolean;
            }
        }
        declare namespace Math {
            enum mathTwoNrOperatorEnum {
                add = "add",
                subtract = "subtract",
                multiply = "multiply",
                divide = "divide",
                power = "power",
                modulus = "modulus"
            }
            enum mathOneNrOperatorEnum {
                absolute = "absolute",
                negate = "negate",
                ln = "ln",
                log10 = "log10",
                tenPow = "tenPow",
                round = "round",
                floor = "floor",
                ceil = "ceil",
                sqrt = "sqrt",
                sin = "sin",
                cos = "cos",
                tan = "tan",
                asin = "asin",
                acos = "acos",
                atan = "atan",
                log = "log",
                exp = "exp",
                radToDeg = "radToDeg",
                degToRad = "degToRad"
            }
            enum easeEnum {
                easeInSine = "easeInSine",
                easeOutSine = "easeOutSine",
                easeInOutSine = "easeInOutSine",
                easeInQuad = "easeInQuad",
                easeOutQuad = "easeOutQuad",
                easeInOutQuad = "easeInOutQuad",
                easeInCubic = "easeInCubic",
                easeOutCubic = "easeOutCubic",
                easeInOutCubic = "easeInOutCubic",
                easeInQuart = "easeInQuart",
                easeOutQuart = "easeOutQuart",
                easeInOutQuart = "easeInOutQuart",
                easeInQuint = "easeInQuint",
                easeOutQuint = "easeOutQuint",
                easeInOutQuint = "easeInOutQuint",
                easeInExpo = "easeInExpo",
                easeOutExpo = "easeOutExpo",
                easeInOutExpo = "easeInOutExpo",
                easeInCirc = "easeInCirc",
                easeOutCirc = "easeOutCirc",
                easeInOutCirc = "easeInOutCirc",
                easeInElastic = "easeInElastic",
                easeOutElastic = "easeOutElastic",
                easeInOutElastic = "easeInOutElastic",
                easeInBack = "easeInBack",
                easeOutBack = "easeOutBack",
                easeInOutBack = "easeInOutBack",
                easeInBounce = "easeInBounce",
                easeOutBounce = "easeOutBounce",
                easeInOutBounce = "easeInOutBounce"
            }
            class ModulusDto {
                constructor(number?: number, modulus?: number);
                number: number;
                modulus: number;
            }
            class NumberDto {
                constructor(number?: number);
                number: number;
            }
            class EaseDto {
                constructor(x?: number);
                x: number;
                min: number;
                max: number;
                ease: easeEnum;
            }
            class RoundToDecimalsDto {
                constructor(number?: number, decimalPlaces?: number);
                number: number;
                decimalPlaces: number;
            }
            class ActionOnTwoNumbersDto {
                constructor(first?: number, second?: number, operation?: mathTwoNrOperatorEnum);
                first: number;
                second: number;
                operation: mathTwoNrOperatorEnum;
            }
            class TwoNumbersDto {
                constructor(first?: number, second?: number);
                first: number;
                second: number;
            }
            class ActionOnOneNumberDto {
                constructor(number?: number, operation?: mathOneNrOperatorEnum);
                number: number;
                operation: mathOneNrOperatorEnum;
            }
            class RemapNumberDto {
                constructor(number?: number, fromLow?: number, fromHigh?: number, toLow?: number, toHigh?: number);
                number: number;
                fromLow: number;
                fromHigh: number;
                toLow: number;
                toHigh: number;
            }
            class RandomNumberDto {
                constructor(low?: number, high?: number);
                low: number;
                high: number;
            }
            class RandomNumbersDto {
                constructor(low?: number, high?: number, count?: number);
                low: number;
                high: number;
                count: number;
            }
            class ToFixedDto {
                constructor(number?: number, decimalPlaces?: number);
                number: number;
                decimalPlaces: number;
            }
            class ClampDto {
                constructor(number?: number, min?: number, max?: number);
                number: number;
                min: number;
                max: number;
            }
            class LerpDto {
                constructor(start?: number, end?: number, t?: number);
                start: number;
                end: number;
                t: number;
            }
            class InverseLerpDto {
                constructor(start?: number, end?: number, value?: number);
                start: number;
                end: number;
                value: number;
            }
            class WrapDto {
                constructor(number?: number, min?: number, max?: number);
                number: number;
                min: number;
                max: number;
            }
            class PingPongDto {
                constructor(t?: number, length?: number);
                t: number;
                length: number;
            }
            class MoveTowardsDto {
                constructor(current?: number, target?: number, maxDelta?: number);
                current: number;
                target: number;
                maxDelta: number;
            }
        }
        declare namespace Mesh {
            class SignedDistanceFromPlaneToPointDto {
                constructor(point?: Base.Point3, plane?: Base.TrianglePlane3);
                point?: Base.Point3;
                plane?: Base.TrianglePlane3;
            }
            class TriangleDto {
                constructor(triangle?: Base.Triangle3);
                triangle?: Base.Triangle3;
            }
            class TriangleToleranceDto {
                constructor(triangle?: Base.Triangle3);
                triangle?: Base.Triangle3;
                tolerance?: number;
            }
            class TriangleTriangleToleranceDto {
                constructor(triangle1?: Base.Triangle3, triangle2?: Base.Triangle3, tolerance?: number);
                triangle1?: Base.Triangle3;
                triangle2?: Base.Triangle3;
                tolerance?: number;
            }
            class MeshMeshToleranceDto {
                constructor(mesh1?: Base.Mesh3, mesh2?: Base.Mesh3, tolerance?: number);
                mesh1?: Base.Mesh3;
                mesh2?: Base.Mesh3;
                tolerance?: number;
            }
        }
        declare namespace Point {
            class PointDto {
                constructor(point?: Base.Point3);
                point: Base.Point3;
            }
            class PointXYZDto {
                constructor(x?: number, y?: number, z?: number);
                x: number;
                y: number;
                z: number;
            }
            class PointXYDto {
                constructor(x?: number, y?: number);
                x: number;
                y: number;
            }
            class PointsDto {
                constructor(points?: Base.Point3[]);
                points: Base.Point3[];
            }
            class TwoPointsDto {
                constructor(point1?: Base.Point3, point2?: Base.Point3);
                point1: Base.Point3;
                point2: Base.Point3;
            }
            class DrawPointDto<T> {
                constructor(point?: Base.Point3, opacity?: number, size?: number, colours?: string | string[], updatable?: boolean, pointMesh?: T);
                point: Base.Point3;
                opacity: number;
                size: number;
                colours: string | string[];
                updatable: boolean;
                pointMesh?: T;
            }
            class DrawPointsDto<T> {
                constructor(points?: Base.Point3[], opacity?: number, size?: number, colours?: string | string[], updatable?: boolean, pointsMesh?: T);
                points: Base.Point3[];
                opacity: number;
                size: number;
                colours: string | string[];
                updatable: boolean;
                pointsMesh?: T;
            }
            class TransformPointDto {
                constructor(point?: Base.Point3, transformation?: Base.TransformMatrixes);
                point: Base.Point3;
                transformation: Base.TransformMatrixes;
            }
            class TransformPointsDto {
                constructor(points?: Base.Point3[], transformation?: Base.TransformMatrixes);
                points: Base.Point3[];
                transformation: Base.TransformMatrixes;
            }
            class TranslatePointsWithVectorsDto {
                constructor(points?: Base.Point3[], translations?: Base.Vector3[]);
                points: Base.Point3[];
                translations: Base.Vector3[];
            }
            class TranslatePointsDto {
                constructor(points?: Base.Point3[], translation?: Base.Vector3);
                points: Base.Point3[];
                translation: Base.Vector3;
            }
            class TranslateXYZPointsDto {
                constructor(points?: Base.Point3[], x?: number, y?: number, z?: number);
                points: Base.Point3[];
                x: number;
                y: number;
                z: number;
            }
            class ScalePointsCenterXYZDto {
                constructor(points?: Base.Point3[], center?: Base.Point3, scaleXyz?: Base.Vector3);
                points: Base.Point3[];
                center: Base.Point3;
                scaleXyz: Base.Vector3;
            }
            class StretchPointsDirFromCenterDto {
                constructor(points?: Base.Point3[], center?: Base.Point3, direction?: Base.Vector3, scale?: number);
                points?: Base.Point3[];
                center?: Base.Point3;
                direction?: Base.Vector3;
                scale?: number;
            }
            class RotatePointsCenterAxisDto {
                constructor(points?: Base.Point3[], angle?: number, axis?: Base.Vector3, center?: Base.Point3);
                points: Base.Point3[];
                angle: number;
                axis: Base.Vector3;
                center: Base.Point3;
            }
            class TransformsForPointsDto {
                constructor(points?: Base.Point3[], transformation?: Base.TransformMatrixes[]);
                points: Base.Point3[];
                transformation: Base.TransformMatrixes[];
            }
            class ThreePointsNormalDto {
                constructor(point1?: Base.Point3, point2?: Base.Point3, point3?: Base.Point3, reverseNormal?: boolean);
                point1: Base.Point3;
                point2: Base.Point3;
                point3: Base.Point3;
                reverseNormal: boolean;
            }
            class ThreePointsToleranceDto {
                constructor(start?: Base.Point3, center?: Base.Point3, end?: Base.Point3, tolerance?: number);
                start?: Base.Point3;
                center?: Base.Point3;
                end?: Base.Point3;
                tolerance: number;
            }
            class PointsMaxFilletsHalfLineDto {
                constructor(points?: Base.Point3[], checkLastWithFirst?: boolean, tolerance?: number);
                points?: Base.Point3[];
                checkLastWithFirst?: boolean;
                tolerance?: number;
            }
            class RemoveConsecutiveDuplicatesDto {
                constructor(points?: Base.Point3[], tolerance?: number, checkFirstAndLast?: boolean);
                points: Base.Point3[];
                tolerance: number;
                checkFirstAndLast: boolean;
            }
            class ClosestPointFromPointsDto {
                constructor(points?: Base.Point3[], point?: Base.Point3);
                points: Base.Point3[];
                point: Base.Point3;
            }
            class TwoPointsToleranceDto {
                constructor(point1?: Base.Point3, point2?: Base.Point3, tolerance?: number);
                point1?: Base.Point3;
                point2?: Base.Point3;
                tolerance?: number;
            }
            class StartEndPointsDto {
                constructor(startPoint?: Base.Point3, endPoint?: Base.Point3);
                startPoint: Base.Point3;
                endPoint: Base.Point3;
            }
            class StartEndPointsListDto {
                constructor(startPoint?: Base.Point3, endPoints?: Base.Point3[]);
                startPoint: Base.Point3;
                endPoints: Base.Point3[];
            }
            class MultiplyPointDto {
                constructor(point?: Base.Point3, amountOfPoints?: number);
                point: Base.Point3;
                amountOfPoints: number;
            }
            class SpiralDto {
                constructor(radius?: number, numberPoints?: number, widening?: number, factor?: number, phi?: number);
                phi: number;
                numberPoints: number;
                widening: number;
                radius: number;
                factor: number;
            }
            class HexGridScaledToFitDto {
                constructor(wdith?: number, height?: number, nrHexagonsU?: number, nrHexagonsV?: number, centerGrid?: boolean, pointsOnGround?: boolean);
                width?: number;
                height?: number;
                nrHexagonsInWidth?: number;
                nrHexagonsInHeight?: number;
                flatTop?: boolean;
                extendTop?: boolean;
                extendBottom?: boolean;
                extendLeft?: boolean;
                extendRight?: boolean;
                centerGrid?: boolean;
                pointsOnGround?: boolean;
            }
            class HexGridCentersDto {
                constructor(nrHexagonsX?: number, nrHexagonsY?: number, radiusHexagon?: number, orientOnCenter?: boolean, pointsOnGround?: boolean);
                nrHexagonsY: number;
                nrHexagonsX: number;
                radiusHexagon: number;
                orientOnCenter: boolean;
                pointsOnGround: boolean;
            }
        }
        declare namespace Polyline {
            class PolylineCreateDto {
                constructor(points?: Base.Point3[], isClosed?: boolean);
                points?: Base.Point3[];
                isClosed?: boolean;
            }
            class PolylinePropertiesDto {
                constructor(points?: Base.Point3[], isClosed?: boolean);
                points?: Base.Point3[];
                isClosed?: boolean;
                color?: string | number[];
            }
            class PolylineDto {
                constructor(polyline?: PolylinePropertiesDto);
                polyline?: PolylinePropertiesDto;
            }
            class PolylinesDto {
                constructor(polylines?: PolylinePropertiesDto[]);
                polylines?: PolylinePropertiesDto[];
            }
            class TransformPolylineDto {
                constructor(polyline?: PolylinePropertiesDto, transformation?: Base.TransformMatrixes);
                polyline?: PolylinePropertiesDto;
                transformation?: Base.TransformMatrixes;
            }
            class DrawPolylineDto<T> {
                constructor(polyline?: PolylinePropertiesDto, opacity?: number, colours?: string | string[], size?: number, updatable?: boolean, polylineMesh?: T);
                polyline?: PolylinePropertiesDto;
                opacity?: number;
                colours?: string | string[];
                size?: number;
                updatable?: boolean;
                polylineMesh?: T;
            }
            class DrawPolylinesDto<T> {
                constructor(polylines?: PolylinePropertiesDto[], opacity?: number, colours?: string | string[], size?: number, updatable?: boolean, polylinesMesh?: T);
                polylines?: PolylinePropertiesDto[];
                opacity?: number;
                colours?: string | string[];
                size?: number;
                updatable?: boolean;
                polylinesMesh?: T;
            }
            class SegmentsToleranceDto {
                constructor(segments?: Base.Segment3[]);
                segments?: Base.Segment3[];
                tolerance?: number;
            }
            class PolylineToleranceDto {
                constructor(polyline?: PolylinePropertiesDto, tolerance?: number);
                polyline?: PolylinePropertiesDto;
                tolerance?: number;
            }
            class TwoPolylinesToleranceDto {
                constructor(polyline1?: PolylinePropertiesDto, polyline2?: PolylinePropertiesDto, tolerance?: number);
                polyline1?: PolylinePropertiesDto;
                polyline2?: PolylinePropertiesDto;
                tolerance?: number;
            }
        }
        declare namespace Text {
            class TextDto {
                constructor(text?: string);
                text: string;
            }
            class TextSplitDto {
                constructor(text?: string, separator?: string);
                text: string;
                separator: string;
            }
            class TextReplaceDto {
                constructor(text?: string, search?: string, replaceWith?: string);
                text: string;
                search: string;
                replaceWith: string;
            }
            class TextJoinDto {
                constructor(list?: string[], separator?: string);
                list: string[];
                separator: string;
            }
            class ToStringDto<T> {
                constructor(item?: T);
                item: T;
            }
            class ToStringEachDto<T> {
                constructor(list?: T[]);
                list: T[];
            }
            class TextFormatDto {
                constructor(text?: string, values?: string[]);
                text: string;
                values: string[];
            }
            class TextSearchDto {
                constructor(text?: string, search?: string);
                text: string;
                search: string;
            }
            class TextSubstringDto {
                constructor(text?: string, start?: number, end?: number);
                text: string;
                start: number;
                end?: number;
            }
            class TextIndexDto {
                constructor(text?: string, index?: number);
                text: string;
                index: number;
            }
            class TextPadDto {
                constructor(text?: string, length?: number, padString?: string);
                text: string;
                length: number;
                padString: string;
            }
            class TextRepeatDto {
                constructor(text?: string, count?: number);
                text: string;
                count: number;
            }
            class TextConcatDto {
                constructor(texts?: string[]);
                texts: string[];
            }
            class TextRegexDto {
                constructor(text?: string, pattern?: string, flags?: string);
                text: string;
                pattern: string;
                flags: string;
            }
            class TextRegexReplaceDto {
                constructor(text?: string, pattern?: string, flags?: string, replaceWith?: string);
                text: string;
                pattern: string;
                flags: string;
                replaceWith: string;
            }
            class VectorCharDto {
                constructor(char?: string, xOffset?: number, yOffset?: number, height?: number, extrudeOffset?: number);
                char: string;
                xOffset?: number;
                yOffset?: number;
                height?: number;
                extrudeOffset?: number;
            }
            class VectorTextDto {
                constructor(text?: string, xOffset?: number, yOffset?: number, height?: number, lineSpacing?: number, letterSpacing?: number, align?: Base.horizontalAlignEnum, extrudeOffset?: number, centerOnOrigin?: boolean);
                text?: string;
                xOffset?: number;
                yOffset?: number;
                height?: number;
                lineSpacing?: number;
                letterSpacing?: number;
                align?: Base.horizontalAlignEnum;
                extrudeOffset?: number;
                centerOnOrigin?: boolean;
            }
        }
        declare namespace Transforms {
            class RotationCenterAxisDto {
                constructor(angle?: number, axis?: Base.Vector3, center?: Base.Point3);
                angle: number;
                axis: Base.Vector3;
                center: Base.Point3;
            }
            class RotationCenterDto {
                constructor(angle?: number, center?: Base.Point3);
                angle: number;
                center: Base.Point3;
            }
            class RotationCenterYawPitchRollDto {
                constructor(yaw?: number, pitch?: number, roll?: number, center?: Base.Point3);
                yaw: number;
                pitch: number;
                roll: number;
                center: Base.Point3;
            }
            class ScaleXYZDto {
                constructor(scaleXyz?: Base.Vector3);
                scaleXyz: Base.Vector3;
            }
            class StretchDirCenterDto {
                constructor(scale?: number, center?: Base.Point3, direction?: Base.Vector3);
                center?: Base.Point3;
                direction?: Base.Vector3;
                scale?: number;
            }
            class ScaleCenterXYZDto {
                constructor(center?: Base.Point3, scaleXyz?: Base.Vector3);
                center: Base.Point3;
                scaleXyz: Base.Vector3;
            }
            class UniformScaleDto {
                constructor(scale?: number);
                scale: number;
            }
            class UniformScaleFromCenterDto {
                constructor(scale?: number, center?: Base.Point3);
                scale: number;
                center: Base.Point3;
            }
            class TranslationXYZDto {
                constructor(translation?: Base.Vector3);
                translation: Base.Vector3;
            }
            class TranslationsXYZDto {
                constructor(translations?: Base.Vector3[]);
                translations: Base.Vector3[];
            }
        }
        declare namespace Vector {
            class TwoVectorsDto {
                constructor(first?: number[], second?: number[]);
                first: number[];
                second: number[];
            }
            class VectorBoolDto {
                constructor(vector?: boolean[]);
                vector: boolean[];
            }
            class RemoveAllDuplicateVectorsDto {
                constructor(vectors?: number[][], tolerance?: number);
                vectors: number[][];
                tolerance: number;
            }
            class RemoveConsecutiveDuplicateVectorsDto {
                constructor(vectors?: number[][], checkFirstAndLast?: boolean, tolerance?: number);
                vectors: number[][];
                checkFirstAndLast: boolean;
                tolerance: number;
            }
            class VectorsTheSameDto {
                constructor(vec1?: number[], vec2?: number[], tolerance?: number);
                vec1: number[];
                vec2: number[];
                tolerance: number;
            }
            class VectorDto {
                constructor(vector?: number[]);
                vector: number[];
            }
            class VectorStringDto {
                constructor(vector?: string[]);
                vector: string[];
            }
            class Vector3Dto {
                constructor(vector?: Base.Vector3);
                vector: Base.Vector3;
            }
            class RangeMaxDto {
                constructor(max?: number);
                max: number;
            }
            class VectorXYZDto {
                constructor(x?: number, y?: number, z?: number);
                x: number;
                y: number;
                z: number;
            }
            class VectorXYDto {
                constructor(x?: number, y?: number);
                x: number;
                y: number;
            }
            class SpanDto {
                constructor(step?: number, min?: number, max?: number);
                step: number;
                min: number;
                max: number;
            }
            class SpanEaseItemsDto {
                constructor(nrItems?: number, min?: number, max?: number, ease?: Math.easeEnum);
                nrItems: number;
                min: number;
                max: number;
                ease: Math.easeEnum;
                intervals: boolean;
            }
            class SpanLinearItemsDto {
                constructor(nrItems?: number, min?: number, max?: number);
                nrItems: number;
                min: number;
                max: number;
            }
            class RayPointDto {
                constructor(point?: Base.Point3, distance?: number, vector?: number[]);
                point: Base.Point3;
                distance: number;
                vector: number[];
            }
            class VectorsDto {
                constructor(vectors?: number[][]);
                vectors: number[][];
            }
            class FractionTwoVectorsDto {
                constructor(fraction?: number, first?: Base.Vector3, second?: Base.Vector3);
                fraction: number;
                first: Base.Vector3;
                second: Base.Vector3;
            }
            class VectorScalarDto {
                constructor(scalar?: number, vector?: number[]);
                scalar: number;
                vector: number[];
            }
            class TwoVectorsReferenceDto {
                constructor(reference?: number[], first?: Base.Vector3, second?: Base.Vector3);
                reference: number[];
                first: Base.Vector3;
                second: Base.Vector3;
            }
        }
        declare namespace Asset {
            class GetAssetDto {
                constructor(fileName?: string);
                fileName: string;
            }
            class FetchDto {
                constructor(url?: string);
                url: string;
            }
            class FileDto {
                constructor(file?: File | Blob);
                file: File | Blob;
            }
            class FilesDto {
                constructor(files?: (File | Blob)[]);
                files: (File | Blob)[];
            }
            class AssetFileDto {
                constructor(assetFile?: File, hidden?: boolean);
                assetFile: File;
                hidden: boolean;
            }
            class AssetFileByUrlDto {
                constructor(assetFile?: string, rootUrl?: string, hidden?: boolean);
                assetFile: string;
                rootUrl: string;
                hidden: boolean;
            }
            class DownloadDto {
                constructor(fileName?: string, content?: string | Blob, extension?: string, contentType?: string);
                fileName: string;
                content: string | Blob;
                extension: string;
                contentType: string;
            }
        }
        declare namespace Base {
            enum colorMapStrategyEnum {
                firstColorForAll = "firstColorForAll",
                lastColorRemainder = "lastColorRemainder",
                repeatColors = "repeatColors",
                reversedColors = "reversedColors"
            }
            enum skyboxEnum {
                default = "default",
                clearSky = "clearSky",
                city = "city",
                greyGradient = "greyGradient"
            }
            enum fogModeEnum {
                none = "none",
                exponential = "exponential",
                exponentialSquared = "exponentialSquared",
                linear = "linear"
            }
            enum horizontalAlignEnum {
                left = "left",
                center = "center",
                right = "right"
            }
            enum verticalAlignmentEnum {
                top = "top",
                middle = "middle",
                bottom = "bottom"
            }
            enum topBottomEnum {
                top = "top",
                bottom = "bottom"
            }
            enum basicAlignmentEnum {
                topLeft = "topLeft",
                topMid = "topMid",
                topRight = "topRight",
                midLeft = "midLeft",
                midMid = "midMid",
                midRight = "midRight",
                bottomLeft = "bottomLeft",
                bottomMid = "bottomMid",
                bottomRight = "bottomRight"
            }
            type Color = string;
            type ColorRGB = {
                r: number;
                g: number;
                b: number;
            };
            type Point2 = [
                number,
                number
            ];
            type Vector2 = [
                number,
                number
            ];
            type Point3 = [
                number,
                number,
                number
            ];
            type Vector3 = [
                number,
                number,
                number
            ];
            type Axis3 = {
                origin: Base.Point3;
                direction: Base.Vector3;
            };
            type Axis2 = {
                origin: Base.Point2;
                direction: Base.Vector2;
            };
            type Segment2 = [
                Point2,
                Point2
            ];
            type Segment3 = [
                Point3,
                Point3
            ];
            type TrianglePlane3 = {
                normal: Vector3;
                d: number;
            };
            type Triangle3 = [
                Base.Point3,
                Base.Point3,
                Base.Point3
            ];
            type Mesh3 = Triangle3[];
            type Plane3 = {
                origin: Base.Point3;
                normal: Base.Vector3;
                direction: Base.Vector3;
            };
            type BoundingBox = {
                min: Base.Point3;
                max: Base.Point3;
                center?: Base.Point3;
                width?: number;
                height?: number;
                length?: number;
            };
            type Line2 = {
                start: Base.Point2;
                end: Base.Point2;
            };
            type Line3 = {
                start: Base.Point3;
                end: Base.Point3;
            };
            type Polyline3 = {
                points: Base.Point3[];
                isClosed?: boolean;
            };
            type Polyline2 = {
                points: Base.Point2[];
                isClosed?: boolean;
            };
            type VerbCurve = {
                tessellate: (options: any) => any;
            };
            type VerbSurface = {
                tessellate: (options: any) => any;
            };
            type TransformMatrix3x3 = [
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number
            ];
            type TransformMatrixes3x3 = TransformMatrix3x3[];
            type TransformMatrix = [
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number,
                number
            ];
            type TransformMatrixes = TransformMatrix[];
        }
        declare namespace CSV {
            class ParseToArrayDto {
                constructor(csv?: string, rowSeparator?: string, columnSeparator?: string);
                csv: string;
                rowSeparator?: string;
                columnSeparator?: string;
            }
            class ParseToJsonDto {
                constructor(csv?: string, headerRow?: number, dataStartRow?: number, rowSeparator?: string, columnSeparator?: string, numberColumns?: string[]);
                csv: string;
                headerRow?: number;
                dataStartRow?: number;
                rowSeparator?: string;
                columnSeparator?: string;
                numberColumns?: string[];
            }
            class ParseToJsonWithHeadersDto {
                constructor(csv?: string, headers?: string[], dataStartRow?: number, rowSeparator?: string, columnSeparator?: string, numberColumns?: string[]);
                csv: string;
                headers: string[];
                dataStartRow?: number;
                rowSeparator?: string;
                columnSeparator?: string;
                numberColumns?: string[];
            }
            class QueryColumnDto {
                constructor(csv?: string, column?: string, headerRow?: number, dataStartRow?: number, rowSeparator?: string, columnSeparator?: string, asNumber?: boolean);
                csv: string;
                column: string;
                headerRow?: number;
                dataStartRow?: number;
                rowSeparator?: string;
                columnSeparator?: string;
                asNumber?: boolean;
            }
            class QueryRowsByValueDto {
                constructor(csv?: string, column?: string, value?: string, headerRow?: number, dataStartRow?: number, rowSeparator?: string, columnSeparator?: string, numberColumns?: string[]);
                csv: string;
                column: string;
                value: string;
                headerRow?: number;
                dataStartRow?: number;
                rowSeparator?: string;
                columnSeparator?: string;
                numberColumns?: string[];
            }
            class ArrayToCsvDto {
                constructor(array?: (string | number | boolean | null | undefined)[][], rowSeparator?: string, columnSeparator?: string);
                array: (string | number | boolean | null | undefined)[][];
                rowSeparator?: string;
                columnSeparator?: string;
            }
            class JsonToCsvDto<T = Record<string, unknown>> {
                constructor(json?: T[], headers?: string[], includeHeaders?: boolean, rowSeparator?: string, columnSeparator?: string);
                json: T[];
                headers: string[];
                includeHeaders?: boolean;
                rowSeparator?: string;
                columnSeparator?: string;
            }
            class JsonToCsvAutoDto<T = Record<string, unknown>> {
                constructor(json?: T[], includeHeaders?: boolean, rowSeparator?: string, columnSeparator?: string);
                json: T[];
                includeHeaders?: boolean;
                rowSeparator?: string;
                columnSeparator?: string;
            }
            class GetHeadersDto {
                constructor(csv?: string, headerRow?: number, rowSeparator?: string, columnSeparator?: string);
                csv: string;
                headerRow?: number;
                rowSeparator?: string;
                columnSeparator?: string;
            }
            class GetRowCountDto {
                constructor(csv?: string, hasHeaders?: boolean, dataStartRow?: number, rowSeparator?: string, columnSeparator?: string);
                csv: string;
                hasHeaders?: boolean;
                dataStartRow?: number;
                rowSeparator?: string;
                columnSeparator?: string;
            }
        }
        declare namespace JSON {
            class StringifyDto {
                constructor(json?: any);
                json: any;
            }
            class ParseDto {
                constructor(text?: string);
                text: string;
            }
            class QueryDto {
                constructor(json?: any, query?: string);
                json: any;
                query: string;
            }
            class SetValueOnPropDto {
                constructor(json?: any, value?: any, property?: string);
                json: any;
                value: any;
                property: string;
            }
            class GetJsonFromArrayByFirstPropMatchDto {
                constructor(jsonArray?: any[], property?: string, match?: any);
                jsonArray: any[];
                property: string;
                match: any;
            }
            class GetValueOnPropDto {
                constructor(json?: any, property?: string);
                json: any;
                property: string;
            }
            class SetValueDto {
                constructor(json?: any, value?: any, path?: string, prop?: string);
                json: any;
                value: any;
                path: string;
                prop: string;
            }
            class SetValuesOnPathsDto {
                constructor(json?: any, values?: any[], paths?: string[], props?: [
                ]);
                json: any;
                values: any[];
                paths: string[];
                props: string[];
            }
            class PathsDto {
                constructor(json?: any, query?: string);
                json: any;
                query: string;
            }
            class JsonDto {
                constructor(json?: any);
                json: any;
            }
        }
        declare namespace Tag {
            class DrawTagDto {
                constructor(tag?: TagDto, updatable?: boolean, tagVariable?: TagDto);
                tag: TagDto;
                updatable: boolean;
                tagVariable?: TagDto;
            }
            class DrawTagsDto {
                constructor(tags?: TagDto[], updatable?: boolean, tagsVariable?: TagDto[]);
                tags: TagDto[];
                updatable: boolean;
                tagsVariable?: TagDto[];
            }
            class TagDto {
                constructor(text?: string, position?: Base.Point3, colour?: string, size?: number, adaptDepth?: boolean, needsUpdate?: boolean, id?: string);
                text: string;
                position: Base.Point3;
                colour: string;
                size: number;
                adaptDepth: boolean;
                needsUpdate?: boolean;
                id?: string;
            }
        }
        declare namespace Time {
            class PostFromIframe {
                constructor(data?: any, targetOrigin?: string);
                data: any;
                targetOrigin: string;
            }
        }
        declare namespace Verb {
            class CurveDto {
                constructor(curve?: any);
                curve: any;
            }
            class LineDto {
                constructor(line?: Base.Line3);
                line: Base.Line3;
            }
            class LinesDto {
                constructor(lines?: Base.Line3[]);
                lines: Base.Line3[];
            }
            class PolylineDto {
                constructor(polyline?: Base.Polyline3);
                polyline: Base.Polyline3;
            }
            class PolylinesDto {
                constructor(polylines?: Base.Polyline3[]);
                polylines: Base.Polyline3[];
            }
            class CurvesDto {
                constructor(curves?: any[]);
                curves: any[];
            }
            class ClosestPointDto {
                constructor(curve?: any, point?: Base.Point3);
                curve: any;
                point: Base.Point3;
            }
            class ClosestPointsDto {
                constructor(curve?: any, points?: Base.Point3[]);
                curve: any;
                points: Base.Point3[];
            }
            class BezierCurveDto {
                constructor(points?: Base.Point3[], weights?: number[]);
                points: Base.Point3[];
                weights: number[];
            }
            class DrawCurveDto<T> {
                constructor(curve?: any, opacity?: number, colours?: string | string[], size?: number, updatable?: boolean, curveMesh?: T);
                curve: any;
                opacity: number;
                colours: string | string[];
                size: number;
                updatable: boolean;
                curveMesh?: T;
            }
            class CurveParameterDto {
                constructor(curve?: any, parameter?: number);
                curve: any;
                parameter: number;
            }
            class CurvesParameterDto {
                constructor(curves?: any[], parameter?: number);
                curves: any;
                parameter: number;
            }
            class CurveTransformDto {
                constructor(curve?: any, transformation?: Base.TransformMatrixes);
                curve: any;
                transformation: Base.TransformMatrixes;
            }
            class CurvesTransformDto {
                constructor(curves?: any[], transformation?: Base.TransformMatrixes);
                curves: any[];
                transformation: Base.TransformMatrixes;
            }
            class CurveToleranceDto {
                constructor(curve?: any, tolerance?: number);
                curve: any;
                tolerance: number;
            }
            class CurveLengthToleranceDto {
                constructor(curve?: any, length?: number, tolerance?: number);
                curve: any;
                length: number;
                tolerance: number;
            }
            class CurveDerivativesDto {
                constructor(curve?: any, parameter?: number, numDerivatives?: number);
                curve: any;
                numDerivatives: number;
                parameter: number;
            }
            class CurveSubdivisionsDto {
                constructor(curve?: any, subdivision?: number);
                curve: any;
                subdivision: number;
            }
            class CurvesSubdivisionsDto {
                constructor(curves?: any[], subdivision?: number);
                curves: any[];
                subdivision: number;
            }
            class CurvesDivideLengthDto {
                constructor(curves?: any[], length?: number);
                curves: any[];
                length: number;
            }
            class CurveDivideLengthDto {
                constructor(curve?: any, length?: number);
                curve: any;
                length: number;
            }
            class DrawCurvesDto<T> {
                constructor(curves?: any[], opacity?: number, colours?: string | string[], size?: number, updatable?: boolean, curvesMesh?: T);
                curves: any[];
                opacity: number;
                colours: string | string[];
                size: number;
                updatable: boolean;
                curvesMesh?: T;
            }
            class CurveNurbsDataDto {
                constructor(degree?: number, weights?: number[], knots?: number[], points?: Base.Point3[]);
                degree: number;
                weights: number[];
                knots: number[];
                points: Base.Point3[];
            }
            class CurvePathDataDto {
                constructor(degree?: number, points?: Base.Point3[]);
                degree: number;
                points: Base.Point3[];
            }
            class EllipseDto {
                constructor(ellipse?: any);
                ellipse: any;
            }
            class CircleDto {
                constructor(circle?: any);
                circle: any;
            }
            class ArcDto {
                constructor(arc?: any);
                arc: any;
            }
            class EllipseParametersDto {
                constructor(xAxis?: Base.Vector3, yAxis?: Base.Vector3, center?: Base.Point3);
                xAxis: Base.Vector3;
                yAxis: Base.Vector3;
                center: Base.Point3;
            }
            class CircleParametersDto {
                constructor(xAxis?: Base.Vector3, yAxis?: Base.Vector3, radius?: number, center?: Base.Point3);
                xAxis: Base.Vector3;
                yAxis: Base.Vector3;
                radius: number;
                center: Base.Point3;
            }
            class ArcParametersDto {
                constructor(minAngle?: number, maxAngle?: number, xAxis?: Base.Vector3, yAxis?: Base.Vector3, radius?: number, center?: Base.Point3);
                minAngle: number;
                maxAngle: number;
                xAxis: Base.Vector3;
                yAxis: Base.Vector3;
                radius: number;
                center: Base.Point3;
            }
            class EllipseArcParametersDto {
                constructor(minAngle?: number, maxAngle?: number, xAxis?: Base.Vector3, yAxis?: Base.Vector3, center?: Base.Point3);
                minAngle: number;
                maxAngle: number;
                xAxis: Base.Vector3;
                yAxis: Base.Vector3;
                center: Base.Point3;
            }
            class SurfaceDto {
                constructor(surface?: any);
                surface: any;
            }
            class SurfaceTransformDto {
                constructor(surface?: any, transformation?: Base.TransformMatrixes);
                surface: any;
                transformation: Base.TransformMatrixes;
            }
            class SurfaceParameterDto {
                constructor(surface?: any, parameter?: number, useV?: boolean);
                surface: any;
                parameter: number;
                useV: boolean;
            }
            class IsocurvesParametersDto {
                constructor(surface?: any, parameters?: number[], useV?: boolean);
                surface: any;
                parameters: number[];
                useV: boolean;
            }
            class IsocurveSubdivisionDto {
                constructor(surface?: any, useV?: boolean, includeLast?: boolean, includeFirst?: boolean, isocurveSegments?: number);
                surface: any;
                useV: boolean;
                includeLast: boolean;
                includeFirst: boolean;
                isocurveSegments: number;
            }
            class DerivativesDto {
                constructor(surface?: any, u?: number, v?: number, numDerivatives?: number);
                surface: any;
                u: number;
                v: number;
                numDerivatives: number;
            }
            class SurfaceLocationDto {
                constructor(surface?: any, u?: number, v?: number);
                surface: any;
                u: number;
                v: number;
            }
            class CornersDto {
                constructor(point1?: Base.Point3, point2?: Base.Point3, point3?: Base.Point3, point4?: Base.Point3);
                point1: Base.Point3;
                point2: Base.Point3;
                point3: Base.Point3;
                point4: Base.Point3;
            }
            class SurfaceParamDto {
                constructor(surface?: any, point?: Base.Point3);
                surface: any;
                point: Base.Point3;
            }
            class KnotsControlPointsWeightsDto {
                constructor(degreeU?: number, degreeV?: number, knotsU?: number[], knotsV?: number[], points?: Base.Point3[], weights?: number[]);
                degreeU: number;
                degreeV: number;
                knotsU: number[];
                knotsV: number[];
                points: Base.Point3[];
                weights: number[];
            }
            class LoftCurvesDto {
                constructor(degreeV?: number, curves?: any[]);
                degreeV: number;
                curves: any[];
            }
            class DrawSurfaceDto<T> {
                constructor(surface?: any, opacity?: number, colours?: string | string[], updatable?: boolean, hidden?: boolean, surfaceMesh?: T, drawTwoSided?: boolean, backFaceColour?: string, backFaceOpacity?: number);
                surface: any;
                opacity: number;
                colours: string | string[];
                updatable: boolean;
                hidden: boolean;
                surfaceMesh?: T;
                drawTwoSided: boolean;
                backFaceColour: string;
                backFaceOpacity: number;
            }
            class DrawSurfacesDto<T> {
                constructor(surfaces?: any[], opacity?: number, colours?: string | string[], updatable?: boolean, hidden?: boolean, surfacesMesh?: T, drawTwoSided?: boolean, backFaceColour?: string, backFaceOpacity?: number);
                surfaces: any[];
                opacity: number;
                colours: string | string[];
                updatable: boolean;
                hidden: boolean;
                surfacesMesh?: T;
                drawTwoSided: boolean;
                backFaceColour: string;
                backFaceOpacity: number;
            }
            class DrawSurfacesColoursDto<T> {
                constructor(surfaces?: any[], colours?: string[], opacity?: number, updatable?: boolean, hidden?: boolean, surfacesMesh?: T, drawTwoSided?: boolean, backFaceColour?: string, backFaceOpacity?: number);
                surfaces: any[];
                opacity: number;
                colours: string | string[];
                updatable: boolean;
                hidden: boolean;
                surfacesMesh?: T;
                drawTwoSided: boolean;
                backFaceColour: string;
                backFaceOpacity: number;
            }
            class ConeAndCylinderParametersDto {
                constructor(axis?: Base.Vector3, xAxis?: Base.Vector3, base?: Base.Point3, height?: number, radius?: number);
                axis: Base.Vector3;
                xAxis: Base.Vector3;
                base: Base.Point3;
                height: number;
                radius: number;
            }
            class ConeDto {
                constructor(cone?: any);
                cone: any;
            }
            class CylinderDto {
                constructor(cylinder?: any);
                cylinder: any;
            }
            class ExtrusionParametersDto {
                constructor(profile?: any, direction?: Base.Vector3);
                profile: any;
                direction: Base.Vector3;
            }
            class ExtrusionDto {
                constructor(extrusion?: any);
                extrusion: any;
            }
            class SphericalParametersDto {
                constructor(radius?: number, center?: number[]);
                radius: number;
                center: number[];
            }
            class SphereDto {
                constructor(sphere?: any);
                sphere: any;
            }
            class RevolutionParametersDto {
                constructor(profile?: any, center?: number[], axis?: number[], angle?: number);
                profile: any;
                center: number[];
                axis: number[];
                angle: number;
            }
            class RevolutionDto {
                constructor(revolution?: any);
                revolution: any;
            }
            class SweepParametersDto {
                constructor(profile?: any, rail?: any);
                profile: any;
                rail: any;
            }
            class SweepDto {
                constructor(sweep?: any);
                sweep: any;
            }
            class CurveCurveDto {
                constructor(firstCurve?: any, secondCurve?: any, tolerance?: number);
                firstCurve: any;
                secondCurve: number[];
                tolerance?: number;
            }
            class CurveSurfaceDto {
                constructor(curve?: any, surface?: any, tolerance?: number);
                curve: any;
                surface: any;
                tolerance?: number;
            }
            class SurfaceSurfaceDto {
                constructor(firstSurface?: any, secondSurface?: any, tolerance?: number);
                firstSurface: any;
                secondSurface: any;
                tolerance?: number;
            }
            class CurveCurveIntersectionsDto {
                constructor(intersections?: BaseTypes.CurveCurveIntersection[]);
                intersections: BaseTypes.CurveCurveIntersection[];
            }
            class CurveSurfaceIntersectionsDto {
                constructor(intersections?: BaseTypes.CurveSurfaceIntersection[]);
                intersections: BaseTypes.CurveSurfaceIntersection[];
            }
        }
    }
    declare namespace Models {
        declare namespace Point {
            declare class HexGridData {
                centers: Base.Point3[];
                hexagons: Base.Point3[][];
                shortestDistEdge: number;
                longestDistEdge: number;
                maxFilletRadius: number;
            }
        }
        declare namespace Text {
            declare class VectorCharData {
                constructor(width?: number, height?: number, paths?: Base.Point3[][]);
                width?: number;
                height?: number;
                paths?: Base.Point3[][];
            }
            declare class VectorTextData {
                constructor(width?: number, height?: number, chars?: VectorCharData[]);
                width?: number;
                height?: number;
                chars?: VectorCharData[];
            }
        }
        declare namespace OCCT {
            declare class ShapeWithId<U> {
                id: string;
                shape: U;
            }
            declare class ObjectDefinition<M, U> {
                compound?: U;
                shapes?: ShapeWithId<U>[];
                data?: M;
            }
            declare class TextWiresCharShapePart<T> {
                id?: string;
                shapes?: {
                    compound?: T;
                };
            }
            declare class TextWiresDataDto<T> {
                type: string;
                name: string;
                compound?: T;
                characters?: TextWiresCharShapePart<T>[];
                width: number;
                height: number;
                center: Base.Point3;
            }
        }
    }
    declare namespace Things {
        declare namespace Enums {
            declare class LodDto {
                lod: lodEnum;
            }
            declare enum lodEnum {
                low = "low",
                middle = "middle",
                high = "high"
            }
        }
        declare namespace Architecture {
            declare namespace Houses {
                declare namespace ZenHideout {
                    declare class ZenHideoutData<T> {
                        type: string;
                        name: string;
                        originalInputs?: ZenHideoutDto;
                        compound?: T;
                        shapes?: Models.OCCT.ShapeWithId<Inputs.OCCT.TopoDSShapePointer>[];
                        drawingPart?: ZenHideoutDrawingPart<T>;
                        sandwitchPartsBetweenColumns?: Things.Architecture.SandwitchPart<T>[];
                        cornerParts?: Things.Architecture.CornerPart<T>[];
                        columnParts?: Things.Architecture.ColumnPart<T>[];
                        roofParts?: Things.Architecture.RoofPart<T>[];
                        entranceCorner?: Things.Architecture.CornerEntrancePart<T>;
                        entranceTerrace?: Things.Architecture.CornerEntrancePart<T>;
                        floors?: Things.Architecture.FloorPart<T>[];
                        ceilings?: Things.Architecture.CeilingPart<T>[];
                    }
                    declare class ZenHideoutDrawingPartShapes<T> {
                        windowGlassCompound?: T;
                        glassFramesCompound?: T;
                        windowFrameCompound?: T;
                        beamsCompound?: T;
                        columnsCompound?: T;
                        firstFloorExteriorPanelsCompound?: T;
                        firstFloorInteriorPanelsCompound?: T;
                        roofExteriorPanelsCompound?: T;
                        roofInteriorPanelsCompound?: T;
                        roofCoverFirstCompound?: T;
                        roofCoverSecondCompound?: T;
                        floorCompound?: T;
                        ceilingCompound?: T;
                        stairsCompound?: T;
                    }
                    declare class ZenHideoutDrawingPart<T> {
                        shapes?: ZenHideoutDrawingPartShapes<T>;
                    }
                    declare class ZenHideoutDtoBase<T, U, V> {
                        widthFirstWing: T;
                        lengthFirstWing: T;
                        terraceWidth: T;
                        widthSecondWing: T;
                        lengthSecondWing: T;
                        heightWalls: T;
                        roofAngleFirstWing: T;
                        roofAngleSecondWing: T;
                        roofOffset: T;
                        roofInsideOverhang: T;
                        roofMaxDistAttachmentBeams: T;
                        roofAttachmentBeamWidth: T;
                        roofAttachmentBeamHeight: T;
                        roofOutsideOverhang: T;
                        columnSize: T;
                        ceilingBeamHeight: T;
                        ceilingBeamWidth: T;
                        nrCeilingBeamsBetweenColumns: T;
                        distBetweenColumns: T;
                        floorHeight: T;
                        groundLevel: T;
                        facadePanelThickness: T;
                        windowWidthOffset: T;
                        windowHeightOffset: T;
                        windowFrameThickness: T;
                        windowGlassFrameThickness: T;
                        lod: U;
                        rotation?: T;
                        origin?: V;
                    }
                    declare class ZenHideoutDto implements ZenHideoutDtoBase<number, Things.Enums.lodEnum, Inputs.Base.Point3> {
                        constructor(widthFirstWing?: number, lengthFirstWing?: number, terraceWidth?: number, widthSecondWing?: number, lengthSecondWing?: number, heightWalls?: number, roofAngleFirstWing?: number, roofAngleSecondWing?: number, roofOffset?: number, roofInsideOverhang?: number, roofMaxDistAttachmentBeams?: number, roofAttachmentBeamWidth?: number, roofAttachmentBeamHeight?: number, roofOutsideOverhang?: number, columnSize?: number, ceilingBeamHeight?: number, ceilingBeamWidth?: number, nrCeilingBeamsBetweenColumns?: number, distBetweenColumns?: number, floorHeight?: number, groundLevel?: number, facadePanelThickness?: number, windowWidthOffset?: number, windowHeightOffset?: number, windowFrameThickness?: number, windowGlassFrameThickness?: number, lod?: Things.Enums.lodEnum, skinOpacity?: number, rotation?: number, origin?: Inputs.Base.Point3);
                        widthFirstWing: number;
                        lengthFirstWing: number;
                        terraceWidth: number;
                        widthSecondWing: number;
                        lengthSecondWing: number;
                        heightWalls: number;
                        roofAngleFirstWing: number;
                        roofAngleSecondWing: number;
                        roofOffset: number;
                        roofInsideOverhang: number;
                        roofMaxDistAttachmentBeams: number;
                        roofAttachmentBeamWidth: number;
                        roofAttachmentBeamHeight: number;
                        roofOutsideOverhang: number;
                        columnSize: number;
                        ceilingBeamHeight: number;
                        ceilingBeamWidth: number;
                        nrCeilingBeamsBetweenColumns: number;
                        distBetweenColumns: number;
                        floorHeight: number;
                        groundLevel: number;
                        facadePanelThickness: number;
                        windowWidthOffset: number;
                        windowHeightOffset: number;
                        windowFrameThickness: number;
                        windowGlassFrameThickness: number;
                        lod: Things.Enums.lodEnum;
                        skinOpacity: number;
                        rotation: number;
                        origin: Inputs.Base.Point3;
                    }
                }
            }
            declare class BeamPart<T> {
                id?: string;
                name?: string;
                width?: number;
                length?: number;
                height?: number;
                shapes?: {
                    beam?: T;
                };
            }
            declare class CeilingPart<T> {
                id?: string;
                name?: string;
                area?: number;
                thickness?: number;
                polygonPoints?: Inputs.Base.Point3[];
                shapes?: {
                    compound?: T;
                };
            }
            declare class ColumnPart<T> {
                id?: string;
                name?: string;
                width?: number;
                length?: number;
                height?: number;
                shapes?: {
                    column?: T;
                };
            }
            declare class CornerEntranceDto {
                widthFirstWing: number;
                widthSecondWing: number;
                lengthStairFirstWing: number;
                lengthStairSecondWing: number;
                lengthWallFirstWing: number;
                lengthWallSecondWing: number;
                facadePanelThickness: number;
                wallThickness: number;
                wallHeightExterior: number;
                wallHeightInterior: number;
                windowFrameOffsetTop: number;
                windowFrameThickness: number;
                glassFrameThickness: number;
                doorWidth: number;
                windowWidthOffset: number;
                stairTotalHeight: number;
                createStair: boolean;
                flipDirection: boolean;
                rotation: number;
                origin: Inputs.Base.Point3;
            }
            declare class CornerEntrancePart<T> {
                id?: string;
                name?: string;
                panelThickness?: number;
                widthPanelExteriorOne?: number;
                heightPanelsExterior?: number;
                stair?: CornerStairPart<T>;
                window?: WindowCornerPart<T>;
                shapes?: {
                    compound?: T;
                    panelExterior?: T;
                    panelInterior?: T;
                };
            }
            declare class CornerPart<T> {
                id?: string;
                name?: string;
                widthPanel?: number;
                heightPanel?: number;
                thicknessPanel?: number;
                shapes?: {
                    corner?: T;
                };
            }
            declare class CornerStairDto {
                invert: boolean;
                widthFirstLanding: number;
                widthSecondLanding: number;
                lengthFirstWing: number;
                lengthSecondWing: number;
                maxWishedStepHeight: number;
                stepHeightWidthProportion: number;
                totalHeight: number;
                rotation: number;
                origin: Inputs.Base.Point3;
            }
            declare class CornerStairPart<T> extends CornerStairDto {
                id?: string;
                name?: string;
                steps?: number;
                stepWidth?: number;
                stepHeight?: number;
                shapes?: {
                    stair?: T;
                };
            }
            declare class FloorPart<T> {
                id?: string;
                name?: string;
                area?: number;
                thickness?: number;
                polygonPoints?: Inputs.Base.Point3[];
                shapes?: {
                    compound?: T;
                };
            }
            declare class ZenHideoutData<T> {
                type: string;
                name: string;
                originalInputs?: ZenHideoutDto;
                compound?: T;
                shapes?: Models.OCCT.ShapeWithId<Inputs.OCCT.TopoDSShapePointer>[];
                drawingPart?: ZenHideoutDrawingPart<T>;
                sandwitchPartsBetweenColumns?: Things.Architecture.SandwitchPart<T>[];
                cornerParts?: Things.Architecture.CornerPart<T>[];
                columnParts?: Things.Architecture.ColumnPart<T>[];
                roofParts?: Things.Architecture.RoofPart<T>[];
                entranceCorner?: Things.Architecture.CornerEntrancePart<T>;
                entranceTerrace?: Things.Architecture.CornerEntrancePart<T>;
                floors?: Things.Architecture.FloorPart<T>[];
                ceilings?: Things.Architecture.CeilingPart<T>[];
            }
            declare class ZenHideoutDrawingPartShapes<T> {
                windowGlassCompound?: T;
                glassFramesCompound?: T;
                windowFrameCompound?: T;
                beamsCompound?: T;
                columnsCompound?: T;
                firstFloorExteriorPanelsCompound?: T;
                firstFloorInteriorPanelsCompound?: T;
                roofExteriorPanelsCompound?: T;
                roofInteriorPanelsCompound?: T;
                roofCoverFirstCompound?: T;
                roofCoverSecondCompound?: T;
                floorCompound?: T;
                ceilingCompound?: T;
                stairsCompound?: T;
            }
            declare class ZenHideoutDrawingPart<T> {
                shapes?: ZenHideoutDrawingPartShapes<T>;
            }
            declare class ZenHideoutDtoBase<T, U, V> {
                widthFirstWing: T;
                lengthFirstWing: T;
                terraceWidth: T;
                widthSecondWing: T;
                lengthSecondWing: T;
                heightWalls: T;
                roofAngleFirstWing: T;
                roofAngleSecondWing: T;
                roofOffset: T;
                roofInsideOverhang: T;
                roofMaxDistAttachmentBeams: T;
                roofAttachmentBeamWidth: T;
                roofAttachmentBeamHeight: T;
                roofOutsideOverhang: T;
                columnSize: T;
                ceilingBeamHeight: T;
                ceilingBeamWidth: T;
                nrCeilingBeamsBetweenColumns: T;
                distBetweenColumns: T;
                floorHeight: T;
                groundLevel: T;
                facadePanelThickness: T;
                windowWidthOffset: T;
                windowHeightOffset: T;
                windowFrameThickness: T;
                windowGlassFrameThickness: T;
                lod: U;
                rotation?: T;
                origin?: V;
            }
            declare class ZenHideoutDto implements ZenHideoutDtoBase<number, Things.Enums.lodEnum, Inputs.Base.Point3> {
                constructor(widthFirstWing?: number, lengthFirstWing?: number, terraceWidth?: number, widthSecondWing?: number, lengthSecondWing?: number, heightWalls?: number, roofAngleFirstWing?: number, roofAngleSecondWing?: number, roofOffset?: number, roofInsideOverhang?: number, roofMaxDistAttachmentBeams?: number, roofAttachmentBeamWidth?: number, roofAttachmentBeamHeight?: number, roofOutsideOverhang?: number, columnSize?: number, ceilingBeamHeight?: number, ceilingBeamWidth?: number, nrCeilingBeamsBetweenColumns?: number, distBetweenColumns?: number, floorHeight?: number, groundLevel?: number, facadePanelThickness?: number, windowWidthOffset?: number, windowHeightOffset?: number, windowFrameThickness?: number, windowGlassFrameThickness?: number, lod?: Things.Enums.lodEnum, skinOpacity?: number, rotation?: number, origin?: Inputs.Base.Point3);
                widthFirstWing: number;
                lengthFirstWing: number;
                terraceWidth: number;
                widthSecondWing: number;
                lengthSecondWing: number;
                heightWalls: number;
                roofAngleFirstWing: number;
                roofAngleSecondWing: number;
                roofOffset: number;
                roofInsideOverhang: number;
                roofMaxDistAttachmentBeams: number;
                roofAttachmentBeamWidth: number;
                roofAttachmentBeamHeight: number;
                roofOutsideOverhang: number;
                columnSize: number;
                ceilingBeamHeight: number;
                ceilingBeamWidth: number;
                nrCeilingBeamsBetweenColumns: number;
                distBetweenColumns: number;
                floorHeight: number;
                groundLevel: number;
                facadePanelThickness: number;
                windowWidthOffset: number;
                windowHeightOffset: number;
                windowFrameThickness: number;
                windowGlassFrameThickness: number;
                lod: Things.Enums.lodEnum;
                skinOpacity: number;
                rotation: number;
                origin: Inputs.Base.Point3;
            }
            declare class RoofBeamsPart<T> {
                beamsCeiling?: BeamPart<T>[];
                beamsVerticalHigh?: BeamPart<T>[];
                beamsVerticalLow?: BeamPart<T>[];
                beamsTop?: BeamPart<T>[];
                beamsAttachment: BeamPart<T>[];
                shapes?: {
                    compound?: T;
                };
            }
            declare class RoofCoverOneSidedDto {
                name: string;
                roofAngle: number;
                roofLength: number;
                roofWidth: number;
                roofOutsideOverhang: number;
                roofInsideOverhang: number;
                roofOverhangFacade: number;
                roofThickness: number;
                roofCoverHeight: number;
                rotation: number;
                lod: Things.Enums.lodEnum;
                center: Inputs.Base.Point3;
                direction: Inputs.Base.Vector3;
            }
            declare class RoofCoverPart<T> extends RoofCoverOneSidedDto {
                id?: string;
                shapes?: {
                    compound?: T;
                };
            }
            declare class RoofPanelPart<T> {
                id?: string;
                name?: string;
                innerPanels?: SandwitchPart<T>[];
                innerFillPanels?: SandwitchPart<T>[];
                outerPanels?: SandwitchPart<T>[];
                outerFillPanels?: SandwitchPart<T>[];
                ends?: SandwitchPartFlex<T>[];
                shapes?: {
                    compoundInnerExteriorPanels?: T;
                    compoundInnerInteriorPanels?: T;
                    compoundInnerFillExteriorPanels?: T;
                    compoundInnerFillInteriorPanels?: T;
                    compoundOuterExteriorPanels?: T;
                    compoundOuterInteriorPanels?: T;
                    compoundOuterFillExteriorPanels?: T;
                    compoundOuterFillInteriorPanels?: T;
                    compoundEndsInteriorPanels?: T;
                    compoundEndsExteriorPanels?: T;
                    compound?: T;
                };
            }
            declare class RoofPart<T> {
                id?: string;
                name?: string;
                beams: RoofBeamsPart<T>;
                panels?: RoofPanelPart<T>;
                covers?: RoofCoverPart<T>[];
                shapes?: {
                    compound?: T;
                };
            }
            declare class SandwitchPanelDto {
                name: string;
                createWindow: boolean;
                createInnerPanel: boolean;
                createExteriorPanel: boolean;
                wallWidth: number;
                exteriorPanelWidth: number;
                exteriorPanelHeight: number;
                exteriorPanelThickness: number;
                exteriorPanelBottomOffset: number;
                interiorPanelWidth: number;
                interiorPanelHeight: number;
                interiorPanelThickness: number;
                interiorPanelBottomOffset: number;
                windowWidthOffset: number;
                windowHeightOffset: number;
                windowFrameThickness: number;
                windowGlassFrameThickness: number;
            }
            declare class SandwitchPanelFlexDto {
                name: string;
                createInteriorPanel: boolean;
                createExteriorPanel: boolean;
                wallWidth: number;
                exteriorPanelThickness: number;
                interiorPanelThickness: number;
                interiorPanelPolygonPoints: Inputs.Base.Point2[];
                exteriorPanelPolygonPoints: Inputs.Base.Point2[];
            }
            declare class SandwitchPart<T> extends SandwitchPanelDto {
                id?: string;
                rotation?: number;
                center?: Inputs.Base.Point3;
                direction?: Inputs.Base.Vector3;
                windows?: WindowRectangularPart<T>[];
                shapes?: {
                    panelExterior?: T;
                    panelInterior?: T;
                    compound?: T;
                };
            }
            declare class SandwitchPartFlex<T> extends SandwitchPanelFlexDto {
                id?: string;
                rotation?: number;
                center?: Inputs.Base.Point3;
                direction?: Inputs.Base.Vector3;
                windows?: WindowRectangularPart<T>[];
                shapes?: {
                    panelExterior?: T;
                    panelInterior?: T;
                    compound?: T;
                };
            }
            declare class WindowCornerDto {
                wallThickness: number;
                facadePanelThickness: number;
                glassFrameThickness: number;
                glassThickness: number;
                frameThckness: number;
                height: number;
                lengthFirst: number;
                lengthSecond: number;
                rotation: number;
                origin: Inputs.Base.Point3;
            }
            declare class WindowPartShapes<T> {
                cutout?: T;
                glass?: T;
                glassFrame?: T;
                frame?: T;
                compound?: T;
            }
            declare class WindowRectangularPart<T> extends WindowRectangularDto {
                name: string;
                id?: string;
                shapes?: WindowPartShapes<T>;
            }
            declare class WindowCornerPart<T> extends WindowCornerDto {
                name: string;
                id?: string;
                shapes?: WindowPartShapes<T>;
            }
            declare class WindowRectangularDto {
                thickness: number;
                glassFrameThickness: number;
                glassThickness: number;
                frameThickness: number;
                height: number;
                width: number;
                rotation: number;
                center: Inputs.Base.Point3;
                direction: Inputs.Base.Vector3;
            }
        }
        declare namespace KidsCorner {
            declare namespace BirdHouses {
                declare namespace WingtipVilla {
                    declare class WingtipVillaData<T> {
                        type: string;
                        name: string;
                        compound?: T;
                        roof: {
                            compound: T;
                            shapes: T[];
                        };
                        walls: {
                            compound: T;
                            shapes: T[];
                        };
                        stick: {
                            shape: T;
                        };
                        floor: {
                            shape: T;
                        };
                        chimney: {
                            shape: T;
                        };
                        basicPoints: {
                            kind: string;
                            point: Inputs.Base.Point3;
                        }[];
                    }
                    declare class WingtipVillaDto {
                        constructor(interiorWidth?: number, interiorLength?: number, interiorHeight?: number, thickness?: number, holeDiameter?: number, holeDistToBottom?: number, stickLength?: number, stickDiameter?: number, baseAttachmentHeight?: number, roofOverhang?: number, rotation?: number, chimneyHeight?: number, origin?: Inputs.Base.Point3);
                        interiorWidth: number;
                        interiorLength: number;
                        interiorHeight: number;
                        thickness: number;
                        holeDiameter: number;
                        holeDistToBottom: number;
                        stickLength: number;
                        stickDiameter: number;
                        baseAttachmentHeight: number;
                        roofOverhang: number;
                        rotation: number;
                        chimneyHeight: number;
                        origin: Inputs.Base.Point3;
                    }
                }
                declare namespace ChirpyChalet {
                    declare class ChirpyChaletData<T> {
                        type: string;
                        name: string;
                        compound?: T;
                        roof: {
                            compound: T;
                            shapes: T[];
                        };
                        walls: {
                            compound: T;
                            shapes: T[];
                        };
                        stick: {
                            shape: T;
                        };
                        floor: {
                            shape: T;
                        };
                        basicPoints: {
                            kind: string;
                            point: Inputs.Base.Point3;
                        }[];
                    }
                    declare class ChirpyChaletDto {
                        constructor(interiorWidth?: number, interiorLength?: number, interiorHeight?: number, thickness?: number, holeDiameter?: number, holeDistToBottom?: number, stickLength?: number, stickDiameter?: number, baseAttachmentHeight?: number, roofOverhang?: number, roofAngle?: number, rotation?: number, origin?: Inputs.Base.Point3);
                        interiorWidth: number;
                        interiorLength: number;
                        interiorHeight: number;
                        thickness: number;
                        holeDiameter: number;
                        holeDistToBottom: number;
                        stickLength: number;
                        stickDiameter: number;
                        baseAttachmentHeight: number;
                        roofOverhang: number;
                        roofAngle: number;
                        rotation: number;
                        origin: Inputs.Base.Point3;
                    }
                }
            }
        }
        declare namespace ThreeDPrinting {
            declare namespace Vases {
                declare namespace SerenitySwirl {
                    declare class SerenitySwirlData<T> {
                        type: string;
                        name: string;
                        compound?: T;
                    }
                    declare class SerenitySwirlDto {
                        constructor(swirl?: number, nrOfDivisions?: number, addRadiusNarrow?: number, addRadiusWide?: number, addMiddleHeight?: number, addTopHeight?: number, thickness?: number, rotation?: number, origin?: Inputs.Base.Point3);
                        swirl: number;
                        nrOfDivisions: number;
                        addRadiusNarrow: number;
                        addRadiusWide: number;
                        addMiddleHeight: number;
                        addTopHeight: number;
                        thickness: number;
                        rotation: number;
                        origin: Inputs.Base.Point3;
                    }
                }
                declare namespace ArabicArchway {
                    declare class ArabicArchwayData<T> {
                        type: string;
                        name: string;
                        compound?: T;
                        originalInputs: ArabicArchwayDto;
                        shapes?: Models.OCCT.ShapeWithId<Inputs.OCCT.TopoDSShapePointer>[];
                        drawingPart?: ArabicArchwayDrawingPart<T>;
                    }
                    declare class ArabicArchwayDrawingPartShapes<T> {
                        compound?: T;
                        vasePartsCompound?: T;
                        glassPartsCompound?: T;
                        vaseBaseCompound?: T;
                    }
                    declare class ArabicArchwayDrawingPart<T> {
                        shapes?: ArabicArchwayDrawingPartShapes<T> | {
                            [x: string]: T;
                        };
                    }
                    declare class ArabicArchwayDtoBase<T, V, P, U, B> {
                        profilePoints?: P;
                        nrOfSides: T;
                        nrOfVerticalArches: T;
                        thickness: T;
                        edgesThickness: T;
                        archCenterThickness: T;
                        baseHeight: T;
                        patchHoles: B;
                        lod?: U;
                        rotation?: T;
                        direction?: V;
                        scale?: V;
                        origin?: V;
                    }
                    declare class ArabicArchwayDto implements ArabicArchwayDtoBase<number, Inputs.Base.Point3, Inputs.Base.Point3[], Things.Enums.lodEnum, boolean> {
                        constructor(nrOfSides?: number, nrOfVerticalArches?: number, archCenterThickness?: number, edgesThickness?: number, thickness?: number, baseHeight?: number, patchHoles?: boolean, lod?: Things.Enums.lodEnum, rotation?: number, origin?: Inputs.Base.Point3, direction?: Inputs.Base.Point3, scale?: Inputs.Base.Vector3);
                        profilePoints: Inputs.Base.Point3[];
                        nrOfSides: number;
                        nrOfVerticalArches: number;
                        archCenterThickness: number;
                        edgesThickness: number;
                        thickness: number;
                        baseHeight: number;
                        patchHoles: boolean;
                        lod: Things.Enums.lodEnum;
                        rotation: number;
                        origin: Inputs.Base.Point3;
                        direction: Inputs.Base.Point3;
                        scale: Inputs.Base.Vector3;
                    }
                }
            }
            declare namespace Cups {
                declare namespace CalmCup {
                    declare class CalmCupData<T> {
                        type: string;
                        name: string;
                        originalInputs: CalmCupDto;
                        compound?: T;
                    }
                    declare class CalmCupDtoBase<T, U> {
                        height: T;
                        radiusBottom: T;
                        radiusTopOffset: T;
                        thickness: T;
                        fillet: T;
                        nrOfHandles: T;
                        handleDist: T;
                        precision: T;
                        rotation?: T;
                        scale?: T;
                        origin?: U;
                        direction?: U;
                    }
                    declare class CalmCupDto implements CalmCupDtoBase<number, Inputs.Base.Point3> {
                        constructor(height?: number, radiusBottom?: number, radiusTopOffset?: number, thickness?: number, fillet?: number, nrOfHandles?: number, handleDist?: number, precision?: number, rotation?: number, scale?: number, origin?: Inputs.Base.Point3, direction?: Inputs.Base.Vector3);
                        height: number;
                        radiusBottom: number;
                        radiusTopOffset: number;
                        thickness: number;
                        fillet: number;
                        nrOfHandles: number;
                        handleDist: number;
                        precision: number;
                        rotation: number;
                        scale: number;
                        origin: Inputs.Base.Point3;
                        direction: Inputs.Base.Vector3;
                    }
                }
                declare namespace DragonCup {
                    declare class DragonCupData<T> {
                        type: string;
                        name: string;
                        originalInputs: DragonCupDto;
                        compound?: T;
                    }
                    declare class DragonCupDtoBase<T, U> {
                        height: T;
                        radiusBottom: T;
                        radiusTopOffset: T;
                        radiusMidOffset: T;
                        rotationMidAngle: T;
                        rotationTopAngle: T;
                        thickness: T;
                        bottomThickness: T;
                        nrSkinCellsHorizontal: T;
                        nrSkinCellsVertical: T;
                        nrSkinCellDivisionsTop: T;
                        nrSkinCellDivisionsBottom: T;
                        skinCellOuterHeight: T;
                        skinCellInnerHeight: T;
                        skinCellBottomHeight: T;
                        skinCellTopHeight: T;
                        precision: T;
                        rotation?: T;
                        scale?: T;
                        origin?: U;
                        direction?: U;
                    }
                    declare class DragonCupDto implements DragonCupDtoBase<number, Inputs.Base.Point3> {
                        constructor(height?: number, radiusBottom?: number, radiusTopOffset?: number, radiusMidOffset?: number, rotationTopAngle?: number, rotationMidAngle?: number, nrSkinCellsVertical?: number, nrSkinCellsHorizontal?: number, nrSkinCellDivisionsTop?: number, nrSkinCellDivisionsBottom?: number, skinCellOuterHeight?: number, skinCellInnerHeight?: number, skinCellBottomHeight?: number, skinCellTopHeight?: number, thickness?: number, bottomThickness?: number, precision?: number, rotation?: number, scale?: number, origin?: Inputs.Base.Point3, direction?: Inputs.Base.Vector3);
                        height: number;
                        radiusBottom: number;
                        radiusTopOffset: number;
                        radiusMidOffset: number;
                        rotationTopAngle: number;
                        rotationMidAngle: number;
                        nrSkinCellsVertical: number;
                        nrSkinCellsHorizontal: number;
                        nrSkinCellDivisionsTop: number;
                        nrSkinCellDivisionsBottom: number;
                        skinCellOuterHeight: number;
                        skinCellInnerHeight: number;
                        skinCellBottomHeight: number;
                        skinCellTopHeight: number;
                        thickness: number;
                        bottomThickness: number;
                        precision: number;
                        rotation: number;
                        scale: number;
                        origin: Inputs.Base.Point3;
                        direction: Inputs.Base.Vector3;
                    }
                    declare class DragonCupModelDto<T> {
                        model: DragonCupData<T>;
                    }
                }
            }
            declare namespace Boxes {
                declare namespace SpicyBox {
                    declare class SpicyBoxData<T> {
                        type: string;
                        name: string;
                        originalInputs: SpicyBoxDto;
                        compound?: T;
                    }
                    declare class SpicyBoxDtoBase<T, U, V, Z> {
                        textTop: V;
                        textFront: V;
                        height: T;
                        coverHeight: T;
                        baseHeight: T;
                        radiusBase: T;
                        radiusOffset: T;
                        thickness: T;
                        ornamentalThickness: T;
                        nrOrnamnetsPerSide: T;
                        invertOrnaments: Z;
                        fillet: T;
                        nrSides: T;
                        nrOffsets: T;
                        precision: T;
                        rotation?: T;
                        scale?: T;
                        origin?: U;
                        direction?: U;
                    }
                    declare class SpicyBoxDto implements SpicyBoxDtoBase<number, Inputs.Base.Point3, string, boolean> {
                        constructor(textTop?: string, textFront?: string, nrSides?: number, nrOffsets?: number, height?: number, coverHeight?: number, baseHeight?: number, radiusBottom?: number, radiusTopOffset?: number, thickness?: number, ornamentalThickness?: number, nrOrnamnetsPerSide?: number, invertOrnaments?: boolean, fillet?: number, precision?: number, rotation?: number, scale?: number, origin?: Inputs.Base.Point3, direction?: Inputs.Base.Vector3);
                        textTop: string;
                        textFront: string;
                        nrSides: number;
                        nrOffsets: number;
                        height: number;
                        radiusBase: number;
                        radiusOffset: number;
                        coverHeight: number;
                        baseHeight: number;
                        thickness: number;
                        ornamentalThickness: number;
                        nrOrnamnetsPerSide: number;
                        invertOrnaments: boolean;
                        fillet: number;
                        precision: number;
                        rotation: number;
                        scale: number;
                        origin: Inputs.Base.Point3;
                        direction: Inputs.Base.Vector3;
                    }
                    declare class SpicyBoxModelDto<T> {
                        model: SpicyBoxData<T>;
                    }
                }
            }
            declare namespace Medals {
                declare namespace EternalLove {
                    declare class EternalLoveData<T> {
                        type: string;
                        name: string;
                        originalInputs: EternalLoveDto;
                        compound?: T;
                    }
                    declare class EternalLoveDtoBase<T, U, B, V> {
                        textHeading: T;
                        textName: T;
                        fullModel: B;
                        thickness: U;
                        decorationThickness: U;
                        rotation?: U;
                        origin?: V;
                        direction?: V;
                    }
                    declare class EternalLoveDto implements EternalLoveDtoBase<string, number, boolean, Inputs.Base.Point3> {
                        constructor(textHeading?: string, textName?: string, fullModel?: boolean, thickness?: number, decorationThickness?: number, rotation?: number, origin?: Inputs.Base.Point3, direction?: Inputs.Base.Vector3);
                        textHeading: string;
                        textName: string;
                        fullModel: boolean;
                        thickness: number;
                        decorationThickness: number;
                        rotation: number;
                        origin: Inputs.Base.Point3;
                        direction: Inputs.Base.Vector3;
                    }
                }
            }
            declare namespace Desktop {
                declare namespace PhoneNest {
                    declare class PhoneNestData<T> {
                        type: string;
                        name: string;
                        originalInputs: PhoneNestDto;
                        compound?: T;
                        drawingPart?: PhoneNestDrawingPart<T>;
                        mainPart?: PhoneNestMainPart<T>;
                        shapes?: Models.OCCT.ShapeWithId<Inputs.OCCT.TopoDSShapePointer>[];
                    }
                    declare class PhoneNestDrawDto<T> {
                        mainMaterial?: T;
                        phoneMaterial?: T;
                        drawFaces: boolean;
                        precision: number;
                        drawEdges: boolean;
                        edgeColour: Inputs.Base.Color;
                        edgeWidth: number;
                    }
                    declare class PhoneNestDrawingPartShapes<T> {
                        main?: T;
                        phone?: T;
                    }
                    declare class PhoneNestDrawingPart<T> extends Part {
                        shapes?: PhoneNestDrawingPartShapes<T>;
                    }
                    declare class PhoneNestDtoBase<T, U, B> {
                        heightBottom: T;
                        heightTop: T;
                        widthBack: T;
                        widthFront: T;
                        length: T;
                        backOffset: T;
                        thickness: T;
                        filletRadius: T;
                        applyOrnaments: B;
                        phoneHeight: T;
                        phoneWidth: T;
                        phoneThickness: T;
                        precision: T;
                        rotation?: T;
                        scale?: T;
                        origin?: U;
                        direction?: U;
                    }
                    declare class PhoneNestDto implements PhoneNestDtoBase<number, Inputs.Base.Point3, boolean> {
                        constructor(heightBottom?: number, heightTop?: number, widthBack?: number, widthFront?: number, length?: number, backOffset?: number, thickness?: number, applyOrnaments?: boolean, filletRadius?: number, phoneHeight?: number, phoneWidth?: number, phoneThickness?: number, precision?: number, drawEdges?: boolean, rotation?: number, scale?: number, origin?: Inputs.Base.Point3, direction?: Inputs.Base.Vector3);
                        heightBottom: number;
                        heightTop: number;
                        widthBack: number;
                        widthFront: number;
                        length: number;
                        backOffset: number;
                        thickness: number;
                        applyOrnaments: boolean;
                        filletRadius: number;
                        phoneHeight: number;
                        phoneWidth: number;
                        phoneThickness: number;
                        precision: number;
                        drawEdges: boolean;
                        rotation: number;
                        scale: number;
                        origin: Inputs.Base.Point3;
                        direction: Inputs.Base.Vector3;
                    }
                    declare class PhoneNestModelDto<T> {
                        model: PhoneNestData<T>;
                    }
                    declare class PhoneNestMainPart<T> extends Part {
                        shapes?: {
                            phone?: T;
                            main?: T;
                            compound?: T;
                        };
                    }
                }
            }
        }
        declare namespace LaserCutting {
            declare namespace Gadgets {
                declare namespace DropletsPhoneHolder {
                    declare class DropletsPhoneHolderData<T> {
                        type: string;
                        name: string;
                        compound?: T;
                        originalInputs: DropletsPhoneHolderDto;
                        shapes?: Models.OCCT.ShapeWithId<Inputs.OCCT.TopoDSShapePointer>[];
                        drawingPart?: DropletsPhoneHolderDrawingPart<T>;
                    }
                    declare class DropletsPhoneHolderDrawingPartShapes<T> {
                        compound?: T;
                        phoneHolderCompound?: T;
                        cutWiresCompound?: T;
                        engravingWiresCompound?: T;
                    }
                    declare class DropletsPhoneHolderDrawingPart<T> {
                        shapes?: DropletsPhoneHolderDrawingPartShapes<T> | {
                            [x: string]: T;
                        };
                    }
                    declare class DropletsPhoneHolderDtoBase<S, B, T, V> {
                        title?: S;
                        subtitle: S;
                        includeLogo: B;
                        thickness: T;
                        kerf: T;
                        phoneWidth: T;
                        phoneHeight: T;
                        phoneThickness: T;
                        backLength: T;
                        angle: T;
                        offsetAroundPhone: T;
                        penShelf: T;
                        phoneLockHeight: T;
                        filletRadius: T;
                        includePattern: B;
                        densityPattern: T;
                        holesForWire: B;
                        wireInputThickness: T;
                        includeModel: B;
                        includeDrawings: B;
                        spacingDrawings: T;
                        rotation?: T;
                        direction?: V;
                        scale?: V;
                        origin?: V;
                    }
                    declare class DropletsPhoneHolderDto implements DropletsPhoneHolderDtoBase<string, boolean, number, Inputs.Base.Vector3> {
                        constructor(title?: string, subtitle?: string, includeLogo?: boolean, thickness?: number, kerf?: number, phoneWidth?: number, phoneHeight?: number, phoneThickness?: number, backLength?: number, angle?: number, offsetAroundPhone?: number, penShelf?: number, phoneLockHeight?: number, filletRadius?: number, includePattern?: boolean, densityPattern?: number, holesForWire?: boolean, wireInputThickness?: number, includeModel?: boolean, includeDrawings?: boolean, spacingDrawings?: number, rotation?: number, origin?: Inputs.Base.Point3, direction?: Inputs.Base.Point3, scale?: Inputs.Base.Vector3);
                        title: string;
                        subtitle: string;
                        includeLogo: boolean;
                        thickness: number;
                        kerf: number;
                        phoneWidth: number;
                        phoneHeight: number;
                        phoneThickness: number;
                        backLength: number;
                        angle: number;
                        offsetAroundPhone: number;
                        penShelf: number;
                        phoneLockHeight: number;
                        filletRadius: number;
                        includePattern: boolean;
                        densityPattern: number;
                        holesForWire: boolean;
                        wireInputThickness: number;
                        includeModel: boolean;
                        includeDrawings: boolean;
                        spacingDrawings: number;
                        rotation: number;
                        origin: Inputs.Base.Point3;
                        direction: Inputs.Base.Point3;
                        scale: Inputs.Base.Vector3;
                    }
                    declare class DropletsPhoneHolderModelDto<T> {
                        model: DropletsPhoneHolderData<T>;
                    }
                    declare class DropletsPhoneHolderModelDxfDto<T> {
                        model: DropletsPhoneHolderData<T>;
                        cutWiresColor: Inputs.Base.Color;
                        engravingWiresColor: Inputs.Base.Color;
                        fileName: string;
                        angularDeflection: number;
                        curvatureDeflection: number;
                        minimumOfPoints: number;
                        uTolerance: number;
                        minimumLength: number;
                    }
                    declare class DropletsPhoneHolderModelStepDto<T> {
                        model: DropletsPhoneHolderData<T>;
                        fileName: string;
                        adjustYZ: boolean;
                    }
                }
            }
        }
        declare namespace Furniture {
            declare namespace Chairs {
                declare namespace SnakeChair {
                    declare class SnakeChairData<T> {
                        type: string;
                        name: string;
                        originalInputs: SnakeChairDto;
                        compound?: T;
                        drawingPart?: SnakeChairDrawingPart<T>;
                        mainPart?: SnakeChairMainPart<T>;
                        shapes?: Models.OCCT.ShapeWithId<Inputs.OCCT.TopoDSShapePointer>[];
                    }
                    declare class SnakeChairDrawDto<T> {
                        mainMaterial?: T;
                        drawFaces: boolean;
                        precision: number;
                        drawEdges: boolean;
                        edgeColour: Inputs.Base.Color;
                        edgeWidth: number;
                    }
                    declare class SnakeChairDrawingPartShapes<T> {
                        main?: T;
                    }
                    declare class SnakeChairDrawingPart<T> extends Part {
                        shapes?: SnakeChairDrawingPartShapes<T>;
                    }
                    declare class SnakeChairDtoBase<T, U> {
                        sittingHeight: T;
                        backRestOffset: T;
                        backRestHeight: T;
                        width: T;
                        length: T;
                        thickness: T;
                        ornamentDepth: T;
                        nrOrnamentPlanks: T;
                        filletRadius: T;
                        precision: T;
                        rotation?: T;
                        scale?: T;
                        origin?: U;
                        direction?: U;
                    }
                    declare class SnakeChairDto implements SnakeChairDtoBase<number, Inputs.Base.Point3> {
                        constructor(sittingHeight?: number, backRestOffset?: number, backRestHeight?: number, width?: number, length?: number, thickness?: number, nrOrnamentPlanks?: number, ornamentDepth?: number, filletRadius?: number, precision?: number, drawEdges?: boolean, rotation?: number, scale?: number, origin?: Inputs.Base.Point3, direction?: Inputs.Base.Vector3);
                        sittingHeight: number;
                        backRestOffset: number;
                        backRestHeight: number;
                        width: number;
                        length: number;
                        thickness: number;
                        nrOrnamentPlanks: number;
                        ornamentDepth: number;
                        filletRadius: number;
                        precision: number;
                        drawEdges: boolean;
                        rotation: number;
                        scale: number;
                        origin: Inputs.Base.Point3;
                        direction: Inputs.Base.Vector3;
                    }
                    declare class SnakeChairModelDto<T> {
                        model: SnakeChairData<T>;
                    }
                    declare class SnakeChairMainPart<T> extends Part {
                        sittingCenter?: Inputs.Base.Point3;
                        shapes?: {
                            sittingWire?: T;
                            compound?: T;
                        };
                    }
                }
            }
            declare namespace Tables {
                declare namespace ElegantTable {
                    declare class ElegantTableData<T> {
                        type: string;
                        name: string;
                        originalInputs: ElegantTableDto;
                        compound?: T;
                        drawingPart?: ElegantTableDrawingPart<T>;
                        topPart?: ElegantTableTopPart<T>;
                        legParts?: ElegantTableLegPart<T>[];
                        shapes?: Models.OCCT.ShapeWithId<Inputs.OCCT.TopoDSShapePointer>[];
                    }
                    declare class ElegantTableDrawDto<T> {
                        topMaterial?: T;
                        topBaseMaterial?: T;
                        legsMaterial?: T;
                        drawFaces: boolean;
                        precision: number;
                        drawEdges: boolean;
                        edgeColour: Inputs.Base.Color;
                        edgeWidth: number;
                    }
                    declare class ElegantTableDrawingPartShapes<T> {
                        top?: T;
                        topBase?: T;
                        legs?: T;
                    }
                    declare class ElegantTableDrawingPart<T> extends Part {
                        shapes?: ElegantTableDrawingPartShapes<T>;
                    }
                    declare class ElegantTableDtoBase<T, U> {
                        height: T;
                        width: T;
                        length: T;
                        topThickness: T;
                        topOffset: T;
                        bottomThickness: T;
                        minFillet: T;
                        radiusLegTop: T;
                        radiusLegBottom: T;
                        nrLegPairs: T;
                        precision: T;
                        rotation?: T;
                        scale?: T;
                        origin?: U;
                        direction?: U;
                    }
                    declare class ElegantTableDto implements ElegantTableDtoBase<number, Inputs.Base.Point3> {
                        constructor(height?: number, width?: number, length?: number, topThickness?: number, topOffset?: number, bottomThickness?: number, minFillet?: number, radiusLegTop?: number, radiusLegBottom?: number, nrLegPairs?: number, precision?: number, drawEdges?: boolean, rotation?: number, scale?: number, origin?: Inputs.Base.Point3, direction?: Inputs.Base.Vector3);
                        height: number;
                        width: number;
                        length: number;
                        topThickness: number;
                        topOffset: number;
                        bottomThickness: number;
                        minFillet: number;
                        radiusLegTop: number;
                        radiusLegBottom: number;
                        nrLegPairs: number;
                        precision: number;
                        drawEdges: boolean;
                        rotation: number;
                        scale: number;
                        origin: Inputs.Base.Point3;
                        direction: Inputs.Base.Vector3;
                    }
                    declare class ElegantTableLegByIndexDto<T> {
                        model: ElegantTableData<T>;
                        index: number;
                    }
                    declare class ElegantTableLegPart<T> extends Part {
                        topCenter?: Inputs.Base.Point3;
                        bottomCenter?: Inputs.Base.Point3;
                        topRadius?: number;
                        bottomRadius?: number;
                        shapes?: {
                            topCircleWire?: T;
                            bottomCircleWire?: T;
                            leg?: T;
                        };
                    }
                    declare class ElegantTableModelDto<T> {
                        model: ElegantTableData<T>;
                    }
                    declare class ElegantTableTopPart<T> extends Part {
                        topCenter?: Inputs.Base.Point3;
                        bottomCenter?: Inputs.Base.Point3;
                        shapes?: {
                            topPanel?: T;
                            topWire?: T;
                            bottomWire?: T;
                            bottomPanel?: T;
                            compound?: T;
                        };
                    }
                }
                declare namespace GoodCoffeeTable {
                    declare class GoodCoffeeTableData<T> {
                        type: string;
                        name: string;
                        originalInputs: GoodCoffeeTableDto;
                        compound?: T;
                        drawingPart?: GoodCoffeeTableDrawingPart<T>;
                        topPart?: GoodCoffeeTableTopPart<T>;
                        shelfPart?: GoodCoffeeTableShelfPart<T>;
                        legParts?: GoodCoffeeTableLegPart<T>[];
                        shapes?: Models.OCCT.ShapeWithId<Inputs.OCCT.TopoDSShapePointer>[];
                    }
                    declare class GoodCoffeeTableDrawDto<T> {
                        topGlassMaterial?: T;
                        topMaterial?: T;
                        shelfMaterial?: T;
                        legsMaterial?: T;
                        drawFaces: boolean;
                        precision: number;
                        drawEdges: boolean;
                        edgeColour: Inputs.Base.Color;
                        edgeWidth: number;
                    }
                    declare class GoodCoffeeTableDrawingPartShapes<T> {
                        top?: T;
                        topGlass?: T;
                        shelf?: T;
                        legs?: T;
                    }
                    declare class GoodCoffeeTableDrawingPart<T> extends Part {
                        shapes?: GoodCoffeeTableDrawingPartShapes<T>;
                    }
                    declare class GoodCoffeeTableDtoBase<T, U> {
                        height: T;
                        width: T;
                        length: T;
                        topThickness: T;
                        topGlassOffset: T;
                        glassThickness: T;
                        glassHolderLength: T;
                        chamfer: T;
                        shelfTopOffset: T;
                        shelfThickness: T;
                        legWidth: T;
                        legDepth: T;
                        precision: T;
                        rotation?: T;
                        scale?: T;
                        origin?: U;
                        direction?: U;
                    }
                    declare class GoodCoffeeTableDto implements GoodCoffeeTableDtoBase<number, Inputs.Base.Point3> {
                        constructor(height?: number, width?: number, length?: number, chamfer?: number, topThickness?: number, topGlassOffset?: number, glassThickness?: number, glassHolderLength?: number, shelfTopOffset?: number, shelfThickness?: number, legWidth?: number, legDepth?: number, precision?: number, drawEdges?: boolean, rotation?: number, scale?: number, origin?: Inputs.Base.Point3, direction?: Inputs.Base.Vector3);
                        height: number;
                        width: number;
                        length: number;
                        chamfer: number;
                        topThickness: number;
                        topGlassOffset: number;
                        glassThickness: number;
                        glassHolderLength: number;
                        shelfTopOffset: number;
                        shelfThickness: number;
                        legWidth: number;
                        legDepth: number;
                        precision: number;
                        drawEdges: boolean;
                        rotation: number;
                        scale: number;
                        origin: Inputs.Base.Point3;
                        direction: Inputs.Base.Vector3;
                    }
                    declare class GoodCoffeeTableLegByIndexDto<T> {
                        model: GoodCoffeeTableData<T>;
                        index: number;
                    }
                    declare class GoodCoffeeTableLegPart<T> extends Part {
                        topCenter?: Inputs.Base.Point3;
                        bottomCenter?: Inputs.Base.Point3;
                        width: number;
                        depth: number;
                        height: number;
                        shapes?: {
                            topWire?: T;
                            bottomWire?: T;
                            leg?: T;
                        };
                    }
                    declare class GoodCoffeeTableModelDto<T> {
                        model: GoodCoffeeTableData<T>;
                    }
                    declare class GoodCoffeeTableShelfPart<T> extends Part {
                        topCenter?: Inputs.Base.Point3;
                        bottomCenter?: Inputs.Base.Point3;
                        shapes?: {
                            topWire?: T;
                            bottomWire?: T;
                            compound?: T;
                        };
                    }
                    declare class GoodCoffeeTableTopPart<T> extends Part {
                        topCenter?: Inputs.Base.Point3;
                        shapes?: {
                            topFrame?: T;
                            topWire?: T;
                            glassWire?: T;
                            glassPanel?: T;
                            compound?: T;
                        };
                    }
                }
                declare namespace SnakeTable {
                    declare class SnakeTableData<T> {
                        type: string;
                        name: string;
                        originalInputs: SnakeTableDto;
                        compound?: T;
                        drawingPart?: SnakeTableDrawingPart<T>;
                        mainPart?: SnakeTableMainPart<T>;
                        shapes?: Models.OCCT.ShapeWithId<Inputs.OCCT.TopoDSShapePointer>[];
                    }
                    declare class SnakeTableDrawDto<T> {
                        mainMaterial?: T;
                        glassMaterial?: T;
                        drawFaces: boolean;
                        precision: number;
                        drawEdges: boolean;
                        edgeColour: Inputs.Base.Color;
                        edgeWidth: number;
                    }
                    declare class SnakeTableDrawingPartShapes<T> {
                        main?: T;
                        glass?: T;
                    }
                    declare class SnakeTableDrawingPart<T> extends Part {
                        shapes?: SnakeTableDrawingPartShapes<T>;
                    }
                    declare class SnakeTableDtoBase<T, U> {
                        height: T;
                        width: T;
                        length: T;
                        supportLength: T;
                        shelfHeight: T;
                        glassThickness: T;
                        glassOffset: T;
                        thickness: T;
                        ornamentDepth: T;
                        nrOrnamentPlanks: T;
                        filletRadius: T;
                        precision: T;
                        rotation?: T;
                        scale?: T;
                        origin?: U;
                        direction?: U;
                    }
                    declare class SnakeTableDto implements SnakeTableDtoBase<number, Inputs.Base.Point3> {
                        constructor(height?: number, width?: number, length?: number, supportLength?: number, shelfHeight?: number, thickness?: number, glassThickness?: number, glassOffset?: number, nrOrnamentPlanks?: number, ornamentDepth?: number, filletRadius?: number, precision?: number, drawEdges?: boolean, rotation?: number, scale?: number, origin?: Inputs.Base.Point3, direction?: Inputs.Base.Vector3);
                        height: number;
                        width: number;
                        length: number;
                        supportLength: number;
                        shelfHeight: number;
                        thickness: number;
                        glassThickness: number;
                        glassOffset: number;
                        nrOrnamentPlanks: number;
                        ornamentDepth: number;
                        filletRadius: number;
                        precision: number;
                        drawEdges: boolean;
                        rotation: number;
                        scale: number;
                        origin: Inputs.Base.Point3;
                        direction: Inputs.Base.Vector3;
                    }
                    declare class SnakeTableModelDto<T> {
                        model: SnakeTableData<T>;
                    }
                    declare class SnakeTableMainPart<T> extends Part {
                        topCenter?: Inputs.Base.Point3;
                        shapes?: {
                            topWire?: T;
                            glass?: T;
                            main?: T;
                            compound?: T;
                        };
                    }
                }
            }
        }
        declare namespace Shared {
            declare class Part {
                id?: string;
                rotation?: number;
                center?: Inputs.Base.Point3;
                scale?: Inputs.Base.Vector3;
                direction?: Inputs.Base.Vector3;
            }
        }
    }
    declare namespace Advanced {
        declare namespace Enums {
            declare enum outputShapeEnum {
                wire = "wire",
                face = "face",
                solid = "solid"
            }
        }
        declare namespace Text3D {
            declare class CharacterPart<T> {
                id: string;
                shapes?: {
                    compound?: T;
                };
            }
            declare class FacePart<T> {
                id: string;
                type: faceTypeEnum;
                shapes?: {
                    face?: T;
                };
            }
            declare enum faceTextVarEnum {
                separatedExtrusion = "separatedExtrusion",
                integratedExtrusion = "integratedExtrusion",
                cutout = "cutout"
            }
            declare enum faceTypeEnum {
                compound = "compound",
                cutout = "originalCutout",
                cutoutInsideCharacter = "cutoutInsideCharacter"
            }
            declare class FontDefinition {
                name: string;
                type?: fontsEnum;
                variant?: fontVariantsEnum;
                font: Font;
            }
            declare const fontsModel: {
                key: string;
                variants: string[];
            }[];
            declare enum fontVariantsEnum {
                Regular = "Regular",
                Black = "Black",
                Bold = "Bold",
                ExtraBold = "ExtraBold",
                Medium = "Medium",
                SemiBold = "SemiBold",
                BlackItalic = "BlackItalic",
                BoldItalic = "BoldItalic",
                Italic = "Italic",
                Light = "Light",
                LightItalic = "LightItalic",
                MediumItalic = "MediumItalic",
                Thin = "Thin",
                ThinItalic = "ThinItalic",
                ExtraLight = "ExtraLight"
            }
            declare enum fontsEnum {
                Aboreto = "Aboreto",
                Bungee = "Bungee",
                IndieFlower = "IndieFlower",
                Lugrasimo = "Lugrasimo",
                Orbitron = "Orbitron",
                Roboto = "Roboto",
                RobotoSlab = "RobotoSlab",
                Silkscreen = "Silkscreen",
                Tektur = "Tektur",
                Workbench = "Workbench"
            }
            declare enum recAlignmentEnum {
                leftTop = "leftTop",
                leftMiddle = "leftMiddle",
                leftBottom = "leftBottom",
                centerTop = "centerTop",
                centerMiddle = "centerMiddle",
                centerBottom = "centerBottom",
                rightTop = "rightTop",
                rightMiddle = "rightMiddle",
                rightBottom = "rightBottom"
            }
            declare class Text3DData<T> {
                type: string;
                name: string;
                advanceWidth: number;
                boundingBox: {
                    x1: number;
                    y1: number;
                    x2: number;
                    y2: number;
                };
                originalInputs?: Text3DDto | Texts3DFaceDto<T>;
                compound?: T;
                characterParts?: CharacterPart<T>[];
                faceParts?: FacePart<T>[];
                shapes?: Models.OCCT.ShapeWithId<Inputs.OCCT.TopoDSShapePointer>[];
                characterCenterCoordinates: Inputs.Base.Point3[];
            }
            declare class Text3DDto {
                constructor(text?: string, fontType?: fontsEnum, fontVariant?: fontVariantsEnum, fontSize?: number, height?: number, rotation?: number, origin?: Inputs.Base.Vector3, direction?: Inputs.Base.Vector3, originAlignment?: recAlignmentEnum);
                text: string;
                fontType: fontsEnum;
                fontVariant: fontVariantsEnum;
                fontSize: number;
                height: number;
                rotation: number;
                origin: Inputs.Base.Vector3;
                direction: Inputs.Base.Vector3;
                originAlignment: recAlignmentEnum;
            }
            declare class Text3DFaceDefinitionDto {
                constructor(faceTextVar?: faceTextVarEnum, text?: string, fontType?: fontsEnum, fontVariant?: fontVariantsEnum, fontSize?: number, height?: number, rotation?: number, originParamU?: number, originParamV?: number, originAlignment?: recAlignmentEnum);
                faceTextVar: faceTextVarEnum;
                text: string;
                fontType: fontsEnum;
                fontVariant: fontVariantsEnum;
                fontSize: number;
                height: number;
                rotation: number;
                originParamU: number;
                originParamV: number;
                originAlignment: recAlignmentEnum;
            }
            declare class Text3DFaceDefinitionUrlDto {
                constructor(faceTextVar?: faceTextVarEnum, text?: string, fontUrl?: string, fontSize?: number, height?: number, rotation?: number, originParamU?: number, originParamV?: number, originAlignment?: recAlignmentEnum);
                faceTextVar: faceTextVarEnum;
                text: string;
                fontUrl: string;
                fontSize: number;
                height: number;
                rotation: number;
                originParamU: number;
                originParamV: number;
                originAlignment: recAlignmentEnum;
            }
            declare class Text3DFaceDefinitionUrlParsedDto {
                constructor(faceTextVar?: faceTextVarEnum, text?: string, letterPaths?: any, fontSize?: number, height?: number, rotation?: number, originParamU?: number, originParamV?: number, originAlignment?: recAlignmentEnum);
                faceTextVar: faceTextVarEnum;
                text: string;
                letterPaths: any;
                fontSize: number;
                height: number;
                rotation: number;
                originParamU: number;
                originParamV: number;
                originAlignment: recAlignmentEnum;
            }
            declare class Text3DFaceDto<T> {
                constructor(face?: T, facePlanar?: boolean, faceTextVar?: faceTextVarEnum, text?: string, fontType?: fontsEnum, fontVariant?: fontVariantsEnum, fontSize?: number, height?: number, rotation?: number, originParamU?: number, originParamV?: number, originAlignment?: recAlignmentEnum);
                face: T;
                facePlanar: boolean;
                faceTextVar: faceTextVarEnum;
                text: string;
                fontType: fontsEnum;
                fontVariant: fontVariantsEnum;
                fontSize: number;
                height: number;
                rotation: number;
                originParamU: number;
                originParamV: number;
                originAlignment: recAlignmentEnum;
            }
            declare class Text3DFaceUrlDto<T> {
                constructor(face?: T, facePlanar?: boolean, faceTextVar?: faceTextVarEnum, text?: string, fontUrl?: string, fontSize?: number, height?: number, rotation?: number, originParamU?: number, originParamV?: number, originAlignment?: recAlignmentEnum);
                face: T;
                facePlanar: boolean;
                faceTextVar: faceTextVarEnum;
                text: string;
                fontUrl: string;
                fontSize: number;
                height: number;
                rotation: number;
                originParamU: number;
                originParamV: number;
                originAlignment: recAlignmentEnum;
            }
            declare class Text3DFaceUrlParsedDto<T> {
                constructor(face?: T, facePlanar?: boolean, faceTextVar?: faceTextVarEnum, text?: string, letterPaths?: any, fontSize?: number, height?: number, rotation?: number, originParamU?: number, originParamV?: number, originAlignment?: recAlignmentEnum);
                face: T;
                facePlanar: boolean;
                faceTextVar: faceTextVarEnum;
                text: string;
                letterPaths: any;
                fontSize: number;
                height: number;
                rotation: number;
                originParamU: number;
                originParamV: number;
                originAlignment: recAlignmentEnum;
            }
            declare class Text3DLetterByIndexDto<T> {
                model: Text3DData<T>;
                index: number;
            }
            declare class Text3DModelDto<T> {
                model: Text3DData<T>;
            }
            declare class Text3DUrlDto {
                constructor(text?: string, fontUrl?: string, fontSize?: number, height?: number, rotation?: number, origin?: Inputs.Base.Vector3, direction?: Inputs.Base.Vector3, originAlignment?: recAlignmentEnum);
                text: string;
                fontUrl: string;
                fontSize: number;
                height: number;
                rotation: number;
                origin: Inputs.Base.Vector3;
                direction: Inputs.Base.Vector3;
                originAlignment: recAlignmentEnum;
            }
            declare class Text3DUrlParsedDto {
                constructor(text?: string, letterPaths?: any, fontSize?: number, height?: number, rotation?: number, origin?: Inputs.Base.Vector3, direction?: Inputs.Base.Vector3, originAlignment?: recAlignmentEnum);
                text: string;
                letterPaths: any;
                fontSize: number;
                height: number;
                rotation: number;
                origin: Inputs.Base.Vector3;
                direction: Inputs.Base.Vector3;
                originAlignment: recAlignmentEnum;
            }
            declare class Texts3DFaceDto<T> {
                constructor(face: T, facePlanar?: boolean, definitions?: Text3DFaceDefinitionDto[]);
                face: T;
                facePlanar: boolean;
                definitions: Text3DFaceDefinitionDto[];
            }
            declare class Texts3DFaceUrlDto<T> {
                constructor(face: T, facePlanar?: boolean, definitions?: Text3DFaceDefinitionUrlDto[]);
                face: T;
                facePlanar: boolean;
                definitions: Text3DFaceDefinitionUrlDto[];
            }
            declare class Texts3DFaceUrlParsedDto<T> {
                constructor(face: T, facePlanar?: boolean, definitions?: Text3DFaceDefinitionUrlParsedDto[]);
                face: T;
                facePlanar: boolean;
                definitions: Text3DFaceDefinitionUrlParsedDto[];
            }
        }
        declare namespace Patterns {
            declare namespace FacePatterns {
                declare namespace PyramidSimple {
                    declare class PyramidSimpleAffectorsDto<T> {
                        constructor(faces?: T[], affectorPoints?: Inputs.Base.Point3[], uNumber?: number, vNumber?: number, minHeight?: number, maxHeight?: number, precision?: number);
                        faces: T[];
                        affectorPoints: Inputs.Base.Point3[];
                        affectorRadiusList?: number[];
                        affectorFactors?: number[];
                        uNumber: number;
                        vNumber: number;
                        defaultHeight: number;
                        affectMinHeight: number;
                        affectMaxHeight: number;
                        precision: number;
                    }
                    declare class PyramidSimpeByIndexDto<T> {
                        model: PyramidSimpleData<T>;
                        index: number;
                    }
                    declare class PyramidSimpleCellPart<T> {
                        id: string;
                        uIndex: number;
                        vIndex: number;
                        cornerPoint1: Inputs.Base.Point3;
                        cornerPoint2: Inputs.Base.Point3;
                        cornerPoint3: Inputs.Base.Point3;
                        cornerPoint4: Inputs.Base.Point3;
                        cornerNormal1?: Inputs.Base.Vector3;
                        cornerNormal2?: Inputs.Base.Vector3;
                        cornerNormal3?: Inputs.Base.Vector3;
                        cornerNormal4?: Inputs.Base.Vector3;
                        centerPoint?: Inputs.Base.Point3;
                        centerNormal?: Inputs.Base.Point3;
                        topPoint?: Inputs.Base.Point3;
                        shapes?: {
                            wire1?: T;
                            wire2?: T;
                            wire3?: T;
                            wire4?: T;
                            face1?: T;
                            face2?: T;
                            face3?: T;
                            face4?: T;
                            compound?: T;
                        };
                    }
                    declare class PyramidSimpleData<T> {
                        type: string;
                        name: string;
                        originalInputs?: PyramidSimpleDto<T> | PyramidSimpleAffectorsDto<T>;
                        compound?: T;
                        shapes?: Models.OCCT.ShapeWithId<Inputs.OCCT.TopoDSShapePointer>[];
                        faceParts?: PyramidSimpleFacePart<T>[];
                        topCoordinates: Inputs.Base.Point3[];
                    }
                    declare class PyramidSimpleDto<T> {
                        constructor(faces?: T[], uNumber?: number, vNumber?: number, height?: number);
                        faces: T[];
                        uNumber: number;
                        vNumber: number;
                        height: number;
                        precision: number;
                    }
                    declare class PyramidSimpleFacePart<T> {
                        id: string;
                        cells?: PyramidSimpleCellPart<T>[];
                        shapes?: {
                            compound?: T;
                            startPolylineWireU?: T;
                            startPolylineWireV?: T;
                            endPolylineWireU?: T;
                            endPolylineWireV?: T;
                            compoundPolylineWiresU?: T;
                            compoundPolylineWiresV?: T;
                            compoundPolylineWiresUV?: T;
                        };
                    }
                    declare class PyramidSimpleModelCellDto<T> {
                        cells: PyramidSimpleCellPart<T>;
                    }
                    declare class PyramidSimpleModelCellsDto<T> {
                        cells: PyramidSimpleCellPart<T>[];
                    }
                    declare class PyramidSimpleModelCellsIndexDto<T> {
                        cells: PyramidSimpleCellPart<T>[];
                        index: number;
                    }
                    declare class PyramidSimpleModelDto<T> {
                        model: PyramidSimpleData<T>;
                    }
                    declare class PyramidSimpleModelFaceCellIndexDto<T> {
                        model: PyramidSimpleData<T>;
                        faceIndex: number;
                        uIndex: number;
                        vIndex: number;
                    }
                    declare class PyramidSimpleModelFaceCellsUIndexDto<T> {
                        model: PyramidSimpleData<T>;
                        faceIndex: number;
                        uIndex: number;
                    }
                    declare class PyramidSimpleModelFaceCellsVIndexDto<T> {
                        model: PyramidSimpleData<T>;
                        faceIndex: number;
                        vIndex: number;
                    }
                    declare class PyramidSimpleModelFaceIndexDto<T> {
                        model: PyramidSimpleData<T>;
                        faceIndex: number;
                    }
                }
            }
        }
        declare namespace Navigation {
            declare class FocusFromAngleDto {
                constructor(meshes?: BABYLON.Mesh[], includeChildren?: boolean, orientation?: number[], distance?: number, padding?: number, animationSpeed?: number);
                meshes: BABYLON.Mesh[];
                includeChildren: boolean;
                orientation: number[];
                distance?: number;
                padding: number;
                animationSpeed: number;
            }
            declare class PointOfInterestDto {
                constructor(name?: string, position?: Inputs.Base.Point3, cameraTarget?: Inputs.Base.Point3, cameraPosition?: Inputs.Base.Point3, style?: PointOfInterestStyleDto);
                name: string;
                position: Inputs.Base.Point3;
                cameraTarget: Inputs.Base.Point3;
                cameraPosition: Inputs.Base.Point3;
                style?: PointOfInterestStyleDto;
            }
            declare class PointOfInterestEntity extends PointOfInterestDto {
                type: string;
                entityName: string;
            }
            declare class PointOfInterestStyleDto {
                constructor(pointSize?: number, pointColor?: string, hoverPointColor?: string, pulseColor?: string, pulseMinSize?: number, pulseMaxSize?: number, pulseThickness?: number, pulseSpeed?: number, textColor?: string, hoverTextColor?: string, textSize?: number, textFontWeight?: number, textBackgroundColor?: string, textBackgroundOpacity?: number, textBackgroundStroke?: boolean, textBackgroundStrokeThickness?: number, textBackgroundRadius?: number, textPosition?: Inputs.Base.topBottomEnum, stableSize?: boolean, alwaysOnTop?: boolean);
                pointSize?: number;
                pointColor?: Inputs.Base.Color;
                hoverPointColor?: Inputs.Base.Color;
                pulseColor?: Inputs.Base.Color;
                hoverPulseColor?: Inputs.Base.Color;
                pulseMinSize?: number;
                pulseMaxSize?: number;
                pulseThickness?: number;
                pulseSpeed?: number;
                textColor?: Inputs.Base.Color;
                hoverTextColor?: Inputs.Base.Color;
                textSize?: number;
                textFontWeight?: number;
                textBackgroundColor?: Inputs.Base.Color;
                textBackgroundOpacity: number;
                textBackgroundStroke: boolean;
                textBackgroundStrokeThickness: number;
                textBackgroundRadius: number;
                textPosition: Inputs.Base.topBottomEnum;
                stableSize: boolean;
                alwaysOnTop: boolean;
            }
            declare class ZoomOnDto {
                constructor(meshes?: BABYLON.Mesh[], includeChildren?: boolean, animationSpeed?: number, offset?: number, doNotUpdateMaxZ?: boolean);
                meshes: BABYLON.Mesh[];
                includeChildren: boolean;
                animationSpeed: number;
                offset: number;
                doNotUpdateMaxZ: boolean;
            }
        }
        declare namespace Dimensions {
            declare class AngularDimensionDto {
                constructor(centerPoint?: Inputs.Base.Point3, direction1?: Inputs.Base.Vector3, direction2?: Inputs.Base.Vector3, radius?: number, labelOffset?: number, decimalPlaces?: number, labelSuffix?: string, labelOverwrite?: string, radians?: boolean, removeTrailingZeros?: boolean, style?: DimensionStyleDto);
                centerPoint: Inputs.Base.Point3;
                direction1: Inputs.Base.Vector3;
                direction2: Inputs.Base.Vector3;
                radius: number;
                labelOffset: number;
                decimalPlaces: number;
                labelSuffix: string;
                labelOverwrite: string;
                radians: boolean;
                removeTrailingZeros: boolean;
                style?: DimensionStyleDto;
            }
            declare class AngularDimensionEntity extends AngularDimensionDto {
                type: string;
                entityName: string;
                id?: string;
            }
            declare class DiametralDimensionDto {
                constructor(centerPoint?: Inputs.Base.Point3, direction?: Inputs.Base.Vector3, diameter?: number, labelOffset?: number, decimalPlaces?: number, labelSuffix?: string, labelOverwrite?: string, showCenterMark?: boolean, removeTrailingZeros?: boolean, style?: DimensionStyleDto);
                centerPoint: Inputs.Base.Point3;
                direction: Inputs.Base.Vector3;
                diameter: number;
                labelOffset: number;
                decimalPlaces: number;
                labelSuffix: string;
                labelOverwrite: string;
                showCenterMark: boolean;
                removeTrailingZeros: boolean;
                style?: DimensionStyleDto;
            }
            declare class DiametralDimensionEntity extends DiametralDimensionDto {
                type: string;
                entityName: string;
                id?: string;
            }
            declare class DimensionStyleDto {
                constructor(lineColor?: string, lineThickness?: number, extensionLineLength?: number, arrowTailLength?: number, textColor?: string, textSize?: number, textFontWeight?: number, textBackgroundColor?: string, textBackgroundOpacity?: number, textBackgroundStroke?: boolean, textBackgroundStrokeThickness?: number, textBackgroundRadius?: number, textStableSize?: boolean, arrowSize?: number, arrowColor?: string, showArrows?: boolean, textBillboard?: boolean, occlusionCheckInterval?: number, alwaysOnTop?: boolean);
                lineColor: Inputs.Base.Color;
                lineThickness: number;
                extensionLineLength: number;
                arrowTailLength: number;
                textColor: Inputs.Base.Color;
                textSize: number;
                textFontWeight: number;
                textBackgroundColor: Inputs.Base.Color;
                textBackgroundOpacity: number;
                textBackgroundStroke: boolean;
                textBackgroundStrokeThickness: number;
                textBackgroundRadius: number;
                textStableSize: boolean;
                arrowSize: number;
                arrowColor: Inputs.Base.Color;
                showArrows: boolean;
                textBillboard: boolean;
                occlusionCheckInterval: number;
                alwaysOnTop: boolean;
            }
            declare class LinearDimensionDto {
                constructor(startPoint?: Inputs.Base.Point3, endPoint?: Inputs.Base.Point3, direction?: Inputs.Base.Vector3, labelOffset?: number, decimalPlaces?: number, labelSuffix?: string, labelOverwrite?: string, removeTrailingZeros?: boolean, style?: DimensionStyleDto);
                startPoint: Inputs.Base.Point3;
                endPoint: Inputs.Base.Point3;
                direction: Inputs.Base.Vector3;
                labelOffset: number;
                decimalPlaces: number;
                labelSuffix: string;
                labelOverwrite: string;
                removeTrailingZeros: boolean;
                style?: DimensionStyleDto;
            }
            declare class LinearDimensionEntity extends LinearDimensionDto {
                type: string;
                entityName: string;
                id?: string;
            }
            declare enum ordinateAxisEnum {
                x = "x",
                y = "y",
                z = "z"
            }
            declare class OrdinateDimensionDto {
                constructor(measurementPoint?: Inputs.Base.Point3, referencePoint?: Inputs.Base.Point3, axis?: ordinateAxisEnum, labelOffset?: number, decimalPlaces?: number, labelSuffix?: string, labelOverwrite?: string, showLeaderLine?: boolean, removeTrailingZeros?: boolean, style?: DimensionStyleDto);
                measurementPoint: Inputs.Base.Point3;
                referencePoint: Inputs.Base.Point3;
                axis: ordinateAxisEnum;
                labelOffset: number;
                decimalPlaces: number;
                labelSuffix: string;
                labelOverwrite: string;
                showLeaderLine: boolean;
                removeTrailingZeros: boolean;
                style?: DimensionStyleDto;
            }
            declare class OrdinateDimensionEntity extends OrdinateDimensionDto {
                type: string;
                entityName: string;
                id?: string;
            }
            declare class RadialDimensionDto {
                constructor(centerPoint?: Inputs.Base.Point3, radiusPoint?: Inputs.Base.Point3, labelOffset?: number, decimalPlaces?: number, labelSuffix?: string, labelOverwrite?: string, showDiameter?: boolean, showCenterMark?: boolean, removeTrailingZeros?: boolean, style?: DimensionStyleDto);
                centerPoint: Inputs.Base.Point3;
                radiusPoint: Inputs.Base.Point3;
                labelOffset: number;
                decimalPlaces: number;
                labelSuffix: string;
                labelOverwrite: string;
                showDiameter: boolean;
                showCenterMark: boolean;
                removeTrailingZeros: boolean;
                style?: DimensionStyleDto;
            }
            declare class RadialDimensionEntity extends RadialDimensionDto {
                type: string;
                entityName: string;
                id?: string;
            }
        }
    }
    declare class BitByBitJSCAD {
        jscadWorkerManager: JSCADWorkerManager;
        jscad: JSCAD;
        constructor();
        init(jscad: Worker): void;
    }
    declare class JSCADBooleans {
        private readonly jscadWorkerManager;
        constructor(jscadWorkerManager: JSCADWorkerManager);
        intersect(inputs: Inputs.JSCAD.BooleanObjectsDto): Promise<Inputs.JSCAD.JSCADEntity>;
        subtract(inputs: Inputs.JSCAD.BooleanObjectsDto): Promise<Inputs.JSCAD.JSCADEntity>;
        union(inputs: Inputs.JSCAD.BooleanObjectsDto): Promise<Inputs.JSCAD.JSCADEntity>;
        intersectTwo(inputs: Inputs.JSCAD.BooleanTwoObjectsDto): Promise<Inputs.JSCAD.JSCADEntity>;
        subtractTwo(inputs: Inputs.JSCAD.BooleanTwoObjectsDto): Promise<Inputs.JSCAD.JSCADEntity>;
        unionTwo(inputs: Inputs.JSCAD.BooleanTwoObjectsDto): Promise<Inputs.JSCAD.JSCADEntity>;
        subtractFrom(inputs: Inputs.JSCAD.BooleanObjectsFromDto): Promise<Inputs.JSCAD.JSCADEntity>;
    }
    declare class JSCADColors {
        private readonly jscadWorkerManager;
        constructor(jscadWorkerManager: JSCADWorkerManager);
        colorize(inputs: Inputs.JSCAD.ColorizeDto): Promise<Inputs.JSCAD.JSCADEntity | Inputs.JSCAD.JSCADEntity[]>;
    }
    declare class JSCADExpansions {
        private readonly jscadWorkerManager;
        constructor(jscadWorkerManager: JSCADWorkerManager);
        expand(inputs: Inputs.JSCAD.ExpansionDto): Promise<Inputs.JSCAD.JSCADEntity>;
        offset(inputs: Inputs.JSCAD.ExpansionDto): Promise<Inputs.JSCAD.JSCADEntity>;
    }
    declare class JSCADExtrusions {
        private readonly jscadWorkerManager;
        constructor(jscadWorkerManager: JSCADWorkerManager);
        extrudeLinear(inputs: Inputs.JSCAD.ExtrudeLinearDto): Promise<Inputs.JSCAD.JSCADEntity>;
        extrudeRectangular(inputs: Inputs.JSCAD.ExtrudeRectangularDto): Promise<Inputs.JSCAD.JSCADEntity>;
        extrudeRectangularPoints(inputs: Inputs.JSCAD.ExtrudeRectangularPointsDto): Promise<Inputs.JSCAD.JSCADEntity>;
        extrudeRotate(inputs: Inputs.JSCAD.ExtrudeRotateDto): Promise<Inputs.JSCAD.JSCADEntity>;
    }
    declare class JSCADHulls {
        private readonly jscadWorkerManager;
        constructor(jscadWorkerManager: JSCADWorkerManager);
        hullChain(inputs: Inputs.JSCAD.HullDto): Promise<Inputs.JSCAD.JSCADEntity>;
        hull(inputs: Inputs.JSCAD.HullDto): Promise<Inputs.JSCAD.JSCADEntity>;
    }
    declare class JSCAD {
        private readonly jscadWorkerManager;
        readonly booleans: JSCADBooleans;
        readonly expansions: JSCADExpansions;
        readonly extrusions: JSCADExtrusions;
        readonly hulls: JSCADHulls;
        readonly path: JSCADPath;
        readonly polygon: JSCADPolygon;
        readonly shapes: JSCADShapes;
        readonly text: JSCADText;
        readonly colors: JSCADColors;
        constructor(jscadWorkerManager: JSCADWorkerManager);
        toPolygonPoints(inputs: Inputs.JSCAD.MeshDto): Promise<Inputs.Base.Mesh3>;
        transformSolids(inputs: Inputs.JSCAD.TransformSolidsDto): Promise<Inputs.JSCAD.JSCADEntity[]>;
        transformSolid(inputs: Inputs.JSCAD.TransformSolidDto): Promise<Inputs.JSCAD.JSCADEntity>;
        downloadSolidSTL(inputs: Inputs.JSCAD.DownloadSolidDto): Promise<void>;
        downloadSolidsSTL(inputs: Inputs.JSCAD.DownloadSolidsDto): Promise<void>;
        downloadGeometryDxf(inputs: Inputs.JSCAD.DownloadGeometryDto): Promise<void>;
        downloadGeometry3MF(inputs: Inputs.JSCAD.DownloadGeometryDto): Promise<void>;
        private downloadFile;
    }
    declare class JSCADPath {
        private readonly jscadWorkerManager;
        constructor(jscadWorkerManager: JSCADWorkerManager);
        createFromPoints(inputs: Inputs.JSCAD.PathFromPointsDto): Promise<Inputs.JSCAD.JSCADEntity>;
        createPathsFromPoints(inputs: Inputs.JSCAD.PathsFromPointsDto): Promise<Inputs.JSCAD.JSCADEntity[]>;
        createFromPolyline(inputs: Inputs.JSCAD.PathFromPolylineDto): Promise<Inputs.JSCAD.JSCADEntity>;
        createEmpty(): Promise<Inputs.JSCAD.JSCADEntity>;
        close(inputs: Inputs.JSCAD.PathDto): Promise<Inputs.JSCAD.JSCADEntity>;
        appendPoints(inputs: Inputs.JSCAD.PathAppendPointsDto): Promise<Inputs.JSCAD.JSCADEntity>;
        appendPolyline(inputs: Inputs.JSCAD.PathAppendPolylineDto): Promise<Inputs.JSCAD.JSCADEntity>;
        appendArc(inputs: Inputs.JSCAD.PathAppendArcDto): Promise<Inputs.JSCAD.JSCADEntity>;
    }
    declare class JSCADPolygon {
        private readonly jscadWorkerManager;
        constructor(jscadWorkerManager: JSCADWorkerManager);
        createFromPoints(inputs: Inputs.JSCAD.PointsDto): Promise<Inputs.JSCAD.JSCADEntity>;
        createFromPolyline(inputs: Inputs.JSCAD.PolylineDto): Promise<Inputs.JSCAD.JSCADEntity>;
        createFromCurve(inputs: Inputs.JSCAD.CurveDto): Promise<Inputs.JSCAD.JSCADEntity>;
        createFromPath(inputs: Inputs.JSCAD.PathDto): Promise<Inputs.JSCAD.JSCADEntity>;
        circle(inputs: Inputs.JSCAD.CircleDto): Promise<Inputs.JSCAD.JSCADEntity>;
        ellipse(inputs: Inputs.JSCAD.EllipseDto): Promise<Inputs.JSCAD.JSCADEntity>;
        rectangle(inputs: Inputs.JSCAD.RectangleDto): Promise<Inputs.JSCAD.JSCADEntity>;
        roundedRectangle(inputs: Inputs.JSCAD.RoundedRectangleDto): Promise<Inputs.JSCAD.JSCADEntity>;
        square(inputs: Inputs.JSCAD.SquareDto): Promise<Inputs.JSCAD.JSCADEntity>;
        star(inputs: Inputs.JSCAD.StarDto): Promise<Inputs.JSCAD.JSCADEntity>;
    }
    declare class JSCADShapes {
        private readonly jscadWorkerManager;
        constructor(jscadWorkerManager: JSCADWorkerManager);
        cube(inputs: Inputs.JSCAD.CubeDto): Promise<Inputs.JSCAD.JSCADEntity>;
        cubesOnCenterPoints(inputs: Inputs.JSCAD.CubeCentersDto): Promise<Inputs.JSCAD.JSCADEntity[]>;
        cuboid(inputs: Inputs.JSCAD.CuboidDto): Promise<Inputs.JSCAD.JSCADEntity>;
        cuboidsOnCenterPoints(inputs: Inputs.JSCAD.CuboidCentersDto): Promise<Inputs.JSCAD.JSCADEntity[]>;
        cylinderElliptic(inputs: Inputs.JSCAD.CylidnerEllipticDto): Promise<Inputs.JSCAD.JSCADEntity>;
        cylinderEllipticOnCenterPoints(inputs: Inputs.JSCAD.CylidnerCentersEllipticDto): Promise<Inputs.JSCAD.JSCADEntity[]>;
        cylinder(inputs: Inputs.JSCAD.CylidnerDto): Promise<Inputs.JSCAD.JSCADEntity>;
        cylindersOnCenterPoints(inputs: Inputs.JSCAD.CylidnerCentersDto): Promise<Inputs.JSCAD.JSCADEntity[]>;
        ellipsoid(inputs: Inputs.JSCAD.EllipsoidDto): Promise<Inputs.JSCAD.JSCADEntity>;
        ellipsoidsOnCenterPoints(inputs: Inputs.JSCAD.EllipsoidCentersDto): Promise<Inputs.JSCAD.JSCADEntity[]>;
        geodesicSphere(inputs: Inputs.JSCAD.GeodesicSphereDto): Promise<Inputs.JSCAD.JSCADEntity>;
        geodesicSpheresOnCenterPoints(inputs: Inputs.JSCAD.GeodesicSphereCentersDto): Promise<Inputs.JSCAD.JSCADEntity[]>;
        roundedCuboid(inputs: Inputs.JSCAD.RoundedCuboidDto): Promise<Inputs.JSCAD.JSCADEntity>;
        roundedCuboidsOnCenterPoints(inputs: Inputs.JSCAD.RoundedCuboidCentersDto): Promise<Inputs.JSCAD.JSCADEntity[]>;
        roundedCylinder(inputs: Inputs.JSCAD.RoundedCylidnerDto): Promise<Inputs.JSCAD.JSCADEntity>;
        roundedCylindersOnCenterPoints(inputs: Inputs.JSCAD.RoundedCylidnerCentersDto): Promise<Inputs.JSCAD.JSCADEntity[]>;
        sphere(inputs: Inputs.JSCAD.SphereDto): Promise<Inputs.JSCAD.JSCADEntity>;
        spheresOnCenterPoints(inputs: Inputs.JSCAD.SphereCentersDto): Promise<Inputs.JSCAD.JSCADEntity[]>;
        torus(inputs: Inputs.JSCAD.TorusDto): Promise<Inputs.JSCAD.JSCADEntity>;
        fromPolygonPoints(inputs: Inputs.JSCAD.FromPolygonPoints): Promise<Inputs.JSCAD.JSCADEntity>;
    }
    declare class JSCADText {
        private readonly jscadWorkerManager;
        constructor(jscadWorkerManager: JSCADWorkerManager);
        cylindricalText(inputs: Inputs.JSCAD.CylinderTextDto): Promise<Inputs.JSCAD.JSCADEntity[]>;
        sphericalText(inputs: Inputs.JSCAD.SphereTextDto): Promise<Inputs.JSCAD.JSCADEntity[]>;
        createVectorText(inputs: Inputs.JSCAD.TextDto): Promise<Inputs.Base.Point2[][]>;
    }
    declare class BitByBitManifold {
        manifoldWorkerManager: ManifoldWorkerManager;
        manifold: ManifoldBitByBit;
        constructor();
        init(manifold: Worker): void;
    }
    declare class CrossSectionBooleans {
        private readonly manifoldWorkerManager;
        constructor(manifoldWorkerManager: ManifoldWorkerManager);
        subtract(inputs: Inputs.Manifold.TwoCrossSectionsDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer>;
        add(inputs: Inputs.Manifold.TwoCrossSectionsDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer>;
        intersect(inputs: Inputs.Manifold.TwoCrossSectionsDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer>;
        differenceTwo(inputs: Inputs.Manifold.TwoCrossSectionsDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer>;
        unionTwo(inputs: Inputs.Manifold.TwoCrossSectionsDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer>;
        intersectionTwo(inputs: Inputs.Manifold.TwoCrossSectionsDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer>;
        difference(inputs: Inputs.Manifold.CrossSectionsDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer>;
        union(inputs: Inputs.Manifold.CrossSectionsDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer>;
        intersection(inputs: Inputs.Manifold.CrossSectionsDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer>;
    }
    declare class ManifoldCrossSection {
        private readonly manifoldWorkerManager;
        shapes: CrossSectionShapes;
        operations: CrossSectionOperations;
        booleans: CrossSectionBooleans;
        transforms: CrossSectionTransforms;
        evaluate: CrossSectionEvaluate;
        constructor(manifoldWorkerManager: ManifoldWorkerManager);
        crossSectionFromPoints(inputs: Inputs.Manifold.CrossSectionFromPolygonPointsDto): Promise<Inputs.Manifold.CrossSectionPointer>;
        crossSectionFromPolygons(inputs: Inputs.Manifold.CrossSectionFromPolygonsPointsDto): Promise<Inputs.Manifold.CrossSectionPointer>;
        crossSectionToPolygons(inputs: Inputs.Manifold.CrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Base.Vector2[][]>;
        crossSectionToPoints(inputs: Inputs.Manifold.CrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<number[][][]>;
        crossSectionsToPolygons(inputs: Inputs.Manifold.CrossSectionsDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Base.Vector2[][][]>;
        crossSectionsToPoints(inputs: Inputs.Manifold.CrossSectionsDto<Inputs.Manifold.CrossSectionPointer>): Promise<number[][][][]>;
    }
    declare class CrossSectionEvaluate {
        private readonly manifoldWorkerManager;
        constructor(manifoldWorkerManager: ManifoldWorkerManager);
        area(inputs: Inputs.Manifold.CrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<number>;
        isEmpty(inputs: Inputs.Manifold.CrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<boolean>;
        numVert(inputs: Inputs.Manifold.CrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<number>;
        numContour(inputs: Inputs.Manifold.CrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<number>;
        bounds(inputs: Inputs.Manifold.CrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Base.Vector2[]>;
    }
    declare class CrossSectionOperations {
        private readonly manifoldWorkerManager;
        constructor(manifoldWorkerManager: ManifoldWorkerManager);
        hull(inputs: Inputs.Manifold.CrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer>;
        extrude(inputs: Inputs.Manifold.ExtrudeDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        revolve(inputs: Inputs.Manifold.RevolveDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        offset(inputs: Inputs.Manifold.OffsetDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer>;
        simplify(inputs: Inputs.Manifold.SimplifyDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer>;
        compose(inputs: Inputs.Manifold.ComposeDto<(Inputs.Manifold.CrossSectionPointer | Inputs.Base.Vector2[])[]>): Promise<Inputs.Manifold.CrossSectionPointer>;
        decompose(inputs: Inputs.Manifold.CrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer[]>;
    }
    declare class CrossSectionShapes {
        private readonly manifoldWorkerManager;
        constructor(manifoldWorkerManager: ManifoldWorkerManager);
        create(inputs: Inputs.Manifold.CreateContourSectionDto): Promise<Inputs.Manifold.CrossSectionPointer>;
        square(inputs: Inputs.Manifold.SquareDto): Promise<Inputs.Manifold.CrossSectionPointer>;
        circle(inputs: Inputs.Manifold.CircleDto): Promise<Inputs.Manifold.CrossSectionPointer>;
        rectangle(inputs: Inputs.Manifold.RectangleDto): Promise<Inputs.Manifold.CrossSectionPointer>;
    }
    declare class CrossSectionTransforms {
        private readonly manifoldWorkerManager;
        constructor(manifoldWorkerManager: ManifoldWorkerManager);
        scale2D(inputs: Inputs.Manifold.Scale2DCrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer>;
        scale(inputs: Inputs.Manifold.ScaleCrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer>;
        mirror(inputs: Inputs.Manifold.MirrorCrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer>;
        translate(inputs: Inputs.Manifold.TranslateCrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer>;
        translateXY(inputs: Inputs.Manifold.TranslateXYCrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer>;
        rotate(inputs: Inputs.Manifold.RotateCrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer>;
        transform(inputs: Inputs.Manifold.TransformCrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer>;
        warp(inputs: Inputs.Manifold.CrossSectionWarpDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer>;
    }
    declare class ManifoldBooleans {
        private readonly manifoldWorkerManager;
        constructor(manifoldWorkerManager: ManifoldWorkerManager);
        subtract(inputs: Inputs.Manifold.TwoManifoldsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        add(inputs: Inputs.Manifold.TwoManifoldsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        intersect(inputs: Inputs.Manifold.TwoManifoldsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        differenceTwo(inputs: Inputs.Manifold.TwoManifoldsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        unionTwo(inputs: Inputs.Manifold.TwoManifoldsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        intersectionTwo(inputs: Inputs.Manifold.TwoManifoldsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        difference(inputs: Inputs.Manifold.ManifoldsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        union(inputs: Inputs.Manifold.ManifoldsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        intersection(inputs: Inputs.Manifold.ManifoldsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        split(inputs: Inputs.Manifold.SplitManifoldsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer[]>;
        splitByPlane(inputs: Inputs.Manifold.SplitByPlaneDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer[]>;
        splitByPlaneOnOffsets(inputs: Inputs.Manifold.SplitByPlaneOnOffsetsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer[]>;
        trimByPlane(inputs: Inputs.Manifold.TrimByPlaneDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
    }
    declare class ManifoldEvaluate {
        private readonly manifoldWorkerManager;
        constructor(manifoldWorkerManager: ManifoldWorkerManager);
        surfaceArea(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<number>;
        volume(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<number>;
        isEmpty(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<boolean>;
        numVert(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<number>;
        numTri(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<number>;
        numEdge(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<number>;
        numProp(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<number>;
        numPropVert(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<number>;
        boundingBox(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Base.Vector3[]>;
        tolerance(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<number>;
        genus(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<number>;
        minGap(inputs: Inputs.Manifold.ManifoldsMinGapDto<Inputs.Manifold.ManifoldPointer>): Promise<number>;
        originalID(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<number>;
        status(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<string>;
    }
    declare class Manifold {
        private readonly manifoldWorkerManager;
        readonly shapes: ManifoldShapes;
        readonly booleans: ManifoldBooleans;
        readonly operations: ManifoldOperations;
        readonly transforms: ManifoldTransforms;
        readonly evaluate: ManifoldEvaluate;
        constructor(manifoldWorkerManager: ManifoldWorkerManager);
        manifoldToMesh(inputs: Inputs.Manifold.ManifoldToMeshDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.DecomposedManifoldMeshDto>;
        manifoldsToMeshes(inputs: Inputs.Manifold.ManifoldsToMeshesDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.DecomposedManifoldMeshDto[]>;
    }
    declare class ManifoldOperations {
        private readonly manifoldWorkerManager;
        constructor(manifoldWorkerManager: ManifoldWorkerManager);
        hull(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        hullPoints(inputs: Inputs.Manifold.HullPointsDto<(Inputs.Base.Point3 | Inputs.Manifold.ManifoldPointer)[]>): Promise<Inputs.Manifold.ManifoldPointer>;
        slice(inputs: Inputs.Manifold.SliceDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.CrossSectionPointer>;
        project(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.CrossSectionPointer>;
        setTolerance(inputs: Inputs.Manifold.ManifoldRefineToleranceDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        reserveIds(inputs: Inputs.Manifold.CountDto): Promise<number>;
        asOriginal(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        compose(inputs: Inputs.Manifold.ManifoldsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        decompose(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer[]>;
        calculateNormals(inputs: Inputs.Manifold.CalculateNormalsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        calculateCurvature(inputs: Inputs.Manifold.CalculateCurvatureDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        refineToTolerance(inputs: Inputs.Manifold.ManifoldRefineToleranceDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        refineToLength(inputs: Inputs.Manifold.ManifoldRefineLengthDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        refine(inputs: Inputs.Manifold.ManifoldRefineDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        smoothOut(inputs: Inputs.Manifold.ManifoldSmoothOutDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        smoothByNormals(inputs: Inputs.Manifold.ManifoldSmoothByNormalsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        simplify(inputs: Inputs.Manifold.ManifoldSimplifyDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        setProperties(inputs: Inputs.Manifold.ManifoldSetPropertiesDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
    }
    declare class ManifoldShapes {
        private readonly manifoldWorkerManager;
        constructor(manifoldWorkerManager: ManifoldWorkerManager);
        manifoldFromMesh(inputs: Inputs.Manifold.CreateFromMeshDto): Promise<Inputs.Manifold.ManifoldPointer>;
        fromPolygonPoints(inputs: Inputs.Manifold.FromPolygonPointsDto): Promise<Inputs.Manifold.ManifoldPointer>;
        cube(inputs: Inputs.Manifold.CubeDto): Promise<Inputs.Manifold.ManifoldPointer>;
        sphere(inputs: Inputs.Manifold.SphereDto): Promise<Inputs.Manifold.ManifoldPointer>;
        tetrahedron(): Promise<Inputs.Manifold.ManifoldPointer>;
        cylinder(inputs: Inputs.Manifold.CylinderDto): Promise<Inputs.Manifold.ManifoldPointer>;
    }
    declare class ManifoldTransforms {
        private readonly manifoldWorkerManager;
        constructor(manifoldWorkerManager: ManifoldWorkerManager);
        scale3D(inputs: Inputs.Manifold.Scale3DDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        scale(inputs: Inputs.Manifold.ScaleDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        mirror(inputs: Inputs.Manifold.MirrorDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        translate(inputs: Inputs.Manifold.TranslateDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        translateByVectors(inputs: Inputs.Manifold.TranslateByVectorsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer[]>;
        translateXYZ(inputs: Inputs.Manifold.TranslateXYZDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        rotate(inputs: Inputs.Manifold.RotateDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        rotateXYZ(inputs: Inputs.Manifold.RotateXYZDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        transform(inputs: Inputs.Manifold.TransformDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        transforms(inputs: Inputs.Manifold.TransformsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
        warp(inputs: Inputs.Manifold.ManifoldWarpDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer>;
    }
    declare class ManifoldBitByBit {
        private readonly manifoldWorkerManager;
        readonly manifold: Manifold;
        readonly crossSection: ManifoldCrossSection;
        readonly mesh: Mesh;
        constructor(manifoldWorkerManager: ManifoldWorkerManager);
        manifoldToMeshPointer(inputs: Inputs.Manifold.ManifoldToMeshDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.MeshPointer>;
        decomposeManifoldOrCrossSection(inputs: Inputs.Manifold.DecomposeManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.DecomposedManifoldMeshDto | Inputs.Base.Vector2[][]>;
        toPolygonPoints(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Base.Mesh3>;
        decomposeManifoldsOrCrossSections(inputs: Inputs.Manifold.DecomposeManifoldsOrCrossSectionsDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer>): Promise<(Inputs.Manifold.DecomposedManifoldMeshDto | Inputs.Base.Vector2[][])[]>;
        deleteManifoldOrCrossSection(inputs: Inputs.Manifold.ManifoldOrCrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<void>;
        deleteManifoldsOrCrossSections(inputs: Inputs.Manifold.ManifoldsOrCrossSectionsDto<Inputs.Manifold.CrossSectionPointer>): Promise<void>;
    }
    declare class MeshEvaluate {
        private readonly manifoldWorkerManager;
        constructor(manifoldWorkerManager: ManifoldWorkerManager);
        position(inputs: Inputs.Manifold.MeshVertexIndexDto<Inputs.Manifold.MeshPointer>): Promise<Inputs.Base.Point3>;
        verts(inputs: Inputs.Manifold.MeshTriangleIndexDto<Inputs.Manifold.MeshPointer>): Promise<number[]>;
        tangent(inputs: Inputs.Manifold.MeshHalfEdgeIndexDto<Inputs.Manifold.MeshPointer>): Promise<number[]>;
        extras(inputs: Inputs.Manifold.MeshVertexIndexDto<Inputs.Manifold.MeshPointer>): Promise<number[]>;
        transform(inputs: Inputs.Manifold.MeshVertexIndexDto<Inputs.Manifold.MeshPointer>): Promise<number[]>;
        numProp(inputs: Inputs.Manifold.MeshDto<Inputs.Manifold.MeshPointer>): Promise<number>;
        numVert(inputs: Inputs.Manifold.MeshDto<Inputs.Manifold.MeshPointer>): Promise<number>;
        numTri(inputs: Inputs.Manifold.MeshDto<Inputs.Manifold.MeshPointer>): Promise<number>;
        numRun(inputs: Inputs.Manifold.MeshDto<Inputs.Manifold.MeshPointer>): Promise<number>;
    }
    declare class Mesh {
        private readonly manifoldWorkerManager;
        readonly operations: MeshOperations;
        readonly evaluate: MeshEvaluate;
        constructor(manifoldWorkerManager: ManifoldWorkerManager);
    }
    declare class MeshOperations {
        private readonly manifoldWorkerManager;
        constructor(manifoldWorkerManager: ManifoldWorkerManager);
        merge(inputs: Inputs.Manifold.MeshDto<Inputs.Manifold.MeshPointer>): Promise<Inputs.Manifold.MeshPointer>;
    }
    declare class BitByBitOCCT {
        occtWorkerManager: OCCTWorkerManager;
        occt: OCCT;
        constructor();
        init(occt: Worker): void;
    }
    declare class OCCTBooleans {
        private readonly occWorkerManager;
        constructor(occWorkerManager: OCCTWorkerManager);
        union(inputs: Inputs.OCCT.UnionDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        difference(inputs: Inputs.OCCT.DifferenceDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        intersection(inputs: Inputs.OCCT.IntersectionDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        meshMeshIntersectionWires(inputs: Inputs.OCCT.MeshMeshIntersectionTwoShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSWirePointer[]>;
        meshMeshIntersectionPoints(inputs: Inputs.OCCT.MeshMeshIntersectionTwoShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.Base.Point3[][]>;
        meshMeshIntersectionOfShapesWires(inputs: Inputs.OCCT.MeshMeshesIntersectionOfShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSWirePointer[]>;
        meshMeshIntersectionOfShapesPoints(inputs: Inputs.OCCT.MeshMeshesIntersectionOfShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.Base.Point3[][]>;
    }
    declare class OCCTDimensions {
        private readonly occWorkerManager;
        constructor(occWorkerManager: OCCTWorkerManager);
        simpleLinearLengthDimension(inputs: Inputs.OCCT.SimpleLinearLengthDimensionDto): Promise<Inputs.OCCT.TopoDSCompoundPointer>;
        simpleAngularDimension(inputs: Inputs.OCCT.SimpleAngularDimensionDto): Promise<Inputs.OCCT.TopoDSCompoundPointer>;
        pinWithLabel(inputs: Inputs.OCCT.PinWithLabelDto): Promise<Inputs.OCCT.TopoDSCompoundPointer>;
    }
    declare class OCCTFillets {
        private readonly occWorkerManager;
        constructor(occWorkerManager: OCCTWorkerManager);
        filletEdges(inputs: Inputs.OCCT.FilletDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        filletEdgesList(inputs: Inputs.OCCT.FilletEdgesListDto<Inputs.OCCT.TopoDSShapePointer, Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        filletEdgesListOneRadius(inputs: Inputs.OCCT.FilletEdgesListOneRadiusDto<Inputs.OCCT.TopoDSShapePointer, Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        filletEdgeVariableRadius(inputs: Inputs.OCCT.FilletEdgeVariableRadiusDto<Inputs.OCCT.TopoDSShapePointer, Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        filletEdgesSameVariableRadius(inputs: Inputs.OCCT.FilletEdgesSameVariableRadiusDto<Inputs.OCCT.TopoDSShapePointer, Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        filletEdgesVariableRadius(inputs: Inputs.OCCT.FilletEdgesVariableRadiusDto<Inputs.OCCT.TopoDSShapePointer, Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        fillet3DWire(inputs: Inputs.OCCT.Fillet3DWireDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        fillet3DWires(inputs: Inputs.OCCT.Fillet3DWiresDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
        chamferEdges(inputs: Inputs.OCCT.ChamferDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        chamferEdgesList(inputs: Inputs.OCCT.ChamferEdgesListDto<Inputs.OCCT.TopoDSShapePointer, Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        chamferEdgeTwoDistances(inputs: Inputs.OCCT.ChamferEdgeTwoDistancesDto<Inputs.OCCT.TopoDSShapePointer, Inputs.OCCT.TopoDSEdgePointer, Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        chamferEdgesTwoDistances(inputs: Inputs.OCCT.ChamferEdgesTwoDistancesDto<Inputs.OCCT.TopoDSShapePointer, Inputs.OCCT.TopoDSEdgePointer, Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        chamferEdgesTwoDistancesLists(inputs: Inputs.OCCT.ChamferEdgesTwoDistancesListsDto<Inputs.OCCT.TopoDSShapePointer, Inputs.OCCT.TopoDSEdgePointer, Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        chamferEdgeDistAngle(inputs: Inputs.OCCT.ChamferEdgeDistAngleDto<Inputs.OCCT.TopoDSShapePointer, Inputs.OCCT.TopoDSEdgePointer, Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        chamferEdgesDistAngle(inputs: Inputs.OCCT.ChamferEdgesDistAngleDto<Inputs.OCCT.TopoDSShapePointer, Inputs.OCCT.TopoDSEdgePointer, Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        chamferEdgesDistsAngles(inputs: Inputs.OCCT.ChamferEdgesDistsAnglesDto<Inputs.OCCT.TopoDSShapePointer, Inputs.OCCT.TopoDSEdgePointer, Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        fillet2d(inputs: Inputs.OCCT.FilletDto<Inputs.OCCT.TopoDSWirePointer | Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        fillet2dShapes(inputs: Inputs.OCCT.FilletShapesDto<Inputs.OCCT.TopoDSWirePointer | Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
        filletTwoEdgesInPlaneIntoAWire(inputs: Inputs.OCCT.FilletTwoEdgesInPlaneDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.OCCT.TopoDSWirePointer>;
    }
    declare class OCCTCurves {
        private readonly occWorkerManager;
        constructor(occWorkerManager: OCCTWorkerManager);
        geom2dEllipse(inputs: Inputs.OCCT.Geom2dEllipseDto): Promise<Inputs.OCCT.Geom2dCurvePointer>;
        geom2dTrimmedCurve(inputs: Inputs.OCCT.Geom2dTrimmedCurveDto<Inputs.OCCT.Geom2dCurvePointer>): Promise<Inputs.OCCT.Geom2dCurvePointer>;
        geom2dSegment(inputs: Inputs.OCCT.Geom2dSegmentDto): Promise<Inputs.OCCT.Geom2dCurvePointer>;
        get2dPointFrom2dCurveOnParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Inputs.OCCT.Geom2dCurvePointer>): Promise<Inputs.Base.Point2>;
        geomCircleCurve(inputs: Inputs.OCCT.CircleDto): Promise<Inputs.OCCT.GeomCurvePointer>;
        geomEllipseCurve(inputs: Inputs.OCCT.EllipseDto): Promise<Inputs.OCCT.GeomCurvePointer>;
    }
    declare class OCCTGeom {
        readonly curves: OCCTCurves;
        readonly surfaces: OCCTSurfaces;
        constructor(occWorkerManager: OCCTWorkerManager);
    }
    declare class OCCTSurfaces {
        private readonly occWorkerManager;
        constructor(occWorkerManager: OCCTWorkerManager);
        cylindricalSurface(inputs: Inputs.OCCT.GeomCylindricalSurfaceDto): Promise<Inputs.OCCT.GeomSurfacePointer>;
        surfaceFromFace(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.GeomSurfacePointer>;
    }
    declare class OCCTIO {
        readonly occWorkerManager: OCCTWorkerManager;
        constructor(occWorkerManager: OCCTWorkerManager);
        saveShapeSTEP(inputs: Inputs.OCCT.SaveStepDto<Inputs.OCCT.TopoDSShapePointer>): Promise<void>;
        saveShapeSTEPAndReturn(inputs: Inputs.OCCT.SaveStepDto<Inputs.OCCT.TopoDSShapePointer>): Promise<string>;
        saveShapeStl(inputs: Inputs.OCCT.SaveStlDto<Inputs.OCCT.TopoDSShapePointer>): Promise<void>;
        saveShapeStlAndReturn(inputs: Inputs.OCCT.SaveStlDto<Inputs.OCCT.TopoDSShapePointer>): Promise<string>;
        private saveSTEP;
        private saveStl;
        shapeToDxfPaths(inputs: Inputs.OCCT.ShapeToDxfPathsDto<Inputs.OCCT.TopoDSShapePointer>): Promise<IO.DxfPathDto[]>;
        dxfPathsWithLayer(inputs: Inputs.OCCT.DxfPathsWithLayerDto): Promise<IO.DxfPathsPartDto>;
        dxfCreate(inputs: Inputs.OCCT.DxfPathsPartsListDto): Promise<string>;
    }
    declare class OCCT {
        readonly occWorkerManager: OCCTWorkerManager;
        readonly shapes: OCCTShapes;
        readonly geom: OCCTGeom;
        readonly fillets: OCCTFillets;
        readonly transforms: OCCTTransforms;
        readonly operations: OCCTOperations;
        readonly booleans: OCCTBooleans;
        readonly dimensions: OCCTDimensions;
        readonly shapeFix: OCCTShapeFix;
        io: OCCTIO;
        constructor(occWorkerManager: OCCTWorkerManager);
        shapeFacesToPolygonPoints(inputs: Inputs.OCCT.ShapeFacesToPolygonPointsDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.Base.Point3[][]>;
        shapeToMesh(inputs: Inputs.OCCT.ShapeToMeshDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.DecomposedMeshDto>;
        shapesToMeshes(inputs: Inputs.OCCT.ShapesToMeshesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.DecomposedMeshDto[]>;
        deleteShape(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<void>;
        deleteShapes(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<void>;
        cleanAllCache(): Promise<void>;
    }
    declare class OCCTOperations {
        private readonly occWorkerManager;
        constructor(occWorkerManager: OCCTWorkerManager);
        loft(inputs: Inputs.OCCT.LoftDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        loftAdvanced(inputs: Inputs.OCCT.LoftAdvancedDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        closestPointsBetweenTwoShapes(inputs: Inputs.OCCT.ClosestPointsBetweenTwoShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.Base.Point3[]>;
        closestPointsOnShapeFromPoints(inputs: Inputs.OCCT.ClosestPointsOnShapeFromPointsDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.Base.Point3[]>;
        closestPointsOnShapesFromPoints(inputs: Inputs.OCCT.ClosestPointsOnShapesFromPointsDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.Base.Point3[]>;
        distancesToShapeFromPoints(inputs: Inputs.OCCT.ClosestPointsOnShapeFromPointsDto<Inputs.OCCT.TopoDSShapePointer>): Promise<number[]>;
        boundingBoxOfShape(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.BoundingBoxPropsDto>;
        boundingBoxMinOfShape(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.Base.Point3>;
        boundingBoxMaxOfShape(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.Base.Point3>;
        boundingBoxCenterOfShape(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.Base.Point3>;
        boundingBoxSizeOfShape(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.Base.Vector3>;
        boundingBoxShapeOfShape(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        boundingSphereOfShape(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.BoundingSpherePropsDto>;
        boundingSphereCenterOfShape(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.Base.Point3>;
        boundingSphereRadiusOfShape(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<number>;
        boundingSphereShapeOfShape(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        extrude(inputs: Inputs.OCCT.ExtrudeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        extrudeShapes(inputs: Inputs.OCCT.ExtrudeShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
        splitShapeWithShapes(inputs: Inputs.OCCT.SplitDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
        revolve(inputs: Inputs.OCCT.RevolveDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        rotatedExtrude(inputs: Inputs.OCCT.RotationExtrudeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        pipe(inputs: Inputs.OCCT.ShapeShapesDto<Inputs.OCCT.TopoDSWirePointer, Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        pipePolylineWireNGon(inputs: Inputs.OCCT.PipePolygonWireNGonDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        pipeWiresCylindrical(inputs: Inputs.OCCT.PipeWiresCylindricalDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
        pipeWireCylindrical(inputs: Inputs.OCCT.PipeWireCylindricalDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        offset(inputs: Inputs.OCCT.OffsetDto<Inputs.OCCT.TopoDSShapePointer, Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        offsetAdv(inputs: Inputs.OCCT.OffsetAdvancedDto<Inputs.OCCT.TopoDSShapePointer, Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        makeThickSolidSimple(inputs: Inputs.OCCT.ThisckSolidSimpleDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        makeThickSolidByJoin(inputs: Inputs.OCCT.ThickSolidByJoinDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        slice(inputs: Inputs.OCCT.SliceDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSCompoundPointer>;
        sliceInStepPattern(inputs: Inputs.OCCT.SliceInStepPatternDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSCompoundPointer>;
        offset3DWire(inputs: Inputs.OCCT.Offset3DWireDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSWirePointer>;
    }
    declare class OCCTShapeFix {
        private readonly occWorkerManager;
        constructor(occWorkerManager: OCCTWorkerManager);
        basicShapeRepair(inputs: Inputs.OCCT.BasicShapeRepairDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        fixSmallEdgeOnWire(inputs: Inputs.OCCT.FixSmallEdgesInWireDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSWirePointer>;
        fixEdgeOrientationsAlongWire(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSWirePointer>;
    }
    declare class OCCTCompound {
        private readonly occWorkerManager;
        constructor(occWorkerManager: OCCTWorkerManager);
        makeCompound(inputs: Inputs.OCCT.CompoundShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSCompoundPointer>;
        getShapesOfCompound(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSCompoundPointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
    }
    declare class OCCTEdge {
        private readonly occWorkerManager;
        constructor(occWorkerManager: OCCTWorkerManager);
        fromBaseLine(inputs: Inputs.OCCT.LineBaseDto): Promise<Inputs.OCCT.TopoDSEdgePointer>;
        fromBaseLines(inputs: Inputs.OCCT.LineBaseDto): Promise<Inputs.OCCT.TopoDSEdgePointer[]>;
        fromBaseSegment(inputs: Inputs.OCCT.SegmentBaseDto): Promise<Inputs.OCCT.TopoDSEdgePointer>;
        fromBaseSegments(inputs: Inputs.OCCT.SegmentsBaseDto): Promise<Inputs.OCCT.TopoDSEdgePointer[]>;
        fromPoints(inputs: Inputs.OCCT.PointsDto): Promise<Inputs.OCCT.TopoDSEdgePointer[]>;
        fromBasePolyline(inputs: Inputs.OCCT.PolylineBaseDto): Promise<Inputs.OCCT.TopoDSEdgePointer[]>;
        fromBaseTriangle(inputs: Inputs.OCCT.TriangleBaseDto): Promise<Inputs.OCCT.TopoDSEdgePointer[]>;
        fromBaseMesh(inputs: Inputs.OCCT.MeshBaseDto): Promise<Inputs.OCCT.TopoDSEdgePointer[]>;
        line(inputs: Inputs.OCCT.LineDto): Promise<Inputs.OCCT.TopoDSEdgePointer>;
        arcThroughThreePoints(inputs: Inputs.OCCT.ArcEdgeThreePointsDto): Promise<Inputs.OCCT.TopoDSEdgePointer>;
        arcThroughTwoPointsAndTangent(inputs: Inputs.OCCT.ArcEdgeTwoPointsTangentDto): Promise<Inputs.OCCT.TopoDSEdgePointer>;
        arcFromCircleAndTwoPoints(inputs: Inputs.OCCT.ArcEdgeCircleTwoPointsDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.OCCT.TopoDSEdgePointer>;
        arcFromCircleAndTwoAngles(inputs: Inputs.OCCT.ArcEdgeCircleTwoAnglesDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.OCCT.TopoDSEdgePointer>;
        arcFromCirclePointAndAngle(inputs: Inputs.OCCT.ArcEdgeCirclePointAngleDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.OCCT.TopoDSEdgePointer>;
        createCircleEdge(inputs: Inputs.OCCT.CircleDto): Promise<Inputs.OCCT.TopoDSEdgePointer>;
        createEllipseEdge(inputs: Inputs.OCCT.EllipseDto): Promise<Inputs.OCCT.TopoDSEdgePointer>;
        removeInternalEdges(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        makeEdgeFromGeom2dCurveAndSurface(inputs: Inputs.OCCT.CurveAndSurfaceDto<Inputs.OCCT.Geom2dCurvePointer, Inputs.OCCT.GeomSurfacePointer>): Promise<Inputs.OCCT.TopoDSEdgePointer>;
        getEdge(inputs: Inputs.OCCT.EdgeIndexDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSEdgePointer>;
        getEdges(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSEdgePointer[]>;
        getEdgesAlongWire(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSEdgePointer[]>;
        getCircularEdgesAlongWire(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSEdgePointer[]>;
        getLinearEdgesAlongWire(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSEdgePointer[]>;
        getCornerPointsOfEdgesForShape(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.Base.Point3[]>;
        getEdgeLength(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<number>;
        getEdgeLengthsOfShape(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<number[]>;
        getEdgesLengths(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<number[]>;
        getEdgeCenterOfMass(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3>;
        getEdgesCentersOfMass(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3[]>;
        getCircularEdgeCenterPoint(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3>;
        getCircularEdgeRadius(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<number>;
        getCircularEdgePlaneDirection(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Vector3>;
        pointOnEdgeAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3>;
        pointsOnEdgesAtParam(inputs: Inputs.OCCT.DataOnGeometryesAtParamDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3[]>;
        edgesToPoints(inputs: Inputs.OCCT.EdgesToPointsDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3[][]>;
        reversedEdge(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.OCCT.TopoDSEdgePointer>;
        tangentOnEdgeAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3>;
        tangentsOnEdgesAtParam(inputs: Inputs.OCCT.DataOnGeometryesAtParamDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3[]>;
        pointOnEdgeAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3>;
        pointsOnEdgesAtLength(inputs: Inputs.OCCT.DataOnGeometryesAtLengthDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3[]>;
        tangentOnEdgeAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3>;
        tangentsOnEdgesAtLength(inputs: Inputs.OCCT.DataOnGeometryesAtLengthDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3[]>;
        startPointOnEdge(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3>;
        startPointsOnEdges(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3[]>;
        endPointOnEdge(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3>;
        endPointsOnEdges(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3[]>;
        divideEdgeByParamsToPoints(inputs: Inputs.OCCT.DivideDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3[]>;
        divideEdgesByParamsToPoints(inputs: Inputs.OCCT.DivideShapesDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3[][]>;
        divideEdgeByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3[]>;
        divideEdgesByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideShapesDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3[][]>;
        constraintTanLinesFromTwoPtsToCircle(inputs: Inputs.OCCT.ConstraintTanLinesFromTwoPtsToCircleDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
        constraintTanLinesFromPtToCircle(inputs: Inputs.OCCT.ConstraintTanLinesFromPtToCircleDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
        constraintTanLinesOnTwoCircles(inputs: Inputs.OCCT.ConstraintTanLinesOnTwoCirclesDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
        constraintTanCirclesOnTwoCircles(inputs: Inputs.OCCT.ConstraintTanCirclesOnTwoCirclesDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
        constraintTanCirclesOnCircleAndPnt(inputs: Inputs.OCCT.ConstraintTanCirclesOnCircleAndPntDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
        isEdgeLinear(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<boolean>;
        isEdgeCircular(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<boolean>;
    }
    declare class OCCTFace {
        private readonly occWorkerManager;
        constructor(occWorkerManager: OCCTWorkerManager);
        fromBaseTriangle(inputs: Inputs.OCCT.TriangleBaseDto): Promise<Inputs.OCCT.TopoDSFacePointer>;
        fromBaseMesh(inputs: Inputs.OCCT.MeshBaseDto): Promise<Inputs.OCCT.TopoDSFacePointer[]>;
        createFacesFromWiresOnFace(inputs: Inputs.OCCT.FacesFromWiresOnFaceDto<Inputs.OCCT.TopoDSWirePointer, Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSFacePointer[]>;
        createFaceFromWireOnFace(inputs: Inputs.OCCT.FaceFromWireOnFaceDto<Inputs.OCCT.TopoDSWirePointer, Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSFacePointer>;
        createFaceFromWire(inputs: Inputs.OCCT.FaceFromWireDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSFacePointer>;
        createFaceFromWires(inputs: Inputs.OCCT.FaceFromWiresDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSFacePointer>;
        createFaceFromWiresOnFace(inputs: Inputs.OCCT.FaceFromWiresOnFaceDto<Inputs.OCCT.TopoDSWirePointer, Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSFacePointer>;
        createFacesFromWires(inputs: Inputs.OCCT.FacesFromWiresDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSFacePointer[]>;
        createFaceFromMultipleCircleTanWires(inputs: Inputs.OCCT.FaceFromMultipleCircleTanWiresDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        createFaceFromMultipleCircleTanWireCollections(inputs: Inputs.OCCT.FaceFromMultipleCircleTanWireCollectionsDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        faceFromSurface(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.GeomSurfacePointer>): Promise<Inputs.OCCT.TopoDSFacePointer>;
        faceFromSurfaceAndWire(inputs: Inputs.OCCT.FaceFromSurfaceAndWireDto<Inputs.OCCT.GeomSurfacePointer, Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSFacePointer>;
        createPolygonFace(inputs: Inputs.OCCT.PolygonDto): Promise<Inputs.OCCT.TopoDSFacePointer>;
        createCircleFace(inputs: Inputs.OCCT.CircleDto): Promise<Inputs.OCCT.TopoDSFacePointer>;
        hexagonsInGrid(inputs: Inputs.OCCT.HexagonsInGridDto): Promise<Inputs.OCCT.TopoDSFacePointer[]>;
        createEllipseFace(inputs: Inputs.OCCT.EllipseDto): Promise<Inputs.OCCT.TopoDSFacePointer>;
        createSquareFace(inputs: Inputs.OCCT.SquareDto): Promise<Inputs.OCCT.TopoDSFacePointer>;
        createRectangleFace(inputs: Inputs.OCCT.RectangleDto): Promise<Inputs.OCCT.TopoDSFacePointer>;
        createLPolygonFace(inputs: Inputs.OCCT.LPolygonDto): Promise<Inputs.OCCT.TopoDSFacePointer>;
        createStarFace(inputs: Inputs.OCCT.StarDto): Promise<Inputs.OCCT.TopoDSFacePointer>;
        createChristmasTreeFace(inputs: Inputs.OCCT.ChristmasTreeDto): Promise<Inputs.OCCT.TopoDSFacePointer>;
        createParallelogramFace(inputs: Inputs.OCCT.ParallelogramDto): Promise<Inputs.OCCT.TopoDSFacePointer>;
        createHeartFace(inputs: Inputs.OCCT.Heart2DDto): Promise<Inputs.OCCT.TopoDSFacePointer>;
        createNGonFace(inputs: Inputs.OCCT.NGonWireDto): Promise<Inputs.OCCT.TopoDSFacePointer>;
        createIBeamProfileFace(inputs: Inputs.OCCT.IBeamProfileDto): Promise<Inputs.OCCT.TopoDSFacePointer>;
        createHBeamProfileFace(inputs: Inputs.OCCT.HBeamProfileDto): Promise<Inputs.OCCT.TopoDSFacePointer>;
        createTBeamProfileFace(inputs: Inputs.OCCT.TBeamProfileDto): Promise<Inputs.OCCT.TopoDSFacePointer>;
        createUBeamProfileFace(inputs: Inputs.OCCT.UBeamProfileDto): Promise<Inputs.OCCT.TopoDSFacePointer>;
        getFace(inputs: Inputs.OCCT.ShapeIndexDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSFacePointer>;
        getFaces(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSFacePointer[]>;
        reversedFace(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSFacePointer>;
        subdivideToPoints(inputs: Inputs.OCCT.FaceSubdivisionDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3[]>;
        subdivideToWires(inputs: Inputs.OCCT.FaceSubdivisionToWiresDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSWirePointer[]>;
        subdivideToRectangleWires(inputs: Inputs.OCCT.FaceSubdivideToRectangleWiresDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSWirePointer[]>;
        subdivideToRectangleHoles(inputs: Inputs.OCCT.FaceSubdivideToRectangleHolesDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSFacePointer[]>;
        subdivideToHexagonWires(inputs: Inputs.OCCT.FaceSubdivideToHexagonWiresDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSWirePointer[]>;
        subdivideToHexagonHoles(inputs: Inputs.OCCT.FaceSubdivideToHexagonHolesDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSFacePointer[]>;
        subdivideToPointsControlled(inputs: Inputs.OCCT.FaceSubdivisionControlledDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3[]>;
        subdivideToNormals(inputs: Inputs.OCCT.FaceSubdivisionDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Vector3[]>;
        subdivideToUV(inputs: Inputs.OCCT.FaceSubdivisionDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point2[]>;
        pointOnUV(inputs: Inputs.OCCT.DataOnUVDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3>;
        normalOnUV(inputs: Inputs.OCCT.DataOnUVDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Vector3>;
        pointsOnUVs(inputs: Inputs.OCCT.DataOnUVsDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3[]>;
        normalsOnUVs(inputs: Inputs.OCCT.DataOnUVsDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Vector3[]>;
        subdivideToPointsOnParam(inputs: Inputs.OCCT.FaceLinearSubdivisionDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3[]>;
        wireAlongParam(inputs: Inputs.OCCT.WireAlongParamDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSWirePointer>;
        wiresAlongParams(inputs: Inputs.OCCT.WiresAlongParamsDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSWirePointer[]>;
        getUMinBound(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<number>;
        getUMaxBound(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<number>;
        getVMinBound(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<number>;
        getVMaxBound(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<number>;
        getFaceArea(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<number>;
        getFacesAreas(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSFacePointer>): Promise<number[]>;
        getFaceCenterOfMass(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3>;
        getFacesCentersOfMass(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3[]>;
        filterFacePoints(inputs: Inputs.OCCT.FilterFacePointsDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3[]>;
        filterFacesPoints(inputs: Inputs.OCCT.FilterFacesPointsDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3[] | Inputs.Base.Point3[][]>;
    }
    declare class OCCTShape {
        private readonly occWorkerManager;
        constructor(occWorkerManager: OCCTWorkerManager);
        purgeInternalEdges(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        unifySameDomain(inputs: Inputs.OCCT.UnifySameDomainDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        isClosed(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<boolean>;
        isConvex(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<boolean>;
        isChecked(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<boolean>;
        isFree(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<boolean>;
        isInfinite(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<boolean>;
        isModified(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<boolean>;
        isLocked(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<boolean>;
        isNull(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<boolean>;
        isEqual(inputs: Inputs.OCCT.CompareShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<boolean>;
        isNotEqual(inputs: Inputs.OCCT.CompareShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<boolean>;
        isPartner(inputs: Inputs.OCCT.CompareShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<boolean>;
        isSame(inputs: Inputs.OCCT.CompareShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<boolean>;
        getOrientation(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.topAbsOrientationEnum>;
        getShapeType(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.shapeTypeEnum>;
    }
    declare class OCCTShapes {
        readonly vertex: OCCTVertex;
        readonly edge: OCCTEdge;
        readonly wire: OCCTWire;
        readonly face: OCCTFace;
        readonly shell: OCCTShell;
        readonly solid: OCCTSolid;
        readonly compound: OCCTCompound;
        readonly shape: OCCTShape;
        constructor(occWorkerManager: OCCTWorkerManager);
    }
    declare class OCCTShell {
        private readonly occWorkerManager;
        constructor(occWorkerManager: OCCTWorkerManager);
        sewFaces(inputs: Inputs.OCCT.SewDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSShellPointer>;
        getShellSurfaceArea(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShellPointer>): Promise<number>;
    }
    declare class OCCTSolid {
        private readonly occWorkerManager;
        constructor(occWorkerManager: OCCTWorkerManager);
        fromClosedShell(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShellPointer>): Promise<Inputs.OCCT.TopoDSSolidPointer>;
        createBox(inputs: Inputs.OCCT.BoxDto): Promise<Inputs.OCCT.TopoDSSolidPointer>;
        createCube(inputs: Inputs.OCCT.CubeDto): Promise<Inputs.OCCT.TopoDSSolidPointer>;
        createBoxFromCorner(inputs: Inputs.OCCT.BoxFromCornerDto): Promise<Inputs.OCCT.TopoDSSolidPointer>;
        createCylinder(inputs: Inputs.OCCT.CylinderDto): Promise<Inputs.OCCT.TopoDSSolidPointer>;
        createCylindersOnLines(inputs: Inputs.OCCT.CylindersOnLinesDto): Promise<Inputs.OCCT.TopoDSSolidPointer[]>;
        createSphere(inputs: Inputs.OCCT.SphereDto): Promise<Inputs.OCCT.TopoDSSolidPointer>;
        createCone(inputs: Inputs.OCCT.ConeDto): Promise<Inputs.OCCT.TopoDSSolidPointer>;
        createStarSolid(inputs: Inputs.OCCT.StarSolidDto): Promise<Inputs.OCCT.TopoDSSolidPointer>;
        createNGonSolid(inputs: Inputs.OCCT.NGonSolidDto): Promise<Inputs.OCCT.TopoDSSolidPointer>;
        createParallelogramSolid(inputs: Inputs.OCCT.ParallelogramSolidDto): Promise<Inputs.OCCT.TopoDSSolidPointer>;
        createHeartSolid(inputs: Inputs.OCCT.HeartSolidDto): Promise<Inputs.OCCT.TopoDSSolidPointer>;
        createChristmasTreeSolid(inputs: Inputs.OCCT.ChristmasTreeSolidDto): Promise<Inputs.OCCT.TopoDSSolidPointer>;
        createLPolygonSolid(inputs: Inputs.OCCT.LPolygonSolidDto): Promise<Inputs.OCCT.TopoDSSolidPointer>;
        createIBeamProfileSolid(inputs: Inputs.OCCT.IBeamProfileSolidDto): Promise<Inputs.OCCT.TopoDSSolidPointer>;
        createHBeamProfileSolid(inputs: Inputs.OCCT.HBeamProfileSolidDto): Promise<Inputs.OCCT.TopoDSSolidPointer>;
        createTBeamProfileSolid(inputs: Inputs.OCCT.TBeamProfileSolidDto): Promise<Inputs.OCCT.TopoDSSolidPointer>;
        createUBeamProfileSolid(inputs: Inputs.OCCT.UBeamProfileSolidDto): Promise<Inputs.OCCT.TopoDSSolidPointer>;
        getSolidSurfaceArea(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSSolidPointer>): Promise<number>;
        getSolidVolume(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSSolidPointer>): Promise<number>;
        getSolidsVolumes(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSSolidPointer>): Promise<number[]>;
        getSolidCenterOfMass(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSSolidPointer>): Promise<Inputs.Base.Point3>;
        getSolidsCentersOfMass(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSSolidPointer>): Promise<Inputs.Base.Point3[]>;
        getSolids(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSSolidPointer[]>;
        filterSolidPoints(inputs: Inputs.OCCT.FilterSolidPointsDto<Inputs.OCCT.TopoDSSolidPointer>): Promise<Inputs.Base.Point3[]>;
    }
    declare class OCCTVertex {
        private readonly occWorkerManager;
        constructor(occWorkerManager: OCCTWorkerManager);
        vertexFromXYZ(inputs: Inputs.OCCT.XYZDto): Promise<Inputs.OCCT.TopoDSVertexPointer>;
        vertexFromPoint(inputs: Inputs.OCCT.PointDto): Promise<Inputs.OCCT.TopoDSVertexPointer>;
        verticesFromPoints(inputs: Inputs.OCCT.PointsDto): Promise<Inputs.OCCT.TopoDSVertexPointer[]>;
        verticesCompoundFromPoints(inputs: Inputs.OCCT.PointsDto): Promise<Inputs.OCCT.TopoDSCompoundPointer>;
        getVertices(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSVertexPointer[]>;
        getVerticesAsPoints(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.Base.Point3[]>;
        verticesToPoints(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSVertexPointer>): Promise<Inputs.Base.Point3[]>;
        vertexToPoint(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSVertexPointer>): Promise<Inputs.Base.Point3>;
        projectPoints(inputs: Inputs.OCCT.ProjectPointsOnShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.Base.Point3[]>;
    }
    declare class OCCTWire {
        private readonly occWorkerManager;
        constructor(occWorkerManager: OCCTWorkerManager);
        fromBaseLine(inputs: Inputs.OCCT.LineBaseDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
        fromBaseLines(inputs: Inputs.OCCT.LineBaseDto): Promise<Inputs.OCCT.TopoDSWirePointer[]>;
        fromBaseSegment(inputs: Inputs.OCCT.SegmentBaseDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
        fromBaseSegments(inputs: Inputs.OCCT.SegmentsBaseDto): Promise<Inputs.OCCT.TopoDSWirePointer[]>;
        fromPoints(inputs: Inputs.OCCT.PointsDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
        fromBasePolyline(inputs: Inputs.OCCT.PolylineBaseDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
        fromBaseTriangle(inputs: Inputs.OCCT.TriangleBaseDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
        fromBaseMesh(inputs: Inputs.OCCT.MeshBaseDto): Promise<Inputs.OCCT.TopoDSWirePointer[]>;
        createPolygonWire(inputs: Inputs.OCCT.PolygonDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
        createPolygons(inputs: Inputs.OCCT.PolygonsDto): Promise<Inputs.OCCT.TopoDSWirePointer[] | Inputs.OCCT.TopoDSCompoundPointer>;
        createLineWire(inputs: Inputs.OCCT.LineDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
        createLineWireWithExtensions(inputs: Inputs.OCCT.LineWithExtensionsDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
        createLines(inputs: Inputs.OCCT.LinesDto): Promise<Inputs.OCCT.TopoDSWirePointer[] | Inputs.OCCT.TopoDSCompoundPointer>;
        splitOnPoints(inputs: Inputs.OCCT.SplitWireOnPointsDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSWirePointer[]>;
        wiresToPoints(inputs: Inputs.OCCT.WiresToPointsDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.Base.Point3[][]>;
        createPolylineWire(inputs: Inputs.OCCT.PolylineDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
        createZigZagBetweenTwoWires(inputs: Inputs.OCCT.ZigZagBetweenTwoWiresDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSWirePointer>;
        createWireFromTwoCirclesTan(inputs: Inputs.OCCT.WireFromTwoCirclesTanDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSWirePointer>;
        createPolylines(inputs: Inputs.OCCT.PolylinesDto): Promise<Inputs.OCCT.TopoDSWirePointer[] | Inputs.OCCT.TopoDSCompoundPointer>;
        createBezier(inputs: Inputs.OCCT.BezierDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
        createBezierWeights(inputs: Inputs.OCCT.BezierWeightsDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
        createBezierWires(inputs: Inputs.OCCT.BezierWiresDto): Promise<Inputs.OCCT.TopoDSWirePointer[] | Inputs.OCCT.TopoDSCompoundPointer>;
        interpolatePoints(inputs: Inputs.OCCT.InterpolationDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
        interpolateWires(inputs: Inputs.OCCT.InterpolateWiresDto): Promise<Inputs.OCCT.TopoDSWirePointer[] | Inputs.OCCT.TopoDSCompoundPointer>;
        createBSpline(inputs: Inputs.OCCT.BSplineDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
        createBSplines(inputs: Inputs.OCCT.BSplinesDto): Promise<Inputs.OCCT.TopoDSWirePointer[] | Inputs.OCCT.TopoDSCompoundPointer>;
        combineEdgesAndWiresIntoAWire(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSWirePointer | Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.OCCT.TopoDSWirePointer>;
        createWireFromEdge(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.OCCT.TopoDSWirePointer>;
        addEdgesAndWiresToWire(inputs: Inputs.OCCT.ShapeShapesDto<Inputs.OCCT.TopoDSWirePointer, Inputs.OCCT.TopoDSWirePointer | Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.OCCT.TopoDSWirePointer>;
        divideWireByParamsToPoints(inputs: Inputs.OCCT.DivideDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3[]>;
        divideWiresByParamsToPoints(inputs: Inputs.OCCT.DivideShapesDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3[][]>;
        divideWireByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3[]>;
        divideWiresByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideShapesDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3[]>;
        pointOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3>;
        pointOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3>;
        pointsOnWireAtLengths(inputs: Inputs.OCCT.DataOnGeometryAtLengthsDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3>;
        pointsOnWireAtEqualLength(inputs: Inputs.OCCT.PointsOnWireAtEqualLengthDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3>;
        pointsOnWireAtPatternOfLengths(inputs: Inputs.OCCT.PointsOnWireAtPatternOfLengthsDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3>;
        tangentOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Vector3>;
        tangentOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Vector3>;
        derivativesOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<Inputs.OCCT.TopoDSWirePointer>): Promise<[
            Inputs.Base.Vector3,
            Inputs.Base.Vector3,
            Inputs.Base.Vector3
        ]>;
        derivativesOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Inputs.OCCT.TopoDSWirePointer>): Promise<[
            Inputs.Base.Vector3,
            Inputs.Base.Vector3,
            Inputs.Base.Vector3
        ]>;
        startPointOnWire(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3>;
        midPointOnWire(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3>;
        endPointOnWire(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3>;
        createCircleWire(inputs: Inputs.OCCT.CircleDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
        hexagonsInGrid(inputs: Inputs.OCCT.HexagonsInGridDto): Promise<Inputs.OCCT.TopoDSWirePointer[]>;
        createSquareWire(inputs: Inputs.OCCT.SquareDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
        createStarWire(inputs: Inputs.OCCT.StarDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
        createChristmasTreeWire(inputs: Inputs.OCCT.ChristmasTreeDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
        createNGonWire(inputs: Inputs.OCCT.NGonWireDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
        createParallelogramWire(inputs: Inputs.OCCT.ParallelogramDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
        createHeartWire(inputs: Inputs.OCCT.Heart2DDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
        createRectangleWire(inputs: Inputs.OCCT.RectangleDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
        createLPolygonWire(inputs: Inputs.OCCT.LPolygonDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
        createIBeamProfileWire(inputs: Inputs.OCCT.IBeamProfileDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
        createHBeamProfileWire(inputs: Inputs.OCCT.HBeamProfileDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
        createTBeamProfileWire(inputs: Inputs.OCCT.TBeamProfileDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
        createUBeamProfileWire(inputs: Inputs.OCCT.UBeamProfileDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
        createEllipseWire(inputs: Inputs.OCCT.EllipseDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
        textWires(inputs: Inputs.OCCT.TextWiresDto): Promise<Inputs.OCCT.TopoDSWirePointer[]>;
        textWiresWithData(inputs: Inputs.OCCT.TextWiresDto): Promise<Models.OCCT.TextWiresDataDto<Inputs.OCCT.TopoDSCompoundPointer>>;
        getWire(inputs: Inputs.OCCT.ShapeIndexDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSWirePointer>;
        getWires(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSWirePointer[]>;
        getWireCenterOfMass(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3>;
        getWiresCentersOfMass(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3[]>;
        reversedWire(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSWirePointer>;
        reversedWireFromReversedEdges(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSWirePointer>;
        isWireClosed(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<boolean>;
        getWireLength(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<number>;
        getWiresLengths(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSWirePointer>): Promise<number[]>;
        placeWireOnFace(inputs: Inputs.OCCT.WireOnFaceDto<Inputs.OCCT.TopoDSWirePointer, Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSWirePointer>;
        placeWiresOnFace(inputs: Inputs.OCCT.WiresOnFaceDto<Inputs.OCCT.TopoDSWirePointer, Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSWirePointer[]>;
        closeOpenWire(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSWirePointer>;
        project(inputs: Inputs.OCCT.ProjectWireDto<Inputs.OCCT.TopoDSWirePointer, Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSCompoundPointer>;
        projectWires(inputs: Inputs.OCCT.ProjectWiresDto<Inputs.OCCT.TopoDSWirePointer, Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSCompoundPointer[]>;
    }
    declare class OCCTTransforms {
        private readonly occWorkerManager;
        constructor(occWorkerManager: OCCTWorkerManager);
        transform(inputs: Inputs.OCCT.TransformDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        rotate(inputs: Inputs.OCCT.RotateDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        rotateAroundCenter(inputs: Inputs.OCCT.RotateAroundCenterDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        align(inputs: Inputs.OCCT.AlignDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        alignNormAndAxis(inputs: Inputs.OCCT.AlignNormAndAxisDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        alignAndTranslate(inputs: Inputs.OCCT.AlignAndTranslateDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        translate(inputs: Inputs.OCCT.TranslateDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        scale(inputs: Inputs.OCCT.ScaleDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        scale3d(inputs: Inputs.OCCT.Scale3DDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        mirror(inputs: Inputs.OCCT.MirrorDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        mirrorAlongNormal(inputs: Inputs.OCCT.MirrorAlongNormalDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
        transformShapes(inputs: Inputs.OCCT.TransformShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
        rotateShapes(inputs: Inputs.OCCT.RotateShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
        rotateAroundCenterShapes(inputs: Inputs.OCCT.RotateAroundCenterShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
        alignShapes(inputs: Inputs.OCCT.AlignShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
        alignAndTranslateShapes(inputs: Inputs.OCCT.AlignAndTranslateShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
        translateShapes(inputs: Inputs.OCCT.TranslateShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
        scaleShapes(inputs: Inputs.OCCT.ScaleShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
        scale3dShapes(inputs: Inputs.OCCT.Scale3DShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
        mirrorShapes(inputs: Inputs.OCCT.MirrorShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
        mirrorAlongNormalShapes(inputs: Inputs.OCCT.MirrorAlongNormalShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
    }
    declare class Babylon {
        mesh: BabylonMesh;
        gaussianSplatting: BabylonGaussianSplatting;
        camera: BabylonCamera;
        webXr: BabylonWebXR;
        node: BabylonNode;
        engine: BabylonEngine;
        scene: BabylonScene;
        transforms: BabylonTransforms;
        io: BabylonIO;
        ray: BabylonRay;
        pick: BabylonPick;
        material: BabylonMaterial;
        lights: BabylonLights;
        meshBuilder: BabylonMeshBuilder;
        texture: BabylonTexture;
        tools: BabylonTools;
        gui: BabylonGui;
        gizmo: BabylonGizmo;
        constructor(context: Context, drawHelper: DrawHelper, color: Color);
    }
    declare class BabylonArcRotateCamera {
        private readonly context;
        constructor(context: Context);
        create(inputs: Inputs.BabylonCamera.ArcRotateCameraDto): BABYLON.ArcRotateCamera;
        private getRadians;
    }
    declare class BabylonCamera {
        private readonly context;
        free: BabylonFreeCamera;
        arcRotate: BabylonArcRotateCamera;
        target: BabylonTargetCamera;
        constructor(context: Context);
        freezeProjectionMatrix(inputs: Inputs.BabylonCamera.CameraDto): void;
        unfreezeProjectionMatrix(inputs: Inputs.BabylonCamera.CameraDto): void;
        setPosition(inputs: Inputs.BabylonCamera.PositionDto): void;
        getPosition(inputs: Inputs.BabylonCamera.PositionDto): Base.Point3;
        setTarget(inputs: Inputs.BabylonCamera.TargetDto): void;
        getTarget(inputs: Inputs.BabylonCamera.PositionDto): Base.Point3;
        setSpeed(inputs: Inputs.BabylonCamera.SpeedDto): void;
        getSpeed(inputs: Inputs.BabylonCamera.PositionDto): Base.Point3;
        setMinZ(inputs: Inputs.BabylonCamera.MinZDto): void;
        setMaxZ(inputs: Inputs.BabylonCamera.MaxZDto): void;
        makeCameraOrthographic(inputs: Inputs.BabylonCamera.OrthographicDto): void;
        makeCameraPerspective(inputs: Inputs.BabylonCamera.CameraDto): void;
    }
    declare class BabylonFreeCamera {
        private readonly context;
        constructor(context: Context);
        create(inputs: Inputs.BabylonCamera.FreeCameraDto): BABYLON.FreeCamera;
    }
    declare class BabylonTargetCamera {
        private readonly context;
        constructor(context: Context);
        create(inputs: Inputs.BabylonCamera.TargetCameraDto): BABYLON.TargetCamera;
    }
    declare class BabylonEngine {
        private readonly context;
        constructor(context: Context);
        getEngine(): BABYLON.Engine | BABYLON.WebGPUEngine;
        getRenderingCanvas(): HTMLCanvasElement;
    }
    declare class BabylonGaussianSplatting {
        private readonly context;
        constructor(context: Context);
        create(inputs: Inputs.BabylonGaussianSplatting.CreateGaussianSplattingMeshDto): Promise<BABYLON.GaussianSplattingMesh>;
        clone(inputs: Inputs.BabylonGaussianSplatting.GaussianSplattingMeshDto): BABYLON.GaussianSplattingMesh;
        getSplatPositions(inputs: Inputs.BabylonGaussianSplatting.GaussianSplattingMeshDto): Inputs.Base.Point3[];
        private enableShadows;
    }
    declare class BabylonGizmoAxisDragGizmo {
        private readonly context;
        constructor(context: Context);
        setIsEnabled(inputs: Inputs.BabylonGizmo.SetIsEnabledAxisDragGizmoDto): BABYLON.IAxisDragGizmo;
        getIsEnabled(inputs: Inputs.BabylonGizmo.AxisDragGizmoDto): boolean;
    }
    declare class BabylonGizmoAxisScaleGizmo {
        private readonly context;
        constructor(context: Context);
        setIsEnabled(inputs: Inputs.BabylonGizmo.SetIsEnabledAxisScaleGizmoDto): BABYLON.IAxisScaleGizmo;
        getIsEnabled(inputs: Inputs.BabylonGizmo.AxisScaleGizmoDto): boolean;
    }
    declare class BabylonGizmoBoundingBoxGizmo {
        private readonly context;
        constructor(context: Context);
        setRotationSphereSize(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoRotationSphereSizeDto): BABYLON.BoundingBoxGizmo;
        setFixedDragMeshScreenSize(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoFixedDragMeshScreenSizeDto): BABYLON.BoundingBoxGizmo;
        setFixedDragMeshBoundsSize(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoFixedDragMeshBoundsSizeDto): BABYLON.BoundingBoxGizmo;
        setFixedDragMeshScreenSizeDistanceFactor(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoFixedDragMeshScreenSizeDistanceFactorDto): BABYLON.BoundingBoxGizmo;
        setScalingSnapDistance(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoScalingSnapDistanceDto): BABYLON.BoundingBoxGizmo;
        setRotationSnapDistance(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoRotationSnapDistanceDto): BABYLON.BoundingBoxGizmo;
        setScaleBoxSize(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoScaleBoxSizeDto): BABYLON.BoundingBoxGizmo;
        setIncrementalSnap(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoIncrementalSnapDto): BABYLON.BoundingBoxGizmo;
        setScalePivot(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoScalePivotDto): BABYLON.BoundingBoxGizmo;
        setAxisFactor(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoAxisFactorDto): BABYLON.BoundingBoxGizmo;
        setScaleDragSpeed(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoScaleDragSpeedDto): BABYLON.BoundingBoxGizmo;
        getRotationSphereSize(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): number;
        getScaleBoxSize(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): number;
        getFixedDragMeshScreenSize(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): boolean;
        getFixedDragMeshBoundsSize(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): boolean;
        getFixedDragMeshScreenSizeDistanceFactor(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): number;
        getScalingSnapDistance(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): number;
        getRotationSnapDistance(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): number;
        getIncrementalSnap(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): boolean;
        getScalePivot(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): Inputs.Base.Vector3;
        getAxisFactor(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): Inputs.Base.Vector3;
        getScaleDragSpeed(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): number;
        createBoundingBoxGizmoObservableSelector(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoObservableSelectorDto): Inputs.BabylonGizmo.boundingBoxGizmoObservableSelectorEnum;
    }
    declare class BabylonGizmoBase {
        private readonly context;
        constructor(context: Context);
        scaleRatio(inputs: Inputs.BabylonGizmo.SetGizmoScaleRatioDto): BABYLON.IGizmo;
        getScaleRatio(inputs: Inputs.BabylonGizmo.GizmoDto): number;
    }
    declare class BabylonGizmo {
        private readonly context;
        manager: BabylonGizmoManager;
        base: BabylonGizmoBase;
        positionGizmo: BabylonGizmoPositionGizmo;
        rotationGizmo: BabylonGizmoRotationGizmo;
        scaleGizmo: BabylonGizmoScaleGizmo;
        boundingBoxGizmo: BabylonGizmoBoundingBoxGizmo;
        axisDragGizmo: BabylonGizmoAxisDragGizmo;
        axisScaleGizmo: BabylonGizmoAxisScaleGizmo;
        planeDragGizmo: BabylonGizmoPlaneDragGizmo;
        planeRotationGizmo: BabylonGizmoPlaneRotationGizmo;
        constructor(context: Context);
    }
    declare class BabylonGizmoManager {
        private readonly context;
        constructor(context: Context);
        createGizmoManager(inputs: Inputs.BabylonGizmo.CreateGizmoDto): BABYLON.GizmoManager;
        getPositionGizmo(inputs: Inputs.BabylonGizmo.GizmoManagerDto): BABYLON.IPositionGizmo;
        getRotationGizmo(inputs: Inputs.BabylonGizmo.GizmoManagerDto): BABYLON.IRotationGizmo;
        getScaleGizmo(inputs: Inputs.BabylonGizmo.GizmoManagerDto): BABYLON.IScaleGizmo;
        getBoundingBoxGizmo(inputs: Inputs.BabylonGizmo.GizmoManagerDto): BABYLON.IBoundingBoxGizmo;
        attachToMesh(inputs: Inputs.BabylonGizmo.AttachToMeshDto): BABYLON.GizmoManager;
        detachMesh(inputs: Inputs.BabylonGizmo.GizmoManagerDto): BABYLON.GizmoManager;
    }
    declare class BabylonGizmoPlaneDragGizmo {
        private readonly context;
        constructor(context: Context);
        setIsEnabled(inputs: Inputs.BabylonGizmo.SetIsEnabledPlaneDragGizmoDto): BABYLON.IPlaneDragGizmo;
        getIsEnabled(inputs: Inputs.BabylonGizmo.PlaneDragGizmoDto): boolean;
    }
    declare class BabylonGizmoPlaneRotationGizmo {
        private readonly context;
        constructor(context: Context);
        setIsEnabled(inputs: Inputs.BabylonGizmo.SetIsEnabledPlaneRotationGizmoDto): BABYLON.IPlaneRotationGizmo;
        getIsEnabled(inputs: Inputs.BabylonGizmo.PlaneRotationGizmoDto): boolean;
    }
    declare class BabylonGizmoPositionGizmo {
        private readonly context;
        constructor(context: Context);
        planarGizmoEnabled(inputs: Inputs.BabylonGizmo.SetPlanarGizmoEnabled): BABYLON.IPositionGizmo;
        snapDistance(inputs: Inputs.BabylonGizmo.SetPositionGizmoSnapDistanceDto): BABYLON.IPositionGizmo;
        getAttachedMesh(inputs: Inputs.BabylonGizmo.PositionGizmoDto): BABYLON.AbstractMesh;
        getAttachedNode(inputs: Inputs.BabylonGizmo.PositionGizmoDto): BABYLON.Node;
        getXGizmo(inputs: Inputs.BabylonGizmo.PositionGizmoDto): BABYLON.IAxisDragGizmo;
        getYGizmo(inputs: Inputs.BabylonGizmo.PositionGizmoDto): BABYLON.IAxisDragGizmo;
        getZGizmo(inputs: Inputs.BabylonGizmo.PositionGizmoDto): BABYLON.IAxisDragGizmo;
        getXPlaneGizmo(inputs: Inputs.BabylonGizmo.PositionGizmoDto): BABYLON.IPlaneDragGizmo;
        getYPlaneGizmo(inputs: Inputs.BabylonGizmo.PositionGizmoDto): BABYLON.IPlaneDragGizmo;
        getZPlaneGizmo(inputs: Inputs.BabylonGizmo.PositionGizmoDto): BABYLON.IPlaneDragGizmo;
        getPlanarGizmoEnabled(inputs: Inputs.BabylonGizmo.PositionGizmoDto): boolean;
        getSnapDistance(inputs: Inputs.BabylonGizmo.PositionGizmoDto): number;
        getIsDragging(inputs: Inputs.BabylonGizmo.PositionGizmoDto): boolean;
        createPositionGizmoObservableSelector(inputs: Inputs.BabylonGizmo.PositionGizmoObservableSelectorDto): Inputs.BabylonGizmo.positionGizmoObservableSelectorEnum;
    }
    declare class BabylonGizmoRotationGizmo {
        private readonly context;
        constructor(context: Context);
        snapDistance(inputs: Inputs.BabylonGizmo.SetRotationGizmoSnapDistanceDto): BABYLON.IRotationGizmo;
        sensitivity(inputs: Inputs.BabylonGizmo.SetRotationGizmoSensitivityDto): BABYLON.IRotationGizmo;
        getAttachedMesh(inputs: Inputs.BabylonGizmo.RotationGizmoDto): BABYLON.Nullable<BABYLON.AbstractMesh>;
        getAttachedNode(inputs: Inputs.BabylonGizmo.RotationGizmoDto): BABYLON.Node;
        getXGizmo(inputs: Inputs.BabylonGizmo.RotationGizmoDto): BABYLON.IPlaneRotationGizmo;
        getYGizmo(inputs: Inputs.BabylonGizmo.RotationGizmoDto): BABYLON.IPlaneRotationGizmo;
        getZGizmo(inputs: Inputs.BabylonGizmo.RotationGizmoDto): BABYLON.IPlaneRotationGizmo;
        getSnapDistance(inputs: Inputs.BabylonGizmo.RotationGizmoDto): number;
        getSensitivity(inputs: Inputs.BabylonGizmo.RotationGizmoDto): number;
        createRotationGizmoObservableSelector(inputs: Inputs.BabylonGizmo.RotationGizmoObservableSelectorDto): Inputs.BabylonGizmo.rotationGizmoObservableSelectorEnum;
    }
    declare class BabylonGizmoScaleGizmo {
        private readonly context;
        constructor(context: Context);
        getXGizmo(inputs: Inputs.BabylonGizmo.ScaleGizmoDto): BABYLON.IAxisScaleGizmo;
        getYGizmo(inputs: Inputs.BabylonGizmo.ScaleGizmoDto): BABYLON.IAxisScaleGizmo;
        getZGizmo(inputs: Inputs.BabylonGizmo.ScaleGizmoDto): BABYLON.IAxisScaleGizmo;
        snapDistance(inputs: Inputs.BabylonGizmo.SetScaleGizmoSnapDistanceDto): BABYLON.IScaleGizmo;
        setIncrementalSnap(inputs: Inputs.BabylonGizmo.SetScaleGizmoIncrementalSnapDto): BABYLON.IScaleGizmo;
        sensitivity(inputs: Inputs.BabylonGizmo.SetScaleGizmoSensitivityDto): BABYLON.IScaleGizmo;
        getIncrementalSnap(inputs: Inputs.BabylonGizmo.ScaleGizmoDto): boolean;
        getSnapDistance(inputs: Inputs.BabylonGizmo.ScaleGizmoDto): number;
        getSensitivity(inputs: Inputs.BabylonGizmo.ScaleGizmoDto): number;
        createScaleGizmoObservableSelector(inputs: Inputs.BabylonGizmo.ScaleGizmoObservableSelectorDto): Inputs.BabylonGizmo.scaleGizmoObservableSelectorEnum;
    }
    declare class BabylonGuiAdvancedDynamicTexture {
        private readonly context;
        constructor(context: Context);
        createFullScreenUI(inputs: Inputs.BabylonGui.CreateFullScreenUIDto): BABYLON.GUI.AdvancedDynamicTexture;
        createForMesh(inputs: Inputs.BabylonGui.CreateForMeshDto): BABYLON.GUI.AdvancedDynamicTexture;
    }
    declare class BabylonGuiButton {
        private readonly context;
        constructor(context: Context);
        createSimpleButton(inputs: Inputs.BabylonGui.CreateButtonDto): BABYLON.GUI.Button;
        setButtonText(inputs: Inputs.BabylonGui.SetButtonTextDto): BABYLON.GUI.Button;
        getButtonText(inputs: Inputs.BabylonGui.ButtonDto): string;
    }
    declare class BabylonGuiCheckbox {
        private readonly context;
        constructor(context: Context);
        createCheckbox(inputs: Inputs.BabylonGui.CreateCheckboxDto): BABYLON.GUI.Checkbox;
        setBackground(inputs: Inputs.BabylonGui.SetCheckboxBackgroundDto): BABYLON.GUI.Checkbox;
        setCheckSizeRatio(inputs: Inputs.BabylonGui.SetCheckboxCheckSizeRatioDto): BABYLON.GUI.Checkbox;
        setIsChecked(inputs: Inputs.BabylonGui.SetCheckboxIsCheckedDto): BABYLON.GUI.Checkbox;
        getCheckSizeRatio(inputs: Inputs.BabylonGui.CheckboxDto): number;
        getIsChecked(inputs: Inputs.BabylonGui.CheckboxDto): boolean;
        getBackground(inputs: Inputs.BabylonGui.CheckboxDto): string;
        createCheckboxObservableSelector(inputs: Inputs.BabylonGui.CheckboxObservableSelectorDto): Inputs.BabylonGui.checkboxObservableSelectorEnum;
    }
    declare class BabylonGuiColorPicker {
        private readonly context;
        constructor(context: Context);
        createColorPicker(inputs: Inputs.BabylonGui.CreateColorPickerDto): BABYLON.GUI.ColorPicker;
        setColorPickerValue(inputs: Inputs.BabylonGui.SetColorPickerValueDto): BABYLON.GUI.ColorPicker;
        setColorPickerSize(inputs: Inputs.BabylonGui.SetColorPickerSizeDto): BABYLON.GUI.ColorPicker;
        getColorPickerValue(inputs: Inputs.BabylonGui.ColorPickerDto): string;
        getColorPickerSize(inputs: Inputs.BabylonGui.ColorPickerDto): string | number;
        createColorPickerObservableSelector(inputs: Inputs.BabylonGui.ColorPickerObservableSelectorDto): Inputs.BabylonGui.colorPickerObservableSelectorEnum;
    }
    declare class BabylonGuiContainer {
        private readonly context;
        constructor(context: Context);
        addControls(inputs: Inputs.BabylonGui.AddControlsToContainerDto): BABYLON.GUI.Container;
        setBackground(inputs: Inputs.BabylonGui.SetContainerBackgroundDto): BABYLON.GUI.Container;
        setIsReadonly(inputs: Inputs.BabylonGui.SetContainerIsReadonlyDto): BABYLON.GUI.Container;
        getBackground(inputs: Inputs.BabylonGui.ContainerDto): string;
        getIsReadonly(inputs: Inputs.BabylonGui.ContainerDto): boolean;
    }
    declare class BabylonGuiControl {
        private readonly context;
        constructor(context: Context);
        changeControlPadding(inputs: Inputs.BabylonGui.PaddingLeftRightTopBottomDto): BABYLON.GUI.Control;
        changeControlAlignment(inputs: Inputs.BabylonGui.AlignmentDto<BABYLON.GUI.Control>): BABYLON.GUI.Control;
        cloneControl(inputs: Inputs.BabylonGui.CloneControlDto): BABYLON.GUI.Control;
        createControlObservableSelector(inputs: Inputs.BabylonGui.ControlObservableSelectorDto): Inputs.BabylonGui.controlObservableSelectorEnum;
        getControlByName(inputs: Inputs.BabylonGui.GetControlByNameDto): BABYLON.GUI.Control;
        setIsVisible(inputs: Inputs.BabylonGui.SetControlIsVisibleDto): BABYLON.GUI.Control;
        setIsReadonly(inputs: Inputs.BabylonGui.SetControlIsReadonlyDto): BABYLON.GUI.Control;
        setIsEnabled(inputs: Inputs.BabylonGui.SetControlIsEnabledDto): BABYLON.GUI.Control;
        setHeight(inputs: Inputs.BabylonGui.SetControlHeightDto): BABYLON.GUI.Control;
        setWidth(inputs: Inputs.BabylonGui.SetControlWidthDto): BABYLON.GUI.Control;
        setColor(inputs: Inputs.BabylonGui.SetControlColorDto): BABYLON.GUI.Control;
        setFontSize(inputs: Inputs.BabylonGui.SetControlFontSizeDto): BABYLON.GUI.Control;
        getHeight(inputs: Inputs.BabylonGui.ControlDto): string | number;
        getWidth(inputs: Inputs.BabylonGui.ControlDto): string | number;
        getColor(inputs: Inputs.BabylonGui.ControlDto): string;
        getFontSize(inputs: Inputs.BabylonGui.ControlDto): string | number;
        getIsVisible(inputs: Inputs.BabylonGui.ControlDto): boolean;
        getIsReadonly(inputs: Inputs.BabylonGui.ControlDto): boolean;
        getIsEnabled(inputs: Inputs.BabylonGui.ControlDto): boolean;
    }
    declare class BabylonGui {
        private readonly context;
        advancedDynamicTexture: BabylonGuiAdvancedDynamicTexture;
        control: BabylonGuiControl;
        container: BabylonGuiContainer;
        stackPanel: BabylonGuiStackPanel;
        button: BabylonGuiButton;
        slider: BabylonGuiSlider;
        textBlock: BabylonGuiTextBlock;
        radioButton: BabylonGuiRadioButton;
        checkbox: BabylonGuiCheckbox;
        inputText: BabylonGuiInputText;
        colorPicker: BabylonGuiColorPicker;
        image: BabylonGuiImage;
        constructor(context: Context);
    }
    declare class BabylonGuiImage {
        private readonly context;
        constructor(context: Context);
        createImage(inputs: Inputs.BabylonGui.CreateImageDto): BABYLON.GUI.Image;
        setSourceUrl(inputs: Inputs.BabylonGui.SetImageUrlDto): BABYLON.GUI.Image;
        getSourceUrl(inputs: Inputs.BabylonGui.ImageDto): string;
    }
    declare class BabylonGuiInputText {
        private readonly context;
        constructor(context: Context);
        createInputText(inputs: Inputs.BabylonGui.CreateInputTextDto): BABYLON.GUI.InputText;
        setBackground(inputs: Inputs.BabylonGui.SetInputTextBackgroundDto): BABYLON.GUI.InputText;
        setText(inputs: Inputs.BabylonGui.SetInputTextTextDto): BABYLON.GUI.InputText;
        setPlaceholder(inputs: Inputs.BabylonGui.SetInputTextPlaceholderDto): BABYLON.GUI.InputText;
        getBackground(inputs: Inputs.BabylonGui.InputTextDto): string;
        getText(inputs: Inputs.BabylonGui.InputTextDto): string;
        getPlaceholder(inputs: Inputs.BabylonGui.InputTextDto): string;
        createInputTextObservableSelector(inputs: Inputs.BabylonGui.InputTextObservableSelectorDto): Inputs.BabylonGui.inputTextObservableSelectorEnum;
    }
    declare class BabylonGuiRadioButton {
        private readonly context;
        constructor(context: Context);
        createRadioButton(inputs: Inputs.BabylonGui.CreateRadioButtonDto): BABYLON.GUI.RadioButton;
        setCheckSizeRatio(inputs: Inputs.BabylonGui.SetRadioButtonCheckSizeRatioDto): BABYLON.GUI.RadioButton;
        setGroup(inputs: Inputs.BabylonGui.SetRadioButtonGroupDto): BABYLON.GUI.RadioButton;
        setBackground(inputs: Inputs.BabylonGui.SetRadioButtonBackgroundDto): BABYLON.GUI.RadioButton;
        getCheckSizeRatio(inputs: Inputs.BabylonGui.RadioButtonDto): number;
        getGroup(inputs: Inputs.BabylonGui.RadioButtonDto): string;
        getBackground(inputs: Inputs.BabylonGui.RadioButtonDto): string;
        createRadioButtonObservableSelector(inputs: Inputs.BabylonGui.RadioButtonObservableSelectorDto): Inputs.BabylonGui.radioButtonObservableSelectorEnum;
    }
    declare class BabylonGuiSlider {
        private readonly context;
        constructor(context: Context);
        createSlider(inputs: Inputs.BabylonGui.CreateSliderDto): BABYLON.GUI.Slider;
        changeSliderThumb(inputs: Inputs.BabylonGui.SliderThumbDto): BABYLON.GUI.Slider;
        setBorderColor(inputs: Inputs.BabylonGui.SliderBorderColorDto): BABYLON.GUI.Slider;
        setBackgroundColor(inputs: Inputs.BabylonGui.SliderBackgroundColorDto): BABYLON.GUI.Slider;
        setMaximum(inputs: Inputs.BabylonGui.SetSliderValueDto): BABYLON.GUI.Slider;
        setMinimum(inputs: Inputs.BabylonGui.SetSliderValueDto): BABYLON.GUI.Slider;
        setStep(inputs: Inputs.BabylonGui.SetSliderValueDto): BABYLON.GUI.Slider;
        setValue(inputs: Inputs.BabylonGui.SetSliderValueDto): BABYLON.GUI.Slider;
        createSliderObservableSelector(inputs: Inputs.BabylonGui.SliderObservableSelectorDto): Inputs.BabylonGui.sliderObservableSelectorEnum;
        getBorderColor(inputs: Inputs.BabylonGui.SliderDto): string;
        getBackgroundColor(inputs: Inputs.BabylonGui.SliderDto): string;
        getMaximum(inputs: Inputs.BabylonGui.SliderDto): number;
        getMinimum(inputs: Inputs.BabylonGui.SliderDto): number;
        getStep(inputs: Inputs.BabylonGui.SliderDto): number;
        getValue(inputs: Inputs.BabylonGui.SliderDto): number;
        getThumbColor(inputs: Inputs.BabylonGui.SliderDto): string;
        getThumbWidth(inputs: Inputs.BabylonGui.SliderDto): string | number;
        getIsVertical(inputs: Inputs.BabylonGui.SliderDto): boolean;
        getDisplayThumb(inputs: Inputs.BabylonGui.SliderDto): boolean;
        getIsThumbCircle(inputs: Inputs.BabylonGui.SliderDto): boolean;
        getIsThumbClamped(inputs: Inputs.BabylonGui.SliderDto): boolean;
    }
    declare class BabylonGuiStackPanel {
        private readonly context;
        constructor(context: Context);
        createStackPanel(inputs: Inputs.BabylonGui.CreateStackPanelDto): BABYLON.GUI.StackPanel;
        setIsVertical(inputs: Inputs.BabylonGui.SetStackPanelIsVerticalDto): BABYLON.GUI.StackPanel;
        setSpacing(inputs: Inputs.BabylonGui.SetStackPanelSpacingDto): BABYLON.GUI.StackPanel;
        setWidth(inputs: Inputs.BabylonGui.SetStackPanelWidthDto): BABYLON.GUI.StackPanel;
        setHeight(inputs: Inputs.BabylonGui.SetStackPanelHeightDto): BABYLON.GUI.StackPanel;
        getIsVertical(inputs: Inputs.BabylonGui.StackPanelDto): boolean;
        getSpacing(inputs: Inputs.BabylonGui.StackPanelDto): number;
        getWidth(inputs: Inputs.BabylonGui.StackPanelDto): string | number;
        getHeight(inputs: Inputs.BabylonGui.StackPanelDto): string | number;
    }
    declare class BabylonGuiTextBlock {
        private readonly context;
        constructor(context: Context);
        createTextBlock(inputs: Inputs.BabylonGui.CreateTextBlockDto): BABYLON.GUI.TextBlock;
        alignText(inputs: Inputs.BabylonGui.AlignmentDto<BABYLON.GUI.TextBlock>): BABYLON.GUI.TextBlock;
        setTextOutline(inputs: Inputs.BabylonGui.SetTextBlockTextOutlineDto): BABYLON.GUI.TextBlock;
        setText(inputs: Inputs.BabylonGui.SetTextBlockTextDto): BABYLON.GUI.TextBlock;
        setRsizeToFit(inputs: Inputs.BabylonGui.SetTextBlockResizeToFitDto): BABYLON.GUI.TextBlock;
        setTextWrapping(inputs: Inputs.BabylonGui.SetTextBlockTextWrappingDto): BABYLON.GUI.TextBlock;
        setLineSpacing(inputs: Inputs.BabylonGui.SetTextBlockLineSpacingDto): BABYLON.GUI.TextBlock;
        getText(inputs: Inputs.BabylonGui.TextBlockDto): string;
        getTextWrapping(inputs: Inputs.BabylonGui.TextBlockDto): boolean | BABYLON.GUI.TextWrapping;
        getLineSpacing(inputs: Inputs.BabylonGui.TextBlockDto): string | number;
        getOutlineWidth(inputs: Inputs.BabylonGui.TextBlockDto): number;
        getResizeToFit(inputs: Inputs.BabylonGui.TextBlockDto): boolean;
        getTextHorizontalAlignment(inputs: Inputs.BabylonGui.TextBlockDto): number;
        getTextVerticalAlignment(inputs: Inputs.BabylonGui.TextBlockDto): number;
        createTextBlockObservableSelector(inputs: Inputs.BabylonGui.TextBlockObservableSelectorDto): Inputs.BabylonGui.textBlockObservableSelectorEnum;
    }
    declare class BabylonIO {
        private readonly context;
        private supportedFileFormats;
        private objectUrl;
        constructor(context: Context);
        loadAssetIntoScene(inputs: Inputs.Asset.AssetFileDto): Promise<BABYLON.Mesh>;
        loadAssetIntoSceneNoReturn(inputs: Inputs.Asset.AssetFileDto): Promise<void>;
        loadAssetIntoSceneFromRootUrl(inputs: Inputs.Asset.AssetFileByUrlDto): Promise<BABYLON.Mesh>;
        loadAssetIntoSceneFromRootUrlNoReturn(inputs: Inputs.Asset.AssetFileByUrlDto): Promise<void>;
        exportBabylon(inputs: Inputs.BabylonIO.ExportSceneDto): void;
        exportGLB(inputs: Inputs.BabylonIO.ExportSceneGlbDto): void;
        exportMeshToStl(inputs: Inputs.BabylonIO.ExportMeshToStlDto): Promise<any>;
        exportMeshesToStl(inputs: Inputs.BabylonIO.ExportMeshesToStlDto): Promise<any>;
        private loadAsset;
    }
    declare class BabylonLights {
        private readonly context;
        shadowLight: BabylonShadowLight;
        constructor(context: Context);
    }
    declare class BabylonShadowLight {
        private readonly context;
        constructor(context: Context);
        setDirectionToTarget(inputs: Inputs.BabylonLight.ShadowLightDirectionToTargetDto): void;
        setPosition(inputs: Inputs.BabylonLight.ShadowLightPositionDto): void;
    }
    declare class BabylonMaterial {
        private readonly context;
        private readonly color;
        pbrMetallicRoughness: BabylonMaterialPbrMetallicRoughness;
        skyMaterial: BabylonMaterialSky;
        constructor(context: Context, color: Color);
    }
    declare class BabylonMaterialPbrMetallicRoughness {
        private readonly context;
        private readonly color;
        constructor(context: Context, color: Color);
        create(inputs: Inputs.BabylonMaterial.PBRMetallicRoughnessDto): BABYLON.PBRMetallicRoughnessMaterial;
        setBaseColor(inputs: Inputs.BabylonMaterial.BaseColorDto): void;
        setMetallic(inputs: Inputs.BabylonMaterial.MetallicDto): void;
        setRoughness(inputs: Inputs.BabylonMaterial.RoughnessDto): void;
        setAlpha(inputs: Inputs.BabylonMaterial.AlphaDto): void;
        setBackFaceCulling(inputs: Inputs.BabylonMaterial.BackFaceCullingDto): void;
        setBaseTexture(inputs: Inputs.BabylonMaterial.BaseTextureDto): void;
        getBaseColor(inputs: Inputs.BabylonMaterial.MaterialPropDto): string;
        getMetallic(inputs: Inputs.BabylonMaterial.MaterialPropDto): number;
        getRoughness(inputs: Inputs.BabylonMaterial.MaterialPropDto): number;
        getAlpha(inputs: Inputs.BabylonMaterial.MaterialPropDto): number;
        getBackFaceCulling(inputs: Inputs.BabylonMaterial.MaterialPropDto): boolean;
        getBaseTexture(inputs: Inputs.BabylonMaterial.MaterialPropDto): BABYLON.BaseTexture;
    }
    declare class BabylonMaterialSky {
        private readonly context;
        constructor(context: Context);
        create(inputs: Inputs.BabylonMaterial.SkyMaterialDto): SkyMaterial;
        setLuminance(inputs: Inputs.BabylonMaterial.LuminanceDto): void;
        setTurbidity(inputs: Inputs.BabylonMaterial.TurbidityDto): void;
        setRayleigh(inputs: Inputs.BabylonMaterial.RayleighDto): void;
        setMieCoefficient(inputs: Inputs.BabylonMaterial.MieCoefficientDto): void;
        setMieDirectionalG(inputs: Inputs.BabylonMaterial.MieDirectionalGDto): void;
        setDistance(inputs: Inputs.BabylonMaterial.DistanceDto): void;
        setInclination(inputs: Inputs.BabylonMaterial.InclinationDto): void;
        setAzimuth(inputs: Inputs.BabylonMaterial.AzimuthDto): void;
        setSunPosition(inputs: Inputs.BabylonMaterial.SunPositionDto): void;
        setUseSunPosition(inputs: Inputs.BabylonMaterial.UseSunPositionDto): void;
        setCameraOffset(inputs: Inputs.BabylonMaterial.CameraOffsetDto): void;
        setUp(inputs: Inputs.BabylonMaterial.UpDto): void;
        setDithering(inputs: Inputs.BabylonMaterial.DitheringDto): void;
        getLuminance(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): number;
        getTurbidity(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): number;
        getRayleigh(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): number;
        getMieCoefficient(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): number;
        getMieDirectionalG(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): number;
        getDistance(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): number;
        getInclination(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): number;
        getAzimuth(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): number;
        getSunPosition(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): Inputs.Base.Vector3;
        getUseSunPosition(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): boolean;
        getCameraOffset(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): Inputs.Base.Vector3;
        getUp(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): Inputs.Base.Vector3;
        getDithering(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): boolean;
    }
    declare class BabylonMeshBuilder {
        private readonly context;
        private readonly mesh;
        constructor(context: Context, mesh: BabylonMesh);
        createBox(inputs: Inputs.BabylonMeshBuilder.CreateBoxDto): BABYLON.Mesh;
        createCube(inputs: Inputs.BabylonMeshBuilder.CreateCubeDto): BABYLON.Mesh;
        createSquarePlane(inputs: Inputs.BabylonMeshBuilder.CreateSquarePlaneDto): BABYLON.Mesh;
        createSphere(inputs: Inputs.BabylonMeshBuilder.CreateSphereDto): BABYLON.Mesh;
        createIcoSphere(inputs: Inputs.BabylonMeshBuilder.CreateIcoSphereDto): BABYLON.Mesh;
        createDisc(inputs: Inputs.BabylonMeshBuilder.CreateDiscDto): BABYLON.Mesh;
        createTorus(inputs: Inputs.BabylonMeshBuilder.CreateTorusDto): BABYLON.Mesh;
        createTorusKnot(inputs: Inputs.BabylonMeshBuilder.CreateTorusKnotDto): BABYLON.Mesh;
        createPolygon(inputs: Inputs.BabylonMeshBuilder.CreatePolygonDto): BABYLON.Mesh;
        extrudePolygon(inputs: Inputs.BabylonMeshBuilder.ExtrudePolygonDto): BABYLON.Mesh;
        createTube(inputs: Inputs.BabylonMeshBuilder.CreateTubeDto): BABYLON.Mesh;
        createPolyhedron(inputs: Inputs.BabylonMeshBuilder.CreatePolyhedronDto): BABYLON.Mesh;
        createGeodesic(inputs: Inputs.BabylonMeshBuilder.CreateGeodesicDto): BABYLON.Mesh;
        createGoldberg(inputs: Inputs.BabylonMeshBuilder.CreateGoldbergDto): BABYLON.Mesh;
        createCapsule(inputs: Inputs.BabylonMeshBuilder.CreateCapsuleDto): BABYLON.Mesh;
        createCylinder(inputs: Inputs.BabylonMeshBuilder.CreateCylinderDto): BABYLON.Mesh;
        createExtrudedSahpe(inputs: Inputs.BabylonMeshBuilder.CreateExtrudedShapeDto): BABYLON.Mesh;
        createRibbon(inputs: Inputs.BabylonMeshBuilder.CreateRibbonDto): BABYLON.Mesh;
        createLathe(inputs: Inputs.BabylonMeshBuilder.CreateLatheDto): BABYLON.Mesh;
        createGround(inputs: Inputs.BabylonMeshBuilder.CreateGroundDto): BABYLON.Mesh;
        createRectanglePlane(inputs: Inputs.BabylonMeshBuilder.CreateRectanglePlaneDto): BABYLON.Mesh;
        private enableShadows;
    }
    declare class BabylonMesh {
        private readonly context;
        constructor(context: Context);
        dispose(inputs: Inputs.BabylonMesh.BabylonMeshDto): void;
        updateDrawn(inputs: Inputs.BabylonMesh.UpdateDrawnBabylonMesh): void;
        setVisibility(inputs: Inputs.BabylonMesh.SetMeshVisibilityDto): void;
        hide(inputs: Inputs.BabylonMesh.ShowHideMeshDto): void;
        show(inputs: Inputs.BabylonMesh.ShowHideMeshDto): void;
        setParent(inputs: Inputs.BabylonMesh.SetParentDto): void;
        getParent(inputs: Inputs.BabylonMesh.SetParentDto): BABYLON.Node;
        setCheckCollisions(inputs: Inputs.BabylonMesh.CheckCollisionsBabylonMeshDto): void;
        getCheckCollisions(inputs: Inputs.BabylonMesh.CheckCollisionsBabylonMeshDto): boolean;
        setPickable(inputs: Inputs.BabylonMesh.PickableBabylonMeshDto): void;
        enablePointerMoveEvents(inputs: Inputs.BabylonMesh.BabylonMeshWithChildrenDto): void;
        disablePointerMoveEvents(inputs: Inputs.BabylonMesh.BabylonMeshWithChildrenDto): void;
        getPickable(inputs: Inputs.BabylonMesh.BabylonMeshDto): boolean;
        getMeshesWhereNameContains(inputs: Inputs.BabylonMesh.ByNameBabylonMeshDto): BABYLON.AbstractMesh[];
        getChildMeshes(inputs: Inputs.BabylonMesh.ChildMeshesBabylonMeshDto): BABYLON.AbstractMesh[];
        getMeshesOfId(inputs: Inputs.BabylonMesh.ByIdBabylonMeshDto): BABYLON.AbstractMesh[];
        getMeshOfId(inputs: Inputs.BabylonMesh.ByIdBabylonMeshDto): BABYLON.AbstractMesh;
        getMeshOfUniqueId(inputs: Inputs.BabylonMesh.UniqueIdBabylonMeshDto): BABYLON.AbstractMesh;
        mergeMeshes(inputs: Inputs.BabylonMesh.MergeMeshesDto): BABYLON.Mesh;
        convertToFlatShadedMesh(inputs: Inputs.BabylonMesh.BabylonMeshDto): BABYLON.Mesh;
        clone(inputs: Inputs.BabylonMesh.BabylonMeshDto): BABYLON.Mesh;
        cloneToPositions(inputs: Inputs.BabylonMesh.CloneToPositionsDto): BABYLON.Mesh[];
        setId(inputs: Inputs.BabylonMesh.IdBabylonMeshDto): void;
        getId(inputs: Inputs.BabylonMesh.IdBabylonMeshDto): string;
        getUniqueId(inputs: Inputs.BabylonMesh.BabylonMeshDto): number;
        setName(inputs: Inputs.BabylonMesh.NameBabylonMeshDto): void;
        getVerticesAsPolygonPoints(inputs: Inputs.BabylonMesh.BabylonMeshDto): Base.Point3[][];
        getName(inputs: Inputs.BabylonMesh.BabylonMeshDto): string;
        setMaterial(inputs: Inputs.BabylonMesh.MaterialBabylonMeshDto): void;
        getMaterial(inputs: Inputs.BabylonMesh.BabylonMeshDto): BABYLON.Material;
        getPosition(inputs: Inputs.BabylonMesh.BabylonMeshDto): Base.Point3;
        getAbsolutePosition(inputs: Inputs.BabylonMesh.BabylonMeshDto): Base.Point3;
        getRotation(inputs: Inputs.BabylonMesh.BabylonMeshDto): Base.Point3;
        getScale(inputs: Inputs.BabylonMesh.BabylonMeshDto): Base.Point3;
        moveForward(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto): void;
        moveBackward(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto): void;
        moveUp(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto): void;
        moveDown(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto): void;
        moveRight(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto): void;
        moveLeft(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto): void;
        yaw(inputs: Inputs.BabylonMesh.RotateBabylonMeshDto): void;
        pitch(inputs: Inputs.BabylonMesh.RotateBabylonMeshDto): void;
        roll(inputs: Inputs.BabylonMesh.RotateBabylonMeshDto): void;
        rotateAroundAxisWithPosition(inputs: Inputs.BabylonMesh.RotateAroundAxisNodeDto): void;
        setPosition(inputs: Inputs.BabylonMesh.UpdateDrawnBabylonMeshPositionDto): void;
        setRotation(inputs: Inputs.BabylonMesh.UpdateDrawnBabylonMeshRotationDto): void;
        setScale(inputs: Inputs.BabylonMesh.UpdateDrawnBabylonMeshScaleDto): void;
        setLocalScale(inputs: Inputs.BabylonMesh.ScaleInPlaceDto): void;
        intersectsMesh(inputs: Inputs.BabylonMesh.IntersectsMeshDto): boolean;
        intersectsPoint(inputs: Inputs.BabylonMesh.IntersectsPointDto): boolean;
        createMeshInstanceAndTransformNoReturn(inputs: Inputs.BabylonMesh.MeshInstanceAndTransformDto): void;
        createMeshInstanceAndTransform(inputs: Inputs.BabylonMesh.MeshInstanceAndTransformDto): BABYLON.Mesh;
        createMeshInstance(inputs: Inputs.BabylonMesh.MeshInstanceDto): BABYLON.Mesh;
        getSideOrientation(sideOrientation: Inputs.BabylonMesh.sideOrientationEnum): number;
        private assignColorToMesh;
    }
    declare class BabylonNode {
        private readonly context;
        private readonly drawHelper;
        constructor(context: Context, drawHelper: DrawHelper);
        drawNode(inputs: Inputs.BabylonNode.DrawNodeDto): void;
        drawNodes(inputs: Inputs.BabylonNode.DrawNodesDto): void;
        createNodeFromRotation(inputs: Inputs.BabylonNode.CreateNodeFromRotationDto): BABYLON.TransformNode;
        createWorldNode(): BABYLON.TransformNode;
        getAbsoluteForwardVector(inputs: Inputs.BabylonNode.NodeDto): number[];
        getAbsoluteRightVector(inputs: Inputs.BabylonNode.NodeDto): number[];
        getAbsoluteUpVector(inputs: Inputs.BabylonNode.NodeDto): number[];
        getAbsolutePosition(inputs: Inputs.BabylonNode.NodeDto): number[];
        getAbsoluteRotationTransformation(inputs: Inputs.BabylonNode.NodeDto): number[];
        getRotationTransformation(inputs: Inputs.BabylonNode.NodeDto): number[];
        getChildren(inputs: Inputs.BabylonNode.NodeDto): BABYLON.Node[];
        getParent(inputs: Inputs.BabylonNode.NodeDto): BABYLON.Node;
        getPositionExpressedInLocalSpace(inputs: Inputs.BabylonNode.NodeDto): number[];
        getRootNode(): BABYLON.TransformNode;
        getRotation(inputs: Inputs.BabylonNode.NodeDto): number[];
        rotateAroundAxisWithPosition(inputs: Inputs.BabylonNode.RotateAroundAxisNodeDto): void;
        rotate(inputs: Inputs.BabylonNode.RotateNodeDto): void;
        setAbsolutePosition(inputs: Inputs.BabylonNode.NodePositionDto): void;
        setDirection(inputs: Inputs.BabylonNode.NodeDirectionDto): void;
        setParent(inputs: Inputs.BabylonNode.NodeParentDto): void;
        translate(inputs: Inputs.BabylonNode.NodeTranslationDto): void;
    }
    declare class BabylonPick {
        private readonly context;
        constructor(context: Context);
        pickWithRay(inputs: Inputs.BabylonPick.RayDto): BABYLON.PickingInfo;
        pickWithPickingRay(): BABYLON.PickingInfo;
        getDistance(inputs: Inputs.BabylonPick.PickInfo): number;
        getPickedMesh(inputs: Inputs.BabylonPick.PickInfo): BABYLON.AbstractMesh;
        getPickedPoint(inputs: Inputs.BabylonPick.PickInfo): Base.Point3;
        hit(inputs: Inputs.BabylonPick.PickInfo): boolean;
        getSubMeshId(inputs: Inputs.BabylonPick.PickInfo): number;
        getSubMeshFaceId(inputs: Inputs.BabylonPick.PickInfo): number;
        getBU(inputs: Inputs.BabylonPick.PickInfo): number;
        getBV(inputs: Inputs.BabylonPick.PickInfo): number;
        getPickedSprite(inputs: Inputs.BabylonPick.PickInfo): BABYLON.Sprite;
    }
    declare class BabylonRay {
        private readonly context;
        constructor(context: Context);
        createPickingRay(): BABYLON.Ray;
        createRay(inputs: Inputs.BabylonRay.BaseRayDto): BABYLON.Ray;
        createRayFromTo(inputs: Inputs.BabylonRay.FromToDto): BABYLON.Ray;
        getOrigin(inputs: Inputs.BabylonRay.RayDto): Base.Point3;
        getDirection(inputs: Inputs.BabylonRay.RayDto): Base.Vector3;
        getLength(inputs: Inputs.BabylonRay.RayDto): number;
    }
    declare function initBabylonJS(inputs?: BabylonJSScene.InitBabylonJSDto): InitBabylonJSResult;
    declare class BabylonScene {
        private readonly context;
        constructor(context: Context);
        getScene(): BABYLON.Scene;
        setAndAttachScene(inputs: Inputs.BabylonScene.SceneDto): BABYLON.Scene;
        activateCamera(inputs: Inputs.BabylonScene.ActiveCameraDto): void;
        useRightHandedSystem(inputs: Inputs.BabylonScene.UseRightHandedSystemDto): void;
        drawPointLightNoReturn(inputs: Inputs.BabylonScene.PointLightDto): void;
        getShadowGenerators(): BABYLON.ShadowGenerator[];
        drawPointLight(inputs: Inputs.BabylonScene.PointLightDto): BABYLON.PointLight;
        drawDirectionalLightNoReturn(inputs: Inputs.BabylonScene.DirectionalLightDto): void;
        drawDirectionalLight(inputs: Inputs.BabylonScene.DirectionalLightDto): BABYLON.DirectionalLight;
        getActiveCamera(): BABYLON.Camera;
        adjustActiveArcRotateCamera(inputs: Inputs.BabylonScene.CameraConfigurationDto): void;
        clearAllDrawn(): void;
        enableSkybox(inputs: Inputs.BabylonScene.SkyboxDto): void;
        enableSkyboxCustomTexture(inputs: Inputs.BabylonScene.SkyboxCustomTextureDto): void;
        onPointerDown(inputs: Inputs.BabylonScene.PointerDto): void;
        onPointerUp(inputs: Inputs.BabylonScene.PointerDto): void;
        onPointerMove(inputs: Inputs.BabylonScene.PointerDto): void;
        fog(inputs: Inputs.BabylonScene.FogDto): void;
        enablePhysics(inputs: Inputs.BabylonScene.EnablePhysicsDto): void;
        canvasCSSBackgroundImage(inputs: Inputs.BabylonScene.SceneCanvasCSSBackgroundImageDto): {
            backgroundImage: string;
        };
        twoColorLinearGradientBackground(inputs: Inputs.BabylonScene.SceneTwoColorLinearGradientDto): {
            backgroundImage: string;
        };
        twoColorRadialGradientBackground(inputs: Inputs.BabylonScene.SceneTwoColorRadialGradientDto): {
            backgroundImage: string;
        };
        multiColorLinearGradientBackground(inputs: Inputs.BabylonScene.SceneMultiColorLinearGradientDto): {
            backgroundImage: string;
        } | {
            error: string;
        };
        multiColorRadialGradientBackground(inputs: Inputs.BabylonScene.SceneMultiColorRadialGradientDto): {
            backgroundImage: string;
        } | {
            error: string;
        };
        canvasBackgroundImage(inputs: Inputs.BabylonScene.SceneCanvasBackgroundImageDto): {
            backgroundImage: string;
            backgroundRepeat: string;
            backgroundSize: string;
            backgroundPosition: string;
            backgroundAttachment: string;
            backgroundOrigin: string;
            backgroundClip: string;
        };
        backgroundColour(inputs: Inputs.BabylonScene.SceneBackgroundColourDto): void;
        private getRadians;
        private createSkyboxMesh;
    }
    declare class BabylonTexture {
        private readonly context;
        constructor(context: Context);
        createSimple(inputs: Inputs.BabylonTexture.TextureSimpleDto): BABYLON.Texture;
    }
    declare class BabylonTools {
        private readonly context;
        constructor(context: Context);
        createScreenshot(inputs: Inputs.BabylonTools.ScreenshotDto): Promise<string>;
        createScreenshotAndDownload(inputs: Inputs.BabylonTools.ScreenshotDto): Promise<string>;
    }
    declare class BabylonTransforms {
        rotationCenterAxis(inputs: Inputs.BabylonTransforms.RotationCenterAxisDto): Base.TransformMatrixes;
        rotationCenterX(inputs: Inputs.BabylonTransforms.RotationCenterDto): Base.TransformMatrixes;
        rotationCenterY(inputs: Inputs.BabylonTransforms.RotationCenterDto): Base.TransformMatrixes;
        rotationCenterZ(inputs: Inputs.BabylonTransforms.RotationCenterDto): Base.TransformMatrixes;
        rotationCenterYawPitchRoll(inputs: Inputs.BabylonTransforms.RotationCenterYawPitchRollDto): Base.TransformMatrixes;
        scaleCenterXYZ(inputs: Inputs.BabylonTransforms.ScaleCenterXYZDto): Base.TransformMatrixes;
        scaleXYZ(inputs: Inputs.BabylonTransforms.ScaleXYZDto): Base.TransformMatrixes;
        uniformScale(inputs: Inputs.BabylonTransforms.UniformScaleDto): Base.TransformMatrixes;
        uniformScaleFromCenter(inputs: Inputs.BabylonTransforms.UniformScaleFromCenterDto): Base.TransformMatrixes;
        translationXYZ(inputs: Inputs.BabylonTransforms.TranslationXYZDto): Base.TransformMatrixes;
        translationsXYZ(inputs: Inputs.BabylonTransforms.TranslationsXYZDto): Base.TransformMatrixes[];
    }
    declare class BabylonWebXRBase {
        private readonly context;
        constructor(context: Context);
        createDefaultXRExperienceAsync(inputs: Inputs.BabylonWebXR.WebXRDefaultExperienceOptions): Promise<BABYLON.WebXRDefaultExperience>;
        createDefaultXRExperienceNoOptionsAsync(): Promise<BABYLON.WebXRDefaultExperience>;
        getBaseExperience(inputs: Inputs.BabylonWebXR.WebXRDefaultExperienceDto): BABYLON.WebXRExperienceHelper;
        getFeatureManager(inputs: Inputs.BabylonWebXR.WebXRExperienceHelperDto): BABYLON.WebXRFeaturesManager;
    }
    declare class BabylonWebXRSimple {
        private readonly context;
        constructor(context: Context);
        createImmersiveARExperience(): Promise<BABYLON.WebXRDefaultExperience>;
        createDefaultXRExperienceWithTeleportation(inputs: Inputs.BabylonWebXR.DefaultWebXRWithTeleportationDto): Promise<void>;
        createDefaultXRExperienceWithTeleportationReturn(inputs: Inputs.BabylonWebXR.DefaultWebXRWithTeleportationDto): Promise<{
            xr: BABYLON.WebXRDefaultExperience;
            torusMat: BABYLON.PBRMetallicRoughnessMaterial;
            manager: GUI3DManager;
            near: NearMenu;
            button: TouchHolographicButton;
            text: TextBlock;
            dispose: () => void;
        }>;
    }
    declare class BabylonWebXR {
        private readonly context;
        simple: BabylonWebXRSimple;
        constructor(context: Context);
    }
    declare class Draw extends DrawCore {
        readonly drawHelper: DrawHelper;
        readonly node: BabylonNode;
        readonly tag: Tag;
        readonly context: Context;
        private defaultBasicOptions;
        private defaultPolylineOptions;
        private defaultNodeOptions;
        constructor(drawHelper: DrawHelper, node: BabylonNode, tag: Tag, context: Context);
        drawAnyAsyncNoReturn(inputs: Inputs.Draw.DrawAny): Promise<void>;
        drawAnyAsync(inputs: Inputs.Draw.DrawAny): Promise<BABYLON.Mesh>;
        private updateAny;
        drawAnyNoReturn(inputs: Inputs.Draw.DrawAny): void;
        drawAny(inputs: Inputs.Draw.DrawAny): BABYLON.Mesh;
        drawGridMeshNoReturn(inputs: Inputs.Draw.SceneDrawGridMeshDto): void;
        drawGridMesh(inputs: Inputs.Draw.SceneDrawGridMeshDto): BABYLON.Mesh;
        optionsSimple(inputs: Inputs.Draw.DrawBasicGeometryOptions): Inputs.Draw.DrawBasicGeometryOptions;
        optionsOcctShape(inputs: Inputs.Draw.DrawOcctShapeOptions): Inputs.Draw.DrawOcctShapeOptions;
        optionsOcctShapeSimple(inputs: Inputs.Draw.DrawOcctShapeSimpleOptions): Inputs.Draw.DrawOcctShapeSimpleOptions;
        optionsOcctShapeMaterial(inputs: Inputs.Draw.DrawOcctShapeMaterialOptions): Inputs.Draw.DrawOcctShapeMaterialOptions;
        optionsManifoldShapeMaterial(inputs: Inputs.Draw.DrawManifoldOrCrossSectionOptions): Inputs.Draw.DrawManifoldOrCrossSectionOptions;
        optionsBabylonNode(inputs: Inputs.Draw.DrawNodeOptions): Inputs.Draw.DrawNodeOptions;
        createTexture(inputs: Inputs.Draw.GenericTextureDto): BABYLON.Texture;
        createPBRMaterial(inputs: Inputs.Draw.GenericPBRMaterialDto): BABYLON.PBRMetallicRoughnessMaterial;
        private getSamplingMode;
        private handleTags;
        private handleTag;
        private handleVerbSurfaces;
        private handleVerbCurves;
        private handleNodes;
        private handlePoints;
        private handleLines;
        private handlePolylines;
        private handleVerbSurface;
        private handleVerbCurve;
        private handleNode;
        private handlePolyline;
        private handlePoint;
        private handleLine;
        private handleJscadMeshes;
        private handleManifoldShape;
        private handleManifoldShapes;
        private handleOcctShape;
        private handleOcctShapes;
        private handleJscadMesh;
        private applyGlobalSettingsAndMetadataAndShadowCasting;
    }
    declare class Color {
        private readonly math;
        constructor(math: MathBitByBit);
        hexColor(inputs: Inputs.Color.HexDto): Inputs.Base.Color;
        hexToRgb(inputs: Inputs.Color.HexDto): Inputs.Base.ColorRGB;
        rgbToHex(inputs: Inputs.Color.RGBMinMaxDto): Inputs.Base.Color;
        rgbObjToHex(inputs: Inputs.Color.RGBObjectMaxDto): Inputs.Base.Color;
        hexToRgbMapped(inputs: Inputs.Color.HexDtoMapped): Inputs.Base.ColorRGB;
        getRedParam(inputs: Inputs.Color.HexDtoMapped): number;
        getGreenParam(inputs: Inputs.Color.HexDtoMapped): number;
        getBlueParam(inputs: Inputs.Color.HexDtoMapped): number;
        rgbToRed(inputs: Inputs.Color.RGBObjectDto): number;
        rgbToGreen(inputs: Inputs.Color.RGBObjectDto): number;
        rgbToBlue(inputs: Inputs.Color.RGBObjectDto): number;
        invert(inputs: Inputs.Color.InvertHexDto): Inputs.Base.Color;
    }
    declare class Dates {
        toDateString(inputs: Inputs.Dates.DateDto): string;
        toISOString(inputs: Inputs.Dates.DateDto): string;
        toJSON(inputs: Inputs.Dates.DateDto): string;
        toString(inputs: Inputs.Dates.DateDto): string;
        toTimeString(inputs: Inputs.Dates.DateDto): string;
        toUTCString(inputs: Inputs.Dates.DateDto): string;
        now(): Date;
        createDate(inputs: Inputs.Dates.CreateDateDto): Date;
        createDateUTC(inputs: Inputs.Dates.CreateDateDto): Date;
        createFromUnixTimeStamp(inputs: Inputs.Dates.CreateFromUnixTimeStampDto): Date;
        parseDate(inputs: Inputs.Dates.DateStringDto): number;
        getDayOfMonth(inputs: Inputs.Dates.DateDto): number;
        getWeekday(inputs: Inputs.Dates.DateDto): number;
        getYear(inputs: Inputs.Dates.DateDto): number;
        getMonth(inputs: Inputs.Dates.DateDto): number;
        getHours(inputs: Inputs.Dates.DateDto): number;
        getMinutes(inputs: Inputs.Dates.DateDto): number;
        getSeconds(inputs: Inputs.Dates.DateDto): number;
        getMilliseconds(inputs: Inputs.Dates.DateDto): number;
        getTime(inputs: Inputs.Dates.DateDto): number;
        getUTCYear(inputs: Inputs.Dates.DateDto): number;
        getUTCMonth(inputs: Inputs.Dates.DateDto): number;
        getUTCDay(inputs: Inputs.Dates.DateDto): number;
        getUTCHours(inputs: Inputs.Dates.DateDto): number;
        getUTCMinutes(inputs: Inputs.Dates.DateDto): number;
        getUTCSeconds(inputs: Inputs.Dates.DateDto): number;
        getUTCMilliseconds(inputs: Inputs.Dates.DateDto): number;
        setYear(inputs: Inputs.Dates.DateYearDto): Date;
        setMonth(inputs: Inputs.Dates.DateMonthDto): Date;
        setDayOfMonth(inputs: Inputs.Dates.DateDayDto): Date;
        setHours(inputs: Inputs.Dates.DateHoursDto): Date;
        setMinutes(inputs: Inputs.Dates.DateMinutesDto): Date;
        setSeconds(inputs: Inputs.Dates.DateSecondsDto): Date;
        setMilliseconds(inputs: Inputs.Dates.DateMillisecondsDto): Date;
        setTime(inputs: Inputs.Dates.DateTimeDto): Date;
        setUTCYear(inputs: Inputs.Dates.DateYearDto): Date;
        setUTCMonth(inputs: Inputs.Dates.DateMonthDto): Date;
        setUTCDay(inputs: Inputs.Dates.DateDayDto): Date;
        setUTCHours(inputs: Inputs.Dates.DateHoursDto): Date;
        setUTCMinutes(inputs: Inputs.Dates.DateMinutesDto): Date;
        setUTCSeconds(inputs: Inputs.Dates.DateSecondsDto): Date;
        setUTCMilliseconds(inputs: Inputs.Dates.DateMillisecondsDto): Date;
    }
    declare class GeometryHelper {
        transformControlPoints(transformation: number[][] | number[][][], transformedControlPoints: Inputs.Base.Point3[]): Inputs.Base.Point3[];
        getFlatTransformations(transformation: number[][] | number[][][]): number[][];
        getArrayDepth: (value: any) => number;
        transformPointsByMatrixArray(points: Inputs.Base.Point3[], transform: number[]): Inputs.Base.Point3[];
        transformPointsCoordinates(points: Inputs.Base.Point3[], transform: number[]): Inputs.Base.Point3[];
        removeAllDuplicateVectors(vectors: number[][], tolerance?: number): number[][];
        removeConsecutiveVectorDuplicates(vectors: number[][], checkFirstAndLast?: boolean, tolerance?: number): number[][];
        vectorsTheSame(vec1: number[], vec2: number[], tolerance: number): boolean;
        approxEq(num1: number, num2: number, tolerance: number): boolean;
        removeConsecutivePointDuplicates(points: Inputs.Base.Point3[], checkFirstAndLast?: boolean, tolerance?: number): Inputs.Base.Point3[];
        arePointsTheSame(pointA: Inputs.Base.Point3 | Inputs.Base.Point2, pointB: Inputs.Base.Point3 | Inputs.Base.Point2, tolerance: number): boolean;
        private transformCoordinates;
    }
    declare class DxfGenerator {
        private entityHandle;
        private colorFormat;
        private acadVersion;
        generateDxf(dxfInputs: Inputs.IO.DxfModelDto): string;
        private generateHeader;
        private generateTables;
        private generateLineTypeTable;
        private generateStyleTable;
        private generateVportTable;
        private generateViewTable;
        private generateUcsTable;
        private generateAppidTable;
        private generateDimstyleTable;
        private generateBlocks;
        private generateLayerTable;
        private generateEntities;
        private generateSegmentEntity;
        private isLineSegment;
        private isArcSegment;
        private isCircleSegment;
        private isPolylineSegment;
        private isSplineSegment;
        private generateLineEntity;
        private generateCircleEntity;
        private generateArcEntity;
        private generatePolylineEntity;
        private generateSplineEntity;
        private isClosedPolyline;
        private getNextHandle;
        private convertColorToDxf;
        private rgbToAciColorIndex;
    }
    declare class Dxf {
        private dxfGenerator;
        lineSegment(inputs: Inputs.IO.DxfLineSegmentDto): Inputs.IO.DxfLineSegmentDto;
        arcSegment(inputs: Inputs.IO.DxfArcSegmentDto): Inputs.IO.DxfArcSegmentDto;
        circleSegment(inputs: Inputs.IO.DxfCircleSegmentDto): Inputs.IO.DxfCircleSegmentDto;
        polylineSegment(inputs: Inputs.IO.DxfPolylineSegmentDto): Inputs.IO.DxfPolylineSegmentDto;
        splineSegment(inputs: Inputs.IO.DxfSplineSegmentDto): Inputs.IO.DxfSplineSegmentDto;
        path(inputs: Inputs.IO.DxfPathDto): Inputs.IO.DxfPathDto;
        pathsPart(inputs: Inputs.IO.DxfPathsPartDto): Inputs.IO.DxfPathsPartDto;
        dxfCreate(inputs: Inputs.IO.DxfModelDto): string;
    }
    declare class IoBitByBit {
        dxf: Dxf;
        constructor();
    }
    declare class Line {
        private readonly vector;
        private readonly point;
        private readonly geometryHelper;
        constructor(vector: Vector, point: Point, geometryHelper: GeometryHelper);
        getStartPoint(inputs: Inputs.Line.LineDto): Inputs.Base.Point3;
        getEndPoint(inputs: Inputs.Line.LineDto): Inputs.Base.Point3;
        length(inputs: Inputs.Line.LineDto): number;
        reverse(inputs: Inputs.Line.LineDto): Inputs.Base.Line3;
        transformLine(inputs: Inputs.Line.TransformLineDto): Inputs.Base.Line3;
        transformsForLines(inputs: Inputs.Line.TransformsLinesDto): Inputs.Base.Line3[];
        create(inputs: Inputs.Line.LinePointsDto): Inputs.Base.Line3;
        createSegment(inputs: Inputs.Line.LinePointsDto): Inputs.Base.Segment3;
        getPointOnLine(inputs: Inputs.Line.PointOnLineDto): Inputs.Base.Point3;
        linesBetweenPoints(inputs: Inputs.Line.PointsLinesDto): Inputs.Base.Line3[];
        linesBetweenStartAndEndPoints(inputs: Inputs.Line.LineStartEndPointsDto): Inputs.Base.Line3[];
        lineToSegment(inputs: Inputs.Line.LineDto): Inputs.Base.Segment3;
        linesToSegments(inputs: Inputs.Line.LinesDto): Inputs.Base.Segment3[];
        segmentToLine(inputs: Inputs.Line.SegmentDto): Inputs.Base.Line3;
        segmentsToLines(inputs: Inputs.Line.SegmentsDto): Inputs.Base.Line3[];
        lineLineIntersection(inputs: Inputs.Line.LineLineIntersectionDto): Inputs.Base.Point3 | undefined;
    }
    declare class Lists {
        getItem<T>(inputs: Inputs.Lists.ListItemDto<T>): T;
        getFirstItem<T>(inputs: Inputs.Lists.ListCloneDto<T>): T;
        getLastItem<T>(inputs: Inputs.Lists.ListCloneDto<T>): T;
        randomGetThreshold<T>(inputs: Inputs.Lists.RandomThresholdDto<T>): T[];
        getSubList<T>(inputs: Inputs.Lists.SubListDto<T>): T[];
        getNthItem<T>(inputs: Inputs.Lists.GetNthItemDto<T>): T[];
        getByPattern<T>(inputs: Inputs.Lists.GetByPatternDto<T>): T[];
        mergeElementsOfLists<T>(inputs: Inputs.Lists.MergeElementsOfLists<T[]>): T[];
        getLongestListLength<T>(inputs: Inputs.Lists.GetLongestListLength<T[]>): number;
        reverse<T>(inputs: Inputs.Lists.ListCloneDto<T>): T[];
        shuffle<T>(inputs: Inputs.Lists.ListCloneDto<T>): T[];
        flipLists<T>(inputs: Inputs.Lists.ListCloneDto<T[]>): T[][];
        groupNth<T>(inputs: Inputs.Lists.GroupListDto<T>): T[][];
        includes<T>(inputs: Inputs.Lists.IncludesDto<T>): boolean;
        findIndex<T>(inputs: Inputs.Lists.IncludesDto<T>): number;
        getListDepth(inputs: Inputs.Lists.ListCloneDto<[
        ]>): number;
        listLength<T>(inputs: Inputs.Lists.ListCloneDto<T>): number;
        addItemAtIndex<T>(inputs: Inputs.Lists.AddItemAtIndexDto<T>): T[];
        addItemAtIndexes<T>(inputs: Inputs.Lists.AddItemAtIndexesDto<T>): T[];
        addItemsAtIndexes<T>(inputs: Inputs.Lists.AddItemsAtIndexesDto<T>): T[];
        removeItemAtIndex<T>(inputs: Inputs.Lists.RemoveItemAtIndexDto<T>): T[];
        removeFirstItem<T>(inputs: Inputs.Lists.ListCloneDto<T>): T[];
        removeLastItem<T>(inputs: Inputs.Lists.ListCloneDto<T>): T[];
        removeItemAtIndexFromEnd<T>(inputs: Inputs.Lists.RemoveItemAtIndexDto<T>): T[];
        removeItemsAtIndexes<T>(inputs: Inputs.Lists.RemoveItemsAtIndexesDto<T>): T[];
        removeAllItems<T>(inputs: Inputs.Lists.ListDto<T>): T[];
        removeNthItem<T>(inputs: Inputs.Lists.RemoveNthItemDto<T>): T[];
        randomRemoveThreshold<T>(inputs: Inputs.Lists.RandomThresholdDto<T>): T[];
        removeDuplicateNumbers(inputs: Inputs.Lists.RemoveDuplicatesDto<number>): number[];
        removeDuplicateNumbersTolerance(inputs: Inputs.Lists.RemoveDuplicatesToleranceDto<number>): number[];
        removeDuplicates<T>(inputs: Inputs.Lists.RemoveDuplicatesDto<T>): T[];
        addItem<T>(inputs: Inputs.Lists.AddItemDto<T>): T[];
        prependItem<T>(inputs: Inputs.Lists.AddItemDto<T>): T[];
        addItemFirstLast<T>(inputs: Inputs.Lists.AddItemFirstLastDto<T>): T[];
        concatenate<T>(inputs: Inputs.Lists.ConcatenateDto<T>): T[];
        createEmptyList(): [
        ];
        repeat<T>(inputs: Inputs.Lists.MultiplyItemDto<T>): T[];
        repeatInPattern<T>(inputs: Inputs.Lists.RepeatInPatternDto<T>): T[];
        sortNumber(inputs: Inputs.Lists.SortDto<number>): number[];
        sortTexts(inputs: Inputs.Lists.SortDto<string>): string[];
        sortByPropValue(inputs: Inputs.Lists.SortJsonDto<any>): any[];
        interleave<T>(inputs: Inputs.Lists.InterleaveDto<T>): T[];
    }
    declare class Logic {
        boolean(inputs: Inputs.Logic.BooleanDto): boolean;
        randomBooleans(inputs: Inputs.Logic.RandomBooleansDto): boolean[];
        twoThresholdRandomGradient(inputs: Inputs.Logic.TwoThresholdRandomGradientDto): boolean[];
        thresholdBooleanList(inputs: Inputs.Logic.ThresholdBooleanListDto): boolean[];
        thresholdGapsBooleanList(inputs: Inputs.Logic.ThresholdGapsBooleanListDto): boolean[];
        not(inputs: Inputs.Logic.BooleanDto): boolean;
        notList(inputs: Inputs.Logic.BooleanListDto): boolean[];
        compare<T>(inputs: Inputs.Logic.ComparisonDto<T>): boolean;
        valueGate<T>(inputs: Inputs.Logic.ValueGateDto<T>): T | undefined;
        firstDefinedValueGate<T, U>(inputs: Inputs.Logic.TwoValueGateDto<T, U>): T | U | undefined;
    }
    declare class MathBitByBit {
        number(inputs: Inputs.Math.NumberDto): number;
        twoNrOperation(inputs: Inputs.Math.ActionOnTwoNumbersDto): number;
        modulus(inputs: Inputs.Math.ModulusDto): number;
        roundToDecimals(inputs: Inputs.Math.RoundToDecimalsDto): number;
        roundAndRemoveTrailingZeros(inputs: Inputs.Math.RoundToDecimalsDto): number;
        oneNrOperation(inputs: Inputs.Math.ActionOnOneNumberDto): number;
        remap(inputs: Inputs.Math.RemapNumberDto): number;
        random(): number;
        randomNumber(inputs: Inputs.Math.RandomNumberDto): number;
        randomNumbers(inputs: Inputs.Math.RandomNumbersDto): number[];
        pi(): number;
        toFixed(inputs: Inputs.Math.ToFixedDto): string;
        add(inputs: Inputs.Math.TwoNumbersDto): number;
        subtract(inputs: Inputs.Math.TwoNumbersDto): number;
        multiply(inputs: Inputs.Math.TwoNumbersDto): number;
        divide(inputs: Inputs.Math.TwoNumbersDto): number;
        power(inputs: Inputs.Math.TwoNumbersDto): number;
        sqrt(inputs: Inputs.Math.NumberDto): number;
        abs(inputs: Inputs.Math.NumberDto): number;
        round(inputs: Inputs.Math.NumberDto): number;
        floor(inputs: Inputs.Math.NumberDto): number;
        ceil(inputs: Inputs.Math.NumberDto): number;
        negate(inputs: Inputs.Math.NumberDto): number;
        ln(inputs: Inputs.Math.NumberDto): number;
        log10(inputs: Inputs.Math.NumberDto): number;
        tenPow(inputs: Inputs.Math.NumberDto): number;
        sin(inputs: Inputs.Math.NumberDto): number;
        cos(inputs: Inputs.Math.NumberDto): number;
        tan(inputs: Inputs.Math.NumberDto): number;
        asin(inputs: Inputs.Math.NumberDto): number;
        acos(inputs: Inputs.Math.NumberDto): number;
        atan(inputs: Inputs.Math.NumberDto): number;
        exp(inputs: Inputs.Math.NumberDto): number;
        degToRad(inputs: Inputs.Math.NumberDto): number;
        radToDeg(inputs: Inputs.Math.NumberDto): number;
        ease(inputs: Inputs.Math.EaseDto): number;
        clamp(inputs: Inputs.Math.ClampDto): number;
        lerp(inputs: Inputs.Math.LerpDto): number;
        inverseLerp(inputs: Inputs.Math.InverseLerpDto): number;
        smoothstep(inputs: Inputs.Math.NumberDto): number;
        sign(inputs: Inputs.Math.NumberDto): number;
        fract(inputs: Inputs.Math.NumberDto): number;
        wrap(inputs: Inputs.Math.WrapDto): number;
        pingPong(inputs: Inputs.Math.PingPongDto): number;
        moveTowards(inputs: Inputs.Math.MoveTowardsDto): number;
        private easeInSine;
        private easeOutSine;
        private easeInOutSine;
        private easeInQuad;
        private easeOutQuad;
        private easeInOutQuad;
        private easeInCubic;
        private easeOutCubic;
        private easeInOutCubic;
        private easeInQuart;
        private easeOutQuart;
        private easeInOutQuart;
        private easeInQuint;
        private easeOutQuint;
        private easeInOutQuint;
        private easeInExpo;
        private easeOutExpo;
        private easeInOutExpo;
        private easeInCirc;
        private easeOutCirc;
        private easeInOutCirc;
        private easeInBack;
        private easeOutBack;
        private easeInOutBack;
        private easeInElastic;
        private easeOutElastic;
        private easeInOutElastic;
        private easeInBounce;
        private easeOutBounce;
        private easeInOutBounce;
    }
    declare class MeshBitByBit {
        private readonly vector;
        private readonly polyline;
        constructor(vector: Vector, polyline: Polyline);
        signedDistanceToPlane(inputs: Inputs.Mesh.SignedDistanceFromPlaneToPointDto): number;
        calculateTrianglePlane(inputs: Inputs.Mesh.TriangleToleranceDto): Inputs.Base.TrianglePlane3 | undefined;
        triangleTriangleIntersection(inputs: Inputs.Mesh.TriangleTriangleToleranceDto): Inputs.Base.Segment3 | undefined;
        meshMeshIntersectionSegments(inputs: Inputs.Mesh.MeshMeshToleranceDto): Inputs.Base.Segment3[];
        meshMeshIntersectionPolylines(inputs: Inputs.Mesh.MeshMeshToleranceDto): Inputs.Base.Polyline3[];
        meshMeshIntersectionPoints(inputs: Inputs.Mesh.MeshMeshToleranceDto): Inputs.Base.Point3[][];
        private computeIntersectionPoint;
    }
    declare class Point {
        private readonly geometryHelper;
        private readonly transforms;
        private readonly vector;
        private readonly lists;
        constructor(geometryHelper: GeometryHelper, transforms: Transforms, vector: Vector, lists: Lists);
        transformPoint(inputs: Inputs.Point.TransformPointDto): Inputs.Base.Point3;
        transformPoints(inputs: Inputs.Point.TransformPointsDto): Inputs.Base.Point3[];
        transformsForPoints(inputs: Inputs.Point.TransformsForPointsDto): Inputs.Base.Point3[];
        translatePoints(inputs: Inputs.Point.TranslatePointsDto): Inputs.Base.Point3[];
        translatePointsWithVectors(inputs: Inputs.Point.TranslatePointsWithVectorsDto): Inputs.Base.Point3[];
        translateXYZPoints(inputs: Inputs.Point.TranslateXYZPointsDto): Inputs.Base.Point3[];
        scalePointsCenterXYZ(inputs: Inputs.Point.ScalePointsCenterXYZDto): Inputs.Base.Point3[];
        stretchPointsDirFromCenter(inputs: Inputs.Point.StretchPointsDirFromCenterDto): Inputs.Base.Point3[];
        rotatePointsCenterAxis(inputs: Inputs.Point.RotatePointsCenterAxisDto): Inputs.Base.Point3[];
        boundingBoxOfPoints(inputs: Inputs.Point.PointsDto): Inputs.Base.BoundingBox;
        closestPointFromPointsDistance(inputs: Inputs.Point.ClosestPointFromPointsDto): number;
        closestPointFromPointsIndex(inputs: Inputs.Point.ClosestPointFromPointsDto): number;
        closestPointFromPoints(inputs: Inputs.Point.ClosestPointFromPointsDto): Inputs.Base.Point3;
        distance(inputs: Inputs.Point.StartEndPointsDto): number;
        distancesToPoints(inputs: Inputs.Point.StartEndPointsListDto): number[];
        multiplyPoint(inputs: Inputs.Point.MultiplyPointDto): Inputs.Base.Point3[];
        getX(inputs: Inputs.Point.PointDto): number;
        getY(inputs: Inputs.Point.PointDto): number;
        getZ(inputs: Inputs.Point.PointDto): number;
        averagePoint(inputs: Inputs.Point.PointsDto): Inputs.Base.Point3;
        pointXYZ(inputs: Inputs.Point.PointXYZDto): Inputs.Base.Point3;
        pointXY(inputs: Inputs.Point.PointXYDto): Inputs.Base.Point2;
        spiral(inputs: Inputs.Point.SpiralDto): Inputs.Base.Point3[];
        hexGrid(inputs: Inputs.Point.HexGridCentersDto): Inputs.Base.Point3[];
        hexGridScaledToFit(inputs: Inputs.Point.HexGridScaledToFitDto): Models.Point.HexGridData;
        maxFilletRadius(inputs: Inputs.Point.ThreePointsToleranceDto): number;
        maxFilletRadiusHalfLine(inputs: Inputs.Point.ThreePointsToleranceDto): number;
        maxFilletsHalfLine(inputs: Inputs.Point.PointsMaxFilletsHalfLineDto): number[];
        safestPointsMaxFilletHalfLine(inputs: Inputs.Point.PointsMaxFilletsHalfLineDto): number;
        removeConsecutiveDuplicates(inputs: Inputs.Point.RemoveConsecutiveDuplicatesDto): Inputs.Base.Point3[];
        normalFromThreePoints(inputs: Inputs.Point.ThreePointsNormalDto): Inputs.Base.Vector3;
        private closestPointFromPointData;
        twoPointsAlmostEqual(inputs: Inputs.Point.TwoPointsToleranceDto): boolean;
        sortPoints(inputs: Inputs.Point.PointsDto): Inputs.Base.Point3[];
        private getRegularHexagonVertices;
    }
    declare class Polyline {
        private readonly vector;
        private readonly point;
        private readonly line;
        private readonly geometryHelper;
        constructor(vector: Vector, point: Point, line: Line, geometryHelper: GeometryHelper);
        length(inputs: Inputs.Polyline.PolylineDto): number;
        countPoints(inputs: Inputs.Polyline.PolylineDto): number;
        getPoints(inputs: Inputs.Polyline.PolylineDto): Inputs.Base.Point3[];
        reverse(inputs: Inputs.Polyline.PolylineDto): Inputs.Polyline.PolylinePropertiesDto;
        transformPolyline(inputs: Inputs.Polyline.TransformPolylineDto): Inputs.Polyline.PolylinePropertiesDto;
        create(inputs: Inputs.Polyline.PolylineCreateDto): Inputs.Polyline.PolylinePropertiesDto;
        polylineToLines(inputs: Inputs.Polyline.PolylineDto): Inputs.Base.Line3[];
        polylineToSegments(inputs: Inputs.Polyline.PolylineDto): Inputs.Base.Segment3[];
        polylineSelfIntersection(inputs: Inputs.Polyline.PolylineToleranceDto): Inputs.Base.Point3[];
        twoPolylineIntersection(inputs: Inputs.Polyline.TwoPolylinesToleranceDto): Inputs.Base.Point3[];
        sortSegmentsIntoPolylines(inputs: Inputs.Polyline.SegmentsToleranceDto): Inputs.Base.Polyline3[];
        maxFilletsHalfLine(inputs: Inputs.Polyline.PolylineToleranceDto): number[];
        safestFilletRadius(inputs: Inputs.Polyline.PolylineToleranceDto): number;
    }
    declare class TextBitByBit {
        private readonly point;
        constructor(point: Point);
        create(inputs: Inputs.Text.TextDto): string;
        split(inputs: Inputs.Text.TextSplitDto): string[];
        replaceAll(inputs: Inputs.Text.TextReplaceDto): string;
        join(inputs: Inputs.Text.TextJoinDto): string;
        toString<T>(inputs: Inputs.Text.ToStringDto<T>): string;
        toStringEach<T>(inputs: Inputs.Text.ToStringEachDto<T>): string[];
        format(inputs: Inputs.Text.TextFormatDto): string;
        includes(inputs: Inputs.Text.TextSearchDto): boolean;
        startsWith(inputs: Inputs.Text.TextSearchDto): boolean;
        endsWith(inputs: Inputs.Text.TextSearchDto): boolean;
        indexOf(inputs: Inputs.Text.TextSearchDto): number;
        lastIndexOf(inputs: Inputs.Text.TextSearchDto): number;
        substring(inputs: Inputs.Text.TextSubstringDto): string;
        slice(inputs: Inputs.Text.TextSubstringDto): string;
        charAt(inputs: Inputs.Text.TextIndexDto): string;
        trim(inputs: Inputs.Text.TextDto): string;
        trimStart(inputs: Inputs.Text.TextDto): string;
        trimEnd(inputs: Inputs.Text.TextDto): string;
        padStart(inputs: Inputs.Text.TextPadDto): string;
        padEnd(inputs: Inputs.Text.TextPadDto): string;
        toUpperCase(inputs: Inputs.Text.TextDto): string;
        toLowerCase(inputs: Inputs.Text.TextDto): string;
        toUpperCaseFirst(inputs: Inputs.Text.TextDto): string;
        toLowerCaseFirst(inputs: Inputs.Text.TextDto): string;
        repeat(inputs: Inputs.Text.TextRepeatDto): string;
        reverse(inputs: Inputs.Text.TextDto): string;
        length(inputs: Inputs.Text.TextDto): number;
        isEmpty(inputs: Inputs.Text.TextDto): boolean;
        concat(inputs: Inputs.Text.TextConcatDto): string;
        regexTest(inputs: Inputs.Text.TextRegexDto): boolean;
        regexMatch(inputs: Inputs.Text.TextRegexDto): string[] | null;
        regexReplace(inputs: Inputs.Text.TextRegexReplaceDto): string;
        regexSearch(inputs: Inputs.Text.TextRegexDto): number;
        regexSplit(inputs: Inputs.Text.TextRegexDto): string[];
        vectorChar(inputs: Inputs.Text.VectorCharDto): Models.Text.VectorCharData;
        vectorText(inputs: Inputs.Text.VectorTextDto): Models.Text.VectorTextData[];
        private vectorParamsChar;
        private translateLine;
    }
    declare class Transforms {
        private readonly vector;
        private readonly math;
        constructor(vector: Vector, math: MathBitByBit);
        rotationCenterAxis(inputs: Inputs.Transforms.RotationCenterAxisDto): Base.TransformMatrixes;
        rotationCenterX(inputs: Inputs.Transforms.RotationCenterDto): Base.TransformMatrixes;
        rotationCenterY(inputs: Inputs.Transforms.RotationCenterDto): Base.TransformMatrixes;
        rotationCenterZ(inputs: Inputs.Transforms.RotationCenterDto): Base.TransformMatrixes;
        rotationCenterYawPitchRoll(inputs: Inputs.Transforms.RotationCenterYawPitchRollDto): Base.TransformMatrixes;
        scaleCenterXYZ(inputs: Inputs.Transforms.ScaleCenterXYZDto): Base.TransformMatrixes;
        scaleXYZ(inputs: Inputs.Transforms.ScaleXYZDto): Base.TransformMatrixes;
        stretchDirFromCenter(inputs: Inputs.Transforms.StretchDirCenterDto): Base.TransformMatrixes;
        uniformScale(inputs: Inputs.Transforms.UniformScaleDto): Base.TransformMatrixes;
        uniformScaleFromCenter(inputs: Inputs.Transforms.UniformScaleFromCenterDto): Base.TransformMatrixes;
        translationXYZ(inputs: Inputs.Transforms.TranslationXYZDto): Base.TransformMatrixes;
        translationsXYZ(inputs: Inputs.Transforms.TranslationsXYZDto): Base.TransformMatrixes[];
        identity(): Base.TransformMatrix;
        private translation;
        private scaling;
        private rotationAxis;
        private rotationX;
        private rotationY;
        private rotationZ;
        private rotationYawPitchRoll;
        private rotationMatrixFromQuat;
        private stretchDirection;
    }
    declare class Vector {
        private readonly math;
        private readonly geometryHelper;
        constructor(math: MathBitByBit, geometryHelper: GeometryHelper);
        removeAllDuplicateVectors(inputs: Inputs.Vector.RemoveAllDuplicateVectorsDto): number[][];
        removeConsecutiveDuplicateVectors(inputs: Inputs.Vector.RemoveConsecutiveDuplicateVectorsDto): number[][];
        vectorsTheSame(inputs: Inputs.Vector.VectorsTheSameDto): boolean;
        angleBetween(inputs: Inputs.Vector.TwoVectorsDto): number;
        angleBetweenNormalized2d(inputs: Inputs.Vector.TwoVectorsDto): number;
        positiveAngleBetween(inputs: Inputs.Vector.TwoVectorsReferenceDto): number;
        addAll(inputs: Inputs.Vector.VectorsDto): number[];
        add(inputs: Inputs.Vector.TwoVectorsDto): number[];
        all(inputs: Inputs.Vector.VectorBoolDto): boolean;
        cross(inputs: Inputs.Vector.TwoVectorsDto): number[];
        distSquared(inputs: Inputs.Vector.TwoVectorsDto): number;
        dist(inputs: Inputs.Vector.TwoVectorsDto): number;
        div(inputs: Inputs.Vector.VectorScalarDto): number[];
        domain(inputs: Inputs.Vector.VectorDto): number;
        dot(inputs: Inputs.Vector.TwoVectorsDto): number;
        finite(inputs: Inputs.Vector.VectorDto): boolean[];
        isZero(inputs: Inputs.Vector.VectorDto): boolean;
        lerp(inputs: Inputs.Vector.FractionTwoVectorsDto): number[];
        max(inputs: Inputs.Vector.VectorDto): number;
        min(inputs: Inputs.Vector.VectorDto): number;
        mul(inputs: Inputs.Vector.VectorScalarDto): number[];
        neg(inputs: Inputs.Vector.VectorDto): number[];
        normSquared(inputs: Inputs.Vector.VectorDto): number;
        norm(inputs: Inputs.Vector.VectorDto): number;
        normalized(inputs: Inputs.Vector.VectorDto): number[];
        onRay(inputs: Inputs.Vector.RayPointDto): number[];
        vectorXYZ(inputs: Inputs.Vector.VectorXYZDto): Inputs.Base.Vector3;
        vectorXY(inputs: Inputs.Vector.VectorXYDto): Inputs.Base.Vector2;
        range(inputs: Inputs.Vector.RangeMaxDto): number[];
        signedAngleBetween(inputs: Inputs.Vector.TwoVectorsReferenceDto): number;
        span(inputs: Inputs.Vector.SpanDto): number[];
        spanEaseItems(inputs: Inputs.Vector.SpanEaseItemsDto): number[];
        spanLinearItems(inputs: Inputs.Vector.SpanLinearItemsDto): number[];
        sub(inputs: Inputs.Vector.TwoVectorsDto): number[];
        sum(inputs: Inputs.Vector.VectorDto): number;
        lengthSq(inputs: Inputs.Vector.Vector3Dto): number;
        length(inputs: Inputs.Vector.Vector3Dto): number;
        parseNumbers(inputs: Inputs.Vector.VectorStringDto): number[];
    }
    declare class Asset {
        assetManager: AssetManager;
        constructor();
        getFile(inputs: Inputs.Asset.GetAssetDto): Promise<File>;
        getTextFile(inputs: Inputs.Asset.GetAssetDto): Promise<string>;
        getLocalFile(inputs: Inputs.Asset.GetAssetDto): Promise<File | File[]>;
        getLocalTextFile(inputs: Inputs.Asset.GetAssetDto): Promise<string | string[]>;
        fetchBlob(inputs: Inputs.Asset.FetchDto): Promise<Blob>;
        fetchFile(inputs: Inputs.Asset.FetchDto): Promise<File>;
        fetchJSON(inputs: Inputs.Asset.FetchDto): Promise<any>;
        fetchText(inputs: Inputs.Asset.FetchDto): Promise<string>;
        createObjectURL(inputs: Inputs.Asset.FileDto): string;
        createObjectURLs(inputs: Inputs.Asset.FilesDto): string[];
        download(inputs: Inputs.Asset.DownloadDto): void;
    }
    declare namespace BaseTypes {
        class IntervalDto {
            min: number;
            max: number;
        }
        class UVDto {
            u: number;
            v: number;
        }
        class CurveCurveIntersection {
            point0: number[];
            point1: number[];
            u0: number;
            u1: number;
        }
        class CurveSurfaceIntersection {
            u: number;
            uv: UVDto;
            curvePoint: number[];
            surfacePoint: number[];
        }
        class SurfaceSurfaceIntersectionPoint {
            uv0: UVDto;
            uv1: UVDto;
            point: number[];
            dist: number;
        }
    }
    declare class CSVBitByBit {
        parseToArray(inputs: Inputs.CSV.ParseToArrayDto): string[][];
        parseToJson<T = Record<string, string | number>>(inputs: Inputs.CSV.ParseToJsonDto): T[];
        parseToJsonWithHeaders<T = Record<string, string | number>>(inputs: Inputs.CSV.ParseToJsonWithHeadersDto): T[];
        queryColumn<T = Record<string, string | number>>(inputs: Inputs.CSV.QueryColumnDto): (string | number)[];
        queryRowsByValue<T = Record<string, string | number>>(inputs: Inputs.CSV.QueryRowsByValueDto): T[];
        arrayToCsv(inputs: Inputs.CSV.ArrayToCsvDto): string;
        jsonToCsv<T = Record<string, unknown>>(inputs: Inputs.CSV.JsonToCsvDto<T>): string;
        jsonToCsvAuto<T = Record<string, unknown>>(inputs: Inputs.CSV.JsonToCsvAutoDto<T>): string;
        getHeaders(inputs: Inputs.CSV.GetHeadersDto): string[];
        getRowCount(inputs: Inputs.CSV.GetRowCountDto): number;
        getColumnCount(inputs: Inputs.CSV.ParseToArrayDto): number;
        private parseCsvLine;
        private escapeCsvCell;
        private convertEscapeSequences;
    }
    declare class JSONBitByBit {
        private readonly context;
        constructor(context: ContextBase);
        stringify(inputs: Inputs.JSON.StringifyDto): string;
        parse(inputs: Inputs.JSON.ParseDto): any;
        query(inputs: Inputs.JSON.QueryDto): any;
        setValueOnProp(inputs: Inputs.JSON.SetValueOnPropDto): any;
        getJsonFromArrayByFirstPropMatch(inputs: Inputs.JSON.GetJsonFromArrayByFirstPropMatchDto): any;
        getValueOnProp(inputs: Inputs.JSON.GetValueOnPropDto): any;
        setValue(inputs: Inputs.JSON.SetValueDto): any;
        setValuesOnPaths(inputs: Inputs.JSON.SetValuesOnPathsDto): any;
        paths(inputs: Inputs.JSON.PathsDto): any;
        createEmpty(): any;
        previewAndSaveJson(inputs: Inputs.JSON.JsonDto): void;
        previewJson(inputs: Inputs.JSON.JsonDto): void;
    }
    declare class OCCTWIO extends OCCTIO {
        readonly occWorkerManager: OCCTWorkerManager;
        private readonly context;
        constructor(occWorkerManager: OCCTWorkerManager, context: ContextBase);
        loadSTEPorIGES(inputs: Inputs.OCCT.ImportStepIgesDto): Promise<Inputs.OCCT.TopoDSShapePointer>;
        loadSTEPorIGESFromText(inputs: Inputs.OCCT.ImportStepIgesFromTextDto): Promise<Inputs.OCCT.TopoDSShapePointer>;
    }
    declare class OCCTW extends OCCT {
        readonly context: ContextBase;
        readonly occWorkerManager: OCCTWorkerManager;
        readonly io: OCCTWIO;
        constructor(context: ContextBase, occWorkerManager: OCCTWorkerManager);
    }
    declare class Tag {
        private readonly context;
        constructor(context: ContextBase);
        create(inputs: Inputs.Tag.TagDto): Inputs.Tag.TagDto;
        drawTag(inputs: Inputs.Tag.DrawTagDto): Inputs.Tag.TagDto;
        drawTags(inputs: Inputs.Tag.DrawTagsDto): Inputs.Tag.TagDto[];
    }
    declare class Time {
        private context;
        constructor(context: ContextBase);
        registerRenderFunction(update: (timePassedMs: number) => void): void;
    }
    declare class VerbCurveCircle {
        private readonly context;
        private readonly math;
        constructor(context: ContextBase, math: MathBitByBit);
        createCircle(inputs: Inputs.Verb.CircleParametersDto): any;
        createArc(inputs: Inputs.Verb.ArcParametersDto): any;
        center(inputs: Inputs.Verb.CircleDto): number[];
        radius(inputs: Inputs.Verb.CircleDto): number;
        maxAngle(inputs: Inputs.Verb.CircleDto): number;
        minAngle(inputs: Inputs.Verb.CircleDto): number;
        xAxis(inputs: Inputs.Verb.CircleDto): number[];
        yAxis(inputs: Inputs.Verb.CircleDto): number[];
    }
    declare class VerbCurveEllipse {
        private readonly context;
        private readonly math;
        constructor(context: ContextBase, math: MathBitByBit);
        createEllipse(inputs: Inputs.Verb.EllipseParametersDto): any;
        createArc(inputs: Inputs.Verb.EllipseArcParametersDto): any;
        center(inputs: Inputs.Verb.EllipseDto): number[];
        maxAngle(inputs: Inputs.Verb.EllipseDto): number;
        minAngle(inputs: Inputs.Verb.EllipseDto): number;
        xAxis(inputs: Inputs.Verb.EllipseDto): number[];
        yAxis(inputs: Inputs.Verb.EllipseDto): number[];
    }
    declare class VerbCurve {
        private readonly context;
        private readonly geometryHelper;
        private readonly math;
        readonly circle: VerbCurveCircle;
        readonly ellipse: VerbCurveEllipse;
        constructor(context: ContextBase, geometryHelper: GeometryHelper, math: MathBitByBit);
        createCurveByKnotsControlPointsWeights(inputs: Inputs.Verb.CurveNurbsDataDto): any;
        createCurveByPoints(inputs: Inputs.Verb.CurvePathDataDto): any;
        convertLinesToNurbsCurves(inputs: Inputs.Verb.LinesDto): any[];
        convertLineToNurbsCurve(inputs: Inputs.Verb.LineDto): any;
        convertPolylineToNurbsCurve(inputs: Inputs.Verb.PolylineDto): any;
        convertPolylinesToNurbsCurves(inputs: Inputs.Verb.PolylinesDto): any[];
        createBezierCurve(inputs: Inputs.Verb.BezierCurveDto): any;
        clone(inputs: Inputs.Verb.CurveDto): any;
        closestParam(inputs: Inputs.Verb.ClosestPointDto): number;
        closestParams(inputs: Inputs.Verb.ClosestPointsDto): number[];
        closestPoint(inputs: Inputs.Verb.ClosestPointDto): Inputs.Base.Point3;
        closestPoints(inputs: Inputs.Verb.ClosestPointsDto): Inputs.Base.Point3[];
        controlPoints(inputs: Inputs.Verb.CurveDto): Inputs.Base.Point3[];
        degree(inputs: Inputs.Verb.CurveDto): number;
        derivatives(inputs: Inputs.Verb.CurveDerivativesDto): number[];
        divideByEqualArcLengthToParams(inputs: Inputs.Verb.CurveSubdivisionsDto): number[];
        divideByEqualArcLengthToPoints(inputs: Inputs.Verb.CurveSubdivisionsDto): Inputs.Base.Point3[];
        divideByArcLengthToParams(inputs: Inputs.Verb.CurveDivideLengthDto): number[];
        divideByArcLengthToPoints(inputs: Inputs.Verb.CurveDivideLengthDto): Inputs.Base.Point3[];
        divideCurvesByEqualArcLengthToPoints(inputs: Inputs.Verb.CurvesSubdivisionsDto): Inputs.Base.Point3[][];
        divideCurvesByArcLengthToPoints(inputs: Inputs.Verb.CurvesDivideLengthDto): Inputs.Base.Point3[][];
        domain(inputs: Inputs.Verb.CurveDto): BaseTypes.IntervalDto;
        startPoint(inputs: Inputs.Verb.CurveDto): Inputs.Base.Point3;
        endPoint(inputs: Inputs.Verb.CurveDto): Inputs.Base.Point3;
        startPoints(inputs: Inputs.Verb.CurvesDto): Inputs.Base.Point3[];
        endPoints(inputs: Inputs.Verb.CurvesDto): Inputs.Base.Point3[];
        knots(inputs: Inputs.Verb.CurveDto): number[];
        lengthAtParam(inputs: Inputs.Verb.CurveParameterDto): number;
        length(inputs: Inputs.Verb.CurveDto): number;
        paramAtLength(inputs: Inputs.Verb.CurveLengthToleranceDto): number;
        pointAtParam(inputs: Inputs.Verb.CurveParameterDto): Inputs.Base.Point3;
        pointsAtParam(inputs: Inputs.Verb.CurvesParameterDto): Inputs.Base.Point3[];
        reverse(inputs: Inputs.Verb.CurveDto): any;
        split(inputs: Inputs.Verb.CurveParameterDto): any[];
        tangent(inputs: Inputs.Verb.CurveParameterDto): Inputs.Base.Vector3;
        tessellate(inputs: Inputs.Verb.CurveToleranceDto): Inputs.Base.Point3[];
        transform(inputs: Inputs.Verb.CurveTransformDto): any;
        transformCurves(inputs: Inputs.Verb.CurvesTransformDto): any[];
        weights(inputs: Inputs.Verb.CurveDto): number[];
    }
    declare class VerbIntersect {
        private readonly context;
        private readonly geometryHelper;
        constructor(context: ContextBase, geometryHelper: GeometryHelper);
        curves(inputs: Inputs.Verb.CurveCurveDto): BaseTypes.CurveCurveIntersection[];
        curveAndSurface(inputs: Inputs.Verb.CurveSurfaceDto): BaseTypes.CurveSurfaceIntersection[];
        surfaces(inputs: Inputs.Verb.SurfaceSurfaceDto): any[];
        curveCurveFirstParams(inputs: Inputs.Verb.CurveCurveIntersectionsDto): number[];
        curveCurveSecondParams(inputs: Inputs.Verb.CurveCurveIntersectionsDto): number[];
        curveCurveFirstPoints(inputs: Inputs.Verb.CurveCurveIntersectionsDto): number[][];
        curveCurveSecondPoints(inputs: Inputs.Verb.CurveCurveIntersectionsDto): number[][];
        curveSurfaceCurveParams(inputs: Inputs.Verb.CurveSurfaceIntersectionsDto): number[];
        curveSurfaceSurfaceParams(inputs: Inputs.Verb.CurveSurfaceIntersectionsDto): BaseTypes.UVDto[];
        curveSurfaceCurvePoints(inputs: Inputs.Verb.CurveSurfaceIntersectionsDto): number[][];
        curveSurfaceSurfacePoints(inputs: Inputs.Verb.CurveSurfaceIntersectionsDto): number[][];
    }
    declare class VerbSurfaceConical {
        private readonly context;
        constructor(context: ContextBase);
        create(inputs: Inputs.Verb.ConeAndCylinderParametersDto): any;
        axis(inputs: Inputs.Verb.ConeDto): number[];
        base(inputs: Inputs.Verb.ConeDto): number[];
        height(inputs: Inputs.Verb.ConeDto): number;
        radius(inputs: Inputs.Verb.ConeDto): number;
        xAxis(inputs: Inputs.Verb.ConeDto): number[];
    }
    declare class VerbSurfaceCylindrical {
        private readonly context;
        constructor(context: ContextBase);
        create(inputs: Inputs.Verb.ConeAndCylinderParametersDto): any;
        axis(inputs: Inputs.Verb.CylinderDto): number[];
        base(inputs: Inputs.Verb.CylinderDto): number[];
        height(inputs: Inputs.Verb.CylinderDto): number;
        radius(inputs: Inputs.Verb.CylinderDto): number;
        xAxis(inputs: Inputs.Verb.CylinderDto): number[];
    }
    declare class VerbSurfaceExtrusion {
        private readonly context;
        constructor(context: ContextBase);
        create(inputs: Inputs.Verb.ExtrusionParametersDto): any;
        direction(inputs: Inputs.Verb.ExtrusionDto): number[];
        profile(inputs: Inputs.Verb.ExtrusionDto): number[];
    }
    declare class VerbSurfaceRevolved {
        private readonly context;
        private readonly math;
        constructor(context: ContextBase, math: MathBitByBit);
        create(inputs: Inputs.Verb.RevolutionParametersDto): any;
        profile(inputs: Inputs.Verb.RevolutionDto): any;
        center(inputs: Inputs.Verb.RevolutionDto): number[];
        axis(inputs: Inputs.Verb.RevolutionDto): number[];
        angle(inputs: Inputs.Verb.RevolutionDto): number;
    }
    declare class VerbSurfaceSpherical {
        private readonly context;
        constructor(context: ContextBase);
        create(inputs: Inputs.Verb.SphericalParametersDto): any;
        radius(inputs: Inputs.Verb.SphereDto): number;
        center(inputs: Inputs.Verb.SphereDto): number[];
    }
    declare class VerbSurfaceSweep {
        private readonly context;
        constructor(context: ContextBase);
        create(inputs: Inputs.Verb.SweepParametersDto): any;
        profile(inputs: Inputs.Verb.SweepDto): any;
        rail(inputs: Inputs.Verb.SweepDto): any;
    }
    declare class VerbSurface {
        private readonly context;
        private readonly geometryHelper;
        private readonly math;
        readonly cone: VerbSurfaceConical;
        readonly cylinder: VerbSurfaceCylindrical;
        readonly extrusion: VerbSurfaceExtrusion;
        readonly sphere: VerbSurfaceSpherical;
        readonly revolved: VerbSurfaceRevolved;
        readonly sweep: VerbSurfaceSweep;
        constructor(context: ContextBase, geometryHelper: GeometryHelper, math: MathBitByBit);
        boundaries(inputs: Inputs.Verb.SurfaceDto): any[];
        createSurfaceByCorners(inputs: Inputs.Verb.CornersDto): any;
        createSurfaceByKnotsControlPointsWeights(inputs: Inputs.Verb.KnotsControlPointsWeightsDto): any;
        createSurfaceByLoftingCurves(inputs: Inputs.Verb.LoftCurvesDto): any;
        clone(inputs: Inputs.Verb.SurfaceDto): any;
        closestParam(inputs: Inputs.Verb.SurfaceParamDto): BaseTypes.UVDto;
        closestPoint(inputs: Inputs.Verb.SurfaceParamDto): number[];
        controlPoints(inputs: Inputs.Verb.SurfaceDto): number[][][];
        degreeU(inputs: Inputs.Verb.SurfaceDto): number;
        degreeV(inputs: Inputs.Verb.SurfaceDto): number;
        derivatives(inputs: Inputs.Verb.DerivativesDto): number[][][];
        domainU(inputs: Inputs.Verb.SurfaceDto): BaseTypes.IntervalDto;
        domainV(inputs: Inputs.Verb.SurfaceDto): BaseTypes.IntervalDto;
        isocurve(inputs: Inputs.Verb.SurfaceParameterDto): any;
        isocurvesSubdivision(inputs: Inputs.Verb.IsocurveSubdivisionDto): any[];
        isocurvesAtParams(inputs: Inputs.Verb.IsocurvesParametersDto): any[];
        knotsU(inputs: Inputs.Verb.SurfaceDto): number[];
        knotsV(inputs: Inputs.Verb.SurfaceDto): number[];
        normal(inputs: Inputs.Verb.SurfaceLocationDto): number[];
        point(inputs: Inputs.Verb.SurfaceLocationDto): number[];
        reverse(inputs: Inputs.Verb.SurfaceDto): any;
        split(inputs: Inputs.Verb.SurfaceParameterDto): any[];
        transformSurface(inputs: Inputs.Verb.SurfaceTransformDto): any;
        weights(inputs: Inputs.Verb.SurfaceDto): number[][];
    }
    declare class Verb {
        private readonly math;
        readonly curve: VerbCurve;
        readonly surface: VerbSurface;
        readonly intersect: VerbIntersect;
        constructor(context: ContextBase, geometryHelper: GeometryHelper, math: MathBitByBit);
    }
    declare class AdvancedAdv {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        text3d: Text3D;
        patterns: Patterns;
        navigation: Navigation;
        dimensions: Dimensions;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw);
    }
    declare class Dimensions {
        private readonly context;
        constructor(context: ContextComplete);
        linearDimension(inputs: Advanced.Dimensions.LinearDimensionDto): Advanced.Dimensions.LinearDimensionEntity;
        angularDimension(inputs: Advanced.Dimensions.AngularDimensionDto): Advanced.Dimensions.AngularDimensionEntity;
        radialDimension(inputs: Advanced.Dimensions.RadialDimensionDto): Advanced.Dimensions.RadialDimensionEntity;
        diametralDimension(inputs: Advanced.Dimensions.DiametralDimensionDto): Advanced.Dimensions.DiametralDimensionEntity;
        ordinateDimension(inputs: Advanced.Dimensions.OrdinateDimensionDto): Advanced.Dimensions.OrdinateDimensionEntity;
        dimensionStyle(inputs: Advanced.Dimensions.DimensionStyleDto): Advanced.Dimensions.DimensionStyleDto;
        drawLinearDimension(inputs: Advanced.Dimensions.LinearDimensionEntity): {
            dispose: () => void;
        };
        drawAngularDimension(inputs: Advanced.Dimensions.AngularDimensionEntity): {
            dispose: () => void;
        };
        drawRadialDimension(inputs: Advanced.Dimensions.RadialDimensionEntity): {
            dispose: () => void;
        };
        drawDiametralDimension(inputs: Advanced.Dimensions.DiametralDimensionEntity): {
            dispose: () => void;
        };
        drawOrdinateDimension(inputs: Advanced.Dimensions.OrdinateDimensionEntity): {
            dispose: () => void;
        };
    }
    declare class AngularDimension {
        private scene;
        private data;
        private style;
        private arc;
        private extensionLine1;
        private extensionLine2;
        private tangentExtension1;
        private tangentExtension2;
        private arrow1;
        private arrow2;
        private dimensionText3D;
        private static readonly DEFAULT_STYLE;
        constructor(options: AngularDimensionDto, scene: BABYLON.Scene);
        private createDimension;
        private createArc;
        private createArrowTailExtensions;
        private createLine;
        private createArrow;
        private createText;
        dispose(): void;
    }
    declare class DiametralDimension {
        private scene;
        private data;
        private style;
        private diameterLine;
        private centerMark;
        private arrow1;
        private arrow2;
        private dimensionText3D;
        constructor(options: DiametralDimensionDto, scene: BABYLON.Scene);
        private create;
        private createLine;
        private createCenterMark;
        private createArrow;
        private createText;
        dispose(): void;
    }
    declare class DimensionExpressionService {
        static evaluate(expression: string, value: number, decimalPlaces: number, removeTrailingZeros?: boolean): string;
        static formatDimensionText(value: number, labelOverwrite: string | undefined, decimalPlaces: number, labelSuffix: string, removeTrailingZeros?: boolean, prefix?: string): string;
        static formatLinearText(distance: number, labelOverwrite: string | undefined, decimalPlaces: number, labelSuffix: string, removeTrailingZeros?: boolean): string;
        static formatAngularText(angle: number, labelOverwrite: string | undefined, decimalPlaces: number, labelSuffix: string, removeTrailingZeros?: boolean): string;
        static formatRadialText(radius: number, showDiameter: boolean, labelOverwrite: string | undefined, decimalPlaces: number, labelSuffix: string, removeTrailingZeros?: boolean): string;
        static formatDiametralText(diameter: number, labelOverwrite: string | undefined, decimalPlaces: number, labelSuffix: string, removeTrailingZeros?: boolean): string;
        static formatOrdinateText(coordinate: number, axisName: string, labelOverwrite: string | undefined, decimalPlaces: number, labelSuffix: string, removeTrailingZeros?: boolean): string;
    }
    declare class DimensionManager {
        private linearDimensions;
        private angularDimensions;
        private radialDimensions;
        private diametralDimensions;
        private ordinateDimensions;
        addLinearDimension(dimension: LinearDimension): void;
        removeLinearDimension(dimension: LinearDimension): void;
        addAngularDimension(dimension: AngularDimension): void;
        removeAngularDimension(dimension: AngularDimension): void;
        addRadialDimension(dimension: RadialDimension): void;
        removeRadialDimension(dimension: RadialDimension): void;
        addDiametralDimension(dimension: DiametralDimension): void;
        removeDiametralDimension(dimension: DiametralDimension): void;
        addOrdinateDimension(dimension: OrdinateDimension): void;
        removeOrdinateDimension(dimension: OrdinateDimension): void;
        clearAllDimensions(): void;
        dispose(): void;
    }
    interface GuiTextElements {
        textAnchor: BABYLON.TransformNode;
        textContainer: GUI.Rectangle;
        textBlock: GUI.TextBlock;
    }
    declare class DimensionRenderingService {
        static createLine(scene: BABYLON.Scene, points: BABYLON.Vector3[], name: string, style: DimensionStyleDto, dimensionType: string): BABYLON.Mesh;
        static createArrow(scene: BABYLON.Scene, position: BABYLON.Vector3, direction: BABYLON.Vector3, name: string, style: DimensionStyleDto, dimensionType: string): BABYLON.Mesh;
        static create3DText(scene: BABYLON.Scene, text: string, position: BABYLON.Vector3, style: DimensionStyleDto): DimensionText3D;
        static createGuiText(scene: BABYLON.Scene, adt: GUI.AdvancedDynamicTexture, text: string, position: BABYLON.Vector3, style: DimensionStyleDto): GuiTextElements;
        static createCenterMark(scene: BABYLON.Scene, center: BABYLON.Vector3, style: DimensionStyleDto, dimensionType: string): BABYLON.Mesh;
    }
    declare class DimensionServiceManager {
        private static idCounter;
        static generateId(type: string): string;
        static createVector3FromArray(arr: [
            number,
            number,
            number
        ]): BABYLON.Vector3;
        static getDimensionMaterial(scene: BABYLON.Scene, color: string, materialType?: "line" | "arrow"): BABYLON.StandardMaterial;
    }
    interface Text3DOptions {
        text: string;
        position: BABYLON.Vector3;
        size?: number;
        fontWeight?: number;
        color?: string;
        backgroundColor?: string;
        backgroundOpacity?: number;
        backgroundStroke?: boolean;
        backgroundStrokeThickness?: number;
        backgroundRadius?: number;
        stableSize?: boolean;
        billboardMode?: boolean;
        alwaysOnTop?: boolean;
        name?: string;
    }
    declare class DimensionText3D {
        private scene;
        private textMesh;
        private material;
        private dynamicTexture;
        private options;
        constructor(scene: BABYLON.Scene, options: Text3DOptions);
        private createTextMesh;
        private setupDistanceScaling;
        private measureText;
        updateText(newText: string): void;
        updatePosition(position: BABYLON.Vector3): void;
        getMesh(): BABYLON.Mesh | null;
        dispose(): void;
    }
    declare class LinearDimension {
        private scene;
        private data;
        private style;
        private dimensionLine;
        private extensionLine1;
        private extensionLine2;
        private arrow1;
        private arrow2;
        private arrowTail1;
        private arrowTail2;
        private dimensionText3D;
        private static readonly DEFAULT_STYLE;
        constructor(options: LinearDimensionDto, scene: BABYLON.Scene);
        private createDimension;
        private createLine;
        private createArrow;
        private createText;
        dispose(): void;
    }
    declare class OrdinateDimension {
        private scene;
        private data;
        private style;
        private leaderLine;
        private arrow;
        private dimensionText3D;
        constructor(options: OrdinateDimensionDto, scene: BABYLON.Scene);
        private create;
        private calculateOffsetDirection;
        private createLine;
        private createArrow;
        private createText;
        dispose(): void;
    }
    declare class RadialDimension {
        private scene;
        private data;
        private style;
        private radiusLine;
        private centerMark;
        private arrow;
        private dimensionText3D;
        constructor(options: RadialDimensionDto, scene: BABYLON.Scene);
        private create;
        private createLine;
        private createCenterMark;
        private createArrow;
        private createText;
        dispose(): void;
    }
    declare class CameraManager {
        private scene;
        private camera;
        private readonly animationFrameRate;
        private readonly animationDurationInFrames;
        constructor(scene: BABYLON.Scene);
        flyTo(newPosition: BABYLON.Vector3, newTarget: BABYLON.Vector3): void;
    }
    declare class PointOfInterest {
        private scene;
        private data;
        private style;
        private time;
        private pointSphere;
        private pulseRing;
        private clickSphere;
        private labelText;
        private labelContainer;
        private containerNode;
        private pointMaterial;
        private pulseMaterial;
        private camera;
        private static readonly DEFAULT_STYLE;
        constructor(options: PointOfInterestDto, scene: BABYLON.Scene, onClick: () => void);
        private create3DVisual;
        private setupDistanceScaling;
        private updateLabelPosition;
        private createMaterials;
        private createLabelText;
        private updateLabelText;
        private setupInteractions;
        animatePulse(): void;
        dispose(): void;
    }
    declare class Navigation {
        private readonly context;
        constructor(context: ContextComplete);
        pointOfInterest(inputs: Advanced.Navigation.PointOfInterestDto): Advanced.Navigation.PointOfInterestEntity;
        pointOfInterestStyle(inputs: Advanced.Navigation.PointOfInterestStyleDto): Advanced.Navigation.PointOfInterestStyleDto;
        zoomOn(inputs: Advanced.Navigation.ZoomOnDto): Promise<void>;
        zoomOnAspect(inputs: Advanced.Navigation.ZoomOnDto): Promise<void>;
        focusFromAngle(inputs: Advanced.Navigation.FocusFromAngleDto): Promise<void>;
        drawPointOfInterest(inputs: Advanced.Navigation.PointOfInterestEntity): {
            dispose: () => void;
        };
    }
    declare class FacePatterns {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        pyramidSimple: PyramidSimple;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw);
    }
    declare class PyramidSimple {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw);
        createPyramidSimple(inputs: Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleData<Inputs.OCCT.TopoDSShapePointer>>;
        createPyramidSimpleAffectors(inputs: Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleAffectorsDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleData<Inputs.OCCT.TopoDSShapePointer>>;
        drawModel(inputs: Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleData<Inputs.OCCT.TopoDSShapePointer>): Promise<Mesh>;
        getCompoundShape(inputs: Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getCompoundShapeOnFace(inputs: Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleModelFaceIndexDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getCompoundShapeCellOnFace(inputs: Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleModelFaceCellIndexDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getAllPyramidCells(inputs: Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleModelDto<Inputs.OCCT.TopoDSShapePointer>): Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleCellPart<Inputs.OCCT.TopoDSShapePointer>[];
        getAllPyramidCellsOnFace(inputs: Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleModelFaceIndexDto<Inputs.OCCT.TopoDSShapePointer>): Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleCellPart<Inputs.OCCT.TopoDSShapePointer>[];
        getAllPyramidUCellsOnFace(inputs: Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleModelFaceIndexDto<Inputs.OCCT.TopoDSShapePointer>): Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleCellPart<Inputs.OCCT.TopoDSShapePointer>[];
        getAllPyramidUCellsOnFaceAtU(inputs: Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleModelFaceCellsUIndexDto<Inputs.OCCT.TopoDSShapePointer>): Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleCellPart<Inputs.OCCT.TopoDSShapePointer>[];
        getAllPyramidUCellsOnFaceAtV(inputs: Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleModelFaceCellsVIndexDto<Inputs.OCCT.TopoDSShapePointer>): Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleCellPart<Inputs.OCCT.TopoDSShapePointer>[];
        getCellOnIndex(inputs: Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleModelFaceCellIndexDto<Inputs.OCCT.TopoDSShapePointer>): Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleCellPart<Inputs.OCCT.TopoDSShapePointer>;
        getTopPointsOfCells(inputs: Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleModelCellsDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.Base.Point3[];
        getCenterPointsOfCells(inputs: Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleModelCellsDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.Base.Point3[];
        getCornerPointsOfCells(inputs: Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleModelCellsDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.Base.Point3[][];
        getCornerPointOfCells(inputs: Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleModelCellsIndexDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.Base.Point3[];
        getCornerNormalOfCells(inputs: Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleModelCellsIndexDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.Base.Point3[];
        getCornerNormalsOfCells(inputs: Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleModelCellsDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.Base.Point3[][];
        getCompoundShapesOfCells(inputs: Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleModelCellsDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer[];
        getFaceShapesOfCells(inputs: Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleModelCellsIndexDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer[];
        getWireShapesOfCells(inputs: Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleModelCellsIndexDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer[];
        getStartPolylineWireU(inputs: Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleModelFaceIndexDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getEndPolylineWireU(inputs: Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleModelFaceIndexDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getStartPolylineWireV(inputs: Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleModelFaceIndexDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getEndPolylineWireV(inputs: Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleModelFaceIndexDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getPolylineWiresUCompound(inputs: Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleModelFaceIndexDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getPolylineWiresVCompound(inputs: Advanced.Patterns.FacePatterns.PyramidSimple.PyramidSimpleModelFaceIndexDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
    }
    declare class Patterns {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        facePatterns: FacePatterns;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw);
    }
    declare class Text3D {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw);
        create(inputs: Advanced.Text3D.Text3DDto): Promise<Advanced.Text3D.Text3DData<Inputs.OCCT.TopoDSShapePointer>>;
        createWithUrl(inputs: Advanced.Text3D.Text3DUrlDto): Promise<Advanced.Text3D.Text3DData<Inputs.OCCT.TopoDSShapePointer>>;
        createTextOnFace(inputs: Advanced.Text3D.Text3DFaceDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Advanced.Text3D.Text3DData<Inputs.OCCT.TopoDSShapePointer>>;
        createTextOnFaceUrl(inputs: Advanced.Text3D.Text3DFaceUrlDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Advanced.Text3D.Text3DData<Inputs.OCCT.TopoDSShapePointer>>;
        createTextsOnFace(inputs: Advanced.Text3D.Texts3DFaceDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Advanced.Text3D.Text3DData<Inputs.OCCT.TopoDSShapePointer>>;
        createTextsOnFaceUrl(inputs: Advanced.Text3D.Texts3DFaceUrlDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Advanced.Text3D.Text3DData<Inputs.OCCT.TopoDSShapePointer>>;
        definition3dTextOnFace(inputs: Advanced.Text3D.Text3DFaceDefinitionDto): Advanced.Text3D.Text3DFaceDefinitionDto;
        definition3dTextOnFaceUrl(inputs: Advanced.Text3D.Text3DFaceDefinitionUrlDto): Advanced.Text3D.Text3DFaceDefinitionUrlDto;
        drawModel(inputs: Advanced.Text3D.Text3DData<Inputs.OCCT.TopoDSShapePointer>, precision?: number): Promise<BABYLON.Mesh>;
        getCompoundShape(inputs: Advanced.Text3D.Text3DModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getCharacterShape(inputs: Advanced.Text3D.Text3DLetterByIndexDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getCharacterShapes(inputs: Advanced.Text3D.Text3DModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer[];
        getCharacterCenterCoordinates(inputs: Advanced.Text3D.Text3DModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.Base.Point3[];
        getFaceCutout(inputs: Advanced.Text3D.Text3DModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getAllFacesOfCutout(inputs: Advanced.Text3D.Text3DModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer[];
        getCutoutsInsideCharacters(inputs: Advanced.Text3D.Text3DModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer[];
        getAdvanceWidth(inputs: Advanced.Text3D.Text3DModelDto<Inputs.OCCT.TopoDSShapePointer>): number;
    }
    declare class ContextComplete extends Context {
        advancedDynamicTextureForFullscreenUI: GUI.AdvancedDynamicTexture;
        pointsOfInterestSystem: {
            observer: BABYLON.Observer<BABYLON.Scene>;
            pois: BABYLON.Nullable<PointOfInterest>[];
            cameraManager: CameraManager;
        };
        dimensionsSystem: {
            dimensionManager: DimensionManager;
        };
    }
    declare class DrawComplete extends Draw {
        readonly drawHelper: DrawHelper;
        readonly node: BabylonNode;
        readonly tag: Tag;
        private readonly things;
        private readonly advanced;
        readonly context: Context;
        constructor(drawHelper: DrawHelper, node: BabylonNode, tag: Tag, things: ThingsAdv, advanced: AdvancedAdv, context: Context);
        drawAnyAsync(inputs: Inputs.Draw.DrawAny): Promise<any>;
        drawGridMesh(inputs: Inputs.Draw.SceneDrawGridMeshDto): BABYLON.Mesh;
        optionsSimple(inputs: Inputs.Draw.DrawBasicGeometryOptions): Inputs.Draw.DrawBasicGeometryOptions;
        optionsOcctShape(inputs: Inputs.Draw.DrawOcctShapeOptions): Inputs.Draw.DrawOcctShapeOptions;
        optionsBabylonNode(inputs: Inputs.Draw.DrawNodeOptions): Inputs.Draw.DrawNodeOptions;
    }
    declare class CreateMaterialDto {
        constructor(s: CreateMaterialDto);
        name: string;
        scene: BABYLON.Scene | undefined;
        wAng?: number;
        uScale?: number;
        vScale?: number;
        color?: string;
        albedoTextureUrl?: string;
        microSurfaceTextureUrl?: string;
        bumpTextureUrl?: string;
        metallic: number;
        roughness: number;
        zOffset: number;
    }
    declare class MaterialsService {
        static textures: {
            wood1: {
                microSurfaceTexture: string;
                light: {
                    albedo: string;
                };
                dark: {
                    albedo: string;
                };
            };
            wood2: {
                microSurfaceTexture: string;
                light: {
                    albedo: string;
                };
            };
            metal1: {
                microSurfaceTexture: string;
                light: {
                    albedo: string;
                    normalGL: string;
                    roughness: string;
                    metalness: string;
                };
            };
            brownPlanks: {
                microSurfaceTexture: string;
                light: {
                    albedo: string;
                };
            };
            woodenPlanks: {
                microSurfaceTexture: string;
                light: {
                    albedo: string;
                };
            };
            brushedConcrete: {
                microSurfaceTexture: string;
                sand: {
                    albedo: string;
                };
                grey: {
                    albedo: string;
                };
            };
            rock1: {
                microSurfaceTexture: string;
                default: {
                    albedo: string;
                    roughness: string;
                };
            };
        };
        static simpleBlackMaterial(scene: any): BABYLON.PBRMaterial;
        static rock1Material(scene: BABYLON.Scene, wAng: number, scale: number): BABYLON.PBRMaterial;
        static wood1Material(scene: BABYLON.Scene, wAng: number, scale: number): BABYLON.PBRMaterial;
        static wood2Material(scene: BABYLON.Scene, wAng: number, scale: number): BABYLON.PBRMaterial;
        static wood3Material(scene: BABYLON.Scene, wAng: number, scale: number): BABYLON.PBRMaterial;
        static brownPlanks(scene: BABYLON.Scene, wAng: number, scale: number): BABYLON.PBRMaterial;
        static woodenPlanks(scene: BABYLON.Scene, wAng: number, scale: number): BABYLON.PBRMaterial;
        static glass(scene: BABYLON.Scene, albedoColor: string): BABYLON.PBRMaterial;
        static brushedConcrete(scene: BABYLON.Scene, wAng: number, scale: number): BABYLON.PBRMaterial;
        static metal1(scene: BABYLON.Scene, wAng: number, scale: number): BABYLON.PBRMaterial;
        static roughPlastic(scene: BABYLON.Scene, color: string): BABYLON.PBRMaterial;
        private static createMaterial;
        private static createTexture;
    }
    declare class ThreeDPrinting {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        private readonly occt;
        vases: Vases;
        medals: Medals;
        cups: Cups;
        desktop: Desktop;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw, occt: OCCTW);
    }
    declare class Boxes {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        spicyBox: SpicyBox;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw);
    }
    declare class SpicyBox {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw);
        create(inputs: Things.ThreeDPrinting.Boxes.SpicyBox.SpicyBoxDto): Promise<Things.ThreeDPrinting.Boxes.SpicyBox.SpicyBoxData<Inputs.OCCT.TopoDSShapePointer>>;
        getCompoundShape(inputs: Things.ThreeDPrinting.Boxes.SpicyBox.SpicyBoxModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        drawModel(inputs: Things.ThreeDPrinting.Boxes.SpicyBox.SpicyBoxData<Inputs.OCCT.TopoDSShapePointer>): Promise<BABYLON.Mesh>;
    }
    declare class CalmCup {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        private readonly occt;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw, occt: OCCTW);
        create(inputs: Things.ThreeDPrinting.Cups.CalmCup.CalmCupDto): Promise<Things.ThreeDPrinting.Cups.CalmCup.CalmCupData<Inputs.OCCT.TopoDSShapePointer>>;
        drawModel(inputs: Things.ThreeDPrinting.Cups.CalmCup.CalmCupData<Inputs.OCCT.TopoDSShapePointer>): Promise<BABYLON.Mesh>;
        dispose(inputs: Things.ThreeDPrinting.Vases.SerenitySwirl.SerenitySwirlData<Inputs.OCCT.TopoDSShapePointer>): Promise<void>;
    }
    declare class Cups {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        private readonly occt;
        calmCup: CalmCup;
        dragonCup: DragonCup;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw, occt: OCCTW);
    }
    declare class DragonCup {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw);
        create(inputs: Things.ThreeDPrinting.Cups.DragonCup.DragonCupDto): Promise<Things.ThreeDPrinting.Cups.DragonCup.DragonCupData<Inputs.OCCT.TopoDSShapePointer>>;
        getCompoundShape(inputs: Things.ThreeDPrinting.Cups.DragonCup.DragonCupModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        drawModel(inputs: Things.ThreeDPrinting.Cups.DragonCup.DragonCupData<Inputs.OCCT.TopoDSShapePointer>): Promise<BABYLON.Mesh>;
    }
    declare class Desktop {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        private readonly occt;
        phoneNest: PhoneNest;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw, occt: OCCTW);
    }
    declare class PhoneNest {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        private readonly occt;
        private materials;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw, occt: OCCTW);
        create(inputs: Things.ThreeDPrinting.Desktop.PhoneNest.PhoneNestDto): Promise<Things.ThreeDPrinting.Desktop.PhoneNest.PhoneNestData<Inputs.OCCT.TopoDSShapePointer>>;
        getCompoundShape(inputs: Things.ThreeDPrinting.Desktop.PhoneNest.PhoneNestModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        drawOptions(inputs: Things.ThreeDPrinting.Desktop.PhoneNest.PhoneNestDrawDto<BABYLON.PBRMetallicRoughnessMaterial>): Things.ThreeDPrinting.Desktop.PhoneNest.PhoneNestDrawDto<BABYLON.PBRMetallicRoughnessMaterial>;
        drawModel(model: Things.ThreeDPrinting.Desktop.PhoneNest.PhoneNestData<Inputs.OCCT.TopoDSShapePointer>, options: Things.ThreeDPrinting.Desktop.PhoneNest.PhoneNestDrawDto<BABYLON.PBRMetallicRoughnessMaterial>): Promise<BABYLON.Mesh>;
        dispose(inputs: Things.ThreeDPrinting.Desktop.PhoneNest.PhoneNestData<Inputs.OCCT.TopoDSShapePointer>): Promise<void>;
        private createMaterials;
    }
    declare class EternalLove {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        private readonly occt;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw, occt: OCCTW);
        create(inputs: Things.ThreeDPrinting.Medals.EternalLove.EternalLoveDto): Promise<Things.ThreeDPrinting.Medals.EternalLove.EternalLoveData<Inputs.OCCT.TopoDSShapePointer>>;
        drawModel(inputs: Things.ThreeDPrinting.Medals.EternalLove.EternalLoveData<Inputs.OCCT.TopoDSShapePointer>, precision?: number): Promise<BABYLON.Mesh>;
        dispose(inputs: Things.ThreeDPrinting.Vases.SerenitySwirl.SerenitySwirlData<Inputs.OCCT.TopoDSShapePointer>): Promise<void>;
    }
    declare class Medals {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        private readonly occt;
        eternalLove: EternalLove;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw, occt: OCCTW);
    }
    declare class ArabicArchway {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        private readonly occt;
        private materials;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw, occt: OCCTW);
        create(inputs: Things.ThreeDPrinting.Vases.ArabicArchway.ArabicArchwayDto): Promise<Things.ThreeDPrinting.Vases.ArabicArchway.ArabicArchwayData<Inputs.OCCT.TopoDSShapePointer>>;
        drawModel(model: Things.ThreeDPrinting.Vases.ArabicArchway.ArabicArchwayData<Inputs.OCCT.TopoDSShapePointer>, precision?: number): Promise<BABYLON.Mesh>;
        dispose(inputs: Things.ThreeDPrinting.Vases.ArabicArchway.ArabicArchwayData<Inputs.OCCT.TopoDSShapePointer>): Promise<void>;
        private createMaterials;
        private createOpaqueMaterial;
        private createBaseMaterial;
        private createGlassMaterial;
    }
    declare class SerenitySwirl {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        private readonly occt;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw, occt: OCCTW);
        create(inputs: Things.ThreeDPrinting.Vases.SerenitySwirl.SerenitySwirlDto): Promise<Things.ThreeDPrinting.Vases.SerenitySwirl.SerenitySwirlData<Inputs.OCCT.TopoDSShapePointer>>;
        drawModel(inputs: Things.ThreeDPrinting.Vases.SerenitySwirl.SerenitySwirlData<Inputs.OCCT.TopoDSShapePointer>, precision?: number): Promise<BABYLON.Mesh>;
        dispose(inputs: Things.ThreeDPrinting.Vases.SerenitySwirl.SerenitySwirlData<Inputs.OCCT.TopoDSShapePointer>): Promise<void>;
    }
    declare class Vases {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        private readonly occt;
        serenitySwirl: SerenitySwirl;
        arabicArchway: ArabicArchway;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw, occt: OCCTW);
    }
    declare class Architecture {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        private readonly occt;
        houses: Houses;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw, occt: OCCTW);
    }
    declare class Houses {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        private readonly occt;
        zenHideout: ZenHideout;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw, occt: OCCTW);
    }
    declare class ZenHideout {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        private readonly occt;
        private materials;
        skin: Things.Architecture.Houses.ZenHideout.ZenHideoutDrawingPartShapes<boolean>;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw, occt: OCCTW);
        create(inputs: Things.Architecture.Houses.ZenHideout.ZenHideoutDto): Promise<Things.Architecture.Houses.ZenHideout.ZenHideoutData<Inputs.OCCT.TopoDSShapePointer>>;
        drawModel(model: Things.Architecture.Houses.ZenHideout.ZenHideoutData<Inputs.OCCT.TopoDSShapePointer>, precision?: number): Promise<BABYLON.Mesh>;
        dispose(inputs: Things.Architecture.Houses.ZenHideout.ZenHideoutData<Inputs.OCCT.TopoDSShapePointer>): Promise<void>;
        private createMaterials;
        private createSkin;
    }
    declare class Enums {
        lodEnum(inputs: Things.Enums.LodDto): Things.Enums.lodEnum;
    }
    declare class Chairs {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        private readonly occt;
        snakeChair: SnakeChair;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw, occt: OCCTW);
    }
    declare class SnakeChair {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        private readonly occt;
        private materials;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw, occt: OCCTW);
        create(inputs: Things.Furniture.Chairs.SnakeChair.SnakeChairDto): Promise<Things.Furniture.Chairs.SnakeChair.SnakeChairData<Inputs.OCCT.TopoDSShapePointer>>;
        getCompoundShape(inputs: Things.Furniture.Chairs.SnakeChair.SnakeChairModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getSittingWireShape(inputs: Things.Furniture.Chairs.SnakeChair.SnakeChairModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getSittingAreaCenterPoint(inputs: Things.Furniture.Chairs.SnakeChair.SnakeChairModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.Base.Point3;
        drawOptions(inputs: Things.Furniture.Chairs.SnakeChair.SnakeChairDrawDto<BABYLON.PBRMetallicRoughnessMaterial>): Things.Furniture.Chairs.SnakeChair.SnakeChairDrawDto<BABYLON.PBRMetallicRoughnessMaterial>;
        drawModel(model: Things.Furniture.Chairs.SnakeChair.SnakeChairData<Inputs.OCCT.TopoDSShapePointer>, options: Things.Furniture.Chairs.SnakeChair.SnakeChairDrawDto<BABYLON.PBRMetallicRoughnessMaterial>): Promise<BABYLON.Mesh>;
        dispose(inputs: Things.Furniture.Chairs.SnakeChair.SnakeChairData<Inputs.OCCT.TopoDSShapePointer>): Promise<void>;
        private createMaterials;
    }
    declare class Furniture {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        private readonly occt;
        chairs: Chairs;
        tables: Tables;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw, occt: OCCTW);
    }
    declare class ElegantTable {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        private readonly occt;
        private materials;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw, occt: OCCTW);
        create(inputs: Things.Furniture.Tables.ElegantTable.ElegantTableDto): Promise<Things.Furniture.Tables.ElegantTable.ElegantTableData<Inputs.OCCT.TopoDSShapePointer>>;
        getCompoundShape(inputs: Things.Furniture.Tables.ElegantTable.ElegantTableModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getLegShapes(inputs: Things.Furniture.Tables.ElegantTable.ElegantTableModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer[];
        getLegShapeByIndex(inputs: Things.Furniture.Tables.ElegantTable.ElegantTableLegByIndexDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getTopPanelShape(inputs: Things.Furniture.Tables.ElegantTable.ElegantTableModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getTopPanelWireShape(inputs: Things.Furniture.Tables.ElegantTable.ElegantTableModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getBottomPanelWireShape(inputs: Things.Furniture.Tables.ElegantTable.ElegantTableModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getBottomPanelShape(inputs: Things.Furniture.Tables.ElegantTable.ElegantTableModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getLegsCompoundShape(inputs: Things.Furniture.Tables.ElegantTable.ElegantTableModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getTableTopCenterPoint(inputs: Things.Furniture.Tables.ElegantTable.ElegantTableModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.Base.Point3;
        getTableBottomCenterPoint(inputs: Things.Furniture.Tables.ElegantTable.ElegantTableModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.Base.Point3;
        getLegBottomPoints(inputs: Things.Furniture.Tables.ElegantTable.ElegantTableModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.Base.Point3[];
        getLegTopPoints(inputs: Things.Furniture.Tables.ElegantTable.ElegantTableModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.Base.Point3[];
        drawOptions(inputs: Things.Furniture.Tables.ElegantTable.ElegantTableDrawDto<BABYLON.PBRMetallicRoughnessMaterial>): Things.Furniture.Tables.ElegantTable.ElegantTableDrawDto<BABYLON.PBRMetallicRoughnessMaterial>;
        drawModel(model: Things.Furniture.Tables.ElegantTable.ElegantTableData<Inputs.OCCT.TopoDSShapePointer>, options: Things.Furniture.Tables.ElegantTable.ElegantTableDrawDto<BABYLON.PBRMetallicRoughnessMaterial>): Promise<BABYLON.Mesh>;
        dispose(inputs: Things.Furniture.Tables.ElegantTable.ElegantTableData<Inputs.OCCT.TopoDSShapePointer>): Promise<void>;
        private createMaterials;
    }
    declare class GoodCoffeeTable {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        private readonly occt;
        private materials;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw, occt: OCCTW);
        create(inputs: Things.Furniture.Tables.GoodCoffeeTable.GoodCoffeeTableDto): Promise<Things.Furniture.Tables.GoodCoffeeTable.GoodCoffeeTableData<Inputs.OCCT.TopoDSShapePointer>>;
        getCompoundShape(inputs: Things.Furniture.Tables.GoodCoffeeTable.GoodCoffeeTableModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getLegShapes(inputs: Things.Furniture.Tables.GoodCoffeeTable.GoodCoffeeTableModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer[];
        getLegShapeByIndex(inputs: Things.Furniture.Tables.GoodCoffeeTable.GoodCoffeeTableLegByIndexDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getTopPanelShape(inputs: Things.Furniture.Tables.GoodCoffeeTable.GoodCoffeeTableModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getTopPanelWireShape(inputs: Things.Furniture.Tables.GoodCoffeeTable.GoodCoffeeTableModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getGlassPanelShape(inputs: Things.Furniture.Tables.GoodCoffeeTable.GoodCoffeeTableModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getGlassPanelWireShape(inputs: Things.Furniture.Tables.GoodCoffeeTable.GoodCoffeeTableModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getShelfShape(inputs: Things.Furniture.Tables.GoodCoffeeTable.GoodCoffeeTableModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getShelfTopWireShape(inputs: Things.Furniture.Tables.GoodCoffeeTable.GoodCoffeeTableModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getLegsCompoundShape(inputs: Things.Furniture.Tables.GoodCoffeeTable.GoodCoffeeTableModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getTableTopCenterPoint(inputs: Things.Furniture.Tables.GoodCoffeeTable.GoodCoffeeTableModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.Base.Point3;
        getTableShelfTopCenterPoint(inputs: Things.Furniture.Tables.GoodCoffeeTable.GoodCoffeeTableModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.Base.Point3;
        getLegBottomPoints(inputs: Things.Furniture.Tables.GoodCoffeeTable.GoodCoffeeTableModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.Base.Point3[];
        getLegTopPoints(inputs: Things.Furniture.Tables.GoodCoffeeTable.GoodCoffeeTableModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.Base.Point3[];
        drawOptions(inputs: Things.Furniture.Tables.GoodCoffeeTable.GoodCoffeeTableDrawDto<BABYLON.PBRMetallicRoughnessMaterial>): Things.Furniture.Tables.GoodCoffeeTable.GoodCoffeeTableDrawDto<BABYLON.PBRMetallicRoughnessMaterial>;
        drawModel(model: Things.Furniture.Tables.GoodCoffeeTable.GoodCoffeeTableData<Inputs.OCCT.TopoDSShapePointer>, options: Things.Furniture.Tables.GoodCoffeeTable.GoodCoffeeTableDrawDto<BABYLON.PBRMetallicRoughnessMaterial>): Promise<BABYLON.Mesh>;
        dispose(inputs: Things.Furniture.Tables.GoodCoffeeTable.GoodCoffeeTableData<Inputs.OCCT.TopoDSShapePointer>): Promise<void>;
        private createMaterials;
    }
    declare class SnakeTable {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        private readonly occt;
        private materials;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw, occt: OCCTW);
        create(inputs: Things.Furniture.Tables.SnakeTable.SnakeTableDto): Promise<Things.Furniture.Tables.SnakeTable.SnakeTableData<Inputs.OCCT.TopoDSShapePointer>>;
        getCompoundShape(inputs: Things.Furniture.Tables.SnakeTable.SnakeTableModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getGlassShape(inputs: Things.Furniture.Tables.SnakeTable.SnakeTableModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getMainShape(inputs: Things.Furniture.Tables.SnakeTable.SnakeTableModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getTopCenterPoint(inputs: Things.Furniture.Tables.SnakeTable.SnakeTableModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.Base.Point3;
        drawOptions(inputs: Things.Furniture.Tables.SnakeTable.SnakeTableDrawDto<BABYLON.PBRMetallicRoughnessMaterial>): Things.Furniture.Tables.SnakeTable.SnakeTableDrawDto<BABYLON.PBRMetallicRoughnessMaterial>;
        drawModel(model: Things.Furniture.Tables.SnakeTable.SnakeTableData<Inputs.OCCT.TopoDSShapePointer>, options: Things.Furniture.Tables.SnakeTable.SnakeTableDrawDto<BABYLON.PBRMetallicRoughnessMaterial>): Promise<BABYLON.Mesh>;
        dispose(inputs: Things.Furniture.Tables.SnakeTable.SnakeTableData<Inputs.OCCT.TopoDSShapePointer>): Promise<void>;
        private createMaterials;
    }
    declare class Tables {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        private readonly occt;
        elegantTable: ElegantTable;
        goodCoffeeTable: GoodCoffeeTable;
        snakeTable: SnakeTable;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw, occt: OCCTW);
    }
    declare class Birdhouses {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        private readonly occt;
        wingtipVilla: WingtipVilla;
        chirpyChalet: ChirpyChalet;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw, occt: OCCTW);
    }
    declare class ChirpyChalet {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        private readonly occt;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw, occt: OCCTW);
        dispose(inputs: Things.KidsCorner.BirdHouses.ChirpyChalet.ChirpyChaletData<Inputs.OCCT.TopoDSShapePointer>): Promise<void>;
        create(inputs: Things.KidsCorner.BirdHouses.ChirpyChalet.ChirpyChaletDto): Promise<Things.KidsCorner.BirdHouses.ChirpyChalet.ChirpyChaletData<Inputs.OCCT.TopoDSShapePointer>>;
        drawModel(inputs: Things.KidsCorner.BirdHouses.ChirpyChalet.ChirpyChaletData<Inputs.OCCT.TopoDSShapePointer>): Promise<BABYLON.Mesh>;
    }
    declare class WingtipVilla {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        private readonly occt;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw, occt: OCCTW);
        create(inputs: Things.KidsCorner.BirdHouses.WingtipVilla.WingtipVillaDto): Promise<Things.KidsCorner.BirdHouses.WingtipVilla.WingtipVillaData<Inputs.OCCT.TopoDSShapePointer>>;
        drawModel(inputs: Things.KidsCorner.BirdHouses.WingtipVilla.WingtipVillaData<Inputs.OCCT.TopoDSShapePointer>): Promise<BABYLON.Mesh>;
        dispose(inputs: Things.KidsCorner.BirdHouses.WingtipVilla.WingtipVillaData<Inputs.OCCT.TopoDSShapePointer>): Promise<void>;
    }
    declare class KidsCorner {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        private readonly occt;
        birdhouses: Birdhouses;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw, occt: OCCTW);
    }
    declare class DropletsPhoneHolder {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        private readonly occt;
        private readonly jscad;
        private drawOptions;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw, occt: OCCTW, jscad: JSCAD);
        create(inputs: Things.LaserCutting.Gadgets.DropletsPhoneHolder.DropletsPhoneHolderDto): Promise<Things.LaserCutting.Gadgets.DropletsPhoneHolder.DropletsPhoneHolderData<Inputs.OCCT.TopoDSShapePointer>>;
        getCompoundShape(inputs: Things.LaserCutting.Gadgets.DropletsPhoneHolder.DropletsPhoneHolderModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getCutWiresCompound(inputs: Things.LaserCutting.Gadgets.DropletsPhoneHolder.DropletsPhoneHolderModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        getEngravingWiresCompound(inputs: Things.LaserCutting.Gadgets.DropletsPhoneHolder.DropletsPhoneHolderModelDto<Inputs.OCCT.TopoDSShapePointer>): Inputs.OCCT.TopoDSShapePointer;
        downloadDXFDrawings(inputs: Things.LaserCutting.Gadgets.DropletsPhoneHolder.DropletsPhoneHolderModelDxfDto<Inputs.OCCT.TopoDSShapePointer>): Promise<void>;
        downloadSTEPDrawings(inputs: Things.LaserCutting.Gadgets.DropletsPhoneHolder.DropletsPhoneHolderModelStepDto<Inputs.OCCT.TopoDSShapePointer>): Promise<void>;
        download3dSTEPModel(inputs: Things.LaserCutting.Gadgets.DropletsPhoneHolder.DropletsPhoneHolderModelStepDto<Inputs.OCCT.TopoDSShapePointer>): Promise<void>;
        drawModel(model: Things.LaserCutting.Gadgets.DropletsPhoneHolder.DropletsPhoneHolderData<Inputs.OCCT.TopoDSShapePointer>, precision?: number): Promise<BABYLON.Mesh>;
        dispose(inputs: Things.LaserCutting.Gadgets.DropletsPhoneHolder.DropletsPhoneHolderData<Inputs.OCCT.TopoDSShapePointer>): Promise<void>;
        private createDrawOptions;
    }
    declare class Gadgets {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        private readonly occt;
        private readonly jscad;
        dropletsPhoneHolder: DropletsPhoneHolder;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw, occt: OCCTW, jscad: JSCAD);
    }
    declare class LaserCutting {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        private readonly occt;
        private readonly jscad;
        gadgets: Gadgets;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw, occt: OCCTW, jscad: JSCAD);
    }
    declare class ThingsAdv {
        private readonly occWorkerManager;
        private readonly context;
        private readonly draw;
        private readonly occt;
        private readonly jscad;
        kidsCorner: KidsCorner;
        threeDPrinting: ThreeDPrinting;
        laserCutting: LaserCutting;
        architecture: Architecture;
        furniture: Furniture;
        enums: Enums;
        constructor(occWorkerManager: OCCTWorkerManager, context: Context, draw: Draw, occt: OCCTW, jscad: JSCAD);
    }
    declare class BitByBitBase {
        readonly draw: Draw;
        readonly babylon: Babylon;
        readonly vector: Vector;
        readonly point: Point;
        readonly line: Line;
        readonly polyline: Polyline;
        readonly mesh: MeshBitByBit;
        readonly occt: OCCTW & OCCT;
        readonly advanced: AdvancedAdv;
        readonly things: ThingsAdv;
        readonly jscad: JSCAD;
        readonly manifold: ManifoldBitByBit;
        readonly logic: Logic;
        readonly math: MathBitByBit;
        readonly lists: Lists;
        readonly color: Color;
        readonly text: TextBitByBit;
        readonly dates: Dates;
        readonly json: JSONBitByBit;
        readonly csv: CSVBitByBit;
        readonly verb: Verb;
        readonly tag: Tag;
        readonly time: Time;
        readonly asset: Asset;
    }
    declare var isRunnerContext: boolean;
    declare function mockBitbybitRunnerInputs<T>(inputs: T): T;
    declare function getBitbybitRunnerInputs<T>(): T;
    declare function setBitbybitRunnerResult<T>(result: T): void;
}

}

```