import { BitbybitOcctModule, TopoDS_Face, TopoDS_Shape, TopoDS_Shell, TopoDS_Solid } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import { Base } from "../../api/inputs";
import { ShapeGettersService } from "./shape-getters";
import { EntitiesService } from "./entities.service";
import { EnumService } from "./enum.service";
import { ConverterService } from "./converter.service";
import { TransformsService } from "./transforms.service";
import { VectorHelperService } from "../../api/vector-helper.service";
import * as Resolved from "../../api/resolved-inputs";
import { coordinatesOf, massesAndCentres } from "./kernel-arrays";

export class SolidsService {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly shapeGettersService: ShapeGettersService,
        _enumService: EnumService,
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

    createBox(inputs: Resolved.OCCT.BoxDto): TopoDS_Solid {
        let center = [...inputs.center];
        if (inputs.originOnCenter === false) {
            center = [center[0]!, center[1]! + inputs.height / 2, center[2]!];
        }
        return this.entitiesService.bRepPrimAPIMakeBox(inputs.width, inputs.length, inputs.height, center);
    }

    createCube(inputs: Resolved.OCCT.CubeDto): TopoDS_Solid {
        let center = [...inputs.center];
        if (inputs.originOnCenter === false) {
            center = [center[0]!, center[1]! + inputs.size / 2, center[2]!];
        }
        return this.entitiesService.bRepPrimAPIMakeBox(inputs.size, inputs.size, inputs.size, center);
    }

    createBoxFromCorner(inputs: Resolved.OCCT.BoxFromCornerDto): TopoDS_Solid {
        const box = this.entitiesService.bRepPrimAPIMakeBox(inputs.width, inputs.length, inputs.height, inputs.corner);
        const cornerBox = this.transformsService.translate({ shape: box, translation: [inputs.width / 2, inputs.height / 2, inputs.length / 2] });
        box.delete();
        return cornerBox;
    }

    createCylinder(inputs: Resolved.OCCT.CylinderDto): TopoDS_Solid {
        const dir = inputs.direction ? inputs.direction : [0., 1., 0.];
        let result;
        const angle = this.vectorHelperService.degToRad(inputs.angle);
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
            result = this.transformsService.translate({ shape: cyl, translation: [normDir[0]! * halfHeight, normDir[1]! * halfHeight, normDir[2]! * halfHeight] });
            cyl.delete();
        }
        else {
            result = cyl;
        }
        return result;
    }

    createCylindersOnLines(inputs: Resolved.OCCT.CylindersOnLinesDto): TopoDS_Solid[] {
        const cylinders = inputs.lines.map(line => {
            return this.entitiesService.bRepPrimAPIMakeCylinderBetweenPoints(
                line.start,
                line.end,
                inputs.radius,
            );
        });
        return cylinders;
    }

    createSphere(inputs: Resolved.OCCT.SphereDto): TopoDS_Solid {
        return this.entitiesService.bRepPrimAPIMakeSphere(inputs.center, [0., 0., 1.], inputs.radius);
    }

    createCone(inputs: Resolved.OCCT.ConeDto): TopoDS_Solid {
        const ax = this.entitiesService.gpAx2(inputs.center, inputs.direction);
        const angle = this.vectorHelperService.degToRad(inputs.angle);
        const makeCone = new this.occ.BRepPrimAPI_MakeCone(ax, inputs.radius1, inputs.radius2, inputs.height, angle);
        const coneShape = makeCone.Shape();
        makeCone.delete();
        ax.delete();
        return coneShape;
    }

    createTorus(inputs: Resolved.OCCT.TorusDto): TopoDS_Solid {
        const ax = this.entitiesService.gpAx2(inputs.center, inputs.direction);
        const angle = this.vectorHelperService.degToRad(inputs.angle);
        let makeTorus;
        if (angle >= 2 * Math.PI - 1e-7) {
            makeTorus = new this.occ.BRepPrimAPI_MakeTorus(ax, inputs.majorRadius, inputs.minorRadius);
        } else {
            makeTorus = new this.occ.BRepPrimAPI_MakeTorus(ax, inputs.majorRadius, inputs.minorRadius, 0, 2 * Math.PI, angle);
        }
        const torusShape = makeTorus.Shape();
        makeTorus.delete();
        ax.delete();
        return torusShape;
    }

    filterSolidPoints(inputs: Resolved.OCCT.FilterSolidPointsDto<TopoDS_Face>): Base.Point3[] {
        const states = this.occ.ClassifyPointsInSolid(inputs.shape, coordinatesOf(inputs.points), inputs.tolerance);
        const kept = (state: number): boolean => (state === 0 && inputs.keepIn) || (state === 1 && inputs.keepOut)
            || (state === 2 && inputs.keepOn) || (state === 3 && inputs.keepUnknown);
        return inputs.points.filter((_point, index) => kept(states[index]!));
    }

    getSolidVolume(inputs: Inputs.OCCT.ShapeDto<TopoDS_Solid>): number {
        return massesAndCentres(this.occ.VolumePropertiesOfEach([inputs.shape]))[0]!.mass;
    }

    getSolidSurfaceArea(inputs: Inputs.OCCT.ShapeDto<TopoDS_Solid>): number {
        return massesAndCentres(this.occ.SurfacePropertiesOfEach([inputs.shape]))[0]!.mass;
    }

    getSolidsVolumes(inputs: Inputs.OCCT.ShapesDto<TopoDS_Solid>): number[] {
        if (inputs.shapes === undefined) {
            throw (Error(("Shapes are not defined")));
        }
        return massesAndCentres(this.occ.VolumePropertiesOfEach(inputs.shapes)).map(properties => properties.mass);
    }

    getSolidCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Solid>): Base.Point3 {
        return massesAndCentres(this.occ.VolumePropertiesOfEach([inputs.shape]))[0]!.centre;
    }

    getSolidsCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Solid>): Base.Point3[] {
        if (inputs.shapes === undefined) {
            throw (Error(("Shapes are not defined")));
        }
        return massesAndCentres(this.occ.VolumePropertiesOfEach(inputs.shapes)).map(properties => properties.centre);
    }

    getSolids(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Solid[] {
        return this.shapeGettersService.getSolids(inputs);
    }

}
