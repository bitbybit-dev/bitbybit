import { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";

/**
 * Questions and repairs that apply to any OpenCascade shape whatever its kind: what type it is,
 * which way it is oriented, whether it is closed, valid or the same object as another, and
 * `unifySameDomain`, which merges faces and edges that lie on one surface after a boolean. For work
 * specific to one kind, use the vertex, edge, wire, face, shell, solid and compound classes beside
 * this one.
 */
export class OCCTShape {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Returns the shape as it is; the internal-edge purge is not applied in this version, so the
     * result is the input.
     * @param inputs - The shape
     * @returns The same shape
     * @group edit
     * @shortname purge internal edges
     * @drawable true
     */
    purgeInternalEdges(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Shape {
        return inputs.shape;
    }

    /**
     * Merges faces that lie on the same surface and edges that lie on the same curve into single
     * faces and edges, which cleans up the seams a boolean or a fuse leaves behind.
     *
     * `unifyEdges` and `unifyFaces` choose what to merge, and `concatBSplines` joins runs of
     * B-spline edges into one curve.
     * @param inputs - The shape and which kinds of merge to apply
     * @returns The simplified shape
     * @group edit
     * @shortname unify same domain
     * @drawable true
     * @example
     * ```typescript
     * const clean = await bitbybit.occt.shapes.shape.unifySameDomain({ shape: fused, unifyEdges: true, unifyFaces: true, concatBSplines: true });
     * ```
     */
    unifySameDomain(inputs: Inputs.OCCT.UnifySameDomainDto<TopoDS_Shape>): TopoDS_Shape {
        return this.occ.ShapeUpgrade_UnifySameDomain_Perform(
            inputs.shape, 
            inputs.unifyEdges, 
            inputs.unifyFaces, 
            inputs.concatBSplines
        );
    }

    /**
     * Tells whether the kernel has the shape flagged as closed, such as a wire that loops back to
     * its start or a shell with no gaps.
     * @param inputs - The shape
     * @returns True when the shape is flagged closed
     * @group analysis
     * @shortname is closed
     * @drawable false
     * @example
     * ```typescript
     * const wireIsClosed = await bitbybit.occt.shapes.shape.isClosed({ shape: wire });
     * ```
     */
    isClosed(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.Closed();
    }

    /**
     * Tells whether the kernel has the shape flagged as convex.
     * @param inputs - The shape
     * @returns True when the shape is flagged convex
     * @group analysis
     * @shortname is convex
     * @drawable false
     */
    isConvex(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.Convex();
    }

    /**
     * Tells whether the kernel has already run its validity check on the shape.
     * @param inputs - The shape
     * @returns True when the shape carries the checked flag
     * @group analysis
     * @shortname is checked
     * @drawable false
     */
    isChecked(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.Checked();
    }

    /**
     * Tells whether the kernel has the shape flagged as free, that is, not held inside another
     * shape.
     * @param inputs - The shape
     * @returns True when the shape carries the free flag
     * @group analysis
     * @shortname is free
     * @drawable false
     */
    isFree(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.Free();
    }

    /**
     * Tells whether the kernel has the shape flagged as infinite, such as an unbounded plane or
     * line.
     * @param inputs - The shape
     * @returns True when the shape carries the infinite flag
     * @group analysis
     * @shortname is infinite
     * @drawable false
     */
    isInfinite(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.Infinite();
    }

    /**
     * Tells whether the kernel has the shape flagged as modified since it was last checked.
     * @param inputs - The shape
     * @returns True when the shape carries the modified flag
     * @group analysis
     * @shortname is modified
     * @drawable false
     */
    isModified(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.Modified();
    }

    /**
     * Tells whether the kernel has the shape flagged as locked against changes.
     * @param inputs - The shape
     * @returns True when the shape carries the locked flag
     * @group analysis
     * @shortname is locked
     * @drawable false
     */
    isLocked(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.Locked();
    }

    /**
     * Tells whether the shape is empty: a handle that holds no geometry, which an operation that
     * failed can return.
     * @param inputs - The shape
     * @returns True when the shape holds nothing
     * @group analysis
     * @shortname is null
     * @drawable false
     * @example
     * ```typescript
     * const empty = await bitbybit.occt.shapes.shape.isNull({ shape: result });
     * ```
     */
    isNull(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.IsNull();
    }

    /**
     * Tells whether two handles point at the same geometry with the same placement and orientation.
     * @param inputs - The two shapes
     * @returns True when they are equal
     * @group analysis
     * @shortname is equal
     * @drawable false
     * @example
     * ```typescript
     * const equal = await bitbybit.occt.shapes.shape.isEqual({ shape: a, otherShape: b });
     * ```
     */
    isEqual(inputs: Inputs.OCCT.CompareShapesDto<TopoDS_Shape>): boolean {
        return inputs.shape.IsEqual(inputs.otherShape);
    }

    /**
     * Tells whether two handles differ in geometry, placement or orientation.
     * @param inputs - The two shapes
     * @returns True when they are not equal
     * @group analysis
     * @shortname is not equal
     * @drawable false
     */
    isNotEqual(inputs: Inputs.OCCT.CompareShapesDto<TopoDS_Shape>): boolean {
        return inputs.shape.IsNotEqual(inputs.otherShape);
    }

    /**
     * Tells whether two handles share the same underlying geometry, even if placed or oriented
     * differently.
     * @param inputs - The two shapes
     * @returns True when they share geometry
     * @group analysis
     * @shortname is partner
     * @drawable false
     */
    isPartner(inputs: Inputs.OCCT.CompareShapesDto<TopoDS_Shape>): boolean {
        return inputs.shape.IsPartner(inputs.otherShape);
    }

    /**
     * Tells whether two handles share the same geometry and placement, ignoring orientation.
     * @param inputs - The two shapes
     * @returns True when they are the same up to orientation
     * @group analysis
     * @shortname is same
     * @drawable false
     */
    isSame(inputs: Inputs.OCCT.CompareShapesDto<TopoDS_Shape>): boolean {
        return inputs.shape.IsSame(inputs.otherShape);
    }

    /**
     * Reads which way the shape is oriented: forward, reversed, internal or external, which for a
     * face decides which side its normal points to.
     * @param inputs - The shape
     * @returns The orientation
     * @group analysis
     * @shortname get orientation
     * @drawable false
     * @example
     * ```typescript
     * const orientation = await bitbybit.occt.shapes.shape.getOrientation({ shape: face });
     * ```
     */
    getOrientation(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.OCCT.topAbsOrientationEnum {
        const orientation = inputs.shape.Orientation();
        let result!: Inputs.OCCT.topAbsOrientationEnum;
        if (orientation === this.occ.TopAbs_Orientation.FORWARD) {
            result = Inputs.OCCT.topAbsOrientationEnum.forward;
        } else if (orientation === this.occ.TopAbs_Orientation.REVERSED) {
            result = Inputs.OCCT.topAbsOrientationEnum.reversed;
        } else if (orientation === this.occ.TopAbs_Orientation.INTERNAL) {
            result = Inputs.OCCT.topAbsOrientationEnum.internal;
        } else if (orientation === this.occ.TopAbs_Orientation.EXTERNAL) {
            result = Inputs.OCCT.topAbsOrientationEnum.external;
        }
        return result;
    }

    /**
     * Reads what kind of shape this is: vertex, edge, wire, face, shell, solid, compound or another
     * kernel type.
     * @param inputs - The shape
     * @returns The shape type
     * @group analysis
     * @shortname get shape type
     * @drawable false
     * @example
     * ```typescript
     * const type = await bitbybit.occt.shapes.shape.getShapeType({ shape: unknownShape });
     * ```
     */
    getShapeType(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.OCCT.shapeTypeEnum {
        return this.och.enumService.getShapeTypeEnum(inputs.shape);
    }

}
