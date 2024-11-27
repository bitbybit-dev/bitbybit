import { OpenCascadeInstance, TopoDS_Face, TopoDS_Shape, TopoDS_Shell, TopoDS_Solid } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs/inputs";
import { Base } from "../../api/inputs/base-inputs";
import { ShapeGettersService } from "./shape-getters";
import { FacesService } from "./faces.service";
import { EntitiesService } from "./entities.service";
import { EnumService } from "./enum.service";
import { ConverterService } from "./converter.service";
import { TransformsService } from "./transforms.service";

export class SolidsService {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly shapeGettersService: ShapeGettersService,
        private readonly facesService: FacesService,
        private readonly enumService: EnumService,
        private readonly entitiesService: EntitiesService,
        private readonly converterService: ConverterService,
        private readonly transformsService: TransformsService,
    ) { }

    fromClosedShell(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shell>): TopoDS_Solid {
        const shell = this.converterService.getActualTypeOfShape(inputs.shape);
        const builder = new this.occ.BRepBuilderAPI_MakeSolid_3(shell);
        const result = builder.Solid();
        builder.delete();
        shell.delete();
        return result;
    }

    createBox(inputs: Inputs.OCCT.BoxDto): TopoDS_Solid {
        return this.entitiesService.bRepPrimAPIMakeBox(inputs.width, inputs.length, inputs.height, inputs.center);
    }

    createCube(inputs: Inputs.OCCT.CubeDto): TopoDS_Solid {
        return this.entitiesService.bRepPrimAPIMakeBox(inputs.size, inputs.size, inputs.size, inputs.center);
    }

    createBoxFromCorner(inputs: Inputs.OCCT.BoxFromCornerDto): TopoDS_Solid {
        const box = this.entitiesService.bRepPrimAPIMakeBox(inputs.width, inputs.length, inputs.height, inputs.corner);
        const cornerBox = this.transformsService.translate({ shape: box, translation: [inputs.width / 2, inputs.height / 2, inputs.length / 2] });
        box.delete();
        return cornerBox;
    }

    createCylinder(inputs: Inputs.OCCT.CylinderDto): TopoDS_Solid {
        return this.entitiesService.bRepPrimAPIMakeCylinder(
            inputs.center,
            inputs.direction ? inputs.direction : [0., 1., 0.],
            inputs.radius,
            inputs.height
        );
    }

    createCylindersOnLines(inputs: Inputs.OCCT.CylindersOnLinesDto): TopoDS_Solid[] {
        const cylinders = inputs.lines.map(line => {
            return this.entitiesService.bRepPrimAPIMakeCylinderBetweenPoints(
                line.start,
                line.end,
                inputs.radius,
            );
        });
        return cylinders;
    }

    createSphere(inputs: Inputs.OCCT.SphereDto): TopoDS_Shape {
        return this.entitiesService.bRepPrimAPIMakeSphere(inputs.center, [0., 0., 1.], inputs.radius);
    }

    createCone(inputs: Inputs.OCCT.ConeDto): TopoDS_Shape {
        const ax = this.entitiesService.gpAx2(inputs.center, inputs.direction);
        const makeCone = new this.occ.BRepPrimAPI_MakeCone_4(ax, inputs.radius1, inputs.radius2, inputs.height, inputs.angle);
        const coneShape = makeCone.Shape();
        makeCone.delete();
        ax.delete();
        return coneShape;
    }

    filterSolidPoints(inputs: Inputs.OCCT.FilterSolidPointsDto<TopoDS_Face>): Base.Point3[] {
        const points = [];
        if (inputs.points.length > 0) {
            const classifier = new this.occ.BRepClass3d_SolidClassifier_1();
            classifier.Load(inputs.shape);
            inputs.points.forEach(pt => {
                const gpPnt = this.entitiesService.gpPnt(pt);
                classifier.Perform(gpPnt, inputs.tolerance);
                const top = classifier.State();
                const type = this.enumService.getTopAbsStateEnum(top);
                if (inputs.keepOn && type === Inputs.OCCT.topAbsStateEnum.on) {
                    points.push(pt);
                }
                if (inputs.keepIn && type === Inputs.OCCT.topAbsStateEnum.in) {
                    points.push(pt);
                }
                if (inputs.keepOut && type === Inputs.OCCT.topAbsStateEnum.out) {
                    points.push(pt);
                }
                if (inputs.keepUnknown && type === Inputs.OCCT.topAbsStateEnum.unknown) {
                    points.push(pt);
                }
                gpPnt.delete();
            });
            classifier.delete();
            return points;
        } else {
            return [];
        }
    }

    getSolidVolume(inputs: Inputs.OCCT.ShapeDto<TopoDS_Solid>): number {
        const gprops = new this.occ.GProp_GProps_1();
        this.occ.BRepGProp.VolumeProperties_1(inputs.shape, gprops, true, false, false);
        const vol = gprops.Mass();
        gprops.delete();
        return vol;
    }

    getSolidSurfaceArea(inputs: Inputs.OCCT.ShapeDto<TopoDS_Solid>): number {
        const faces = this.shapeGettersService.getFaces(inputs);
        const faceAreas = this.facesService.getFacesAreas({ shapes: faces });
        return faceAreas.reduce((p, c) => p + c, 0);
    }

    getSolidsVolumes(inputs: Inputs.OCCT.ShapesDto<TopoDS_Solid>): number[] {
        if (inputs.shapes === undefined) {
            throw (Error(("Shapes are not defined")));
        }
        return inputs.shapes.map(s => this.getSolidVolume({ shape: s }));
    }

    getSolidCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Solid>): Base.Point3 {
        const gprops = new this.occ.GProp_GProps_1();
        this.occ.BRepGProp.VolumeProperties_1(inputs.shape, gprops, true, false, false);
        const gppnt = gprops.CentreOfMass();
        const pt: Base.Point3 = [gppnt.X(), gppnt.Y(), gppnt.Z()];
        gprops.delete();
        gppnt.delete();
        return pt;
    }

    getSolidsCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Solid>): Base.Point3[] {
        if (inputs.shapes === undefined) {
            throw (Error(("Shapes are not defined")));
        }
        return inputs.shapes.map(s => this.getSolidCenterOfMass({ shape: s }));
    }

    getSolids(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Solid[] {
        return this.shapeGettersService.getSolids(inputs);
    }

}
