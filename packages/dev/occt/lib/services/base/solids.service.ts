import { BitbybitOcctModule, TopoDS_Face, TopoDS_Shape, TopoDS_Shell, TopoDS_Solid } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import { Base } from "../../api/inputs";
import { ShapeGettersService } from "./shape-getters";
import { FacesService } from "./faces.service";
import { EntitiesService } from "./entities.service";
import { EnumService } from "./enum.service";
import { ConverterService } from "./converter.service";
import { TransformsService } from "./transforms.service";
import { VectorHelperService } from "../../api/vector-helper.service";
export class SolidsService {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly shapeGettersService: ShapeGettersService,
        private readonly facesService: FacesService,
        private readonly enumService: EnumService,
        private readonly entitiesService: EntitiesService,
        private readonly converterService: ConverterService,
        private readonly transformsService: TransformsService,
        private readonly vectorHelperService: VectorHelperService
    ) { }

    fromClosedShell(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shell>): TopoDS_Solid {
        const shell = this.converterService.getActualTypeOfShape(inputs.shape);
        const builder = new this.occ.BRepBuilderAPI_MakeSolid(shell);
        const result = builder.Solid();
        builder.delete();
        shell.delete();
        return result;
    }

    createBox(inputs: Inputs.OCCT.BoxDto): TopoDS_Solid {
        let center = [...inputs.center];
        if (inputs.originOnCenter === undefined) {
            inputs.originOnCenter = true;
        }
        if (!inputs.originOnCenter) {
            center = [center[0], center[1] + inputs.height / 2, center[2]];
        }
        return this.entitiesService.bRepPrimAPIMakeBox(inputs.width, inputs.length, inputs.height, center);
    }

    createCube(inputs: Inputs.OCCT.CubeDto): TopoDS_Solid {
        let center = [...inputs.center];
        if (inputs.originOnCenter === undefined) {
            inputs.originOnCenter = true;
        }
        if (!inputs.originOnCenter) {
            center = [center[0], center[1] + inputs.size / 2, center[2]];
        }
        return this.entitiesService.bRepPrimAPIMakeBox(inputs.size, inputs.size, inputs.size, center);
    }

    createBoxFromCorner(inputs: Inputs.OCCT.BoxFromCornerDto): TopoDS_Solid {
        const box = this.entitiesService.bRepPrimAPIMakeBox(inputs.width, inputs.length, inputs.height, inputs.corner);
        const cornerBox = this.transformsService.translate({ shape: box, translation: [inputs.width / 2, inputs.height / 2, inputs.length / 2] });
        box.delete();
        return cornerBox;
    }

    createCylinder(inputs: Inputs.OCCT.CylinderDto): TopoDS_Solid {
        const dir = inputs.direction ? inputs.direction : [0., 1., 0.];
        let result;
        let angle;
        if (inputs.angle === undefined) {
            angle = Math.PI * 2;
        } else {
            angle = this.vectorHelperService.degToRad(inputs.angle);
        }
        const cyl = this.entitiesService.bRepPrimAPIMakeCylinder(
            inputs.center,
            dir as Base.Vector3,
            inputs.radius,
            inputs.height,
            angle
        );
        if (inputs.originOnCenter) {
            const halfHeight = -(inputs.height / 2);
            const normDir = this.vectorHelperService.normalize(dir);
            result = this.transformsService.translate({ shape: cyl, translation: [normDir[0] * halfHeight, normDir[1] * halfHeight, normDir[2] * halfHeight] });
            cyl.delete();
        }
        else {
            result = cyl;
        }
        return result;
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
        const makeCone = new this.occ.BRepPrimAPI_MakeCone(ax, inputs.radius1, inputs.radius2, inputs.height, inputs.angle);
        const coneShape = makeCone.Shape();
        makeCone.delete();
        ax.delete();
        return coneShape;
    }

    createTorus(inputs: Inputs.OCCT.TorusDto): TopoDS_Shape {
        const ax = this.entitiesService.gpAx2(inputs.center, inputs.direction);
        let angle = inputs.angle;
        if (angle === undefined || angle === null) {
            angle = 2 * Math.PI;
        }
        let makeTorus;
        // Angle is already in radians from higher level conversion
        // Use tolerance check for full torus (2*PI) to handle floating-point precision
        if (angle >= 2 * Math.PI - 1e-7) {
            // Full torus - use simple 3-param constructor
            makeTorus = new this.occ.BRepPrimAPI_MakeTorus(ax, inputs.majorRadius, inputs.minorRadius);
        } else {
            // Partial torus - angle is already in radians
            // 6-param: axes, R1, R2, angle1, angle2, angle
            // angle1 and angle2 control the ring segment (minor circle), angle controls the pipe segment (major circle)
            // For a simple pie-slice torus, we keep the full ring (0 to 2*PI) and control the pipe angle
            makeTorus = new this.occ.BRepPrimAPI_MakeTorus(ax, inputs.majorRadius, inputs.minorRadius, 0, 2 * Math.PI, angle);
        }
        const torusShape = makeTorus.Shape();
        makeTorus.delete();
        ax.delete();
        return torusShape;
    }

    filterSolidPoints(inputs: Inputs.OCCT.FilterSolidPointsDto<TopoDS_Face>): Base.Point3[] {
        const points = [];
        if (inputs.points.length > 0) {
            inputs.points.forEach(pt => {
                const gpPnt = this.entitiesService.gpPnt(pt);
                // ClassifyPointInSolid returns: 0=IN, 1=OUT, 2=ON, 3=UNKNOWN
                const state = this.occ.ClassifyPointInSolid(inputs.shape as TopoDS_Solid, gpPnt, inputs.tolerance);
                let type: Inputs.OCCT.topAbsStateEnum;
                switch (state) {
                    case 0: type = Inputs.OCCT.topAbsStateEnum.in; break;
                    case 1: type = Inputs.OCCT.topAbsStateEnum.out; break;
                    case 2: type = Inputs.OCCT.topAbsStateEnum.on; break;
                    default: type = Inputs.OCCT.topAbsStateEnum.unknown; break;
                }
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
            return points;
        } else {
            return [];
        }
    }

    getSolidVolume(inputs: Inputs.OCCT.ShapeDto<TopoDS_Solid>): number {
        const gprops = new this.occ.GProp_GProps();
        this.occ.BRepGProp_VolumeProperties(inputs.shape, gprops);
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
        const gprops = new this.occ.GProp_GProps();
        this.occ.BRepGProp_VolumeProperties(inputs.shape, gprops);
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
