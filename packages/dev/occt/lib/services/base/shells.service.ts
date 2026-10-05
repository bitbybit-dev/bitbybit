import type { BitbybitOcctModule, TopoDS_Face, TopoDS_Shell } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Inputs from "../../api/inputs";
import type { ConverterService } from "./converter.service";
import type * as Resolved from "../../api/resolved-inputs";
import { massesAndCentres } from "./kernel-arrays";
import { InputError } from "@bitbybit-dev/base";
import { checkedShapes } from "./input-checks";

export class ShellsService {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly converterService: ConverterService,
    ) { }

    getShellSurfaceArea(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shell>): number {
        return massesAndCentres(this.occ.SurfacePropertiesOfEach([inputs.shape]))[0]!.mass;
    }

    sewFaces(inputs: Resolved.OCCT.SewDto<TopoDS_Face>): TopoDS_Shell {
        checkedShapes(inputs.shapes);
        if (inputs.shapes.length === 0) {
            throw new InputError("`shapes` is empty, and sewing needs at least one face.", "shapes");
        }
        const sew = new this.occ.BRepBuilderAPI_Sewing(inputs.tolerance);
        inputs.shapes.forEach(face => {
            sew.Add(face);
        });
        sew.Perform();
        const res = sew.SewedShape();
        const result = this.converterService.getActualTypeOfShape(res);
        sew.delete();
        res.delete();
        return result;
    }


}
