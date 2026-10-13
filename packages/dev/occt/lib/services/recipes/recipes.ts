import type { BitbybitOcctModule, Handle_TDocStd_Document, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError, resolveDto, toRecipe } from "@bitbybit-dev/base";
import type { Base } from "@bitbybit-dev/base";
import * as Inputs from "../../api/inputs";
import type * as Resolved from "../../api/resolved-inputs";
import type { OccHelper } from "../../occ-helper";
import { occtFailure } from "../../kernel-failures";
import { readKernelException } from "../../kernel-exception";
import type { OCCTAssemblyManager } from "../assembly/manager";
import { documentPlan, documentStructure } from "./recipe-document";
import type { BuiltRoots, FirstFailure, KernelBrepDescription, KernelDescribedShape, KernelRecipeBuild, RecipeKernelReport, RecipeRootReport, StepFailure } from "./recipe-types";
import { IDENTITY_MATRIX, MAX_KERNEL_COUNT, SPLINED_FOR_IFC, STEPS_BEFORE_EXACT_BREPS } from "./recipes.constants";

function failureOf(report: RecipeRootReport): StepFailure | undefined {
    return report.built ? report.uncut : { node: report.node, reason: report.reason };
}

/**
 * Building recipes exactly: solids described as data - polygons, circles, extrusions, turns,
 * lofts, cuts by solids and planes, openings, unions, intersections, transforms and triangle meshes -
 * by a package that does not build geometry itself, such as one that reads building models. Every
 * step becomes an OpenCascade shape, so circles stay circles and the results measure, cut and export
 * to STEP like any other shape. A whole recipe is built in one kernel call, its steps in parallel on
 * the multithreaded kernel.
 *
 * Experimental: the recipe format may still change before it is declared stable.
 * @beta
 */
