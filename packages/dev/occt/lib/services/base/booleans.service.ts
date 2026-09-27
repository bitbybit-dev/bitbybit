import { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Resolved from "../../api/resolved-inputs";
import { InputError } from "@bitbybit-dev/base";
import { occtFailure } from "../../kernel-failures";

type BooleanOperation = { IsDone(): boolean; HasErrors(): boolean; ErrorAlerts(): string; Shape(): TopoDS_Shape; delete(): void };

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
        let intersectionResults: TopoDS_Shape[] = [];

        for (let i = 1; i < inputs.shapes.length; i++) {
            let intersectionResult: TopoDS_Shape;
            try {
                intersectionResult = this.resultOf(new this.occ.BRepAlgoAPI_Common(intersectShape, inputs.shapes[i]!));
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

        if (!inputs.keepEdges && intersectionResults.length > 0) {
            intersectionResults = intersectionResults.map(i => {
                return this.occ.ShapeUpgrade_UnifySameDomain_Perform(i, true, true, false);
            });
        }

        return intersectionResults;
    }

    difference(inputs: Resolved.OCCT.DifferenceDto<TopoDS_Shape>): TopoDS_Shape {
        this.refuseEmpty([inputs.shape], "shape");
        if (inputs.shapes.length === 0) {
            throw new InputError("`shapes` is empty, so there is nothing to subtract from `shape`.", "shapes");
        }
        this.refuseEmpty(inputs.shapes, "shapes");
        let difference = inputs.shape;
        const objectsToSubtract = inputs.shapes;
        for (let i = 0; i < objectsToSubtract.length; i++) {
            const cutFrom = difference;
            try {
                difference = this.resultOf(new this.occ.BRepAlgoAPI_Cut(cutFrom, objectsToSubtract[i]!));
            } finally {
                if (cutFrom !== inputs.shape) {
                    cutFrom.delete();
                }
            }
        }

        if (!inputs.keepEdges) {
            const fusedShape = this.occ.ShapeUpgrade_UnifySameDomain_Perform(difference, true, true, false);
            difference.delete();
            difference = fusedShape;
        }

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
        let combined = inputs.shapes[0]!;
        const first = inputs.shapes.length > 1 ? 1 : 0;
        for (let i = first; i < inputs.shapes.length; i++) {
            const fusedFrom = combined;
            try {
                combined = this.resultOf(new this.occ.BRepAlgoAPI_Fuse(fusedFrom, inputs.shapes[i]!));
            } finally {
                if (fusedFrom !== inputs.shapes[0]) {
                    fusedFrom.delete();
                }
            }
        }

        if (!inputs.keepEdges) {
            combined = this.occ.ShapeUpgrade_UnifySameDomain_Perform(combined, true, true, false);
        }

        return combined;
    }

    private resultOf(operation: BooleanOperation): TopoDS_Shape {
        if (!operation.IsDone() || operation.HasErrors()) {
            const alerts = operation.ErrorAlerts().split(" ");
            operation.delete();
            throw alerts.includes("BOPAlgo_AlertBOPNotAllowed") ? occtFailure("occt.boolean.mixedDimensions") : occtFailure("occt.boolean.failed");
        }
        const shape = operation.Shape();
        operation.delete();
        if (shape.IsNull()) {
            shape.delete();
            throw occtFailure("occt.boolean.failed");
        }
        return shape;
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
