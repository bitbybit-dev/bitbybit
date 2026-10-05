import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import * as Inputs from "../../api/inputs";
import { InputError } from "@bitbybit-dev/base";

describe("OCCT shape signatures and binary BREP", () => {
    let kernel: BitbybitOcctModule;
    let occt: OCCTService;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        const helper = new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel);
        occt = new OCCTService(kernel, helper);
    }, 120_000);

    const faceTypesOf = (shape: TopoDS_Shape): Inputs.OCCT.surfaceTypeEnum[] => occt.analysis.signatures({ shape }).faces.map(face => face.type);
    const edgeTypesOf = (shape: TopoDS_Shape): Inputs.OCCT.curveTypeEnum[] => occt.analysis.signatures({ shape }).edges.map(edge => edge.type);
    const meshed = (shape: TopoDS_Shape): TopoDS_Shape => {
        new kernel.BRepMesh_IncrementalMesh(shape, 0.1, false, 0.5, false).delete();
        return shape;
    };

    it("should read each kind of surface as the type the selectors choose it by", () => {
        // Arrange
        const cone = occt.shapes.solid.createCone({ radius1: 3, radius2: 1, height: 4, angle: 360, center: [0, 0, 0], direction: [0, 1, 0] });
        const torus = occt.shapes.solid.createTorus({ majorRadius: 5, minorRadius: 1, center: [0, 0, 0], direction: [0, 1, 0], angle: 360 });
        const sections = [
            occt.shapes.wire.createCircleWire({ radius: 3, center: [0, 0, 0], direction: [0, 1, 0] }),
            occt.shapes.wire.createCircleWire({ radius: 2, center: [0, 3, 0], direction: [0, 1, 0] }),
            occt.shapes.wire.createCircleWire({ radius: 4, center: [0, 6, 0], direction: [0, 1, 0] }),
        ];
        const vase = occt.operations.loft({ shapes: sections, makeSolid: false });

        // Act
        const coneTypes = faceTypesOf(cone);
        const torusTypes = faceTypesOf(torus);
        const vaseTypes = faceTypesOf(vase);

        // Assert
        expect(coneTypes.filter(type => type === Inputs.OCCT.surfaceTypeEnum.cone)).toHaveLength(1);
        expect(coneTypes.filter(type => type === Inputs.OCCT.surfaceTypeEnum.plane)).toHaveLength(2);
        expect(torusTypes).toEqual([Inputs.OCCT.surfaceTypeEnum.torus]);
        expect(vaseTypes).toEqual([Inputs.OCCT.surfaceTypeEnum.bspline]);
        [cone, torus, vase].forEach(shape => {
            const signatures = occt.analysis.signatures({ shape });
            signatures.faces.forEach(face => expect(occt.select.faces.ofType({ shape, type: face.type, indexes: [face.index] })).toEqual([face.index]));
        });
    });

    it("should read each kind of curve as the type the selectors choose it by", () => {
        // Arrange
        const cylinder = occt.shapes.solid.createCylinder({ radius: 2, height: 5, center: [0, 0, 0], direction: [0, 1, 0] });
        const ellipse = occt.shapes.edge.createEllipseEdge({ radiusMajor: 4, radiusMinor: 2, center: [0, 0, 0], direction: [0, 1, 0] });
        const spline = occt.shapes.wire.interpolatePoints({ points: [[0, 0, 0], [1, 2, 0], [3, 1, 0], [5, 3, 0]], periodic: false, tolerance: 1e-7 });

        // Act
        const cylinderTypes = edgeTypesOf(cylinder);
        const ellipseTypes = edgeTypesOf(ellipse);
        const splineTypes = edgeTypesOf(spline);

        // Assert
        expect(cylinderTypes.filter(type => type === Inputs.OCCT.curveTypeEnum.circle)).toHaveLength(2);
        expect(cylinderTypes.filter(type => type === Inputs.OCCT.curveTypeEnum.line)).toHaveLength(1);
        expect(ellipseTypes).toEqual([Inputs.OCCT.curveTypeEnum.ellipse]);
        expect(splineTypes).toEqual([Inputs.OCCT.curveTypeEnum.bspline]);
        const signatures = occt.analysis.signatures({ shape: cylinder });
        signatures.edges.filter(edge => !edge.isDegenerate)
            .forEach(edge => expect(occt.select.edges.ofType({ shape: cylinder, type: edge.type, indexes: [edge.index] })).toEqual([edge.index]));
    });

    it("should give each face of a box the box that holds exactly that face", () => {
        // Arrange
        const box = occt.shapes.solid.createBoxFromCorner({ corner: [1, 2, 3], width: 10, height: 20, length: 30 });

        // Act
        const { faces } = occt.analysis.signatures({ shape: box });

        // Assert
        faces.forEach(face => {
            const flat = face.normal.findIndex(value => Math.abs(value) > 0.5);
            [0, 1, 2].forEach(axis => {
                expect((face.box.min[axis]! + face.box.max[axis]!) / 2).toBeCloseTo(face.centre[axis]!, 6);
                expect(face.box.max[axis]! - face.box.min[axis]!).toBeCloseTo(axis === flat ? 0 : [10, 20, 30][axis]!, 6);
            });
        });
        expect(faces.map(face => face.index)).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it("should measure each edge, its midpoint and the direction it runs there", () => {
        // Arrange
        const edge = occt.shapes.edge.line({ start: [1, 0, 0], end: [1, 0, 8] });

        // Act
        const [signature] = occt.analysis.signatures({ shape: edge }).edges;

        // Assert
        expect(signature).toEqual({
            index: 0,
            type: Inputs.OCCT.curveTypeEnum.line,
            isDegenerate: false,
            length: expect.closeTo(8, 9),
            midpoint: [expect.closeTo(1, 9), expect.closeTo(0, 9), expect.closeTo(4, 9)],
            tangent: [expect.closeTo(0, 9), expect.closeTo(0, 9), expect.closeTo(1, 9)],
        });
    });

    it("should refuse an empty shape before asking the kernel", () => {
        // Act
        const act = (): unknown => occt.analysis.signatures({ shape: new kernel.TopoDS_Shape() });

        // Assert
        expect(act).toThrow(InputError);
    });

    it("should write the mesh a shape carries only when asked, in text and in bytes", () => {
        // Arrange
        const sphere = meshed(occt.shapes.solid.createSphere({ radius: 3, center: [0, 0, 0] }));

        // Act
        const text = occt.io.saveShapeBrep({ shape: sphere, withTriangulation: true });
        const bareText = occt.io.saveShapeBrep({ shape: sphere, withTriangulation: false });
        const bytes = occt.io.saveShapeBrepBinary({ shape: sphere, withTriangulation: true });
        const bareBytes = occt.io.saveShapeBrepBinary({ shape: sphere, withTriangulation: false });

        // Assert
        expect(text).toContain("Triangulations 1");
        expect(bareText).toContain("Triangulations 0");
        expect(occt.io.saveShapeBrep({ shape: sphere })).toBe(text);
        expect(bareBytes.length).toBeLessThan(bytes.length);
        expect(occt.io.saveShapeBrepBinary({ shape: sphere })).toEqual(bytes);
    });

    it("should read binary BREP back to the same faces, edges and placement", () => {
        // Arrange
        const moved = occt.transforms.translate({ shape: occt.shapes.solid.createCylinder({ radius: 2, height: 5, center: [0, 0, 0], direction: [0, 1, 0] }), translation: [3, 4, 5] });

        // Act
        const read = occt.io.loadBrepBinary({ brepData: occt.io.saveShapeBrepBinary({ shape: moved, withTriangulation: false }) });

        // Assert
        expect(occt.analysis.signatures({ shape: read })).toEqual(occt.analysis.signatures({ shape: moved }));
    });

    it("should refuse to write an empty shape", () => {
        // Act
        const act = (): unknown => occt.io.saveShapeBrepBinary({ shape: new kernel.TopoDS_Shape() });

        // Assert
        expect(act).toThrow(InputError);
    });
});
