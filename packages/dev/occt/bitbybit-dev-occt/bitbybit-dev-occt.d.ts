/**
 * BitbybitOcct - OCCT WebAssembly Bindings
 * TypeScript definitions for Open CASCADE Technology WASM module
 * 
 * @packageDocumentation
 */

// =============================================================================
// Emscripten File System Types
// =============================================================================

export interface EmscriptenFS {
  readFile(path: string, opts?: { encoding?: string; flags?: string }): string | Uint8Array;
  writeFile(path: string, data: string | ArrayBufferView, opts?: { encoding?: string; flags?: string }): void;
  unlink(path: string): void;
  mkdir(path: string, mode?: number): void;
  rmdir(path: string): void;
  readdir(path: string): string[];
  stat(path: string): { size: number; mtime: Date; isDirectory(): boolean; isFile(): boolean };
  createDataFile(parent: string, name: string, data: string | ArrayBufferView, canRead: boolean, canWrite: boolean, canOwn?: boolean): void;
}

// =============================================================================
// Module Declaration
// =============================================================================

export interface BitbybitOcctModule {
  // Emscripten File System
  FS: EmscriptenFS;

  // Geometry Primitives - 3D
  gp_XYZ: gp_XYZ_Constructor;
  gp_Pnt: gp_Pnt_Constructor;
  gp_Vec: gp_Vec_Constructor;
  gp_Dir: gp_Dir_Constructor;
  gp_Ax1: gp_Ax1_Constructor;
  gp_Ax2: gp_Ax2_Constructor;
  gp_Ax3: gp_Ax3_Constructor;
  gp_Mat: gp_Mat_Constructor;
  gp_Trsf: gp_Trsf_Constructor;
  gp_Pln: gp_Pln_Constructor;
  gp_Lin: gp_Lin_Constructor;
  gp_Circ: gp_Circ_Constructor;
  gp_Elips: gp_Elips_Constructor;
  gp_GTrsf: gp_GTrsf_Constructor;

  // Geometry Primitives - 2D
  gp_XY: gp_XY_Constructor;
  gp_Pnt2d: gp_Pnt2d_Constructor;
  gp_Vec2d: gp_Vec2d_Constructor;
  gp_Dir2d: gp_Dir2d_Constructor;
  gp_Ax2d: gp_Ax2d_Constructor;
  gp_Ax22d: gp_Ax22d_Constructor;
  gp_Lin2d: gp_Lin2d_Constructor;
  gp_Circ2d: gp_Circ2d_Constructor;
  gp_Elips2d: gp_Elips2d_Constructor;
  gp_Trsf2d: gp_Trsf2d_Constructor;

  // Topological Shapes
  TopoDS_Shape: TopoDS_Shape_Constructor;
  TopoDS_Vertex: TopoDS_Vertex_Constructor;
  TopoDS_Edge: TopoDS_Edge_Constructor;
  TopoDS_Wire: TopoDS_Wire_Constructor;
  TopoDS_Face: TopoDS_Face_Constructor;
  TopoDS_Shell: TopoDS_Shell_Constructor;
  TopoDS_Solid: TopoDS_Solid_Constructor;
  TopoDS_CompSolid: TopoDS_CompSolid_Constructor;
  TopoDS_Compound: TopoDS_Compound_Constructor;

  // Shape Explorer
  TopExp_Explorer: TopExp_Explorer_Constructor;

  // Primitive Creation
  BRepPrimAPI_MakeBox: BRepPrimAPI_MakeBox_Constructor;
  BRepPrimAPI_MakeCylinder: BRepPrimAPI_MakeCylinder_Constructor;
  BRepPrimAPI_MakeSphere: BRepPrimAPI_MakeSphere_Constructor;
  BRepPrimAPI_MakeCone: BRepPrimAPI_MakeCone_Constructor;
  BRepPrimAPI_MakeTorus: BRepPrimAPI_MakeTorus_Constructor;
  BRepPrimAPI_MakePrism: BRepPrimAPI_MakePrism_Constructor;
  BRepPrimAPI_MakeRevol: BRepPrimAPI_MakeRevol_Constructor;
  BRepPrimAPI_MakeWedge: BRepPrimAPI_MakeWedge_Constructor;

  // Boolean Operations
  BRepAlgoAPI_Fuse: BRepAlgoAPI_Fuse_Constructor;
  BRepAlgoAPI_Cut: BRepAlgoAPI_Cut_Constructor;
  BRepAlgoAPI_Common: BRepAlgoAPI_Common_Constructor;
  BRepAlgoAPI_Section: BRepAlgoAPI_Section_Constructor;
  BRepAlgoAPI_Splitter: BRepAlgoAPI_Splitter_Constructor;

  // Shape Building
  BRepBuilderAPI_MakeVertex: BRepBuilderAPI_MakeVertex_Constructor;
  BRepBuilderAPI_MakeEdge: BRepBuilderAPI_MakeEdge_Constructor;
  BRepBuilderAPI_MakeWire: BRepBuilderAPI_MakeWire_Constructor;
  BRepBuilderAPI_MakeFace: BRepBuilderAPI_MakeFace_Constructor;
  BRepBuilderAPI_MakePolygon: BRepBuilderAPI_MakePolygon_Constructor;
  BRepBuilderAPI_Transform: BRepBuilderAPI_Transform_Constructor;
  BRepBuilderAPI_MakeShell: BRepBuilderAPI_MakeShell_Constructor;
  BRepBuilderAPI_MakeSolid: BRepBuilderAPI_MakeSolid_Constructor;
  BRepBuilderAPI_Sewing: BRepBuilderAPI_Sewing_Constructor;
  BRepBuilderAPI_Copy: BRepBuilderAPI_Copy_Constructor;
  BRepBuilderAPI_GTransform: BRepBuilderAPI_GTransform_Constructor;

  // Offset/Pipe/Loft Operations
  BRepOffsetAPI_MakeOffset: BRepOffsetAPI_MakeOffset_Constructor;
  BRepOffsetAPI_MakeOffsetShape: BRepOffsetAPI_MakeOffsetShape_Constructor;
  BRepOffsetAPI_MakeThickSolid: BRepOffsetAPI_MakeThickSolid_Constructor;
  BRepOffsetAPI_ThruSections: BRepOffsetAPI_ThruSections_Constructor;
  BRepOffsetAPI_MakePipe: BRepOffsetAPI_MakePipe_Constructor;
  BRepOffsetAPI_MakePipeShell: BRepOffsetAPI_MakePipeShell_Constructor;

  // Projection
  BRepProj_Projection: BRepProj_Projection_Constructor;

  // Boolean Operations Builder
  BOPAlgo_Builder: BOPAlgo_Builder_Constructor;

  // Fillets and Chamfers
  BRepFilletAPI_MakeFillet: BRepFilletAPI_MakeFillet_Constructor;
  BRepFilletAPI_MakeChamfer: BRepFilletAPI_MakeChamfer_Constructor;

  // BRepFill
  BRepFill_Filling: BRepFill_Filling_Constructor;

  // BRepClass
  BRepClass_FaceClassifier: BRepClass_FaceClassifier_Constructor;

  // Geometry Properties
  GProp_GProps: GProp_GProps_Constructor;

  // Bounding Box
  Bnd_Box: Bnd_Box_Constructor;

  // Meshing
  BRepMesh_IncrementalMesh: BRepMesh_IncrementalMesh_Constructor;
  Poly_Triangle: Poly_Triangle_Constructor;
  Poly_Triangulation: Poly_Triangulation_Constructor;
  Poly_Connect: Poly_Connect_Constructor;
  TopLoc_Location: TopLoc_Location_Constructor;
  
  // Geometry Collections
  TColgp_Array1OfPnt2d: TColgp_Array1OfPnt2d_Constructor;
  TColgp_Array1OfDir: TColgp_Array1OfDir_Constructor;

  // Geometry Surfaces
  Geom_CylindricalSurface: Geom_CylindricalSurface_Constructor;
  
  // Presentation/Visualization helpers
  StdPrs_ToolTriangulatedShape: StdPrs_ToolTriangulatedShape_Static;

  // Data Exchange
  STEPControl_Reader: STEPControl_Reader_Constructor;
  STEPControl_Writer: STEPControl_Writer_Constructor;
  IGESControl_Reader: IGESControl_Reader_Constructor;
  IGESControl_Writer: IGESControl_Writer_Constructor;
  StlAPI_Writer: StlAPI_Writer_Constructor;

  // XCAF (Extended CAD Framework) for Assembly Support
  TDF_Label: TDF_Label_Constructor;
  TDF_LabelSequence: TDF_LabelSequence_Constructor;
  Standard_GUID: Standard_GUID_Constructor;
  Quantity_Color: Quantity_Color_Constructor;
  Quantity_ColorRGBA: Quantity_ColorRGBA_Constructor;
  Quantity_TypeOfColor: Quantity_TypeOfColor;
  XCAFDoc_ColorType: XCAFDoc_ColorType;
  TCollection_AsciiString: TCollection_AsciiString_Constructor;
  Handle_TDF_Attribute: Handle_TDF_Attribute_Constructor;
  Handle_XCAFDoc_ShapeTool: Handle_XCAFDoc_ShapeTool_Constructor;
  Handle_XCAFDoc_ColorTool: Handle_XCAFDoc_ColorTool_Constructor;
  Handle_XCAFDoc_MaterialTool: Handle_XCAFDoc_MaterialTool_Constructor;
  Handle_TDocStd_Document: Handle_TDocStd_Document_Constructor;
  XCAFDoc_ShapeTool: XCAFDoc_ShapeTool_Interface;
  XCAFDoc_ColorTool: XCAFDoc_ColorTool_Interface;
  TDataStd_Name: TDataStd_Name_Constructor;
  TDataStd_Real: TDataStd_Real_Constructor;
  TDataStd_Integer: TDataStd_Integer_Constructor;

  // XCAF Static Functions
  XCAFDoc_DocumentTool_ShapeTool(label: TDF_Label): Handle_XCAFDoc_ShapeTool;
  XCAFDoc_DocumentTool_ColorTool(label: TDF_Label): Handle_XCAFDoc_ColorTool;
  XCAFDoc_DocumentTool_MaterialTool(label: TDF_Label): Handle_XCAFDoc_MaterialTool;
  
  // XCAFDoc_ShapeTool static methods
  XCAFDoc_ShapeTool_IsAssembly(label: TDF_Label): boolean;
  XCAFDoc_ShapeTool_IsReference(label: TDF_Label): boolean;
  XCAFDoc_ShapeTool_IsSimpleShape(label: TDF_Label): boolean;
  XCAFDoc_ShapeTool_IsComponent(label: TDF_Label): boolean;
  XCAFDoc_ShapeTool_IsShape(label: TDF_Label): boolean;
  XCAFDoc_ShapeTool_GetLocation(label: TDF_Label): TopLoc_Location;
  XCAFDoc_ShapeTool_GetShape_1(label: TDF_Label, shape: TopoDS_Shape): boolean;
  XCAFDoc_ShapeTool_GetShape_2(label: TDF_Label): TopoDS_Shape;
  XCAFDoc_ShapeTool_GetReferredShape(label: TDF_Label, referredLabel: TDF_Label): boolean;
  XCAFDoc_ShapeTool_GetComponents(label: TDF_Label, components: TDF_LabelSequence, getSubChilds: boolean): boolean;
  XCAFDoc_ShapeTool_NbComponents(label: TDF_Label, getSubChilds: boolean): number;
  
  // XCAFDoc_ColorTool helpers
  XCAFDoc_ColorTool_GetColor_1(tool: XCAFDoc_ColorTool, label: TDF_Label, color: Quantity_Color): boolean;
  XCAFDoc_ColorTool_GetColor_7(tool: XCAFDoc_ColorTool, shape: TopoDS_Shape, type: EmbindEnumValue, color: Quantity_Color): boolean;
  XCAFDoc_ColorTool_GetColors(tool: XCAFDoc_ColorTool, labels: TDF_LabelSequence): void;
  
  // TDataStd_Name helper
  TDataStd_Name_GetID(): Standard_GUID;
  
  // STEPCAF Reader (reads STEP with assembly structure)
  STEPCAFControl_Reader_ReadFile(filePath: string, appName: string): Handle_TDocStd_Document;

  // BRep Builder
  BRep_Builder: BRep_Builder_Constructor;

  // Static utility classes (namespace-style access)
  BRepBndLib: BRepBndLib_Static;
  BRepTools: BRepTools_Static;
  BRep_Tool: BRep_Tool_Static;

  // Shape Iterators
  BRepTools_WireExplorer: BRepTools_WireExplorer_Constructor;
  TopoDS_Iterator: TopoDS_Iterator_Constructor;
  TopTools_ListOfShape: TopTools_ListOfShape_Constructor;

  // Curve Adaptors
  BRepAdaptor_Curve: BRepAdaptor_Curve_Constructor;
  BRepAdaptor_CompCurve: BRepAdaptor_CompCurve_Constructor;
  GCPnts_TangentialDeflection: GCPnts_TangentialDeflection_Constructor;
  GCPnts_AbscissaPoint: GCPnts_AbscissaPoint_Constructor;

  // Shape Fix / Repair
  ShapeFix_Shape: ShapeFix_Shape_Constructor;
  ShapeFix_Wire: ShapeFix_Wire_Constructor;

  // 2D Fillets
  BRepFilletAPI_MakeFillet2d: BRepFilletAPI_MakeFillet2d_Constructor;
  ChFi2d_FilletAlgo: ChFi2d_FilletAlgo_Constructor;

  // 2D Geometry Construction (GccEnt, GccAna)
  GccEnt_QualifiedCirc: GccEnt_QualifiedCirc_Constructor;
  GccEnt_QualifiedLin: GccEnt_QualifiedLin_Constructor;
  GccAna_Lin2d2Tan: GccAna_Lin2d2Tan_Constructor;
  GccAna_Circ2d2TanRad: GccAna_Circ2d2TanRad_Constructor;

  // Enumerations (embind exports as objects with value properties)
  TopAbs_ShapeEnum: TopAbs_ShapeEnum;
  TopAbs_Orientation: TopAbs_Orientation;
  TopAbs_State: TopAbs_State;
  IFSelect_ReturnStatus: IFSelect_ReturnStatus;
  STEPControl_StepModelType: STEPControl_StepModelType;
  GccEnt_Position: GccEnt_Position;
  GeomFill_Trihedron: GeomFill_Trihedron;
  GeomAbs_Shape: GeomAbs_Shape;
  GeomAbs_JoinType: GeomAbs_JoinType;
  BRepFill_TypeOfContact: BRepFill_TypeOfContact;
  GeomAbs_CurveType: GeomAbs_CurveType;
  BRepBuilderAPI_WireError: BRepBuilderAPI_WireError;
  ChFi3d_FilletShape: ChFi3d_FilletShape;
  BRepOffset_Mode: BRepOffset_Mode;
  Approx_ParametrizationType: Approx_ParametrizationType;

  // TopoDS Downcasting Functions (convert TopoDS_Shape to specific sub-type)
  CastToVertex(shape: TopoDS_Shape): TopoDS_Vertex;
  CastToEdge(shape: TopoDS_Shape): TopoDS_Edge;
  CastToWire(shape: TopoDS_Shape): TopoDS_Wire;
  CastToFace(shape: TopoDS_Shape): TopoDS_Face;
  CastToShell(shape: TopoDS_Shape): TopoDS_Shell;
  CastToSolid(shape: TopoDS_Shape): TopoDS_Solid;
  CastToCompSolid(shape: TopoDS_Shape): TopoDS_CompSolid;
  CastToCompound(shape: TopoDS_Shape): TopoDS_Compound;
  
  // TopoDS_Shape utility functions
  TopoDS_Shape_HashCode(shape: TopoDS_Shape, upperBound?: number): number;
  
  // BRep_Tool functions
  BRep_Tool_Pnt(vertex: TopoDS_Vertex): gp_Pnt;
  BRep_Tool_Tolerance_Vertex(vertex: TopoDS_Vertex): number;
  BRep_Tool_Tolerance_Edge(edge: TopoDS_Edge): number;
  BRep_Tool_Tolerance_Face(face: TopoDS_Face): number;
  BRep_Tool_IsGeometric(edge: TopoDS_Edge): boolean;
  BRep_Tool_Degenerated(edge: TopoDS_Edge): boolean;

  // BRepBuilderAPI_MakeFace factory functions (for surface-based face creation)
  MakeFaceFromFaceSurfaceAndWire(face: TopoDS_Face, wire: TopoDS_Wire, inside: boolean): TopoDS_Face;
  MakeFaceFromFaceSurface(face: TopoDS_Face, tolDegen: number): TopoDS_Face;
  MakeFaceFromWireOnlyPlane(wire: TopoDS_Wire, onlyPlane: boolean): TopoDS_Face;

  // BRepGProp functions
  BRepGProp_LinearProperties(shape: TopoDS_Shape, props: GProp_GProps): void;
  BRepGProp_SurfaceProperties(shape: TopoDS_Shape, props: GProp_GProps): void;
  BRepGProp_VolumeProperties(shape: TopoDS_Shape, props: GProp_GProps): void;

  // Triangulation helpers
  /** Gets the triangulation of a face. Nodes are in local coordinates. */
  GetFaceTriangulation(face: TopoDS_Face): Poly_Triangulation;
  /** Gets the location (transformation) of a face. Use with GetFaceTriangulation to transform nodes to global coordinates. */
  GetFaceLocation(face: TopoDS_Face): TopLoc_Location;

  // Factory functions for alternate constructors (embind can't distinguish by type)
  gp_Dir_fromVec(vec: gp_Vec): gp_Dir;
  gp_Pnt_fromXYZ(xyz: gp_XYZ): gp_Pnt;
  gp_Vec_fromXYZ(xyz: gp_XYZ): gp_Vec;
  gp_Vec_fromPoints(p1: gp_Pnt, p2: gp_Pnt): gp_Vec;

  // GccAna_Lin2d2Tan factory functions (embind can't distinguish 3-param constructors by type)
  /** Line tangent to a circle and passing through a point */
  GccAna_Lin2d2Tan_fromQualifiedCircAndPoint(qualCirc: GccEnt_QualifiedCirc, point: gp_Pnt2d, tolerance: number): GccAna_Lin2d2Tan;
  /** Line tangent to two circles */
  GccAna_Lin2d2Tan_fromTwoQualifiedCirc(qualCirc1: GccEnt_QualifiedCirc, qualCirc2: GccEnt_QualifiedCirc, tolerance: number): GccAna_Lin2d2Tan;

  // GccAna_Circ2d2TanRad factory functions (embind can't distinguish 4-param constructors by type)
  /** Circle tangent to two circles */
  GccAna_Circ2d2TanRad_fromTwoQualifiedCirc(qualCirc1: GccEnt_QualifiedCirc, qualCirc2: GccEnt_QualifiedCirc, radius: number, tolerance: number): GccAna_Circ2d2TanRad;
  /** Circle tangent to a circle and a line */
  GccAna_Circ2d2TanRad_fromQualifiedCircAndLin(qualCirc: GccEnt_QualifiedCirc, qualLin: GccEnt_QualifiedLin, radius: number, tolerance: number): GccAna_Circ2d2TanRad;
  /** Circle tangent to a circle and passing through a point */
  GccAna_Circ2d2TanRad_fromQualifiedCircAndPoint(qualCirc: GccEnt_QualifiedCirc, point: gp_Pnt2d, radius: number, tolerance: number): GccAna_Circ2d2TanRad;
  /** Circle tangent to a line and passing through a point */
  GccAna_Circ2d2TanRad_fromQualifiedLinAndPoint(qualLin: GccEnt_QualifiedLin, point: gp_Pnt2d, radius: number, tolerance: number): GccAna_Circ2d2TanRad;
  /** Circle tangent to two lines */
  GccAna_Circ2d2TanRad_fromTwoQualifiedLin(qualLin1: GccEnt_QualifiedLin, qualLin2: GccEnt_QualifiedLin, radius: number, tolerance: number): GccAna_Circ2d2TanRad;

