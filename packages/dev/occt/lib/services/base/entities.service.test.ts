import { describe, it, expect, beforeAll, afterEach } from "vitest";
import type { BitbybitOcctModule, ClassHandle } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";

type Temporary = "gp_Pnt" | "gp_Dir" | "gp_Pnt2d" | "gp_Dir2d";

describe("EntitiesService", () => {
    let occt: BitbybitOcctModule;
    let helper: OccHelper;
    const restores: (() => void)[] = [];

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        helper = new OccHelper(occt);
    });

    afterEach(() => {
        while (restores.length) {
            restores.pop()!();
        }
    });

    function track(names: Temporary[]): ClassHandle[] {
        const created: ClassHandle[] = [];
        for (const name of names) {
            const original = occt[name];
            Reflect.set(occt, name, new Proxy(original, {
                construct(target, args): object {
                    const made: ClassHandle = Reflect.construct(target, args);
                    created.push(made);
                    return made;
                },
            }));
            restores.push(() => Reflect.set(occt, name, original));
        }
        return created;
    }

    it.each([
        ["gpAx1", (): ClassHandle => helper.entitiesService.gpAx1([1, 2, 3], [0, 0, 1])],
        ["gpAx2", (): ClassHandle => helper.entitiesService.gpAx2([1, 2, 3], [0, 0, 1])],
        ["gpAx2FromTwoVectors", (): ClassHandle => helper.entitiesService.gpAx2FromTwoVectors([1, 2, 3], [0, 0, 1], [1, 0, 0])],
        ["gpAx3_3", (): ClassHandle => helper.entitiesService.gpAx3_3([1, 2, 3], [0, 0, 1], [1, 0, 0])],
        ["gpAx3_4", (): ClassHandle => helper.entitiesService.gpAx3_4([1, 2, 3], [0, 0, 1])],
        ["gpAx2d", (): ClassHandle => helper.entitiesService.gpAx2d([1, 2], [0, 1])],
    ] as [string, () => ClassHandle][])("%s deletes the points and directions it was built from", (_name, make) => {
        // Arrange
        const created = track(["gp_Pnt", "gp_Dir", "gp_Pnt2d", "gp_Dir2d"]);

        // Act
        const axis = make();

        // Assert
        expect(created.length).toBeGreaterThan(1);
        expect(created.filter(made => !made.isDeleted())).toEqual([]);
        axis.delete();
    });

    it.each([
        ["gpAx1", (): unknown => helper.entitiesService.gpAx1([1, 2, 3], [0, 0, 0]), "gp_Dir: the vector has no length"],
        ["gpAx2", (): unknown => helper.entitiesService.gpAx2([1, 2, 3], [0, 0, 0]), "gp_Dir: the vector has no length"],
        ["gpAx3_4", (): unknown => helper.entitiesService.gpAx3_4([1, 2, 3], [0, 0, 0]), "gp_Dir: the vector has no length"],
        ["gpPln", (): unknown => helper.entitiesService.gpPln([1, 2, 3], [0, 0, 0]), "gp_Dir: the vector has no length"],
        ["gpAx2d", (): unknown => helper.entitiesService.gpAx2d([1, 2], [0, 0]), "gp_Dir2d: the vector has no length"],
        ["gpAx3_3", (): unknown => helper.entitiesService.gpAx3_3([1, 2, 3], [0, 0, 1], [0, 0, 2]), "gp_Ax3: the X direction is parallel to the main direction"],
        ["gpAx2FromTwoVectors", (): unknown => helper.entitiesService.gpAx2FromTwoVectors([1, 2, 3], [0, 0, 1], [0, 0, 3]), "gp_Ax2: the X direction is parallel to the main direction"],
    ] as [string, () => unknown, string][])("%s says the kernel's reason when its directions cannot make one", (_name, make, reason) => {
        // Act & Assert
        expect(make).toThrow(new Error(`Standard_DomainError: ${reason}`));
    });

    it("should say the kernel's reason when a wire to make a face of on a face is null", () => {
        // Arrange
        const face = helper.facesService.createRectangleFace({ width: 8, length: 4, center: [0, 0, 0], direction: [0, 1, 0] });
        const nullWire = new occt.TopoDS_Wire();

        // Act
        const act = (): unknown => helper.entitiesService.bRepBuilderAPIMakeFacesFromWiresOnFace(face, [nullWire], true);

        // Assert
        expect(act).toThrow("Standard_NullObject: MakeFaceFromFaceSurfaceAndWire: the wire is null");
        [face, nullWire].forEach(each => each.delete());
    });
});
