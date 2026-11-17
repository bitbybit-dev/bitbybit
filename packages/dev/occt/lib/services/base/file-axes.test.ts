import { describe, it, expect, beforeAll, afterEach } from "vitest";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import { OCCTService } from "../../occ-service";
import { OccHelper } from "../../occ-helper";
import { pointOnGround } from "@bitbybit-dev/base/lib/api/services/helpers/files/ground-axes";
import { drawingOntoGround } from "./file-axes";

const { leftHanded, rightHanded } = Inputs.Base.coordinateSystemEnum;

const SYSTEMS: [string, Inputs.Base.coordinateSystemEnum | undefined][] = [["no coordinate system", undefined], ["a left-handed system", leftHanded], ["a right-handed system", rightHanded]];
const DRAWING: Inputs.Base.Point3[] = [[3, 5, 0], [-2, 7.5, 0], [0, -4, 0], [11, 0.25, 0]];

const rounded = (point: number[]): number[] => point.map(value => Math.round(value * 1e9) / 1e9 + 0);

describe("the kernel's drawings on the ground", () => {
    let occt: OCCTService;
    let occHelper: OccHelper;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        occHelper = new OccHelper(kernel);
        occt = new OCCTService(kernel, occHelper);
    }, 120_000);

    afterEach(() => {
        occHelper.base.settings = {};
    });

    it.each(SYSTEMS)("should lay a flat drawing on the ground where base's ground row lays its points in %s", (_name, system) => {
        // Arrange
        occHelper.base.settings = system === undefined ? {} : { coordinateSystem: system };
        const drawing = occt.shapes.compound.makeCompound({ shapes: DRAWING.map(([x, y, z]) => occt.shapes.vertex.vertexFromXYZ({ x, y, z })) });

        // Act
        const onGround = drawingOntoGround(occHelper, drawing);

        // Assert
        expect(occt.shapes.vertex.getVerticesAsPoints({ shape: onGround }).map(rounded)).toEqual(DRAWING.map(([x, y]) => rounded(pointOnGround(x, y, system))));
    });
});
