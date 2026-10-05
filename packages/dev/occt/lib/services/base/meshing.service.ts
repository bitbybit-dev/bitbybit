import type { BitbybitAnalysis_SurfaceQuantity, BitbybitOcctModule, Handle_TDocStd_Document, MeshBuffers, TopoDS_Shape, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import type { WiresService } from "./wires.service";
import type { BaseBitByBit } from "../../base";
import { InputError } from "@bitbybit-dev/base";
import type * as Resolved from "../../api/resolved-inputs";
import { resolveDto } from "@bitbybit-dev/base";
import { decodeMeshArrays, decodePolylines, type MeshArrays, type MeshContents } from "./mesh-arrays";
import { checkedChoice, checkedDirection, checkedNumber, checkedShapes, checkedWhole } from "./input-checks";

const SURFACE_ANALYSES: readonly Inputs.OCCT.surfaceAnalysisEnum[] = [
    Inputs.OCCT.surfaceAnalysisEnum.none,
    Inputs.OCCT.surfaceAnalysisEnum.gaussian,
    Inputs.OCCT.surfaceAnalysisEnum.mean,
    Inputs.OCCT.surfaceAnalysisEnum.maxCurvature,
    Inputs.OCCT.surfaceAnalysisEnum.minCurvature,
    Inputs.OCCT.surfaceAnalysisEnum.minRadius,
    Inputs.OCCT.surfaceAnalysisEnum.draftAngle,
];

const MOST_ISO_CURVES = 1000;

const DEGREES_PER_RADIAN = 180 / Math.PI;

const LEAST_ANGULAR_DEFLECTION = 0.001;

interface Fineness {
    angularDeflection: number;
    relativeDeflection: boolean;
}

const UNREAD_PULL: Inputs.Base.Vector3 = [0, 1, 0];

type NodeAnalysis = (buffers: MeshBuffers) => Float64Array;

function copied<T extends Float64Array | Int32Array>(view: unknown, kind: { new (length: number): T; name: string }): T {
    if (!(view instanceof kind)) {
        throw new Error(`the kernel returned mesh data that is not a ${kind.name}`);
    }
    return view.slice() as T;
}

function surfaceQuantity(occ: BitbybitOcctModule, analysis: Inputs.OCCT.surfaceAnalysisEnum): BitbybitAnalysis_SurfaceQuantity {
    switch (analysis) {
        case Inputs.OCCT.surfaceAnalysisEnum.gaussian:
            return occ.BitbybitAnalysis_SurfaceQuantity.Gaussian;
        case Inputs.OCCT.surfaceAnalysisEnum.mean:
            return occ.BitbybitAnalysis_SurfaceQuantity.Mean;
        case Inputs.OCCT.surfaceAnalysisEnum.maxCurvature:
            return occ.BitbybitAnalysis_SurfaceQuantity.MaxCurvature;
        case Inputs.OCCT.surfaceAnalysisEnum.minCurvature:
            return occ.BitbybitAnalysis_SurfaceQuantity.MinCurvature;
        case Inputs.OCCT.surfaceAnalysisEnum.minRadius:
            return occ.BitbybitAnalysis_SurfaceQuantity.MinRadius;
        default:
            return occ.BitbybitAnalysis_SurfaceQuantity.DraftAngle;
    }
}

export class MeshingService {

    constructor(
        public readonly occ: BitbybitOcctModule,
        public readonly wiresService: WiresService,
        public readonly base: BaseBitByBit
    ) { }

    shapeFacesToPolygonPoints(inputs: Resolved.OCCT.ShapeFacesToPolygonPointsDto<TopoDS_Shape>): Inputs.Base.Point3[][] {
        const def = this.shapeToMesh({
            shape: inputs.shape,
            precision: inputs.precision,
            adjustYtoZ: inputs.adjustYtoZ,
            computeMetadata: false,
        });
        const res: Inputs.Base.Point3[][] = [];
        def.faceList.forEach(face => {
            const vertices = face.vertexCoord;
            const indices = face.triIndexes;
            for (let i = 0; i < indices.length; i += 3) {
                const p1 = indices[i]!;
                const p2 = indices[i + 1]!;
                const p3 = indices[i + 2]!;
                let pts: Inputs.Base.Point3[] = [
                    [vertices[p1 * 3]!, vertices[p1 * 3 + 1]!, vertices[p1 * 3 + 2]!],
                    [vertices[p2 * 3]!, vertices[p2 * 3 + 1]!, vertices[p2 * 3 + 2]!],
                    [vertices[p3 * 3]!, vertices[p3 * 3 + 1]!, vertices[p3 * 3 + 2]!],
                ];
                if (inputs.reversedPoints) {
                    pts = pts.reverse();
                }
                res.push(pts);
            }
        });

        return res;
    }

    shapesToMeshes(inputs: Resolved.OCCT.ShapesToMeshesDto<TopoDS_Shape>): Inputs.OCCT.DecomposedMeshDto[] {
        return inputs.shapes.map(shape => this.shapeToMesh({
            shape,
            precision: inputs.precision,
            angularDeflection: inputs.angularDeflection,
            relativeDeflection: inputs.relativeDeflection,
            adjustYtoZ: inputs.adjustYtoZ,
            computeMetadata: inputs.computeMetadata,
            keepMeshData: inputs.keepMeshData,
            allowQualityDecrease: inputs.allowQualityDecrease,
            forceFaceDeflection: inputs.forceFaceDeflection,
            isoCurvesU: inputs.isoCurvesU,
            isoCurvesV: inputs.isoCurvesV,
            surfaceAnalysis: inputs.surfaceAnalysis,
            draftDirection: inputs.draftDirection,
        }));
    }

    shapeToManifoldMesh(inputs: Resolved.OCCT.ShapeToManifoldMeshDto<TopoDS_Shape>): Inputs.OCCT.DecomposedManifoldMeshDto {
        const mesh = this.occ.ShapeToManifoldMesh(inputs.shape, inputs.precision);
        if (mesh === null) {
            throw new InputError("`shape` is empty or has a face the mesher left without triangles, so it has no mesh.", "shape");
        }
        return mesh;
    }

    shapeToMesh(inputs: Inputs.OCCT.ShapeToMeshDto<TopoDS_Shape>): Inputs.OCCT.DecomposedMeshDto {
        const resolved = resolveDto(Inputs.OCCT.ShapeToMeshDto, inputs) as Resolved.OCCT.ShapeToMeshDto<TopoDS_Shape>;
        if (!resolved.shape || resolved.shape.IsNull()) {
            return { faceList: [], edgeList: [], pointsList: [] };
        }
        const fineness = this.checkedFineness(resolved);
        const isoCurvesU = checkedWhole(resolved.isoCurvesU, "isoCurvesU", 0, MOST_ISO_CURVES);
        const isoCurvesV = checkedWhole(resolved.isoCurvesV, "isoCurvesV", 0, MOST_ISO_CURVES);
        const analysis = this.nodeAnalysis(resolved.shape, resolved.surfaceAnalysis, resolved.draftDirection);

        if (this.kernelHasMeshBuffers()) {
            const contents: MeshContents = { colors: false, metadata: resolved.computeMetadata, analysis: analysis !== undefined };
            const meshCall = this.occ.ShapeToMeshBuffers.bind(this.occ) as (...args: unknown[]) => MeshBuffers;
            const arrays = this.meshArrays(meshCall(
                resolved.shape,
                resolved.precision,
                resolved.adjustYtoZ,
                resolved.computeMetadata,
                resolved.keepMeshData,
                resolved.allowQualityDecrease,
                resolved.forceFaceDeflection,
                ...this.finenessFor(meshCall, 7, fineness),
            ), contents, analysis);
            if (arrays) {
                const mesh = decodeMeshArrays(arrays, contents);
                if (isoCurvesU + isoCurvesV > 0 && this.kernelHas("IsoCurvePolylines")) {
                    const polylines = this.occ.IsoCurvePolylines(resolved.shape, isoCurvesU, isoCurvesV, resolved.precision);
                    mesh.isoCurveList = decodePolylines(copied(polylines.points, Float64Array), copied(polylines.counts, Int32Array), resolved.adjustYtoZ);
                }
                return mesh;
            }
        }
        const json = this.occ.ShapeToMeshJson(
            resolved.shape,
            resolved.precision,
            resolved.adjustYtoZ,
            resolved.computeMetadata,
            resolved.keepMeshData,
            resolved.allowQualityDecrease,
            resolved.forceFaceDeflection,
        );
        return JSON.parse(json) as Inputs.OCCT.DecomposedMeshDto;
    }

    private checkedFineness(inputs: Fineness): Fineness {
        return {
            angularDeflection: checkedNumber(inputs.angularDeflection, "angularDeflection", LEAST_ANGULAR_DEFLECTION, Math.PI),
            relativeDeflection: inputs.relativeDeflection === true,
        };
    }

    private finenessFor(meshCall: (...args: unknown[]) => MeshBuffers, olderArity: number, fineness: Fineness): [number, boolean] | [] {
        return meshCall.length === olderArity ? [] : [fineness.angularDeflection, fineness.relativeDeflection];
    }

    private kernelHasMeshBuffers(): boolean {
        return typeof (this.occ as Partial<BitbybitOcctModule>).DocumentToMeshBuffers === "function";
    }

    private kernelHas(name: "IsoCurvePolylines" | "SurfaceAnalysisAtMeshNodes"): boolean {
        return typeof (this.occ as Partial<BitbybitOcctModule>)[name] === "function";
    }

    private nodeAnalysis(shape: TopoDS_Shape, surfaceAnalysis: unknown, draftDirection: unknown): NodeAnalysis | undefined {
        const analysis = checkedChoice(surfaceAnalysis, SURFACE_ANALYSES, "surfaceAnalysis");
        if (analysis === Inputs.OCCT.surfaceAnalysisEnum.none) {
            return undefined;
        }
        const isAngle = analysis === Inputs.OCCT.surfaceAnalysisEnum.draftAngle;
        const pull = isAngle ? checkedDirection(draftDirection, "draftDirection") : UNREAD_PULL;
        if (!this.kernelHas("SurfaceAnalysisAtMeshNodes")) {
            return undefined;
        }
        const quantity = surfaceQuantity(this.occ, analysis);
        return buffers => {
            const values = copied(this.occ.SurfaceAnalysisAtMeshNodes(shape, quantity, pull, buffers), Float64Array);
            return isAngle ? values.map(value => value * DEGREES_PER_RADIAN) : values;
        };
    }

    private meshArrays(buffers: MeshBuffers, contents: MeshContents, analysis?: NodeAnalysis): MeshArrays | undefined {
        try {
            if (!buffers.IsValid) {
                return undefined;
            }
            const arrays: MeshArrays = {
                positions: copied(buffers.Positions(), Float64Array),
                normals: copied(buffers.Normals(), Float64Array),
                uvs: copied(buffers.Uvs(), Float64Array),
                triangles: copied(buffers.Triangles(), Int32Array),
                faces: copied(buffers.Faces(), Int32Array),
                faceCentres: copied(buffers.FaceCentres(), Float64Array),
                edgePoints: copied(buffers.EdgePoints(), Float64Array),
                edges: copied(buffers.Edges(), Int32Array),
                edgeMiddles: copied(buffers.EdgeMiddles(), Float64Array),
                vertices: copied(buffers.Vertices(), Float64Array),
            };
            if (contents.colors) {
                arrays.faceColors = copied(buffers.FaceColors(), Int32Array);
            }
            if (contents.metadata) {
                arrays.faceMetadata = copied(buffers.FaceMetadata(), Float64Array);
                arrays.faceTypes = copied(buffers.FaceTypes(), Int32Array);
                arrays.faceAdjacency = copied(buffers.FaceAdjacency(), Int32Array);
                arrays.edgeMetadata = copied(buffers.EdgeMetadata(), Float64Array);
                arrays.edgeTypes = copied(buffers.EdgeTypes(), Int32Array);
                arrays.edgeIncidence = copied(buffers.EdgeIncidence(), Int32Array);
            }
            if (analysis) {
                arrays.analysis = analysis(buffers);
            }
            return arrays;
        } finally {
            buffers.delete();
        }
    }

    private documentMesh(inputs: Resolved.OCCT.DocToMeshDto<Handle_TDocStd_Document>, index: number, fineness: Fineness): Inputs.OCCT.DecomposedMeshDto | undefined {
        const contents = { colors: true, metadata: inputs.computeMetadata };
        const meshCall = this.occ.DocumentToMeshBuffers.bind(this.occ) as (...args: unknown[]) => MeshBuffers;
        const arrays = this.meshArrays(meshCall(
            inputs.document.get(),
            index,
            inputs.precision,
            inputs.adjustYtoZ,
            inputs.computeMetadata,
            inputs.keepMeshData,
            inputs.allowQualityDecrease,
            inputs.forceFaceDeflection,
            ...this.finenessFor(meshCall, 8, fineness),
        ), contents);
        return arrays ? decodeMeshArrays(arrays, contents) : undefined;
    }

    docToMeshes(inputs: Resolved.OCCT.DocToMeshesDto<Handle_TDocStd_Document>): Inputs.OCCT.DecomposedMeshDto[] {
        const doc = inputs.document;
        if (!doc || typeof doc.get !== "function" || typeof doc.IsNull !== "function" || doc.IsNull()) {
            return [];
        }
    
        const fineness = this.checkedFineness(inputs);
        if (this.kernelHasMeshBuffers()) {
            const count = this.occ.DocumentFreeShapeCount(doc.get());
            const meshes: Inputs.OCCT.DecomposedMeshDto[] = [];
            for (let index = 0; index < count; index++) {
                const mesh = this.documentMesh(inputs, index, fineness);
                if (!mesh) {
                    break;
                }
                meshes.push(mesh);
            }
            if (meshes.length === count) {
                return meshes;
            }
        }
        const json = this.occ.DocumentToMeshesJson(
            doc.get(),
            inputs.precision,
            inputs.adjustYtoZ,
            inputs.computeMetadata,
            inputs.keepMeshData,
            inputs.allowQualityDecrease,
            inputs.forceFaceDeflection,
        );
        return JSON.parse(json) as Inputs.OCCT.DecomposedMeshDto[];
    }

    docToMesh(inputs: Resolved.OCCT.DocToMeshDto<Handle_TDocStd_Document>): Inputs.OCCT.DecomposedMeshDto {
        const doc = inputs.document;
        if (!doc || typeof doc.get !== "function" || typeof doc.IsNull !== "function" || doc.IsNull()) {
            return { faceList: [], edgeList: [], pointsList: [] };
        }
       
        const fineness = this.checkedFineness(inputs);
        if (this.kernelHasMeshBuffers()) {
            const mesh = this.documentMesh(inputs, -1, fineness);
            if (mesh) {
                return mesh;
            }
        }
        const json = this.occ.DocumentToMeshJson(
            doc.get(),
            inputs.precision,
            inputs.adjustYtoZ,
            inputs.computeMetadata,
            inputs.keepMeshData,
            inputs.allowQualityDecrease,
            inputs.forceFaceDeflection,
        );
        return JSON.parse(json) as Inputs.OCCT.DecomposedMeshDto;
    }

    meshMeshIntersectionWires(inputs: Resolved.OCCT.MeshMeshIntersectionTwoShapesDto<TopoDS_Shape>): TopoDS_Wire[] {
        const shape1 = inputs.shape1;
        const shape2 = inputs.shape2;

        const mesh1 = this.shapeFacesToPolygonPoints({ shape: shape1, precision: inputs.precision1, adjustYtoZ: false, reversedPoints: false }) as Inputs.Base.Mesh3;
        const mesh2 = this.shapeFacesToPolygonPoints({ shape: shape2, precision: inputs.precision2, adjustYtoZ: false, reversedPoints: false }) as Inputs.Base.Mesh3;

        const res = this.base.mesh.meshMeshIntersectionPolylines({
            mesh1, mesh2
        });
        const wires: TopoDS_Wire[] = [];
        res.forEach(r => {
            if (r.points && r.points.length > 0) {
                if (r.isClosed) {
                    wires.push(
                        this.wiresService.createPolygonWire({
                            points: r.points,
                        }));
                } else {
                    wires.push(
                        this.wiresService.createPolylineWire({
                            points: r.points,
                        })
                    );
                }
            }
        });
        return wires;
    }

    meshMeshIntersectionPoints(inputs: Resolved.OCCT.MeshMeshIntersectionTwoShapesDto<TopoDS_Shape>): Inputs.Base.Point3[][] {
        const shape1 = inputs.shape1;
        const shape2 = inputs.shape2;

        const mesh1 = this.shapeFacesToPolygonPoints({ shape: shape1, precision: inputs.precision1, adjustYtoZ: false, reversedPoints: false }) as Inputs.Base.Mesh3;
        const mesh2 = this.shapeFacesToPolygonPoints({ shape: shape2, precision: inputs.precision2, adjustYtoZ: false, reversedPoints: false }) as Inputs.Base.Mesh3;

        return this.base.mesh.meshMeshIntersectionPoints({ mesh1, mesh2 });
    }

    meshMeshIntersectionOfShapesWires(inputs: Resolved.OCCT.MeshMeshesIntersectionOfShapesDto<TopoDS_Shape>): TopoDS_Wire[] {
        checkedShapes(inputs.shapes);
        const wireIntersections: TopoDS_Wire[] = [];

        inputs.shapes.forEach((_shape, index) => {
            const shape1 = inputs.shape;
            const shape2 = inputs.shapes[index]!;
            let precision2 = inputs.precision;
            if (inputs.precisionShapes && inputs.precisionShapes.length > 0) {
                const p = inputs.precisionShapes[index];
                if (p) {
                    precision2 = p;
                }
            }

            const wires = this.meshMeshIntersectionWires({ shape1, shape2, precision1: inputs.precision, precision2 });
            wireIntersections.push(...wires);
        });
        return wireIntersections;
    }

    meshMeshIntersectionOfShapesPoints(inputs: Resolved.OCCT.MeshMeshesIntersectionOfShapesDto<TopoDS_Shape>): Inputs.Base.Point3[][] {
        checkedShapes(inputs.shapes);
        const pointIntersections: Inputs.Base.Point3[][] = [];

        inputs.shapes.forEach((_shape, index) => {
            const shape1 = inputs.shape;
            const shape2 = inputs.shapes[index]!;
            let precision2 = inputs.precision;
            if (inputs.precisionShapes && inputs.precisionShapes.length > 0) {
                const p = inputs.precisionShapes[index];
                if (p) {
                    precision2 = p;
                }
            }

            const points = this.meshMeshIntersectionPoints({ shape1, shape2, precision1: inputs.precision, precision2 });
            pointIntersections.push(...points);
        });
        return pointIntersections;
    }

}
