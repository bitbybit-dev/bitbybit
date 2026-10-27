import type { BitbybitOcctModule, TopoDS_Face, TopoDS_Shape, TopoDS_Shell, TopoDS_Solid } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Inputs from "../../api/inputs";
import type { Base } from "../../api/inputs";
import type { ShapeGettersService } from "./shape-getters";
import type { EntitiesService } from "./entities.service";
import type { EnumService } from "./enum.service";
import type { ConverterService } from "./converter.service";
import type { TransformsService } from "./transforms.service";
import type { BaseBitByBit } from "@bitbybit-dev/base";
import type * as Resolved from "../../api/resolved-inputs";
import { coordinatesOf, massesAndCentres } from "./kernel-arrays";
import { checkedDirection, checkedShapes } from "./input-checks";
import { length3, scale3, subtract3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";
import { InputError } from "@bitbybit-dev/base";
import { released, releasedOnError } from "./release";
import { withKernelErrorsRead } from "./kernel-refusals";

const SAME_POINT_TOLERANCE = 1e-7;

export class SolidsService {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly shapeGettersService: ShapeGettersService,
        _enumService: EnumService,
        private readonly entitiesService: EntitiesService,
        private readonly converterService: ConverterService,
        private readonly transformsService: TransformsService,
        private readonly base: BaseBitByBit
    ) { }

    fromClosedShell(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shell>): TopoDS_Solid {
        const shell = this.converterService.getActualTypeOfShape(inputs.shape);
        try {
            const builder = new this.occ.BRepBuilderAPI_MakeSolid(shell);
            try {
                return builder.Solid();
            } finally {
                builder.delete();
            }
        } finally {
            shell.delete();
        }
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
        const dir = inputs.direction ? checkedDirection(inputs.direction, "direction") : [0., 1., 0.];
        let result;
        const angle = this.base.math.degToRad({ number: inputs.angle });
        const cyl = this.entitiesService.bRepPrimAPIMakeCylinder(
            inputs.center,
            dir as Base.Vector3,
            inputs.radius,
            inputs.height,
            angle
        );
        if (inputs.originOnCenter) {
            const halfHeight = -(inputs.height / 2);
            const normDir = this.base.vector.normalized({ vector: dir })!;
            result = this.transformsService.translate({ shape: cyl, translation: scale3(normDir as Base.Vector3, halfHeight) });
            cyl.delete();
        }
        else {
            result = cyl;
        }
        return result;
    }

    createCylindersOnLines(inputs: Resolved.OCCT.CylindersOnLinesDto): TopoDS_Solid[] {
        const withoutLength = inputs.lines.findIndex(line => length3(subtract3(line.end, line.start)) <= SAME_POINT_TOLERANCE);
        if (withoutLength !== -1) {
            throw new InputError(`\`lines\` at position ${withoutLength} starts and ends at the same point, so there is no cylinder along it.`, "lines");
        }
        const cylinders: TopoDS_Solid[] = [];
        return releasedOnError(cylinders, () => {
            inputs.lines.forEach(line => cylinders.push(this.entitiesService.bRepPrimAPIMakeCylinderBetweenPoints(line.start, line.end, inputs.radius)));
            return cylinders;
        });
    }

    createSphere(inputs: Resolved.OCCT.SphereDto): TopoDS_Solid {
        return this.entitiesService.bRepPrimAPIMakeSphere(inputs.center, [0., 0., 1.], inputs.radius);
    }

    createCone(inputs: Resolved.OCCT.ConeDto): TopoDS_Solid {
        const ax = this.entitiesService.gpAx2(inputs.center, checkedDirection(inputs.direction, "direction"));
        const angle = this.base.math.degToRad({ number: inputs.angle });
        try {
            return withKernelErrorsRead(this.occ, () => {
                const makeCone = new this.occ.BRepPrimAPI_MakeCone(ax, inputs.radius1, inputs.radius2, inputs.height, angle);
                return released([makeCone], () => makeCone.Shape());
            });
        } finally {
            ax.delete();
        }
    }

    createTorus(inputs: Resolved.OCCT.TorusDto): TopoDS_Solid {
        const ax = this.entitiesService.gpAx2(inputs.center, checkedDirection(inputs.direction, "direction"));
        const angle = this.base.math.degToRad({ number: inputs.angle });
        try {
            return withKernelErrorsRead(this.occ, () => {
                const makeTorus = angle >= 2 * Math.PI - 1e-7
                    ? new this.occ.BRepPrimAPI_MakeTorus(ax, inputs.majorRadius, inputs.minorRadius)
                    : new this.occ.BRepPrimAPI_MakeTorus(ax, inputs.majorRadius, inputs.minorRadius, 0, 2 * Math.PI, angle);
                return released([makeTorus], () => makeTorus.Shape());
            });
        } finally {
            ax.delete();
        }
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
        checkedShapes(inputs.shapes);
        if (inputs.shapes === undefined) {
            throw (Error(("Shapes are not defined")));
        }
        return massesAndCentres(this.occ.VolumePropertiesOfEach(inputs.shapes)).map(properties => properties.mass);
    }

    getSolidCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Solid>): Base.Point3 {
        return massesAndCentres(this.occ.VolumePropertiesOfEach([inputs.shape]))[0]!.centre;
    }

    getSolidsCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Solid>): Base.Point3[] {
        checkedShapes(inputs.shapes);
        if (inputs.shapes === undefined) {
            throw (Error(("Shapes are not defined")));
        }
        return massesAndCentres(this.occ.VolumePropertiesOfEach(inputs.shapes)).map(properties => properties.centre);
    }

    getSolids(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Solid[] {
        return this.shapeGettersService.getSolids(inputs);
    }

}