  // ==========================================================================
  // Output Parameter Wrapper Functions
  // ==========================================================================
  // These functions return typed result structs instead of using reference
  // output parameters (which embind doesn't support).

  // Coordinate extraction (returns CoordResult instead of modifying references)
  gp_Pnt_GetCoord(pnt: gp_Pnt): CoordResult;
  gp_Vec_GetCoord(vec: gp_Vec): CoordResult;
  gp_Dir_GetCoord(dir: gp_Dir): CoordResult;
  gp_XYZ_GetCoord(xyz: gp_XYZ): CoordResult;

  // Edge/curve parameters
  BRep_Tool_GetEdgeParameters(edge: TopoDS_Edge): EdgeCurveResult;
  GetEdgeCurve(edge: TopoDS_Edge): Handle_Geom_Curve;
  EvaluateEdgeCurve(edge: TopoDS_Edge, param: number): CurvePointResult;
  GetEdgeLength(edge: TopoDS_Edge): number;
  
  // Wire/CompCurve helpers
  GetWireLength(wire: TopoDS_Wire): number;
  EvaluateWireAtParam(wire: TopoDS_Wire, param: number): CurvePointResult;
  EvaluateWireAtActualParam(wire: TopoDS_Wire, param: number): CurvePointResult;
  GetPointAtLengthOnWire(wire: TopoDS_Wire, length: number): gp_Pnt;
  GetPointAtLengthOnEdge(edge: TopoDS_Edge, length: number): gp_Pnt;
  GetWireParameterBounds(wire: TopoDS_Wire): UVBoundsResult;
  
  // gp_Trsf helpers
  GetTransformationValue(trsf: gp_Trsf, row: number, col: number): number;
  
  // Bnd_Box helpers
  GetBndBoxCornerMin(box: Bnd_Box): gp_Pnt;
  GetBndBoxCornerMax(box: Bnd_Box): gp_Pnt;
  BRepBndLib_AddToBox(shape: TopoDS_Shape, box: Bnd_Box): void;
  ComputeShapeBoundingBox(shape: TopoDS_Shape): BoundingBoxResult;
  
  // BRepTools helpers
  BRepTools_Clean(shape: TopoDS_Shape): void;
  BRepTools_Clean_Force(shape: TopoDS_Shape, force: boolean): void;
  BRepTools_CleanGeometry(shape: TopoDS_Shape): void;
  
  // BRepLib static functions
  BRepLib_BuildCurves3d(shape: TopoDS_Shape): boolean;
  BRepLib_BuildCurves3d_WithTolerance(shape: TopoDS_Shape, tolerance: number): boolean;
  BRepLib_BuildCurves3d_Full(shape: TopoDS_Shape, tolerance: number, continuity: EmbindEnumValue, maxDegree: number, maxSegment: number): boolean;

  // GCPnts_AbscissaPoint static functions
  GCPnts_AbscissaPoint_Length_Curve(curve: BRepAdaptor_Curve): number;
  GCPnts_AbscissaPoint_Length_CompCurve(curve: BRepAdaptor_CompCurve): number;
  
  // BRep_Tool additional helpers
  BRep_Tool_IsClosed(shape: TopoDS_Shape): boolean;
  BRep_Tool_Triangulation(face: TopoDS_Face, loc: TopLoc_Location): Poly_Triangulation;
  
  // Wire/Curve derivative helpers
  GetDerivativesOnWireAtLength(wire: TopoDS_Wire, length: number): DerivativesResult;
  GetDerivativesOnWireAtParam(wire: TopoDS_Wire, param: number): DerivativesResult;
  GetDerivativesOnEdgeAtParam(edge: TopoDS_Edge, param: number): DerivativesResult;
  
  // Edge creation helpers
  MakeEdgeFromCurve(curve: Handle_Geom_Curve): TopoDS_Edge;
  MakeEdgeFromCurveWithBounds(curve: Handle_Geom_Curve, u1: number, u2: number): TopoDS_Edge;
  MakeEdgeFromTrimmedCurve(curve: Handle_Geom_Curve): TopoDS_Edge;
  
  /**
   * Trim an edge to given parameter bounds
   * Creates a new edge that is a subset of the original edge
   * @param edge The edge to trim
   * @param u1 Start parameter (must be within edge's parameter range)
   * @param u2 End parameter (must be within edge's parameter range)
   * @returns New trimmed edge, or null edge if operation fails
   */
  TrimEdgeToParams(edge: TopoDS_Edge, u1: number, u2: number): TopoDS_Edge;

  // UV parameters on face
  BRep_Tool_GetUVAtVertex(vertex: TopoDS_Vertex, face: TopoDS_Face): UVResult;

  // Properties computation (returns struct instead of using reference params)
  ComputeVolumeProperties(shape: TopoDS_Shape): PropertiesResult;
  ComputeSurfaceProperties(shape: TopoDS_Shape): PropertiesResult;
  ComputeLinearProperties(shape: TopoDS_Shape): PropertiesResult;

  // BRep_Builder wrappers (return shape instead of reference param)
  BRep_Builder_MakeCompound(builder: BRep_Builder): TopoDS_Compound;
  BRep_Builder_MakeWire(builder: BRep_Builder): TopoDS_Wire;
  BRep_Builder_MakeShell(builder: BRep_Builder): TopoDS_Shell;
  BRep_Builder_MakeSolid(builder: BRep_Builder): TopoDS_Solid;
  BRep_Builder_MakeCompSolid(builder: BRep_Builder): TopoDS_CompSolid;

  // ==========================================================================
  // Bounding Box and Shape Utilities
  // ==========================================================================
  
  /** Get axis-aligned bounding box of shape */
  GetBoundingBox(shape: TopoDS_Shape): BoundingBoxResult;

  /** Create a box from corner point and dimensions */
  MakeBoxFromPntAndDims(corner: gp_Pnt, dx: number, dy: number, dz: number): TopoDS_Shape;
  
  /** Create a sphere from gp_Ax2 (axes) and radius. 
   * Factory function because embind can't distinguish (gp_Ax2, double) from (gp_Pnt, double) */
  MakeSphereFromAx2(axes: gp_Ax2, radius: number): BRepPrimAPI_MakeSphere;
  
  /** Create a cone from gp_Ax2 (axes), R1, R2, and height (without angle).
   * Factory function because embind can't distinguish (gp_Ax2, R1, R2, H) from (R1, R2, H, angle) */
  MakeConeFromAx2(axes: gp_Ax2, r1: number, r2: number, height: number): BRepPrimAPI_MakeCone;
  
  /** Fix shape problems (gaps, degeneracies, etc.) */
  ShapeFix_Shape_Perform(shape: TopoDS_Shape): TopoDS_Shape;
  
  /** Unify same-domain faces and edges */
  ShapeUpgrade_UnifySameDomain_Perform(
    shape: TopoDS_Shape, 
    unifyEdges: boolean, 
    unifyFaces: boolean, 
    concatBSplines: boolean
  ): TopoDS_Shape;
  
  /** Sew faces together into shell/solid */
  BRepBuilderAPI_Sewing_Perform(shape: TopoDS_Shape, tolerance: number): TopoDS_Shape;
  
  /** Copy a shape */
  BRepBuilderAPI_Copy_Shape(shape: TopoDS_Shape, copyGeom: boolean): TopoDS_Shape;

  // ==========================================================================
  // Additional Helper Functions
  // ==========================================================================
  
  /** Check if bounding box is thin (flat) in any direction */
  Bnd_Box_IsThin(box: Bnd_Box, tolerance: number): boolean;
  
  /** 
   * Classify a point relative to a solid
   * @param shape The shape (must be a solid)
   * @param point The point to classify
   * @param tolerance Classification tolerance
   * @returns 0=IN, 1=OUT, 2=ON, 3=UNKNOWN
   */
  ClassifyPointInSolid(shape: TopoDS_Shape, point: gp_Pnt, tolerance: number): number;
  
  /** Compute length of a BRepAdaptor_Curve */
  GCPnts_AbscissaPoint_CurveLength(curve: BRepAdaptor_Curve): number;
  
  /** Compute length of a BRepAdaptor_Curve between two parameters */
  GCPnts_AbscissaPoint_CurveLengthBetween(curve: BRepAdaptor_Curve, u1: number, u2: number): number;
  
  /** Compute length of a BRepAdaptor_CompCurve */
  GCPnts_AbscissaPoint_CompCurveLength(curve: BRepAdaptor_CompCurve): number;
  
  /** Compute length of a BRepAdaptor_CompCurve between two parameters */
  GCPnts_AbscissaPoint_CompCurveLengthBetween(curve: BRepAdaptor_CompCurve, u1: number, u2: number): number;
  
  /** Create GCPnts_AbscissaPoint from a CompCurve (alternative constructor) */
  GCPnts_AbscissaPoint_FromCompCurve(curve: BRepAdaptor_CompCurve, abscissa: number, u0: number): GCPnts_AbscissaPoint;
  
  /** Create a gp_Mat from 9 values (row-major) */
  CreateGpMat(a11: number, a12: number, a13: number,
              a21: number, a22: number, a23: number,
              a31: number, a32: number, a33: number): gp_Mat;
  
  /** Get the vectorial part (3x3 matrix) of a transformation */
  gp_Trsf_VectorialPart(trsf: gp_Trsf): gp_Mat;
  
  /** Get the homogeneous vectorial part of a transformation */
  gp_Trsf_HVectorialPart(trsf: gp_Trsf): gp_Mat;
  
  /** Project a wire onto a shape and return the result as a compound */
  ProjectWireOnShape(wire: TopoDS_Wire, shape: TopoDS_Shape, direction: gp_Dir): TopoDS_Compound;
  
  /** Set mode with contact for pipe shell */
  BRepOffsetAPI_MakePipeShell_SetModeWithContact(maker: BRepOffsetAPI_MakePipeShell, isWithContact: boolean, isByCorrectedFrenet: boolean): void;
  
  /** Get the Nth derivative of a BRepAdaptor_Curve at parameter U */
  BRepAdaptor_Curve_DN(curve: BRepAdaptor_Curve, u: number, n: number): gp_Vec;
  
  /** Get the Nth derivative of a BRepAdaptor_CompCurve at parameter U */
  BRepAdaptor_CompCurve_DN(curve: BRepAdaptor_CompCurve, u: number, n: number): gp_Vec;
  
  /** Create a 2D ellipse from axis and radii */
  CreateGeom2d_Ellipse(axis: gp_Ax22d, majorRadius: number, minorRadius: number): Geom2d_Ellipse;
  
  /** Create a 2D circle from axis and radius */
  CreateGeom2d_Circle(axis: gp_Ax22d, radius: number): Geom2d_Circle;
  
  /** Create a 2D line segment */
  CreateGeom2d_Segment(p1: gp_Pnt2d, p2: gp_Pnt2d): Geom2d_TrimmedCurve;
  
  /** Create a trimmed 2D curve from parameters */
  CreateGeom2d_TrimmedCurve(curve: Handle_Geom2d_Curve, u1: number, u2: number): Handle_Geom2d_Curve;
  
  /** Project a point onto a curve and return the closest point and parameter */
  ProjectPointOnCurve(point: gp_Pnt, edge: TopoDS_Edge): CurvePointResult;
  
  /** Project a 3D curve onto a plane to get a 2D curve */
  GeomAPI_To2d(curve: Handle_Geom_Curve, plane: gp_Pln): Geom2d_Curve;
  
  /** Create a 2D fillet between two edges on a face */
  CreateFillet2d(edge1: TopoDS_Edge, edge2: TopoDS_Edge, radius: number): TopoDS_Edge;
  
  /** Convert a TopTools_ListOfShape to a compound shape */
  BitListOfShapesToCompound(shapes: TopTools_ListOfShape): TopoDS_Compound;

  // ==========================================================================
  // Browser-based STEP/IGES/BREP I/O
  // ==========================================================================
  // These functions work with strings for in-browser file operations
  
  /** Read STEP file content from string (in-memory operation for browser) */
  ReadSTEPFromString(stepContent: string): TopoDS_Shape;
  
  /** Write shape to STEP format string (returns STEP file content) */
  WriteSTEPToString(shape: TopoDS_Shape): string;
  
  /** Read IGES file content from string */
  ReadIGESFromString(igesContent: string): TopoDS_Shape;
  
  /** Write shape to IGES format string */
  WriteIGESToString(shape: TopoDS_Shape): string;
  
  /** Read BREP file content from string */
  ReadBREPFromString(brepContent: string): TopoDS_Shape;
  
  /** Write shape to BREP format string */
  WriteBREPToString(shape: TopoDS_Shape): string;

  // ==========================================================================
  // Geometry Construction Helpers - BSpline Curves
  // ==========================================================================
  
  /**
   * Create interpolated BSpline edge through points (non-periodic)
   * The curve passes exactly through all given points
   * @param coords Flat coordinate array [x1,y1,z1,x2,y2,z2,...] - use VectorDouble
   * @returns Edge containing the interpolated BSpline curve
   */
  MakeBSplineEdge(coords: VectorDouble): TopoDS_Edge;
  
  /**
   * Create periodic (closed) interpolated BSpline edge through points
   * The curve passes exactly through all points and smoothly closes back to the first point
   * Creates a C2-continuous periodic curve
   * @param coords Flat coordinate array [x1,y1,z1,x2,y2,z2,...] - use VectorDouble
   * @returns Edge containing the periodic interpolated BSpline curve
   */
  MakePeriodicBSplineEdge(coords: VectorDouble): TopoDS_Edge;
  
  /**
   * Create interpolated BSpline edge with specified tangent directions at endpoints
   * @param coords Flat coordinate array [x1,y1,z1,x2,y2,z2,...] - use VectorDouble
   * @param startTangent Start tangent vector [dx, dy, dz] - use VectorDouble
   * @param endTangent End tangent vector [dx, dy, dz] - use VectorDouble
   * @returns Edge containing the interpolated BSpline curve with tangent constraints
   */
  MakeBSplineEdgeWithTangents(coords: VectorDouble, startTangent: VectorDouble, endTangent: VectorDouble): TopoDS_Edge;
  
  /**
   * Create approximated (smoothed) BSpline edge through points
   * Unlike interpolation, the curve doesn't pass exactly through all points
   * but creates a smoother curve within the specified tolerance
   * @param coords Flat coordinate array [x1,y1,z1,x2,y2,z2,...] - use VectorDouble
   * @param degMin Minimum degree of the BSpline (typically 3)
   * @param degMax Maximum degree of the BSpline (typically 8)
   * @param tolerance Maximum distance from points to curve
   * @returns Edge containing the approximated BSpline curve
   */
  MakeApproxBSplineEdge(coords: VectorDouble, degMin: number, degMax: number, tolerance: number): TopoDS_Edge;
  
  /**
   * Create periodic (closed) BSpline wire through points
   * The wire contains a single periodic edge that smoothly closes
   * @param coords Flat coordinate array [x1,y1,z1,x2,y2,z2,...] - use VectorDouble
   * @returns Wire containing the periodic BSpline edge
   */
  MakePeriodicBSplineWire(coords: VectorDouble): TopoDS_Wire;
  
  /**
   * Create symmetric periodic (closed) BSpline edge through points
   * Uses chord-based tangent constraints to ensure the curve is symmetrical
   * (e.g., 4 points of a square will produce a perfectly symmetric curve like Rhino)
   * @param coords Flat coordinate array [x1,y1,z1,x2,y2,z2,...] - use VectorDouble
   * @returns Edge containing the symmetric periodic BSpline curve
   */
  MakeSymmetricPeriodicBSplineEdge(coords: VectorDouble): TopoDS_Edge;
  
  /**
   * Create symmetric periodic (closed) BSpline wire through points
   * Uses chord-based tangent constraints to ensure the curve is symmetrical
   * (e.g., 4 points of a square will produce a perfectly symmetric curve like Rhino)
   * @param coords Flat coordinate array [x1,y1,z1,x2,y2,z2,...] - use VectorDouble
   * @returns Wire containing the symmetric periodic BSpline edge
   */
  MakeSymmetricPeriodicBSplineWire(coords: VectorDouble): TopoDS_Wire;
  
  /**
   * Create closed BSpline wire through points (alias for MakePeriodicBSplineWire)
   * @param coords Flat coordinate array [x1,y1,z1,x2,y2,z2,...] - use VectorDouble
   * @returns Wire containing the periodic BSpline edge
   */
  MakeClosedBSplineWire(coords: VectorDouble): TopoDS_Wire;
  
  /**
   * Create a Bezier curve edge through control points
   * @param coords Flat coordinate array [x1,y1,z1,x2,y2,z2,...] - control points
   * @returns Edge containing the Bezier curve
   */
  MakeBezierEdge(coords: VectorDouble): TopoDS_Edge;
  
  /**
   * Create a Bezier curve wire through control points
   * @param coords Flat coordinate array [x1,y1,z1,x2,y2,z2,...] - control points
   * @returns Wire containing the Bezier curve edge
   */
  MakeBezierWire(coords: VectorDouble): TopoDS_Wire;
  
  /**
   * Create a weighted (rational) Bezier curve wire through control points with weights
   * @param coords Flat coordinate array [x1,y1,z1,x2,y2,z2,...] - control points
   * @param weights Flat array of weights [w1, w2, ...] - must have same count as points
   * @returns Wire containing the weighted Bezier curve edge
   */
  MakeWeightedBezierWire(coords: VectorDouble, weights: VectorDouble): TopoDS_Wire;
  
  /** Create 2D fillet on wire corners */
  MakeFillet2d(wire: TopoDS_Wire, radius: number): TopoDS_Wire;

  // ==========================================================================
  // Constraint-Driven Edge Construction
  // ==========================================================================
  // These functions create edges (arcs, circles, lines) that satisfy
  // geometric constraints like passing through points or being tangent
  
  /**
   * Create arc of circle edge through three 3D points
   * @param p1 First point (arc start)
   * @param p2 Second point (arc passes through)
   * @param p3 Third point (arc end)
   * @returns Edge containing the arc, or null if construction fails
   */
  MakeArcThrough3Points(p1: gp_Pnt, p2: gp_Pnt, p3: gp_Pnt): TopoDS_Edge;
  
  /**
   * Create arc of circle edge from start point with tangent direction to end point
   * The arc starts at P1, has initial tangent direction V, and ends at P2
   * This is useful for creating smooth transitions with specified initial direction
   * @param p1 Start point of the arc
   * @param tangent Initial tangent direction at start point
   * @param p2 End point of the arc
   * @returns Edge containing the arc, or null if construction fails
   */
  MakeArcWithTangent(p1: gp_Pnt, tangent: gp_Vec, p2: gp_Pnt): TopoDS_Edge;
  
  /**
   * Create arc of circle edge on a given circle between two points
   * The points are projected onto the circle to determine the arc
   * @param circle The circle on which the arc lies
   * @param p1 First point (arc start) - projected onto circle
   * @param p2 Second point (arc end) - projected onto circle
   * @param sense True for counterclockwise, false for clockwise
   * @returns Edge containing the arc, or null if construction fails
   */
  MakeArcOnCircle(circle: gp_Circ, p1: gp_Pnt, p2: gp_Pnt, sense: boolean): TopoDS_Edge;
  
  /**
   * Create arc of circle edge on a given circle from point to angle
   * @param circle The circle on which the arc lies
   * @param p Start point (projected onto circle)
   * @param angle Angular extent in radians
   * @param sense True for counterclockwise, false for clockwise
   * @returns Edge containing the arc, or null if construction fails
   */
  MakeArcOnCircleByAngle(circle: gp_Circ, p: gp_Pnt, angle: number, sense: boolean): TopoDS_Edge;
  
