import type { Base } from "@bitbybit-dev/base";
import { describe, expect, it } from "vitest";
import { signedVolumeOf } from "@bitbybit-dev/base/lib/api/services/helpers/mesh/mesh-measures";
import { modelOf } from "../api/services/service-support";
import { withContext } from "../__test__/geometry-fixtures";
import { ItemConverter } from "./items";
import { RecipeBuilder } from "./recipe-builder";

const REACH = 1000;
const PROJECT_ROWS = ["#90=IFCSIUNIT(*,.PLANEANGLEUNIT.,$,.RADIAN.);", "#91=IFCUNITASSIGNMENT((#90));", "#92=IFCPROJECT('0YvctVUKr0kugbFTf53O9L',$,'Project',$,$,$,$,(#3),#91);"];
const IDENTITY: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const RECTANGLE = ["#10=IFCRECTANGLEPROFILEDEF(.AREA.,$,$,40.,20.);"];
const AXIS_Y = ["#11=IFCCARTESIANPOINT((100.,0.,0.));", "#12=IFCDIRECTION((0.,1.,0.));", "#13=IFCAXIS1PLACEMENT(#11,#12);"];
const L_PATH = ["#20=IFCCARTESIANPOINT((0.,0.,0.));", "#21=IFCCARTESIANPOINT((500.,0.,0.));", "#22=IFCCARTESIANPOINT((500.,500.,0.));", "#23=IFCPOLYLINE((#20,#21,#22));"];
const ARC = [
    "#30=IFCCARTESIANPOINT((0.,0.,0.));",
    "#31=IFCAXIS2PLACEMENT3D(#30,$,$);",
    "#32=IFCCIRCLE(#31,300.);",
    "#33=IFCTRIMMEDCURVE(#32,(IFCPARAMETERVALUE(0.)),(IFCPARAMETERVALUE(1.5707963267948966)),.T.,.PARAMETER.);",
];

function converted(rows: readonly string[], item: number, schema?: string): Base.Recipe {
    const builder = new RecipeBuilder();
    const converter = new ItemConverter(modelOf(withContext([...PROJECT_ROWS, ...rows], schema)), builder, REACH);
    builder.root({ node: converter.item(item), matrix: IDENTITY, tag: {} });
    return builder.build(1, 0.001);
}

function attempt(rows: readonly string[], item: number, schema?: string): () => void {
    return () => {
        new ItemConverter(modelOf(withContext([...PROJECT_ROWS, ...rows], schema)), new RecipeBuilder(), REACH).item(item);
    };
}

function framesOf(recipe: Base.Recipe, node: Base.RecipeNode | undefined): number[][] {
    if (node?.op !== "loft") {
        throw new Error("not a loft");
    }
    const values = [...recipe.buffers.f64.slice(node.frames[0], node.frames[0] + node.frames[1])];
    return Array.from({ length: values.length / 16 }, (_, at) => values.slice(at * 16, at * 16 + 16));
}

function near(values: readonly number[]): unknown[] {
    return values.map((value) => expect.closeTo(value, 9));
}

