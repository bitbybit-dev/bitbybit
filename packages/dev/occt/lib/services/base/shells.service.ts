import type { BitbybitOcctModule, TopoDS_Face, TopoDS_Shape, TopoDS_Shell } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import { historiesFromKernel } from "./history";
import type { ConverterService } from "./converter.service";
import type * as Resolved from "../../api/resolved-inputs";
import { massesAndCentres } from "./kernel-arrays";
import { InputError } from "@bitbybit-dev/base";
import { checkedShapes } from "./input-checks";
import { readKernelException } from "../../kernel-exception";

const SEWING_REFUSAL = /^Standard_DomainError: SolidFromFacesWithHistory: (.+)$/;

export class ShellsService {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly converterService: ConverterService,
    ) { }

    sewFacesWithHistory(inputs: Resolved.OCCT.SewDto<TopoDS_Shape>): Models.OCCT.ShapeWithHistories<TopoDS_Shape> {
        const sewn = this.occ.SewWithHistory(this.facesToSew(inputs.shapes), inputs.tolerance);
        const shape = this.converterService.castAndRelease(sewn.shape);
        return { shape, histories: historiesFromKernel(sewn.histories) };
    }

    solidFromFacesWithHistory(inputs: Resolved.OCCT.SewDto<TopoDS_Shape>): Models.OCCT.ShapeWithHistories<TopoDS_Shape> {
        const solid = this.solidSewnFrom(this.facesToSew(inputs.shapes), inputs.tolerance);
        const shape = this.converterService.castAndRelease(solid.shape);
        return { shape, histories: historiesFromKernel(solid.histories) };
    }

    private solidSewnFrom(faces: TopoDS_Shape[], tolerance: number): ReturnType<BitbybitOcctModule["SolidFromFacesWithHistory"]> {
        try {
            return this.occ.SolidFromFacesWithHistory(faces, tolerance);
        } catch (thrown) {
            const read = readKernelException(this.occ, thrown);
            const reason = read instanceof Error ? SEWING_REFUSAL.exec(read.message)?.[1] : undefined;
            throw reason === undefined ? read : new InputError(`\`shapes\` do not sew into one solid: ${reason}.`, "shapes");
        }
    }

    private facesToSew<T extends TopoDS_Shape>(shapes: T[]): T[] {
        checkedShapes(shapes);
        if (shapes.length === 0) {
            throw new InputError("`shapes` is empty, and sewing needs at least one face.", "shapes");
        }
        return shapes;
    }

    getShellSurfaceArea(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shell>): number {
        return massesAndCentres(this.occ.SurfacePropertiesOfEach([inputs.shape]))[0]!.mass;
    }

    sewFaces(inputs: Resolved.OCCT.SewDto<TopoDS_Face>): TopoDS_Shell {
        this.facesToSew(inputs.shapes);
        const sew = new this.occ.BRepBuilderAPI_Sewing(inputs.tolerance);
        inputs.shapes.forEach(face => {
            sew.Add(face);
        });
        sew.Perform();
        const res = sew.SewedShape();
        const result = this.converterService.castAndRelease(res);
        sew.delete();
        return result;
    }
}
