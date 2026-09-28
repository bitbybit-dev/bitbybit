import { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Resolved from "../../api/resolved-inputs";
import { InputError } from "@bitbybit-dev/base";
import { occtFailure } from "../../kernel-failures";

export class BooleansService {

    constructor(
        private readonly occ: BitbybitOcctModule,
    ) { }

    intersection(inputs: Resolved.OCCT.IntersectionDto<TopoDS_Shape>): TopoDS_Shape[] {
        if (inputs.shapes.length < 2) {
            throw (new Error("Intersection requires 2 or more shapes to be given"));
        }

        this.refuseEmpty(inputs.shapes, "shapes");
        const intersectShape = inputs.shapes[0]!;
        const intersectionResults: TopoDS_Shape[] = [];

        for (let i = 1; i < inputs.shapes.length; i++) {
            let intersectionResult: TopoDS_Shape;
            try {
                intersectionResult = this.resultOf(this.occ.BooleanCommon([intersectShape], [inputs.shapes[i]!], !inputs.keepEdges, 0));
            } catch (failure) {
                intersectionResults.forEach(r => r.delete());
                throw failure;
            }
            if (this.hasContent(intersectionResult)) {
                intersectionResults.push(intersectionResult);
            } else {
                intersectionResult.delete();
            }
        }
        return intersectionResults;
    }

    difference(inputs: Resolved.OCCT.DifferenceDto<TopoDS_Shape>): TopoDS_Shape {
        this.refuseEmpty([inputs.shape], "shape");
        if (inputs.shapes.length === 0) {
            throw new InputError("`shapes` is empty, so there is nothing to subtract from `shape`.", "shapes");
        }
        this.refuseEmpty(inputs.shapes, "shapes");
        let difference = this.resultOf(this.occ.BooleanCut([inputs.shape], inputs.shapes, !inputs.keepEdges, 0));

        if (difference.ShapeType() === this.occ.TopAbs_ShapeEnum.COMPOUND) {
            const solids = this.occ.SolidsOf(difference, false);
            if (solids.length === 1) {
                difference.delete();
                difference = solids[0]!;
            } else {
                solids.forEach(solid => solid.delete());
            }
        }

        return difference;
    }

    union(inputs: Resolved.OCCT.UnionDto<TopoDS_Shape>): TopoDS_Shape {
        if (inputs.shapes.length === 0) {
            throw new InputError("`shapes` is empty, so there is nothing to join.", "shapes");
        }
        this.refuseEmpty(inputs.shapes, "shapes");
        return this.resultOf(this.occ.BooleanFuse(inputs.shapes, !inputs.keepEdges, 0));
    }

    private resultOf(result: { shape: TopoDS_Shape | null, errorAlerts: string }): TopoDS_Shape {
        if (result.shape === null) {
            throw result.errorAlerts.split(" ").includes("BOPAlgo_AlertBOPNotAllowed") ? occtFailure("occt.boolean.mixedDimensions") : occtFailure("occt.boolean.failed");
        }
        return result.shape;
    }

    private refuseEmpty(shapes: readonly (TopoDS_Shape | undefined)[], property: string): void {
        shapes.forEach((shape, index) => {
            if (!shape || shape.IsNull()) {
                const which = property === "shape" ? "The shape" : `The shape at position ${index} of \`shapes\``;
                throw new InputError(`${which} is empty, as an operation that failed can leave it; nothing can be combined with it.`, property);
            }
        });
    }

    private hasContent(shape: TopoDS_Shape): boolean {
        const children = new this.occ.TopoDS_Iterator(shape);
        const found = children.More();
        children.delete();
        return found;
    }

}
