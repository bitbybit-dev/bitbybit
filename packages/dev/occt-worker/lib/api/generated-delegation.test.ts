import { describe, it, expect, beforeEach } from "vitest";
import { OCCTWorkerManager } from "../occ-worker/occ-worker-manager";
import { OCCT } from "./occt/occt";
import * as Inputs from "@bitbybit-dev/occt/lib/api/inputs";

// The API layer under lib/api is generated from the kernel: every method is one call posting its own
// dotted path to the worker. What is generated is pinned byte for byte by check:worker-api, and the
// set of paths by check:worker-parity - but neither of those runs a single line of it. This suite
// does, across the shapes of method the generator emits, so a generator change that produced valid
// code doing the wrong thing fails here.

type PostedCall = { action: { functionName: string; inputs: unknown }; uid: string };

// The worker the manager talks to, recording what reaches it instead of running anything.
class RecordingWorker extends EventTarget implements Worker {
    readonly posted: PostedCall[] = [];
    onmessage: Worker["onmessage"] = null;
    onmessageerror: Worker["onmessageerror"] = null;
    onerror: Worker["onerror"] = null;

    postMessage(message: PostedCall): void {
        this.posted.push(message);
    }

    terminate(): void {
        this.posted.length = 0;
    }
}

const SPHERE_RADIUS = 5;
const WIRE_POINTER: Inputs.OCCT.TopoDSWirePointer = { hash: 1, type: "occ-shape" };

// One object stands in for every method's inputs. Each method hands its argument straight to the
// manager without reading it, so what the argument is cannot matter - only that the same object
// arrives on the wire. It is declared opaque and handed to each method as whatever that method
// takes, which is the one thing about it the test does not want checked.
const SENTINEL_INPUTS: unknown = { sentinel: "delegation" };
const asInputs = <T>(): T => SENTINEL_INPUTS as T;

