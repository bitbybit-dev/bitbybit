import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import { released } from "./release";
import type { TransformsService } from "./transforms.service";
import { stlWithAxes } from "@bitbybit-dev/base/lib/api/services/helpers/files/stl";
import { stlAxesInFile, stlAxesInModel } from "@bitbybit-dev/base/lib/api/services/helpers/files/stl-axes";
import { meshMatrixInFile, meshMatrixInModel } from "@bitbybit-dev/base/lib/api/services/helpers/files/mesh-file-axes";
import { pointOnGround } from "@bitbybit-dev/base/lib/api/services/helpers/files/ground-axes";

const { leftHanded, rightHanded } = Inputs.Base.coordinateSystemEnum;

const QUARTER_TURN = 90;
const HALF_TURN = 180;

export const TURNED_TO_Z_UP = meshMatrixInFile(rightHanded, true);

export function shapeTurnedToZUp(transforms: TransformsService, shape: TopoDS_Shape): TopoDS_Shape {
    return transforms.rotate({ shape, axis: [1, 0, 0], angle: QUARTER_TURN });
}

export function shapeInFileAxes(och: OccHelper, shape: TopoDS_Shape, zUp: boolean, fromRightHanded: boolean): TopoDS_Shape | undefined {
    const system = och.base.settings.coordinateSystem;
    if (zUp) {
        return zUpOf(och, shape, fromRightHanded || system === rightHanded);
    }
    return system === leftHanded ? och.transformsService.mirrorAlongNormal({ shape, origin: [0, 0, 0], normal: [1, 0, 0] }) : undefined;
}

export function shapeInModelAxes(och: OccHelper, loaded: TopoDS_Shape, zUp: boolean): TopoDS_Shape {
    const system = och.base.settings.coordinateSystem;
    if (!zUp) {
        return system === leftHanded ? released([loaded], () => och.transformsService.mirrorAlongNormal({ shape: loaded, origin: [0, 0, 0], normal: [1, 0, 0] })) : loaded;
    }
    if (system === rightHanded) {
        return released([loaded], () => och.transformsService.rotate({ shape: loaded, axis: [1, 0, 0], angle: -90 }));
    }
    return released([loaded], () => {
        const mirroredShape = och.transformsService.mirrorAlongNormal({ shape: loaded, origin: [0, 0, 0], normal: [0, 0, 1] });
        return released([mirroredShape], () => och.transformsService.rotate({ shape: mirroredShape, axis: [1, 0, 0], angle: 90 }));
    });
}

function zUpOf(och: OccHelper, shape: TopoDS_Shape, turned: boolean): TopoDS_Shape {
    if (turned) {
        return shapeTurnedToZUp(och.transformsService, shape);
    }
    const rotatedShape = och.transformsService.rotate({ shape, axis: [1, 0, 0], angle: -90 });
    try {
        return och.transformsService.mirrorAlongNormal({ shape: rotatedShape, origin: [0, 0, 0], normal: [0, 0, 1] });
    } finally {
        rotatedShape.delete();
    }
}

export function followsCoordinateSystem(och: OccHelper): boolean {
    return och.base.settings.coordinateSystem !== undefined;
}

export function stlInFileAxes(och: OccHelper, bytes: Uint8Array, zUp: boolean): Uint8Array {
    const system = och.base.settings.coordinateSystem;
    return system === undefined && !zUp ? bytes : stlWithAxes(bytes, stlAxesInFile(system ?? leftHanded, zUp));
}

export function stlInModelAxes(och: OccHelper, bytes: Uint8Array, zUp: boolean): Uint8Array {
    const system = och.base.settings.coordinateSystem;
    return system === undefined && !zUp ? bytes : stlWithAxes(bytes, stlAxesInModel(system ?? leftHanded, zUp));
}

export function drawingOntoGround(och: OccHelper, drawing: TopoDS_Shape): TopoDS_Shape {
    const [, , depthOfTheDrawingsY] = pointOnGround(0, 1, och.base.settings.coordinateSystem);
    return och.transformsService.rotate({ shape: drawing, angle: QUARTER_TURN * depthOfTheDrawingsY, axis: [1, 0, 0] });
}

export function viewOntoGround(och: OccHelper, view: TopoDS_Shape): TopoDS_Shape {
    const angle = followsCoordinateSystem(och) ? -QUARTER_TURN : QUARTER_TURN;
    return och.transformsService.rotate({ shape: view, angle, axis: [1, 0, 0] });
}

export function viewOntoDrawingPlane(och: OccHelper, view: TopoDS_Shape): TopoDS_Shape {
    const angle = och.base.settings.coordinateSystem === leftHanded ? -QUARTER_TURN : QUARTER_TURN;
    return och.transformsService.rotate({ shape: view, angle, axis: [1, 0, 0] });
}

export function groundAsDrawingPlane(och: OccHelper, shape: TopoDS_Shape): TopoDS_Shape | undefined {
    return och.base.settings.coordinateSystem === rightHanded ? och.transformsService.rotate({ shape, angle: HALF_TURN, axis: [1, 0, 0] }) : undefined;
}

export function placesRecipeRoots(och: OccHelper): boolean {
    return och.base.settings.coordinateSystem === leftHanded;
}

export function recipeRootInModelAxes(och: OccHelper, matrix: Inputs.Base.TransformMatrix, zUp: boolean): Inputs.Base.TransformMatrix {
    return och.base.transforms.combine({ transformation: [matrix, meshMatrixInModel(leftHanded, zUp)] })[0]!;
}