  /**
   * Create arc of circle edge on a given circle between two angles
   * @param circle The circle on which the arc lies
   * @param alpha1 Start angle in radians
   * @param alpha2 End angle in radians
   * @param sense True for counterclockwise, false for clockwise
   * @returns Edge containing the arc, or null if construction fails
   */
  MakeArcOnCircleByAngles(circle: gp_Circ, alpha1: number, alpha2: number, sense: boolean): TopoDS_Edge;
  
  /**
   * Create full circle edge through three points
   * The circle is uniquely determined by three non-collinear points
   * @param p1 First point
   * @param p2 Second point  
   * @param p3 Third point
   * @returns Edge containing the full circle, or null if points are collinear
   */
  MakeCircleThrough3Points(p1: gp_Pnt, p2: gp_Pnt, p3: gp_Pnt): TopoDS_Edge;
  
  /**
   * Create full circle edge from axis and radius
   * @param axis The coordinate system defining center and normal
   * @param radius The circle radius
   * @returns Edge containing the full circle
   */
  MakeCircleEdge(axis: gp_Ax2, radius: number): TopoDS_Edge;
  
  /**
   * Create full circle wire from axis and radius
   * @param axis The coordinate system defining center and normal
   * @param radius The circle radius
   * @returns Wire containing the full circle
   */
  MakeCircleWire(axis: gp_Ax2, radius: number): TopoDS_Wire;
  
  /**
   * Create full ellipse edge from axis and radii
   * @param axis The coordinate system defining center and plane
   * @param majorRadius The major radius (along X direction of axis)
   * @param minorRadius The minor radius (along Y direction of axis)
   * @returns Edge containing the full ellipse
   */
  MakeEllipseEdge(axis: gp_Ax2, majorRadius: number, minorRadius: number): TopoDS_Edge;
  
  /**
   * Create full ellipse wire from axis and radii
   * @param axis The coordinate system defining center and plane
   * @param majorRadius The major radius (along X direction of axis)
   * @param minorRadius The minor radius (along Y direction of axis)
   * @returns Wire containing the full ellipse
   */
  MakeEllipseWire(axis: gp_Ax2, majorRadius: number, minorRadius: number): TopoDS_Wire;
  
  /**
   * Create line edge from point in a direction with specified length
   * @param point Starting point
   * @param direction Direction of the line
   * @param length Length of the edge
   * @returns Edge containing the line segment
   */
  MakeLineEdge(point: gp_Pnt, direction: gp_Dir, length: number): TopoDS_Edge;
  
  /**
   * Create line edge between two points
   * @param p1 Start point
   * @param p2 End point
   * @returns Edge containing the line segment
   */
  MakeLineEdgeBetweenPoints(p1: gp_Pnt, p2: gp_Pnt): TopoDS_Edge;
  
  /**
   * Create edge tangent to circle at specified parameter
   * The tangent line extends in both directions from the tangent point
   * @param circle The circle to be tangent to
   * @param parameter Parameter on circle (0 to 2*PI)
   * @param halfLength Half-length of the tangent edge (total length = 2 * halfLength)
   * @returns Edge representing tangent line to circle at given point
   */
  MakeTangentToCircle(circle: gp_Circ, parameter: number, halfLength: number): TopoDS_Edge;
  
  /**
   * Create edge connecting two edges with G1 (tangent) continuity using BSpline
   * Creates a smooth transition curve that starts tangent to edge1 and ends tangent to edge2
   * This is useful for creating smooth blends or fillets between edges
   * @param edge1 First edge (curve will start tangent to this edge)
   * @param edge2 Second edge (curve will end tangent to this edge)
   * @param useStartOfEdge1 If true, connect from start of edge1; if false, from end
   * @param useStartOfEdge2 If true, connect to start of edge2; if false, to end
   * @returns Edge containing G1-continuous BSpline connecting the edges
   */
  MakeG1ContinuousEdge(edge1: TopoDS_Edge, edge2: TopoDS_Edge, useStartOfEdge1: boolean, useStartOfEdge2: boolean): TopoDS_Edge;
  
  /**
   * Create smooth blend edge between two edges (simplified G1 connection)
   * The blend curve connects the end of edge1 to the start of edge2 with tangent continuity
   * @param edge1 First edge (connects from end)
   * @param edge2 Second edge (connects to start)
   * @param numPoints Number of control points (ignored in current implementation)
   * @returns Edge containing smooth blend curve
   */
  MakeBlendEdge(edge1: TopoDS_Edge, edge2: TopoDS_Edge, numPoints: number): TopoDS_Edge;
  
  /**
   * Create 2D arc of circle through three 2D points (as edge on XY plane)
   * @param x1, y1 First point
   * @param x2, y2 Second point (arc passes through)  
   * @param x3, y3 Third point
   * @returns Edge containing the arc on XY plane at Z=0
   */
  MakeArc2dThrough3Points(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): TopoDS_Edge;
  
  /**
   * Create 2D arc with tangent constraint (as edge on XY plane)
   * Arc starts at (x1, y1), with initial tangent (vx, vy), ends at (x2, y2)
   * @returns Edge containing the arc on XY plane
   */
  MakeArc2dWithTangent(x1: number, y1: number, vx: number, vy: number, x2: number, y2: number): TopoDS_Edge;
  
  // ==========================================================================
  // Distance and Extrema
  // ==========================================================================
  
  /**
   * Compute the closest points between two shapes
   * @param shape1 First shape
   * @param shape2 Second shape
   * @returns VectorDouble of 6 doubles [x1, y1, z1, x2, y2, z2] representing closest points on each shape.
   *          Empty vector if computation fails. Use .size() and .get(i) to access.
   */
  ClosestPointsBetweenShapes(shape1: TopoDS_Shape, shape2: TopoDS_Shape): VectorDouble;
  
  // ==========================================================================
  // Helix and Spiral Wire Creation
  // ==========================================================================
  
  /**
   * Create a helical wire (3D helix)
   * @param axis Axis position and direction for helix (Z direction is up)
   * @param radius Radius of the helix
   * @param pitch Height per complete turn (vertical distance per 360°)
   * @param height Total height of the helix
   * @param clockwise If true, helix winds clockwise when viewed from above
   * @param tolerance Approximation tolerance (default 1e-4)
   * @returns Wire containing the helix, or null wire if construction fails
   */
  MakeHelixWire(axis: gp_Ax3, radius: number, pitch: number, height: number, clockwise: boolean, tolerance: number): TopoDS_Wire;
  
  /**
   * Create a helical wire using number of turns
   * @param axis Axis position and direction for helix
   * @param radius Radius of the helix
   * @param pitch Height per complete turn
   * @param numTurns Number of complete turns
   * @param clockwise If true, helix winds clockwise when viewed from above
   * @param tolerance Approximation tolerance (default 1e-4)
   * @returns Wire containing the helix, or null wire if construction fails
   */
  MakeHelixWireByTurns(axis: gp_Ax3, radius: number, pitch: number, numTurns: number, clockwise: boolean, tolerance: number): TopoDS_Wire;
  
  /**
   * Create a conical (tapered) helix wire
   * @param axis Axis position and direction for helix
   * @param startRadius Starting radius
   * @param endRadius Ending radius (can be larger or smaller than start)
   * @param pitch Height per complete turn
   * @param height Total height
   * @param clockwise If true, helix winds clockwise when viewed from above
   * @param tolerance Approximation tolerance (default 1e-4)
   * @returns Wire containing the tapered helix, or null wire if construction fails
   */
  MakeTaperedHelixWire(axis: gp_Ax3, startRadius: number, endRadius: number, pitch: number, height: number, clockwise: boolean, tolerance: number): TopoDS_Wire;
  
  /**
   * Create a flat (Archimedean) spiral wire
   * Spiral lies in a plane perpendicular to axis direction
   * @param axis Axis - location is center, Z is normal to spiral plane, X is start direction
   * @param startRadius Starting radius from center
   * @param endRadius Ending radius from center
   * @param numTurns Number of complete turns
   * @param clockwise If true, spiral winds clockwise when viewed from above
   * @param tolerance Approximation tolerance (default 1e-4)
   * @returns Wire containing the flat spiral, or null wire if construction fails
   */
  MakeFlatSpiralWire(axis: gp_Ax3, startRadius: number, endRadius: number, numTurns: number, clockwise: boolean, tolerance: number): TopoDS_Wire;
  
  /**
   * Create helix wire with simple parameters (positioned at origin along Z)
   * @param radius Radius of the helix
   * @param pitch Height per complete turn
   * @param height Total height
   * @param clockwise If true, helix winds clockwise when viewed from above
   * @returns Wire containing the helix, or null wire if construction fails
   */
  MakeSimpleHelixWire(radius: number, pitch: number, height: number, clockwise: boolean): TopoDS_Wire;
  
  /**
   * Create flat spiral wire with simple parameters (positioned at origin in XY plane)
   * @param startRadius Starting radius
   * @param endRadius Ending radius
   * @param numTurns Number of complete turns
   * @param clockwise If true, spiral winds clockwise when viewed from above
   * @returns Wire containing the spiral, or null wire if construction fails
   */
  MakeSimpleSpiralWire(startRadius: number, endRadius: number, numTurns: number, clockwise: boolean): TopoDS_Wire;
  
  // ==========================================================================
  // Edge/Wire/Face Subdivision to Points
  // ==========================================================================
  
  /**
   * Subdivide edge into evenly spaced points by count
   * Points are distributed at equal arc-length intervals along the edge
   * @param edge Edge to subdivide
   * @param numPoints Number of points to generate (minimum 2)
   * @returns Flat array [x1,y1,z1, x2,y2,z2, ...] of point coordinates
   */
  SubdivideEdgeToPoints(edge: TopoDS_Edge, numPoints: number): number[];
  
  /**
   * Subdivide edge by maximum segment length
   * Creates points such that no two consecutive points are farther than maxLength apart
   * @param edge Edge to subdivide
   * @param maxLength Maximum distance between consecutive points
   * @returns Flat array [x1,y1,z1, x2,y2,z2, ...] of point coordinates
   */
  SubdivideEdgeByLength(edge: TopoDS_Edge, maxLength: number): number[];
  
  /**
   * Subdivide edge by deflection (chord height tolerance)
   * Creates more points in curved regions, fewer in straight regions
   * @param edge Edge to subdivide
   * @param deflection Maximum allowed distance between curve and chord
   * @returns Flat array [x1,y1,z1, x2,y2,z2, ...] of point coordinates
   */
  SubdivideEdgeByDeflection(edge: TopoDS_Edge, deflection: number): number[];
  
  /**
   * Subdivide edge using tangential deflection (angular + distance criteria)
   * Best for rendering - creates adaptive sampling based on curvature
   * @param edge Edge to subdivide
   * @param angularDeflection Maximum angle between consecutive tangents (radians)
   * @param curvatureDeflection Maximum distance from curve to chord
   * @returns Flat array [x1,y1,z1, x2,y2,z2, ...] of point coordinates
   */
  SubdivideEdgeTangential(edge: TopoDS_Edge, angularDeflection: number, curvatureDeflection: number): number[];
  
  /**
   * Subdivide wire into evenly spaced points
   * Points are distributed evenly along the entire wire length
   * @param wire Wire to subdivide
   * @param numPoints Total number of points along entire wire
   * @returns Flat array [x1,y1,z1, x2,y2,z2, ...] of point coordinates
   */
  SubdivideWireToPoints(wire: TopoDS_Wire, numPoints: number): number[];
  
  /**
   * Subdivide face surface into a UV grid of points
   * Creates a regular grid in parameter space
   * @param face Face to subdivide
   * @param uDivisions Number of divisions in U direction
   * @param vDivisions Number of divisions in V direction
   * @returns Flat array [x1,y1,z1, x2,y2,z2, ...] row-major order (U varies fastest)
   */
  SubdivideFaceToPointsUV(face: TopoDS_Face, uDivisions: number, vDivisions: number): number[];
  
  /**
   * Get UV coordinates and 3D points for face grid
   * @param face Face to subdivide
   * @param uDivisions Number of divisions in U direction
   * @param vDivisions Number of divisions in V direction
   * @returns Flat array [u1,v1,x1,y1,z1, u2,v2,x2,y2,z2, ...] with UV params and 3D coords
   */
  SubdivideFaceToPointsWithUV(face: TopoDS_Face, uDivisions: number, vDivisions: number): number[];
  
  /**
   * Get points along edge with parameter values
   * @param edge Edge to evaluate
   * @param numPoints Number of points
   * @returns Flat array [t1,x1,y1,z1, t2,x2,y2,z2, ...] with param and 3D coords
   */
  SubdivideEdgeToPointsWithParams(edge: TopoDS_Edge, numPoints: number): number[];
  
  // ==========================================================================
  // Face UV Operations
  // ==========================================================================
  
  /**
   * Get UV parameter bounds of a face
   * @param face Face to query
   * @returns UVBoundsResult with UMin, UMax, VMin, VMax
   */
  GetFaceUVBounds(face: TopoDS_Face): UVBoundsResult;
  
  /**
   * Evaluate face surface at UV parameters
   * @param face Face to evaluate
   * @param u U parameter (in face's native parameter space)
   * @param v V parameter (in face's native parameter space)
   * @returns 3D point on face at (U, V)
   */
  EvaluateFaceAtUV(face: TopoDS_Face, u: number, v: number): gp_Pnt;
  
  /**
   * Evaluate face with normalized UV parameters
   * Maps input (u,v) in [0,1]x[0,1] to actual face UV domain
   * @param face Face to evaluate
   * @param u Normalized U parameter (0 to 1)
   * @param v Normalized V parameter (0 to 1)
   * @returns 3D point on face at remapped (U, V)
   */
  EvaluateFaceAtNormalizedUV(face: TopoDS_Face, u: number, v: number): gp_Pnt;
  
  /**
   * Evaluate face with swapped V,U parameters (flip UV to VU)
   * @param face Face to evaluate
   * @param v V parameter (will be used as U internally)
   * @param u U parameter (will be used as V internally)
   * @returns 3D point on face at swapped parameters
   */
  EvaluateFaceAtVU(face: TopoDS_Face, v: number, u: number): gp_Pnt;
  
  /**
   * Subdivide face with remapped UV range
   * Useful for texture mapping or parametric sampling with custom ranges
   * @param face Face to subdivide
   * @param uMin Minimum U value for output grid
   * @param uMax Maximum U value for output grid
   * @param vMin Minimum V value for output grid
   * @param vMax Maximum V value for output grid
   * @param uDivisions Number of U divisions
   * @param vDivisions Number of V divisions
   * @returns Flat array [u1,v1,x1,y1,z1, ...] with remapped UV and 3D coords
   */
  SubdivideFaceRemappedUV(
    face: TopoDS_Face,
    uMin: number, uMax: number,
    vMin: number, vMax: number,
    uDivisions: number, vDivisions: number
  ): number[];
  
  /**
   * Subdivide face with swapped UV (VU order)
   * V varies fastest in output array (transposed from normal UV order)
   * @param face Face to subdivide
   * @param vDivisions Number of divisions in V direction (output X)
   * @param uDivisions Number of divisions in U direction (output Y)
   * @returns Flat array [v1,u1,x1,y1,z1, ...] V varies fastest
   */
  SubdivideFaceFlippedVU(face: TopoDS_Face, vDivisions: number, uDivisions: number): number[];
  
  // ==========================================================================
  // Periodic Curve Seam Adjustment
  // ==========================================================================
  
  /**
   * Get curve/edge properties including periodicity info
   * @param edge Edge to analyze
   * @returns CurvePropertiesResult with parameters, period, closed, etc.
   */
  GetEdgeCurveProperties(edge: TopoDS_Edge): CurvePropertiesResult;
  
  /**
   * Get the geometric type of an edge's underlying curve
   * @param edge Edge to analyze
   * @returns GeomAbs_CurveType enum value
   */
  GetEdgeCurveType(edge: TopoDS_Edge): EmbindEnumValue;
  
  /**
   * Check if an edge is based on a circular curve
   * @param edge Edge to check
   * @returns true if the edge is a circle or arc of circle
   */
  IsEdgeCircular(edge: TopoDS_Edge): boolean;
  
  /**
   * Check if an edge is based on a linear curve
   * @param edge Edge to check
   * @returns true if the edge is a line segment
   */
  IsEdgeLinear(edge: TopoDS_Edge): boolean;
  
  /**
   * Rotate the seam of a periodic BSpline curve
   * Changes where the curve's start/end point is located
   * @param curve Periodic BSpline curve to modify
   * @param newSeamParam New parameter value for the seam (start/end)
   * @returns New BSpline curve with rotated seam, or null if failed
   */
  RotatePeriodicBSplineSeam(curve: Handle_Geom_BSplineCurve, newSeamParam: number): Handle_Geom_BSplineCurve;
  
  /**
   * Create a new edge from periodic edge with rotated seam
   * @param edge Periodic edge to modify
   * @param newSeamParam New parameter value for the seam (normalized 0-1 along curve)
   * @returns New edge with rotated seam, or null edge if failed
   */
  RotatePeriodicEdgeSeam(edge: TopoDS_Edge, newSeamParam: number): TopoDS_Edge;
  
  /**
   * Shift the seam of a periodic edge by a parameter offset
   * @param edge Periodic edge to modify
   * @param paramOffset Amount to shift the seam parameter
   * @returns New edge with shifted seam
   */
  ShiftPeriodicEdgeSeam(edge: TopoDS_Edge, paramOffset: number): TopoDS_Edge;
  
  /**
   * Rotate seam to a point on the curve closest to given point
   * Useful for aligning the seam to a specific feature or location
   * @param edge Periodic edge to modify
   * @param point Point to find nearest location for new seam
   * @returns New edge with seam at closest point to the given point
   */
  RotatePeriodicEdgeSeamToPoint(edge: TopoDS_Edge, point: gp_Pnt): TopoDS_Edge;
  
  // ==========================================================================
  // Geometry Handle Helper Functions
  // ==========================================================================
  
  /**
   * Get surface geometry from a face
   * @param face The face to extract surface from
   * @returns Handle to the surface geometry
   */
  BRep_Tool_Surface(face: TopoDS_Face): Handle_Geom_Surface;
  
  /**
   * Create a face from a surface with tolerance
   * @param surface The surface geometry (raw pointer)
   * @param tolDegen Tolerance for detecting degenerate edges
   * @returns The created face
   */
  MakeFaceFromSurface(surface: Geom_Surface, tolDegen: number): TopoDS_Face;
  
  /**
   * Create a face from a surface and wire boundary
   * @param surface The surface geometry (raw pointer)
   * @param wire The wire defining the face boundary
   * @param inside If true, the wire is inside the surface bounds
   * @returns The created face
   */
  MakeFaceFromSurfaceAndWire(surface: Geom_Surface, wire: TopoDS_Wire, inside: boolean): TopoDS_Face;
  
  /**
   * Estimate normal at a point on a surface
   * @param surface The surface (raw pointer)
   * @param uv The UV parameter point
   * @param precision Precision for estimation
   * @returns The estimated normal direction
   */
  GeomLib_NormEstim(surface: Geom_Surface, uv: gp_Pnt2d, precision: number): gp_Dir;
  
  /**
   * Create an edge from a 2D curve on a surface with parameter bounds
   * @param curve The 2D curve handle wrapper
   * @param surface The surface (raw pointer)
   * @param first First parameter
   * @param last Last parameter
   * @returns The created edge
   */
  MakeEdgeFromGeom2dCurveAndSurfaceBounded(curve: Handle_Geom2d_Curve, surface: Geom_Surface, first: number, last: number): TopoDS_Edge;
  
  /**
   * Create an edge from a 2D curve on a surface
   * @param curve The 2D curve handle wrapper
   * @param surface The surface (raw pointer)
   * @returns The created edge
   */
  MakeEdgeFromGeom2dCurveAndSurface(curve: Handle_Geom2d_Curve, surface: Geom_Surface): TopoDS_Edge;
  