export class OCCTRecipes {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper,
        private readonly assembly: OCCTAssemblyManager,
    ) { }

    /**
     * Builds each root of a recipe as a shape placed by its matrix, in root order.
     *
     * Shared steps are built once. A mesh keeps its triangles unless `facetedMeshes` is set or a
     * boolean needs it. A root that failed, or whose opening failed, throws naming the step; with
     * `emptyWhenFailed` it comes back empty, or cut by the openings built.
     * @param inputs - The recipe, whether Z turns into Y, whether failed roots come back empty, and the largest mesh built
     * @returns One shape per root, in root order
     * @group build
     * @shortname build recipe
     * @drawable true
     * @example
     * ```typescript
     * const recipe = await bitbybit.ifc.geometry.recipe({ model });
     * const shapes = await bitbybit.occt.recipes.build({ recipe, adjustZtoY: true, emptyWhenFailed: true });
     * ```
     */
    build(inputs: Inputs.OCCT.BuildRecipeDto): TopoDS_Shape[] {
        const resolved = resolveDto(Inputs.OCCT.BuildRecipeDto, inputs) as Resolved.OCCT.BuildRecipeDto;
        const recipe = toRecipe(resolved.recipe);
        const built = this.run(recipe, recipe.roots, resolved.adjustZtoY, resolved.facetedMeshes, resolved.maxTriangles);
        const failed = this.firstFailure(built);
        if (failed && !resolved.emptyWhenFailed) {
            built.shapes.forEach((shape) => shape?.delete());
            throw this.failure(failed, failed.index);
        }
        return built.shapes.map((shape) => shape ?? this.och.converterService.makeCompound({ shapes: [] }));
    }

    /**
     * Builds the roots of a recipe into an assembly document, ready to export to STEP.
     *
     * Roots sharing the `groupBy` tag form one product named by its `name` tag, with its tags as
     * properties and its parts coloured by `rgba`. A step only moved and turned is one part placed
     * by each root. Failures are handled as in `build`.
     * @param inputs - The recipe, the top assembly's name, the grouping tag, whether failed roots are left out, and the largest mesh built
     * @returns The document handle
     * @group build
     * @shortname build recipe document
     * @drawable false
     * @example
     * ```typescript
     * const recipe = await bitbybit.ifc.geometry.recipe({ model });
     * const document = await bitbybit.occt.recipes.buildDocument({ recipe, name: "House" });
     * const step = await bitbybit.occt.assembly.manager.exportDocumentToStep({ document, fileName: "house.step", tryDownload: false });
     * ```
     */
    buildDocument(inputs: Inputs.OCCT.BuildRecipeDocumentDto): Handle_TDocStd_Document {
        const resolved = resolveDto(Inputs.OCCT.BuildRecipeDocumentDto, inputs) as Resolved.OCCT.BuildRecipeDocumentDto;
        const recipe = toRecipe(resolved.recipe);
        const plan = documentPlan(recipe);
        const built = this.run(recipe, plan.parts.map((part) => part.root), false, resolved.facetedMeshes, resolved.maxTriangles);
        try {
            const failed = this.firstFailure(built);
            if (failed && !resolved.emptyWhenFailed) {
                throw this.failure(failed, plan.parts[failed.index]!.roots[0]!);
            }
            return this.assembly.buildAssemblyDocument({ structure: documentStructure(recipe, plan, built.shapes, resolved.name, resolved.groupBy) });
        } finally {
            built.shapes.forEach((shape) => shape?.delete());
        }
    }

    /**
     * Describes a shape exactly as a recipe: a brep step for its solids and their cavities, and one
     * for the faces outside any solid.
     *
     * Lines, circles, ellipses and elementary surfaces stay as they are, swept surfaces keep their
     * curve, and the rest become B-splines, as do cones and swept surfaces under `ifcSurfaces`.
     * `recipes.build` builds it back.
     * @param inputs - The shape, its unit and whether to keep to the surfaces IFC takes
     * @returns A recipe whose one root is the shape
     * @group describe
     * @shortname describe shape
     * @drawable false
     * @example
     * ```typescript
     * const recipe = await bitbybit.occt.recipes.describe({ shape });
     * const [again] = await bitbybit.occt.recipes.build({ recipe });
     * ```
     */
    describe(inputs: Inputs.OCCT.DescribeRecipeDto<TopoDS_Shape>): Base.Recipe {
        const resolved = resolveDto(Inputs.OCCT.DescribeRecipeDto, inputs) as Resolved.OCCT.DescribeRecipeDto<TopoDS_Shape>;
        if (!(resolved.millimetresPerUnit > 0) || !Number.isFinite(resolved.millimetresPerUnit)) {
            throw new InputError(`\`millimetresPerUnit\` is ${resolved.millimetresPerUnit}, and a unit has to be a finite length above zero.`, "millimetresPerUnit");
        }
        if (typeof this.occ.DescribeShapeExact !== "function") {
            throw new Error("This OpenCascade kernel cannot describe shapes exactly; a newer kernel can.");
        }
        let described: KernelBrepDescription;
        try {
            described = this.occ.DescribeShapeExact(resolved.shape, resolved.ifcSurfaces ? SPLINED_FOR_IFC : 0);
        } catch (thrown) {
            throw readKernelException(this.occ, thrown);
        }
        const { nodes, tolerance } = JSON.parse(described.description) as KernelDescribedShape;
        const steps: Base.RecipeNode[] = nodes.length > 1 ? [...nodes, { op: "compound", of: nodes.map((_, at) => at) }] : nodes;
        return toRecipe({
            format: "bitbybit.recipe",
            version: 1,
            millimetresPerUnit: resolved.millimetresPerUnit,
            tolerance,
            buffers: { f64: Float64Array.from(described.numbers), i32: new Int32Array(0) },
            nodes: steps,
            roots: [{ node: steps.length - 1, matrix: IDENTITY_MATRIX, tag: {} }],
        });
    }

    private run(recipe: Base.Recipe, roots: readonly Base.RecipeRoot[], adjustZtoY: boolean, facetedMeshes: boolean, maxTriangles: number): BuiltRoots<TopoDS_Shape> {
        if (!(maxTriangles >= 0)) {
            throw new InputError(`\`maxTriangles\` is ${maxTriangles}, and the most triangles a mesh may hold has to be 0 or more.`, "maxTriangles");
        }
        if (typeof this.occ.BuildRecipes !== "function") {
            throw new Error("This OpenCascade kernel cannot build recipes; a newer kernel can.");
        }
        const text = JSON.stringify({ tolerance: recipe.tolerance, nodes: this.kernelNodes(recipe.nodes), roots: roots.map(({ node, matrix }) => ({ node, matrix })) });
        let result: KernelRecipeBuild<TopoDS_Shape>;
        try {
            result = this.occ.BuildRecipes(text, recipe.buffers.f64, recipe.buffers.i32, adjustZtoY, facetedMeshes, Math.min(Math.floor(maxTriangles), MAX_KERNEL_COUNT));
        } catch (thrown) {
            throw readKernelException(this.occ, thrown);
        }
        return { shapes: result.shapes, reports: (JSON.parse(result.report) as RecipeKernelReport).roots };
    }

    private kernelNodes(nodes: readonly Base.RecipeNode[]): readonly Base.RecipeNode[] {
        const steps = this.kernelSteps();
        return nodes.map((node) => node.op === "brep" && !steps.has(node.op) && node.fallback !== undefined ? { op: "compound", of: [node.fallback] } : node);
    }

    private kernelSteps(): ReadonlySet<string> {
        if (typeof this.occ.RecipeSteps !== "function") {
            return STEPS_BEFORE_EXACT_BREPS;
        }
        return new Set(JSON.parse(this.occ.RecipeSteps()) as string[]);
    }

    private failure(failed: StepFailure, root: number): Error {
        return occtFailure("occt.recipe.failed", { node: failed.node, root, reason: failed.reason });
    }

    private firstFailure(built: BuiltRoots<TopoDS_Shape>): FirstFailure | undefined {
        for (let index = 0; index < built.reports.length; index++) {
            const failure = failureOf(built.reports[index]!);
            if (failure !== undefined) {
                return { index, ...failure };
            }
        }
        return undefined;
    }
}
