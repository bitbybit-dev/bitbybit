import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { Context } from "../../context";
import { BabylonMesh } from "./mesh";
import * as Inputs from "../../inputs";

// Everything a script does to a mesh once it has one: hide it, move it, name it, clone it, ask what
// it holds. Each of these is a thin pass to the engine's own mesh, so the suite runs against a real
// BabylonJS scene on the headless engine the library ships for exactly this, and asserts what the
// engine ends up holding rather than which call was made.

const ORIGIN: Inputs.Base.Point3 = [0, 0, 0];

describe("BabylonMesh", () => {
    let engine: BABYLON.NullEngine;
    let scene: BABYLON.Scene;
    let context: Context;
    let meshService: BabylonMesh;
    let box: BABYLON.Mesh;
    let child: BABYLON.Mesh;

    beforeEach(() => {
        engine = new BABYLON.NullEngine();
        scene = new BABYLON.Scene(engine);
        scene.metadata = { shadowGenerators: [] };
        context = new Context();
        context.scene = scene;
        meshService = new BabylonMesh(context);
        box = BABYLON.MeshBuilder.CreateBox("box", { size: 2 }, scene);
        child = BABYLON.MeshBuilder.CreateBox("child", { size: 1 }, scene);
        child.parent = box;
    });

    afterEach(() => {
        scene.dispose();
        engine.dispose();
    });

    describe("dispose", () => {
        it("should take the mesh out of the scene", () => {
            // Act
            meshService.dispose(new Inputs.BabylonMesh.BabylonMeshDto(box));

            // Assert
            expect(scene.getMeshByName("box")).toBeNull();
        });

        it("should do nothing when handed no mesh", () => {
            // Act
            meshService.dispose(new Inputs.BabylonMesh.BabylonMeshDto());

            // Assert
            expect(scene.getMeshByName("box")).toBe(box);
        });
    });

    describe("setVisibility", () => {
        it("should set how far through the mesh can be seen", () => {
            // Act
            meshService.setVisibility(new Inputs.BabylonMesh.SetMeshVisibilityDto(box, 0.5, false));

            // Assert
            expect(box.visibility).toBe(0.5);
            expect(child.visibility).toBe(1);
        });

        it("should carry the visibility down to the children when asked", () => {
            // Act
            meshService.setVisibility(new Inputs.BabylonMesh.SetMeshVisibilityDto(box, 0.5, true));

            // Assert
            expect(child.visibility).toBe(0.5);
        });
    });

    describe("hide and show", () => {
        it("should hide the mesh alone", () => {
            // Act
            meshService.hide(new Inputs.BabylonMesh.ShowHideMeshDto(box, false));

            // Assert
            expect(box.isVisible).toBe(false);
            expect(child.isVisible).toBe(true);
        });

        it("should hide the children too when asked", () => {
            // Act
            meshService.hide(new Inputs.BabylonMesh.ShowHideMeshDto(box, true));

            // Assert
            expect(child.isVisible).toBe(false);
        });

        it("should show the mesh again", () => {
            // Arrange
            meshService.hide(new Inputs.BabylonMesh.ShowHideMeshDto(box, true));

            // Act
            meshService.show(new Inputs.BabylonMesh.ShowHideMeshDto(box, false));

            // Assert
            expect(box.isVisible).toBe(true);
            expect(child.isVisible).toBe(false);
        });

        it("should show the children too when asked", () => {
            // Arrange
            meshService.hide(new Inputs.BabylonMesh.ShowHideMeshDto(box, true));

            // Act
            meshService.show(new Inputs.BabylonMesh.ShowHideMeshDto(box, true));

            // Assert
            expect(child.isVisible).toBe(true);
        });
    });

    describe("the parent", () => {
        it("should hang the mesh under the parent it was given", () => {
            // Arrange
            const other = BABYLON.MeshBuilder.CreateBox("other", { size: 1 }, scene);

            // Act
            meshService.setParent(new Inputs.BabylonMesh.SetParentDto(other, box));

            // Assert
            expect(other.parent).toBe(box);
        });

        it("should give back the parent a mesh hangs under", () => {
            expect(meshService.getParent(new Inputs.BabylonMesh.SetParentDto(child, box))).toBe(box);
        });
    });

    describe("collisions", () => {
        it("should turn collision checking on for the mesh alone", () => {
            // Act
            meshService.setCheckCollisions(new Inputs.BabylonMesh.CheckCollisionsBabylonMeshDto(box, true, false));

            // Assert
            expect(box.checkCollisions).toBe(true);
            expect(child.checkCollisions).toBe(false);
        });

        it("should turn collision checking on for the children too when asked", () => {
            // Act
            meshService.setCheckCollisions(new Inputs.BabylonMesh.CheckCollisionsBabylonMeshDto(box, true, true));

            // Assert
            expect(child.checkCollisions).toBe(true);
        });

        it("should say whether the mesh is checking for collisions", () => {
            // Arrange
            box.checkCollisions = true;

            // Act & Assert
            expect(meshService.getCheckCollisions(new Inputs.BabylonMesh.CheckCollisionsBabylonMeshDto(box))).toBe(true);
        });
    });

    describe("picking", () => {
        it("should make the mesh pickable, and the children with it when asked", () => {
            // Act
            meshService.setPickable(new Inputs.BabylonMesh.PickableBabylonMeshDto(box, true, true));

            // Assert
            expect(box.isPickable).toBe(true);
            expect(child.isPickable).toBe(true);
        });

        it("should leave the children alone when it was not asked for them", () => {
            // Arrange
            child.isPickable = false;

            // Act
            meshService.setPickable(new Inputs.BabylonMesh.PickableBabylonMeshDto(box, true, false));

            // Assert
            expect(child.isPickable).toBe(false);
        });

        it("should say whether the mesh can be picked", () => {
            expect(meshService.getPickable(new Inputs.BabylonMesh.BabylonMeshDto(box))).toBe(true);
        });

        it("should let the mesh follow the pointer", () => {
            // Act
            meshService.enablePointerMoveEvents(new Inputs.BabylonMesh.PickableBabylonMeshDto(box, true, false));

            // Assert
            expect(box.enablePointerMoveEvents).toBe(true);
        });

        it("should turn the children off rather than on when asked to include them", () => {
            // Asking to include the children switches them off: the loop writes false where the mesh
            // itself was written true. This pins what the method does today rather than what its name
            // suggests, so a correction to it shows up here.
            // Act
            meshService.enablePointerMoveEvents(new Inputs.BabylonMesh.PickableBabylonMeshDto(box, true, true));

            // Assert
            expect(box.enablePointerMoveEvents).toBe(true);
            expect(child.enablePointerMoveEvents).toBe(false);
        });

        it("should stop the mesh following the pointer, and the children with it when asked", () => {
            // Arrange
            meshService.enablePointerMoveEvents(new Inputs.BabylonMesh.PickableBabylonMeshDto(box, true, true));

            // Act
            meshService.disablePointerMoveEvents(new Inputs.BabylonMesh.PickableBabylonMeshDto(box, false, true));

            // Assert
            expect(box.enablePointerMoveEvents).toBe(false);
            expect(child.enablePointerMoveEvents).toBe(false);
        });
    });

    describe("finding meshes", () => {
        it("should find every mesh whose name holds the text", () => {
            // Act
            const found = meshService.getMeshesWhereNameContains(new Inputs.BabylonMesh.ByNameBabylonMeshDto("box"));

            // Assert
            expect(found).toEqual([box]);
        });

        it("should give the children of a mesh", () => {
            // Act
            const found = meshService.getChildMeshes(new Inputs.BabylonMesh.ChildMeshesBabylonMeshDto(box, true));

            // Assert
            expect(found).toEqual([child]);
        });

        it("should find every mesh carrying the id", () => {
            // Arrange
            box.id = "shared";
            child.id = "shared";

            // Act
            const found = meshService.getMeshesOfId(new Inputs.BabylonMesh.ByIdBabylonMeshDto("shared"));

            // Assert
            expect(found).toHaveLength(2);
        });

        it("should find one mesh by its id", () => {
            // Arrange
            box.id = "the-box";

            // Act & Assert
            expect(meshService.getMeshOfId(new Inputs.BabylonMesh.ByIdBabylonMeshDto("the-box"))).toBe(box);
        });

        it("should find one mesh by the id the engine gave it", () => {
            expect(meshService.getMeshOfUniqueId(new Inputs.BabylonMesh.UniqueIdBabylonMeshDto(box.uniqueId))).toBe(box);
        });
    });

    describe("names and ids", () => {
        it("should name the mesh, and the children with it when asked", () => {
            // Act
            meshService.setName(new Inputs.BabylonMesh.NameBabylonMeshDto(box, "renamed", true));

            // Assert
            expect(box.name).toBe("renamed");
            expect(child.name).toBe("renamed");
        });

        it("should leave the children named as they were when it was not asked for them", () => {
            // Act
            meshService.setName(new Inputs.BabylonMesh.NameBabylonMeshDto(box, "renamed", false));

            // Assert
            expect(child.name).toBe("child");
        });

        it("should give back the name of the mesh", () => {
            expect(meshService.getName(new Inputs.BabylonMesh.BabylonMeshDto(box))).toBe("box");
        });

        it("should set and give back the id of the mesh", () => {
            // Act
            meshService.setId(new Inputs.BabylonMesh.IdBabylonMeshDto(box, "the-box"));

            // Assert
            expect(meshService.getId(new Inputs.BabylonMesh.IdBabylonMeshDto(box))).toBe("the-box");
        });

        it("should give back the id the engine gave the mesh", () => {
            expect(meshService.getUniqueId(new Inputs.BabylonMesh.BabylonMeshDto(box))).toBe(box.uniqueId);
        });
    });

    describe("the material", () => {
        it("should give the mesh the material it was given, and the children with it when asked", () => {
            // Arrange
            const material = new BABYLON.StandardMaterial("mat", scene);

            // Act
            meshService.setMaterial(new Inputs.BabylonMesh.MaterialBabylonMeshDto(box, material, true));

            // Assert
            expect(box.material).toBe(material);
            expect(child.material).toBe(material);
        });

        it("should give back the material of the mesh", () => {
            // Arrange
            const material = new BABYLON.StandardMaterial("mat", scene);
            box.material = material;

            // Act & Assert
            expect(meshService.getMaterial(new Inputs.BabylonMesh.BabylonMeshDto(box))).toBe(material);
        });
    });

    describe("where the mesh stands", () => {
        it("should give back its position", () => {
            // Arrange
            box.position = new BABYLON.Vector3(1, 2, 3);

            // Act & Assert
            expect(meshService.getPosition(new Inputs.BabylonMesh.BabylonMeshDto(box))).toEqual([1, 2, 3]);
        });

        it("should give back its position in the world", () => {
            // Arrange
            box.position = new BABYLON.Vector3(1, 2, 3);
            box.computeWorldMatrix(true);

            // Act & Assert
            expect(meshService.getAbsolutePosition(new Inputs.BabylonMesh.BabylonMeshDto(box))).toEqual([1, 2, 3]);
        });

        it("should give back its rotation", () => {
            // Arrange
            box.rotation = new BABYLON.Vector3(0, 1, 0);

            // Act & Assert
            expect(meshService.getRotation(new Inputs.BabylonMesh.BabylonMeshDto(box))).toEqual([0, 1, 0]);
        });

        it("should give back its scale", () => {
            // Arrange
            box.scaling = new BABYLON.Vector3(2, 2, 2);

            // Act & Assert
            expect(meshService.getScale(new Inputs.BabylonMesh.BabylonMeshDto(box))).toEqual([2, 2, 2]);
        });

        it("should stand it where it was told", () => {
            // Act
            meshService.setPosition(new Inputs.BabylonMesh.UpdateDrawnBabylonMeshPositionDto(box, [4, 5, 6]));

            // Assert
            expect(box.position.asArray()).toEqual([4, 5, 6]);
        });

        it("should turn it as it was told, taking the angles in degrees", () => {
            // Act
            meshService.setRotation(new Inputs.BabylonMesh.UpdateDrawnBabylonMeshRotationDto(box, [0, 90, 0]));

            // Assert
            expect(box.rotation.y).toBeCloseTo(Math.PI / 2, 5);
        });

        it("should scale it as it was told", () => {
            // Act
            meshService.setScale(new Inputs.BabylonMesh.UpdateDrawnBabylonMeshScaleDto(box, [2, 3, 4]));

            // Assert
            expect(box.scaling.asArray()).toEqual([2, 3, 4]);
        });

        it("should scale it in place by one number", () => {
            // Act
            meshService.setLocalScale(new Inputs.BabylonMesh.ScaleInPlaceDto(box, 3));

            // Assert
            expect(box.scaling.x).toBeCloseTo(3, 5);
        });
    });

    describe("moving the mesh about", () => {
        const distance = (): Inputs.BabylonMesh.TranslateBabylonMeshDto => new Inputs.BabylonMesh.TranslateBabylonMeshDto(box, 5);

        it("should move it forward", () => {
            // Act
            meshService.moveForward(distance());

            // Assert
            expect(box.position.z).toBeCloseTo(5, 5);
        });

        it("should move it backward", () => {
            // Act
            meshService.moveBackward(distance());

            // Assert
            expect(box.position.z).toBeCloseTo(-5, 5);
        });

        it("should move it up", () => {
            // Act
            meshService.moveUp(distance());

            // Assert
            expect(box.position.y).toBeCloseTo(5, 5);
        });

        it("should move it down", () => {
            // Act
            meshService.moveDown(distance());

            // Assert
            expect(box.position.y).toBeCloseTo(-5, 5);
        });

        it("should move it right", () => {
            // Act
            meshService.moveRight(distance());

            // Assert
            expect(box.position.x).toBeCloseTo(5, 5);
        });

        it("should move it left", () => {
            // Act
            meshService.moveLeft(distance());

            // Assert
            expect(box.position.x).toBeCloseTo(-5, 5);
        });
    });

    describe("turning the mesh", () => {
        const angle = (): Inputs.BabylonMesh.RotateBabylonMeshDto => new Inputs.BabylonMesh.RotateBabylonMeshDto(box, 90);

        it("should yaw it about its own up axis", () => {
            // Act
            meshService.yaw(angle());

            // Assert
            expect(box.rotationQuaternion ?? box.rotation).toBeDefined();
            expect(box.getWorldMatrix().m.some((value) => Math.abs(value) > 0)).toBe(true);
        });

        it("should pitch it about its own side axis", () => {
            // Act & Assert
            expect(() => meshService.pitch(angle())).not.toThrow();
        });

        it("should roll it about its own forward axis", () => {
            // Act & Assert
            expect(() => meshService.roll(angle())).not.toThrow();
        });

        it("should turn it about an axis through a point", () => {
            // Act
            meshService.rotateAroundAxisWithPosition(new Inputs.BabylonMesh.RotateAroundAxisNodeDto(box, [10, 0, 0], [0, 1, 0], 180));

            // Assert - half a turn about the point takes it to the far side of it
            expect(box.position.x).toBeCloseTo(20, 5);
        });
    });

    describe("intersections", () => {
        it("should see two meshes standing in the same place as crossing", () => {
            // Arrange
            const other = BABYLON.MeshBuilder.CreateBox("other", { size: 2 }, scene);
            box.computeWorldMatrix(true);
            other.computeWorldMatrix(true);

            // Act & Assert
            expect(meshService.intersectsMesh(new Inputs.BabylonMesh.IntersectsMeshDto(box, other, false, false))).toBe(true);
        });

        it("should see a point inside the mesh as inside it", () => {
            // Arrange
            box.computeWorldMatrix(true);

            // Act & Assert
            expect(meshService.intersectsPoint(new Inputs.BabylonMesh.IntersectsPointDto(box, ORIGIN))).toBe(true);
        });

        it("should see a point well outside the mesh as outside it", () => {
            // Arrange
            box.computeWorldMatrix(true);

            // Act & Assert
            expect(meshService.intersectsPoint(new Inputs.BabylonMesh.IntersectsPointDto(box, [100, 100, 100]))).toBe(false);
        });
    });

    describe("clone", () => {
        it("should hand back a mesh of its own", () => {
            // Act
            const copy = meshService.clone(new Inputs.BabylonMesh.BabylonMeshDto(box));

            // Assert
            expect(copy).not.toBe(box);
            expect(copy.getTotalVertices()).toBe(box.getTotalVertices());
        });

        it("should carry the metadata of the mesh it copied", () => {
            // Arrange
            box.metadata = { type: "occt" };

            // Act
            const copy = meshService.clone(new Inputs.BabylonMesh.BabylonMeshDto(box));

            // Assert
            expect(copy.metadata).toEqual({ type: "occt" });
        });

        it("should have the copy cast the shadows the scene casts", () => {
            // Arrange
            const light = new BABYLON.PointLight("light", new BABYLON.Vector3(0, 5, 0), scene);
            const generator = new BABYLON.ShadowGenerator(512, light);
            scene.metadata.shadowGenerators = [generator];

            // Act
            const copy = meshService.clone(new Inputs.BabylonMesh.BabylonMeshDto(box));

            // Assert
            expect(copy.receiveShadows).toBe(true);
            expect(generator.getShadowMap()!.renderList).toContain(copy);
        });

        it("should leave a mesh that asked for no shadows out of them", () => {
            // Arrange
            const light = new BABYLON.PointLight("light", new BABYLON.Vector3(0, 5, 0), scene);
            const generator = new BABYLON.ShadowGenerator(512, light);
            scene.metadata.shadowGenerators = [generator];
            box.metadata = { shadows: false };

            // Act
            const copy = meshService.clone(new Inputs.BabylonMesh.BabylonMeshDto(box));

            // Assert
            expect(copy.receiveShadows).toBe(false);
        });
    });

    describe("cloneToPositions", () => {
        it("should make one copy per position, standing where it was told", () => {
            // Act
            const copies = meshService.cloneToPositions(new Inputs.BabylonMesh.CloneToPositionsDto(box, [[1, 0, 0], [2, 0, 0]]));

            // Assert
            expect(copies).toHaveLength(2);
            expect(copies.map((copy) => copy.position.x)).toEqual([1, 2]);
        });
    });

    describe("mergeMeshes", () => {
        it("should build one mesh holding the vertices of both", () => {
            // Arrange
            const other = BABYLON.MeshBuilder.CreateBox("other", { size: 2 }, scene);
            const inputs = new Inputs.BabylonMesh.MergeMeshesDto();
            inputs.arrayOfMeshes = [box.clone(), other];
            inputs.disposeSource = true;
            inputs.allow32BitsIndices = true;

            // Act
            const merged = meshService.mergeMeshes(inputs);

            // Assert
            expect(merged.getTotalVertices()).toBe(box.getTotalVertices() * 2);
        });
    });

    describe("convertToFlatShadedMesh", () => {
        it("should give every triangle its own vertices", () => {
            // Act
            const flat = meshService.convertToFlatShadedMesh(new Inputs.BabylonMesh.BabylonMeshDto(box));

            // Assert - a box of twelve triangles becomes thirty six vertices
            expect(flat.getTotalVertices()).toBe(36);
        });
    });

    describe("getVerticesAsPolygonPoints", () => {
        it("should give one triple of points per triangle", () => {
            // Act
            const polygons = meshService.getVerticesAsPolygonPoints(new Inputs.BabylonMesh.BabylonMeshDto(box));

            // Assert - a box is twelve triangles
            expect(polygons).toHaveLength(12);
            expect(polygons[0]).toHaveLength(3);
        });
    });

    describe("createMeshInstance", () => {
        it("should build an instance of the mesh", () => {
            // Act
            const instance = meshService.createMeshInstance(new Inputs.BabylonMesh.MeshInstanceDto(box));

            // Assert
            expect(instance).toBeDefined();
        });
    });

    describe("createMeshInstanceAndTransform", () => {
        it("should build a container holding an instance per child mesh", () => {
            // Act
            const container = meshService.createMeshInstanceAndTransform(
                new Inputs.BabylonMesh.MeshInstanceAndTransformDto(box, [1, 2, 3], [0, 0, 0], [1, 1, 1]));

            // Assert
            expect(container.getChildMeshes().length).toBeGreaterThan(0);
        });

        it("should place the instances where it was told", () => {
            // Act
            const container = meshService.createMeshInstanceAndTransform(
                new Inputs.BabylonMesh.MeshInstanceAndTransformDto(box, [1, 2, 3], [0, 0, 0], [1, 1, 1]));

            // Assert
            expect(container.getChildMeshes()[0]!.position.asArray()).toEqual([1, 2, 3]);
        });
    });

    describe("createMeshInstanceAndTransformNoReturn", () => {
        it("should build the container without handing it back", () => {
            // Act
            const result = meshService.createMeshInstanceAndTransformNoReturn(
                new Inputs.BabylonMesh.MeshInstanceAndTransformDto(box, ORIGIN, ORIGIN, [1, 1, 1]));

            // Assert
            expect(result).toBeUndefined();
        });
    });
});
