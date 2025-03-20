// this file is used to generate a custom build yml file by reading source code "this.occ." references of the classes in use. This makes sure that
// the occ build on the production is of smaller file size than complete library.

// docker run --rm -it -v "$(pwd):/src" -u "$(id -u):$(id -g)" donalffons/opencascade.js bitbybit-dev-occt.yml
import { resolve } from "path";
import { readdir } from "fs/promises";
import fs from "fs";

start();

const numberedClasses = [];
for (let i = 1; i < 40; i++) {
    numberedClasses.push(`${i}`);
}

const splitChars = [
    ".", "(", " "
];

async function start() {
    const files = await getFiles("./lib/services/");
    const results = [
        "XCAFApp_Application",
        "Handle_XCAFApp_Application",
        "XCAFDoc_Location",
        "Geom2dConvert_CompCurveToBSplineCurve",
        "XCAFDoc_Material",
        "NCollection_BaseSequence",
        "XCAFDoc_ColorTool",
        "TDataStd_Name",
        "TopoDS_Vertex",
        "TDF_LabelSequence",
        "RWGltf_CafWriter",
        "BRepBuilderAPI_GTransform",
        "RWMesh_TriangulationSource",
        "Standard_Transient",
        "Standard_GUID",
        "TopoDS_Builder",
        "TopoDS_Iterator",
        "BRepBuilderAPI_MakeShape",
        "BRepPrimAPI_MakeSweep",
        "BRepPrimAPI_MakeOneAxis",
        "BRepAlgoAPI_BooleanOperation",
        "BRepBuilderAPI_Transform",
        "BRepFilletAPI_LocalOperation",
        "BRepBuilderAPI_Command",
        "BRepAlgoAPI_BuilderAlgo",
        "BRepAlgoAPI_Algo",
        "BRepMesh_DiscretRoot",
        "Bnd_Box",
        "BRepBndLib",
        "Poly_Triangulation",
        "Poly_Triangle",
        "Handle_Poly_PolygonOnTriangulation",
        "NCollection_BaseMap",
        "NCollection_BaseList",
        "GC_Root",
        "Geom2d_Conic",
        "Geom2d_Curve",
        "Geom_Geometry",
        "Geom2d_Geometry",
        "TopoDS_Solid",
        "TopoDS_Shell",
        "Geom_Circle",
        "Geom_Ellipse",
        "ChFi2d",
        "ChFi2d_AnaFilletAlgo",
        "ChFi2d_Builder",
        "ChFi2d_ChamferAPI",
        "ChFi2d_ConstructionError",
        "ChFi2d_FilletAPI",
        "ChFi2d_FilletAlgo",
        "GccAna_Circ2d2TanOn",
        "GccAna_Circ2d2TanRad",
        "GccAna_Circ2d3Tan",
        "GccAna_Circ2dBisec",
        "GccAna_Circ2dTanCen",
        "GccAna_Circ2dTanOnRad",
        "GccAna_CircLin2dBisec",
        "GccAna_CircPnt2dBisec",
        "GccAna_Lin2d2Tan",
        "GccAna_Lin2dBisec",
        "GccAna_Lin2dTanObl",
        "GccAna_Lin2dTanPar",
        "GccAna_Lin2dTanPer",
        "GccAna_LinPnt2dBisec",
        "GccAna_NoSolution",
        "GccAna_Pnt2dBisec",
        "GccEnt",
        "GccEnt_Array1OfPosition",
        "GccEnt_BadQualifier",
        "GccEnt_Position",
        "GccEnt_QualifiedCirc",
        "GccEnt_QualifiedLin",
        "Geom_TrimmedCurve",
        "Geom_Ellipse",
        "Geom_Plane",
        "Geom_Curve",
        "Geom_BoundedCurve",
        "Geom_Conic",
        "Geom_BSplineCurve",
        "GeomPlate_BuildPlateSurface",
        "GeomPlate_CurveConstraint",
        "GeomPlate_PointConstraint",
        "BRepFill_Filling",
        "BRepFeat_SplitShape",
        "BOPAlgo_Algo",
        "BOPAlgo_ArgumentAnalyzer",
        "BOPAlgo_BOP",
        "BOPAlgo_Builder",
        "BOPAlgo_BuilderArea",
        "BOPAlgo_BuilderFace",
        "BOPAlgo_BuilderShape",
        "BOPAlgo_BuilderSolid",
        "BOPAlgo_CellsBuilder",
        "BOPAlgo_CheckResult",
        "BOPAlgo_CheckStatus",
        "BOPAlgo_CheckerSI",
        "BOPAlgo_GlueEnum",
        "BOPAlgo_ListOfCheckResult",
        "BOPAlgo_MakerVolume",
        "BOPAlgo_Operation",
        "BOPAlgo_Options",
        "BOPAlgo_Section",
        "BOPAlgo_SectionAttribute",
        "BOPAlgo_ShellSplitter",
        "BOPAlgo_Splitter",
        "BOPAlgo_Tools",
        "BOPAlgo_WireEdgeSet",
        "BOPAlgo_WireSplitter",
        "GeomLProp_SLProps",
        "gp",
        "gp_XYZ",
        "gp_XY",
        "gp_Circ",
        "gp_Circ2d",
        "gp_Lin",
        "gp_Lin2d",
        "gp_Elips",
        "gp_Elips2d",
        "gp_Cylinder",
        "gp_GTrsf",
        "GeomLib",
        "GeomAPI",
        "GeomAPI_PointsToBSpline",
        "GeomAPI_ProjectPointOnCurve",
        "Geom_BezierCurve",
        "BitByBitDev",
        "gp_Trsf2d",
        "gp_GTrsf2d",
        "Handle_Poly_Triangulation",
        "Handle_Geom_Curve",
        "Handle_Geom_Circle",
        "Handle_Geom_Ellipse",
        "Handle_Geom_Surface",
        "Handle_Geom_Plane",
        "Handle_Geom_Conic",
        "Handle_Geom2d_Curve",
        "Handle_Geom_TrimmedCurve",
        "Handle_Geom2d_TrimmedCurve",
        "Handle_Geom_BSplineCurve",
        "Handle_Geom_BezierCurve",
        "Handle_GeomPlate_CurveConstraint",
        "Handle_GeomPlate_PointConstraint",
        "Poly_PolygonOnTriangulation",
        "Poly_Array1OfTriangle",
        "TColgp_Array1OfPnt2d",
        "TColgp_Array2OfPnt",
        "TColStd_Array1OfBoolean",
        "TColStd_Array1OfReal",
        "TColgp_Array1OfVec",
        "TColStd_Array1OfInteger",
        "Precision",
        "Geom2d_Line",
        "Handle_Geom2d_BoundedCurve",
        "Geom2d_BezierCurve",
        "Handle_Geom2d_BezierCurve",
        "Geom2d_BSplineCurve",
        "Handle_Geom2d_BSplineCurve",
        "Handle_Geom2d_Geometry",
        "Handle_Geom2d_Ellipse",
        "Geom2d_Circle",
        "Handle_Geom2d_Circle",
        "Handle_Geom2d_Line",
        "gp_Elips2d",
        "Approx_ParametrizationType",
        "Geom2d_OffsetCurve",
        "Geom2d_Point",
        "Geom2d_Parabola",
        "Geom2d_Transformation",
        "Geom2d_CartesianPoint",
        "Geom2d_Direction",
        "Geom2d_Hyperbola",
        "Geom2dAPI_Interpolate",
        "Geom2d_Vector",
        "Geom2d_VectorWithMagnitude",
        "Geom2dAPI_PointsToBSpline",
        "Geom2dAPI_ExtremaCurveCurve",
        "Geom2dAPI_InterCurveCurve",
        "Geom2dAPI_ProjectPointOnCurve",
        "GCE2d_MakeArcOfCircle",
        "GCE2d_MakeArcOfEllipse",
        "TCollection_AsciiString",
        "Handle_TDocStd_Document",
        "TDocStd_Document",
        "CDM_Document",
        "TColStd_IndexedDataMapOfStringString",
        "TCollection_ExtendedString",
        "XCAFDoc_DocumentTool",
        "Handle_XCAFDoc_DocumentTool",
        "TDataStd_GenericEmpty",
        "TDF_Attribute",
        "gp_Mat",
        "XCAFDoc_ShapeTool",
        "XCAFDoc_VisMaterialTool",
        "Handle_XCAFDoc_VisMaterialTool",
        "TDF_Attribute",
        "XCAFDoc_VisMaterial",
        "Handle_XCAFDoc_VisMaterial",
        "XCAFDoc_VisMaterialPBR",
        "Quantity_ColorRGBA",
        "Quantity_Color",
        "Geom_ElementarySurface",
        "Geom2d_BoundedCurve",
        "Handle_XCAFDoc_ShapeTool",
        "BRepBuilderAPI_MakePolygon",
        "GCE2d_Root",
        "BRepGProp",
        "BRepGProp_Face",
        "GProp_GProps",
        "GC_MakeArcOfEllipse",
        "Adaptor3d_Curve",
        "Adaptor3d_Surface",
        "StlAPI_Writer",
        "Handle_Law_Function",
        "BRepProj_Projection",
        "Law_Function",
        "Law_Linear",
        "Law_Composite",
        "Law_Interpol",
        "Law_BSpFunc",
        "TopTools_ListOfShape",
        "TopTools_SequenceOfShape",
        "Law_S",
        "TDataStd",
        "TDataStd_GenericExtString",
        "BRepExtrema_DistShapeShape",
        "BRepExtrema_DistanceSS",
        "BRepExtrema_ElementFilter",
        "BRepExtrema_ExtCC",
        "BRepExtrema_ExtCF",
        "BRepExtrema_ExtFF",
        "BRepExtrema_ExtPC",
        "BRepExtrema_ExtPF",
        "BRepExtrema_OverlapTool",
        "BRepExtrema_Poly",
        "BRepExtrema_SelfIntersection",
        "BRepExtrema_SeqOfSolution",
        "BRepExtrema_ShapeProximity",
        "BRepExtrema_SolutionElem",
        "BRepExtrema_SupportType",
        "BRepExtrema_TriangleSet",
        "BRepBuilderAPI_MakeVertex",
        "BRepBuilderAPI_Copy",
        "BRepBuilderAPI_MakeSolid",
        "BRepBuilderAPI_TransitionMode",
        "BRepBuilderAPI_Sewing",
        "BRepCheck_Analyzer",
        "BRepPrimAPI_MakeTorus",
        "BRepPrimAPI_MakeRevolution",
        "BRepOffsetAPI_MakeFilling",
        "BRepOffsetAPI_MakePipe",
        "BRepOffsetAPI_MiddlePath",
        "BRepOffsetAPI_MakeDraft",
        "BRepOffsetAPI_MakeEvolved",
        "BRepClass3d_SolidClassifier",
        "BRepClass3d_SClassifier",
        "BRepClass3d_SolidExplorer",
        "BRepClass_FaceClassifier",
        "BRepClass_FClassifier",
        "BRepClass_Edge",
        "BRepFeat_MakeDPrism",
        "BRepFeat_Form",
        "BRepFeat_Builder",
        "BRepFeat_MakeCylindricalHole",
        "ChFiDS_ChamfMode",
        "Extrema_ExtAlgo",
        "ShapeFix_Root",
        "ShapeFix_Solid",
        "ShapeFix_Face",
        "ShapeFix_Wire",
        "XSControl_Reader",
        "StlAPI_Reader",
        "StlAPI",
        "TNaming_NamedShape",
        "TopTools_IndexedMapOfShape",
        "RWGltf_CafWriter",
        "Standard_Transient",
        "TCollection_AsciiString",
        "Handle_TDocStd_Document",
        "Handle_TDF_Attribute",
        "TDocStd_Document",
        "CDM_Document",
        "TColStd_IndexedDataMapOfStringString",
        "Message_ProgressRange",
        "TCollection_ExtendedString",
        "XCAFDoc_DocumentTool",
        "TDataStd_GenericEmpty",
        "TDF_Attribute",
        "BRepMesh_IncrementalMesh",
        "BRepMesh_DiscretRoot",
        "BRepPrimAPI_MakeBox",
        "BRepBuilderAPI_MakeShape",
        "BRepBuilderAPI_Command",
        "BRepPrimAPI_MakeSphere",
        "BRepPrimAPI_MakeOneAxis",
        "BRepAlgoAPI_Cut",
        "BRepAlgoAPI_BooleanOperation",
        "BRepAlgoAPI_BuilderAlgo",
        "BRepAlgoAPI_Algo",
        "BRepAlgoAPI_Section",
        "ShapeFix_Shape",
        "ShapeFix_Solid",
        "ShapeFix_Shell",
        "ShapeFix_Face",
        "ShapeFix_Wire",
        "ShapeFix_Edge",
        "ShapeExtend_Status",
        "TopTools_MapOfShape",
        "gp_Trsf",
        "gp_Vec",
        "TopLoc_Location",
        "BRepAlgoAPI_Fuse",
        "TopoDS_Iterator",
        "XCAFDoc_VisMaterialTool",
        "Handle_XCAFDoc_VisMaterialTool",
        "TDF_Attribute",
        "XCAFDoc_VisMaterial",
        "Handle_XCAFDoc_VisMaterial",
        "XCAFDoc_VisMaterialPBR",
        "Quantity_ColorRGBA",
        "gp_Pnt",
        "TopoDS_Shape",
        "GC_MakeArcOfCircle",
        "GC_Root",
        "GC_MakeSegment",
        "GC_MakeArcOfCircle",
        "BRepBuilderAPI_MakeEdge",
        "Geom_Curve",
        "Geom_Geometry",
        "GeomFill_Trihedron",
        "Handle_Geom_Curve",
        "BRepBuilderAPI_MakeWire",
        "TopoDS_Edge",
        "BRepBuilderAPI_Transform",
        "BRepBuilderAPI_ModifyShape",
        "TopoDS_Wire",
        "BRepBuilderAPI_MakeFace",
        "BRepPrimAPI_MakePrism",
        "BRepPrimAPI_MakeSweep",
        "BRepFilletAPI_MakeChamfer",
        "BRepFilletAPI_MakeFillet",
        "BRepFilletAPI_LocalOperation",
        "ChFi3d_FilletShape",
        "TopAbs_ShapeEnum",
        "TopAbs_State",
        "TopExp_Explorer",
        "TDF_Label",
        "TopoDS",
        "gp",
        "BRepPrimAPI_MakeCylinder",
        "BRep_Tool",
        "Geom_Surface",
        "Handle_Geom_Surface",
        "Handle_Geom_Plane",
        "Geom_Plane",
        "Geom_ElementarySurface",
        "BRepOffsetAPI_MakeThickSolid",
        "BRepOffsetAPI_MakeOffsetShape",
        "BRepOffset_Mode",
        "GeomAbs_JoinType",
        "Geom_CylindricalSurface",
        "gp_Pnt2d",
        "gp_Dir2d",
        "gp_Ax2d",
        "Geom2d_Ellipse",
        "Geom2d_Conic",
        "Geom2d_Curve",
        "Geom2d_TrimmedCurve",
        "Geom2d_BoundedCurve",
        "Handle_Geom2d_Curve",
        "BRepLib",
        "GeomAbs_Shape",
        "BRepOffsetAPI_ThruSections",
        "Handle_XCAFDoc_ShapeTool",
        "TopoDS_Compound",
        "BRep_Builder",
        "gp_Ax1",
        "NCollection_BaseMap",
        "gp_Dir",
        "Handle_Geom_TrimmedCurve",
        "BRepBuilderAPI_MakePolygon",
        "Geom_TrimmedCurve",
        "Geom_BoundedCurve",
        "TopoDS_Face",
        "gp_Ax2",
        "NCollection_BaseList",
        "gp_Ax3",
        "GCE2d_MakeSegment",
        "Geom2d_Geometry",
        "GCE2d_Root",
        "Handle_Geom2d_TrimmedCurve",
        "TopoDS_Builder",
        "Extrema_ExtFlag",
        "BRepAdaptor_Curve",
        "BRepAlgoAPI_Common",
        "BRepBuilderAPI_MakeShell",
        "BRepBuilderAPI_WireError",
        "BRepTools",
        "BRepTools_WireExplorer",
        "GCPnts_TangentialDeflection",
        "GC_MakeCircle",
        "GC_MakeEllipse",
        "Poly_Connect",
        "StdPrs_ToolTriangulatedShape",
        "TColgp_Array1OfDir",
        "TopAbs_Orientation",
        "gp_Ax22d",
        "gp_Pln",
        "gp_Vec2d",
        "TopOpeBRepTool",
        "TopOpeBRepTool_PurgeInternalEdges",
        "TopTools_DataMapOfShapeListOfShape",
        "TopTools_IndexedDataMapOfShapeListOfShape"
    ];
    files.forEach(file => {
        const data = fs.readFileSync(file, "utf8");
        var lines = data.split("\n");
        lines.forEach(line => {
            if (line.includes("from 'opencascade.js'") && !line.includes("//")) {
                let remaining = line.split("{")[1];
                remaining = remaining.split("}")[0];
                const inputs = remaining.split(",");
                inputs.forEach(inp => {
                    let r = inp.replaceAll(" ", "");
                    if (r.includes("_")) {
                        const splitRes = r.split("_");
                        const lastPart = splitRes[splitRes.length - 1];
                        if (!isNaN(lastPart)) {
                            r = r.replace(`_${lastPart}`, "");
                        }
                    }
                    if (r !== "OpenCascadeInstance") {
                        results.push(r);
                    }
                });
            }

            if (line.includes("this.occ") && !line.includes("//")) {
                const remainder = line.split("this.occ.")[1];
                if (remainder) {
                    const letters = remainder.split("");
                    const symbols = [];
                    for (let j = 0; j < letters.length; j++) {
                        const letter = letters[j];
                        if (!splitChars.some(c => c === letter)) {
                            symbols.push(letter);
                        } else {
                            break;
                        }
                    }

                    let res = symbols.join("");

                    if (res.includes("_")) {
                        const splitRes = res.split("_");
                        const lastPart = splitRes[splitRes.length - 1];
                        if (!isNaN(lastPart)) {
                            res = res.replace(`_${lastPart}`, "");
                        }
                    }
                    if (res !== "FS") {
                        results.push(res);
                    }
                }
            }
        });
    });
    const set = new Set(results);
    const arraySetResult = Array.from(set);
    const sorted = arraySetResult.sort();

    const head = `  mainBuild:
    name: bitbybit-dev-occt.js
    bindings:\n`;

    let symbols = "";
    sorted.forEach(s => {
        symbols += `      - symbol: ${s}\n`;
    });

    const footer = `    emccFlags:
    - -O3
    - -sEXPORT_ES6=1
    - -sUSE_ES6_IMPORT_META=0
    - -sEXPORTED_RUNTIME_METHODS=['FS']
    - -sINITIAL_MEMORY=100MB
    - -sMAXIMUM_MEMORY=4GB
    - -sALLOW_MEMORY_GROWTH=1
    - -sUSE_FREETYPE=1
`;
    const additionalcpp = `  additionalCppCode: |
    #include <GeomAPI_Interpolate.hxx>
    #include <TColgp/TColgp_Array1OfPnt.hxx>
    #include <TColgp/TColgp_HArray1OfPnt.hxx>
    #include <BRepFeat_SplitShape.hxx>
    #include <TopTools_SequenceOfShape.hxx>
    #include <TopoDS_Shape.hxx>
    #include <vector>
    
    typedef Handle(IMeshTools_Context) Handle_IMeshTools_Context;
    class BitByBitDev {
    public:
        static Handle(Geom_BSplineCurve) BitInterpolate(
            const TColgp_Array1OfPnt& points,
            const Standard_Boolean periodic,
            const Standard_Real tolerance) {
                TColgp_HArray1OfPnt hpoints(points.Lower(), points.Upper());
                for (Standard_Integer i = points.Lower(); i <= points.Upper(); i++) {
                hpoints.SetValue(i, points.Value(i));
                }
                Handle(TColgp_HArray1OfPnt) hpoints_handle = new TColgp_HArray1OfPnt(hpoints);
                GeomAPI_Interpolate interp(hpoints_handle, periodic, tolerance);
                interp.Perform();
                return interp.Curve();
            }
    public:
        static std::string ConvertAsciiString(const TCollection_AsciiString& s) {
            return s.ToCString();
        }
    public:
        static std::string GetExceptionMessage(intptr_t exceptionPtr) {
            return std::string(reinterpret_cast<std::exception *>(exceptionPtr)->what());
        }
    public:
        static TopoDS_Shape BitSplit(const TopoDS_Shape& shape, const TopTools_ListOfShape& shapesToSplitWith)
        {
            TopTools_SequenceOfShape shapesToSplitWithSequence;
            for (TopTools_ListIteratorOfListOfShape it(shapesToSplitWith); it.More(); it.Next()) {
                shapesToSplitWithSequence.Append(it.Value());
            }

            BRepFeat_SplitShape splitShape;
            splitShape.Init(shape);
            splitShape.Add(shapesToSplitWithSequence);
            splitShape.Build();
            return splitShape.Shape();
        }
    public:
        static TopoDS_Compound BitListOfShapesToCompound(const TopTools_ListOfShape& shapesToSplitWith) {
            BRep_Builder builder;
            TopoDS_Compound compound;
            builder.MakeCompound(compound); // Initialize the compound shape

            try {
                for (TopTools_ListIteratorOfListOfShape it(shapesToSplitWith); it.More(); it.Next()) {
                    builder.Add(compound, it.Value()); // Add each shape to the compound
                }
            } catch (...) {
                return TopoDS_Compound(); // Return an empty compound on failure
            }

            return compound; // Return the resulting compound shape
        }
    };
    `;

    fs.writeFileSync("./bitbybit-dev-occt/bitbybit-dev-occt.yml", head + symbols + footer + additionalcpp);

    // console.log('original has and mine does not have')
    // const x = getDonalfsonsExampleList();
    // x.forEach(i => {
    //     if (!sorted.some(s => i === s)) {
    //         console.log(i);
    //     };
    // })


    // console.log('keep has')
    // sorted.forEach(i => {
    //     if (x.some(s => i === s)) {
    //         console.log(i);
    //     };
    // })

}

async function getFiles(dir) {
    const dirents = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
        const res = resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res) : res;
    }));
    return Array.prototype.concat(...files);
}

function getDonalfsonsExampleList() {
    return [

    ];
}




