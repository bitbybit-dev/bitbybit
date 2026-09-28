import { BitbybitOcctModule, Handle_TDocStd_Document, MeshBuffers, TopoDS_Shape, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import { WiresService } from "./wires.service";
import { BaseBitByBit } from "../../base";
import { InputError } from "@bitbybit-dev/base";
import * as Resolved from "../../api/resolved-inputs";
import { resolveDto } from "@bitbybit-dev/base";
import { decodeMeshArrays, type MeshArrays, type MeshContents } from "./mesh-arrays";
import { checkedShapes } from "./input-checks";

function copied<T extends Float64Array | Int32Array>(view: unknown, kind: { new (length: number): T; name: string }): T {
    if (!(view instanceof kind)) {
        throw new Error(`the kernel returned mesh data that is not a ${kind.name}`);
    }
    return view.slice() as T;
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
            adjustYtoZ: inputs.adjustYtoZ,
            computeMetadata: inputs.computeMetadata,
            keepMeshData: inputs.keepMeshData,
            allowQualityDecrease: inputs.allowQualityDecrease,
            forceFaceDeflection: inputs.forceFaceDeflection,
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
      
        if (this.kernelHasMeshBuffers()) {
            const contents = { colors: false, metadata: resolved.computeMetadata };
            const arrays = this.meshArrays(this.occ.ShapeToMeshBuffers(
                resolved.shape,
                resolved.precision,
                resolved.adjustYtoZ,
                resolved.computeMetadata,
                resolved.keepMeshData,
                resolved.allowQualityDecrease,
                resolved.forceFaceDeflection,
            ), contents);
            if (arrays) {
                return decodeMeshArrays(arrays, contents);
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

    /**
     * Whether the loaded kernel can hand its mesh over as buffers, with metadata and for documents. A
     * kernel built before `DocumentToMeshBuffers` existed, such as a pinned or custom build, is meshed
     * through its JSON instead.
     */
    private kernelHasMeshBuffers(): boolean {
        return typeof (this.occ as Partial<BitbybitOcctModule>).DocumentToMeshBuffers === "function";
    }

    /**
     * Copies a mesh out of the kernel's memory and frees the kernel's copy, or returns undefined when
     * meshing failed, so the caller can report the failure the way the JSON path does.
     */
    private meshArrays(buffers: MeshBuffers, contents: MeshContents): MeshArrays | undefined {
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
            return arrays;
        } finally {
            buffers.delete();
        }
    }

    /**
     * Meshes one free shape of a document, or all of them as one mesh when `index` is -1, with the
     * colour groups the document gives its faces; undefined when meshing failed.
     */
    private documentMesh(inputs: Resolved.OCCT.DocToMeshDto<Handle_TDocStd_Document>, index: number): Inputs.OCCT.DecomposedMeshDto | undefined {
        const contents = { colors: true, metadata: inputs.computeMetadata };
        const arrays = this.meshArrays(this.occ.DocumentToMeshBuffers(
            inputs.document.get(),
            index,
            inputs.precision,
            inputs.adjustYtoZ,
            inputs.computeMetadata,
            inputs.keepMeshData,
            inputs.allowQualityDecrease,
            inputs.forceFaceDeflection,
        ), contents);
        return arrays ? decodeMeshArrays(arrays, contents) : undefined;
    }

    docToMeshes(inputs: Resolved.OCCT.DocToMeshesDto<Handle_TDocStd_Document>): Inputs.OCCT.DecomposedMeshDto[] {
        const doc = inputs.document;
        if (!doc || typeof doc.get !== "function" || typeof doc.IsNull !== "function" || doc.IsNull()) {
            return [];
        }
    
        if (this.kernelHasMeshBuffers()) {
            const count = this.occ.DocumentFreeShapeCount(doc.get());
            const meshes: Inputs.OCCT.DecomposedMeshDto[] = [];
            for (let index = 0; index < count; index++) {
                const mesh = this.documentMesh(inputs, index);
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
       
        if (this.kernelHasMeshBuffers()) {
            const mesh = this.documentMesh(inputs, -1);
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