describe("ItemConverter and revolved and tapered solids", () => {
    it("should turn a profile about its axis by the angle in radians, the other way round for a negative angle", () => {
        // Arrange
        const rows = [...RECTANGLE, ...AXIS_Y, "#14=IFCREVOLVEDAREASOLID(#10,$,#13,1.5);", "#15=IFCREVOLVEDAREASOLID(#10,$,#13,-1.5);"];

        // Act
        const [forward, backward] = [converted(rows, 14).nodes.at(-1), converted(rows, 15).nodes.at(-1)];

        // Assert
        expect(forward).toEqual({ op: "revolve", profile: 0, origin: [100, 0], direction: [0, 1], angle: 1.5 });
        expect(backward).toEqual({ op: "revolve", profile: 0, origin: [100, 0], direction: [-0, -1], angle: 1.5 });
    });

    it("should refuse a turn about an axis outside the profile's plane, and by more than a whole turn", () => {
        // Arrange
        const rows = [
            ...RECTANGLE,
            "#11=IFCCARTESIANPOINT((100.,0.,0.));",
            "#12=IFCDIRECTION((0.,0.,1.));",
            "#13=IFCAXIS1PLACEMENT(#11,#12);",
            "#14=IFCREVOLVEDAREASOLID(#10,$,#13,1.);",
            "#15=IFCDIRECTION((0.,1.,0.));",
            "#16=IFCAXIS1PLACEMENT(#11,#15);",
            "#17=IFCREVOLVEDAREASOLID(#10,$,#16,7.);",
        ];

        // Act & Assert
        expect(attempt(rows, 14)).toThrow("#14 turns about an axis outside its profile's plane");
        expect(attempt(rows, 17)).toThrow("#17 turns by an angle that is not above zero and at most a whole turn");
    });

    it("should taper a profile into its end profile by a loft of two frames along the extrusion, placed by its position", () => {
        // Arrange
        const rows = [
            ...RECTANGLE,
            "#11=IFCCARTESIANPOINT((0.,0.));",
            "#12=IFCCARTESIANTRANSFORMATIONOPERATOR2D($,$,#11,0.5);",
            "#13=IFCDERIVEDPROFILEDEF(.AREA.,$,#10,#12,$);",
            "#14=IFCDIRECTION((0.,0.,1.));",
            "#15=IFCCARTESIANPOINT((5.,0.,0.));",
            "#16=IFCAXIS2PLACEMENT3D(#15,$,$);",
            "#17=IFCEXTRUDEDAREASOLIDTAPERED(#10,#16,#14,-300.,#13);",
        ];

        // Act
        const recipe = converted(rows, 17);
        const loft = recipe.nodes.find((node) => node.op === "loft");

        // Assert
        expect(loft?.op === "loft" && loft.profiles).toEqual([0, 1]);
        expect(framesOf(recipe, loft)).toEqual([IDENTITY, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -0, -0, -300, 1]]);
        expect(recipe.nodes.at(-1)).toMatchObject({ op: "transform", matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 5, 0, 0, 1] });
    });

    it("should taper hollow circles as their outer loft less their inner one, and refuse a taper between other kinds", () => {
        // Arrange
        const rows = [
            "#10=IFCCIRCLEHOLLOWPROFILEDEF(.AREA.,$,$,50.,5.);",
            "#11=IFCCARTESIANPOINT((0.,0.));",
            "#12=IFCCARTESIANTRANSFORMATIONOPERATOR2D($,$,#11,0.5);",
            "#13=IFCDERIVEDPROFILEDEF(.AREA.,$,#10,#12,$);",
            "#14=IFCDIRECTION((0.,0.,1.));",
            "#15=IFCEXTRUDEDAREASOLIDTAPERED(#10,$,#14,300.,#13);",
            ...RECTANGLE.map((row) => row.replace("#10=", "#16=")),
            "#17=IFCEXTRUDEDAREASOLIDTAPERED(#10,$,#14,300.,#16);",
            "#18=IFCCIRCLEPROFILEDEF(.AREA.,$,$,20.);",
            "#19=IFCEXTRUDEDAREASOLIDTAPERED(#10,$,#14,300.,#18);",
        ];

        // Act
        const recipe = converted(rows, 15);

        // Assert
        expect(recipe.nodes.map((node) => node.op)).toEqual(["circle", "circle", "loft", "circle", "circle", "loft", "difference"]);
        expect(recipe.nodes.slice(0, 2)).toEqual([{ op: "circle", center: [0, 0], radius: 50 }, { op: "circle", center: [0, 0], radius: 25 }]);
        expect(attempt(rows, 17)).toThrow("#17 tapers between profiles of different kinds, which is not supported yet");
        expect(attempt(rows, 19)).toThrow("#19 tapers between a hollow and a solid circle");
    });
});

