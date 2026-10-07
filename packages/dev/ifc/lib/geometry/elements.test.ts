import { describe, expect, it, vi } from "vitest";
import { modelOf } from "../api/services/service-support";
import { modelOfRows, productRows, withContext } from "../__test__/geometry-fixtures";
import type { ModelSnapshot } from "../model/snapshot";
import { modelRecipe } from "./elements";

const BOX_ROWS = [
    "#10=IFCRECTANGLEPROFILEDEF(.AREA.,$,$,2.,2.);",
    "#11=IFCDIRECTION((0.,0.,1.));",
    "#12=IFCEXTRUDEDAREASOLID(#10,$,#11,3.);",
    "#13=IFCSWEPTDISKSOLID(#12,1.,$,$,$);",
];

const MODEL_BODY_REPRESENTATION_ROWS = [
    "#20=IFCSHAPEREPRESENTATION(#4,'Body','SweptSolid',(#12));",
    "#21=IFCPRODUCTDEFINITIONSHAPE($,$,(#20));",
];

const STYLE_ROWS = [
    "#60=IFCCOLOURRGB($,0.2,0.4,0.6);",
    "#61=IFCSURFACESTYLESHADING(#60,0.5);",
    "#62=IFCSURFACESTYLE('Red',.BOTH.,(#61));",
    "#63=IFCSTYLEDITEM($,(#62),$);",
    "#64=IFCSTYLEDREPRESENTATION(#4,'Style','Material',(#63));",
    "#65=IFCMATERIAL('Painted',$,$);",
    "#66=IFCMATERIALDEFINITIONREPRESENTATION($,$,(#64),#65);",
];

function paintedBoxes(...productRowIds: number[]): ModelSnapshot {
    return modelOf(withContext([
        ...BOX_ROWS,
        ...STYLE_ROWS,
        ...productRowIds.flatMap((id) => productRows(id, `00000000000000000000${id}`, "#12")),
        `#90=IFCRELASSOCIATESMATERIAL('0000000000000000000009',$,$,$,(${productRowIds.map((id) => `#${id + 2}`).join(",")}),#65);`,
    ]));
}

const BOUNDED_CUT_ROWS = [
    "#40=IFCDIRECTION((0.,0.,1.));",
    "#41=IFCCARTESIANPOINT((0.,0.,2.));",
    "#42=IFCAXIS2PLACEMENT3D(#41,#40,$);",
    "#43=IFCPLANE(#42);",
    "#44=IFCAXIS2PLACEMENT3D(#1,$,$);",
    "#45=IFCCARTESIANPOINT((-1.,-1.));",
    "#46=IFCCARTESIANPOINT((1.,-1.));",
    "#47=IFCCARTESIANPOINT((1.,1.));",
    "#48=IFCCARTESIANPOINT((-1.,1.));",
    "#49=IFCPOLYLINE((#45,#48,#47,#46,#45));",
    "#50=IFCPOLYGONALBOUNDEDHALFSPACE(#43,.F.,#44,#49);",
    "#51=IFCBOOLEANCLIPPINGRESULT(.DIFFERENCE.,#12,#50);",
];

