import { BitbybitOcctModule, TopoDS_Compound, TopoDS_Shape, TopoDS_Wire } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import * as Inputs from "../api/inputs";
import { PathBuilder } from "../svg/path-builder";
import { SvgFaceBuilder, SvgFaceRule } from "../svg/svg-face-builder";
import { normalizeSvg } from "../svg/svg-normalizer";
import { SvgElement, SvgStyle, SvgSubpath } from "../svg/svg-models";

type PlacedShape = {
    shape: TopoDS_Shape;
    isFace: boolean;
    closed: boolean;
    meta: Partial<Inputs.OCCT.SVGShape<TopoDS_Shape>>;
};

type BuiltScene = {
    placed: PlacedShape[];
    warnings: string[];
    viewBox?: [number, number, number, number];
};

/**
 * SVG importer: parses an SVG document entirely in TypeScript (XML, the path
 * mini-language, transforms, presentation style cascade and basic shapes),
 * reduces it to the generic path vocabulary, and builds OCCT wires/faces with
 * per-element colour/stroke metadata bundled alongside each shape.
 */
export class OCCTSVG {
    private readonly builder: PathBuilder;
    private readonly faceBuilder: SvgFaceBuilder;

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
        this.builder = new PathBuilder(occ, och);
        this.faceBuilder = new SvgFaceBuilder(occ, och);
    }

    /** Resolve the public face strategy + an element's own fill into a concrete rule (or none → wires). */
    private resolveRule(strategy: Inputs.OCCT.svgFaceStrategyEnum, style: SvgStyle): SvgFaceRule | undefined {
        if (strategy === Inputs.OCCT.svgFaceStrategyEnum.none) { return undefined; }
        if (style.fill === "none") { return undefined; }
        if (strategy === Inputs.OCCT.svgFaceStrategyEnum.perSubpath) { return "perSubpath"; }
        if (strategy === Inputs.OCCT.svgFaceStrategyEnum.evenOdd) { return "evenOdd"; }
        if (strategy === Inputs.OCCT.svgFaceStrategyEnum.nonzero) { return "nonzero"; }
        return style.fillRule === "evenodd" ? "evenOdd" : "nonzero";
    }

    /** Pull the individual wires out of a built element (a single wire or a compound of wires). */
    private extractWires(shape: TopoDS_Shape): { wires: TopoDS_Wire[]; cleanup: TopoDS_Shape[] } {
        if (this.och.enumService.getShapeTypeEnum(shape) === Inputs.OCCT.shapeTypeEnum.wire) {
            return { wires: [shape as TopoDS_Wire], cleanup: [shape] };
        }
        const wires: TopoDS_Wire[] = [];
        const cleanup: TopoDS_Shape[] = [shape];
        this.och.iteratorService.forEachShapeInCompound(shape, (_i: number, child: TopoDS_Shape) => {
            const typed = this.och.converterService.getActualTypeOfShape(child) as TopoDS_Shape;
            if (typed !== child) { try { child.delete(); } catch { /* noop */ } }
            cleanup.push(typed);
            if (this.och.enumService.getShapeTypeEnum(typed) === Inputs.OCCT.shapeTypeEnum.wire) {
                wires.push(typed as TopoDS_Wire);
            }
        });
        return { wires, cleanup };
    }

    /** Convert the internal normalized subpath to the public path vocabulary. */
    private toPathSubpath(sp: SvgSubpath): Inputs.OCCT.PathSubpath {
        return {
            start: sp.start,
            closed: sp.closed,
            segments: sp.segments.map((seg) => {
                if (seg.type === "quad") {
                    return { type: "quadratic", c: seg.c, to: seg.to } as Inputs.OCCT.PathQuadraticSegment;
                }
                return seg as Inputs.OCCT.PathSegment;
            }),
        };
    }

    private styleToMeta(el: SvgElement): Partial<Inputs.OCCT.SVGShape<TopoDS_Shape>> {
        const meta: Partial<Inputs.OCCT.SVGShape<TopoDS_Shape>> = { elementType: el.tag };
        if (el.style.fill !== undefined) { meta.fill = el.style.fill; }
        if (el.style.stroke !== undefined) { meta.stroke = el.style.stroke; }
        if (el.style.strokeWidth !== undefined) { meta.strokeWidth = el.style.strokeWidth; }
        if (el.style.opacity !== undefined) { meta.opacity = el.style.opacity; }
        if (el.id !== undefined) { meta.id = el.id; }
        if (el.className !== undefined) { meta.className = el.className; }
        return meta;
    }

    /**
     * Lay every shape flat on the ground plane and place the whole drawing as one unit. The SVG is
     * built in the XY plane, rotated onto the XZ ground plane (matching the other on-ground
     * primitives), then its combined bounding box is anchored according to `alignment` and finally
     * oriented to `direction` and moved to `center`.
     */
    private placeAll(shapes: TopoDS_Shape[], inputs: Inputs.OCCT.LoadSVGDto): TopoDS_Shape[] {
        if (shapes.length === 0) { return []; }
        const grounded = shapes.map((shape) => this.och.transformsService.rotate({ shape, angle: 90, axis: [1, 0, 0] }));

        const compound = this.och.converterService.makeCompound({ shapes: grounded });
        const bbox = this.och.operationsService.boundingBoxOfShape({ shape: compound });
        compound.delete();

        const alignment: string = inputs.alignment;
        const anchorX = alignment.endsWith("Left") ? bbox.min[0] : alignment.endsWith("Right") ? bbox.max[0] : bbox.center[0];
        const anchorZ = alignment.startsWith("top") ? bbox.max[2] : alignment.startsWith("bottom") ? bbox.min[2] : bbox.center[2];
        const shift: Inputs.Base.Vector3 = [-anchorX, -bbox.center[1], -anchorZ];

        return grounded.map((shape) => {
            const shifted = this.och.transformsService.translate({ shape, translation: shift });
            const placed = this.och.transformsService.alignAndTranslate({ shape: shifted, direction: inputs.direction, center: inputs.center });
            shifted.delete();
            shape.delete();
            return placed;
        });
    }

    /** Parse, build and place every drawable SVG element; shared by both public entry points. */
    private buildAndPlace(inputs: Inputs.OCCT.LoadSVGDto): BuiltScene {
        const scene = normalizeSvg(inputs.svg);
        const warnings = [...scene.warnings];

        if (inputs.makeRibbons) {
            warnings.push("makeRibbons is not supported yet; stroked paths are returned as wires.");
        }

        const drawn = scene.elements.filter((el) => !(el.style.hidden && !inputs.includeInvisible));
        // Always build outline wires natively; faces (with correct holes/winding) are assembled in TS
        // per element, governed by the face strategy and the element's own fill-rule.
        const groups = drawn.map((el) => ({
            subpaths: el.subpaths.map((sp) => this.toPathSubpath(sp)),
            makeFaces: false,
        }));
        const placement: Inputs.OCCT.PathPlacementDto = { scale: inputs.scale, flipY: inputs.flipY, origin: [0, 0, 0] };
        const built = this.builder.buildGroups(groups, placement, {
            joinSegments: inputs.joinSegments,
            tolerance: inputs.tolerance,
            warnings,
        });

        const items: { el: SvgElement; shape: TopoDS_Shape; isFace: boolean }[] = [];
        drawn.forEach((el, i) => {
            const b = built[i];
            if (!b) { return; }
            const allClosed = el.subpaths.length > 0 && el.subpaths.every((sp) => sp.closed);
            const rule = this.resolveRule(inputs.faceStrategy, el.style);
            if (rule === undefined || !allClosed) {
                items.push({ el, shape: b.shape, isFace: b.isFace });
                return;
            }
            const { wires, cleanup } = this.extractWires(b.shape);
            if (wires.length === 0) {
                items.push({ el, shape: b.shape, isFace: b.isFace });
                return;
            }
            const faced = this.faceBuilder.build(wires, rule, warnings);
            cleanup.forEach((s) => { try { s.delete(); } catch { /* noop */ } });
            items.push({ el, shape: faced.shape, isFace: faced.isFace });
        });

        const placedShapes = this.placeAll(items.map((it) => it.shape), inputs);
        items.forEach((it) => it.shape.delete());

        const placed: PlacedShape[] = items.map((it, i) => ({
            shape: placedShapes[i],
            isFace: it.isFace,
            closed: it.el.subpaths.length > 0 && it.el.subpaths.every((sp) => sp.closed),
            meta: this.styleToMeta(it.el),
        }));

        const result: BuiltScene = { placed, warnings };
        if (scene.viewBox) { result.viewBox = scene.viewBox; }
        return result;
    }

    /**
     * Parse an SVG document and build a single compound shape containing every drawable element,
     * laid on the ground and aligned according to the import options. Use this when you want the
     * drawing as one shape to draw, extrude or transform.
     */
    loadSVG(inputs: Inputs.OCCT.LoadSVGDto): TopoDS_Compound {
        const { placed } = this.buildAndPlace(inputs);
        const shapes = placed.map((p) => p.shape);
        const compound = this.och.converterService.makeCompound({ shapes });
        shapes.forEach((shape) => shape.delete());
        return compound;
    }

    /**
     * Parse an SVG document and build an OCCT shape per drawable element, each bundled with its
     * resolved metadata (fill/stroke/id/class), plus any warnings and the SVG view box. Use this
     * when you need per-element shapes and their colours/styles.
     */
    loadSVGStructured(inputs: Inputs.OCCT.LoadSVGDto): Inputs.OCCT.SVGResult<TopoDS_Shape> {
        const { placed, warnings, viewBox } = this.buildAndPlace(inputs);
        const shapes = placed.map((p) => ({
            ...p.meta,
            shape: p.shape,
            isFace: p.isFace,
            closed: p.closed,
        } as Inputs.OCCT.SVGShape<TopoDS_Shape>));
        const result: Inputs.OCCT.SVGResult<TopoDS_Shape> = { shapes, warnings };
        if (viewBox) { result.viewBox = viewBox; }
        return result;
    }
}
