import { BitbybitBool_Strategy, BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import * as Resolved from "../../api/resolved-inputs";
import * as Models from "../../api/models";
import { historyFromKernel } from "./history";
import { InputError } from "@bitbybit-dev/base";
import { occtFailure } from "../../kernel-failures";
import { checkedShape, checkedShapes } from "./input-checks";

export class BooleansService {

    constructor(
        private readonly occ: BitbybitOcctModule,
    ) { }

    intersection(inputs: Resolved.OCCT.IntersectionDto<TopoDS_Shape>): TopoDS_Shape[] {
        if (inputs.shapes.length < 2) {
            throw (new Error("Intersection requires 2 or more shapes to be given"));
        }

        checkedShapes(inputs.shapes);
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
        checkedShape(inputs.shape);
        if (inputs.shapes.length === 0) {
            throw new InputError("`shapes` is empty, so there is nothing to subtract from `shape`.", "shapes");
        }
        checkedShapes(inputs.shapes);
        return this.loneSolidOf(this.resultOf(this.occ.BooleanCut([inputs.shape], inputs.shapes, !inputs.keepEdges, 0, this.strategyOf(inputs.strategy))));
    }

    /**
     * The solid of a compound that holds nothing but that one solid, or the shape as it is: a
     * compound that also holds a face or a wire keeps them.
     */
    private loneSolidOf(shape: TopoDS_Shape): TopoDS_Shape {
        let current: TopoDS_Shape = shape.clone();
        while (current.ShapeType() === this.occ.TopAbs_ShapeEnum.COMPOUND) {
            const children = new this.occ.TopoDS_Iterator(current);
            const only = children.More() ? children.Value() : undefined;
            if (only !== undefined) {
                children.Next();
            }
            const isAlone = only !== undefined && !children.More();
            children.delete();
            current.delete();
            if (!isAlone) {
                only?.delete();
                return shape;
            }
            current = only;
        }
        if (current.ShapeType() !== this.occ.TopAbs_ShapeEnum.SOLID) {
            current.delete();
            return shape;
        }
        shape.delete();
        return current;
    }

    union(inputs: Resolved.OCCT.UnionDto<TopoDS_Shape>): TopoDS_Shape {
        if (inputs.shapes.length === 0) {
            throw new InputError("`shapes` is empty, so there is nothing to join.", "shapes");
        }
        checkedShapes(inputs.shapes);
        return this.resultOf(this.occ.BooleanFuse(inputs.shapes, !inputs.keepEdges, 0, this.strategyOf(inputs.strategy)));
    }

    private strategyOf(strategy: Inputs.OCCT.booleanStrategyEnum): BitbybitBool_Strategy {
        switch (strategy) {
            case Inputs.OCCT.booleanStrategyEnum.inGroups:
                return this.occ.BitbybitBool_Strategy.InGroups;
            case Inputs.OCCT.booleanStrategyEnum.allAtOnce:
                return this.occ.BitbybitBool_Strategy.AllAtOnce;
            default:
                return this.occ.BitbybitBool_Strategy.OneAfterAnother;
        }
    }

    unionWithHistory(inputs: Resolved.OCCT.UnionDto<TopoDS_Shape>): Models.OCCT.ShapeWithHistories<TopoDS_Shape> {
        if (inputs.shapes.length === 0) {
            throw new InputError("`shapes` is empty, so there is nothing to join.", "shapes");
        }
        checkedShapes(inputs.shapes);
        const result = this.occ.BooleanFuseWithHistory(inputs.shapes, !inputs.keepEdges, 0, this.strategyOf(inputs.strategy));
        return { shape: this.resultOf(result), histories: result.histories.map(historyFromKernel) };
    }

    differenceWithHistory(inputs: Resolved.OCCT.DifferenceDto<TopoDS_Shape>): Models.OCCT.ShapeWithHistories<TopoDS_Shape> {
        checkedShape(inputs.shape);
        if (inputs.shapes.length === 0) {
            throw new InputError("`shapes` is empty, so there is nothing to subtract from `shape`.", "shapes");
        }
        checkedShapes(inputs.shapes);
        const result = this.occ.BooleanCutWithHistory([inputs.shape], inputs.shapes, !inputs.keepEdges, 0, this.strategyOf(inputs.strategy));
        return { shape: this.loneSolidOf(this.resultOf(result)), histories: result.histories.map(historyFromKernel) };
    }

    private resultOf(result: { shape: TopoDS_Shape | null, errorAlerts: string }): TopoDS_Shape {
        if (result.shape === null) {
            throw result.errorAlerts.split(" ").includes("BOPAlgo_AlertBOPNotAllowed") ? occtFailure("occt.boolean.mixedDimensions") : occtFailure("occt.boolean.failed");
        }
        return result.shape;
    }

    private hasContent(shape: TopoDS_Shape): boolean {
        const children = new this.occ.TopoDS_Iterator(shape);
        const found = children.More();
        children.delete();
        return found;
    }

}