describe("ItemConverter and swept disks", () => {
    it("should sweep a disk along its directrix through a frame at each point, stretched across a corner", () => {
        // Arrange
        const rows = [...L_PATH, "#24=IFCSWEPTDISKSOLID(#23,20.,$,$,$);"];

        // Act
        const recipe = converted(rows, 24);
        const frames = framesOf(recipe, recipe.nodes.at(-1));

        // Assert
        expect(recipe.nodes[0]).toEqual({ op: "circle", center: [0, 0], radius: 20 });
        expect(frames).toHaveLength(3);
        expect(frames.map((frame) => frame.slice(12, 15))).toEqual([[0, 0, 0], [500, 0, 0], [500, 500, 0]]);
        expect(frames[1]!.slice(8, 11)).toEqual(near([Math.SQRT1_2, Math.SQRT1_2, 0]));
        expect(Math.max(Math.hypot(...frames[1]!.slice(0, 3)), Math.hypot(...frames[1]!.slice(4, 7)))).toBeCloseTo(Math.SQRT2, 9);
    });

    it("should hollow a disk by its inner radius and round a polygonal directrix's corners by its fillet", () => {
        // Arrange
        const rows = [...L_PATH, "#24=IFCSWEPTDISKSOLID(#23,20.,15.,$,$);", "#25=IFCSWEPTDISKSOLIDPOLYGONAL(#23,20.,$,$,$,100.);"];

        // Act
        const [hollow, rounded] = [converted(rows, 24), converted(rows, 25)];

        // Assert
        expect(hollow.nodes.map((node) => node.op)).toEqual(["circle", "loft", "circle", "loft", "difference"]);
        expect(framesOf(rounded, rounded.nodes.at(-1)).length).toBeGreaterThan(3);
    });

    it("should sweep along a whole directrix its parameters span, and refuse a part of it or a radius that holds nothing", () => {
        // Arrange
        const rows = [
            ...ARC,
            "#34=IFCSWEPTDISKSOLID(#33,20.,$,0.,1.5707963267948966);",
            "#35=IFCSWEPTDISKSOLID(#33,20.,$,0.,0.5);",
            "#36=IFCSWEPTDISKSOLID(#33,20.,20.,$,$);",
            "#37=IFCSWEPTDISKSOLID(#33,20.,$,0.5,$);",
            "#38=IFCSWEPTDISKSOLID(#33,20.,$,$,1.);",
        ];

        // Act
        const recipe = converted(rows, 34);

        // Assert
        expect(framesOf(recipe, recipe.nodes.at(-1)).length).toBeGreaterThan(2);
        expect(attempt(rows, 35)).toThrow("#35 sweeps along part of its directrix, which is not supported yet");
        expect(attempt(rows, 37)).toThrow("#37 sweeps along part of its directrix, which is not supported yet");
        expect(attempt(rows, 38)).toThrow("#38 sweeps along part of its directrix, which is not supported yet");
        expect(attempt(rows, 36)).toThrow("#36 has a radius that is not above zero or an inner radius not inside it");
    });
});

describe("ItemConverter and swept areas", () => {
    it("should turn a fixed-reference sweep's profile so its x axis follows the reference across the directrix", () => {
        // Arrange
        const rows = [...RECTANGLE, ...ARC, "#34=IFCDIRECTION((0.,0.,1.));", "#35=IFCFIXEDREFERENCESWEPTAREASOLID(#10,$,#33,$,$,#34);"];

        // Act
        const recipe = converted(rows, 35);
        const frames = framesOf(recipe, recipe.nodes.at(-1));

        // Assert
        expect(frames.every((frame) => Math.abs(frame[2]! - 1) < 1e-9)).toBe(true);
        expect(frames[0]!.slice(8, 11)).toEqual(near([0, 1, 0]));
    });

    it("should read an IFC4X3 sweep's ends as parameters or as lengths along its directrix, and refuse a part of it or ends measured both ways", () => {
        // Arrange
        const rows = [
            ...RECTANGLE,
            ...L_PATH,
            ...ARC,
            "#34=IFCDIRECTION((0.,0.,1.));",
            "#40=IFCFIXEDREFERENCESWEPTAREASOLID(#10,$,#23,$,$,#34);",
            "#41=IFCFIXEDREFERENCESWEPTAREASOLID(#10,$,#23,IFCPARAMETERVALUE(0.),IFCPARAMETERVALUE(2.),#34);",
            "#42=IFCFIXEDREFERENCESWEPTAREASOLID(#10,$,#23,IFCLENGTHMEASURE(0.),IFCLENGTHMEASURE(1000.),#34);",
            "#43=IFCFIXEDREFERENCESWEPTAREASOLID(#10,$,#33,$,$,#34);",
            "#44=IFCFIXEDREFERENCESWEPTAREASOLID(#10,$,#33,$,IFCLENGTHMEASURE(471.23889803846896),#34);",
            "#45=IFCFIXEDREFERENCESWEPTAREASOLID(#10,$,#23,IFCLENGTHMEASURE(0.),IFCLENGTHMEASURE(500.),#34);",
            "#46=IFCFIXEDREFERENCESWEPTAREASOLID(#10,$,#23,IFCPARAMETERVALUE(1.),$,#34);",
            "#47=IFCFIXEDREFERENCESWEPTAREASOLID(#10,$,#23,IFCPARAMETERVALUE(0.),IFCLENGTHMEASURE(2.),#34);",
            "#48=IFCFIXEDREFERENCESWEPTAREASOLID(#10,$,#33,$,IFCLENGTHMEASURE(300.),#34);",
        ];
        const framesFor = (item: number): number[][] => {
            const recipe = converted(rows, item, "IFC4X3_ADD2");
            return framesOf(recipe, recipe.nodes.at(-1));
        };

        // Act
        const [path, byParameter, byLength, arc, arcByLength] = [40, 41, 42, 43, 44].map(framesFor);

        // Assert
        expect([byParameter, byLength]).toEqual([path, path]);
        expect(arcByLength).toEqual(arc);
        expect(attempt(rows, 45, "IFC4X3_ADD2")).toThrow("#45 sweeps along part of its directrix, which is not supported yet");
        expect(attempt(rows, 46, "IFC4X3_ADD2")).toThrow("#46 sweeps along part of its directrix, which is not supported yet");
        expect(attempt(rows, 47, "IFC4X3_ADD2")).toThrow("#47 sweeps along part of its directrix, which is not supported yet");
        expect(attempt(rows, 48, "IFC4X3_ADD2")).toThrow("#48 sweeps along part of its directrix, which is not supported yet");
    });

    it("should take a surface sweep's x axis from its plane's normal, or across a surface of linear extrusion", () => {
        // Arrange
        const rows = [
            ...RECTANGLE,
            ...ARC,
            "#34=IFCPLANE(#31);",
            "#35=IFCSURFACECURVESWEPTAREASOLID(#10,$,#33,$,$,#34);",
            "#36=IFCARBITRARYOPENPROFILEDEF(.CURVE.,$,#33);",
            "#37=IFCDIRECTION((0.,0.,1.));",
            "#38=IFCSURFACEOFLINEAREXTRUSION(#36,$,#37,100.);",
            "#39=IFCSURFACECURVESWEPTAREASOLID(#10,$,#33,$,$,#38);",
        ];

        // Act
        const [onPlane, onExtrusion] = [converted(rows, 35), converted(rows, 39)];
        const [first] = framesOf(onExtrusion, onExtrusion.nodes.at(-1));

        // Assert
        expect(framesOf(onPlane, onPlane.nodes.at(-1)).every((frame) => Math.abs(frame[2]! - 1) < 1e-9)).toBe(true);
        expect(first!.slice(0, 3)).toEqual(near([1, 0, 0]));
    });

    it("should sweep a centred circle on a surface it cannot read, and refuse any other profile there", () => {
        // Arrange
        const rows = [
            ...ARC,
            "#34=IFCCIRCLEPROFILEDEF(.AREA.,$,$,10.);",
            "#35=IFCCYLINDRICALSURFACE(#31,300.);",
            "#36=IFCSURFACECURVESWEPTAREASOLID(#34,$,#33,$,$,#35);",
            ...RECTANGLE,
            "#37=IFCSURFACECURVESWEPTAREASOLID(#10,$,#33,$,$,#35);",
        ];

        // Act
        const recipe = converted(rows, 36);

        // Assert
        expect(recipe.nodes.at(-1)?.op).toBe("loft");
        expect(attempt(rows, 37)).toThrow("A sweep on an IfcCylindricalSurface reference surface is not supported yet");
    });
});

