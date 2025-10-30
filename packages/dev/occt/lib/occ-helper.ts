import { OpenCascadeInstance, TopoDS_Face } from "../bitbybit-dev-occt/bitbybit-dev-occt";
import { VectorHelperService } from "./api/vector-helper.service";
import * as Inputs from "./api/inputs/inputs";
import { ShapesHelperService } from "./api/shapes-helper.service";
import { OCCReferencedReturns } from "./occ-referenced-returns";
import { IteratorService } from "./services/base/iterator.service";
import { EnumService } from "./services/base/enum.service";
import { ConverterService } from "./services/base/converter.service";
import { EntitiesService } from "./services/base/entities.service";
import { OperationsService } from "./services/base/operations.service";
import { TransformsService } from "./services/base/transforms.service";
import { BooleansService } from "./services/base/booleans.service";
import { ShapeGettersService } from "./services/base/shape-getters";
import { EdgesService } from "./services/base/edges.service";
import { GeomService } from "./services/base/geom.service";
import { WiresService } from "./services/base/wires.service";
import { FacesService } from "./services/base/faces.service";
import { VerticesService } from "./services/base/vertices.service";
import { ShellsService } from "./services/base/shells.service";
import { FilletsService } from "./services/base/fillets.service";
import { SolidsService } from "./services/base/solids.service";
import { DimensionsService } from "./services/base/dimensions.service";
import { MeshingService } from "./services/base/meshing.service";
import { BaseBitByBit } from "./base";
import { DxfService } from "./services/base/dxf.service";

export class OccHelper {

    private readonly occRefReturns: OCCReferencedReturns;

    public readonly base: BaseBitByBit;
    
    public readonly iteratorService: IteratorService;
    public readonly converterService: ConverterService;
    public readonly entitiesService: EntitiesService;
    public readonly geomService: GeomService;
    public readonly shapeGettersService: ShapeGettersService;
    public readonly transformsService: TransformsService;
    public readonly enumService: EnumService;

    public readonly verticesService: VerticesService;
    public readonly booleansService: BooleansService;
    public readonly edgesService: EdgesService;
    public readonly wiresService: WiresService;
    public readonly facesService: FacesService;
    public readonly shellsService: ShellsService;
    public readonly solidsService: SolidsService;
    public readonly operationsService: OperationsService;
    public readonly filletsService: FilletsService;
    public readonly meshingService: MeshingService;

    public readonly dimensionsService: DimensionsService;
    public readonly dxfService: DxfService;


    constructor(
        public readonly vecHelper: VectorHelperService,
        public readonly shapesHelperService: ShapesHelperService,
        public readonly occ: OpenCascadeInstance,
    ) {
        this.base = new BaseBitByBit();
        this.occRefReturns = new OCCReferencedReturns(occ);
        this.iteratorService = new IteratorService(occ);
        this.enumService = new EnumService(occ);
        this.converterService = new ConverterService(occ);
        this.entitiesService = new EntitiesService(occ);
        this.shapeGettersService = new ShapeGettersService(occ, this.enumService, this.iteratorService);
        this.geomService = new GeomService(occ, this.vecHelper, this.entitiesService);
        this.transformsService = new TransformsService(occ, this.converterService, this.entitiesService, this.vecHelper);

        this.verticesService = new VerticesService(occ, this.entitiesService, this.converterService, this.shapeGettersService, this.wiresService, this.booleansService);

        this.edgesService = new EdgesService(occ, this.occRefReturns, this.shapeGettersService, this.entitiesService,
            this.iteratorService, this.converterService, this.enumService, this.geomService, this.transformsService, this.vecHelper);

        this.wiresService = new WiresService(occ, this.occRefReturns, this.base, this.shapesHelperService, this.shapeGettersService, this.transformsService,
            this.enumService, this.entitiesService, this.converterService, this.geomService, this.edgesService, this.vecHelper, this.filletsService, this.operationsService);

        this.dimensionsService = new DimensionsService(this.base, this.transformsService,
            this.converterService, this.entitiesService, this.edgesService, this.wiresService);

        this.meshingService = new MeshingService(occ, this.shapeGettersService, this.transformsService, this.edgesService, this.facesService, this.wiresService, this.base);

        this.booleansService = new BooleansService(occ, this.shapeGettersService);
        this.verticesService.wiresService = this.wiresService;
        this.verticesService.booleansService = this.booleansService;

        this.facesService = new FacesService(occ, this.occRefReturns, this.entitiesService, this.enumService,
            this.shapeGettersService, this.converterService, this.booleansService, this.wiresService, this.transformsService, this.vecHelper, this.base, this.filletsService);
        this.meshingService.facesService = this.facesService;
        this.shellsService = new ShellsService(occ, this.shapeGettersService, this.converterService, this.facesService);

        this.solidsService = new SolidsService(occ, this.shapeGettersService, this.facesService, this.enumService,
            this.entitiesService, this.converterService, this.transformsService, this.vecHelper);

        this.operationsService = new OperationsService(occ, this.enumService, this.entitiesService, this.converterService,
            this.booleansService, this.shapeGettersService, this.edgesService, this.transformsService,
            this.vecHelper, this.wiresService, this.facesService, this.solidsService, this.shellsService);

        this.wiresService.operationsService = this.operationsService;

        this.filletsService = new FilletsService(occ, this.vecHelper, this.iteratorService, this.converterService, this.entitiesService,
            this.transformsService, this.shapeGettersService, this.edgesService, this.operationsService, this.facesService);
        this.wiresService.filletsService = this.filletsService;
        // cross reference
        this.facesService.filletsService = this.filletsService;

        this.dxfService = new DxfService(this.base, this.shapeGettersService, this.edgesService, this.wiresService);

    }

    surfaceFromFace(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>) {
        const face = inputs.shape;
        const surface = this.occ.BRep_Tool.Surface_2(face);
        const srf = surface.get();
        return srf;
    }

}