  // Note: GeomAPI_To2d is declared in the OcctOutputWrappers section
  
  /**
   * Evaluate surface point at UV parameters
   * @param surface The surface (raw pointer)
   * @param u U parameter
   * @param v V parameter
   * @returns Point on surface
   */
  Geom_Surface_Value(surface: Geom_Surface, u: number, v: number): gp_Pnt;
  
  // ==========================================================================
  // BRepFill_Filling Helper Functions
  // ==========================================================================
  
  /**
   * Add an edge constraint to BRepFill_Filling
   * @param filling The filling object
   * @param edge The edge to add
   * @param order Continuity order: 0=C0, 1=G1, 2=G2
   * @param isBound Whether this edge is a boundary constraint
   * @returns Constraint index
   */
  BRepFill_Filling_AddEdge(filling: BRepFill_Filling, edge: TopoDS_Edge, order: number, isBound: boolean): number;
  
  /**
   * Add a point constraint to BRepFill_Filling
   * @param filling The filling object
   * @param point The point to add
   * @returns Constraint index
   */
  BRepFill_Filling_AddPoint(filling: BRepFill_Filling, point: gp_Pnt): number;
  
  /**
   * Build the filling surface
   * @param filling The filling object
   */
  BRepFill_Filling_Build(filling: BRepFill_Filling): void;
  
  /**
   * Check if the filling was built successfully
   * @param filling The filling object
   * @returns True if successful
   */
  BRepFill_Filling_IsDone(filling: BRepFill_Filling): boolean;
  
  /**
   * Get the resulting face from the filling
   * @param filling The filling object
   * @returns The created face
   */
  BRepFill_Filling_Face(filling: BRepFill_Filling): TopoDS_Face;
  
  // ==========================================================================
  // Vector Types (for passing arrays to C++)
  // ==========================================================================
  
  /** std::vector<double> for C++ interop */
  VectorDouble: VectorDouble_Constructor;
  
  /** std::vector<int> for C++ interop */
  VectorInt: VectorInt_Constructor;
}

// =============================================================================
// STL Vector Types
// =============================================================================

/**
 * std::vector<double> wrapper for passing coordinate arrays to OCCT
 * Use push_back() to add values, get()/set() to access, size() for length
 */
export interface VectorDouble {
  push_back(value: number): void;
  resize(n: number, value?: number): void;
  size(): number;
  get(index: number): number;
  set(index: number, value: number): boolean;
  delete(): void;
}

export interface VectorDouble_Constructor {
  new(): VectorDouble;
}

/**
 * std::vector<int> wrapper for passing integer arrays to OCCT
 */
export interface VectorInt {
  push_back(value: number): void;
  resize(n: number, value?: number): void;
  size(): number;
  get(index: number): number;
  set(index: number, value: number): boolean;
  delete(): void;
}

export interface VectorInt_Constructor {
  new(): VectorInt;
}

// =============================================================================
// Result Structs for Output Parameters
// =============================================================================
// These structs are used as return types for wrapper functions that need to
// return multiple values (since embind doesn't support reference output params)

/**
 * Result struct for 3D coordinate values (X, Y, Z)
 * Used for extracting coordinates from gp_Pnt, gp_Vec, gp_Dir, gp_XYZ
 */
export interface CoordResult {
  readonly X: number;
  readonly Y: number;
  readonly Z: number;
  readonly IsValid: boolean;
}

/**
 * Result struct for 2D parameter values (U, V)
 * Used for surface parameters and 2D points
 */
export interface UVResult {
  readonly U: number;
  readonly V: number;
  readonly IsValid: boolean;
}

/**
 * Result struct for edge curve parameter range
 * First and Last are the parametric bounds of the curve
 */
export interface EdgeCurveResult {
  readonly First: number;
  readonly Last: number;
  readonly IsValid: boolean;
}

/**
 * Result struct for point + tangent evaluation on a curve
 * Point is the position, Tangent is the first derivative (direction)
 */
export interface CurvePointResult {
  readonly Point: gp_Pnt;
  readonly Tangent: gp_Vec;
  readonly param: number;
  readonly IsValid: boolean;
  delete(): void;
}

/**
 * Result struct for point + derivatives evaluation on a surface
 * Point is the position, DU and DV are partial derivatives
 */
export interface SurfacePointResult {
  readonly Point: gp_Pnt;
  readonly DU: gp_Vec;
  readonly DV: gp_Vec;
  readonly IsValid: boolean;
  delete(): void;
}

/**
 * Result struct for bounding box coordinates
 */
export interface BoundingBoxResult {
  readonly XMin: number;
  readonly YMin: number;
  readonly ZMin: number;
  readonly XMax: number;
  readonly YMax: number;
  readonly ZMax: number;
  readonly IsValid: boolean;
}

/**
 * Result struct for mass properties computation
 * Mass is length/area/volume depending on the property type computed
 */
export interface PropertiesResult {
  readonly Mass: number;
  readonly CentreOfMass: gp_Pnt;
  readonly IsValid: boolean;
  delete(): void;
}

/**
 * Result struct for face UV parameter bounds
 */
export interface UVBoundsResult {
  readonly UMin: number;
  readonly UMax: number;
  readonly VMin: number;
  readonly VMax: number;
  readonly IsValid: boolean;
}

/**
 * Result struct for curve/edge properties
 * Includes information about periodicity and closure
 */
export interface CurvePropertiesResult {
  readonly FirstParam: number;
  readonly LastParam: number;
  readonly IsClosed: boolean;
  readonly IsPeriodic: boolean;
  readonly Period: number;  // Only valid if IsPeriodic is true
  readonly IsValid: boolean;
}

/**
 * Result struct for derivative evaluation on curves/edges
 * Contains D1 (tangent), D2 (curvature), D3 (torsion) vectors as components
 */
export interface DerivativesResult {
  readonly d1x: number;
  readonly d1y: number;
  readonly d1z: number;
  readonly d2x: number;
  readonly d2y: number;
  readonly d2z: number;
  readonly d3x: number;
  readonly d3y: number;
  readonly d3z: number;
  readonly isValid: boolean;
}

// =============================================================================
// Geometry Curve Types (Handle types)
// =============================================================================

/**
 * Handle to a BSpline curve (reference-counted smart pointer)
 * Used for manipulating parametric curves directly
 */
export interface Handle_Geom_BSplineCurve {
  /** Check if handle is null/empty */
  IsNull(): boolean;
  /** Delete the handle (releases reference) */
  delete(): void;
}

/**
 * Geom_Surface - Abstract base class for 3D parametric surfaces
 * Exposed as raw pointer from Handle wrapper
 */
export interface Geom_Surface {
  /** Evaluate surface point at UV parameters */
  Value(U: number, V: number): gp_Pnt;
  /** Check if surface is closed in U direction */
  IsUClosed(): boolean;
  /** Check if surface is closed in V direction */
  IsVClosed(): boolean;
  /** Check if surface is periodic in U direction */
  IsUPeriodic(): boolean;
  /** Check if surface is periodic in V direction */
  IsVPeriodic(): boolean;
  /** Period in U direction (if periodic) */
  UPeriod(): number;
  /** Period in V direction (if periodic) */
  VPeriod(): number;
  /** Get the dynamic type of the surface */
  DynamicType(): unknown;
  /** Delete this object */
  delete(): void;
}

/**
 * Geom_CylindricalSurface - Cylindrical surface
 */
export interface Geom_CylindricalSurface extends Geom_Surface {
  /** Get the radius of the cylinder */
  Radius(): number;
  /** Set the radius of the cylinder */
  SetRadius(R: number): void;
}

export interface Geom_CylindricalSurface_Constructor {
  new(ax3: gp_Ax3, radius: number): Geom_CylindricalSurface;
}

/**
 * Handle to a Geom_Surface (reference-counted smart pointer)
 */
export interface Handle_Geom_Surface {
  /** Check if handle is null/empty */
  IsNull(): boolean;
  /** Get raw pointer to the surface */
  get(): Geom_Surface;
  /** Delete the handle (releases reference) */
  delete(): void;
}

/**
 * Geom_Curve - Abstract base class for 3D parametric curves
 * Exposed as raw pointer from Handle wrapper
 */
export interface Geom_Curve {
  /** Evaluate curve point at parameter */
  Value(U: number): gp_Pnt;
  /** Check if curve is closed */
  IsClosed(): boolean;
  /** Check if curve is periodic */
  IsPeriodic(): boolean;
  /** Period (if periodic) */
  Period(): number;
  /** First parameter of the curve */
  FirstParameter(): number;
  /** Last parameter of the curve */
  LastParameter(): number;
  /** Evaluate curve at parameter - fills gp_Pnt */
  D0(U: number, P: gp_Pnt): void;
  /** Evaluate nth derivative at parameter */
  DN(U: number, N: number): gp_Vec;
  /** Delete this object */
  delete(): void;
}

/**
 * Handle to a Geom_Curve (reference-counted smart pointer)
 */
export interface Handle_Geom_Curve {
  /** Check if handle is null/empty */
  IsNull(): boolean;
  /** Get raw pointer to the curve */
  get(): Geom_Curve;
  /** First parameter of the curve */
  FirstParameter(): number;
  /** Last parameter of the curve */
  LastParameter(): number;
  /** Evaluate point at parameter */
  Value(U: number): gp_Pnt;
  /** Evaluate curve at parameter - fills gp_Pnt */
  D0(U: number, P: gp_Pnt): void;
  /** Evaluate nth derivative at parameter */
  DN(U: number, N: number): gp_Vec;
  /** Check if curve is closed */
  IsClosed(): boolean;
  /** Check if curve is periodic */
  IsPeriodic(): boolean;
  /** Delete the handle (releases reference) */
  delete(): void;
}

/**
 * Geom2d_Curve - Abstract base class for 2D parametric curves
 * Exposed as raw pointer from Handle wrapper
 */
export interface Geom2d_Curve {
  /** Evaluate curve point at parameter */
  Value(U: number): gp_Pnt2d;
  /** First parameter */
  FirstParameter(): number;
  /** Last parameter */
  LastParameter(): number;
  /** Check if curve is closed */
  IsClosed(): boolean;
  /** Check if curve is periodic */
  IsPeriodic(): boolean;
  /** Period (if periodic) */
  Period(): number;
  /** Delete this object */
  delete(): void;
}

/**
 * Handle to a Geom2d_Curve (reference-counted smart pointer)
 */
export interface Handle_Geom2d_Curve {
  /** Check if handle is null/empty */
  IsNull(): boolean;
  /** Get raw pointer to the curve */
  get(): Geom2d_Curve;
  /** Delete the handle (releases reference) */
  delete(): void;
  /** Compute point at parameter u */
  Value(u: number): gp_Pnt2d;
  /** First valid parameter value */
  FirstParameter(): number;
  /** Last valid parameter value */
  LastParameter(): number;
  /** Check if the curve is closed */
  IsClosed(): boolean;
  /** Check if the curve is periodic */
  IsPeriodic(): boolean;
  /** Period for periodic curves */
  Period(): number;
}

/**
 * Geom2d_Ellipse - 2D parametric ellipse curve
 */
export interface Geom2d_Ellipse extends Geom2d_Curve {
  /** Major radius of the ellipse */
  MajorRadius(): number;
  /** Minor radius of the ellipse */
  MinorRadius(): number;
  /** Set major radius of the ellipse */
  SetMajorRadius(r: number): void;
  /** Set minor radius of the ellipse */
  SetMinorRadius(r: number): void;
}

/**
 * Geom2d_Circle - 2D parametric circle curve
 */
export interface Geom2d_Circle extends Geom2d_Curve {
  /** Radius of the circle */
  Radius(): number;
  /** Set radius of the circle */
  SetRadius(r: number): void;
}

/**
 * Geom2d_TrimmedCurve - 2D trimmed curve (portion of another curve)
 */
export interface Geom2d_TrimmedCurve extends Geom2d_Curve {
}

// =============================================================================
// Enumerations (embind exports enums as objects, not TypeScript enums)
// =============================================================================

/** embind enum value type */
export interface EmbindEnumValue {
  readonly value: number;
}

/** TopAbs_ShapeEnum enum object as exported by embind */
export interface TopAbs_ShapeEnum {
  readonly COMPOUND: EmbindEnumValue;
  readonly COMPSOLID: EmbindEnumValue;
  readonly SOLID: EmbindEnumValue;
  readonly SHELL: EmbindEnumValue;
  readonly FACE: EmbindEnumValue;
  readonly WIRE: EmbindEnumValue;
  readonly EDGE: EmbindEnumValue;
  readonly VERTEX: EmbindEnumValue;
  readonly SHAPE: EmbindEnumValue;
}

/** TopAbs_Orientation enum object as exported by embind */
export interface TopAbs_Orientation {
  readonly FORWARD: EmbindEnumValue;
  readonly REVERSED: EmbindEnumValue;
  readonly INTERNAL: EmbindEnumValue;
  readonly EXTERNAL: EmbindEnumValue;
}

/** IFSelect_ReturnStatus enum object as exported by embind */
export interface IFSelect_ReturnStatus {
  readonly RetVoid: EmbindEnumValue;
  readonly RetDone: EmbindEnumValue;
  readonly RetError: EmbindEnumValue;
  readonly RetFail: EmbindEnumValue;
  readonly RetStop: EmbindEnumValue;
}

/** STEPControl_StepModelType enum object as exported by embind */
export interface STEPControl_StepModelType {
  readonly AsIs: EmbindEnumValue;
  readonly ManifoldSolidBrep: EmbindEnumValue;
  readonly BrepWithVoids: EmbindEnumValue;
  readonly FacetedBrep: EmbindEnumValue;
  readonly FacetedBrepAndBrepWithVoids: EmbindEnumValue;
  readonly ShellBasedSurfaceModel: EmbindEnumValue;
  readonly GeometricCurveSet: EmbindEnumValue;
  readonly Hybrid: EmbindEnumValue;
}

/** GccEnt_Position enum object as exported by embind */
export interface GccEnt_Position {
  readonly unqualified: EmbindEnumValue;
  readonly enclosing: EmbindEnumValue;
  readonly enclosed: EmbindEnumValue;
  readonly outside: EmbindEnumValue;
  readonly noqualifier: EmbindEnumValue;
}

/** GccEnt_QualifiedCirc - A qualified 2D circle */
export interface GccEnt_QualifiedCirc {
  Qualified(): gp_Circ2d;
  Qualifier(): EmbindEnumValue;
  IsUnqualified(): boolean;
  IsEnclosing(): boolean;
  IsEnclosed(): boolean;
  IsOutside(): boolean;
  delete(): void;
}
export interface GccEnt_QualifiedCirc_Constructor {
  new(circle: gp_Circ2d, qualifier: EmbindEnumValue): GccEnt_QualifiedCirc;
}

/** GccEnt_QualifiedLin - A qualified 2D line */
export interface GccEnt_QualifiedLin {
  Qualified(): gp_Lin2d;
  Qualifier(): EmbindEnumValue;
  IsUnqualified(): boolean;
  IsEnclosed(): boolean;
  IsOutside(): boolean;
  delete(): void;
}
export interface GccEnt_QualifiedLin_Constructor {
  new(line: gp_Lin2d, qualifier: EmbindEnumValue): GccEnt_QualifiedLin;
}

/** GccAna_Lin2d2Tan - 2D lines tangent to circles and/or passing through points */
export interface GccAna_Lin2d2Tan {
  IsDone(): boolean;
  NbSolutions(): number;
  ThisSolution(index: number): gp_Lin2d;
  delete(): void;
}
export interface GccAna_Lin2d2Tan_Constructor {
  // Line through two points (most common use case)
  new(point1: gp_Pnt2d, point2: gp_Pnt2d, tolerance: number): GccAna_Lin2d2Tan;
}

/** GccAna_Circ2d2TanRad - 2D circles tangent to elements with given radius */
export interface GccAna_Circ2d2TanRad {
  IsDone(): boolean;
  NbSolutions(): number;
  ThisSolution(index: number): gp_Circ2d;
  delete(): void;
}
export interface GccAna_Circ2d2TanRad_Constructor {
  // Circle passing through two points (most common use case)
  new(point1: gp_Pnt2d, point2: gp_Pnt2d, radius: number, tolerance: number): GccAna_Circ2d2TanRad;
}

/** GeomFill_Trihedron enum object as exported by embind */
export interface GeomFill_Trihedron {
  readonly IsCorrectedFrenet: EmbindEnumValue;
  readonly IsFixed: EmbindEnumValue;
  readonly IsFrenet: EmbindEnumValue;
  readonly IsConstantNormal: EmbindEnumValue;
  readonly IsDarboux: EmbindEnumValue;
  readonly IsGuideAC: EmbindEnumValue;
  readonly IsGuidePlan: EmbindEnumValue;
  readonly IsGuideACWithContact: EmbindEnumValue;
  readonly IsGuidePlanWithContact: EmbindEnumValue;
  readonly IsDiscreteTrihedron: EmbindEnumValue;
}

/** TopAbs_State enum object as exported by embind */
export interface TopAbs_State {
  readonly IN: EmbindEnumValue;
  readonly OUT: EmbindEnumValue;
  readonly ON: EmbindEnumValue;
  readonly UNKNOWN: EmbindEnumValue;
}

/** GeomAbs_Shape enum object as exported by embind */
export interface GeomAbs_Shape {
  readonly C0: EmbindEnumValue;
  readonly G1: EmbindEnumValue;
  readonly C1: EmbindEnumValue;
  readonly G2: EmbindEnumValue;
  readonly C2: EmbindEnumValue;
  readonly C3: EmbindEnumValue;
  readonly CN: EmbindEnumValue;
}

/** GeomAbs_JoinType enum object as exported by embind */
export interface GeomAbs_JoinType {
  readonly Arc: EmbindEnumValue;
  readonly Tangent: EmbindEnumValue;
  readonly Intersection: EmbindEnumValue;
}

/** BRepFill_TypeOfContact enum object as exported by embind */
export interface BRepFill_TypeOfContact {
  readonly NoContact: EmbindEnumValue;
  readonly Contact: EmbindEnumValue;
  readonly ContactOnBorder: EmbindEnumValue;
}

/** GeomAbs_CurveType enum object as exported by embind */
export interface GeomAbs_CurveType {
  readonly Line: EmbindEnumValue;
  readonly Circle: EmbindEnumValue;
  readonly Ellipse: EmbindEnumValue;
  readonly Hyperbola: EmbindEnumValue;
  readonly Parabola: EmbindEnumValue;
  readonly BezierCurve: EmbindEnumValue;
  readonly BSplineCurve: EmbindEnumValue;
  readonly OffsetCurve: EmbindEnumValue;
  readonly OtherCurve: EmbindEnumValue;
}

/** BRepBuilderAPI_WireError enum object as exported by embind */
export interface BRepBuilderAPI_WireError {
  readonly WireDone: EmbindEnumValue;
  readonly EmptyWire: EmbindEnumValue;
  readonly DisconnectedWire: EmbindEnumValue;
  readonly NonManifoldWire: EmbindEnumValue;
}

/** ChFi3d_FilletShape enum object as exported by embind */
export interface ChFi3d_FilletShape {
  readonly Rational: EmbindEnumValue;
  readonly QuasiAngular: EmbindEnumValue;
  readonly Polynomial: EmbindEnumValue;
}

/** BRepOffset_Mode enum object as exported by embind */
export interface BRepOffset_Mode {
  readonly Skin: EmbindEnumValue;
  readonly Pipe: EmbindEnumValue;
  readonly RectoVerso: EmbindEnumValue;
}

/** Approx_ParametrizationType enum object as exported by embind */
export interface Approx_ParametrizationType {
  readonly ChordLength: EmbindEnumValue;
  readonly Centripetal: EmbindEnumValue;
  readonly IsoParametric: EmbindEnumValue;
}