// Every generated method whose body is one call, with the path it must post. A method missing here is
// a method no test runs; a path spelled wrong here fails against the kernel the generator read. The
// seven methods that do more than post - the downloads and the text wires - have their own suites.
const DELEGATIONS: [string, (occt: OCCT) => unknown][] = [
    ["assembly.manager.buildAssemblyDocument", (o) => o.assembly.manager.buildAssemblyDocument(asInputs())],
    ["assembly.manager.combineStructure", (o) => o.assembly.manager.combineStructure(asInputs())],
    ["assembly.manager.createAssemblyNode", (o) => o.assembly.manager.createAssemblyNode(asInputs())],
    ["assembly.manager.createImportedPart", (o) => o.assembly.manager.createImportedPart(asInputs())],
    ["assembly.manager.createInstanceNode", (o) => o.assembly.manager.createInstanceNode(asInputs())],
    ["assembly.manager.createPart", (o) => o.assembly.manager.createPart(asInputs())],
    ["assembly.manager.createPartUpdate", (o) => o.assembly.manager.createPartUpdate(asInputs())],
    ["assembly.manager.setLabelColor", (o) => o.assembly.manager.setDocLabelColor(asInputs())],
    ["assembly.manager.setLabelName", (o) => o.assembly.manager.setDocLabelName(asInputs())],
    ["assembly.query.getAssemblyHierarchy", (o) => o.assembly.query.getAssemblyHierarchy(asInputs())],
    ["assembly.query.getDocumentParts", (o) => o.assembly.query.getDocumentParts(asInputs())],
    ["assembly.query.getLabelColor", (o) => o.assembly.query.getLabelColor(asInputs())],
    ["assembly.query.getLabelInfo", (o) => o.assembly.query.getLabelInfo(asInputs())],
    ["assembly.query.getLabelTransform", (o) => o.assembly.query.getLabelTransform(asInputs())],
    ["assembly.query.getShapeFromLabel", (o) => o.assembly.query.getShapeFromLabel(asInputs())],
    ["booleans.difference", (o) => o.booleans.difference(asInputs())],
    ["booleans.intersection", (o) => o.booleans.intersection(asInputs())],
    ["booleans.meshMeshIntersectionOfShapesPoints", (o) => o.booleans.meshMeshIntersectionOfShapesPoints(asInputs())],
    ["booleans.meshMeshIntersectionOfShapesWires", (o) => o.booleans.meshMeshIntersectionOfShapesWires(asInputs())],
    ["booleans.meshMeshIntersectionPoints", (o) => o.booleans.meshMeshIntersectionPoints(asInputs())],
    ["booleans.meshMeshIntersectionWires", (o) => o.booleans.meshMeshIntersectionWires(asInputs())],
    ["booleans.union", (o) => o.booleans.union(asInputs())],
    ["brepGraph.analyze", (o) => o.brepGraph.analyze(asInputs())],
    ["brepGraph.assembly", (o) => o.brepGraph.assembly(asInputs())],
    ["brepGraph.containment", (o) => o.brepGraph.containment(asInputs())],
    ["brepGraph.dump", (o) => o.brepGraph.dump(asInputs())],
    ["brepGraph.edgeFaceMap", (o) => o.brepGraph.edgeFaceMap(asInputs())],
    ["brepGraph.edgeInfo", (o) => o.brepGraph.edgeInfo(asInputs())],
    ["brepGraph.faceAdjacency", (o) => o.brepGraph.faceAdjacency(asInputs())],
    ["brepGraph.faceInfo", (o) => o.brepGraph.faceInfo(asInputs())],
    ["brepGraph.nodeOfShape", (o) => o.brepGraph.nodeOfShape(asInputs())],
    ["brepGraph.reconstruct", (o) => o.brepGraph.reconstruct(asInputs())],
    ["brepGraph.validate", (o) => o.brepGraph.validate(asInputs())],
    ["brepGraph.vertexEdgeMap", (o) => o.brepGraph.vertexEdgeMap(asInputs())],
    ["brepGraph.wireInfo", (o) => o.brepGraph.wireInfo(asInputs())],
    ["cleanAllCache", (o) => o.cleanAllCache()],
    ["corners.chamferCornerByPoint", (o) => o.corners.chamferCornerByPoint(asInputs())],
    ["corners.classifyCornerByPoint", (o) => o.corners.classifyCornerByPoint(asInputs())],
    ["corners.cornerByPointReport", (o) => o.corners.cornerByPointReport(asInputs())],
    ["corners.filletCornerByPoint", (o) => o.corners.filletCornerByPoint(asInputs())],
    ["deleteDocument", (o) => o.assembly.manager.deleteDocument(asInputs())],
    ["deleteShape", (o) => o.deleteShape(asInputs())],
    ["deleteShapes", (o) => o.deleteShapes(asInputs())],
    ["dimensions.pinWithLabel", (o) => o.dimensions.pinWithLabel(asInputs())],
    ["dimensions.simpleAngularDimension", (o) => o.dimensions.simpleAngularDimension(asInputs())],
    ["dimensions.simpleLinearLengthDimension", (o) => o.dimensions.simpleLinearLengthDimension(asInputs())],
    ["docToMesh", (o) => o.docToMesh(asInputs())],
    ["docToMeshes", (o) => o.docToMeshes(asInputs())],
    ["draft.draftAngle", (o) => o.draft.draftAngle(asInputs())],
    ["draft.makeDraft", (o) => o.draft.makeDraft(asInputs())],
    ["draft.makeDraftToShape", (o) => o.draft.makeDraftToShape(asInputs())],
    ["fillets.chamfer2dVertices", (o) => o.fillets.chamfer2dVertices(asInputs())],
    ["fillets.chamferEdgeDistAngle", (o) => o.fillets.chamferEdgeDistAngle(asInputs())],
    ["fillets.chamferEdgeTwoDistances", (o) => o.fillets.chamferEdgeTwoDistances(asInputs())],
    ["fillets.chamferEdges", (o) => o.fillets.chamferEdges(asInputs())],
    ["fillets.chamferEdgesDistAngle", (o) => o.fillets.chamferEdgesDistAngle(asInputs())],
    ["fillets.chamferEdgesDistsAngles", (o) => o.fillets.chamferEdgesDistsAngles(asInputs())],
    ["fillets.chamferEdgesList", (o) => o.fillets.chamferEdgesList(asInputs())],
    ["fillets.chamferEdgesTwoDistances", (o) => o.fillets.chamferEdgesTwoDistances(asInputs())],
    ["fillets.chamferEdgesTwoDistancesLists", (o) => o.fillets.chamferEdgesTwoDistancesLists(asInputs())],
    ["fillets.fillet2d", (o) => o.fillets.fillet2d(asInputs())],
    ["fillets.fillet2dShapes", (o) => o.fillets.fillet2dShapes(asInputs())],
    ["fillets.fillet3DWire", (o) => o.fillets.fillet3DWire(asInputs())],
    ["fillets.fillet3DWires", (o) => o.fillets.fillet3DWires(asInputs())],
    ["fillets.filletEdgeVariableRadius", (o) => o.fillets.filletEdgeVariableRadius(asInputs())],
    ["fillets.filletEdges", (o) => o.fillets.filletEdges(asInputs())],
    ["fillets.filletEdgesList", (o) => o.fillets.filletEdgesList(asInputs())],
    ["fillets.filletEdgesListOneRadius", (o) => o.fillets.filletEdgesListOneRadius(asInputs())],
    ["fillets.filletEdgesSameVariableRadius", (o) => o.fillets.filletEdgesSameVariableRadius(asInputs())],
    ["fillets.filletEdgesVariableRadius", (o) => o.fillets.filletEdgesVariableRadius(asInputs())],
    ["fillets.filletTwoEdgesInPlaneIntoAWire", (o) => o.fillets.filletTwoEdgesInPlaneIntoAWire(asInputs())],
    ["geom.curves.geom2dEllipse", (o) => o.geom.curves.geom2dEllipse(asInputs())],
    ["geom.curves.geom2dSegment", (o) => o.geom.curves.geom2dSegment(asInputs())],
    ["geom.curves.geom2dTrimmedCurve", (o) => o.geom.curves.geom2dTrimmedCurve(asInputs())],
    ["geom.curves.geomCircleCurve", (o) => o.geom.curves.geomCircleCurve(asInputs())],
    ["geom.curves.geomEllipseCurve", (o) => o.geom.curves.geomEllipseCurve(asInputs())],
    ["geom.curves.get2dPointFrom2dCurveOnParam", (o) => o.geom.curves.get2dPointFrom2dCurveOnParam(asInputs())],
    ["geom.surfaces.cylindricalSurface", (o) => o.geom.surfaces.cylindricalSurface(asInputs())],
    ["geom.surfaces.surfaceFromFace", (o) => o.geom.surfaces.surfaceFromFace(asInputs())],
    ["io.dxfPathsWithLayer", (o) => o.io.dxfPathsWithLayer(asInputs())],
    ["io.shapeToDxfPaths", (o) => o.io.shapeToDxfPaths(asInputs())],
    ["operations.boundingBoxCenterOfShape", (o) => o.operations.boundingBoxCenterOfShape(asInputs())],
    ["operations.boundingBoxMaxOfShape", (o) => o.operations.boundingBoxMaxOfShape(asInputs())],
    ["operations.boundingBoxMinOfShape", (o) => o.operations.boundingBoxMinOfShape(asInputs())],
    ["operations.boundingBoxOfShape", (o) => o.operations.boundingBoxOfShape(asInputs())],
    ["operations.boundingBoxShapeOfShape", (o) => o.operations.boundingBoxShapeOfShape(asInputs())],
    ["operations.boundingBoxSizeOfShape", (o) => o.operations.boundingBoxSizeOfShape(asInputs())],
    ["operations.boundingSphereCenterOfShape", (o) => o.operations.boundingSphereCenterOfShape(asInputs())],
    ["operations.boundingSphereOfShape", (o) => o.operations.boundingSphereOfShape(asInputs())],
    ["operations.boundingSphereRadiusOfShape", (o) => o.operations.boundingSphereRadiusOfShape(asInputs())],
    ["operations.boundingSphereShapeOfShape", (o) => o.operations.boundingSphereShapeOfShape(asInputs())],
    ["operations.closestPointsBetweenTwoShapes", (o) => o.operations.closestPointsBetweenTwoShapes(asInputs())],
    ["operations.closestPointsOnShapeFromPoints", (o) => o.operations.closestPointsOnShapeFromPoints(asInputs())],
    ["operations.closestPointsOnShapesFromPoints", (o) => o.operations.closestPointsOnShapesFromPoints(asInputs())],
    ["operations.distancesToShapeFromPoints", (o) => o.operations.distancesToShapeFromPoints(asInputs())],
    ["operations.extrude", (o) => o.operations.extrude(asInputs())],
    ["operations.extrudeShapes", (o) => o.operations.extrudeShapes(asInputs())],
    ["operations.loft", (o) => o.operations.loft(asInputs())],
    ["operations.loftAdvanced", (o) => o.operations.loftAdvanced(asInputs())],
    ["operations.makeThickSolidByJoin", (o) => o.operations.makeThickSolidByJoin(asInputs())],
    ["operations.makeThickSolidSimple", (o) => o.operations.makeThickSolidSimple(asInputs())],
    ["operations.offset", (o) => o.operations.offset(asInputs())],
    ["operations.offset3DWire", (o) => o.operations.offset3DWire(asInputs())],
    ["operations.offsetAdv", (o) => o.operations.offsetAdv(asInputs())],
    ["operations.pipe", (o) => o.operations.pipe(asInputs())],
    ["operations.pipePolylineWireNGon", (o) => o.operations.pipePolylineWireNGon(asInputs())],
    ["operations.pipeWireCylindrical", (o) => o.operations.pipeWireCylindrical(asInputs())],
    ["operations.pipeWiresCylindrical", (o) => o.operations.pipeWiresCylindrical(asInputs())],
    ["operations.revolve", (o) => o.operations.revolve(asInputs())],
    ["operations.rotatedExtrude", (o) => o.operations.rotatedExtrude(asInputs())],
    ["operations.slice", (o) => o.operations.slice(asInputs())],
    ["operations.sliceInStepPattern", (o) => o.operations.sliceInStepPattern(asInputs())],
    ["operations.splitShapeWithShapes", (o) => o.operations.splitShapeWithShapes(asInputs())],
    ["path.shapeFromPath", (o) => o.path.shapeFromPath(asInputs())],
    ["shapeFacesToPolygonPoints", (o) => o.shapeFacesToPolygonPoints(asInputs())],
    ["shapeFix.basicShapeRepair", (o) => o.shapeFix.basicShapeRepair(asInputs())],
    ["shapeFix.fixEdgeOrientationsAlongWire", (o) => o.shapeFix.fixEdgeOrientationsAlongWire(asInputs())],
    ["shapeFix.fixSmallEdgeOnWire", (o) => o.shapeFix.fixSmallEdgeOnWire(asInputs())],
    ["shapeToMesh", (o) => o.shapeToMesh(asInputs())],
    ["shapes.compound.getShapesOfCompound", (o) => o.shapes.compound.getShapesOfCompound(asInputs())],
    ["shapes.compound.makeCompound", (o) => o.shapes.compound.makeCompound(asInputs())],
    ["shapes.edge.arcFromCircleAndTwoAngles", (o) => o.shapes.edge.arcFromCircleAndTwoAngles(asInputs())],
    ["shapes.edge.arcFromCircleAndTwoPoints", (o) => o.shapes.edge.arcFromCircleAndTwoPoints(asInputs())],
    ["shapes.edge.arcFromCirclePointAndAngle", (o) => o.shapes.edge.arcFromCirclePointAndAngle(asInputs())],
    ["shapes.edge.arcThroughThreePoints", (o) => o.shapes.edge.arcThroughThreePoints(asInputs())],
    ["shapes.edge.arcThroughTwoPointsAndTangent", (o) => o.shapes.edge.arcThroughTwoPointsAndTangent(asInputs())],
    ["shapes.edge.constraintTanCirclesOnCircleAndPnt", (o) => o.shapes.edge.constraintTanCirclesOnCircleAndPnt(asInputs())],
    ["shapes.edge.constraintTanCirclesOnTwoCircles", (o) => o.shapes.edge.constraintTanCirclesOnTwoCircles(asInputs())],
    ["shapes.edge.constraintTanLinesFromPtToCircle", (o) => o.shapes.edge.constraintTanLinesFromPtToCircle(asInputs())],
    ["shapes.edge.constraintTanLinesFromTwoPtsToCircle", (o) => o.shapes.edge.constraintTanLinesFromTwoPtsToCircle(asInputs())],
    ["shapes.edge.constraintTanLinesOnTwoCircles", (o) => o.shapes.edge.constraintTanLinesOnTwoCircles(asInputs())],
    ["shapes.edge.createCircleEdge", (o) => o.shapes.edge.createCircleEdge(asInputs())],
    ["shapes.edge.createEllipseEdge", (o) => o.shapes.edge.createEllipseEdge(asInputs())],
    ["shapes.edge.debugInfo", (o) => o.shapes.edge.debugInfo(asInputs())],
    ["shapes.edge.divideEdgeByEqualDistanceToPoints", (o) => o.shapes.edge.divideEdgeByEqualDistanceToPoints(asInputs())],
    ["shapes.edge.divideEdgeByParamsToPoints", (o) => o.shapes.edge.divideEdgeByParamsToPoints(asInputs())],
    ["shapes.edge.divideEdgesByEqualDistanceToPoints", (o) => o.shapes.edge.divideEdgesByEqualDistanceToPoints(asInputs())],
    ["shapes.edge.divideEdgesByParamsToPoints", (o) => o.shapes.edge.divideEdgesByParamsToPoints(asInputs())],
    ["shapes.edge.edgesToPoints", (o) => o.shapes.edge.edgesToPoints(asInputs())],
    ["shapes.edge.endPointOnEdge", (o) => o.shapes.edge.endPointOnEdge(asInputs())],
    ["shapes.edge.endPointsOnEdges", (o) => o.shapes.edge.endPointsOnEdges(asInputs())],
    ["shapes.edge.fromBaseLine", (o) => o.shapes.edge.fromBaseLine(asInputs())],
    ["shapes.edge.fromBaseLines", (o) => o.shapes.edge.fromBaseLines(asInputs())],
    ["shapes.edge.fromBaseMesh", (o) => o.shapes.edge.fromBaseMesh(asInputs())],
    ["shapes.edge.fromBasePolyline", (o) => o.shapes.edge.fromBasePolyline(asInputs())],
    ["shapes.edge.fromBaseSegment", (o) => o.shapes.edge.fromBaseSegment(asInputs())],
    ["shapes.edge.fromBaseSegments", (o) => o.shapes.edge.fromBaseSegments(asInputs())],
    ["shapes.edge.fromBaseTriangle", (o) => o.shapes.edge.fromBaseTriangle(asInputs())],
    ["shapes.edge.fromPoints", (o) => o.shapes.edge.fromPoints(asInputs())],
    ["shapes.edge.getCircularEdgeCenterPoint", (o) => o.shapes.edge.getCircularEdgeCenterPoint(asInputs())],
    ["shapes.edge.getCircularEdgePlaneDirection", (o) => o.shapes.edge.getCircularEdgePlaneDirection(asInputs())],
    ["shapes.edge.getCircularEdgeRadius", (o) => o.shapes.edge.getCircularEdgeRadius(asInputs())],
    ["shapes.edge.getCircularEdgesAlongWire", (o) => o.shapes.edge.getCircularEdgesAlongWire(asInputs())],
    ["shapes.edge.getCornerPointsOfEdgesForShape", (o) => o.shapes.edge.getCornerPointsOfEdgesForShape(asInputs())],
    ["shapes.edge.getEdge", (o) => o.shapes.edge.getEdge(asInputs())],
    ["shapes.edge.getEdgeCenterOfMass", (o) => o.shapes.edge.getEdgeCenterOfMass(asInputs())],
    ["shapes.edge.getEdgeLength", (o) => o.shapes.edge.getEdgeLength(asInputs())],
    ["shapes.edge.getEdgeLengthsOfShape", (o) => o.shapes.edge.getEdgeLengthsOfShape(asInputs())],
    ["shapes.edge.getEdges", (o) => o.shapes.edge.getEdges(asInputs())],
    ["shapes.edge.getEdgesAlongWire", (o) => o.shapes.edge.getEdgesAlongWire(asInputs())],
    ["shapes.edge.getEdgesCentersOfMass", (o) => o.shapes.edge.getEdgesCentersOfMass(asInputs())],
    ["shapes.edge.getEdgesLengths", (o) => o.shapes.edge.getEdgesLengths(asInputs())],
    ["shapes.edge.getLinearEdgesAlongWire", (o) => o.shapes.edge.getLinearEdgesAlongWire(asInputs())],
    ["shapes.edge.isEdgeCircular", (o) => o.shapes.edge.isEdgeCircular(asInputs())],
    ["shapes.edge.isEdgeLinear", (o) => o.shapes.edge.isEdgeLinear(asInputs())],
    ["shapes.edge.line", (o) => o.shapes.edge.line(asInputs())],
    ["shapes.edge.makeEdgeFromGeom2dCurveAndSurface", (o) => o.shapes.edge.makeEdgeFromGeom2dCurveAndSurface(asInputs())],
    ["shapes.edge.moveEdgeSeamByLength", (o) => o.shapes.edge.moveEdgeSeamByLength(asInputs())],
    ["shapes.edge.moveEdgeSeamByParameter", (o) => o.shapes.edge.moveEdgeSeamByParameter(asInputs())],
    ["shapes.edge.pointOnEdgeAtLength", (o) => o.shapes.edge.pointOnEdgeAtLength(asInputs())],
    ["shapes.edge.pointOnEdgeAtParam", (o) => o.shapes.edge.pointOnEdgeAtParam(asInputs())],
    ["shapes.edge.pointsOnEdgesAtLength", (o) => o.shapes.edge.pointsOnEdgesAtLength(asInputs())],
    ["shapes.edge.pointsOnEdgesAtParam", (o) => o.shapes.edge.pointsOnEdgesAtParam(asInputs())],
    ["shapes.edge.rebuildEdgeDegree", (o) => o.shapes.edge.rebuildEdgeDegree(asInputs())],
    ["shapes.edge.removeInternalEdges", (o) => o.shapes.edge.removeInternalEdges(asInputs())],
    ["shapes.edge.reversedEdge", (o) => o.shapes.edge.reversedEdge(asInputs())],
    ["shapes.edge.startPointOnEdge", (o) => o.shapes.edge.startPointOnEdge(asInputs())],
    ["shapes.edge.startPointsOnEdges", (o) => o.shapes.edge.startPointsOnEdges(asInputs())],
    ["shapes.edge.tangentOnEdgeAtLength", (o) => o.shapes.edge.tangentOnEdgeAtLength(asInputs())],
    ["shapes.edge.tangentOnEdgeAtParam", (o) => o.shapes.edge.tangentOnEdgeAtParam(asInputs())],
    ["shapes.edge.tangentsOnEdgesAtLength", (o) => o.shapes.edge.tangentsOnEdgesAtLength(asInputs())],
    ["shapes.edge.tangentsOnEdgesAtParam", (o) => o.shapes.edge.tangentsOnEdgesAtParam(asInputs())],
    ["shapes.face.createChristmasTreeFace", (o) => o.shapes.face.createChristmasTreeFace(asInputs())],
    ["shapes.face.createCircleFace", (o) => o.shapes.face.createCircleFace(asInputs())],
    ["shapes.face.createEllipseFace", (o) => o.shapes.face.createEllipseFace(asInputs())],
    ["shapes.face.createFaceFromMultipleCircleTanWireCollections", (o) => o.shapes.face.createFaceFromMultipleCircleTanWireCollections(asInputs())],
    ["shapes.face.createFaceFromMultipleCircleTanWires", (o) => o.shapes.face.createFaceFromMultipleCircleTanWires(asInputs())],
    ["shapes.face.createFaceFromWire", (o) => o.shapes.face.createFaceFromWire(asInputs())],
    ["shapes.face.createFaceFromWireOnFace", (o) => o.shapes.face.createFaceFromWireOnFace(asInputs())],
    ["shapes.face.createFaceFromWires", (o) => o.shapes.face.createFaceFromWires(asInputs())],
    ["shapes.face.createFaceFromWiresOnFace", (o) => o.shapes.face.createFaceFromWiresOnFace(asInputs())],
    ["shapes.face.createFacesFromWires", (o) => o.shapes.face.createFacesFromWires(asInputs())],
    ["shapes.face.createFacesFromWiresOnFace", (o) => o.shapes.face.createFacesFromWiresOnFace(asInputs())],
    ["shapes.face.createHBeamProfileFace", (o) => o.shapes.face.createHBeamProfileFace(asInputs())],
    ["shapes.face.createHeartFace", (o) => o.shapes.face.createHeartFace(asInputs())],
    ["shapes.face.createIBeamProfileFace", (o) => o.shapes.face.createIBeamProfileFace(asInputs())],
    ["shapes.face.createLPolygonFace", (o) => o.shapes.face.createLPolygonFace(asInputs())],
    ["shapes.face.createNGonFace", (o) => o.shapes.face.createNGonFace(asInputs())],
    ["shapes.face.createParallelogramFace", (o) => o.shapes.face.createParallelogramFace(asInputs())],
    ["shapes.face.createPolygonFace", (o) => o.shapes.face.createPolygonFace(asInputs())],
    ["shapes.face.createRectangleFace", (o) => o.shapes.face.createRectangleFace(asInputs())],
    ["shapes.face.createSquareFace", (o) => o.shapes.face.createSquareFace(asInputs())],
    ["shapes.face.createStarFace", (o) => o.shapes.face.createStarFace(asInputs())],
    ["shapes.face.createTBeamProfileFace", (o) => o.shapes.face.createTBeamProfileFace(asInputs())],
    ["shapes.face.createUBeamProfileFace", (o) => o.shapes.face.createUBeamProfileFace(asInputs())],
    ["shapes.face.debugInfo", (o) => o.shapes.face.debugInfo(asInputs())],
    ["shapes.face.faceFromSurface", (o) => o.shapes.face.faceFromSurface(asInputs())],
    ["shapes.face.faceFromSurfaceAndWire", (o) => o.shapes.face.faceFromSurfaceAndWire(asInputs())],
    ["shapes.face.filterFacePoints", (o) => o.shapes.face.filterFacePoints(asInputs())],
    ["shapes.face.filterFacesPoints", (o) => o.shapes.face.filterFacesPoints(asInputs())],
    ["shapes.face.flipFaceUV", (o) => o.shapes.face.flipFaceUV(asInputs())],
    ["shapes.face.fromBaseMesh", (o) => o.shapes.face.fromBaseMesh(asInputs())],
    ["shapes.face.fromBaseTriangle", (o) => o.shapes.face.fromBaseTriangle(asInputs())],
    ["shapes.face.getFace", (o) => o.shapes.face.getFace(asInputs())],
    ["shapes.face.getFaceArea", (o) => o.shapes.face.getFaceArea(asInputs())],
    ["shapes.face.getFaceCenterOfMass", (o) => o.shapes.face.getFaceCenterOfMass(asInputs())],
    ["shapes.face.getFaces", (o) => o.shapes.face.getFaces(asInputs())],
    ["shapes.face.getFacesAreas", (o) => o.shapes.face.getFacesAreas(asInputs())],
    ["shapes.face.getFacesCentersOfMass", (o) => o.shapes.face.getFacesCentersOfMass(asInputs())],
    ["shapes.face.getUMaxBound", (o) => o.shapes.face.getUMaxBound(asInputs())],
    ["shapes.face.getUMinBound", (o) => o.shapes.face.getUMinBound(asInputs())],
    ["shapes.face.getVMaxBound", (o) => o.shapes.face.getVMaxBound(asInputs())],
    ["shapes.face.getVMinBound", (o) => o.shapes.face.getVMinBound(asInputs())],
    ["shapes.face.hexagonsInGrid", (o) => o.shapes.face.hexagonsInGrid(asInputs())],
    ["shapes.face.normalOnUV", (o) => o.shapes.face.normalOnUV(asInputs())],
    ["shapes.face.normalizeFaceParametrization", (o) => o.shapes.face.normalizeFaceParametrization(asInputs())],
    ["shapes.face.normalsOnUVs", (o) => o.shapes.face.normalsOnUVs(asInputs())],
    ["shapes.face.pointOnUV", (o) => o.shapes.face.pointOnUV(asInputs())],
    ["shapes.face.pointsOnUVs", (o) => o.shapes.face.pointsOnUVs(asInputs())],
    ["shapes.face.rebuildFaceDegree", (o) => o.shapes.face.rebuildFaceDegree(asInputs())],
    ["shapes.face.reversedFace", (o) => o.shapes.face.reversedFace(asInputs())],
    ["shapes.face.subdivideToHexagonHoles", (o) => o.shapes.face.subdivideToHexagonHoles(asInputs())],
    ["shapes.face.subdivideToHexagonWires", (o) => o.shapes.face.subdivideToHexagonWires(asInputs())],
    ["shapes.face.subdivideToNormals", (o) => o.shapes.face.subdivideToNormals(asInputs())],
    ["shapes.face.subdivideToPoints", (o) => o.shapes.face.subdivideToPoints(asInputs())],
    ["shapes.face.subdivideToPointsControlled", (o) => o.shapes.face.subdivideToPointsControlled(asInputs())],
    ["shapes.face.subdivideToPointsOnParam", (o) => o.shapes.face.subdivideToPointsOnParam(asInputs())],
    ["shapes.face.subdivideToRectangleHoles", (o) => o.shapes.face.subdivideToRectangleHoles(asInputs())],
    ["shapes.face.subdivideToRectangleWires", (o) => o.shapes.face.subdivideToRectangleWires(asInputs())],
    ["shapes.face.subdivideToUV", (o) => o.shapes.face.subdivideToUV(asInputs())],
    ["shapes.face.subdivideToWires", (o) => o.shapes.face.subdivideToWires(asInputs())],
    ["shapes.face.wireAlongParam", (o) => o.shapes.face.wireAlongParam(asInputs())],
    ["shapes.face.wiresAlongParams", (o) => o.shapes.face.wiresAlongParams(asInputs())],
    ["shapes.shape.getOrientation", (o) => o.shapes.shape.getOrientation(asInputs())],
    ["shapes.shape.getShapeType", (o) => o.shapes.shape.getShapeType(asInputs())],
    ["shapes.shape.isChecked", (o) => o.shapes.shape.isChecked(asInputs())],
    ["shapes.shape.isClosed", (o) => o.shapes.shape.isClosed(asInputs())],
    ["shapes.shape.isConvex", (o) => o.shapes.shape.isConvex(asInputs())],
    ["shapes.shape.isEqual", (o) => o.shapes.shape.isEqual(asInputs())],
    ["shapes.shape.isFree", (o) => o.shapes.shape.isFree(asInputs())],
    ["shapes.shape.isInfinite", (o) => o.shapes.shape.isInfinite(asInputs())],
    ["shapes.shape.isLocked", (o) => o.shapes.shape.isLocked(asInputs())],
    ["shapes.shape.isModified", (o) => o.shapes.shape.isModified(asInputs())],
    ["shapes.shape.isNotEqual", (o) => o.shapes.shape.isNotEqual(asInputs())],
    ["shapes.shape.isNull", (o) => o.shapes.shape.isNull(asInputs())],
    ["shapes.shape.isPartner", (o) => o.shapes.shape.isPartner(asInputs())],
    ["shapes.shape.isSame", (o) => o.shapes.shape.isSame(asInputs())],
    ["shapes.shape.purgeInternalEdges", (o) => o.shapes.shape.purgeInternalEdges(asInputs())],
    ["shapes.shape.unifySameDomain", (o) => o.shapes.shape.unifySameDomain(asInputs())],
    ["shapes.shell.debugInfo", (o) => o.shapes.shell.debugInfo(asInputs())],
    ["shapes.shell.getShellSurfaceArea", (o) => o.shapes.shell.getShellSurfaceArea(asInputs())],
    ["shapes.shell.sewFaces", (o) => o.shapes.shell.sewFaces(asInputs())],
    ["shapes.solid.createBox", (o) => o.shapes.solid.createBox(asInputs())],
    ["shapes.solid.createBoxFromCorner", (o) => o.shapes.solid.createBoxFromCorner(asInputs())],
    ["shapes.solid.createChristmasTreeSolid", (o) => o.shapes.solid.createChristmasTreeSolid(asInputs())],
    ["shapes.solid.createCone", (o) => o.shapes.solid.createCone(asInputs())],
    ["shapes.solid.createCube", (o) => o.shapes.solid.createCube(asInputs())],
    ["shapes.solid.createCylinder", (o) => o.shapes.solid.createCylinder(asInputs())],
    ["shapes.solid.createCylindersOnLines", (o) => o.shapes.solid.createCylindersOnLines(asInputs())],
    ["shapes.solid.createHBeamProfileSolid", (o) => o.shapes.solid.createHBeamProfileSolid(asInputs())],
    ["shapes.solid.createHeartSolid", (o) => o.shapes.solid.createHeartSolid(asInputs())],
    ["shapes.solid.createIBeamProfileSolid", (o) => o.shapes.solid.createIBeamProfileSolid(asInputs())],
    ["shapes.solid.createLPolygonSolid", (o) => o.shapes.solid.createLPolygonSolid(asInputs())],
    ["shapes.solid.createNGonSolid", (o) => o.shapes.solid.createNGonSolid(asInputs())],
    ["shapes.solid.createParallelogramSolid", (o) => o.shapes.solid.createParallelogramSolid(asInputs())],
    ["shapes.solid.createSphere", (o) => o.shapes.solid.createSphere(asInputs())],
    ["shapes.solid.createStarSolid", (o) => o.shapes.solid.createStarSolid(asInputs())],
    ["shapes.solid.createTBeamProfileSolid", (o) => o.shapes.solid.createTBeamProfileSolid(asInputs())],
    ["shapes.solid.createTorus", (o) => o.shapes.solid.createTorus(asInputs())],
    ["shapes.solid.createUBeamProfileSolid", (o) => o.shapes.solid.createUBeamProfileSolid(asInputs())],
    ["shapes.solid.debugInfo", (o) => o.shapes.solid.debugInfo(asInputs())],
    ["shapes.solid.filterSolidPoints", (o) => o.shapes.solid.filterSolidPoints(asInputs())],
    ["shapes.solid.fromClosedShell", (o) => o.shapes.solid.fromClosedShell(asInputs())],
    ["shapes.solid.getSolidCenterOfMass", (o) => o.shapes.solid.getSolidCenterOfMass(asInputs())],
    ["shapes.solid.getSolidSurfaceArea", (o) => o.shapes.solid.getSolidSurfaceArea(asInputs())],
    ["shapes.solid.getSolidVolume", (o) => o.shapes.solid.getSolidVolume(asInputs())],
    ["shapes.solid.getSolids", (o) => o.shapes.solid.getSolids(asInputs())],
    ["shapes.solid.getSolidsCentersOfMass", (o) => o.shapes.solid.getSolidsCentersOfMass(asInputs())],
    ["shapes.solid.getSolidsVolumes", (o) => o.shapes.solid.getSolidsVolumes(asInputs())],
    ["shapes.vertex.getVertices", (o) => o.shapes.vertex.getVertices(asInputs())],
    ["shapes.vertex.getVerticesAsPoints", (o) => o.shapes.vertex.getVerticesAsPoints(asInputs())],
    ["shapes.vertex.projectPoints", (o) => o.shapes.vertex.projectPoints(asInputs())],
    ["shapes.vertex.vertexFromPoint", (o) => o.shapes.vertex.vertexFromPoint(asInputs())],
    ["shapes.vertex.vertexFromXYZ", (o) => o.shapes.vertex.vertexFromXYZ(asInputs())],
    ["shapes.vertex.vertexToPoint", (o) => o.shapes.vertex.vertexToPoint(asInputs())],
    ["shapes.vertex.verticesCompoundFromPoints", (o) => o.shapes.vertex.verticesCompoundFromPoints(asInputs())],
    ["shapes.vertex.verticesFromPoints", (o) => o.shapes.vertex.verticesFromPoints(asInputs())],
    ["shapes.vertex.verticesToPoints", (o) => o.shapes.vertex.verticesToPoints(asInputs())],
    ["shapes.wire.addEdgesAndWiresToWire", (o) => o.shapes.wire.addEdgesAndWiresToWire(asInputs())],
    ["shapes.wire.closeOpenWire", (o) => o.shapes.wire.closeOpenWire(asInputs())],
    ["shapes.wire.combineEdgesAndWiresIntoAWire", (o) => o.shapes.wire.combineEdgesAndWiresIntoAWire(asInputs())],
    ["shapes.wire.createBSpline", (o) => o.shapes.wire.createBSpline(asInputs())],
    ["shapes.wire.createBSplines", (o) => o.shapes.wire.createBSplines(asInputs())],
    ["shapes.wire.createBezier", (o) => o.shapes.wire.createBezier(asInputs())],
    ["shapes.wire.createBezierWeights", (o) => o.shapes.wire.createBezierWeights(asInputs())],
    ["shapes.wire.createBezierWires", (o) => o.shapes.wire.createBezierWires(asInputs())],
    ["shapes.wire.createChristmasTreeWire", (o) => o.shapes.wire.createChristmasTreeWire(asInputs())],
    ["shapes.wire.createCircleWire", (o) => o.shapes.wire.createCircleWire(asInputs())],
    ["shapes.wire.createEllipseWire", (o) => o.shapes.wire.createEllipseWire(asInputs())],
    ["shapes.wire.createFlatSpiralWire", (o) => o.shapes.wire.createFlatSpiralWire(asInputs())],
    ["shapes.wire.createHBeamProfileWire", (o) => o.shapes.wire.createHBeamProfileWire(asInputs())],
    ["shapes.wire.createHeartWire", (o) => o.shapes.wire.createHeartWire(asInputs())],
    ["shapes.wire.createHelixWire", (o) => o.shapes.wire.createHelixWire(asInputs())],
    ["shapes.wire.createHelixWireByTurns", (o) => o.shapes.wire.createHelixWireByTurns(asInputs())],
    ["shapes.wire.createIBeamProfileWire", (o) => o.shapes.wire.createIBeamProfileWire(asInputs())],
    ["shapes.wire.createLPolygonWire", (o) => o.shapes.wire.createLPolygonWire(asInputs())],
    ["shapes.wire.createLineWire", (o) => o.shapes.wire.createLineWire(asInputs())],
    ["shapes.wire.createLineWireWithExtensions", (o) => o.shapes.wire.createLineWireWithExtensions(asInputs())],
    ["shapes.wire.createLines", (o) => o.shapes.wire.createLines(asInputs())],
    ["shapes.wire.createNGonWire", (o) => o.shapes.wire.createNGonWire(asInputs())],
    ["shapes.wire.createParallelogramWire", (o) => o.shapes.wire.createParallelogramWire(asInputs())],
    ["shapes.wire.createPolygonWire", (o) => o.shapes.wire.createPolygonWire(asInputs())],
    ["shapes.wire.createPolygons", (o) => o.shapes.wire.createPolygons(asInputs())],
    ["shapes.wire.createPolylineWire", (o) => o.shapes.wire.createPolylineWire(asInputs())],
    ["shapes.wire.createPolylines", (o) => o.shapes.wire.createPolylines(asInputs())],
    ["shapes.wire.createRectangleWire", (o) => o.shapes.wire.createRectangleWire(asInputs())],
    ["shapes.wire.createSquareWire", (o) => o.shapes.wire.createSquareWire(asInputs())],
    ["shapes.wire.createStarWire", (o) => o.shapes.wire.createStarWire(asInputs())],
    ["shapes.wire.createTBeamProfileWire", (o) => o.shapes.wire.createTBeamProfileWire(asInputs())],
    ["shapes.wire.createTaperedHelixWire", (o) => o.shapes.wire.createTaperedHelixWire(asInputs())],
    ["shapes.wire.createUBeamProfileWire", (o) => o.shapes.wire.createUBeamProfileWire(asInputs())],
    ["shapes.wire.createWireFromEdge", (o) => o.shapes.wire.createWireFromEdge(asInputs())],
    ["shapes.wire.createWireFromTwoCirclesTan", (o) => o.shapes.wire.createWireFromTwoCirclesTan(asInputs())],
    ["shapes.wire.createWiresBetweenStartEndPointsOfWiresAndEdges", (o) => o.shapes.wire.createWiresBetweenStartEndPointsOfWiresAndEdges(asInputs())],
    ["shapes.wire.createWiresBetweenSubdividedPointsOfWiresAndEdges", (o) => o.shapes.wire.createWiresBetweenSubdividedPointsOfWiresAndEdges(asInputs())],
    ["shapes.wire.createZigZagBetweenTwoWires", (o) => o.shapes.wire.createZigZagBetweenTwoWires(asInputs())],
    ["shapes.wire.debugInfo", (o) => o.shapes.wire.debugInfo(asInputs())],
    ["shapes.wire.derivativesOnWireAtLength", (o) => o.shapes.wire.derivativesOnWireAtLength(asInputs())],
    ["shapes.wire.derivativesOnWireAtParam", (o) => o.shapes.wire.derivativesOnWireAtParam(asInputs())],
    ["shapes.wire.divideWireByEqualDistanceToPoints", (o) => o.shapes.wire.divideWireByEqualDistanceToPoints(asInputs())],
    ["shapes.wire.divideWireByParamsToPoints", (o) => o.shapes.wire.divideWireByParamsToPoints(asInputs())],
    ["shapes.wire.divideWiresByEqualDistanceToPoints", (o) => o.shapes.wire.divideWiresByEqualDistanceToPoints(asInputs())],
    ["shapes.wire.divideWiresByParamsToPoints", (o) => o.shapes.wire.divideWiresByParamsToPoints(asInputs())],
    ["shapes.wire.endPointOnWire", (o) => o.shapes.wire.endPointOnWire(asInputs())],
    ["shapes.wire.fromBaseLine", (o) => o.shapes.wire.fromBaseLine(asInputs())],
    ["shapes.wire.fromBaseLines", (o) => o.shapes.wire.fromBaseLines(asInputs())],
    ["shapes.wire.fromBaseMesh", (o) => o.shapes.wire.fromBaseMesh(asInputs())],
    ["shapes.wire.fromBasePolyline", (o) => o.shapes.wire.fromBasePolyline(asInputs())],
    ["shapes.wire.fromBaseSegment", (o) => o.shapes.wire.fromBaseSegment(asInputs())],
    ["shapes.wire.fromBaseSegments", (o) => o.shapes.wire.fromBaseSegments(asInputs())],
    ["shapes.wire.fromBaseTriangle", (o) => o.shapes.wire.fromBaseTriangle(asInputs())],
    ["shapes.wire.fromPoints", (o) => o.shapes.wire.fromPoints(asInputs())],
    ["shapes.wire.getWire", (o) => o.shapes.wire.getWire(asInputs())],
    ["shapes.wire.getWireCenterOfMass", (o) => o.shapes.wire.getWireCenterOfMass(asInputs())],
    ["shapes.wire.getWireLength", (o) => o.shapes.wire.getWireLength(asInputs())],
    ["shapes.wire.getWires", (o) => o.shapes.wire.getWires(asInputs())],
    ["shapes.wire.getWiresCentersOfMass", (o) => o.shapes.wire.getWiresCentersOfMass(asInputs())],
    ["shapes.wire.getWiresLengths", (o) => o.shapes.wire.getWiresLengths(asInputs())],
    ["shapes.wire.hexagonsInGrid", (o) => o.shapes.wire.hexagonsInGrid(asInputs())],
    ["shapes.wire.interpolatePoints", (o) => o.shapes.wire.interpolatePoints(asInputs())],
    ["shapes.wire.interpolatePointsSymmetric", (o) => o.shapes.wire.interpolatePointsSymmetric(asInputs())],
    ["shapes.wire.interpolateWires", (o) => o.shapes.wire.interpolateWires(asInputs())],
    ["shapes.wire.isWireClosed", (o) => o.shapes.wire.isWireClosed(asInputs())],
    ["shapes.wire.midPointOnWire", (o) => o.shapes.wire.midPointOnWire(asInputs())],
    ["shapes.wire.moveWireSeamByLength", (o) => o.shapes.wire.moveWireSeamByLength(asInputs())],
    ["shapes.wire.moveWireSeamByParameter", (o) => o.shapes.wire.moveWireSeamByParameter(asInputs())],
    ["shapes.wire.placeWireOnFace", (o) => o.shapes.wire.placeWireOnFace(asInputs())],
    ["shapes.wire.placeWiresOnFace", (o) => o.shapes.wire.placeWiresOnFace(asInputs())],
    ["shapes.wire.pointOnWireAtLength", (o) => o.shapes.wire.pointOnWireAtLength(asInputs())],
    ["shapes.wire.pointOnWireAtParam", (o) => o.shapes.wire.pointOnWireAtParam(asInputs())],
    ["shapes.wire.pointsOnWireAtEqualLength", (o) => o.shapes.wire.pointsOnWireAtEqualLength(asInputs())],
    ["shapes.wire.pointsOnWireAtLengths", (o) => o.shapes.wire.pointsOnWireAtLengths(asInputs())],
    ["shapes.wire.pointsOnWireAtPatternOfLengths", (o) => o.shapes.wire.pointsOnWireAtPatternOfLengths(asInputs())],
    ["shapes.wire.project", (o) => o.shapes.wire.project(asInputs())],
    ["shapes.wire.projectWires", (o) => o.shapes.wire.projectWires(asInputs())],
    ["shapes.wire.rebuildWireDegree", (o) => o.shapes.wire.rebuildWireDegree(asInputs())],
    ["shapes.wire.reversedWire", (o) => o.shapes.wire.reversedWire(asInputs())],
    ["shapes.wire.reversedWireFromReversedEdges", (o) => o.shapes.wire.reversedWireFromReversedEdges(asInputs())],
    ["shapes.wire.splitOnPoints", (o) => o.shapes.wire.splitOnPoints(asInputs())],
    ["shapes.wire.startPointOnWire", (o) => o.shapes.wire.startPointOnWire(asInputs())],
    ["shapes.wire.tangentOnWireAtLength", (o) => o.shapes.wire.tangentOnWireAtLength(asInputs())],
    ["shapes.wire.tangentOnWireAtParam", (o) => o.shapes.wire.tangentOnWireAtParam(asInputs())],
    ["shapes.wire.textWires", (o) => o.shapes.wire.textWires(asInputs())],
    ["shapes.wire.wiresToPoints", (o) => o.shapes.wire.wiresToPoints(asInputs())],
    ["shapesToMeshes", (o) => o.shapesToMeshes(asInputs())],
    ["svg.loadSVG", (o) => o.svg.loadSVG(asInputs())],
    ["svg.loadSVGStructured", (o) => o.svg.loadSVGStructured(asInputs())],
    ["transforms.align", (o) => o.transforms.align(asInputs())],
    ["transforms.alignAndTranslate", (o) => o.transforms.alignAndTranslate(asInputs())],
    ["transforms.alignAndTranslateShapes", (o) => o.transforms.alignAndTranslateShapes(asInputs())],
    ["transforms.alignNormAndAxis", (o) => o.transforms.alignNormAndAxis(asInputs())],
    ["transforms.alignShapes", (o) => o.transforms.alignShapes(asInputs())],
    ["transforms.composeTransform", (o) => o.transforms.composeTransform(asInputs())],
    ["transforms.getShapeTransform", (o) => o.transforms.getShapeTransform(asInputs())],
    ["transforms.identityTransform", (o) => o.transforms.identityTransform()],
    ["transforms.invertTransform", (o) => o.transforms.invertTransform(asInputs())],
    ["transforms.mirror", (o) => o.transforms.mirror(asInputs())],
    ["transforms.mirrorAboutPoint", (o) => o.transforms.mirrorAboutPoint(asInputs())],
    ["transforms.mirrorAlongNormal", (o) => o.transforms.mirrorAlongNormal(asInputs())],
    ["transforms.mirrorAlongNormalShapes", (o) => o.transforms.mirrorAlongNormalShapes(asInputs())],
    ["transforms.mirrorAxisToMatrix", (o) => o.transforms.mirrorAxisToMatrix(asInputs())],
    ["transforms.mirrorPlaneToMatrix", (o) => o.transforms.mirrorPlaneToMatrix(asInputs())],
    ["transforms.mirrorPointToMatrix", (o) => o.transforms.mirrorPointToMatrix(asInputs())],
    ["transforms.mirrorShapes", (o) => o.transforms.mirrorShapes(asInputs())],
    ["transforms.multiplyTransforms", (o) => o.transforms.multiplyTransforms(asInputs())],
    ["transforms.quaternionToMatrix", (o) => o.transforms.quaternionToMatrix(asInputs())],
    ["transforms.rotate", (o) => o.transforms.rotate(asInputs())],
    ["transforms.rotateAroundCenter", (o) => o.transforms.rotateAroundCenter(asInputs())],
    ["transforms.rotateAroundCenterShapes", (o) => o.transforms.rotateAroundCenterShapes(asInputs())],
    ["transforms.rotateByQuaternion", (o) => o.transforms.rotateByQuaternion(asInputs())],
    ["transforms.rotateShapes", (o) => o.transforms.rotateShapes(asInputs())],
    ["transforms.rotationAxisAngleToMatrix", (o) => o.transforms.rotationAxisAngleToMatrix(asInputs())],
    ["transforms.scale", (o) => o.transforms.scale(asInputs())],
    ["transforms.scale3d", (o) => o.transforms.scale3d(asInputs())],
    ["transforms.scale3dShapes", (o) => o.transforms.scale3dShapes(asInputs())],
    ["transforms.scaleFromCenter", (o) => o.transforms.scaleFromCenter(asInputs())],
    ["transforms.scaleShapes", (o) => o.transforms.scaleShapes(asInputs())],
    ["transforms.scaleUniformToMatrix", (o) => o.transforms.scaleUniformToMatrix(asInputs())],
    ["transforms.transform", (o) => o.transforms.transform(asInputs())],
    ["transforms.transformByMatrix", (o) => o.transforms.transformByMatrix(asInputs())],
    ["transforms.transformShapes", (o) => o.transforms.transformShapes(asInputs())],
    ["transforms.transformShapesByMatrix", (o) => o.transforms.transformShapesByMatrix(asInputs())],
    ["transforms.translate", (o) => o.transforms.translate(asInputs())],
    ["transforms.translateShapes", (o) => o.transforms.translateShapes(asInputs())],
    ["transforms.translationToMatrix", (o) => o.transforms.translationToMatrix(asInputs())],
];

