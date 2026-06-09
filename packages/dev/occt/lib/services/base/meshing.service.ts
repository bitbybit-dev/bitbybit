import {
    BitbybitOcctModule,
    Handle_TDocStd_Document,
    TDocStd_Document,
    TopoDS_Shape, TopoDS_Wire
} from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import { WiresService } from "./wires.service";
import { BaseBitByBit } from "../../base";

export class MeshingService {

    constructor(
        public readonly occ: BitbybitOcctModule,
        public readonly wiresService: WiresService,
        public readonly base: BaseBitByBit
    ) { }

    shapeFacesToPolygonPoints(inputs: Inputs.OCCT.ShapeFacesToPolygonPointsDto<TopoDS_Shape>): Inputs.Base.Point3[][] {
        const def = this.shapeToMesh({
            shape: inputs.shape,
            precision: inputs.precision,
            adjustYtoZ: inputs.adjustYtoZ,
            computeMetadata: false,
        });
        const res = [];
        def.faceList.forEach(face => {
            const vertices = face.vertexCoord;
            const indices = face.triIndexes;
            for (let i = 0; i < indices.length; i += 3) {
                const p1 = indices[i];
                const p2 = indices[i + 1];
                const p3 = indices[i + 2];
                let pts = [
                    [vertices[p1 * 3], vertices[p1 * 3 + 1], vertices[p1 * 3 + 2]],
                    [vertices[p2 * 3], vertices[p2 * 3 + 1], vertices[p2 * 3 + 2]],
                    [vertices[p3 * 3], vertices[p3 * 3 + 1], vertices[p3 * 3 + 2]],
                ];
                if (inputs.reversedPoints) {
                    pts = pts.reverse();
                }
                res.push(pts);
            }
        });

        return res;
    }

    shapesToMeshes(inputs: Inputs.OCCT.ShapesToMeshesDto<TopoDS_Shape>): Inputs.OCCT.DecomposedMeshDto[] {
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

    shapeToMesh(inputs: Inputs.OCCT.ShapeToMeshDto<TopoDS_Shape>): Inputs.OCCT.DecomposedMeshDto {
        if (!inputs.shape || inputs.shape.IsNull()) {
            return { faceList: [], edgeList: [], pointsList: [] };
        }
      
        const json = this.occ.ShapeToMeshJson(
            inputs.shape,
            inputs.precision,
            inputs.adjustYtoZ ?? false,
            inputs.computeMetadata ?? false,
            inputs.keepMeshData ?? false,
            inputs.allowQualityDecrease ?? true,
            inputs.forceFaceDeflection ?? false,
        );
        return JSON.parse(json) as Inputs.OCCT.DecomposedMeshDto;
    }

    docToMeshes(inputs: Inputs.OCCT.DocToMeshesDto<Handle_TDocStd_Document>): Inputs.OCCT.DecomposedMeshDto[] {
        const doc = inputs.document;
        if (!doc || typeof doc.get !== "function" || typeof doc.IsNull !== "function" || doc.IsNull()) {
            return [];
        }
    
        const json = this.occ.DocumentToMeshesJson(
            doc.get(),
            inputs.precision,
            inputs.adjustYtoZ ?? false,
            inputs.computeMetadata ?? false,
            inputs.keepMeshData ?? false,
            inputs.allowQualityDecrease ?? true,
            inputs.forceFaceDeflection ?? false,
        );
        return JSON.parse(json) as Inputs.OCCT.DecomposedMeshDto[];
    }

    docToMesh(inputs: Inputs.OCCT.DocToMeshDto<Handle_TDocStd_Document>): Inputs.OCCT.DecomposedMeshDto {
        const doc = inputs.document;
        if (!doc || typeof doc.get !== "function" || typeof doc.IsNull !== "function" || doc.IsNull()) {
            return { faceList: [], edgeList: [], pointsList: [] };
        }
       
        const json = this.occ.DocumentToMeshJson(
            doc.get(),
            inputs.precision,
            inputs.adjustYtoZ ?? false,
            inputs.computeMetadata ?? false,
            inputs.keepMeshData ?? false,
            inputs.allowQualityDecrease ?? true,
            inputs.forceFaceDeflection ?? false,
        );
        return JSON.parse(json) as Inputs.OCCT.DecomposedMeshDto;
    }

    meshMeshIntersectionWires(inputs: Inputs.OCCT.MeshMeshIntersectionTwoShapesDto<TopoDS_Shape>): TopoDS_Wire[] {
        const shape1 = inputs.shape1;
        const shape2 = inputs.shape2;

        const mesh1 = this.shapeFacesToPolygonPoints({ shape: shape1, precision: inputs.precision1, adjustYtoZ: false, reversedPoints: false }) as Inputs.Base.Mesh3;
        const mesh2 = this.shapeFacesToPolygonPoints({ shape: shape2, precision: inputs.precision2, adjustYtoZ: false, reversedPoints: false }) as Inputs.Base.Mesh3;

        const res = this.base.mesh.meshMeshIntersectionPolylines({
            mesh1, mesh2
        });
        const wires = [];
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

    meshMeshIntersectionPoints(inputs: Inputs.OCCT.MeshMeshIntersectionTwoShapesDto<TopoDS_Shape>): Inputs.Base.Point3[][] {
        const shape1 = inputs.shape1;
        const shape2 = inputs.shape2;

        const mesh1 = this.shapeFacesToPolygonPoints({ shape: shape1, precision: inputs.precision1, adjustYtoZ: false, reversedPoints: false }) as Inputs.Base.Mesh3;
        const mesh2 = this.shapeFacesToPolygonPoints({ shape: shape2, precision: inputs.precision2, adjustYtoZ: false, reversedPoints: false }) as Inputs.Base.Mesh3;

        return this.base.mesh.meshMeshIntersectionPoints({ mesh1, mesh2 });
    }

    meshMeshIntersectionOfShapesWires(inputs: Inputs.OCCT.MeshMeshesIntersectionOfShapesDto<TopoDS_Shape>): TopoDS_Wire[] {
        const wireIntersections: TopoDS_Wire[] = [];

        inputs.shapes.forEach((shape, index) => {
            const shape1 = inputs.shape;
            const shape2 = inputs.shapes[index];
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

    meshMeshIntersectionOfShapesPoints(inputs: Inputs.OCCT.MeshMeshesIntersectionOfShapesDto<TopoDS_Shape>): Inputs.Base.Point3[][] {
        const pointIntersections: Inputs.Base.Point3[][] = [];

        inputs.shapes.forEach((shape, index) => {
            const shape1 = inputs.shape;
            const shape2 = inputs.shapes[index];
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
