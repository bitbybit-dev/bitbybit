import { OpenCascadeInstance, TopoDS_Compound, TopoDS_Shape, TopoDS_Vertex, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs/inputs";
import { BooleansService } from "./booleans.service";
import { ConverterService } from "./converter.service";
import { EntitiesService } from "./entities.service";
import { ShapeGettersService } from "./shape-getters";
import { WiresService } from "./wires.service";

export class VerticesService {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly entitiesService: EntitiesService,
        private readonly converterService: ConverterService,
        private readonly shapeGettersService: ShapeGettersService,
        public wiresService: WiresService,
        public booleansService: BooleansService,
    ) { }


    vertexFromXYZ(inputs: Inputs.OCCT.XYZDto): TopoDS_Vertex {
        return this.entitiesService.makeVertex([inputs.x, inputs.y, inputs.z]);
    }

    vertexFromPoint(inputs: Inputs.OCCT.PointDto): TopoDS_Vertex {
        return this.entitiesService.makeVertex(inputs.point);
    }

    verticesFromPoints(inputs: Inputs.OCCT.PointsDto): TopoDS_Vertex[] {
        return inputs.points.map(p => this.vertexFromPoint({ point: p }));
    }

    verticesCompoundFromPoints(inputs: Inputs.OCCT.PointsDto): TopoDS_Compound {
        const vertexes = this.verticesFromPoints(inputs);
        return this.converterService.makeCompound({ shapes: vertexes });
    }

    getVertices(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Vertex[] {
        return this.shapeGettersService.getVertices(inputs);
    }

    getVerticesAsPoints(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        const vertices = this.shapeGettersService.getVertices(inputs);
        return this.verticesToPoints({ shapes: vertices });
    }

    verticesToPoints(inputs: Inputs.OCCT.ShapesDto<TopoDS_Vertex>): Inputs.Base.Point3[] {
        return inputs.shapes.map(v => {
            const pt = this.occ.BRep_Tool.Pnt(v);
            const res = [pt.X(), pt.Y(), pt.Z()] as Inputs.Base.Point3;
            pt.delete();
            return res;
        });
    }

    pointsToVertices(inputs: Inputs.OCCT.ShapesDto<TopoDS_Vertex>): Inputs.Base.Point3[] {
        return inputs.shapes.map(v => {
            const pt = this.occ.BRep_Tool.Pnt(v);
            const res = [pt.X(), pt.Y(), pt.Z()] as Inputs.Base.Point3;
            pt.delete();
            return res;
        });
    }

    vertexToPoint(inputs: Inputs.OCCT.ShapeDto<TopoDS_Vertex>): Inputs.Base.Point3 {
        return this.converterService.vertexToPoint(inputs);
    }

    projectPoints(inputs: Inputs.OCCT.ProjectPointsOnShapeDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        const pointsAlongDir = inputs.points.map(p => [p[0] + inputs.direction[0], p[1] + inputs.direction[1], p[2] + inputs.direction[2]] as Inputs.Base.Point3);
        const lines = pointsAlongDir.map((p, i) => ({
            start: inputs.points[i],
            end: p
        }));
        const wiresFromPoints = this.wiresService.createLines({ lines, returnCompound: false }) as TopoDS_Wire[];
        const allPoints = wiresFromPoints.map((wire, index) => {
            const x = this.booleansService.intersection({
                shapes: [wire, inputs.shape],
                keepEdges: false
            });

            const res = x.map(s => {
                return this.shapeGettersService.getVertices({ shape: s });
            });
            
            if (res) {
                const pts = this.verticesToPoints({ shapes: res.flat().filter(s => s !== undefined) });
                if (inputs.projectionType === Inputs.OCCT.pointProjectionTypeEnum.closest) {
                    return [this.getClosestPointFromPoints(pts, inputs.points[index])];
                } else if (inputs.projectionType === Inputs.OCCT.pointProjectionTypeEnum.furthest) {
                    return [this.getFurthestPointFromPoints(pts, inputs.points[index])];
                } else if (inputs.projectionType === Inputs.OCCT.pointProjectionTypeEnum.closestAndFurthest) {
                    return [this.getClosestPointFromPoints(pts, inputs.points[index]), this.getFurthestPointFromPoints(pts, inputs.points[index])];
                } else if (inputs.projectionType === Inputs.OCCT.pointProjectionTypeEnum.all) {
                    return pts;
                } else {
                    return undefined;
                }
            } else {
                return undefined;
            }
        });
        const points = allPoints.flat().filter(s => s !== undefined);
        return points;
    }

    private getClosestPointFromPoints(points: Inputs.Base.Point3[], point: Inputs.Base.Point3): Inputs.Base.Point3 {
        let minDist = Number.MAX_VALUE;
        let closestPoint: Inputs.Base.Point3 = [0, 0, 0];
        points.forEach(p => {
            const dist = this.distanceBetweenTwoPoints(point, p);
            if (dist < minDist) {
                minDist = dist;
                closestPoint = p;
            }
        });
        return closestPoint;
    }

    private getFurthestPointFromPoints(points: Inputs.Base.Point3[], point: Inputs.Base.Point3): Inputs.Base.Point3 {
        let maxDist = 0;
        let furthestPoint: Inputs.Base.Point3 = [0, 0, 0];
        points.forEach(p => {
            const dist = this.distanceBetweenTwoPoints(point, p);
            if (dist > maxDist) {
                maxDist = dist;
                furthestPoint = p;
            }
        });
        return furthestPoint;
    }

    private distanceBetweenTwoPoints(p1: Inputs.Base.Point3, p2: Inputs.Base.Point3): number {
        const x = p2[0] - p1[0];
        const y = p2[1] - p1[1];
        const z = p2[2] - p1[2];
        return Math.sqrt(x * x + y * y + z * z);
    }

}