describe("ItemConverter and CSG primitives", () => {
    const ORIGIN = ["#40=IFCCARTESIANPOINT((0.,0.,0.));", "#41=IFCAXIS2PLACEMENT3D(#40,$,$);"];

    it("should build a block from its corner, a cylinder from its base and a cone and a sphere by turning their half sections", () => {
        // Arrange
        const rows = [...ORIGIN, "#42=IFCBLOCK(#41,1.,2.,3.);", "#43=IFCRIGHTCIRCULARCYLINDER(#41,2.,1.);", "#44=IFCRIGHTCIRCULARCONE(#41,2.,1.);", "#45=IFCSPHERE(#41,1.);"];

        // Act
        const block = converted(rows, 42);
        const cylinder = converted(rows, 43);
        const cone = converted(rows, 44);
        const sphere = converted(rows, 45);

        // Assert
        expect(block.nodes.map((node) => node.op)).toEqual(["polygon", "extrude", "transform"]);
        expect(block.nodes[1]).toEqual({ op: "extrude", profile: 0, direction: [0, 0, 1], depth: 3 });
        expect(cylinder.nodes[0]).toEqual({ op: "circle", center: [0, 0], radius: 1 });
        expect(cone.nodes.map((node) => node.op)).toEqual(["polygon", "revolve", "transform", "transform"]);
        expect(cone.nodes[2]).toEqual({ op: "transform", of: 1, matrix: [1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1] });
        expect(sphere.nodes[1]).toMatchObject({ op: "revolve", origin: [0, 0], direction: [0, 1], angle: 2 * Math.PI });
        const sectionNode = sphere.nodes[0];
        const section = sectionNode?.op === "polygon" ? [...sphere.buffers.f64.slice(sectionNode.points[0], sectionNode.points[0] + sectionNode.points[1])] : [];
        expect(section.slice(0, 2).map((value) => Math.round(value * 1e9) / 1e9 + 0)).toEqual([0, -1]);
        expect(section.slice(-2).map((value) => Math.round(value * 1e9) / 1e9 + 0)).toEqual([0, 1]);
    });

    it("should build a pyramid as a closed mesh and a CSG solid from its tree", () => {
        // Arrange
        const rows = [...ORIGIN, "#42=IFCRECTANGULARPYRAMID(#41,1.,2.,3.);", "#43=IFCBLOCK(#41,1.,1.,1.);", "#44=IFCBOOLEANRESULT(.UNION.,#43,#42);", "#45=IFCCSGSOLID(#44);", "#46=IFCCSGSOLID($);"];

        // Act
        const pyramid = converted(rows, 42);
        const csg = converted(rows, 45);
        const mesh = pyramid.nodes[0];

        // Assert
        expect(mesh?.op === "triangles" && signedVolumeOf(pyramid.buffers.f64.slice(mesh.positions[0], mesh.positions[0] + mesh.positions[1]), pyramid.buffers.i32.slice(mesh.indices[0], mesh.indices[0] + mesh.indices[1]))).toBeCloseTo(2, 12);
        expect(csg.nodes.at(-1)?.op).toBe("union");
        expect(attempt(rows, 46)).toThrow("#46 has no tree root expression");
    });
});