describe("modelRecipe", () => {
    it("should reach a bounded half-space a kilometre out in the model's own length unit", () => {
        // Arrange
        const model = modelOf(withContext([...BOX_ROWS, ...BOUNDED_CUT_ROWS, ...productRows(20, "0000000000000000000001", "#51")]));

        // Act
        const depths = [1, 1000].map((millimetresPerUnit) => modelRecipe(model, undefined, millimetresPerUnit, 0.5).recipe.nodes.flatMap((node) => (node.op === "extrude" ? [node.depth] : [])));

        // Assert
        expect(depths).toEqual([[3, 2e6], [3, 2000]]);
    });

    it("should report an element it cannot describe and still describe the others", () => {
        // Arrange
        const model = withContext([...BOX_ROWS, ...productRows(20, "0000000000000000000001", "#12"), ...productRows(30, "0000000000000000000002", "#13")]);

        // Act
        const { recipe, problems } = modelRecipe(modelOf(model), undefined, 1, 0.5);

        // Assert
        expect(recipe.roots.map((root) => root.tag["globalId"])).toEqual(["0000000000000000000001"]);
        expect(problems).toEqual([{ globalId: "0000000000000000000002", type: "IfcBuildingElementProxy", message: "An IfcSweptDiskSolid is not supported yet" }]);
    });

    it("should report an element without a placement", () => {
        // Arrange
        const model = withContext([...BOX_ROWS, ...productRows(20, "0000000000000000000001", "#12", "$")]);

        // Act
        const { problems } = modelRecipe(modelOf(model), undefined, 1, 0.5);

        // Assert
        expect(problems.map((problem) => problem.message)).toEqual(["#22 has no placement"]);
    });

    it("should leave out spatial elements, openings and bodies outside a model context", () => {
        // Arrange
        const model = withContext([
            ...BOX_ROWS,
            "#20=IFCSHAPEREPRESENTATION(#4,'Body','SweptSolid',(#12));",
            "#21=IFCPRODUCTDEFINITIONSHAPE($,$,(#20));",
            "#22=IFCSITE('0000000000000000000001',$,$,$,$,#5,#21,$,.ELEMENT.,$,$,$,$,$);",
            "#23=IFCOPENINGELEMENT('0000000000000000000002',$,$,$,$,#5,#21,$,.OPENING.);",
            "#24=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Plan',2,0.001,#2,$);",
            "#25=IFCSHAPEREPRESENTATION(#24,'Body','SweptSolid',(#12));",
            "#26=IFCPRODUCTDEFINITIONSHAPE($,$,(#25));",
            "#27=IFCBUILDINGELEMENTPROXY('0000000000000000000003',$,$,$,$,#5,#26,$,$);",
            "#28=IFCBUILDINGELEMENTPROXY('0000000000000000000004',$,$,$,$,#5,$,$,$);",
        ]);

        // Act
        const { recipe, problems } = modelRecipe(modelOf(model), undefined, 1, 0.5);

        // Assert
        expect(recipe.roots).toEqual([]);
        expect(problems).toEqual([]);
    });

    it("should take the model context's precision as the recipe's tolerance, and the fallback without one", () => {
        // Arrange
        const withPrecision = withContext([]);
        const without = modelOfRows([]);

        // Act
        const precise = modelRecipe(modelOf(withPrecision), undefined, 1000, 0.5).recipe;
        const fallback = modelRecipe(modelOf(without), undefined, 1000, 0.5).recipe;

        // Assert
        expect(precise.tolerance).toBe(0.001);
        expect(precise.millimetresPerUnit).toBe(1000);
        expect(fallback.tolerance).toBe(0.5);
    });

    it("should colour an element by its material's surface style, transparency turned into alpha", () => {
        // Arrange
        const model = withContext([...BOX_ROWS, ...STYLE_ROWS, ...productRows(20, "0000000000000000000001", "#12"), "#70=IFCRELASSOCIATESMATERIAL('0000000000000000000009',$,$,$,(#22),#65);"]);

        // Act
        const { recipe } = modelRecipe(modelOf(model), undefined, 1, 0.5);

        // Assert
        expect(recipe.roots[0]!.tag["rgba"]).toEqual([0.2, 0.4, 0.6, 0.5]);
    });

    it("should colour an element by the first styled material of its layer set usage", () => {
        // Arrange
        const model = withContext([
            ...BOX_ROWS,
            ...STYLE_ROWS,
            ...productRows(20, "0000000000000000000001", "#12"),
            "#71=IFCMATERIAL('Plain',$,$);",
            "#72=IFCMATERIALLAYER(#71,10.,$,$,$,$,$);",
            "#73=IFCMATERIALLAYER($,10.,$,$,$,$,$);",
            "#74=IFCMATERIALLAYER(#65,10.,$,$,$,$,$);",
            "#75=IFCMATERIALLAYERSET((#72,#73,#74),$,$);",
            "#76=IFCMATERIALLAYERSETUSAGE(#75,.AXIS2.,.POSITIVE.,0.,$);",
            "#77=IFCRELASSOCIATESMATERIAL('0000000000000000000009',$,$,$,(#22),#76);",
        ]);

        // Act
        const { recipe } = modelRecipe(modelOf(model), undefined, 1, 0.5);

        // Assert
        expect(recipe.roots[0]!.tag["rgba"]).toEqual([0.2, 0.4, 0.6, 0.5]);
    });

    it("should leave the colour out when the material has no surface style", () => {
        // Arrange
        const model = withContext([...BOX_ROWS, ...productRows(20, "0000000000000000000001", "#12"), "#71=IFCMATERIAL('Plain',$,$);", "#72=IFCRELASSOCIATESMATERIAL('0000000000000000000009',$,$,$,(#22),#71);"]);

        // Act
        const { recipe } = modelRecipe(modelOf(model), undefined, 1, 0.5);

        // Assert
        expect(recipe.roots[0]!.tag).toEqual({ globalId: "0000000000000000000001", type: "IfcBuildingElementProxy", name: "0000000000000000000001" });
    });

    it("should describe only the GlobalIds it is given", () => {
        // Arrange
        const model = withContext([...BOX_ROWS, ...productRows(20, "0000000000000000000001", "#12"), ...productRows(30, "0000000000000000000002", "#12")]);

        // Act
        const { recipe } = modelRecipe(modelOf(model), ["0000000000000000000002"], 1, 0.5);

        // Assert
        expect(recipe.roots.map((root) => root.tag["globalId"])).toEqual(["0000000000000000000002"]);
        expect(recipe.roots[0]!.node).toBe(1);
    });

    it("should take a Body subcontext without a context type of its own as its parent context's type", () => {
        // Arrange
        const model = withContext([
            ...BOX_ROWS,
            "#6=IFCGEOMETRICREPRESENTATIONSUBCONTEXT('Body',$,*,*,*,*,#3,$,.MODEL_VIEW.,$);",
            "#20=IFCSHAPEREPRESENTATION(#6,'Body','SweptSolid',(#12));",
            "#21=IFCPRODUCTDEFINITIONSHAPE($,$,(#20));",
            "#22=IFCBUILDINGELEMENTPROXY('0000000000000000000001',$,$,$,$,#5,#21,$,$);",
        ]);

        // Act
        const { recipe } = modelRecipe(modelOf(model), undefined, 1, 0.5);

        // Assert
        expect(recipe.roots.map((root) => root.tag["globalId"])).toEqual(["0000000000000000000001"]);
    });

    it("should list each element asked for that it does not describe, with the reason", () => {
        // Arrange
        const model = withContext([
            ...BOX_ROWS,
            ...MODEL_BODY_REPRESENTATION_ROWS,
            "#22=IFCBUILDINGSTOREY('0000000000000000000001',$,$,$,$,#5,#21,$,.ELEMENT.,0.);",
            "#23=IFCOPENINGELEMENT('0000000000000000000002',$,$,$,$,#5,#21,$,.OPENING.);",
            "#24=IFCANNOTATION('0000000000000000000003',$,$,$,$,#5,#21);",
            "#25=IFCBUILDINGELEMENTPROXY('0000000000000000000004',$,$,$,$,#5,$,$,$);",
            "#26=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Plan',2,0.001,#2,$);",
            "#27=IFCGEOMETRICREPRESENTATIONSUBCONTEXT('Body',$,*,*,*,*,#26,$,.PLAN_VIEW.,$);",
            "#28=IFCSHAPEREPRESENTATION(#27,'Body','SweptSolid',(#12));",
            "#29=IFCPRODUCTDEFINITIONSHAPE($,$,(#28));",
            "#30=IFCBUILDINGELEMENTPROXY('0000000000000000000005',$,$,$,$,#5,#29,$,$);",
        ]);
        const asked = ["0000000000000000000001", "0000000000000000000002", "0000000000000000000003", "0000000000000000000004", "0000000000000000000005"];
        const noBody = "The element has no 'Body' representation in a 'Model' context";

        // Act
        const { recipe, problems } = modelRecipe(modelOf(model), asked, 1, 0.5);

        // Assert
        expect(recipe.roots).toEqual([]);
        expect(problems).toEqual([
            { globalId: "0000000000000000000001", type: "IfcBuildingStorey", message: "An IfcBuildingStorey is a spatial element, which a recipe does not describe" },
            { globalId: "0000000000000000000002", type: "IfcOpeningElement", message: "An IfcOpeningElement is cut from the element it voids, not described on its own" },
            { globalId: "0000000000000000000003", type: "IfcAnnotation", message: "An IfcAnnotation is an annotation, which a recipe does not describe" },
            { globalId: "0000000000000000000004", type: "IfcBuildingElementProxy", message: noBody },
            { globalId: "0000000000000000000005", type: "IfcBuildingElementProxy", message: noBody },
        ]);
    });

    it("should read the materials' styles once per recipe, however many elements it colours", () => {
        // Arrange
        const one = paintedBoxes(20);
        const three = paintedBoxes(20, 30, 40);
        const scansOfOne = vi.spyOn(one, "byType");
        const scansOfThree = vi.spyOn(three, "byType");

        // Act
        modelRecipe(one, undefined, 1, 0.5);
        const { recipe } = modelRecipe(three, undefined, 1, 0.5);

        // Assert
        expect(recipe.roots.map((root) => root.tag["rgba"])).toEqual([[0.2, 0.4, 0.6, 0.5], [0.2, 0.4, 0.6, 0.5], [0.2, 0.4, 0.6, 0.5]]);
        expect(scansOfThree.mock.calls.length).toBe(scansOfOne.mock.calls.length);
    });

    it("should give each surface style of an element's items its own root, keeping the glass see-through", () => {
        // Arrange
        const model = withContext([
            ...BOX_ROWS,
            "#14=IFCEXTRUDEDAREASOLID(#10,$,#11,1.);",
            "#15=IFCEXTRUDEDAREASOLID(#10,$,#11,2.);",
            "#60=IFCCOLOURRGB($,0.9,0.9,0.9);",
            "#61=IFCSURFACESTYLESHADING(#60,0.);",
            "#62=IFCSURFACESTYLE('Frame',.BOTH.,(#61));",
            "#63=IFCCOLOURRGB($,0.6,0.8,1.);",
            "#64=IFCSURFACESTYLERENDERING(#63,0.75,$,$,$,$,$,$,.NOTDEFINED.);",
            "#65=IFCSURFACESTYLE('Glass',.BOTH.,(#64));",
            "#66=IFCSTYLEDITEM(#12,(#62),$);",
            "#67=IFCSTYLEDITEM(#14,(#65),$);",
            "#68=IFCSTYLEDITEM(#15,(#62),$);",
            ...productRows(20, "0000000000000000000001", "#12,#14,#15", "#5", "IFCWINDOW"),
        ]);

        // Act
        const { recipe } = modelRecipe(modelOf(model), undefined, 1, 0.5);

        // Assert
        expect(recipe.roots.map((root) => [root.tag["globalId"], root.tag["rgba"]])).toEqual([
            ["0000000000000000000001", [0.9, 0.9, 0.9, 1]],
            ["0000000000000000000001", [0.6, 0.8, 1, 0.25]],
        ]);
        expect(recipe.nodes[recipe.roots[0]!.node]!.op).toBe("compound");
    });

    it("should read styles wrapped in a style assignment, as IFC2X3 files write them, for items and for materials", () => {
        // Arrange
        const model = withContext([
            ...BOX_ROWS,
            "#60=IFCCOLOURRGB($,0.2,0.4,0.6);",
            "#61=IFCSURFACESTYLERENDERING(#60,0.,$,$,$,$,$,$,.NOTDEFINED.);",
            "#62=IFCSURFACESTYLE('Painted',.BOTH.,(#61));",
            "#63=IFCPRESENTATIONSTYLEASSIGNMENT((#62));",
            "#64=IFCSTYLEDITEM(#12,(#63),$);",
            "#65=IFCSTYLEDITEM($,(#63),$);",
            "#66=IFCSTYLEDREPRESENTATION(#4,'Style','Material',(#65));",
            "#67=IFCMATERIAL('Painted',$,$);",
            "#68=IFCMATERIALDEFINITIONREPRESENTATION($,$,(#66),#67);",
            "#14=IFCEXTRUDEDAREASOLID(#10,$,#11,1.);",
            ...productRows(20, "0000000000000000000001", "#12"),
            ...productRows(30, "0000000000000000000002", "#14"),
            "#90=IFCRELASSOCIATESMATERIAL('0000000000000000000009',$,$,$,(#32),#67);",
        ]);

        // Act
        const { recipe } = modelRecipe(modelOf(model), undefined, 1, 0.5);

        // Assert
        expect(recipe.roots.map((root) => root.tag["rgba"])).toEqual([[0.2, 0.4, 0.6, 1], [0.2, 0.4, 0.6, 1]]);
    });

    it("should colour mapped geometry by its own items' styles before the mapped item's, and unstyled parts by the material", () => {
        // Arrange
        const model = withContext([
            ...BOX_ROWS,
            ...STYLE_ROWS,
            "#14=IFCEXTRUDEDAREASOLID(#10,$,#11,1.);",
            "#40=IFCCOLOURRGB($,1.,0.,0.);",
            "#41=IFCSURFACESTYLESHADING(#40,0.);",
            "#42=IFCSURFACESTYLE('Red',.BOTH.,(#41));",
            "#43=IFCCOLOURRGB($,0.,1.,0.);",
            "#44=IFCSURFACESTYLESHADING(#43,0.);",
            "#45=IFCSURFACESTYLE('Green',.BOTH.,(#44));",
            "#46=IFCSTYLEDITEM(#12,(#42),$);",
            "#47=IFCSHAPEREPRESENTATION(#4,'Body','SweptSolid',(#12,#14));",
            "#48=IFCREPRESENTATIONMAP(#2,#47);",
            "#49=IFCCARTESIANTRANSFORMATIONOPERATOR3D($,$,#1,$,$);",
            "#50=IFCMAPPEDITEM(#48,#49);",
            "#51=IFCSTYLEDITEM(#50,(#45),$);",
            "#52=IFCEXTRUDEDAREASOLID(#10,$,#11,4.);",
            ...productRows(20, "0000000000000000000001", "#50,#52"),
            "#90=IFCRELASSOCIATESMATERIAL('0000000000000000000009',$,$,$,(#22),#65);",
        ]);

        // Act
        const { recipe } = modelRecipe(modelOf(model), undefined, 1, 0.5);

        // Assert
        expect(recipe.roots.map((root) => root.tag["rgba"])).toEqual([[1, 0, 0, 1], [0, 1, 0, 1], [0.2, 0.4, 0.6, 0.5]]);
    });

    it("should cut an element's openings through every one of its styled parts", () => {
        // Arrange
        const model = withContext([
            ...BOX_ROWS,
            "#14=IFCEXTRUDEDAREASOLID(#10,$,#11,1.);",
            "#60=IFCCOLOURRGB($,1.,0.,0.);",
            "#61=IFCSURFACESTYLESHADING(#60,0.);",
            "#62=IFCSURFACESTYLE('Red',.BOTH.,(#61));",
            "#63=IFCSTYLEDITEM(#14,(#62),$);",
            ...productRows(20, "0000000000000000000001", "#12,#14"),
            "#40=IFCRECTANGLEPROFILEDEF(.AREA.,$,$,0.5,0.5);",
            "#41=IFCEXTRUDEDAREASOLID(#40,$,#11,5.);",
            ...productRows(30, "0000000000000000000002", "#41", "#5", "IFCOPENINGELEMENT"),
            "#70=IFCRELVOIDSELEMENT('0000000000000000000009',$,$,$,#22,#32);",
        ]);

        // Act
        const { recipe } = modelRecipe(modelOf(model), undefined, 1, 0.5);
        const voids = recipe.roots.map((root) => recipe.nodes[root.node]);
        const openings = voids.map((node) => (node?.op === "voids" ? node.openings : undefined));

        // Assert
        expect(voids.map((node) => node?.op)).toEqual(["voids", "voids"]);
        expect(openings[0]).toHaveLength(1);
        expect(openings[1]).toEqual(openings[0]);
    });
});