describe("the generated worker API", () => {
    let worker: RecordingWorker;
    let manager: OCCTWorkerManager;
    let occt: OCCT;
    let posted: PostedCall[];

    beforeEach(() => {
        manager = new OCCTWorkerManager();
        worker = new RecordingWorker();
        manager.setOccWorker(worker);
        posted = worker.posted;
        occt = new OCCT(manager);
    });

    describe("every generated method", () => {
        it.each(DELEGATIONS)("should post %s when that method is called", (path, call) => {
            // Act
            void call(occt);

            // Assert
            expect(posted).toHaveLength(1);
            expect(posted[0]!.action.functionName).toBe(path);
        });
    });

    describe("call identity", () => {
        it("should post the dotted path of the method that was called", () => {
            // Arrange
            const inputs = new Inputs.OCCT.SphereDto(SPHERE_RADIUS, [0, 0, 0]);

            // Act
            void occt.shapes.solid.createSphere(inputs);

            // Assert
            expect(posted).toHaveLength(1);
            expect(posted[0]!.action.functionName).toBe("shapes.solid.createSphere");
            expect(posted[0]!.action.inputs).toBe(inputs);
        });

        it("should keep each nested service on its own path", () => {
            // Act
            void occt.shapes.wire.createCircleWire(new Inputs.OCCT.CircleDto(1, [0, 0, 0], [0, 1, 0]));
            void occt.shapes.face.getFaceArea({ shape: WIRE_POINTER });
            void occt.transforms.translate(asInputs());

            // Assert
            expect(posted.map((call) => call.action.functionName)).toEqual([
                "shapes.wire.createCircleWire",
                "shapes.face.getFaceArea",
                "transforms.translate",
            ]);
        });

        it("should give every call its own identity so replies can be matched back", () => {
            // Act
            void occt.shapes.wire.createCircleWire(new Inputs.OCCT.CircleDto(1, [0, 0, 0], [0, 1, 0]));
            void occt.shapes.wire.createCircleWire(new Inputs.OCCT.CircleDto(2, [0, 0, 0], [0, 1, 0]));

            // Assert
            expect(posted[0]!.uid).not.toBe(posted[1]!.uid);
        });

        it("should settle the call when the worker answers with its identity", async () => {
            // Arrange
            const expected = "a-shape-pointer";
            const pending = occt.shapes.solid.createSphere(new Inputs.OCCT.SphereDto(SPHERE_RADIUS, [0, 0, 0]));

            // Act
            worker.onmessage?.({ data: { uid: posted[0]!.uid, result: expected } } as MessageEvent);

            // Assert
            await expect(pending).resolves.toBe(expected);
        });

        it("should reject the call when the worker answers with an error", async () => {
            // Arrange
            const message = "the kernel refused";
            manager.errorCallback = (): void => undefined;
            const pending = occt.shapes.solid.createSphere(new Inputs.OCCT.SphereDto(SPHERE_RADIUS, [0, 0, 0]));

            // Act
            worker.onmessage?.({ data: { uid: posted[0]!.uid, error: message } } as MessageEvent);

            // Assert
            await expect(pending).rejects.toThrow(message);
        });
    });
});
