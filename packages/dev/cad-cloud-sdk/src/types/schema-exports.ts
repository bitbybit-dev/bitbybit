// ---------------------------------------------------------------------------
// AUTO-GENERATED — do not edit manually.
// ---------------------------------------------------------------------------

import type { components, paths } from "./generated.js";

// ---------------------------------------------------------------------------
// Schema re-exports (1:1 from OpenAPI component schemas, names unchanged)
// ---------------------------------------------------------------------------

/** Submit multiple parameter variations of the same model for parallel generation */
export type BatchModelSubmissionBody = components["schemas"]["BatchModelSubmissionBody"];
/** Confirmation that a task was successfully cancelled */
export type CancelResult = components["schemas"]["CancelResult"];
/** Success response for task cancellation */
export type CancelTaskResponse = components["schemas"]["CancelTaskResponse"];
/** Conditional execution - evaluate a condition and run the matching branch. */
export type ChoiceStep = components["schemas"]["ChoiceStep"];
/** Comparison operator: 'eq' (equal), 'neq' (not equal), 'gt' (greater than), 'gte' (greater or equal), 'lt' (less than), 'lte' (less or equal), 'exists' (value is not null/undefined). */
export type ComparisonOperator = components["schemas"]["ComparisonOperator"];
/** Execute multiple independent Bitbybit CAD operations in parallel. Each item runs as a separate sub-task and can be polled individually. */
export type CompoundExecuteBody = components["schemas"]["CompoundExecuteBody"];
/** A single operation within a compound (parallel) task. Each item runs independently. */
export type CompoundItem = components["schemas"]["CompoundItem"];
/** Status/result info for one sub-task in a compound manifest */
export type CompoundResultEntry = components["schemas"]["CompoundResultEntry"];
/** Result manifest for a completed compound task */
export type CompoundResultManifest = components["schemas"]["CompoundResultManifest"];
/** Success envelope containing the compound task result manifest with per-sub-task download links */
export type CompoundResultManifestResponse = components["schemas"]["CompoundResultManifestResponse"];
/** HTTP 202 response when a compound (parallel) task is accepted */
export type CompoundTaskAcceptedResponse = components["schemas"]["CompoundTaskAcceptedResponse"];
/** Returned when a compound (parallel) task is accepted. Contains initial status for all sub-tasks. */
export type CompoundTaskCreatedResult = components["schemas"]["CompoundTaskCreatedResult"];
/** Success envelope confirming a file upload was verified */
export type ConfirmResponse = components["schemas"]["ConfirmResponse"];
/** Returned after a file upload is verified. The file is now ready to be used in CAD operations. */
export type ConfirmResult = components["schemas"]["ConfirmResult"];
/** Fine-grained options controlling STEP → glTF conversion: tessellation quality, attribute extraction, coordinate systems, and output format. */
export type ConvertAdvancedOptions = components["schemas"]["ConvertAdvancedOptions"];
/** Fetch parameter definitions for one or more parametric models. Returns available parameters, types, defaults, and constraints. */
export type DefinitionsBody = components["schemas"]["DefinitionsBody"];
/** Success response for file deletion */
export type DeleteFileResponse = components["schemas"]["DeleteFileResponse"];
/** Confirmation that a resource was successfully deleted */
export type DeleteResult = components["schemas"]["DeleteResult"];
/** Draco geometry compression options applied during glTF export. */
export type DracoCompressionOptions = components["schemas"]["DracoCompressionOptions"];
/** Request body for the Dragon Cup model */
export type DragonCupBody = components["schemas"]["DragonCupBody"];
/** Dragon Cup model parameters - all optional, sane defaults apply */
export type DragonCupParams = components["schemas"]["DragonCupParams"];
/** Which of the annotations the STEP file stores a sheet draws, and where: one product's, moved to where one of its instances stands, or the whole model's; and whether views are added for them and the general notes drawn, or both left to another sheet of the set. */
export type DrawingAnnotatedProduct = components["schemas"]["DrawingAnnotatedProduct"];
/** What became of the annotations the STEP file stores. */
export type DrawingAnnotationsUsed = components["schemas"]["DrawingAnnotationsUsed"];
/** Balloons around one view or one section, each with a leader to a part it names. */
export type DrawingBalloons = components["schemas"]["DrawingBalloons"];
/** One dimension drawn on the sheet: its kind, view, text and line, in millimetres on paper. */
export type DrawingDimensionUsed = components["schemas"]["DrawingDimensionUsed"];
/** Draw a sheet, or a set of sheets, of the model in an uploaded STEP file: views laid out and aligned, hidden lines, sections with hatches, dimensions, holes, parts lists with balloons, flat patterns, the file's own annotations and a title block. A set is one PDF with a page for each sheet and one DXF and one SVG with the sheets side by side. */
export type DrawingDrawBody = components["schemas"]["DrawingDrawBody"];
/** What the exact method was predicted to take on CAD Cloud, given whenever a view was drawn by sight: the drawing kernel predicts the seconds a native build takes, and CAD Cloud's kernel was measured to take 1.2 times as long, so the prediction is given times 1.2. An order of magnitude, not a promise: a single model may take from a tenth to several times it. */
export type DrawingExactEstimate = components["schemas"]["DrawingExactEstimate"];
/** A filled triangle, an arrowhead: its three corners as six numbers. */
export type DrawingFill = components["schemas"]["DrawingFill"];
/** How a sheet-metal part is unfolded for its flat pattern. */
export type DrawingFlat = components["schemas"]["DrawingFlat"];
/** A floor of readability the sheet breaks, and why. */
export type DrawingFloor = components["schemas"]["DrawingFloor"];
/** A view frame in the model's space, which is Y-up as a STEP file is read: millimetres, an origin, a normal and a direction. */
export type DrawingFrame = components["schemas"]["DrawingFrame"];
/** One group of paths on the sheet: the view it belongs to (-1 for the sheet's own marks), what it is, its layer, line type, line weight in millimetres and how many paths it holds. */
export type DrawingGroup = components["schemas"]["DrawingGroup"];
/** The hatch on what a section's plane cuts: ansi31 at 45 degrees, 3 mm apart, when left out. */
export type DrawingHatch = components["schemas"]["DrawingHatch"];
/** A hatched cut: the group whose closed paths bound it, the view, the part and the hatch's pattern, angle and spacing. */
export type DrawingHatchUsed = components["schemas"]["DrawingHatchUsed"];
/** A hole table alone: the sheet is these rows and nothing else, in columns as a parts list alone stands. A set writes such sheets after a part's sheet whose hole table runs over it. */
export type DrawingHoleTable = components["schemas"]["DrawingHoleTable"];
/** One row of a hole table, as texts: the hole's tag, its X and Y from the lower left corner of the part's box in the first view, its size and its depth. A text left out is empty. */
export type DrawingHoleTableRow = components["schemas"]["DrawingHoleTableRow"];
/** Read the model in an uploaded STEP file for a drawing without drawing it: its parts and size, the plan with every setting resolved, the layout that plan gives, the sections it could have, the views the file saved ('savedViews'), every part with the name of its product ('parts') and every sheet of the plan written out ('set'). */
export type DrawingInspectBody = components["schemas"]["DrawingInspectBody"];
/** Every sheet of a set written out, each with its fingerprint, the set as a plan with a list of sheets (sent back, it draws the same sheets, with the same fingerprints), and every part with the product it is drawn as. */
export type DrawingInspectedSet = components["schemas"]["DrawingInspectedSet"];
/** One sheet of the set an inspection writes out: as the set will draw it, with the fingerprint the sheet will have when the plan of the set is drawn. */
export type DrawingInspectedSheet = components["schemas"]["DrawingInspectedSheet"];
/** The model as a drawing would read it, without drawing: how many parts it holds, its size, the plan of the first sheet with every setting resolved, the layout that plan gives, the scale each standard sheet would allow, sections the model could be cut by, the views the file saved, every part with its name, and every sheet of the plan written out, ready to edit and send to the draw route. A report delivered as a result always has ok true: when the kernel refuses a run, the task fails with the kernel's reason instead. */
export type DrawingInspection = components["schemas"]["DrawingInspection"];
/** A radius callout or a balloon of this sheet's view that another sheet of the set carries: left out here without a warning. */
export type DrawingLeftMark = components["schemas"]["DrawingLeftMark"];
/** One part of the model: its number, as a plan's parts name it; the name of the product the set draws it as, as the sheets of a set name it ('Part n' for a part the file left unnamed, the uploaded file's name for a file whose root the file left unnamed; an unnamed product holding a single part is merged into the product that places it); the product, by the number a sheet's product takes; and which of the product's instances it belongs to, counted from 0 in the order of the model's structure, depth first, as a plan's annotations count them. A part the set draws under no product, such as loose curves beside solids, has an empty name and neither product nor instance. */
export type DrawingModelPart = components["schemas"]["DrawingModelPart"];
/** Where the model the sheets were drawn from came from, and whether this task kept it. */
export type DrawingModelRun = components["schemas"]["DrawingModelRun"];
/** The sheets of the set to draw, by their index in it counting from 0, as the inspection's 'set' and a drawn set's report list them; the others are not drawn. Each sheet is drawn and written as it is in the whole set, its title block numbering it among all of them (SHEET 2 / 5) and its DXF and SVG in the unit the whole set's are, that of its first sheet, and the files hold only the sheets named, in the set's order, laid out as a set of their own; each sheet of the report gives its 'index' and the report gives 'setSheets', how many the whole set has. An index past the set's last sheet fails the task. Left out, every sheet is drawn. With the 'fingerprint' every sheet of an inspection's set and of a drawing carries, an app that keeps the sheets it drew asks only for those whose fingerprint it does not hold. */
export type DrawingOnlySheets = components["schemas"]["DrawingOnlySheets"];
/** Which formats the drawing sheet is written in. */
export type DrawingOutputOptions = components["schemas"]["DrawingOutputOptions"];
/** A parts list drawn above the title block. */
export type DrawingPartsList = components["schemas"]["DrawingPartsList"];
/** One row of a parts list: as texts, the item number, the name, the quantity and the sheet the part is drawn on, and the number of the product it lists. */
export type DrawingPartsListRow = components["schemas"]["DrawingPartsListRow"];
/** What to draw: one sheet, or a set of sheets. Every setting has a default, so an empty plan draws a default sheet; the inspect route returns the plan with every setting spelled out and every sheet of a set written out, ready to edit and send to the draw route. A request body takes at most 128 KB, so a set written out past that, of a model with hundreds of sheets or thousands of parts beneath every level, is uploaded as a JSON file and named in 'planFileId', or sent as its rule. */
export type DrawingPlan = components["schemas"]["DrawingPlan"];
/** How the sheet reads, measured on paper: the height of its own text, the smallest annotation letter, how full the frame is, each view's ink, and the floors it breaks with the reason. A setting the plan states is kept even where it breaks a floor, and the floor is named here. */
export type DrawingQuality = components["schemas"]["DrawingQuality"];
/** The drawing kernel's own answer when it refuses the plan or cannot draw. No result carries it: the API fails the task with its error instead. */
export type DrawingReportError = components["schemas"]["DrawingReportError"];
/** The drawing kernel's own answer when it refuses the plan or cannot draw. No result carries it: the API fails the task with its error instead. */
export type DrawingReportErrorOutput = components["schemas"]["DrawingReportErrorOutput"];
/** One row of an assembly's parts list: its item number from 1, the product's name, how many go directly into the assembly, the product, the index of the sheet that shows it (-1 when none does) and the parts of all its instances. */
export type DrawingResolvedRow = components["schemas"]["DrawingResolvedRow"];
/** One row of the revision table. */
export type DrawingRevision = components["schemas"]["DrawingRevision"];
/** How the drawing was made: the hidden-line method, the method each view was drawn by and the rule that chose it, the seconds each view took and, when a view was drawn by sight, what the exact method would have taken. */
export type DrawingRun = components["schemas"]["DrawingRun"];
/** A view the STEP file saved (an AP242 model view): its name, which a plan's view gives as 'saved', and how many of the file's annotations it shows. */
export type DrawingSavedView = components["schemas"]["DrawingSavedView"];
/** A drawing scale, numerator to denominator: 1 to 50 is { numerator: 1, denominator: 50 }. Between 1:1000 and 100:1. */
export type DrawingScale = components["schemas"]["DrawingScale"];
/** One section through the model. */
export type DrawingSection = components["schemas"]["DrawingSection"];
/** A section the model could be cut by: what it runs through, its frame, the view that sees it edge-on (-1 when none does), how many parts it cuts and the area cut. Adding its frame to a plan's sections draws it. */
export type DrawingSectionCandidate = components["schemas"]["DrawingSectionCandidate"];
/** A part as the set draws it: its number, the product it is drawn as and that product's name as the sheets give it, and which of the product's instances it belongs to, counted from 0 in the order of the model's structure, depth first. */
export type DrawingSetPart = components["schemas"]["DrawingSetPart"];
/** What was drawn: the set as a plan with every sheet written out (sending it back draws the same sheets), the space the sheets take side by side, and each sheet with its place and its report. A PDF has the sheets as pages in this order. Warnings name their sheet when there are several. */
export type DrawingSetReport = components["schemas"]["DrawingSetReport"];
/** Sheets made from the model's product structure, each product once, its instances counted as its quantity. The plan's sections are drawn on the overview sheet alone and every sheet draws a product of the model, so a plan with a rule takes no balloons around a section and no parts list or hole table alone. */
export type DrawingSetRule = components["schemas"]["DrawingSetRule"];
/** One sheet of a set: the settings it states replace the plan's, except sheet and titleBlock, whose fields are laid over the plan's one by one. */
export type DrawingSetSheet = components["schemas"]["DrawingSetSheet"];
/** What a sheet shares with the other sheets of its part. A resolved set writes it into the pages of a sheet it paginated, a continuation sheet for each view that did not fit or would not read beside the others, for the callouts and balloons the first sheet had no room for, and for general notes, so the set, sent back, draws the same sheets. Not given on a parts list or a hole table alone. */
export type DrawingShared = components["schemas"]["DrawingShared"];
/** A radius callout or a balloon another sheet had no room for, drawn on this sheet with a leader to the point it marks. */
export type DrawingSharedMark = components["schemas"]["DrawingSharedMark"];
/** The sheet a drawing is laid out on. */
export type DrawingSheet = components["schemas"]["DrawingSheet"];
/** The sheet's fingerprint, 64 hexadecimal digits: a SHA-256 over all a sheet is drawn from - the checksum of the STEP file and the unit it is read in, how its parts are read, the sheet's plan as the drawing kernel takes it, the file's annotations it is drawn with, the build of the drawing kernel and the build of the CAD Cloud server that reads the file and writes the sheet's files. Drawing is deterministic: a sheet with the same fingerprint is drawn again the same, written byte for byte as before in its files, with the same report but for 'run', which says how long it took. A deploy of the server gives every sheet a new fingerprint. An app can keep a sheet it drew under its fingerprint, and a sheet whose fingerprint changed is stale. */
export type DrawingSheetFingerprint = components["schemas"]["DrawingSheetFingerprint"];
/** A standard sheet, whether the plan's views fit it, and the scale an automatic scale would take on it. */
export type DrawingSheetFit = components["schemas"]["DrawingSheetFit"];
/** The sheet as drawn: its size in millimetres, the frame inside its border, the unit and places its lengths are printed in, the scale used and the series it comes from. */
export type DrawingSheetUsed = components["schemas"]["DrawingSheetUsed"];
/** One text on the sheet: where its baseline starts, its height in millimetres, how far it was narrowed to fit and which end it is anchored by. */
export type DrawingText = components["schemas"]["DrawingText"];
/** The fields of the title block. Every field is empty unless given. */
export type DrawingTitleBlock = components["schemas"]["DrawingTitleBlock"];
/** One view of the model on the sheet. */
export type DrawingView = components["schemas"]["DrawingView"];
/** How one view reads: its smallest annotation letter, how much of it is ink, and what was done to a view too dense to read. */
export type DrawingViewQuality = components["schemas"]["DrawingViewQuality"];
/** One view as drawn: its place on the sheet, its scale and whether it is in line with the base view. */
export type DrawingViewUsed = components["schemas"]["DrawingViewUsed"];
/** One sheet as drawn: what the set says of it, where it lies beside the others, its fingerprint and its report. */
export type DrawnSetSheet = components["schemas"]["DrawnSetSheet"];
/** Structured error information with machine-readable code and optional debugging context */
export type ErrorDetail = components["schemas"]["ErrorDetail"];
/** Standard error envelope */
export type ErrorResponse = components["schemas"]["ErrorResponse"];
/** Execute a single Bitbybit CAD operation. The operation runs asynchronously and returns a task ID for polling. */
export type ExecuteBody = components["schemas"]["ExecuteBody"];
/** Full metadata for an uploaded file */
export type FileDetail = components["schemas"]["FileDetail"];
/** Success envelope containing a single file's metadata */
export type FileDetailResponse = components["schemas"]["FileDetailResponse"];
/** Paginated list of uploaded files with total count */
export type FileList = components["schemas"]["FileList"];
/** Success envelope containing a paginated file list */
export type FileListResponse = components["schemas"]["FileListResponse"];
/** File lifecycle state: 'pending' (upload URL issued, awaiting PUT), 'confirmed' (upload verified and file is usable), 'expired' (upload URL expired before completion) */
export type FileStatus = components["schemas"]["FileStatus"];
/** Request a pre-signed upload URL. After receiving the URL, PUT the raw file bytes to it within the expiration window. */
export type FileUploadBody = components["schemas"]["FileUploadBody"];
/** How node/mesh names are derived from STEP product/instance labels */
export type GltfNameFormat = components["schemas"]["GltfNameFormat"];
/** Transform representation in glTF output */
export type GltfTransformFormat = components["schemas"]["GltfTransformFormat"];
/** Success envelope for health check */
export type HealthResponse = components["schemas"]["HealthResponse"];
/** API health check result indicating overall system status */
export type HealthStatus = components["schemas"]["HealthStatus"];
/** Reference to an uploaded file to be used as input */
export type InputFileItem = components["schemas"]["InputFileItem"];
/** A unit of length: 'mm' (millimetres), 'cm' (centimetres), 'm' (metres) or 'in' (inches). */
export type LengthUnit = components["schemas"]["LengthUnit"];
/** Iterate over an array, executing sub-steps for each element. Produces an array of results (or a reduced value). */
export type MapStep = components["schemas"]["MapStep"];
/** Mesh angular deflection in radians. Range: [0.01, π] */
export type MeshAngle = components["schemas"]["MeshAngle"];
/** Mesh tessellation precision (lower = finer). Range: [0.0001, 10] */
export type MeshPrecision = components["schemas"]["MeshPrecision"];
/** Definitions for multiple models in a single response */
export type ModelBatchDefinitions = components["schemas"]["ModelBatchDefinitions"];
/** Success envelope containing multiple model definitions */
export type ModelBatchDefinitionsResponse = components["schemas"]["ModelBatchDefinitionsResponse"];
/** Full definition of a parametric model including all parameters and their constraints */
export type ModelDefinition = components["schemas"]["ModelDefinition"];
/** Success envelope containing a single model's definition */
export type ModelDefinitionResponse = components["schemas"]["ModelDefinitionResponse"];
/** List of all available parametric models */
export type ModelList = components["schemas"]["ModelList"];
/** Success envelope containing the list of available models */
export type ModelListResponse = components["schemas"]["ModelListResponse"];
/** Data type of a model parameter: 'number' (float), 'integer' (whole number), 'boolean' (true/false), 'array' (list of values) */
export type ModelParamApiType = components["schemas"]["ModelParamApiType"];
/** Schema definition for a single model parameter */
export type ModelParamDefinition = components["schemas"]["ModelParamDefinition"];
/** Submit a parametric model for generation with specified parameters and output formats */
export type ModelSubmissionBody = components["schemas"]["ModelSubmissionBody"];
/** Read the parts of uploaded STEP files as nesting would, without nesting them: each part's file, kind, outline size, area and cut length, or why it cannot be nested. */
export type NestingInspectBody = components["schemas"]["NestingInspectBody"];
/** The settings that change how parts are read (tolerance, xDirection); no stock is needed. Every length is in the parts' units: millimetres on the nesting routes, which read their STEP files in millimetres, and the unit a pipeline models its shapes in for an occtPro.nesting step. */
export type NestingInspectOptions = components["schemas"]["NestingInspectOptions"];
/** Each part as nesting reads it, without nesting. Every length is in the parts' units, millimetres for parts read from STEP files. A report delivered as a result always has ok true: when the kernel refuses a run, the task fails with the kernel's reason instead. */
export type NestingInspection = components["schemas"]["NestingInspection"];
/** Copies of a part that were not placed, and why. */
export type NestingLeft = components["schemas"]["NestingLeft"];
/** Copies of a part that were not placed, and why. */
export type NestingLeftOutput = components["schemas"]["NestingLeftOutput"];
/** Nest the flat parts of uploaded STEP files onto sheets or a strip. A part is a planar face, coplanar faces such as an unfolded sheet-metal part, a plate solid, or a drawing of closed wires; 'stepFileIds' says how parts are read from a file. */
export type NestingNestBody = components["schemas"]["NestingNestBody"];
/** The stock, the per-part options and the settings of a nesting run. Every length is in the parts' units: millimetres on the nesting routes, which read their STEP files in millimetres, and the unit a pipeline models its shapes in for an occtPro.nesting step. */
export type NestingOptions = components["schemas"]["NestingOptions"];
/** A full circle. */
export type NestingOutlineCircle = components["schemas"]["NestingOutlineCircle"];
/** A full circle. */
export type NestingOutlineCircleOutput = components["schemas"]["NestingOutlineCircleOutput"];
/** An ellipse or an arc of one. */
export type NestingOutlineEllipse = components["schemas"]["NestingOutlineEllipse"];
/** An ellipse or an arc of one. */
export type NestingOutlineEllipseOutput = components["schemas"]["NestingOutlineEllipseOutput"];
/** Lines and arcs from vertex to vertex. */
export type NestingOutlinePolyline = components["schemas"]["NestingOutlinePolyline"];
/** Lines and arcs from vertex to vertex. */
export type NestingOutlinePolylineOutput = components["schemas"]["NestingOutlinePolylineOutput"];
/** A B-spline or NURBS curve. */
export type NestingOutlineSpline = components["schemas"]["NestingOutlineSpline"];
/** A B-spline or NURBS curve. */
export type NestingOutlineSplineOutput = components["schemas"]["NestingOutlineSplineOutput"];
/** The cut paths of every placed copy in the frame of its sheet: x along the sheet's width and y along its height from the corner, as the report's placement boxes are; the 'outlines' result of a nest. */
export type NestingOutlines = components["schemas"]["NestingOutlines"];
/** The formats of the nested sheets: 'step' or 'stpz' (each sheet one part, holding its placed parts and its outline), 'gltf', 'decomposed-mesh' (the placed parts, triangulated), 'dxf' (an AutoCAD 2000 drawing in millimetres, or in the unit 'outputs.unit' names: the sheets' outlines on layer SHEETS and the parts' cut paths on layer PARTS, every arc, ellipse and spline exact), 'svg' (the same drawing as an SVG file in the same unit, each layer a group), or 'outlines' (the same cut paths as JSON, each copy in the frame of its sheet and named by its placement, for drawing the layout). A 'dxf' or 'svg' too large to write is left out while every other format is still written, and the task's metadata says why under 'outputsLeftOut' (format to reason); a caveat about a cut file that was written, such as a part whose faces could not be joined into one outline, is given under 'outputNotes' (format to note). */
export type NestingOutputFormat = components["schemas"]["NestingOutputFormat"];
/** Which formats the nested sheets are written in, their mesh quality, and the unit of the DXF and SVG cut files. */
export type NestingOutputOptions = components["schemas"]["NestingOutputOptions"];
/** How one part was read, and how many of its copies were placed. */
export type NestingPartEntry = components["schemas"]["NestingPartEntry"];
/** How one part was read, and how many of its copies were placed. */
export type NestingPartEntryOutput = components["schemas"]["NestingPartEntryOutput"];
/** The options of one part, paired with the part of the same index. */
export type NestingPartOptions = components["schemas"]["NestingPartOptions"];
/** Where one copy of a part was placed. */
export type NestingPlacement = components["schemas"]["NestingPlacement"];
/** Where one copy of a part was placed. */
export type NestingPlacementOutput = components["schemas"]["NestingPlacementOutput"];
/** The layout of a nesting run: the used sheets, every placement with its transform, each part as read, what was left and why, and the totals. Every length is in the parts' units, millimetres for parts read from STEP files. Positions are in the working space, right-handed with Y up; a STEP output turns that space to Z up, a quarter turn about X. A report delivered as a result always has ok true: when the kernel refuses a run, the task fails with the kernel's reason instead. */
export type NestingReport = components["schemas"]["NestingReport"];
/** The nesting kernel's own answer when it refuses the options or is stopped before any part was nested. No result carries it: the API fails the task with its error instead. */
export type NestingReportError = components["schemas"]["NestingReportError"];
/** The nesting kernel's own answer when it refuses the options or is stopped before any part was nested. No result carries it: the API fails the task with its error instead. */
export type NestingReportErrorOutput = components["schemas"]["NestingReportErrorOutput"];
/** How a part may turn on the sheet: a fixed list of angles, steps that divide a full turn, or any angle. Without it a part turns in steps of 90 degrees. */
export type NestingRotations = components["schemas"]["NestingRotations"];
/** How the search ran: whether the same seed gives the same layout again, and whether it was stopped or ran out of time. */
export type NestingRun = components["schemas"]["NestingRun"];
/** How the search ran: whether the same seed gives the same layout again, and whether it was stopped or ran out of time. */
export type NestingRunOutput = components["schemas"]["NestingRunOutput"];
/** One kind of rectangular stock. */
export type NestingSheet = components["schemas"]["NestingSheet"];
/** One used sheet: its stock, where it lies in the working space, and how much of it the parts fill. */
export type NestingSheetEntry = components["schemas"]["NestingSheetEntry"];
/** One used sheet: its stock, where it lies in the working space, and how much of it the parts fill. */
export type NestingSheetEntryOutput = components["schemas"]["NestingSheetEntryOutput"];
/** One strip of open length; it stands alone, never beside other stock. */
export type NestingStrip = components["schemas"]["NestingStrip"];
/** Totals over every used sheet. */
export type NestingTotals = components["schemas"]["NestingTotals"];
/** Totals over every used sheet. */
export type NestingTotalsOutput = components["schemas"]["NestingTotalsOutput"];
/** Output file format: 'step' (raw STEP), 'stpz' (gzip-compressed STEP), 'decomposed-mesh' (triangulated JSON), 'gltf' (glTF 2.0 binary .glb). Note: 'step' and 'stpz' are mutually exclusive - choose one or the other, not both. */
export type OutputFormat = components["schemas"]["OutputFormat"];
/** Controls which output formats are generated and their quality settings */
export type OutputOptions = components["schemas"]["OutputOptions"];
/** Request body for the Phone Nest model */
export type PhoneNestBody = components["schemas"]["PhoneNestBody"];
/** Phone Nest model parameters - all optional, sane defaults apply */
export type PhoneNestParams = components["schemas"]["PhoneNestParams"];
/** A pipeline step - either a plain operation, a map (iteration), or a choice (conditional). */
export type PipelineAnyStep = components["schemas"]["PipelineAnyStep"];
/** Execute a chain of Bitbybit CAD operations sequentially. Supports $ref:N step references, $file:N file inputs, map iteration, and choice conditionals. */
export type PipelineBody = components["schemas"]["PipelineBody"];
/** Pipeline output file format. Includes all standard formats plus: 'json' (JSON data), 'csv' (CSV text), 'stl' (binary STL mesh - Manifold/JSCAD only), '3mf' (3MF mesh package - Manifold/JSCAD only), 'brep' (OpenCascade BREP as text) and 'brep-binary' (OpenCascade binary BREP, the smallest and fastest exact form, which keeps the numbering of faces and edges) - both OCCT only, without triangulation, and both in the frame the pipeline modelled the shape in (Y up), so occt.io.loadBrep and occt.io.loadBrepBinary read them back exactly as they were; a Z-up tool such as FreeCAD shows them lying on their backs, where a 'step' output stands upright. */
export type PipelineOutputFormat = components["schemas"]["PipelineOutputFormat"];
/** Controls which output formats are generated for pipeline results. Supports additional formats (json, csv, stl, 3mf, brep, brep-binary) beyond standard model outputs. */
export type PipelineOutputOptions = components["schemas"]["PipelineOutputOptions"];
/** A single step in a sequential CAD pipeline. Steps can reference outputs of earlier steps via $ref or input files via $file. */
export type PipelineStep = components["schemas"]["PipelineStep"];
/** 3D point as [x, y, z] tuple, each coordinate in [-1000, 1000] */
export type Point3 = components["schemas"]["Point3"];
/** Uniform scale factor. Range: [1e-6, 1000] */
export type PositiveScale = components["schemas"]["PositiveScale"];
/** Metadata about a single downloadable result part */
export type ResultPartMeta = components["schemas"]["ResultPartMeta"];
/** Convert a STEP file to glTF with full control over tessellation, naming, coordinate systems, and output format. */
export type StepToGltfAdvancedBody = components["schemas"]["StepToGltfAdvancedBody"];
/** Convert a STEP file to Draco-compressed glTF with full control over tessellation, naming, coordinate systems, output format, and Draco quantization. */
export type StepToGltfAdvancedWithDracoBody = components["schemas"]["StepToGltfAdvancedWithDracoBody"];
/** Convert a STEP file to glTF format with default settings. Upload the STEP file first, then pass its ID here. */
export type StepToGltfBody = components["schemas"]["StepToGltfBody"];
/** Convert a STEP file to Draco-compressed glTF with default settings. Upload the STEP file first, then pass its ID here. */
export type StepToGltfWithDracoBody = components["schemas"]["StepToGltfWithDracoBody"];
/** Status summary for one sub-task within a compound (parallel) task */
export type SubTaskSummary = components["schemas"]["SubTaskSummary"];
/** HTTP 202 response when a task is accepted for async processing */
export type TaskAcceptedResponse = components["schemas"]["TaskAcceptedResponse"];
/** Returned when a CAD task is accepted. Poll the statusUrl to track progress. */
export type TaskCreatedResult = components["schemas"]["TaskCreatedResult"];
/** Complete task status including lifecycle timestamps, progress, and result metadata */
export type TaskDetail = components["schemas"]["TaskDetail"];
/** Success envelope containing a single task's full details */
export type TaskDetailResponse = components["schemas"]["TaskDetailResponse"];
/** Type of work: 'cad' (single operation), 'model' (parametric model), 'convert-simple'/'convert-advanced' (file conversion), 'pipeline' (sequential chain), 'compound' (parallel batch), 'tenant' (tenant-scoped) */
export type TaskKind = components["schemas"]["TaskKind"];
/** Paginated list of tasks with total count */
export type TaskList = components["schemas"]["TaskList"];
/** Success envelope containing a paginated task list */
export type TaskListResponse = components["schemas"]["TaskListResponse"];
/** Result download link for standard tasks, or a compound manifest with per-sub-task download links */
export type TaskOrCompoundResultResponse = components["schemas"]["TaskOrCompoundResultResponse"];
/** Download information for a completed task result */
export type TaskResultDownload = components["schemas"]["TaskResultDownload"];
/** Success envelope containing a download link for a task result */
export type TaskResultResponse = components["schemas"]["TaskResultResponse"];
/** Download information for all available result formats of a completed task */
export type TaskResultsDownload = components["schemas"]["TaskResultsDownload"];
/** Success envelope containing download links for all result formats */
export type TaskResultsResponse = components["schemas"]["TaskResultsResponse"];
/** Task lifecycle state: waiting (pending dependencies), queued (in queue), processing (actively computing), completed (result available), failed (error occurred), cancelled (user-cancelled), expired (result TTL exceeded) */
export type TaskStatus = components["schemas"]["TaskStatus"];
/** Flatten every constant-thickness sheet-metal solid in an uploaded STEP file and nest the flat patterns on sheets in the same call: the per-solid unfold report, the nesting report and the nested sheets, without writing the flats to a file and reading them back. */
export type UnfoldAndNestBody = components["schemas"]["UnfoldAndNestBody"];
/** Which formats the nested sheets and the flat patterns are written in, their mesh quality, and the unit of the DXF and SVG cut files. */
export type UnfoldAndNestOutputOptions = components["schemas"]["UnfoldAndNestOutputOptions"];
/** One bend: line, angle, radii (inner/outer/neutral and per-end for cones), and developed lengths. */
export type UnfoldBend = components["schemas"]["UnfoldBend"];
/** One bend: line, angle, radii (inner/outer/neutral and per-end for cones), and developed lengths. */
export type UnfoldBendOutput = components["schemas"]["UnfoldBendOutput"];
/** A classified source face: stable key (index + BRepGraph uid), role, and label anchors. */
export type UnfoldFaceEntry = components["schemas"]["UnfoldFaceEntry"];
/** A classified source face: stable key (index + BRepGraph uid), role, and label anchors. */
export type UnfoldFaceEntryOutput = components["schemas"]["UnfoldFaceEntryOutput"];
/** Sheet-metal unfold metrics for a single face (surface type, developability, area before/after). */
export type UnfoldFaceReport = components["schemas"]["UnfoldFaceReport"];
/** Compute the sheet-metal unfold metrics report for a single face of an uploaded STEP shape. */
export type UnfoldFaceReportBody = components["schemas"]["UnfoldFaceReportBody"];
/** Unfold a single developable face of an uploaded STEP shape to a flat face. */
export type UnfoldFaceToFlatBody = components["schemas"]["UnfoldFaceToFlatBody"];
/** How the flat patterns of an unfold are nested: the stock, the copies, how each flat may turn, and the search settings. Every length is in millimetres. */
export type UnfoldNestingOptions = components["schemas"]["UnfoldNestingOptions"];
/** A sub-shape laid into the flat compound, mapped back to its source face (compound order). */
export type UnfoldPlaced = components["schemas"]["UnfoldPlaced"];
/** A sub-shape laid into the flat compound, mapped back to its source face (compound order). */
export type UnfoldPlacedOutput = components["schemas"]["UnfoldPlacedOutput"];
/** Returned when a shape/face cannot be processed by the unfold. */
export type UnfoldReportError = components["schemas"]["UnfoldReportError"];
/** Returned when a shape/face cannot be processed by the unfold. */
export type UnfoldReportErrorOutput = components["schemas"]["UnfoldReportErrorOutput"];
/** Flatten every constant-thickness sheet-metal solid in an uploaded STEP file AND return the per-solid metrics report - both in one call. */
export type UnfoldSolidBody = components["schemas"]["UnfoldSolidBody"];
/** Per-solid sheet-metal unfold metrics - one entry per solid in the STEP file (each carries its solidIndex). */
export type UnfoldSolidReport = components["schemas"]["UnfoldSolidReport"];
/** Compute per-solid sheet-metal unfold metrics for every solid in an uploaded STEP file. */
export type UnfoldSolidReportBody = components["schemas"]["UnfoldSolidReportBody"];
/** Returned when a solid cannot be fully unfolded; carries the partial diagnostics gathered before the failure (classified faces with roles, detected thickness, warnings) so the reason can be inspected. */
export type UnfoldSolidReportError = components["schemas"]["UnfoldSolidReportError"];
/** Returned when a solid cannot be fully unfolded; carries the partial diagnostics gathered before the failure (classified faces with roles, detected thickness, warnings) so the reason can be inspected. */
export type UnfoldSolidReportErrorOutput = components["schemas"]["UnfoldSolidReportErrorOutput"];
/** Sheet-metal unfold metrics for ONE solid (bend table + face roles + original->flat map). On failure, the ok:false branch still carries the partial diagnostics gathered before the failure. */
export type UnfoldSolidReportItem = components["schemas"]["UnfoldSolidReportItem"];
/** Sheet-metal unfold metrics for ONE solid (bend table + face roles + original->flat map). On failure, the ok:false branch still carries the partial diagnostics gathered before the failure. */
export type UnfoldSolidReportItemOutput = components["schemas"]["UnfoldSolidReportItemOutput"];
/** Flatten every constant-thickness sheet-metal solid in an uploaded STEP file to flat patterns. */
export type UnfoldSolidToFlatBody = components["schemas"]["UnfoldSolidToFlatBody"];
/** Success envelope containing the pre-signed upload URL and file metadata */
export type UploadResponse = components["schemas"]["UploadResponse"];
/** Response after requesting a file upload. Contains the pre-signed URL to PUT your file to. */
export type UploadResult = components["schemas"]["UploadResult"];

// ---------------------------------------------------------------------------
// Path-derived query parameter types
// ---------------------------------------------------------------------------

/** Query parameters for listing tasks (pagination, status filter, kind filter) */
export type TaskListQuery = NonNullable<paths["/api/v1/tasks"]["get"]["parameters"]["query"]>;
/** Query parameters for listing files (pagination, status filter) */
export type FileListQuery = NonNullable<paths["/api/v1/files"]["get"]["parameters"]["query"]>;

// ---------------------------------------------------------------------------
// Derived convenience types
// ---------------------------------------------------------------------------

/** A single download entry (element of TaskResultsDownload.downloads). */
export type TaskDownload = TaskResultsDownload["downloads"][number];

/** Maps known model slugs to their typed param interfaces for intellisense. */
export interface ModelParamMap {
    "dragon-cup": DragonCupParams;
    "phone-nest": PhoneNestParams;
}
