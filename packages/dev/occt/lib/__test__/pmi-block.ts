import type { BitbybitOcctModule, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../api/inputs";
import type { OccHelper } from "../occ-helper";
import { OCCTAssemblyManager } from "../services/assembly/manager";
import { OCCTAssemblyQuery } from "../services/assembly/query";
import type { PmiBlock, PmiBlockFace, PmiBlockPmi } from "./pmi-block-types";

type Point3 = Inputs.Base.Point3;

const DIMENSION = Inputs.OCCT.pmiDimensionTypeEnum;
const TOLERANCE = Inputs.OCCT.pmiToleranceTypeEnum;
const SAME = 1e-6;

export const PMI_BLOCK_FACE_CENTRES: Readonly<Record<PmiBlockFace, Point3>> = {
    bottom: [30, 20, 0],
    top: [30, 20, 15],
    left: [0, 20, 7.5],
    right: [60, 20, 7.5],
    front: [30, 0, 7.5],
    back: [30, 40, 7.5],
    bore: [30, 20, 4.5],
    counterbore: [30, 20, 12],
    floor: [30, 20, 9],
};

export const PMI_BLOCK_TOP_FRONT_EDGE_MIDDLE: Point3 = [30, 0, 15];

const near = (a: Point3, b: Point3): boolean => Math.abs(a[0] - b[0]) < SAME && Math.abs(a[1] - b[1]) < SAME && Math.abs(a[2] - b[2]) < SAME;

const blockShape = (och: OccHelper): TopoDS_Shape => {
    const box = och.solidsService.createBox({ width: 60, height: 40, length: 15, center: [30, 20, 7.5], originOnCenter: true });
    const bore = och.solidsService.createCylinder({ radius: 5, height: 20, center: [30, 20, -2], direction: [0, 0, 1], angle: 360, originOnCenter: false });
    const counterbore = och.solidsService.createCylinder({ radius: 9, height: 7, center: [30, 20, 9], direction: [0, 0, 1], angle: 360, originOnCenter: false });
    try {
        return och.booleansService.difference({ shape: box, shapes: [bore, counterbore], keepEdges: false, strategy: Inputs.OCCT.booleanStrategyEnum.oneAfterAnother });
    } finally {
        [box, bore, counterbore].forEach(shape => shape.delete());
    }
};

export const facesOfBlock = (och: OccHelper, shape: TopoDS_Shape): Record<PmiBlockFace, number> => {
    const faces = och.shapeGettersService.getFaces({ shape });
    try {
        const centres = faces.map(face => och.facesService.getFaceCenterOfMass({ shape: face }));
        const indexOf = (name: PmiBlockFace): number => {
            const found = centres.findIndex(centre => near(centre, PMI_BLOCK_FACE_CENTRES[name]));
            if (found < 0) {
                throw new Error(`the block has no ${name} face`);
            }
            return found;
        };
        return {
            bottom: indexOf("bottom"), top: indexOf("top"), left: indexOf("left"), right: indexOf("right"), front: indexOf("front"),
            back: indexOf("back"), bore: indexOf("bore"), counterbore: indexOf("counterbore"), floor: indexOf("floor"),
        };
    } finally {
        faces.forEach(face => face.delete());
    }
};

const topFrontEdgeOf = (och: OccHelper, shape: TopoDS_Shape): number => {
    const edges = och.shapeGettersService.getEdges({ shape });
    try {
        return edges.findIndex(edge => near(och.edgesService.pointOnEdgeAtParam({ shape: edge, param: 0.5 }), PMI_BLOCK_TOP_FRONT_EDGE_MIDDLE));
    } finally {
        edges.forEach(edge => edge.delete());
    }
};

const cornerVerticesOf = (och: OccHelper, shape: TopoDS_Shape): number[] => {
    const vertices = och.shapeGettersService.getVertices({ shape });
    try {
        return och.verticesService.verticesToPoints({ shapes: vertices })
            .flatMap((point, index) => near(point, [0, 0, 0]) ? [index] : []);
    } finally {
        vertices.forEach(vertex => vertex.delete());
    }
};

export const pmiBlock = (occt: BitbybitOcctModule, och: OccHelper): PmiBlock => {
    const manager = new OCCTAssemblyManager(occt, och);
    const query = new OCCTAssemblyQuery(occt, och);
    const made = blockShape(och);
    const part = manager.createPart({ id: "block", shape: made, name: "Block" });
    const structure = manager.combineStructure({ parts: [part], nodes: [], clearDocument: false });
    const document = manager.buildAssemblyDocument({ structure });
    made.delete();
    const label = query.getDocumentParts({ document }).find(entry => entry.type === "part")!.label;
    const shape = query.getShapeFromLabel({ document, label });
    return { document, part: label, shape, faces: facesOfBlock(och, shape), topFrontEdge: topFrontEdgeOf(och, shape), cornerVertices: cornerVerticesOf(och, shape) };
};

export const pmiOfBlock = (block: PmiBlock): PmiBlockPmi => {
    const face = (name: PmiBlockFace): Inputs.OCCT.PmiShapeDto => ({ part: block.part, kind: Inputs.OCCT.pmiShapeKindEnum.face, index: block.faces[name] });
    return {
        dimensions: [
            { type: DIMENSION.linearDistance, value: 15, upperTolerance: 0.1, lowerTolerance: 0.1, shapeRefs: [face("top")], otherShapeRefs: [face("bottom")], name: "thickness", start: [0, 0, 15], end: [0, 0, 0], normal: [0, -1, 0], offset: -8 },
            { type: DIMENSION.diameter, value: 10, upperTolerance: 0.05, shapeRefs: [face("bore")], name: "bore", start: [30, 20, 0], end: [35, 20, 0], normal: [0, 0, -1] },
            { type: DIMENSION.diameter, value: 18, shapeRefs: [face("counterbore")], name: "counterbore", start: [30, 20, 15], end: [30, 29, 15] },
            { type: DIMENSION.linearDistance, value: 6, shapeRefs: [face("top")], otherShapeRefs: [face("floor")], name: "depth", start: [40, 20, 15], end: [37, 20, 9], direction: [0, 0, -1], normal: [0, -1, 0], offset: 10 },
            { type: DIMENSION.angle, value: 90, shapeRefs: [face("front")], otherShapeRefs: [face("left")], name: "corner", start: [0, 0, 15], end: [12, 0, 15] },
            { type: DIMENSION.curveLength, value: 60, shapeRefs: [{ part: block.part, kind: Inputs.OCCT.pmiShapeKindEnum.edge, index: block.topFrontEdge }], name: "edge length", start: [0, 0, 15], end: [60, 0, 15], normal: [0, -1, 0], offset: 6 },
            { type: DIMENSION.radius, value: 5, shapeRefs: [face("bore")], name: "bore radius", start: [30, 20, 0], end: [30, 15, 0], normal: [0, 0, -1] },
        ],
        datums: [
            { letter: "A", shapeRefs: [face("bottom")] },
            { letter: "B", shapeRefs: [face("left")] },
            { letter: "C", shapeRefs: [face("front")] },
        ],
        tolerances: [
            {
                type: TOLERANCE.flatness, value: 0.05, shapeRefs: [face("top")], name: "flatness frame",
                presentation: { plane: { origin: [65, 5, 15], normal: [0, 0, 1], direction: [1, 0, 0] }, textPoint: [70, 7, 15], lines: [[[65, 5, 15], [85, 5, 15], [85, 9, 15], [65, 9, 15], [65, 5, 15]], [[64, 7, 15], [58, 10, 15]]], fills: [[[66, 6, 15], [68, 6, 15], [68, 8, 15]]] },
            },
            { type: TOLERANCE.perpendicularity, value: 0.02, shapeRefs: [face("bore")], datumLetters: ["A"], diameterZone: true },
            { type: TOLERANCE.position, value: 0.1, shapeRefs: [face("bore")], datumLetters: ["A", "B", "C"], diameterZone: true, material: Inputs.OCCT.pmiMaterialConditionEnum.maximum },
            { type: TOLERANCE.parallelism, value: 0.03, shapeRefs: [face("top")], datumLetters: ["A"] },
            { type: TOLERANCE.profileOfSurface, value: 0.2, shapeRefs: [face("right")], datumLetters: ["B"] },
            { type: TOLERANCE.circularity, value: 0.01, shapeRefs: [face("counterbore")] },
            { type: TOLERANCE.cylindricity, value: 0.01, shapeRefs: [face("bore")] },
        ],
    };
};
