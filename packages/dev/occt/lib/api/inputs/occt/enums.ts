// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.

/**
 * How an offset fills the outside of a corner. arc rounds it, intersection extends both sides to
 * their meeting point and leaves a sharp corner, tangent continues each side tangentially. arc is
 * the safe default; intersection can fail on tight corners where the extensions do not meet.
 */
export enum joinTypeEnum {
    arc = "arc",
    intersection = "intersection",
    tangent = "tangent"
}
/**
 * How an offset treats the original shape. skin offsets the surface and keeps only the new skin,
 * pipe builds the swept volume between old and new, rectoVerso offsets in both directions at once.
 */
export enum bRepOffsetModeEnum {
    skin = "skin",
    pipe = "pipe",
    rectoVerso = "rectoVerso"
}
/**
 * How points are spaced along a curve when it is approximated. approxChordLength spaces by
 * distance, approxCentripetal reduces overshoot near sharp turns, approxIsoParametric spaces
 * evenly in parameter space. Centripetal is usually the best behaved for interpolation through
 * unevenly spaced points.
 */
export enum approxParametrizationTypeEnum {
    approxChordLength = "approxChordLength",
    approxCentripetal = "approxCentripetal",
    approxIsoParametric = "approxIsoParametric"
}
/**
 * Which side of the original geometry an operation works on: outside, inside, or centerd on it.
 */
export enum directionEnum {
    outside = "outside",
    inside = "inside",
    middle = "middle"
}
/**
 * The CAD interchange format for import and export: STEP or IGES. STEP is the modern choice and
 * preserves solids and assemblies; IGES is older and surface-oriented.
 */
export enum fileTypeEnum {
    iges = "iges",
    step = "step"
}
/**
 * A shape's orientation within its parent, in OpenCascade's own terms. forward and reversed decide
 * which way a face points and therefore which side is material; internal and external mark shapes
 * that lie inside or outside the volume without bounding it.
 */
export enum topAbsOrientationEnum {
    forward = "forward",
    reversed = "reversed",
    internal = "internal",
    external = "external"
}
/**
 * Where a point or a shape sits relative to another: in, out, on the boundary, or unknown. This is
 * what classification and containment queries return.
 */
export enum topAbsStateEnum {
    in = "in",
    out = "out",
    on = "on",
    unknown = "unknown"
}
/**
 * The kind of a topological shape - vertex, edge, wire, face, shell, solid, compound solid,
 * compound, or the generic shape. Used to filter the results of a query and to check what an
 * operation actually produced.
 */
export enum shapeTypeEnum {
    unknown = "unknown",
    vertex = "vertex",
    edge = "edge",
    wire = "wire",
    face = "face",
    shell = "shell",
    solid = "solid",
    compSolid = "compSolid",
    compound = "compound",
    shape = "shape",
}
/**
 * How a construction constraint qualifies the geometry it references: unqualified, enclosing,
 * enclosed, outside, or no qualifier. Constrained constructions - a circle tangent to two others -
 * can have several valid answers, and this narrows which one is wanted.
 */
export enum gccEntPositionEnum {
    unqualified = "unqualified",
    enclosing = "enclosing",
    enclosed = "enclosed",
    outside = "outside",
    noqualifier = "noqualifier",
}
/**
 * Which of the results of a two-sided construction to keep: the first side, the second, or all of
 * them.
 */
export enum positionResultEnum {
    keepSide1 = "keepSide1",
    keepSide2 = "keepSide2",
    all = "all",
}
/**
 * Whether a construction includes the referenced circle, and if so on which side: none, the first
 * side, or the second.
 */
export enum circleInclusionEnum {
    none = "none",
    keepSide1 = "keepSide1",
    keepSide2 = "keepSide2",
}
/**
 * Which combination of two circles a construction includes: neither, both outside, both inside, or
 * one of each in either order.
 */
export enum twoCircleInclusionEnum {
    none = "none",
    outside = "outside",
    inside = "inside",
    outsideInside = "outsideInside",
    insideOutside = "insideOutside",
}
/**
 * Which combination of sides a four-sided construction keeps: outside, inside, or one of the two
 * mixed orders.
 */
export enum fourSidesStrictEnum {
    outside = "outside",
    inside = "inside",
    outsideInside = "outsideInside",
    insideOutside = "insideOutside",
}
/**
 * Which side of a two-sided construction to keep: outside or inside.
 */
export enum twoSidesStrictEnum {
    outside = "outside",
    inside = "inside",
}
/**
 * How a list of circles is paired up when building faces between them: every circle with every
 * other, sequentially in order, or sequentially and then closing back to the first.
 */
export enum combinationCirclesForFaceEnum {
    allWithAll = "allWithAll",
    inOrder = "inOrder",
    inOrderClosed = "inOrderClosed",
}
/**
 * What kind of shape a generic operation should return - a curve, an edge, a wire or a face - when
 * the result could reasonably be expressed as more than one of them.
 */
export enum typeSpecificityEnum {
    curve,
    edge,
    wire,
    face,
}
/**
 * Which projected points to return when a projection has several solutions: all of them, the
 * closest, the furthest, or both extremes.
 */
export enum pointProjectionTypeEnum {
    all = "all",
    closest = "closest",
    furthest = "furthest",
    closestAndFurthest = "closestAndFurthest",
}
/**
 * How the profile is oriented as it travels along the path in a sweep. This is the setting that
 * decides whether a swept shape twists. isFrenet follows the path's natural curvature and can flip
 * at inflection points; isCorrectedFrenet removes that flipping and is the usual choice; isFixed
 * keeps the profile's orientation constant; the isGuide variants steer the profile using a second
 * guide curve.
 */
