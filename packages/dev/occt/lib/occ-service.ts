import { BitbybitOcctModule, TopoDS_Shape } from "../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "./api/inputs/inputs";
import { OCCTBooleans } from "./services/booleans";
import { OCCTGeom } from "./services/geom/geom";
import { OCCTIO } from "./services/io";
import { OCCTOperations } from "./services/operations";
import { OCCTShapes } from "./services/shapes/shapes";
import { OCCTTransforms } from "./services/transforms";
import { OCCTFillets } from "./services/fillets";
import { OCCTDimensions } from "./services/dimensions";

// import { OCCTAssembly } from "./services/assembly";
import { OccHelper } from "./occ-helper";
import { OCCTShapeFix } from "./services/shape-fix";

export class OCCTService {
    public readonly shapes: OCCTShapes;
    public readonly geom: OCCTGeom;
    public readonly transforms: OCCTTransforms;
    public readonly operations: OCCTOperations;
    public readonly booleans: OCCTBooleans;
    public readonly fillets: OCCTFillets;
    public readonly dimensions: OCCTDimensions;
    // public readonly assembly: OCCTAssembly;
    public readonly shapeFix: OCCTShapeFix;
    public readonly io: OCCTIO;
    public plugins?;

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
        this.shapes = new OCCTShapes(occ, och);
        this.geom = new OCCTGeom(occ, och);
        this.transforms = new OCCTTransforms(occ, och);
        this.operations = new OCCTOperations(occ, och);
        this.booleans = new OCCTBooleans(occ, och);
        this.fillets = new OCCTFillets(occ, och);
        this.shapeFix = new OCCTShapeFix(occ, och);
        this.dimensions = new OCCTDimensions(occ, och);
        // this.assembly = new OCCTAssembly(occ, och);
        this.io = new OCCTIO(occ, och);
    }

    shapeFacesToPolygonPoints(inputs: Inputs.OCCT.ShapeFacesToPolygonPointsDto<TopoDS_Shape>): Inputs.Base.Point3[][] {
        return this.och.meshingService.shapeFacesToPolygonPoints(inputs);
    }

    shapesToMeshes(inputs: Inputs.OCCT.ShapesToMeshesDto<TopoDS_Shape>): Inputs.OCCT.DecomposedMeshDto[] {
        return inputs.shapes.map(shape => this.shapeToMesh({ shape, precision: inputs.precision, adjustYtoZ: inputs.adjustYtoZ }));
    }

    shapeToMesh(inputs: Inputs.OCCT.ShapeToMeshDto<TopoDS_Shape>): Inputs.OCCT.DecomposedMeshDto {
        return this.och.meshingService.shapeToMesh(inputs);
    }


}