// =============================================================================
// gp_XYZ - 3D Coordinates
// =============================================================================

export interface gp_XYZ {
  X(): number;
  Y(): number;
  Z(): number;
  SetX(x: number): void;
  SetY(y: number): void;
  SetZ(z: number): void;
  SetCoord(x: number, y: number, z: number): void;
  Add(other: gp_XYZ): void;
  Added(other: gp_XYZ): gp_XYZ;
  Subtract(other: gp_XYZ): void;
  Subtracted(other: gp_XYZ): gp_XYZ;
  Multiply(scalar: number): void;
  Multiplied(scalar: number): gp_XYZ;
  Divide(scalar: number): void;
  Divided(scalar: number): gp_XYZ;
  Dot(other: gp_XYZ): number;
  Cross(other: gp_XYZ): void;
  Crossed(other: gp_XYZ): gp_XYZ;
  Modulus(): number;
  SquareModulus(): number;
  delete(): void;
}

export interface gp_XYZ_Constructor {
  new(): gp_XYZ;
  new(x: number, y: number, z: number): gp_XYZ;
}

// =============================================================================
// gp_Pnt - 3D Point
// =============================================================================

export interface gp_Pnt {
  X(): number;
  Y(): number;
  Z(): number;
  SetX(x: number): void;
  SetY(y: number): void;
  SetZ(z: number): void;
  SetCoord(x: number, y: number, z: number): void;
  Distance(other: gp_Pnt): number;
  SquareDistance(other: gp_Pnt): number;
  IsEqual(other: gp_Pnt, tolerance: number): boolean;
  Translate(vec: gp_Vec): void;
  Translated(vec: gp_Vec): gp_Pnt;
  Transform(trsf: gp_Trsf): void;
  Transformed(trsf: gp_Trsf): gp_Pnt;
  delete(): void;
}

export interface gp_Pnt_Constructor {
  new(): gp_Pnt;
  new(x: number, y: number, z: number): gp_Pnt;
  new(xyz: gp_XYZ): gp_Pnt;
}

// =============================================================================
// gp_Vec - 3D Vector
// =============================================================================

export interface gp_Vec {
  X(): number;
  Y(): number;
  Z(): number;
  SetX(x: number): void;
  SetY(y: number): void;
  SetZ(z: number): void;
  SetCoord(x: number, y: number, z: number): void;
  Magnitude(): number;
  SquareMagnitude(): number;
  IsEqual(other: gp_Vec, linearTol: number, angularTol: number): boolean;
  IsNormal(other: gp_Vec, angularTol: number): boolean;
  IsParallel(other: gp_Vec, angularTol: number): boolean;
  Angle(other: gp_Vec): number;
  Add(other: gp_Vec): void;
  Added(other: gp_Vec): gp_Vec;
  Subtract(other: gp_Vec): void;
  Subtracted(other: gp_Vec): gp_Vec;
  Multiply(scalar: number): void;
  Multiplied(scalar: number): gp_Vec;
  Divide(scalar: number): void;
  Divided(scalar: number): gp_Vec;
  Cross(other: gp_Vec): void;
  Crossed(other: gp_Vec): gp_Vec;
  Dot(other: gp_Vec): number;
  Normalize(): void;
  Normalized(): gp_Vec;
  Reverse(): void;
  Reversed(): gp_Vec;
  delete(): void;
}

export interface gp_Vec_Constructor {
  new(): gp_Vec;
  new(x: number, y: number, z: number): gp_Vec;
  new(xyz: gp_XYZ): gp_Vec;
  new(p1: gp_Pnt, p2: gp_Pnt): gp_Vec;
}

// =============================================================================
// gp_Dir - 3D Direction (unit vector)
// =============================================================================

export interface gp_Dir {
  X(): number;
  Y(): number;
  Z(): number;
  SetX(x: number): void;
  SetY(y: number): void;
  SetZ(z: number): void;
  SetCoord(x: number, y: number, z: number): void;
  IsEqual(other: gp_Dir, angularTol: number): boolean;
  IsNormal(other: gp_Dir, angularTol: number): boolean;
  IsParallel(other: gp_Dir, angularTol: number): boolean;
  Angle(other: gp_Dir): number;
  Cross(other: gp_Dir): void;
  Crossed(other: gp_Dir): gp_Dir;
  Dot(other: gp_Dir): number;
  Reverse(): void;
  Reversed(): gp_Dir;
  delete(): void;
}

export interface gp_Dir_Constructor {
  new(): gp_Dir;
  new(x: number, y: number, z: number): gp_Dir;
  new(xyz: gp_XYZ): gp_Dir;
  new(vec: gp_Vec): gp_Dir;
}

// =============================================================================
// gp_Ax1 - Axis (point + direction)
// =============================================================================

export interface gp_Ax1 {
  Location(): gp_Pnt;
  Direction(): gp_Dir;
  SetLocation(p: gp_Pnt): void;
  SetDirection(d: gp_Dir): void;
  IsCoaxial(other: gp_Ax1, angularTol: number, linearTol: number): boolean;
  IsNormal(other: gp_Ax1, angularTol: number): boolean;
  IsParallel(other: gp_Ax1, angularTol: number): boolean;
  Angle(other: gp_Ax1): number;
  Reverse(): void;
  Reversed(): gp_Ax1;
  delete(): void;
}

export interface gp_Ax1_Constructor {
  new(): gp_Ax1;
  new(p: gp_Pnt, d: gp_Dir): gp_Ax1;
}

// =============================================================================
// gp_Ax2 - Coordinate System (point + Z direction + X direction)
// =============================================================================

export interface gp_Ax2 {
  Location(): gp_Pnt;
  Direction(): gp_Dir;
  XDirection(): gp_Dir;
  YDirection(): gp_Dir;
  Axis(): gp_Ax1;
  SetLocation(p: gp_Pnt): void;
  SetDirection(d: gp_Dir): void;
  SetXDirection(d: gp_Dir): void;
  SetYDirection(d: gp_Dir): void;
  SetAxis(ax: gp_Ax1): void;
  IsCoplanar(other: gp_Ax2, linearTol: number, angularTol: number): boolean;
  delete(): void;
}

export interface gp_Ax2_Constructor {
  new(): gp_Ax2;
  new(p: gp_Pnt, n: gp_Dir): gp_Ax2;
  new(p: gp_Pnt, n: gp_Dir, vx: gp_Dir): gp_Ax2;
}

// =============================================================================
// gp_Ax3 - Coordinate System (right or left-handed)
// =============================================================================

export interface gp_Ax3 {
  Location(): gp_Pnt;
  Direction(): gp_Dir;
  XDirection(): gp_Dir;
  YDirection(): gp_Dir;
  Axis(): gp_Ax1;
  Ax2(): gp_Ax2;
  SetLocation(p: gp_Pnt): void;
  SetDirection(d: gp_Dir): void;
  SetXDirection(d: gp_Dir): void;
  SetYDirection(d: gp_Dir): void;
  SetAxis(ax: gp_Ax1): void;
  Direct(): boolean;
  delete(): void;
}

export interface gp_Ax3_Constructor {
  new(): gp_Ax3;
  new(ax2: gp_Ax2): gp_Ax3;
  new(p: gp_Pnt, n: gp_Dir): gp_Ax3;
  new(p: gp_Pnt, n: gp_Dir, vx: gp_Dir): gp_Ax3;
}

// =============================================================================
// =============================================================================
// gp_Mat - 3x3 Matrix
// =============================================================================

export interface gp_Mat {
  Value(row: number, col: number): number;
  SetValue(row: number, col: number, value: number): void;
  SetRow(row: number, value: gp_XYZ): void;
  SetCol(col: number, value: gp_XYZ): void;
  Row(row: number): gp_XYZ;
  Column(col: number): gp_XYZ;
  Determinant(): number;
  Invert(): void;
  Inverted(): gp_Mat;
  Multiply(other: gp_Mat): void;
  Multiplied(other: gp_Mat): gp_Mat;
  Transpose(): void;
  Transposed(): gp_Mat;
  delete(): void;
}

export interface gp_Mat_Constructor {
  new(): gp_Mat;
  new(a11: number, a12: number, a13: number,
      a21: number, a22: number, a23: number,
      a31: number, a32: number, a33: number): gp_Mat;
}

// =============================================================================
// gp_Trsf - Transformation (rotation, translation, scale, mirror)
// =============================================================================

export interface gp_Trsf {
  SetMirror(p: gp_Pnt): void;
  SetMirrorAx1(ax: gp_Ax1): void;
  SetMirrorAx2(ax: gp_Ax2): void;
  SetMirrorOnPlane(ax: gp_Ax2): void;
  SetRotation(ax: gp_Ax1, angle: number): void;
  SetScale(p: gp_Pnt, scale: number): void;
  SetTranslation(vec: gp_Vec): void;
  SetTranslationPart(vec: gp_Vec): void;
  SetDisplacement(fromAx: gp_Ax3, toAx: gp_Ax3): void;
  SetValues(a11: number, a12: number, a13: number, a14: number,
            a21: number, a22: number, a23: number, a24: number,
            a31: number, a32: number, a33: number, a34: number): void;
  Value(row: number, col: number): number;
  IsNegative(): boolean;
  ScaleFactor(): number;
  TranslationPart(): gp_XYZ;
  Invert(): void;
  Inverted(): gp_Trsf;
  Multiply(other: gp_Trsf): void;
  Multiplied(other: gp_Trsf): gp_Trsf;
  PreMultiply(other: gp_Trsf): void;
  Transforms(xyz: gp_XYZ): void;
  delete(): void;
}

export interface gp_Trsf_Constructor {
  new(): gp_Trsf;
}

// =============================================================================
// gp_Pln - Infinite Plane
// =============================================================================

export interface gp_Pln {
  Location(): gp_Pnt;
  Position(): gp_Ax3;
  Axis(): gp_Ax1;
  XAxis(): gp_Ax1;
  YAxis(): gp_Ax1;
  SetLocation(p: gp_Pnt): void;
  SetPosition(pos: gp_Ax3): void;
  SetAxis(ax: gp_Ax1): void;
  Distance(p: gp_Pnt): number;
  Contains(p: gp_Pnt, linearTol: number): boolean;
  delete(): void;
}

export interface gp_Pln_Constructor {
  new(): gp_Pln;
  new(pos: gp_Ax3): gp_Pln;
  new(p: gp_Pnt, n: gp_Dir): gp_Pln;
  new(a: number, b: number, c: number, d: number): gp_Pln;
}

// =============================================================================
// gp_Lin - Infinite Line
// =============================================================================

export interface gp_Lin {
  Location(): gp_Pnt;
  Direction(): gp_Dir;
  Position(): gp_Ax1;
  SetLocation(p: gp_Pnt): void;
  SetDirection(d: gp_Dir): void;
  SetPosition(ax: gp_Ax1): void;
  Angle(other: gp_Lin): number;
  Distance(p: gp_Pnt): number;
  SquareDistance(p: gp_Pnt): number;
  Contains(p: gp_Pnt, linearTol: number): boolean;
  delete(): void;
}

export interface gp_Lin_Constructor {
  new(): gp_Lin;
  new(ax: gp_Ax1): gp_Lin;
  new(p: gp_Pnt, d: gp_Dir): gp_Lin;
}

// =============================================================================
// gp_Circ - Circle in 3D Space
// =============================================================================

export interface gp_Circ {
  Location(): gp_Pnt;
  Position(): gp_Ax2;
  Axis(): gp_Ax1;
  XAxis(): gp_Ax1;
  YAxis(): gp_Ax1;
  Radius(): number;
  Area(): number;
  Length(): number;
  SetLocation(p: gp_Pnt): void;
  SetPosition(pos: gp_Ax2): void;
  SetAxis(ax: gp_Ax1): void;
  SetRadius(r: number): void;
  Distance(p: gp_Pnt): number;
  SquareDistance(p: gp_Pnt): number;
  Contains(p: gp_Pnt, linearTol: number): boolean;
  delete(): void;
}

export interface gp_Circ_Constructor {
  new(): gp_Circ;
  new(pos: gp_Ax2, radius: number): gp_Circ;
}

// =============================================================================
// 2D Geometry Primitives
// =============================================================================

export interface gp_XY {
  X(): number;
  Y(): number;
  SetX(x: number): void;
  SetY(y: number): void;
  SetCoord(x: number, y: number): void;
  Add(other: gp_XY): void;
  Added(other: gp_XY): gp_XY;
  Subtract(other: gp_XY): void;
  Subtracted(other: gp_XY): gp_XY;
  Multiply(scalar: number): void;
  Multiplied(scalar: number): gp_XY;
  Modulus(): number;
  SquareModulus(): number;
  Dot(other: gp_XY): number;
  Crossed(other: gp_XY): number;
  delete(): void;
}

export interface gp_XY_Constructor {
  new(): gp_XY;
  new(x: number, y: number): gp_XY;
}

export interface gp_Pnt2d {
  X(): number;
  Y(): number;
  SetX(x: number): void;
  SetY(y: number): void;
  SetCoord(x: number, y: number): void;
  Distance(other: gp_Pnt2d): number;
  SquareDistance(other: gp_Pnt2d): number;
  IsEqual(other: gp_Pnt2d, linearTol: number): boolean;
  Translate(vec: gp_Vec2d): void;
  Translated(vec: gp_Vec2d): gp_Pnt2d;
  delete(): void;
}

export interface gp_Pnt2d_Constructor {
  new(): gp_Pnt2d;
  new(x: number, y: number): gp_Pnt2d;
  new(xy: gp_XY): gp_Pnt2d;
}

export interface gp_Vec2d {
  X(): number;
  Y(): number;
  SetX(x: number): void;
  SetY(y: number): void;
  SetCoord(x: number, y: number): void;
  Magnitude(): number;
  SquareMagnitude(): number;
  Angle(other: gp_Vec2d): number;
  Add(other: gp_Vec2d): void;
  Added(other: gp_Vec2d): gp_Vec2d;
  Subtract(other: gp_Vec2d): void;
  Subtracted(other: gp_Vec2d): gp_Vec2d;
  Multiply(scalar: number): void;
  Multiplied(scalar: number): gp_Vec2d;
  Dot(other: gp_Vec2d): number;
  Crossed(other: gp_Vec2d): number;
  Normalize(): void;
  Normalized(): gp_Vec2d;
  Reverse(): void;
  Reversed(): gp_Vec2d;
  delete(): void;
}

export interface gp_Vec2d_Constructor {
  new(): gp_Vec2d;
  new(x: number, y: number): gp_Vec2d;
  new(xy: gp_XY): gp_Vec2d;
}

export interface gp_Dir2d {
  X(): number;
  Y(): number;
  SetX(x: number): void;
  SetY(y: number): void;
  SetCoord(x: number, y: number): void;
  Angle(other: gp_Dir2d): number;
  Dot(other: gp_Dir2d): number;
  Crossed(other: gp_Dir2d): number;
  Reverse(): void;
  Reversed(): gp_Dir2d;
  delete(): void;
}

export interface gp_Dir2d_Constructor {
  new(): gp_Dir2d;
  new(x: number, y: number): gp_Dir2d;
  new(vec: gp_Vec2d): gp_Dir2d;
}

export interface gp_Ax2d {
  Location(): gp_Pnt2d;
  Direction(): gp_Dir2d;
  SetLocation(p: gp_Pnt2d): void;
  SetDirection(d: gp_Dir2d): void;
  Angle(other: gp_Ax2d): number;
  Reverse(): void;
  Reversed(): gp_Ax2d;
  delete(): void;
}

export interface gp_Ax2d_Constructor {
  new(): gp_Ax2d;
  new(p: gp_Pnt2d, v: gp_Dir2d): gp_Ax2d;
}

export interface gp_Ax22d {
  Location(): gp_Pnt2d;
  XDirection(): gp_Dir2d;
  YDirection(): gp_Dir2d;
  XAxis(): gp_Ax2d;
  YAxis(): gp_Ax2d;
  SetLocation(p: gp_Pnt2d): void;
  SetXDirection(d: gp_Dir2d): void;
  SetYDirection(d: gp_Dir2d): void;
  delete(): void;
}

export interface gp_Ax22d_Constructor {
  new(): gp_Ax22d;
  new(p: gp_Pnt2d, vx: gp_Dir2d, vy: gp_Dir2d): gp_Ax22d;
}

export interface gp_Lin2d {
  Location(): gp_Pnt2d;
  Direction(): gp_Dir2d;
  Position(): gp_Ax2d;
  SetLocation(p: gp_Pnt2d): void;
  SetDirection(d: gp_Dir2d): void;
  Angle(other: gp_Lin2d): number;
  Distance(p: gp_Pnt2d): number;
  Contains(p: gp_Pnt2d, linearTol: number): boolean;
  delete(): void;
}

export interface gp_Lin2d_Constructor {
  new(): gp_Lin2d;
  new(ax: gp_Ax2d): gp_Lin2d;
  new(p: gp_Pnt2d, v: gp_Dir2d): gp_Lin2d;
}

export interface gp_Circ2d {
  Location(): gp_Pnt2d;
  Radius(): number;
  Area(): number;
  SetLocation(p: gp_Pnt2d): void;
  SetRadius(r: number): void;
  Contains(p: gp_Pnt2d, linearTol: number): boolean;
  Distance(p: gp_Pnt2d): number;
  delete(): void;
}

export interface gp_Circ2d_Constructor {
  new(): gp_Circ2d;
  new(ax: gp_Ax2d, radius: number): gp_Circ2d;
}

export interface gp_Elips2d {
  MajorRadius(): number;
  MinorRadius(): number;
  Location(): gp_Pnt2d;
  Area(): number;
  SetMajorRadius(r: number): void;
  SetMinorRadius(r: number): void;
  delete(): void;
}

export interface gp_Elips2d_Constructor {
  new(): gp_Elips2d;
  new(ax: gp_Ax2d, majorRadius: number, minorRadius: number): gp_Elips2d;
}

export interface gp_Trsf2d {
  SetMirror(p: gp_Pnt2d): void;
  SetMirrorAx2d(ax: gp_Ax2d): void;
  SetRotation(p: gp_Pnt2d, angle: number): void;
  SetScale(p: gp_Pnt2d, scale: number): void;
  SetTranslation(vec: gp_Vec2d): void;
  SetTranslationPart(vec: gp_Vec2d): void;
  IsNegative(): boolean;
  ScaleFactor(): number;
  TranslationPart(): gp_XY;
  Invert(): void;
  Inverted(): gp_Trsf2d;
  Multiply(other: gp_Trsf2d): void;
  Multiplied(other: gp_Trsf2d): gp_Trsf2d;
  delete(): void;
}

export interface gp_Trsf2d_Constructor {
  new(): gp_Trsf2d;
}

// =============================================================================
// Additional 3D Geometry Types
// =============================================================================

export interface gp_Elips {
  MajorRadius(): number;
  MinorRadius(): number;
  Location(): gp_Pnt;
  Position(): gp_Ax2;
  Area(): number;
  SetMajorRadius(r: number): void;
  SetMinorRadius(r: number): void;
  SetLocation(p: gp_Pnt): void;
  SetPosition(pos: gp_Ax2): void;
  delete(): void;
}

export interface gp_Elips_Constructor {
  new(): gp_Elips;
  new(pos: gp_Ax2, majorRadius: number, minorRadius: number): gp_Elips;
}

export interface gp_GTrsf {
  SetAffinity(ax: gp_Ax1, ratio: number): void;
  SetValue(row: number, col: number, value: number): void;
  SetVectorialPart(matrix: any): void;
  SetTranslationPart(coord: gp_XYZ): void;
  Value(row: number, col: number): number;
  Invert(): void;
  Inverted(): gp_GTrsf;
  Multiply(other: gp_GTrsf): void;
  Multiplied(other: gp_GTrsf): gp_GTrsf;
  Trsf(): gp_Trsf;
  delete(): void;
}

