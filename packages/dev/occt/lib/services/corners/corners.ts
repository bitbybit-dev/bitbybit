import { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import { Base } from "../../api/inputs";
import * as Models from "../../api/models";

export class OCCTCorners {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) { }

    filletCornerByPoint(inputs: Inputs.OCCT.FilletCornerByPointDto<TopoDS_Shape>): TopoDS_Shape {
        const points = this.pointsToVectorDouble(inputs.points);
        const mode = this.cornerModeToNumber(inputs.mode);
        const result = this.occ.FilletCornerByPoint(inputs.shape, points, inputs.radius, inputs.taperFactor, inputs.snapTolerance, mode);
        points.delete();
        if (result.IsNull()) {
            result.delete();
            throw new Error("Could not fillet the corner(s) for the given point(s).");
        }
        const shape = this.och.converterService.getActualTypeOfShape(result);
        result.delete();
        return shape;
    }

    chamferCornerByPoint(inputs: Inputs.OCCT.ChamferCornerByPointDto<TopoDS_Shape>): TopoDS_Shape {
        const points = this.pointsToVectorDouble(inputs.points);
        const mode = this.cornerModeToNumber(inputs.mode);
        const result = this.occ.ChamferCornerByPoint(inputs.shape, points, inputs.distance, inputs.angle, inputs.snapTolerance, mode);
        points.delete();
        if (result.IsNull()) {
            result.delete();
            throw new Error("Could not chamfer the corner(s) for the given point(s).");
        }
        const shape = this.och.converterService.getActualTypeOfShape(result);
        result.delete();
        return shape;
    }

    classifyCornerByPoint(inputs: Inputs.OCCT.ClassifyCornerByPointDto<TopoDS_Shape>): Models.OCCT.CornerByPointReport {
        const points = this.pointsToVectorDouble(inputs.points);
        const json = this.occ.ClassifyCornerByPoint(inputs.shape, points, inputs.snapTolerance);
        points.delete();
        return JSON.parse(json) as Models.OCCT.CornerByPointReport;
    }

    cornerByPointReport(inputs: Inputs.OCCT.FilletCornerByPointDto<TopoDS_Shape>): Models.OCCT.CornerByPointReport {
        const points = this.pointsToVectorDouble(inputs.points);
        const mode = this.cornerModeToNumber(inputs.mode);
        const json = this.occ.CornerByPointReport(inputs.shape, points, inputs.radius, inputs.taperFactor, inputs.snapTolerance, mode);
        points.delete();
        return JSON.parse(json) as Models.OCCT.CornerByPointReport;
    }

    private cornerModeToNumber(mode: Inputs.OCCT.cornerModeEnum): number {
        return mode === Inputs.OCCT.cornerModeEnum.planarOnly ? 1 : 0;
    }

    private pointsToVectorDouble(points: Base.Point3[]) {
        const vec = new this.occ.VectorDouble();
        for (const point of points) {
            vec.push_back(point[0]);
            vec.push_back(point[1]);
            vec.push_back(point[2]);
        }
        return vec;
    }

}
