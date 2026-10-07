import type { Base } from "@bitbybit-dev/base";
import { signedVolumeOf } from "@bitbybit-dev/base/lib/api/services/helpers/mesh-measures";
import { modelOf } from "../api/services/service-support";
import { describe, expect, it } from "vitest";
import { withContext } from "../__test__/geometry-fixtures";
import { ItemConverter } from "./items";
import { RecipeBuilder } from "./recipe-builder";

const BOX_ROWS = [
    "#10=IFCRECTANGLEPROFILEDEF(.AREA.,$,$,2.,2.);",
    "#11=IFCDIRECTION((0.,0.,1.));",
    "#12=IFCEXTRUDEDAREASOLID(#10,$,#11,3.);",
];

function converted(rows: readonly string[], item: number): Base.Recipe {
    const builder = new RecipeBuilder();
    const converter = new ItemConverter(modelOf(withContext(rows)), builder, REACH);
    builder.root({ node: converter.item(item), matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], tag: {} });
    return builder.build(1, 0.001);
}

function attempt(rows: readonly string[], item: number): () => void {
    return () => {
        new ItemConverter(modelOf(withContext(rows)), new RecipeBuilder(), REACH).item(item);
    };
}

const MAP_ROWS = [
    ...BOX_ROWS,
    "#13=IFCSHAPEREPRESENTATION(#4,'Body','SweptSolid',(#12));",
    "#14=IFCREPRESENTATIONMAP(#2,#13);",
];

const REACH = 1000;
const MAPPED_ITEM = 30;
const MAPPED_ITEM_ROW = `#${MAPPED_ITEM}=IFCMAPPEDITEM(#14,#20);`;

const TETRAHEDRON_ROWS = [
    "#20=IFCCARTESIANPOINT((0.,0.,0.));",
    "#21=IFCCARTESIANPOINT((1.,0.,0.));",
    "#22=IFCCARTESIANPOINT((0.,1.,0.));",
    "#23=IFCCARTESIANPOINT((0.,0.,1.));",
    "#30=IFCPOLYLOOP((#20,#22,#21));",
    "#31=IFCPOLYLOOP((#20,#21,#23));",
    "#32=IFCPOLYLOOP((#20,#23,#22));",
    "#33=IFCPOLYLOOP((#21,#22,#23));",
    "#34=IFCFACEOUTERBOUND(#30,.T.);",
    "#35=IFCFACEOUTERBOUND(#31,.T.);",
    "#36=IFCFACEOUTERBOUND(#32,.T.);",
    "#37=IFCFACEOUTERBOUND(#33,.T.);",
    "#38=IFCFACE((#34));",
    "#39=IFCFACE((#35));",
    "#40=IFCFACE((#36));",
    "#41=IFCFACE((#37));",
    "#42=IFCCLOSEDSHELL((#38,#39,#40,#41));",
];

const BOUNDED_HALF_SPACE_ROWS = [
    ...BOX_ROWS,
    "#13=IFCDIRECTION((0.,0.,1.));",
    "#14=IFCCARTESIANPOINT((0.,0.,2.));",
    "#15=IFCAXIS2PLACEMENT3D(#14,#13,$);",
    "#16=IFCPLANE(#15);",
    "#17=IFCAXIS2PLACEMENT3D(#1,$,$);",
    "#18=IFCCARTESIANPOINT((-1.,-1.));",
    "#19=IFCCARTESIANPOINT((1.,-1.));",
    "#20=IFCCARTESIANPOINT((1.,1.));",
    "#21=IFCCARTESIANPOINT((-1.,1.));",
    "#22=IFCPOLYLINE((#18,#21,#20,#19,#18));",
    "#23=IFCPOLYGONALBOUNDEDHALFSPACE(#16,.F.,#17,#22);",
    "#24=IFCBOOLEANCLIPPINGRESULT(.DIFFERENCE.,#12,#23);",
];