export interface gp_GTrsf_Constructor {
  new(): gp_GTrsf;
  new(t: gp_Trsf): gp_GTrsf;
}

// =============================================================================
// TopoDS_Shape - Base Topological Shape
// =============================================================================

export interface TopoDS_Shape {
  IsNull(): boolean;
  Nullify(): void;
  ShapeType(): EmbindEnumValue;
  Free(): boolean;
  SetFree(isFree: boolean): void;
  Locked(): boolean;
  SetLocked(isLocked: boolean): void;
  Modified(): boolean;
  SetModified(isModified: boolean): void;
  Checked(): boolean;
  SetChecked(isChecked: boolean): void;
  Orientable(): boolean;
  SetOrientable(isOrientable: boolean): void;
  Closed(): boolean;
  SetClosed(isClosed: boolean): void;
  Infinite(): boolean;
  SetInfinite(isInfinite: boolean): void;
  Convex(): boolean;
  SetConvex(isConvex: boolean): void;
  Orientation(): EmbindEnumValue;
  SetOrientation(orient: EmbindEnumValue): void;
  Oriented(orient: EmbindEnumValue): TopoDS_Shape;
  Reverse(): void;
  Reversed(): TopoDS_Shape;
  Complement(): void;
  Complemented(): TopoDS_Shape;
  Compose(orient: EmbindEnumValue): void;
  Composed(orient: EmbindEnumValue): TopoDS_Shape;
  NbChildren(): number;
  IsEqual(other: TopoDS_Shape): boolean;
  IsSame(other: TopoDS_Shape): boolean;
  IsPartner(other: TopoDS_Shape): boolean;
  IsNotEqual(other: TopoDS_Shape): boolean;
  Location(): TopLoc_Location;
  SetLocation(loc: TopLoc_Location, raiseExc?: boolean): void;
  Located(loc: TopLoc_Location, raiseExc?: boolean): TopoDS_Shape;
  Moved(loc: TopLoc_Location): TopoDS_Shape;
  Move(loc: TopLoc_Location): void;
  delete(): void;
}

export interface TopoDS_Shape_Constructor {
  new(): TopoDS_Shape;
}

// =============================================================================
// TopoDS Sub-shape Types
// =============================================================================

export interface TopoDS_Vertex extends TopoDS_Shape {}
export interface TopoDS_Vertex_Constructor { new(): TopoDS_Vertex; }

export interface TopoDS_Edge extends TopoDS_Shape {}
export interface TopoDS_Edge_Constructor { new(): TopoDS_Edge; }

export interface TopoDS_Wire extends TopoDS_Shape {}
export interface TopoDS_Wire_Constructor { new(): TopoDS_Wire; }

export interface TopoDS_Face extends TopoDS_Shape {}
export interface TopoDS_Face_Constructor { new(): TopoDS_Face; }

export interface TopoDS_Shell extends TopoDS_Shape {}
export interface TopoDS_Shell_Constructor { new(): TopoDS_Shell; }

export interface TopoDS_Solid extends TopoDS_Shape {}
export interface TopoDS_Solid_Constructor { new(): TopoDS_Solid; }

export interface TopoDS_CompSolid extends TopoDS_Shape {}
export interface TopoDS_CompSolid_Constructor { new(): TopoDS_CompSolid; }

export interface TopoDS_Compound extends TopoDS_Shape {}
export interface TopoDS_Compound_Constructor { new(): TopoDS_Compound; }

// =============================================================================
// TopExp_Explorer - Shape Iterator
// =============================================================================

export interface TopExp_Explorer {
  Init(shape: TopoDS_Shape, toFind: EmbindEnumValue, toAvoid?: EmbindEnumValue): void;
  More(): boolean;
  Next(): void;
  Current(): TopoDS_Shape;
  ReInit(): void;
  ExploredShape(): TopoDS_Shape;
  Depth(): number;
  Clear(): void;
  delete(): void;
}

export interface TopExp_Explorer_Constructor {
  new(): TopExp_Explorer;
  new(shape: TopoDS_Shape, toFind: EmbindEnumValue): TopExp_Explorer;
  new(shape: TopoDS_Shape, toFind: EmbindEnumValue, toAvoid: EmbindEnumValue): TopExp_Explorer;
}

// =============================================================================
// BRepTools_WireExplorer - Wire Edge Iterator (edges in order)
// =============================================================================

export interface BRepTools_WireExplorer {
  Init(wire: TopoDS_Wire): void;
  InitWithFace(wire: TopoDS_Wire, face: TopoDS_Face): void;
  More(): boolean;
  Next(): void;
  Current(): TopoDS_Edge;
  Orientation(): EmbindEnumValue;
  CurrentVertex(): TopoDS_Vertex;
  Clear(): void;
  delete(): void;
}

export interface BRepTools_WireExplorer_Constructor {
  new(): BRepTools_WireExplorer;
  new(wire: TopoDS_Wire): BRepTools_WireExplorer;
  new(wire: TopoDS_Wire, face: TopoDS_Face): BRepTools_WireExplorer;
}

// =============================================================================
// TopoDS_Iterator - Sub-shape Iterator
// =============================================================================

export interface TopoDS_Iterator {
  Initialize(shape: TopoDS_Shape): void;
  InitializeWithFlags(shape: TopoDS_Shape, cumOri: boolean, cumLoc: boolean): void;
  More(): boolean;
  Next(): void;
  Value(): TopoDS_Shape;
  delete(): void;
}

export interface TopoDS_Iterator_Constructor {
  new(): TopoDS_Iterator;
  new(shape: TopoDS_Shape): TopoDS_Iterator;
  new(shape: TopoDS_Shape, cumOri: boolean): TopoDS_Iterator;
  new(shape: TopoDS_Shape, cumOri: boolean, cumLoc: boolean): TopoDS_Iterator;
}

// =============================================================================
// TopTools_ListOfShape - List of shapes
// =============================================================================

export interface TopTools_ListOfShape {
  Size(): number;
  IsEmpty(): boolean;
  Clear(): void;
  Append(shape: TopoDS_Shape): void;
  First(): TopoDS_Shape;
  delete(): void;
}

export interface TopTools_ListOfShape_Constructor {
  new(): TopTools_ListOfShape;
}

// =============================================================================
// BRepAdaptor - Curve Adaptors
// =============================================================================

/**
 * Adaptor for extracting curve from edge
 */
export interface BRepAdaptor_Curve {
  Initialize(edge: TopoDS_Edge): void;
  FirstParameter(): number;
  LastParameter(): number;
  Value(u: number): gp_Pnt;
  D0(u: number, p: gp_Pnt): void;
  D1(u: number, p: gp_Pnt, v1: gp_Vec): void;
  D2(u: number, p: gp_Pnt, v1: gp_Vec, v2: gp_Vec): void;
  D3(u: number, p: gp_Pnt, v1: gp_Vec, v2: gp_Vec, v3: gp_Vec): void;
  GetType(): EmbindEnumValue;
  Line(): gp_Lin;
  Circle(): gp_Circ;
  Ellipse(): gp_Elips;
  IsClosed(): boolean;
  IsPeriodic(): boolean;
  Period(): number;
  Degree(): number;
  delete(): void;
}

export interface BRepAdaptor_Curve_Constructor {
  new(): BRepAdaptor_Curve;
  new(edge: TopoDS_Edge): BRepAdaptor_Curve;
}

/**
 * Composite curve adaptor for wire (treats wire as single continuous curve)
 */
export interface BRepAdaptor_CompCurve {
  Initialize(wire: TopoDS_Wire, knotsByBlocks: boolean): void;
  FirstParameter(): number;
  LastParameter(): number;
  Value(u: number): gp_Pnt;
  D0(u: number, p: gp_Pnt): void;
  D1(u: number, p: gp_Pnt, v1: gp_Vec): void;
  D2(u: number, p: gp_Pnt, v1: gp_Vec, v2: gp_Vec): void;
  D3(u: number, p: gp_Pnt, v1: gp_Vec, v2: gp_Vec, v3: gp_Vec): void;
  GetType(): EmbindEnumValue;
  IsClosed(): boolean;
  IsPeriodic(): boolean;
  Period(): number;
  NbIntervals(s: EmbindEnumValue): number;
  delete(): void;
}

export interface BRepAdaptor_CompCurve_Constructor {
  new(): BRepAdaptor_CompCurve;
  new(wire: TopoDS_Wire): BRepAdaptor_CompCurve;
  new(wire: TopoDS_Wire, knotsByBlocks: boolean): BRepAdaptor_CompCurve;
}

/**
 * Tangential deflection point distribution on curve
 */
export interface GCPnts_TangentialDeflection {
  NbPoints(): number;
  Parameter(index: number): number;
  Value(index: number): gp_Pnt;
  delete(): void;
}

export interface GCPnts_TangentialDeflection_Constructor {
  new(curve: BRepAdaptor_Curve, angularDeflection: number, curvatureDeflection: number, 
      minimumOfPoints: number, uTolerance: number, minimumLength: number): GCPnts_TangentialDeflection;
}

/**
 * Point at arc length on curve
 */
export interface GCPnts_AbscissaPoint {
  IsDone(): boolean;
  Parameter(): number;
  delete(): void;
}

export interface GCPnts_AbscissaPoint_Constructor {
  new(curve: BRepAdaptor_Curve, abscissa: number, u0: number): GCPnts_AbscissaPoint;
}

/**
 * Shape healing/repair
 */
export interface ShapeFix_Shape {
  Init(shape: TopoDS_Shape): void;
  Perform(): boolean;
  Shape(): TopoDS_Shape;
  SetPrecision(preci: number): void;
  SetMinTolerance(mintol: number): void;
  SetMaxTolerance(maxtol: number): void;
  FixSolidMode(): number;
  FixFreeShellMode(): number;
  FixFreeFaceMode(): number;
  FixFreeWireMode(): number;
  FixSameParameterMode(): number;
  delete(): void;
}

export interface ShapeFix_Shape_Constructor {
  new(): ShapeFix_Shape;
  new(shape: TopoDS_Shape): ShapeFix_Shape;
}

/**
 * Wire repair
 */
export interface ShapeFix_Wire {
  Init(wire: TopoDS_Wire, face: TopoDS_Face, precision: number): void;
  Load(wire: TopoDS_Wire): void;
  Perform(): boolean;
  Wire(): TopoDS_Wire;
  WireAPIMake(): TopoDS_Wire;
  FixReorder(modeBoth?: boolean): boolean;
  FixConnected(prec?: number): boolean;
  FixClosed(): boolean;
  FixDegenerated(): boolean;
  FixSmall(lockvtx: boolean, precsmall: number): number;
  delete(): void;
}

export interface ShapeFix_Wire_Constructor {
  new(): ShapeFix_Wire;
  new(wire: TopoDS_Wire, face: TopoDS_Face, precision: number): ShapeFix_Wire;
}

/**
 * 2D fillets on planar faces
 */
export interface BRepFilletAPI_MakeFillet2d {
  Init(face: TopoDS_Face): void;
  AddFillet(vertex: TopoDS_Vertex, radius: number): TopoDS_Edge;
  AddChamfer(edge1: TopoDS_Edge, edge2: TopoDS_Edge, d1: number, d2: number): TopoDS_Edge;
  Build(): void;
  IsDone(): boolean;
  Shape(): TopoDS_Shape;
  NbFillet(): number;
  NbChamfer(): number;
  delete(): void;
}

export interface BRepFilletAPI_MakeFillet2d_Constructor {
  new(): BRepFilletAPI_MakeFillet2d;
  new(face: TopoDS_Face): BRepFilletAPI_MakeFillet2d;
}

// =============================================================================
// ChFi2d_FilletAlgo - 2D Fillet Algorithm
// =============================================================================

/**
 * 2D fillet algorithm for creating fillets between edges in a plane
 */
export interface ChFi2d_FilletAlgo {
  Init(wire: TopoDS_Wire, plane: gp_Pln): void;
  Perform(radius: number): boolean;
  NbResults(point: gp_Pnt): number;
  Result(point: gp_Pnt, edge1: TopoDS_Edge, edge2: TopoDS_Edge, index: number): TopoDS_Edge;
  delete(): void;
}

export interface ChFi2d_FilletAlgo_Constructor {
  new(): ChFi2d_FilletAlgo;
  new(wire: TopoDS_Wire, plane: gp_Pln): ChFi2d_FilletAlgo;
  new(edge1: TopoDS_Edge, edge2: TopoDS_Edge, plane: gp_Pln): ChFi2d_FilletAlgo;
}

// =============================================================================
// BRepPrimAPI - Primitive Creation
// =============================================================================

export interface BRepPrimAPI_MakeBox {
  Shape(): TopoDS_Shape;
  Solid(): TopoDS_Solid;
  Shell(): TopoDS_Shell;
  IsDone(): boolean;
  BottomFace(): TopoDS_Face;
  TopFace(): TopoDS_Face;
  FrontFace(): TopoDS_Face;
  BackFace(): TopoDS_Face;
  LeftFace(): TopoDS_Face;
  RightFace(): TopoDS_Face;
  delete(): void;
}

export interface BRepPrimAPI_MakeBox_Constructor {
  new(dx: number, dy: number, dz: number): BRepPrimAPI_MakeBox;
  new(p: gp_Pnt, dx: number, dy: number, dz: number): BRepPrimAPI_MakeBox;
  new(p1: gp_Pnt, p2: gp_Pnt): BRepPrimAPI_MakeBox;
  new(axes: gp_Ax2, dx: number, dy: number, dz: number): BRepPrimAPI_MakeBox;
}

export interface BRepPrimAPI_MakeCylinder {
  Shape(): TopoDS_Shape;
  Solid(): TopoDS_Solid;
  Shell(): TopoDS_Shell;
  IsDone(): boolean;
  delete(): void;
}

export interface BRepPrimAPI_MakeCylinder_Constructor {
  new(r: number, h: number): BRepPrimAPI_MakeCylinder;
  new(r: number, h: number, angle: number): BRepPrimAPI_MakeCylinder;
  new(axes: gp_Ax2, r: number, h: number): BRepPrimAPI_MakeCylinder;
  new(axes: gp_Ax2, r: number, h: number, angle: number): BRepPrimAPI_MakeCylinder;
}

export interface BRepPrimAPI_MakeSphere {
  Shape(): TopoDS_Shape;
  Solid(): TopoDS_Solid;
  Shell(): TopoDS_Shell;
  IsDone(): boolean;
  delete(): void;
}

export interface BRepPrimAPI_MakeSphere_Constructor {
  new(r: number): BRepPrimAPI_MakeSphere;
  new(r: number, angle: number): BRepPrimAPI_MakeSphere;
  new(r: number, angle1: number, angle2: number): BRepPrimAPI_MakeSphere;
  new(r: number, angle1: number, angle2: number, angle3: number): BRepPrimAPI_MakeSphere;
  new(center: gp_Pnt, r: number): BRepPrimAPI_MakeSphere;
  new(axes: gp_Ax2, r: number): BRepPrimAPI_MakeSphere;
}

export interface BRepPrimAPI_MakeCone {
  Shape(): TopoDS_Shape;
  Solid(): TopoDS_Solid;
  Shell(): TopoDS_Shell;
  IsDone(): boolean;
  delete(): void;
}

export interface BRepPrimAPI_MakeCone_Constructor {
  new(r1: number, r2: number, h: number): BRepPrimAPI_MakeCone;
  new(r1: number, r2: number, h: number, angle: number): BRepPrimAPI_MakeCone;
  new(axes: gp_Ax2, r1: number, r2: number, h: number): BRepPrimAPI_MakeCone;
  new(axes: gp_Ax2, r1: number, r2: number, h: number, angle: number): BRepPrimAPI_MakeCone;
}

export interface BRepPrimAPI_MakeTorus {
  Shape(): TopoDS_Shape;
  Solid(): TopoDS_Solid;
  Shell(): TopoDS_Shell;
  IsDone(): boolean;
  delete(): void;
}

export interface BRepPrimAPI_MakeTorus_Constructor {
  /** Make a complete torus with major radius R1 and minor (pipe) radius R2. */
  new(r1: number, r2: number): BRepPrimAPI_MakeTorus;
  /** Make a torus with axes, major radius R1, and minor (pipe) radius R2. */
  new(axes: gp_Ax2, r1: number, r2: number): BRepPrimAPI_MakeTorus;
  /** Make a torus ring segment with angles on the minor circle (angle1 to angle2). */
  new(r1: number, r2: number, angle1: number, angle2: number): BRepPrimAPI_MakeTorus;
  /** Make a partial torus: ring segment (angle1, angle2) and pipe segment (angle). */
  new(r1: number, r2: number, angle1: number, angle2: number, angle: number): BRepPrimAPI_MakeTorus;
  /** Make a partial torus with axes: ring segment (angle1, angle2) and pipe segment (angle). */
  new(axes: gp_Ax2, r1: number, r2: number, angle1: number, angle2: number, angle: number): BRepPrimAPI_MakeTorus;
}

export interface BRepPrimAPI_MakePrism {
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  FirstShape(): TopoDS_Shape;
  LastShape(): TopoDS_Shape;
  delete(): void;
}

export interface BRepPrimAPI_MakePrism_Constructor {
  new(shape: TopoDS_Shape, vec: gp_Vec): BRepPrimAPI_MakePrism;
  new(shape: TopoDS_Shape, vec: gp_Vec, copy: boolean): BRepPrimAPI_MakePrism;
  new(shape: TopoDS_Shape, vec: gp_Vec, copy: boolean, canonize: boolean): BRepPrimAPI_MakePrism;
}

// =============================================================================
// BRepPrimAPI_MakeRevol - Revolution of profile around axis
// =============================================================================

export interface BRepPrimAPI_MakeRevol {
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  FirstShape(): TopoDS_Shape;
  LastShape(): TopoDS_Shape;
  delete(): void;
}

export interface BRepPrimAPI_MakeRevol_Constructor {
  new(shape: TopoDS_Shape, axis: gp_Ax1): BRepPrimAPI_MakeRevol;
  new(shape: TopoDS_Shape, axis: gp_Ax1, angle: number): BRepPrimAPI_MakeRevol;
  new(shape: TopoDS_Shape, axis: gp_Ax1, angle: number, copy: boolean): BRepPrimAPI_MakeRevol;
}

// =============================================================================
// BRepPrimAPI_MakeWedge - Wedge/Ramp Primitive
// =============================================================================

/**
 * Creates a wedge (tapered box) primitive.
 * 
 * A wedge is a box where the top face is smaller than the bottom face,
 * creating a ramp or pyramid-like shape. The wedge is defined by:
 * - A box with dimensions dx × dy × dz
 * - The top face is offset/scaled relative to the bottom
 * 
 * Two construction modes:
 * 1. Simple wedge: dx, dy, dz, ltx - where ltx is the length of the top edge in X
 * 2. Full control: dx, dy, dz, xmin, zmin, xmax, zmax - specifying exact top face bounds
 * 
 * Example:
 * ```typescript
 * // Simple ramp (top edge is 20 units long, bottom is 100 units)
 * const wedge1 = new oc.BRepPrimAPI_MakeWedge(100, 50, 80, 20);
 * 
 * // Pyramid (top edge = 0)
 * const pyramid = new oc.BRepPrimAPI_MakeWedge(100, 100, 100, 0);
 * 
 * // Wedge with custom top face bounds
 * const wedge2 = new oc.BRepPrimAPI_MakeWedge(100, 50, 80, 20, 20, 80, 60);
 * 
 * // Wedge at custom position/orientation
 * const axes = new oc.gp_Ax2(new oc.gp_Pnt(10, 20, 30), new oc.gp_Dir(0, 0, 1));
 * const wedge3 = new oc.BRepPrimAPI_MakeWedge(axes, 100, 50, 80, 20);
 * ```
 */