export enum geomFillTrihedronEnum {
    isCorrectedFrenet = "isCorrectedFrenet",
    isFixed = "isFixed",
    isFrenet = "isFrenet",
    isConstantNormal = "isConstantNormal",
    isDarboux = "isDarboux",
    isGuideAC = "isGuideAC",
    isGuidePlan = "isGuidePlan",
    isGuideACWithContact = "isGuideACWithContact",
    isGuidePlanWithContact = "isGuidePlanWithContact",
    isDiscreteTrihedron = "isDiscreteTrihedron",
}
/**
 * How colors are written into a DXF file: ACI index colors, which every DXF reader understands,
 * or true color, which is exact but less widely supported.
 */
export enum dxfColorFormatEnum {
    aci = "aci",
    truecolor = "truecolor",
}
/**
 * Which AutoCAD DXF version to write. AC1009 is R12, the most compatible; AC1015 is 2000 and
 * supports more entity types.
 */
export enum dxfAcadVersionEnum {
    AC1009 = "AC1009",
    AC1015 = "AC1015",
}
/**
 * How a dimension line terminates: with nothing, or with an arrowhead.
 */
export enum dimensionEndTypeEnum {
    none = "none",
    arrow = "arrow",
}
/**
 * How a wire is built through a list of points: polyline joins them with straight segments,
 * interpolated fits a smooth curve that passes through every one.
 */
export enum wireFromPointsTypeEnum {
    polyline = "polyline",
    interpolated = "interpolated",
}
/**
 * How corners are detected. auto handles any geometry; planarOnly restricts detection to planar
 * faces, which is faster and avoids false positives on curved surfaces.
 */
export enum cornerModeEnum {
    auto = "auto",
    planarOnly = "planarOnly",
}
/**
 * How a union or a difference goes through its shapes. oneAfterAnother takes one shape per step:
 * right for any shapes, and the edge and face numbering results have always had. inGroups puts shapes
 * whose boxes do not meet into one step: faster, numbered differently. allAtOnce takes every shape in
 * one step: fast, but wrong without an error where shapes touch each other at a single point.
 */
export enum booleanStrategyEnum {
    oneAfterAnother = "oneAfterAnother",
    inGroups = "inGroups",
    allAtOnce = "allAtOnce",
}
/**
 * The kind of surface a face lies on: the analytic ones (plane, cylinder, cone, sphere, torus), Bezier
 * and B-spline patches, surfaces of revolution and extrusion, offsets of another surface, and other.
 */
export enum surfaceTypeEnum {
    plane = "plane",
    cylinder = "cylinder",
    cone = "cone",
    sphere = "sphere",
    torus = "torus",
    bezier = "bezier",
    bspline = "bspline",
    revolution = "revolution",
    extrusion = "extrusion",
    offset = "offset",
    other = "other",
}
/**
 * The kind of curve an edge runs along: line, circle, ellipse, hyperbola, parabola, Bezier and
 * B-spline curves, offsets of another curve, and other.
 */
export enum curveTypeEnum {
    line = "line",
    circle = "circle",
    ellipse = "ellipse",
    hyperbola = "hyperbola",
    parabola = "parabola",
    bezier = "bezier",
    bspline = "bspline",
    offset = "offset",
    other = "other",
}
/**
 * How a frame follows a curve. frenet lies in the plane the curve bends in, its direction along the
 * tangent, and has no normal where the curve runs straight. perpendicular stands across the curve,
 * level with an up vector. rotationMinimizing stands across the curve and is carried along it from
 * the start without twisting, the way a swept profile rides.
 */
export enum curveFrameEnum {
    frenet = "frenet",
    perpendicular = "perpendicular",
    rotationMinimizing = "rotationMinimizing",
}
/**
 * What a surface analysis shows at each point of a face. none leaves the faces as they are; gaussian
 * and mean are the Gaussian and mean curvature, maxCurvature and minCurvature the two principal
 * curvatures, positive where the face bulges out; minRadius is 1 over the larger principal curvature,
 * infinite where the face is flat; draftAngle is the angle in degrees between the face and a pull
 * direction, positive where the face looks along the pull.
 */
export enum surfaceAnalysisEnum {
    none = "none",
    gaussian = "gaussian",
    mean = "mean",
    maxCurvature = "maxCurvature",
    minCurvature = "minCurvature",
    minRadius = "minRadius",
    draftAngle = "draftAngle",
}
/**
 * How a filled patch meets one of its boundary edges. position only passes through the edge; tangent
 * also meets the face beside the edge without a crease; curvature also bends as that face does there.
 */
export enum continuityEnum {
    position = "position",
    tangent = "tangent",
    curvature = "curvature",
}
/**
 * How a patch fills between its boundary edges. With three or four edges, coons blends the edges,
 * stretch is flatter and curved rounder. With two edges, stretch and coons join them as opposite
 * sides, while curved sweeps one along the other, so the two must share a corner.
 */
export enum fillingStyleEnum {
    stretch = "stretch",
    coons = "coons",
    curved = "curved",
}
/**
 * How far a boss or a pocket runs from its sketch face. length stops after the given length,
 * untilFace stops at a chosen face of the base, and throughAll runs through the whole base.
 */
export enum featureExtentEnum {
    length = "length",
    untilFace = "untilFace",
    throughAll = "throughAll",
}
