import { BitbybitOcctModule, TopoDS_Compound, TopoDS_Shape, TopoDS_Vertex } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import { ConverterService } from "./converter.service";
import { EntitiesService } from "./entities.service";
import { ShapeGettersService } from "./shape-getters";
import * as Resolved from "../../api/resolved-inputs";
import { checkedShapes } from "./input-checks";

export class VerticesService {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly entitiesService: EntitiesService,
        private readonly converterService: ConverterService,
        private readonly shapeGettersService: ShapeGettersService,
    ) { }


    vertexFromXYZ(inputs: Resolved.OCCT.XYZDto): TopoDS_Vertex {
        return this.entitiesService.makeVertex([inputs.x, inputs.y, inputs.z]);
    }

    vertexFromPoint(inputs: Resolved.OCCT.PointDto): TopoDS_Vertex {
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
        checkedShapes(inputs.shapes);
        return inputs.shapes.map(v => {
            const pt = this.occ.BRep_Tool_Pnt(v);
            const res = [pt.X(), pt.Y(), pt.Z()] as Inputs.Base.Point3;
            pt.delete();
            return res;
        });
    }

    pointsToVertices(inputs: Inputs.OCCT.ShapesDto<TopoDS_Vertex>): Inputs.Base.Point3[] {
        checkedShapes(inputs.shapes);
        return inputs.shapes.map(v => {
            const pt = this.occ.BRep_Tool_Pnt(v);
            const res = [pt.X(), pt.Y(), pt.Z()] as Inputs.Base.Point3;
            pt.delete();
            return res;
        });
    }

    vertexToPoint(inputs: Inputs.OCCT.ShapeDto<TopoDS_Vertex>): Inputs.Base.Point3 {
        return this.converterService.vertexToPoint(inputs);
    }

    projectPoints(inputs: Resolved.OCCT.ProjectPointsOnShapeDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        const starts = new this.occ.VectorDouble();
        inputs.points.forEach(point => {
            starts.push_back(point[0]);
            starts.push_back(point[1]);
            starts.push_back(point[2]);
        });
        const [dx, dy, dz] = inputs.direction;
        const found = this.occ.ShapeCrossingsAlong(inputs.shape, starts, dx, dy, dz);
        starts.delete();
        const crossings: Inputs.Base.Point3[][] = inputs.points.map(() => []);
        for (let i = 0; i < found.size(); i += 4) {
            crossings[found.get(i)!]!.push([found.get(i + 1)!, found.get(i + 2)!, found.get(i + 3)!]);
        }
        found.delete();
        return crossings.flatMap(hits => this.keptCrossings(hits, inputs.projectionType));
    }

    private keptCrossings(hits: Inputs.Base.Point3[], kept: Inputs.OCCT.pointProjectionTypeEnum): Inputs.Base.Point3[] {
        if (hits.length === 0) {
            return [];
        }
        const nearest = hits[0]!;
        const furthest = hits[hits.length - 1]!;
        switch (kept) {
            case Inputs.OCCT.pointProjectionTypeEnum.closest:
                return [nearest];
            case Inputs.OCCT.pointProjectionTypeEnum.furthest:
                return [furthest];
            case Inputs.OCCT.pointProjectionTypeEnum.closestAndFurthest:
                return [nearest, furthest];
            case Inputs.OCCT.pointProjectionTypeEnum.all:
                return hits;
            default:
                return [];
        }
    }

}