export interface BRepPrimAPI_MakeWedge {
  /** Get the resulting shape */
  Shape(): TopoDS_Shape;
  /** Get the resulting solid */
  Solid(): TopoDS_Solid;
  /** Get the shell (outer boundary) */
  Shell(): TopoDS_Shell;
  /** Check if construction was successful */
  IsDone(): boolean;
  delete(): void;
}

export interface BRepPrimAPI_MakeWedge_Constructor {
  /**
   * Create a wedge with base dx×dz, height dy, and top edge length ltx.
   * The top edge runs along X direction with length ltx, centered on the base.
   * @param dx Base length in X direction
   * @param dy Height in Y direction  
   * @param dz Base length in Z direction
   * @param ltx Length of top edge in X direction (0 creates a pyramid point)
   */
  new(dx: number, dy: number, dz: number, ltx: number): BRepPrimAPI_MakeWedge;
  
  /**
   * Create a wedge at specified position/orientation.
   * @param axes Coordinate system (origin and directions)
   * @param dx Base length in X direction
   * @param dy Height in Y direction
   * @param dz Base length in Z direction
   * @param ltx Length of top edge in X direction
   */
  new(axes: gp_Ax2, dx: number, dy: number, dz: number, ltx: number): BRepPrimAPI_MakeWedge;
  
  /**
   * Create a wedge with full control over the top face bounds.
   * The top face is defined by (xmin, zmin) to (xmax, zmax) on the top plane.
   * @param dx Base length in X direction
   * @param dy Height in Y direction
   * @param dz Base length in Z direction
   * @param xmin X coordinate of top face minimum corner
   * @param zmin Z coordinate of top face minimum corner  
   * @param xmax X coordinate of top face maximum corner
   * @param zmax Z coordinate of top face maximum corner
   */
  new(dx: number, dy: number, dz: number, xmin: number, zmin: number, xmax: number, zmax: number): BRepPrimAPI_MakeWedge;
  
  /**
   * Create a wedge at specified position with full control over top face bounds.
   * @param axes Coordinate system (origin and directions)
   * @param dx Base length in X direction
   * @param dy Height in Y direction
   * @param dz Base length in Z direction
   * @param xmin X coordinate of top face minimum corner
   * @param zmin Z coordinate of top face minimum corner
   * @param xmax X coordinate of top face maximum corner
   * @param zmax Z coordinate of top face maximum corner
   */
  new(axes: gp_Ax2, dx: number, dy: number, dz: number, xmin: number, zmin: number, xmax: number, zmax: number): BRepPrimAPI_MakeWedge;
}

// =============================================================================
// BRepOffsetAPI - Offset, Pipe, and Loft Operations
// =============================================================================

export interface BRepOffsetAPI_MakeOffset {
  AddWire(wire: TopoDS_Wire): void;
  Perform(offset: number, alt: number): void;
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  Build(): void;
  Init(face: TopoDS_Face, join: EmbindEnumValue, isOpenResult: boolean): void;
  InitJoin(join: EmbindEnumValue, isOpenResult: boolean): void;
  delete(): void;
}

export interface BRepOffsetAPI_MakeOffset_Constructor {
  new(): BRepOffsetAPI_MakeOffset;
  new(face: TopoDS_Face): BRepOffsetAPI_MakeOffset;
}

export interface BRepOffsetAPI_ThruSections {
  AddWire(wire: TopoDS_Wire): void;
  AddVertex(vertex: TopoDS_Vertex): void;
  SetSmoothing(smoothing: boolean): void;
  SetMaxDegree(degree: number): void;
  SetParType(parType: Approx_ParametrizationType): void;
  CheckCompatibility(check: boolean): void;
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  Build(): void;
  delete(): void;
}

export interface BRepOffsetAPI_ThruSections_Constructor {
  new(isSolid: boolean): BRepOffsetAPI_ThruSections;
  new(isSolid: boolean, ruled: boolean, prec: number): BRepOffsetAPI_ThruSections;
}

export interface BRepOffsetAPI_MakePipe {
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  Build(): void;
  FirstShape(): TopoDS_Shape;
  LastShape(): TopoDS_Shape;
  delete(): void;
}

export interface BRepOffsetAPI_MakePipe_Constructor {
  new(spine: TopoDS_Wire, profile: TopoDS_Shape): BRepOffsetAPI_MakePipe;
  new(spine: TopoDS_Wire, profile: TopoDS_Shape, mode: EmbindEnumValue, forceApproxC1: boolean): BRepOffsetAPI_MakePipe;
}

export interface BRepOffsetAPI_MakePipeShell {
  SetMode(isFrenet: boolean): void;
  SetModeDir(direction: gp_Dir): void;
  SetModeWithAuxSpine(auxSpine: TopoDS_Wire, curvilinearEquivalence: boolean, keepContact: EmbindEnumValue): void;
  Add(profile: TopoDS_Shape, withContact?: boolean, withCorrection?: boolean): void;
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  Build(): void;
  MakeSolid(): boolean;
  FirstShape(): TopoDS_Shape;
  LastShape(): TopoDS_Shape;
  delete(): void;
}

export interface BRepOffsetAPI_MakePipeShell_Constructor {
  new(spine: TopoDS_Wire): BRepOffsetAPI_MakePipeShell;
}

// =============================================================================
// BRepProj_Projection - Project Wire onto Shape
// =============================================================================

export interface BRepProj_Projection {
  IsDone(): boolean;
  Shape(): TopoDS_Compound;
  Current(): TopoDS_Wire;
  More(): boolean;
  Next(): void;
  delete(): void;
}

export interface BRepProj_Projection_Constructor {
  new(wire: TopoDS_Wire, shape: TopoDS_Shape, direction: gp_Dir): BRepProj_Projection;
}

// =============================================================================
// BRepOffsetAPI_MakeOffsetShape - 3D Offset Operations
// =============================================================================

export interface BRepOffsetAPI_MakeOffsetShape {
  PerformByJoin(
    shape: TopoDS_Shape,
    offsetValue: number,
    tolerance: number,
    mode: EmbindEnumValue,
    intersection: boolean,
    selfIntersection: boolean,
    joinType: EmbindEnumValue,
    removeIntEdges: boolean
  ): void;
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  Build(): void;
  delete(): void;
}

export interface BRepOffsetAPI_MakeOffsetShape_Constructor {
  new(): BRepOffsetAPI_MakeOffsetShape;
}

// =============================================================================
// BRepOffsetAPI_MakeThickSolid - Shell/Thicken Operations
// =============================================================================

export interface BRepOffsetAPI_MakeThickSolid {
  MakeThickSolidBySimple(shape: TopoDS_Shape, offset: number): void;
  MakeThickSolidByJoin(
    shape: TopoDS_Shape,
    closingFaces: TopTools_ListOfShape,
    offsetValue: number,
    tolerance: number,
    mode: EmbindEnumValue,
    intersection: boolean,
    selfIntersection: boolean,
    joinType: EmbindEnumValue,
    removeIntEdges: boolean
  ): void;
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  Build(): void;
  delete(): void;
}

export interface BRepOffsetAPI_MakeThickSolid_Constructor {
  new(): BRepOffsetAPI_MakeThickSolid;
}

// =============================================================================
// BOPAlgo_Builder - Boolean Operations Builder
// =============================================================================

export interface BOPAlgo_Builder {
  AddArgument(shape: TopoDS_Shape): void;
  SetNonDestructive(flag: boolean): void;
  SetFuzzyValue(value: number): void;
  Perform(): void;
  HasErrors(): boolean;
  Shape(): TopoDS_Shape;
  Modified(shape: TopoDS_Shape): TopTools_ListOfShape;
  delete(): void;
}

export interface BOPAlgo_Builder_Constructor {
  new(): BOPAlgo_Builder;
}

// =============================================================================
// Additional BRepBuilderAPI Classes
// =============================================================================

export interface BRepBuilderAPI_MakeShell {
  Shell(): TopoDS_Shell;
  IsDone(): boolean;
  delete(): void;
}

export interface BRepBuilderAPI_MakeShell_Constructor {
  new(): BRepBuilderAPI_MakeShell;
}

export interface BRepBuilderAPI_MakeSolid {
  Add(shell: TopoDS_Shell): void;
  Solid(): TopoDS_Solid;
  IsDone(): boolean;
  delete(): void;
}

export interface BRepBuilderAPI_MakeSolid_Constructor {
  new(): BRepBuilderAPI_MakeSolid;
  new(shell: TopoDS_Shell): BRepBuilderAPI_MakeSolid;
}

export interface BRepBuilderAPI_Sewing {
  Init(tolerance?: number, option1?: boolean, option2?: boolean, option3?: boolean): void;
  Add(shape: TopoDS_Shape): void;
  Perform(): void;
  SewedShape(): TopoDS_Shape;
  NbFreeEdges(): number;
  NbMultipleEdges(): number;
  NbDegeneratedShapes(): number;
  delete(): void;
}

export interface BRepBuilderAPI_Sewing_Constructor {
  new(): BRepBuilderAPI_Sewing;
  new(tolerance: number): BRepBuilderAPI_Sewing;
}

export interface BRepBuilderAPI_Copy {
  Perform(shape: TopoDS_Shape, copyGeom?: boolean): void;
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  delete(): void;
}

export interface BRepBuilderAPI_Copy_Constructor {
  new(): BRepBuilderAPI_Copy;
  new(shape: TopoDS_Shape): BRepBuilderAPI_Copy;
}

export interface BRepBuilderAPI_GTransform {
  Perform(shape: TopoDS_Shape, makeCopy?: boolean): void;
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  delete(): void;
}

export interface BRepBuilderAPI_GTransform_Constructor {
  new(gtrsf: gp_GTrsf): BRepBuilderAPI_GTransform;
  new(shape: TopoDS_Shape, gtrsf: gp_GTrsf): BRepBuilderAPI_GTransform;
}

// =============================================================================
// Bnd_Box - Axis-Aligned Bounding Box
// =============================================================================

export interface Bnd_Box {
  SetVoid(): void;
  IsVoid(): boolean;
  Add(p: gp_Pnt): void;
  AddBox(box: Bnd_Box): void;
  IsOut(p: gp_Pnt): boolean;
  IsOutBox(box: Bnd_Box): boolean;
  Enlarge(tol: number): void;
  GetGap(): number;
  SetGap(tol: number): void;
  OpenXmin(): void;
  OpenXmax(): void;
  OpenYmin(): void;
  OpenYmax(): void;
  OpenZmin(): void;
  OpenZmax(): void;
  SquareExtent(): number;
  CornerMin(): gp_Pnt;
  CornerMax(): gp_Pnt;
  delete(): void;
}

export interface Bnd_Box_Constructor {
  new(): Bnd_Box;
}

// =============================================================================
// BRepAlgoAPI - Boolean Operations
// =============================================================================

export interface BRepAlgoAPI_Fuse {
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  HasErrors(): boolean;
  HasWarnings(): boolean;
  HasGenerated(): boolean;
  Build(): void;
  delete(): void;
}

export interface BRepAlgoAPI_Fuse_Constructor {
  new(): BRepAlgoAPI_Fuse;
  new(s1: TopoDS_Shape, s2: TopoDS_Shape): BRepAlgoAPI_Fuse;
}

export interface BRepAlgoAPI_Cut {
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  HasErrors(): boolean;
  HasWarnings(): boolean;
  HasGenerated(): boolean;
  Build(): void;
  delete(): void;
}

export interface BRepAlgoAPI_Cut_Constructor {
  new(): BRepAlgoAPI_Cut;
  new(s1: TopoDS_Shape, s2: TopoDS_Shape): BRepAlgoAPI_Cut;
}

export interface BRepAlgoAPI_Common {
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  HasErrors(): boolean;
  HasWarnings(): boolean;
  HasGenerated(): boolean;
  Build(): void;
  delete(): void;
}

export interface BRepAlgoAPI_Common_Constructor {
  new(): BRepAlgoAPI_Common;
  new(s1: TopoDS_Shape, s2: TopoDS_Shape): BRepAlgoAPI_Common;
}

export interface BRepAlgoAPI_Section {
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  HasErrors(): boolean;
  HasWarnings(): boolean;
  Build(): void;
  delete(): void;
}

export interface BRepAlgoAPI_Section_Constructor {
  new(): BRepAlgoAPI_Section;
  new(s1: TopoDS_Shape, s2: TopoDS_Shape): BRepAlgoAPI_Section;
  new(shape: TopoDS_Shape, plane: gp_Pln): BRepAlgoAPI_Section;
}

/**
 * Split shapes by other shapes (cutting tools).
 * Unlike Cut, Splitter preserves all pieces from both arguments and tools.
 * 
 * Example:
 * ```typescript
 * const splitter = new oc.BRepAlgoAPI_Splitter();
 * const argsToSplit = new oc.TopTools_ListOfShape();
 * argsToSplit.Append(box);
 * const tools = new oc.TopTools_ListOfShape();
 * tools.Append(cuttingPlane);
 * splitter.SetArguments(argsToSplit);
 * splitter.SetTools(tools);
 * splitter.Build();
 * if (splitter.IsDone()) {
 *   const result = splitter.Shape(); // compound of split pieces
 * }
 * ```
 */
export interface BRepAlgoAPI_Splitter {
  /** Set shapes to be split */
  SetArguments(shapes: TopTools_ListOfShape): void;
  /** Set shapes used as splitting tools */
  SetTools(tools: TopTools_ListOfShape): void;
  /** Perform the split operation */
  Build(): void;
  /** Get the result (compound of all split pieces) */
  Shape(): TopoDS_Shape;
  /** Check if operation completed successfully */
  IsDone(): boolean;
  /** Check if there were errors */
  HasErrors(): boolean;
  /** Check if there were warnings */
  HasWarnings(): boolean;
  delete(): void;
}

export interface BRepAlgoAPI_Splitter_Constructor {
  new(): BRepAlgoAPI_Splitter;
}

// =============================================================================
// BRepBuilderAPI - Shape Building
// =============================================================================

export interface BRepBuilderAPI_MakeVertex {
  Vertex(): TopoDS_Vertex;
  IsDone(): boolean;
  delete(): void;
}

export interface BRepBuilderAPI_MakeVertex_Constructor {
  new(p: gp_Pnt): BRepBuilderAPI_MakeVertex;
}

export interface BRepBuilderAPI_MakeEdge {
  Edge(): TopoDS_Edge;
  IsDone(): boolean;
  Vertex1(): TopoDS_Vertex;
  Vertex2(): TopoDS_Vertex;
  delete(): void;
}

export interface BRepBuilderAPI_MakeEdge_Constructor {
  new(): BRepBuilderAPI_MakeEdge;
  new(p1: gp_Pnt, p2: gp_Pnt): BRepBuilderAPI_MakeEdge;
  new(line: gp_Lin): BRepBuilderAPI_MakeEdge;
  new(line: gp_Lin, u1: number, u2: number): BRepBuilderAPI_MakeEdge;
  new(line: gp_Lin, p1: gp_Pnt, p2: gp_Pnt): BRepBuilderAPI_MakeEdge;
  new(circ: gp_Circ): BRepBuilderAPI_MakeEdge;
  new(circ: gp_Circ, u1: number, u2: number): BRepBuilderAPI_MakeEdge;
  new(circ: gp_Circ, p1: gp_Pnt, p2: gp_Pnt): BRepBuilderAPI_MakeEdge;
}

export interface BRepBuilderAPI_MakeWire {
  AddEdge(edge: TopoDS_Edge): void;
  AddWire(wire: TopoDS_Wire): void;
  Wire(): TopoDS_Wire;
  IsDone(): boolean;
  delete(): void;
}

export interface BRepBuilderAPI_MakeWire_Constructor {
  new(): BRepBuilderAPI_MakeWire;
  new(e: TopoDS_Edge): BRepBuilderAPI_MakeWire;
  new(e1: TopoDS_Edge, e2: TopoDS_Edge): BRepBuilderAPI_MakeWire;
  new(e1: TopoDS_Edge, e2: TopoDS_Edge, e3: TopoDS_Edge): BRepBuilderAPI_MakeWire;
  new(wire: TopoDS_Wire): BRepBuilderAPI_MakeWire;
}

export interface BRepBuilderAPI_MakeFace {
  AddWire(wire: TopoDS_Wire): void;
  Face(): TopoDS_Face;
  IsDone(): boolean;
  delete(): void;
}

export interface BRepBuilderAPI_MakeFace_Constructor {
  new(): BRepBuilderAPI_MakeFace;
  new(wire: TopoDS_Wire): BRepBuilderAPI_MakeFace;
  new(face: TopoDS_Face, wire: TopoDS_Wire): BRepBuilderAPI_MakeFace;
}

export interface BRepBuilderAPI_MakePolygon {
  Add(p: gp_Pnt): void;
  Close(): void;
  Wire(): TopoDS_Wire;
  Edge(): TopoDS_Edge;
  IsDone(): boolean;
  delete(): void;
}

export interface BRepBuilderAPI_MakePolygon_Constructor {
  new(): BRepBuilderAPI_MakePolygon;
  new(p1: gp_Pnt, p2: gp_Pnt): BRepBuilderAPI_MakePolygon;
  new(p1: gp_Pnt, p2: gp_Pnt, p3: gp_Pnt): BRepBuilderAPI_MakePolygon;
  new(p1: gp_Pnt, p2: gp_Pnt, p3: gp_Pnt, p4: gp_Pnt): BRepBuilderAPI_MakePolygon;
  new(p1: gp_Pnt, p2: gp_Pnt, p3: gp_Pnt, close: boolean): BRepBuilderAPI_MakePolygon;
  new(p1: gp_Pnt, p2: gp_Pnt, p3: gp_Pnt, p4: gp_Pnt, close: boolean): BRepBuilderAPI_MakePolygon;
}

export interface BRepBuilderAPI_Transform {
  Perform(shape: TopoDS_Shape, copy?: boolean): void;
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  ModifiedShape(shape: TopoDS_Shape): TopoDS_Shape;
  delete(): void;
}

export interface BRepBuilderAPI_Transform_Constructor {
  new(trsf: gp_Trsf): BRepBuilderAPI_Transform;
  new(shape: TopoDS_Shape, trsf: gp_Trsf): BRepBuilderAPI_Transform;
  new(shape: TopoDS_Shape, trsf: gp_Trsf, copy: boolean): BRepBuilderAPI_Transform;
}

// =============================================================================
// BRepFilletAPI - Fillets and Chamfers
// =============================================================================

export interface BRepFilletAPI_MakeFillet {
  Add(radius: number, edge: TopoDS_Edge): void;
  AddVariable(r1: number, r2: number, edge: TopoDS_Edge): void;
  AddWithLaw(uandR: TColgp_Array1OfPnt2d, edge: TopoDS_Edge): void;
  SetRadius(radius: number, ic: number, iinC: number): void;
  NbEdges(): number;
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  Build(): void;
  delete(): void;
}

export interface BRepFilletAPI_MakeFillet_Constructor {
  new(shape: TopoDS_Shape): BRepFilletAPI_MakeFillet;
  new(shape: TopoDS_Shape, filletShape: EmbindEnumValue): BRepFilletAPI_MakeFillet;
}

export interface BRepFilletAPI_MakeChamfer {
  Add(dist: number, edge: TopoDS_Edge): void;
  AddTwoDistances(dist1: number, dist2: number, edge: TopoDS_Edge, face: TopoDS_Face): void;
  AddDA(dist: number, angle: number, edge: TopoDS_Edge, face: TopoDS_Face): void;
  NbEdges(): number;
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  Build(): void;
  delete(): void;
}

export interface BRepFilletAPI_MakeChamfer_Constructor {
  new(shape: TopoDS_Shape): BRepFilletAPI_MakeChamfer;
}