describe("ItemConverter and swept solids it refuses", () => {
    it("should refuse a turn without an axis, a taper of no depth or along its plane, a plain circle taper as one loft, and sweeps it cannot frame", () => {
        // Arrange
        const rows = [
            ...RECTANGLE,
            "#11=IFCREVOLVEDAREASOLID(#10,$,$,1.);",
            "#12=IFCDIRECTION((1.,0.,0.));",
            "#13=IFCEXTRUDEDAREASOLIDTAPERED(#10,$,#12,1.,#10);",
            "#14=IFCDIRECTION((0.,0.,1.));",
            "#15=IFCEXTRUDEDAREASOLIDTAPERED(#10,$,#14,0.,#10);",
            "#16=IFCCIRCLEPROFILEDEF(.AREA.,$,$,5.);",
            "#17=IFCEXTRUDEDAREASOLIDTAPERED(#16,$,#14,3.,#16);",
            ...ARC,
            "#34=IFCDIRECTION((0.,1.,0.));",
            "#35=IFCFIXEDREFERENCESWEPTAREASOLID(#10,$,#33,$,$,#34);",
            "#36=IFCPLANE(#31);",
            "#37=IFCAXIS2PLACEMENT3D(#30,#34,$);",
            "#38=IFCPLANE(#37);",
            "#39=IFCSURFACECURVESWEPTAREASOLID(#10,$,#33,$,$,#38);",
            "#40=IFCSWEPTDISKSOLID($,1.,$,$,$);",
            "#41=IFCPOLYLINE((#30,#30));",
            "#42=IFCSWEPTDISKSOLID(#41,1.,$,$,$);",
            "#43=IFCSWEPTDISKSOLID(#33,$,$,$,$);",
            "#44=IFCCARTESIANPOINT((0.,0.,5.));",
            "#45=IFCCARTESIANPOINT((4.,0.,5.));",
            "#46=IFCCARTESIANPOINT((4.,3.,8.));",
            "#47=IFCPOLYLINE((#44,#45,#46,#44));",
            "#48=IFCARBITRARYCLOSEDPROFILEDEF(.AREA.,$,#47);",
            "#49=IFCFIXEDREFERENCESWEPTAREASOLID(#48,$,#33,$,$,#14);",
            "#50=IFCREVOLVEDAREASOLID($,$,$,1.);",
        ];

        // Act
        const circles = converted(rows, 17).nodes.map((node) => node.op);

        // Assert
        expect(attempt(rows, 11)).toThrow("#11 has no axis");
        expect(attempt(rows, 13)).toThrow("#13 tapers along its profile's plane");
        expect(attempt(rows, 15)).toThrow("#15 has no depth");
        expect(circles).toEqual(["circle", "circle", "loft"]);
        expect(attempt(rows, 35)).toThrow("#35 has a fixed reference along its directrix");
        expect(attempt(rows, 39)).toThrow("#39's directrix runs along the normal of its reference surface");
        expect(attempt(rows, 40)).toThrow("#40 has no directrix");
        expect(attempt(rows, 42)).toThrow("#42 sweeps along a directrix of no length");
        expect(attempt(rows, 43)).toThrow("#43 has no finite Radius");
        expect(attempt(rows, 49)).toThrow("#49 sweeps a profile written off its own plane");
        expect(attempt(rows, 50)).toThrow("#50 has no SweptArea");
    });
});
