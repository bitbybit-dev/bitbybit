import { Inputs } from "@bitbybit-dev/occt";
import { OCCTWorkerManager } from "../../../occ-worker/occ-worker-manager";

export class OCCTShape {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Remove internal edges that are not connected to any face in the shape
     * @param inputs shape
     * @returns purged shape
     * @group edit
     * @shortname purge internal edges
     * @drawable true
     */
    purgeInternalEdges(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.shape.purgeInternalEdges", inputs);
    }

    /**
     * Unifies faces, edges in the same domain and has possibility to concatinate bsplines
     * @param inputs shape
     * @returns unified shape
     * @group edit
     * @shortname unify same domain
     * @drawable true
     */
    unifySameDomain(inputs: Inputs.OCCT.UnifySameDomainDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.shape.unifySameDomain", inputs);
    }

    /**
     * Check if the shape is closed
     * @param inputs shape
     * @returns boolean answer
     * @group analysis
     * @shortname is closed
     * @drawable false
     */
    isClosed(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<boolean> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.shape.isClosed", inputs);
    }

    /**
     * Check if the shape is convex
     * @param inputs shape
     * @returns boolean answer
     * @group analysis
     * @shortname is convex
     * @drawable false
     */
    isConvex(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<boolean> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.shape.isConvex", inputs);
    }

    /**
     * Check if the shape is checked
     * @param inputs shape
     * @returns boolean answer
     * @group analysis
     * @shortname is checked
     * @drawable false
     */
    isChecked(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<boolean> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.shape.isChecked", inputs);
    }

    /**
     * Check if the shape is free
     * @param inputs shape
     * @returns boolean answer
     * @group analysis
     * @shortname is free
     * @drawable false
     */
    isFree(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<boolean> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.shape.isFree", inputs);
    }

    /**
     * Check if the shape is infinite
     * @param inputs shape
     * @returns boolean answer
     * @group analysis
     * @shortname is infinite
     * @drawable false
     */
    isInfinite(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<boolean> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.shape.isInfinite", inputs);
    }

    /**
     * Check if the shape is modified
     * @param inputs shape
     * @returns boolean answer
     * @group analysis
     * @shortname is modified
     * @drawable false
     */
    isModified(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<boolean> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.shape.isModified", inputs);
    }

    /**
     * Check if the shape is locked
     * @param inputs shape
     * @returns boolean answer
     * @group analysis
     * @shortname is locked
     * @drawable false
     */
    isLocked(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<boolean> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.shape.isLocked", inputs);
    }

    /**
     * Check if the shape is null
     * @param inputs shape
     * @returns boolean answer
     * @group analysis
     * @shortname is null
     * @drawable false
     */
    isNull(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<boolean> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.shape.isNull", inputs);
    }

    /**
     * Check if the shape is equal to other shape
     * @param inputs shapes
     * @returns boolean answer
     * @group analysis
     * @shortname is equal
     * @drawable false
     */
    isEqual(inputs: Inputs.OCCT.CompareShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<boolean> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.shape.isEqual", inputs);
    }
 
    /**
     * Check if the shape is not equal to other shape
     * @param inputs shapes
     * @returns boolean answer
     * @group analysis
     * @shortname is not equal
     * @drawable false
     */
    isNotEqual(inputs: Inputs.OCCT.CompareShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<boolean> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.shape.isNotEqual", inputs);
    }

    /**
     * Check if the shape is partner to other shape
     * @param inputs shapes
     * @returns boolean answer
     * @group analysis
     * @shortname is partner
     * @drawable false
     */
    isPartner(inputs: Inputs.OCCT.CompareShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<boolean> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.shape.isPartner", inputs);
    }

    /**
     * Check if the shape is the same as the other shape
     * @param inputs shapes
     * @returns boolean answer
     * @group analysis
     * @shortname is same
     * @drawable false
     */
    isSame(inputs: Inputs.OCCT.CompareShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<boolean> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.shape.isSame", inputs);
    }

    /**
     * Get the shape orientation
     * @param inputs shape
     * @returns shape orientation
     * @group analysis
     * @shortname get orientation
     * @drawable false
     */
    getOrientation(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.topAbsOrientationEnum> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.shape.getOrientation", inputs);
    }

    /**
     * Get the shape type
     * @param inputs shape
     * @returns shape type
     * @group analysis
     * @shortname get shape type
     * @drawable false
     */
    getShapeType(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.shapeTypeEnum> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.shape.getShapeType", inputs);
    }
}