// =============================================================================
// BRepFill_Filling - N-Sided Surface Filling
// =============================================================================

export interface BRepFill_Filling {
  delete(): void;
}

export interface BRepFill_Filling_Constructor {
  /** Default constructor with standard parameters */
  new(): BRepFill_Filling;
  /** Full constructor with all parameters */
  new(
    degree: number,
    nbPtsOnCur: number,
    nbIter: number,
    anisotropie: boolean,
    tol2d: number,
    tol3d: number,
    tolAng: number,
    tolCurv: number,
    maxDeg: number,
    maxSegments: number
  ): BRepFill_Filling;
}

// =============================================================================
// BRepClass_FaceClassifier - Point Classification on Face
// =============================================================================

export interface BRepClass_FaceClassifier {
  State(): EmbindEnumValue;
  delete(): void;
}

export interface BRepClass_FaceClassifier_Constructor {
  /** Default constructor */
  new(): BRepClass_FaceClassifier;
  /** Classify 2D point on face */
  new(face: TopoDS_Face, point: gp_Pnt2d, tolerance: number): BRepClass_FaceClassifier;
  /** Classify 3D point on face */
  new(face: TopoDS_Face, point: gp_Pnt, tolerance: number): BRepClass_FaceClassifier;
}

// =============================================================================
// GProp_GProps - Geometry Properties
// =============================================================================

export interface GProp_GProps {
  Mass(): number;
  CentreOfMass(): gp_Pnt;
  delete(): void;
}

export interface GProp_GProps_Constructor {
  new(): GProp_GProps;
  new(systemLocation: gp_Pnt): GProp_GProps;
}

// =============================================================================
// TopLoc_Location - Transformation Location
// =============================================================================

export interface TopLoc_Location {
  IsIdentity(): boolean;
  Transformation(): gp_Trsf;
  Inverted(): TopLoc_Location;
  Multiplied(other: TopLoc_Location): TopLoc_Location;
  Divided(other: TopLoc_Location): TopLoc_Location;
  Predivided(other: TopLoc_Location): TopLoc_Location;
  Powered(exponent: number): TopLoc_Location;
  Clear(): void;
  delete(): void;
}

export interface TopLoc_Location_Constructor {
  new(): TopLoc_Location;
  new(trsf: gp_Trsf): TopLoc_Location;
}

// =============================================================================
// Poly_Triangle - Triangle Indices
// =============================================================================

export interface Poly_Triangle {
  Set(n1: number, n2: number, n3: number): void;
  Value(index: number): number;
  ChangeValue(index: number): number;
  delete(): void;
}

export interface Poly_Triangle_Constructor {
  new(): Poly_Triangle;
  new(n1: number, n2: number, n3: number): Poly_Triangle;
}

// =============================================================================
// Poly_Triangulation - Mesh Triangulation
// =============================================================================

export interface Poly_Triangulation {
  IsNull(): boolean;
  NbNodes(): number;
  NbTriangles(): number;
  HasNormals(): boolean;
  HasUVNodes(): boolean;
  Node(index: number): gp_Pnt;
  Triangle(index: number): Poly_Triangle;
  Normal(index: number): gp_Dir;
  UVNode(index: number): gp_Pnt2d;
  delete(): void;
}

export interface Poly_Triangulation_Constructor {
  new(): Poly_Triangulation;
}

export interface Handle_Poly_Triangulation {
  IsNull(): boolean;
  get(): Poly_Triangulation;
  delete(): void;
}

// =============================================================================
// Poly_Connect - Triangulation Connectivity Analysis
// =============================================================================

export interface Poly_Connect {
  Triangle(nodeIndex: number): number;
  Initialize(nodeIndex: number): void;
  More(): boolean;
  Next(): void;
  Value(): number;
  delete(): void;
}

export interface Poly_Connect_Constructor {
  new(): Poly_Connect;
  new(triangulation: Poly_Triangulation): Poly_Connect;
}

// =============================================================================
// TColgp Array Types - Geometry Collections
// =============================================================================

export interface TColgp_Array1OfPnt2d {
  Lower(): number;
  Upper(): number;
  Length(): number;
  Value(index: number): gp_Pnt2d;
  SetValue(index: number, value: gp_Pnt2d): void;
  delete(): void;
}

export interface TColgp_Array1OfPnt2d_Constructor {
  new(lower: number, upper: number): TColgp_Array1OfPnt2d;
}

export interface TColgp_Array1OfDir {
  Lower(): number;
  Upper(): number;
  Length(): number;
  Value(index: number): gp_Dir;
  SetValue(index: number, value: gp_Dir): void;
  delete(): void;
}

export interface TColgp_Array1OfDir_Constructor {
  new(lower: number, upper: number): TColgp_Array1OfDir;
}

// =============================================================================
// StdPrs_ToolTriangulatedShape - Normal Computation
// =============================================================================

export interface StdPrs_ToolTriangulatedShape_Static {
  Normal(face: TopoDS_Face, polyConnect: Poly_Connect, normals: TColgp_Array1OfDir): void;
}

// =============================================================================
// BRepMesh_IncrementalMesh - Mesh Generation
// =============================================================================

export interface BRepMesh_IncrementalMesh {
  Perform(): void;
  IsDone(): boolean;
  delete(): void;
}

export interface BRepMesh_IncrementalMesh_Constructor {
  new(): BRepMesh_IncrementalMesh;
  new(shape: TopoDS_Shape, deflection: number): BRepMesh_IncrementalMesh;
  new(shape: TopoDS_Shape, deflection: number, isRelative: boolean): BRepMesh_IncrementalMesh;
  new(shape: TopoDS_Shape, deflection: number, isRelative: boolean, angularDeflection: number): BRepMesh_IncrementalMesh;
  new(shape: TopoDS_Shape, deflection: number, isRelative: boolean, angularDeflection: number, inParallel: boolean): BRepMesh_IncrementalMesh;
}

// =============================================================================
// Data Exchange - STEP
// =============================================================================

export interface STEPControl_Reader {
  ReadFile(filename: string): EmbindEnumValue;
  NbRootsForTransfer(): number;
  TransferRoot(num: number): boolean;
  TransferRoots(): number;
  NbShapes(): number;
  Shape(num: number): TopoDS_Shape;
  OneShape(): TopoDS_Shape;
  ClearShapes(): void;
  delete(): void;
}

export interface STEPControl_Reader_Constructor {
  new(): STEPControl_Reader;
}

export interface STEPControl_Writer {
  Transfer(shape: TopoDS_Shape, mode: EmbindEnumValue): EmbindEnumValue;
  Write(filename: string): EmbindEnumValue;
  delete(): void;
}

export interface STEPControl_Writer_Constructor {
  new(): STEPControl_Writer;
}

// =============================================================================
// Data Exchange - IGES
// =============================================================================

export interface IGESControl_Reader {
  ReadFile(filename: string): EmbindEnumValue;
  NbRootsForTransfer(): number;
  TransferRoots(): number;
  NbShapes(): number;
  Shape(num: number): TopoDS_Shape;
  OneShape(): TopoDS_Shape;
  ClearShapes(): void;
  delete(): void;
}

export interface IGESControl_Reader_Constructor {
  new(): IGESControl_Reader;
}

export interface IGESControl_Writer {
  AddShape(shape: TopoDS_Shape): boolean;
  ComputeModel(): void;
  Write(filename: string): boolean;
  delete(): void;
}

export interface IGESControl_Writer_Constructor {
  new(): IGESControl_Writer;
}

// =============================================================================
// Data Exchange - STL
// =============================================================================

export interface StlAPI_Writer {
  SetASCIIMode(isAscii: boolean): void;
  GetASCIIMode(): boolean;
  Write(shape: TopoDS_Shape, filename: string): boolean;
  delete(): void;
}

export interface StlAPI_Writer_Constructor {
  new(): StlAPI_Writer;
}

// =============================================================================
// BRep_Builder - Low-level Shape Building
// =============================================================================

export interface BRep_Builder {
  // Make* methods now return the created shape (wrapper functions)
  MakeCompound(): TopoDS_Compound;
  MakeCompSolid(): TopoDS_CompSolid;
  MakeSolid(): TopoDS_Solid;
  MakeShell(): TopoDS_Shell;
  MakeWire(): TopoDS_Wire;
  Add(shape: TopoDS_Shape, component: TopoDS_Shape): void;
  Remove(shape: TopoDS_Shape, component: TopoDS_Shape): void;
  delete(): void;
}

export interface BRep_Builder_Constructor {
  new(): BRep_Builder;
}

// =============================================================================
// XCAF (Extended CAD Framework) - Assembly Support
// =============================================================================

/**
 * TDF_Label - A label in the data framework
 * Used to access attributes and navigate the document hierarchy
 */
export interface TDF_Label {
  /** Returns true if the label is null */
  IsNull(): boolean;
  /** Returns true if this is the root label */
  IsRoot(): boolean;
  /** Returns the tag (integer identifier) of this label */
  Tag(): number;
  /** Returns the parent label */
  Father(): TDF_Label;
  /** Find an attribute by GUID */
  FindAttribute_1(guid: Standard_GUID, attribute: Handle_TDF_Attribute): boolean;
  delete(): void;
}

export interface TDF_Label_Constructor {
  new(): TDF_Label;
}

/**
 * TDF_LabelSequence - A sequence of TDF_Label objects
 */
export interface TDF_LabelSequence {
  /** Number of labels in the sequence */
  Length(): number;
  /** Get label at 1-based index */
  Value(index: number): TDF_Label;
  /** Append a label to the sequence */
  Append(label: TDF_Label): void;
  delete(): void;
}

export interface TDF_LabelSequence_Constructor {
  new(): TDF_LabelSequence;
}

/**
 * Standard_GUID - Globally Unique Identifier
 */
export interface Standard_GUID {
  delete(): void;
}

export interface Standard_GUID_Constructor {
  new(): Standard_GUID;
}

/**
 * TopLoc_Location - Represents a location (transformation) in 3D space
 */
export interface TopLoc_Location {
  /** Returns true if the location is identity (no transformation) */
  IsIdentity(): boolean;
  /** Returns the transformation matrix */
  Transformation(): gp_Trsf;
  delete(): void;
}

export interface TopLoc_Location_Constructor {
  new(): TopLoc_Location;
  new(trsf: gp_Trsf): TopLoc_Location;
}

/**
 * Quantity_Color - RGB color representation
 */
export interface Quantity_Color {
  /** Red component (0.0-1.0) */
  Red(): number;
  /** Green component (0.0-1.0) */
  Green(): number;
  /** Blue component (0.0-1.0) */
  Blue(): number;
  /** Hue angle in degrees (0-360) */
  Hue(): number;
  /** Light/Lightness component (0.0-1.0) */
  Light(): number;
  /** Saturation component (0.0-1.0) */
  Saturation(): number;
  delete(): void;
}

export interface Quantity_Color_Constructor {
  new(): Quantity_Color;
  new(c1: number, c2: number, c3: number, type: EmbindEnumValue): Quantity_Color;
}

/**
 * Quantity_ColorRGBA - RGBA color with alpha channel
 */
export interface Quantity_ColorRGBA {
  /** Get the RGB component */
  GetRGB(): Quantity_Color;
  /** Get alpha value (0.0-1.0) */
  Alpha(): number;
  /** Set alpha value */
  SetAlpha(alpha: number): void;
  delete(): void;
}

export interface Quantity_ColorRGBA_Constructor {
  new(): Quantity_ColorRGBA;
  new(color: Quantity_Color): Quantity_ColorRGBA;
  new(color: Quantity_Color, alpha: number): Quantity_ColorRGBA;
}

/**
 * Quantity_TypeOfColor enum - Color space types
 */
export interface Quantity_TypeOfColor {
  readonly Quantity_TOC_RGB: EmbindEnumValue;
  readonly Quantity_TOC_sRGB: EmbindEnumValue;
  readonly Quantity_TOC_HLS: EmbindEnumValue;
  readonly Quantity_TOC_CIELab: EmbindEnumValue;
  readonly Quantity_TOC_CIELch: EmbindEnumValue;
}

/**
 * XCAFDoc_ColorType enum - Types of color assignments
 */
export interface XCAFDoc_ColorType {
  /** General color */
  readonly XCAFDoc_ColorGen: EmbindEnumValue;
  /** Surface color */
  readonly XCAFDoc_ColorSurf: EmbindEnumValue;
  /** Curve color */
  readonly XCAFDoc_ColorCurv: EmbindEnumValue;
}

/**
 * TCollection_ExtendedString - Extended (Unicode) string class
 */
export interface TCollection_ExtendedString {
  /** String length */
  Length(): number;
  delete(): void;
}

/**
 * TCollection_AsciiString - ASCII string class
 */
export interface TCollection_AsciiString {
  /** Get C string pointer */
  ToCString(): string;
  /** String length */
  Length(): number;
  /** Check if empty */
  IsEmpty(): boolean;
  delete(): void;
}

export interface TCollection_AsciiString_Constructor {
  new(): TCollection_AsciiString;
  new(str: string): TCollection_AsciiString;
  new(extStr: TCollection_ExtendedString, replaceNonAscii: number): TCollection_AsciiString;
}

/**
 * Handle_TDF_Attribute - Handle to a TDF attribute
 */
export interface Handle_TDF_Attribute {
  IsNull(): boolean;
  get(): TDF_Attribute;
  delete(): void;
}

export interface Handle_TDF_Attribute_Constructor {
  new(): Handle_TDF_Attribute;
}

/**
 * TDF_Attribute - Base class for document attributes
 */
export interface TDF_Attribute {
  // Base attribute interface - specific attributes derive from this
}

/**
 * Handle_XCAFDoc_ShapeTool - Handle to shape tool
 */
export interface Handle_XCAFDoc_ShapeTool {
  IsNull(): boolean;
  get(): XCAFDoc_ShapeTool;
  delete(): void;
}

export interface Handle_XCAFDoc_ShapeTool_Constructor {
  new(): Handle_XCAFDoc_ShapeTool;
}

/**
 * Handle_XCAFDoc_ColorTool - Handle to color tool
 */
export interface Handle_XCAFDoc_ColorTool {
  IsNull(): boolean;
  get(): XCAFDoc_ColorTool;
  delete(): void;
}

export interface Handle_XCAFDoc_ColorTool_Constructor {
  new(): Handle_XCAFDoc_ColorTool;
}

/**
 * Handle_XCAFDoc_MaterialTool - Handle to material tool
 */
export interface Handle_XCAFDoc_MaterialTool {
  IsNull(): boolean;
  get(): XCAFDoc_MaterialTool;
  delete(): void;
}

export interface Handle_XCAFDoc_MaterialTool_Constructor {
  new(): Handle_XCAFDoc_MaterialTool;
}

/**
 * Handle_TDocStd_Document - Handle to a document
 */
export interface Handle_TDocStd_Document {
  IsNull(): boolean;
  get(): TDocStd_Document;
  /** Get the main (root) label of the document */
  Main(): TDF_Label;
  delete(): void;
}

export interface Handle_TDocStd_Document_Constructor {
  new(): Handle_TDocStd_Document;
}

/**
 * TDocStd_Document - An XCAF document
 */
export interface TDocStd_Document {
  /** Get the main (root) label */
  Main(): TDF_Label;
}

/**
 * XCAFDoc_ShapeTool - Tool for working with shapes in XCAF documents
 */
export interface XCAFDoc_ShapeTool {
  /** Get all free (top-level) shapes */
  GetFreeShapes(labels: TDF_LabelSequence): void;
  /** Get all shapes */
  GetShapes(labels: TDF_LabelSequence): void;
  /** Check if label is top-level */
  IsTopLevel(label: TDF_Label): boolean;
  /** Find a shape in the document */
  FindShape(shape: TopoDS_Shape, findInstance: boolean): TDF_Label;
}

/**
 * XCAFDoc_ShapeTool interface for static access
 */
export interface XCAFDoc_ShapeTool_Interface {
  // Static methods are accessed via module functions
}

/**
 * XCAFDoc_ColorTool - Tool for working with colors in XCAF documents
 */
export interface XCAFDoc_ColorTool {
  /** Check if label is a color definition */
  IsColor(label: TDF_Label): boolean;
  /** Get all color labels */
  GetColors(labels: TDF_LabelSequence): void;
  /** Get color from label (surface color by default) */
  GetColor_1(label: TDF_Label, color: Quantity_Color): boolean;
  /** Get RGBA color from label (surface color by default) */
  GetColor_2(label: TDF_Label, color: Quantity_ColorRGBA): boolean;
  /** Get color from shape for specific color type */
  GetColor_7(shape: TopoDS_Shape, type: EmbindEnumValue, color: Quantity_Color): boolean;
  /** Get RGBA color from shape for specific color type */
  GetColor_8(shape: TopoDS_Shape, type: EmbindEnumValue, color: Quantity_ColorRGBA): boolean;
}

/**
 * XCAFDoc_ColorTool interface for static access
 */
export interface XCAFDoc_ColorTool_Interface {
  // Static methods are accessed via module functions
}

/**
 * XCAFDoc_MaterialTool - Tool for working with materials in XCAF documents
 */
export interface XCAFDoc_MaterialTool {
  // Material tool methods
}

/**
 * TDataStd_Name - Name attribute for labels
 */
export interface TDataStd_Name {
  // Name methods accessed via downcasting
}

export interface TDataStd_Name_Constructor {
  new(): TDataStd_Name;
  /** Get the GUID for name attributes */
  GetID(): Standard_GUID;
}

/**
 * TDataStd_Real - Real number attribute
 */
export interface TDataStd_Real {
  /** Get the stored value */
  Get(): number;
  /** Get the attribute ID */
  ID(): Standard_GUID;
}

export interface TDataStd_Real_Constructor {
  new(): TDataStd_Real;
}

/**
 * TDataStd_Integer - Integer attribute
 */
export interface TDataStd_Integer {
  /** Get the stored value */
  Get(): number;
  /** Get the attribute ID */
  ID(): Standard_GUID;
}

export interface TDataStd_Integer_Constructor {
  new(): TDataStd_Integer;
}

// =============================================================================
// Static Utility Classes (Namespace-style access)
// =============================================================================

/**
 * BRepBndLib - Static methods for bounding box computation
 */
export interface BRepBndLib_Static {
  /** Add a shape to a bounding box */
  Add(shape: TopoDS_Shape, box: Bnd_Box, useTriangulation: boolean): void;
}

/**
 * BRepTools - Static methods for shape manipulation
 */
export interface BRepTools_Static {
  /** Clean shape of triangulation data */
  Clean(shape: TopoDS_Shape): void;
  /** Write shape to a file */
  Write(shape: TopoDS_Shape, fileName: string): boolean;
  /** Read shape from a file */
  Read(shape: TopoDS_Shape, fileName: string, builder: BRep_Builder): boolean;
}

/**
 * BRep_Tool - Static methods for accessing BRep data
 */
export interface BRep_Tool_Static {
  /** Get the 3D point of a vertex */
  Pnt(vertex: TopoDS_Vertex): gp_Pnt;
  /** Get the tolerance of a vertex */
  Tolerance_Vertex(vertex: TopoDS_Vertex): number;
  /** Get the tolerance of an edge */
  Tolerance_Edge(edge: TopoDS_Edge): number;
  /** Get the tolerance of a face */
  Tolerance_Face(face: TopoDS_Face): number;
  /** Check if an edge is degenerated */
  Degenerated(edge: TopoDS_Edge): boolean;
  /** Check if an edge is closed */
  IsClosed(edge: TopoDS_Edge): boolean;
  /** Get triangulation from a face */
  Triangulation(face: TopoDS_Face, location: TopLoc_Location, polygonOnTriangIndex: number): Handle_Poly_Triangulation;
}

// =============================================================================
// Module Factory Function
// =============================================================================

declare function createBitbybitOcct(): Promise<BitbybitOcctModule>;
export default createBitbybitOcct;