function meshOf(recipe: Base.Recipe, node: Base.RecipeNode | undefined): { positions: number[]; indices: number[] } {
    if (node?.op !== "triangles") {
        throw new Error("not a triangle mesh");
    }
    const [start, count] = node.positions;
    const [first, length] = node.indices;
    return { positions: [...recipe.buffers.f64.slice(start, start + count)], indices: [...recipe.buffers.i32.slice(first, first + length)] };
}

const POINT_LIST_ROW = "#10=IFCCARTESIANPOINTLIST3D(((0.,0.,0.),(1.,0.,0.),(0.,1.,0.),(0.,0.,1.)));";

function near(values: readonly number[]): unknown[] {
    return values.map((value) => expect.closeTo(value, 12));
}

function mappedBy(operatorRows: readonly string[]): Base.RecipeNode | undefined {
    return converted([...MAP_ROWS, ...operatorRows, MAPPED_ITEM_ROW], MAPPED_ITEM).nodes.at(-1);
}

describe("ItemConverter", () => {
    it("should describe an extrusion without a position as a profile swept by its depth, with no transform", () => {
        // Act
        const recipe = converted(BOX_ROWS, 12);

        // Assert
        expect(recipe.nodes.map((node) => node.op)).toEqual(["polygon", "extrude"]);
        expect(recipe.nodes[1]).toEqual({ op: "extrude", profile: 0, direction: [0, 0, 1], depth: 3 });
    });

    it("should normalise a slanted extrusion direction", () => {
        // Arrange
        const rows = [...BOX_ROWS.slice(0, 1), "#11=IFCDIRECTION((0.,3.,4.));", "#12=IFCEXTRUDEDAREASOLID(#10,$,#11,5.);"];

        // Act
        const recipe = converted(rows, 12);

        const extrusion = recipe.nodes[1];
        const direction = extrusion?.op === "extrude" ? extrusion.direction : [];

        // Assert
        expect(direction[0]).toBe(0);
        expect(direction[1]).toBeCloseTo(0.6, 12);
        expect(direction[2]).toBeCloseTo(0.8, 12);
    });

    it("should describe a clipping by a half-space whose agreement flag is true with its normal turned around", () => {
        // Arrange
        const rows = [...BOX_ROWS, "#13=IFCDIRECTION((0.,0.,1.));", "#14=IFCCARTESIANPOINT((0.,0.,2.));", "#15=IFCAXIS2PLACEMENT3D(#14,#13,$);", "#16=IFCPLANE(#15);", "#17=IFCHALFSPACESOLID(#16,.T.);", "#18=IFCBOOLEANCLIPPINGRESULT(.DIFFERENCE.,#12,#17);"];

        // Act
        const recipe = converted(rows, 18);
        const halfSpace = recipe.nodes.findIndex((node) => node.op === "halfSpace");
        const solid = recipe.nodes.findIndex((node) => node.op === "extrude");

        // Assert
        expect(recipe.nodes[halfSpace]).toEqual({ op: "halfSpace", origin: [0, 0, 2], normal: [-0, -0, -1] });
        expect(recipe.nodes.at(-1)).toEqual({ op: "difference", of: solid, tools: [halfSpace] });
    });

    it("should subtract a solid second operand as a solid", () => {
        // Arrange
        const rows = [...BOX_ROWS, "#13=IFCBOOLEANRESULT(.DIFFERENCE.,#12,#12);"];

        // Act
        const recipe = converted(rows, 13);

        // Assert
        expect(recipe.nodes.at(-1)).toEqual({ op: "difference", of: 1, tools: [1] });
    });

    it("should refuse booleans other than a difference, and a half-space bounded by something other than a plane", () => {
        // Arrange
        const rows = [...BOX_ROWS, "#13=IFCBOOLEANRESULT(.UNION.,#12,#12);", "#14=IFCHALFSPACESOLID(#12,.F.);", "#15=IFCBOOLEANCLIPPINGRESULT(.DIFFERENCE.,#12,#14);", "#16=IFCBOOLEANRESULT(.DIFFERENCE.,#12,$);"];

        // Act & Assert
        expect(attempt(rows, 13)).toThrow("Only boolean differences are supported yet");
        expect(attempt(rows, 15)).toThrow("Only half-spaces bounded by a plane are supported yet");
        expect(attempt(rows, 16)).toThrow("#16 lacks an operand");
    });

    it("should describe a mapped item's shared geometry once, moved by its target", () => {
        // Arrange
        const rows = [
            ...BOX_ROWS,
            "#13=IFCSHAPEREPRESENTATION(#4,'Body','SweptSolid',(#12));",
            "#14=IFCREPRESENTATIONMAP(#2,#13);",
            "#15=IFCCARTESIANPOINT((5.,0.,0.));",
            "#16=IFCCARTESIANTRANSFORMATIONOPERATOR3D($,$,#15,$,$);",
            "#17=IFCMAPPEDITEM(#14,#16);",
            "#18=IFCCARTESIANTRANSFORMATIONOPERATOR3D($,$,#1,$,$);",
            "#19=IFCMAPPEDITEM(#14,#18);",
        ];
        const builder = new RecipeBuilder();
        const converter = new ItemConverter(modelOf(withContext(rows)), builder, REACH);

        // Act
        const moved = converter.item(17);
        const inPlace = converter.item(19);
        const nodes = builder.build(1, 0.001).nodes;

        // Assert
        expect(nodes[moved]).toEqual({ op: "transform", of: inPlace, matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 5, 0, 0, 1] });
        expect(nodes[inPlace]!.op).toBe("extrude");
    });

    it("should refuse a mapped item without its source", () => {
        // Arrange
        const rows = [...MAP_ROWS, "#15=IFCCARTESIANTRANSFORMATIONOPERATOR3D($,$,#1,$,$);", "#16=IFCMAPPEDITEM($,#15);"];

        // Act & Assert
        expect(attempt(rows, 16)).toThrow("#16 lacks its source or target");
    });

    it("should mirror a mapped item in place when its Axis2 points against Axis3 x Axis1", () => {
        // Arrange
        const operator = ["#21=IFCDIRECTION((-1.,0.,0.));", "#22=IFCDIRECTION((0.,1.,0.));", "#23=IFCCARTESIANPOINT((900.,0.,0.));", "#20=IFCCARTESIANTRANSFORMATIONOPERATOR3D(#21,#22,#23,$,$);"];

        // Act
        const node = mappedBy(operator);

        // Assert
        expect(node).toEqual({ op: "transform", of: 1, matrix: near([-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 900, 0, 0, 1]) });
    });

    it("should take a missing Axis2 as (0, 1, 0), as IFC's base axis function does, so a reversed Axis1 alone mirrors", () => {
        // Arrange
        const operator = ["#21=IFCDIRECTION((-1.,0.,0.));", "#20=IFCCARTESIANTRANSFORMATIONOPERATOR3D(#21,$,#1,$,$);"];

        // Act
        const node = mappedBy(operator);

        // Assert
        expect(node).toEqual({ op: "transform", of: 1, matrix: near([-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]) });
    });

    it("should turn a mapped item whose Axis2 agrees with Axis3 x Axis1 without mirroring it", () => {
        // Arrange
        const operator = ["#21=IFCDIRECTION((0.,1.,0.));", "#22=IFCDIRECTION((-1.,0.,0.));", "#20=IFCCARTESIANTRANSFORMATIONOPERATOR3D(#21,#22,#1,$,$);"];

        // Act
        const node = mappedBy(operator);

        // Assert
        expect(node).toEqual({ op: "transform", of: 1, matrix: near([0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]) });
    });

    it("should take X from (0, 1, 0) when Axis3 runs along (1, 0, 0) and Axis1 is missing", () => {
        // Arrange
        const operator = ["#21=IFCDIRECTION((1.,0.,0.));", "#22=IFCCARTESIANPOINT((0.,0.,5.));", "#20=IFCCARTESIANTRANSFORMATIONOPERATOR3D($,$,#22,$,#21);"];

        // Act
        const node = mappedBy(operator);

        // Assert
        expect(node).toEqual({ op: "transform", of: 1, matrix: near([0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 5, 1]) });
    });

    it("should scale a mapped item by its operator's uniform Scale", () => {
        // Arrange
        const operator = ["#20=IFCCARTESIANTRANSFORMATIONOPERATOR3D($,$,#1,2.,$);"];

        // Act
        const node = mappedBy(operator);

        // Assert
        expect(node).toEqual({ op: "transform", of: 1, matrix: near([2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1]) });
    });

    it("should scale a non-uniform operator's axes by Scale, Scale2 and Scale3, a missing one taking Scale", () => {
        // Arrange
        const operator = ["#20=IFCCARTESIANTRANSFORMATIONOPERATOR3DNONUNIFORM($,$,#1,2.,$,3.,$);"];

        // Act
        const node = mappedBy(operator);

        // Assert
        expect(node).toEqual({ op: "transform", of: 1, matrix: near([2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1]) });
    });

    it("should take a two-dimensional operator's X from Axis2 turned clockwise when Axis1 is missing", () => {
        // Arrange
        const operator = ["#21=IFCDIRECTION((-1.,0.));", "#22=IFCCARTESIANPOINT((5.,0.));", "#20=IFCCARTESIANTRANSFORMATIONOPERATOR2D($,#21,#22,$);"];

        // Act
        const node = mappedBy(operator);

        // Assert
        expect(node).toEqual({ op: "transform", of: 1, matrix: near([0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 5, 0, 0, 1]) });
    });

    it("should mirror a two-dimensional operator whose Axis2 points against Axis1 turned counterclockwise", () => {
        // Arrange
        const operator = ["#21=IFCDIRECTION((1.,0.));", "#22=IFCDIRECTION((0.,-1.));", "#23=IFCCARTESIANPOINT((0.,0.));", "#20=IFCCARTESIANTRANSFORMATIONOPERATOR2D(#21,#22,#23,$);"];

        // Act
        const node = mappedBy(operator);

        // Assert
        expect(node).toEqual({ op: "transform", of: 1, matrix: near([1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]) });
    });

    it("should refuse an operator whose Axis1 runs along its Axis3, an axis of zero length and a scale that is not above zero", () => {
        // Arrange
        const rows = [
            ...MAP_ROWS,
            "#21=IFCDIRECTION((0.,0.,-1.));",
            "#22=IFCDIRECTION((0.,0.,0.));",
            "#23=IFCCARTESIANTRANSFORMATIONOPERATOR3D(#21,$,#1,$,$);",
            "#24=IFCCARTESIANTRANSFORMATIONOPERATOR3D($,#22,#1,$,$);",
            "#25=IFCCARTESIANTRANSFORMATIONOPERATOR3D($,$,#1,0.,$);",
            "#26=IFCCARTESIANTRANSFORMATIONOPERATOR3DNONUNIFORM($,$,#1,$,$,$,-1.);",
            "#33=IFCMAPPEDITEM(#14,#23);",
            "#34=IFCMAPPEDITEM(#14,#24);",
            "#35=IFCMAPPEDITEM(#14,#25);",
            "#36=IFCMAPPEDITEM(#14,#26);",
        ];

        // Act & Assert
        expect(attempt(rows, 33)).toThrow("#23 has its Axis1 along its Axis3");
        expect(attempt(rows, 34)).toThrow("#24 has an Axis2 of zero length");
        expect(attempt(rows, 35)).toThrow("#25 has a Scale that is not a number above zero");
        expect(attempt(rows, 36)).toThrow("#26 has a Scale3 that is not a number above zero");
    });

    it("should place a representation map by its origin once, however many mapped items use it", () => {
        // Arrange
        const rows = [
            ...BOX_ROWS,
            "#13=IFCSHAPEREPRESENTATION(#4,'Body','SweptSolid',(#12));",
            "#15=IFCCARTESIANPOINT((7.,0.));",
            "#16=IFCAXIS2PLACEMENT2D(#15,$);",
            "#14=IFCREPRESENTATIONMAP(#16,#13);",
            "#20=IFCCARTESIANTRANSFORMATIONOPERATOR3D($,$,#1,$,$);",
            "#30=IFCMAPPEDITEM(#14,#20);",
            "#31=IFCMAPPEDITEM(#14,#20);",
        ];
        const builder = new RecipeBuilder();
        const converter = new ItemConverter(modelOf(withContext(rows)), builder, REACH);

        // Act
        const first = converter.item(30);
        const second = converter.item(31);

        // Assert
        expect(second).toBe(first);
        expect(builder.build(1, 0.001).nodes.filter((node) => node.op === "transform")).toHaveLength(1);
    });

    it("should place a representation map by its two-dimensional mapping origin", () => {
        // Arrange
        const rows = [
            ...BOX_ROWS,
            "#13=IFCSHAPEREPRESENTATION(#4,'Body','SweptSolid',(#12));",
            "#15=IFCCARTESIANPOINT((7.,0.));",
            "#16=IFCAXIS2PLACEMENT2D(#15,$);",
            "#14=IFCREPRESENTATIONMAP(#16,#13);",
            "#20=IFCCARTESIANTRANSFORMATIONOPERATOR3D($,$,#1,$,$);",
            MAPPED_ITEM_ROW,
        ];

        // Act
        const node = converted(rows, MAPPED_ITEM).nodes.at(-1);

        // Assert
        expect(node).toEqual({ op: "transform", of: 1, matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 7, 0, 0, 1] });
    });

    it("should describe a triangulated face set with its indices counted from 0", () => {
        // Arrange
        const rows = [POINT_LIST_ROW, "#11=IFCTRIANGULATEDFACESET(#10,$,.T.,((1,2,3),(1,2,4),(2,3,4),(1,3,4)),$);"];

        // Act
        const recipe = converted(rows, 11);

        // Assert
        expect(recipe.nodes).toEqual([{ op: "triangles", positions: [0, 12], indices: [0, 12] }]);
        expect(Array.from(recipe.buffers.i32)).toEqual([0, 1, 2, 0, 1, 3, 1, 2, 3, 0, 2, 3]);
    });

    it("should look a triangulated face set's corners up in its PnIndex, which names the points", () => {
        // Arrange
        const rows = [POINT_LIST_ROW, "#11=IFCTRIANGULATEDFACESET(#10,$,$,((1,2,3),(2,3,4)),(4,3,2,1));"];

        // Act
        const recipe = converted(rows, 11);

        // Assert
        expect(Array.from(recipe.buffers.i32)).toEqual([3, 2, 1, 2, 1, 0]);
    });

    it("should refuse a triangle naming a corner its PnIndex or point list lacks, a PnIndex naming a missing point and a triangle of four corners", () => {
        // Arrange
        const rows = [
            POINT_LIST_ROW,
            "#11=IFCTRIANGULATEDFACESET(#10,$,$,((1,2,3),(1,2,5)),(4,3,2,1));",
            "#12=IFCTRIANGULATEDFACESET(#10,$,$,((1,2,3)),(1,2,9));",
            "#13=IFCTRIANGULATEDFACESET(#10,$,$,((1,2,5)),$);",
            "#14=IFCTRIANGULATEDFACESET(#10,$,$,((1,2,3,4)),$);",
            "#15=IFCTRIANGULATEDFACESET(#10,$,$,((1,2,1.5)),$);",
        ];

        // Act & Assert
        expect(attempt(rows, 11)).toThrow("#11 triangle 1 names 5, outside the 4 entries of PnIndex");
        expect(attempt(rows, 12)).toThrow("#12 PnIndex names 9, outside the 4 points");
        expect(attempt(rows, 13)).toThrow("#13 triangle 0 names 5, outside the 4 points");
        expect(attempt(rows, 14)).toThrow("#14 triangle 0 has 4 corners, not 3");
        expect(attempt(rows, 15)).toThrow("#15 triangle 0 is not a list of indices");
    });

    it("should refuse an item type it does not describe and an extrusion without depth", () => {
        // Arrange
        const rows = [...BOX_ROWS, "#13=IFCSWEPTDISKSOLID(#12,1.,$,$,$);", "#14=IFCEXTRUDEDAREASOLID(#10,$,#11,-1.);", "#15=IFCEXTRUDEDAREASOLID($,$,#11,1.);"];

        // Act & Assert
        expect(attempt(rows, 13)).toThrow("An IfcSweptDiskSolid is not supported yet");
        expect(attempt(rows, 14)).toThrow("#14 has no positive depth");
        expect(attempt(rows, 15)).toThrow("#15 has no swept area");
    });

    it("should describe an item two representations share as one node, and a representation of several items as a compound", () => {
        // Arrange
        const rows = [...BOX_ROWS, "#13=IFCSHAPEREPRESENTATION(#4,'Body','SweptSolid',(#12,#12));", "#14=IFCSHAPEREPRESENTATION(#4,'Body','SweptSolid',());"];
        const builder = new RecipeBuilder();
        const converter = new ItemConverter(modelOf(withContext(rows)), builder, REACH);

        // Act
        const compound = converter.representation(13);
        const nodes = builder.build(1, 0.001).nodes;

        // Assert
        expect(nodes[compound]).toEqual({ op: "compound", of: [1, 1] });
        expect(() => converter.representation(14)).toThrow("#14 holds no items");
    });

    it("should describe a faceted brep as one triangle mesh over its shared corners", () => {
        // Arrange
        const rows = [...TETRAHEDRON_ROWS, "#43=IFCFACETEDBREP(#42);"];

        // Act
        const recipe = converted(rows, 43);
        const mesh = meshOf(recipe, recipe.nodes.at(-1));

        // Assert
        expect(recipe.nodes).toHaveLength(1);
        expect(mesh.positions).toEqual([0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1]);
        expect(mesh.indices).toEqual([0, 1, 2, 0, 2, 3, 0, 3, 1, 2, 1, 3]);
    });

    it("should put a brep's voids, both surface models and a polygonal face set into one triangle mesh each", () => {
        // Arrange
        const rows = [
            ...TETRAHEDRON_ROWS,
            "#43=IFCFACETEDBREPWITHVOIDS(#42,(#42));",
            "#44=IFCFACEBASEDSURFACEMODEL((#42));",
            "#45=IFCOPENSHELL((#38,#39));",
            "#46=IFCSHELLBASEDSURFACEMODEL((#45,#42));",
            "#47=IFCCARTESIANPOINTLIST3D(((0.,0.,0.),(1.,0.,0.),(0.,1.,0.),(0.,0.,1.)));",
            "#48=IFCINDEXEDPOLYGONALFACE((1,3,2));",
            "#49=IFCPOLYGONALFACESET(#47,.F.,(#48),$);",
        ];

        // Act
        const meshes = [43, 44, 46, 49].map((item) => {
            const recipe = converted(rows, item);
            return meshOf(recipe, recipe.nodes.at(-1));
        });

        // Assert
        expect(meshes.map((mesh) => [mesh.positions.length / 3, mesh.indices.length / 3])).toEqual([[4, 8], [4, 4], [4, 6], [4, 1]]);
        expect(meshes[0]!.indices.slice(12)).toEqual([0, 2, 1, 0, 3, 2, 0, 1, 3, 2, 3, 1]);
    });

    it("should refuse a faceted brep without an outer shell and a shell with no face that has an area", () => {
        // Arrange
        const rows = [
            "#20=IFCCARTESIANPOINT((0.,0.,0.));",
            "#21=IFCCARTESIANPOINT((1.,0.,0.));",
            "#30=IFCPOLYLOOP((#20,#21,#20));",
            "#31=IFCFACEOUTERBOUND(#30,.T.);",
            "#32=IFCFACE((#31));",
            "#33=IFCCLOSEDSHELL((#32));",
            "#34=IFCFACETEDBREP(#33);",
            "#35=IFCFACETEDBREP($);",
        ];

        // Act & Assert
        expect(attempt(rows, 34)).toThrow("#34 holds no faces with an area");
        expect(attempt(rows, 35)).toThrow("#35 has no outer shell");
    });

    it("should cut by a polygonal bounded half-space as its boundary's prism, reaching both ways, less the far side of its plane", () => {
        // Act
        const recipe = converted(BOUNDED_HALF_SPACE_ROWS, 24);

        // Assert
        expect(recipe.nodes.map((node) => node.op)).toEqual(["polygon", "extrude", "polygon", "extrude", "transform", "halfSpace", "difference", "difference"]);
        expect(recipe.nodes[2]).toEqual({ op: "polygon", points: [8, 8], holes: [] });
        expect([...recipe.buffers.f64.slice(8, 16)]).toEqual([1, -1, 1, 1, -1, 1, -1, -1]);
        expect(recipe.nodes[3]).toEqual({ op: "extrude", profile: 2, direction: [0, 0, 1], depth: 2 * REACH });
        expect(recipe.nodes[4]).toEqual({ op: "transform", of: 3, matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -REACH, 1] });
        expect(recipe.nodes[5]).toEqual({ op: "halfSpace", origin: [0, 0, 2], normal: [-0, -0, -1] });
        expect(recipe.nodes[6]).toEqual({ op: "difference", of: 4, tools: [5] });
        expect(recipe.nodes[7]).toEqual({ op: "difference", of: 1, tools: [6] });
    });

    it("should cut by a boxed half-space as by its plane, and refuse a bounded one without its boundary", () => {
        // Arrange
        const rows = [
            ...BOUNDED_HALF_SPACE_ROWS,
            "#25=IFCBOXEDHALFSPACE(#16,.T.,$);",
            "#26=IFCBOOLEANCLIPPINGRESULT(.DIFFERENCE.,#12,#25);",
            "#27=IFCPOLYGONALBOUNDEDHALFSPACE(#16,.F.,#17,$);",
            "#28=IFCBOOLEANCLIPPINGRESULT(.DIFFERENCE.,#12,#27);",
        ];

        // Act
        const recipe = converted(rows, 26);

        // Assert
        expect(recipe.nodes.map((node) => node.op)).toEqual(["polygon", "extrude", "halfSpace", "difference"]);
        expect(attempt(rows, 28)).toThrow("#27 lacks its position or its boundary");
    });

    it("should describe a representation made only of meshes as one mesh, each item keeping its own corners", () => {
        // Arrange
        const rows = [
            ...TETRAHEDRON_ROWS,
            "#43=IFCFACETEDBREP(#42);",
            "#47=IFCCARTESIANPOINTLIST3D(((0.,0.,0.),(1.,0.,0.),(0.,1.,0.)));",
            "#48=IFCTRIANGULATEDFACESET(#47,$,$,((1,2,3)),$);",
            "#50=IFCSHAPEREPRESENTATION(#4,'Body','Brep',(#43,#48));",
        ];
        const builder = new RecipeBuilder();
        const converter = new ItemConverter(modelOf(withContext(rows)), builder, REACH);

        // Act
        const node = converter.representation(50);
        const recipe = builder.build(1, 0.001);
        const mesh = meshOf(recipe, recipe.nodes[node]);

        // Assert
        expect(recipe.nodes).toHaveLength(1);
        expect(mesh.positions).toHaveLength(21);
        expect(mesh.indices).toEqual([0, 1, 2, 0, 2, 3, 0, 3, 1, 2, 1, 3, 4, 5, 6]);
    });

    it("should keep a compound for a representation that mixes a mesh with other solids", () => {
        // Arrange
        const rows = [...BOX_ROWS, ...TETRAHEDRON_ROWS, "#43=IFCFACETEDBREP(#42);", "#50=IFCSHAPEREPRESENTATION(#4,'Body','Brep',(#43,#12));"];
        const builder = new RecipeBuilder();
        const converter = new ItemConverter(modelOf(withContext(rows)), builder, REACH);

        // Act
        const node = converter.representation(50);
        const nodes = builder.build(1, 0.001).nodes;

        // Assert
        expect(nodes.map((each) => each.op)).toEqual(["triangles", "polygon", "extrude", "compound"]);
        expect(nodes[node]).toEqual({ op: "compound", of: [0, 2] });
    });

    it("should turn a surface model's closed shell given inside out the right way round, and leave an open shell as given", () => {
        // Arrange
        const rows = [
            ...TETRAHEDRON_ROWS,
            "#50=IFCFACEOUTERBOUND(#30,.F.);",
            "#51=IFCFACEOUTERBOUND(#31,.F.);",
            "#52=IFCFACEOUTERBOUND(#32,.F.);",
            "#53=IFCFACEOUTERBOUND(#33,.F.);",
            "#54=IFCFACE((#50));",
            "#55=IFCFACE((#51));",
            "#56=IFCFACE((#52));",
            "#57=IFCFACE((#53));",
            "#58=IFCCLOSEDSHELL((#54,#55,#56,#57));",
            "#59=IFCSHELLBASEDSURFACEMODEL((#58));",
            "#60=IFCOPENSHELL((#54,#55,#56,#57));",
            "#61=IFCSHELLBASEDSURFACEMODEL((#60));",
        ];

        // Act
        const volumes = [59, 61].map((item) => {
            const recipe = converted(rows, item);
            const mesh = meshOf(recipe, recipe.nodes.at(-1));
            return signedVolumeOf(mesh.positions, mesh.indices);
        });

        // Assert
        expect(volumes).toEqual([expect.closeTo(1 / 6, 12), expect.closeTo(-1 / 6, 12)]);
    });

    it("should turn a closed triangulated face set given inside out the right way round", () => {
        // Arrange
        const rows = [
            "#47=IFCCARTESIANPOINTLIST3D(((0.,0.,0.),(1.,0.,0.),(0.,1.,0.),(0.,0.,1.)));",
            "#48=IFCTRIANGULATEDFACESET(#47,$,.T.,((1,2,3),(1,4,2),(1,3,4),(2,4,3)),$);",
            "#49=IFCTRIANGULATEDFACESET(#47,$,$,((1,2,3),(1,4,2),(1,3,4),(2,4,3)),$);",
        ];

        // Act
        const closed = converted(rows, 48);
        const open = converted(rows, 49);

        // Assert
        expect(meshOf(closed, closed.nodes[0]).indices).toEqual([0, 2, 1, 0, 1, 3, 0, 3, 2, 1, 2, 3]);
        expect(meshOf(open, open.nodes[0]).indices).toEqual([0, 1, 2, 0, 3, 1, 0, 2, 3, 1, 3, 2]);
    });

    it("should give an extruded profile's holes to its polygon", () => {
        // Arrange
        const rows = [
            "#10=IFCCARTESIANPOINTLIST2D(((0.,0.),(4.,0.),(4.,4.),(0.,4.)));",
            "#11=IFCINDEXEDPOLYCURVE(#10,$,.F.);",
            "#12=IFCCARTESIANPOINTLIST2D(((1.,1.),(1.,3.),(3.,3.),(3.,1.)));",
            "#13=IFCINDEXEDPOLYCURVE(#12,$,.F.);",
            "#14=IFCARBITRARYPROFILEDEFWITHVOIDS(.AREA.,$,#11,(#13));",
            "#15=IFCDIRECTION((0.,0.,1.));",
            "#16=IFCEXTRUDEDAREASOLID(#14,$,#15,2.);",
        ];

        // Act
        const recipe = converted(rows, 16);

        // Assert
        expect(recipe.nodes[0]).toEqual({ op: "polygon", points: [0, 8], holes: [[8, 8]] });
    });

    it("should refuse a half-space whose plane has no position and a map that maps no representation", () => {
        // Arrange
        const rows = [
            ...BOX_ROWS,
            "#13=IFCPLANE($);",
            "#14=IFCHALFSPACESOLID(#13,.T.);",
            "#15=IFCBOOLEANCLIPPINGRESULT(.DIFFERENCE.,#12,#14);",
            "#16=IFCREPRESENTATIONMAP(#2,$);",
            "#17=IFCCARTESIANTRANSFORMATIONOPERATOR3D($,$,#1,$,$);",
            "#18=IFCMAPPEDITEM(#16,#17);",
        ];

        // Act & Assert
        expect(attempt(rows, 15)).toThrow("#13 has no position");
        expect(attempt(rows, 18)).toThrow("#16 maps no representation");
    });
});
