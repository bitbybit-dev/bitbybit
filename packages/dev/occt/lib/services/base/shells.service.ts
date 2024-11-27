import { OpenCascadeInstance, TopoDS_Face, TopoDS_Shell } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs/inputs";
import { ShapeGettersService } from "./shape-getters";
import { FacesService } from "./faces.service";
import { ConverterService } from "./converter.service";

export class ShellsService {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly shapeGettersService: ShapeGettersService,
        private readonly converterService: ConverterService,
        private readonly facesService: FacesService,
    ) { }

    getShellSurfaceArea(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shell>): number {
        const faces = this.shapeGettersService.getFaces(inputs);
        const faceAreas = this.facesService.getFacesAreas({ shapes: faces });
        return faceAreas.reduce((p, c) => p + c, 0);
    }

    sewFaces(inputs: Inputs.OCCT.SewDto<TopoDS_Face>): TopoDS_Shell {
        const sew = new this.occ.BRepBuilderAPI_Sewing(inputs.tolerance, true, true, true, false);
        inputs.shapes.forEach(face => {
            sew.Add(face);
        });
        const messageProgress = new this.occ.Message_ProgressRange_1();
        sew.Perform(messageProgress);
        const res = sew.SewedShape();
        const result = this.converterService.getActualTypeOfShape(res);
        sew.delete();
        messageProgress.delete();
        res.delete();
        return result;
    }


}
