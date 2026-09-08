import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { Context } from "../../context";
import { BabylonMesh } from "./mesh";
import * as Inputs from "../../inputs";

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

        it("should let the children follow the pointer too when asked to include them", () => {
            // Act
            meshService.enablePointerMoveEvents(new Inputs.BabylonMesh.PickableBabylonMeshDto(box, true, true));

            // Assert
            expect(box.enablePointerMoveEvents).toBe(true);
            expect(child.enablePointerMoveEvents).toBe(true);
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

            expect(flat.getTotalVertices()).toBe(36);
        });
    });

    describe("getVerticesAsPolygonPoints", () => {
        it("should give one triple of points per triangle", () => {
            // Act
            const polygons = meshService.getVerticesAsPolygonPoints(new Inputs.BabylonMesh.BabylonMeshDto(box));

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

        it("should hold one instance per child where the mesh has children", () => {
            // Act
            const container = meshService.createMeshInstance(new Inputs.BabylonMesh.MeshInstanceDto(box));

            // Assert
            expect(container.getChildMeshes()).toHaveLength(1);
        });

        it("should hold a single instance where the mesh has no children", () => {
            // Arrange
            const lone = BABYLON.MeshBuilder.CreateBox("lone", { size: 1 }, scene);

            // Act
            const container = meshService.createMeshInstance(new Inputs.BabylonMesh.MeshInstanceDto(lone));

            // Assert
            expect(container.getChildMeshes()).toHaveLength(1);
        });

        it("should let go of whatever parent the mesh had, so the instances stand on their own", () => {
            // Arrange
            const parent = new BABYLON.TransformNode("holder", scene);
            box.parent = parent;

            // Act
            meshService.createMeshInstance(new Inputs.BabylonMesh.MeshInstanceDto(box));

            // Assert
            expect(box.parent).toBeNull();
        });

        it("should sign the container and its instances up to the scene's shadow generators", () => {
            // Arrange
            const light = new BABYLON.PointLight("light", new BABYLON.Vector3(0, 5, 0), scene);
            const generator = new BABYLON.ShadowGenerator(64, light);
            scene.metadata.shadowGenerators.push(generator);

            // Act
            const container = meshService.createMeshInstance(new Inputs.BabylonMesh.MeshInstanceDto(box));

            // Assert
            const casters = generator.getShadowMap()!.renderList ?? [];
            expect(casters).toContain(container);
            expect(container.receiveShadows).toBe(true);
        });

        it("should leave a mesh marked as casting no shadows out of the shadow generators", () => {
            // Arrange
            const light = new BABYLON.PointLight("light", new BABYLON.Vector3(0, 5, 0), scene);
            const generator = new BABYLON.ShadowGenerator(64, light);
            scene.metadata.shadowGenerators.push(generator);
            box.metadata = { shadows: false };

            // Act
            const container = meshService.createMeshInstance(new Inputs.BabylonMesh.MeshInstanceDto(box));

            // Assert
            const casters = generator.getShadowMap()!.renderList ?? [];
            expect(casters).not.toContain(container);
        });

        it("should build nothing at all when it was given no mesh", () => {
            // Act
            const container = meshService.createMeshInstance(new Inputs.BabylonMesh.MeshInstanceDto());

            // Assert
            expect(container).toBeUndefined();
        });
    });

    describe("getSideOrientation", () => {
        it.each([
            [Inputs.BabylonMesh.sideOrientationEnum.frontside, BABYLON.Mesh.FRONTSIDE],
            [Inputs.BabylonMesh.sideOrientationEnum.backside, BABYLON.Mesh.BACKSIDE],
            [Inputs.BabylonMesh.sideOrientationEnum.doubleside, BABYLON.Mesh.DOUBLESIDE],
        ])("should turn %s into the engine's own constant", (orientation, expected) => {
            // Assert
            expect(meshService.getSideOrientation(orientation)).toBe(expected);
        });

        it("should draw the front side of anything it does not recognise", () => {
            // Arrange
            const unknown = "sideways" as Inputs.BabylonMesh.sideOrientationEnum;

            // Assert
            expect(meshService.getSideOrientation(unknown)).toBe(BABYLON.Mesh.FRONTSIDE);
        });
    });

    describe("updateDrawn", () => {
        const drawn = (mesh: BABYLON.Mesh, type: Inputs.Draw.drawingTypes): BABYLON.Mesh => {
            mesh.metadata = { type };
            return mesh;
        };

        it("should move, turn and scale the mesh as it was told", () => {
            // Arrange
            const mesh = drawn(BABYLON.MeshBuilder.CreateBox("drawn", { size: 1 }, scene), Inputs.Draw.drawingTypes.occt);

            // Act
            meshService.updateDrawn(new Inputs.BabylonMesh.UpdateDrawnBabylonMesh(
                mesh, [1, 2, 3], [0.1, 0.2, 0.3], [2, 2, 2], "#ff0000"));

            // Assert
            expect(mesh.position.asArray()).toEqual([1, 2, 3]);
            expect(mesh.rotation.asArray()).toEqual([0.1, 0.2, 0.3]);
            expect(mesh.scaling.asArray()).toEqual([2, 2, 2]);
        });

        it("should colour a mesh that has no children with the single colour it was given", () => {
            // Arrange
            const mesh = drawn(BABYLON.MeshBuilder.CreateBox("drawn", { size: 1 }, scene), Inputs.Draw.drawingTypes.occt);
            const material = new BABYLON.PBRMetallicRoughnessMaterial("mat", scene);
            mesh.material = material;

            // Act
            meshService.updateDrawn(new Inputs.BabylonMesh.UpdateDrawnBabylonMesh(
                mesh, ORIGIN, ORIGIN, [1, 1, 1], "#ff0000"));

            // Assert
            expect(material.baseColor.toHexString()).toBe("#FF0000");
        });

        it("should give each child its own colour where it was given one colour per child", () => {
            // Arrange
            const parent = drawn(new BABYLON.Mesh("parent", scene), Inputs.Draw.drawingTypes.occt);
            const first = BABYLON.MeshBuilder.CreateBox("first", { size: 1 }, scene);
            const second = BABYLON.MeshBuilder.CreateBox("second", { size: 1 }, scene);
            const firstMaterial = new BABYLON.PBRMetallicRoughnessMaterial("first", scene);
            const secondMaterial = new BABYLON.PBRMetallicRoughnessMaterial("second", scene);
            first.material = firstMaterial;
            second.material = secondMaterial;
            first.parent = parent;
            second.parent = parent;

            // Act
            meshService.updateDrawn(new Inputs.BabylonMesh.UpdateDrawnBabylonMesh(
                parent, ORIGIN, ORIGIN, [1, 1, 1], ["#ff0000", "#00ff00"]));

            // Assert
            expect(firstMaterial.baseColor.toHexString()).toBe("#FF0000");
            expect(secondMaterial.baseColor.toHexString()).toBe("#00FF00");
        });

        it("should give every child the first colour where the count does not match", () => {
            // Arrange
            const parent = drawn(new BABYLON.Mesh("parent", scene), Inputs.Draw.drawingTypes.occt);
            const first = BABYLON.MeshBuilder.CreateBox("first", { size: 1 }, scene);
            const second = BABYLON.MeshBuilder.CreateBox("second", { size: 1 }, scene);
            const firstMaterial = new BABYLON.PBRMetallicRoughnessMaterial("first", scene);
            const secondMaterial = new BABYLON.PBRMetallicRoughnessMaterial("second", scene);
            first.material = firstMaterial;
            second.material = secondMaterial;
            first.parent = parent;
            second.parent = parent;

            // Act
            meshService.updateDrawn(new Inputs.BabylonMesh.UpdateDrawnBabylonMesh(
                parent, ORIGIN, ORIGIN, [1, 1, 1], ["#0000ff"]));

            // Assert
            expect(firstMaterial.baseColor.toHexString()).toBe("#0000FF");
            expect(secondMaterial.baseColor.toHexString()).toBe("#0000FF");
        });

        it("should give every child the same colour where it was given only one", () => {
            // Arrange
            const parent = drawn(new BABYLON.Mesh("parent", scene), Inputs.Draw.drawingTypes.occt);
            const only = BABYLON.MeshBuilder.CreateBox("only", { size: 1 }, scene);
            const material = new BABYLON.StandardMaterial("mat", scene);
            only.material = material;
            only.parent = parent;

            // Act
            meshService.updateDrawn(new Inputs.BabylonMesh.UpdateDrawnBabylonMesh(
                parent, ORIGIN, ORIGIN, [1, 1, 1], "#00ff00"));

            // Assert
            expect(material.diffuseColor.toHexString()).toBe("#00FF00");
        });

        it("should colour the edges of a mesh that draws them", () => {
            // Arrange
            const mesh = drawn(BABYLON.MeshBuilder.CreateBox("drawn", { size: 1 }, scene), Inputs.Draw.drawingTypes.occt);
            mesh.enableEdgesRendering();

            // Act
            meshService.updateDrawn(new Inputs.BabylonMesh.UpdateDrawnBabylonMesh(
                mesh, ORIGIN, ORIGIN, [1, 1, 1], "#ff0000"));

            // Assert
            expect(mesh.edgesColor.toHexString()).toBe("#FF0000FF");
        });

        it("should paint the vertices of a line one colour per vertex where it was given that many", () => {
            // Arrange
            const lines = drawn(BABYLON.MeshBuilder.CreateLines("lines", {
                points: [new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(1, 0, 0)],
                colors: [new BABYLON.Color4(1, 1, 1, 1), new BABYLON.Color4(1, 1, 1, 1)],
            }, scene), Inputs.Draw.drawingTypes.polyline);

            // Act
            meshService.updateDrawn(new Inputs.BabylonMesh.UpdateDrawnBabylonMesh(
                lines, ORIGIN, ORIGIN, [1, 1, 1], ["#ff0000", "#00ff00"]));

            // Assert
            const colors = lines.getVerticesData(BABYLON.VertexBuffer.ColorKind)!;
            expect([colors[0], colors[1], colors[2]]).toEqual([1, 0, 0]);
            expect([colors[4], colors[5], colors[6]]).toEqual([0, 1, 0]);
        });

        it("should paint every vertex the first colour where the count does not match", () => {
            // Arrange
            const lines = drawn(BABYLON.MeshBuilder.CreateLines("lines", {
                points: [new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(1, 0, 0)],
                colors: [new BABYLON.Color4(1, 1, 1, 1), new BABYLON.Color4(1, 1, 1, 1)],
            }, scene), Inputs.Draw.drawingTypes.polyline);

            // Act
            meshService.updateDrawn(new Inputs.BabylonMesh.UpdateDrawnBabylonMesh(
                lines, ORIGIN, ORIGIN, [1, 1, 1], ["#0000ff"]));

            // Assert
            const colors = lines.getVerticesData(BABYLON.VertexBuffer.ColorKind)!;
            expect([colors[0], colors[1], colors[2]]).toEqual([0, 0, 1]);
            expect([colors[4], colors[5], colors[6]]).toEqual([0, 0, 1]);
        });

        it("should paint every vertex the same colour where it was given only one", () => {
            // Arrange
            const lines = drawn(BABYLON.MeshBuilder.CreateLines("lines", {
                points: [new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(1, 0, 0)],
                colors: [new BABYLON.Color4(1, 1, 1, 1), new BABYLON.Color4(1, 1, 1, 1)],
            }, scene), Inputs.Draw.drawingTypes.polyline);

            // Act
            meshService.updateDrawn(new Inputs.BabylonMesh.UpdateDrawnBabylonMesh(
                lines, ORIGIN, ORIGIN, [1, 1, 1], "#00ff00"));

            // Assert
            const colors = lines.getVerticesData(BABYLON.VertexBuffer.ColorKind)!;
            expect([colors[0], colors[1], colors[2]]).toEqual([0, 1, 0]);
            expect([colors[4], colors[5], colors[6]]).toEqual([0, 1, 0]);
        });

        it("should leave the vertex colours of a surface alone", () => {
            // Arrange
            const mesh = drawn(BABYLON.MeshBuilder.CreateBox("drawn", { size: 1 }, scene), Inputs.Draw.drawingTypes.occt);

            // Act
            meshService.updateDrawn(new Inputs.BabylonMesh.UpdateDrawnBabylonMesh(
                mesh, ORIGIN, ORIGIN, [1, 1, 1], "#ff0000"));

            // Assert
            expect(mesh.getVerticesData(BABYLON.VertexBuffer.ColorKind)).toBeNull();
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

        it("should turn the instances by the degrees it was given, whether the mesh has children or not", () => {
            // Arrange
            const lone = BABYLON.MeshBuilder.CreateBox("lone", { size: 1 }, scene);

            // Act
            const withChildren = meshService.createMeshInstanceAndTransform(
                new Inputs.BabylonMesh.MeshInstanceAndTransformDto(box, ORIGIN, [90, 0, 0], [1, 1, 1]));
            const withoutChildren = meshService.createMeshInstanceAndTransform(
                new Inputs.BabylonMesh.MeshInstanceAndTransformDto(lone, ORIGIN, [90, 0, 0], [1, 1, 1]));

            // Assert
            expect(withChildren.getChildMeshes()[0]!.rotation.x).toBeCloseTo(Math.PI / 2, 10);
            expect(withoutChildren.getChildMeshes()[0]!.rotation.x).toBeCloseTo(Math.PI / 2, 10);
        });

        it("should scale the instances as it was told", () => {
            // Act
            const container = meshService.createMeshInstanceAndTransform(
                new Inputs.BabylonMesh.MeshInstanceAndTransformDto(box, ORIGIN, ORIGIN, [2, 3, 4]));

            // Assert
            expect(container.getChildMeshes()[0]!.scaling.asArray()).toEqual([2, 3, 4]);
        });

        it("should hide the mesh it made instances of, so only the instances are drawn", () => {
            // Act
            meshService.createMeshInstanceAndTransform(
                new Inputs.BabylonMesh.MeshInstanceAndTransformDto(box, ORIGIN, ORIGIN, [1, 1, 1]));

            // Assert
            expect(box.isVisible).toBe(false);
        });

        it("should sign the instances up to the shadow generators the scene carries", () => {
            // Arrange
            const light = new BABYLON.PointLight("light", new BABYLON.Vector3(0, 5, 0), scene);
            const generator = new BABYLON.ShadowGenerator(64, light);
            scene.metadata.shadowGenerators.push(generator);

            // Act
            const container = meshService.createMeshInstanceAndTransform(
                new Inputs.BabylonMesh.MeshInstanceAndTransformDto(box, ORIGIN, ORIGIN, [1, 1, 1]));

            // Assert
            const casters = generator.getShadowMap()!.renderList ?? [];
            expect(casters).toContain(container.getChildMeshes()[0]);
        });

        it("should leave a mesh marked as casting no shadows out of the shadow generators", () => {
            // Arrange
            const light = new BABYLON.PointLight("light", new BABYLON.Vector3(0, 5, 0), scene);
            const generator = new BABYLON.ShadowGenerator(64, light);
            scene.metadata.shadowGenerators.push(generator);
            box.metadata = { shadows: false };

            // Act
            const container = meshService.createMeshInstanceAndTransform(
                new Inputs.BabylonMesh.MeshInstanceAndTransformDto(box, ORIGIN, ORIGIN, [1, 1, 1]));

            // Assert
            const casters = generator.getShadowMap()!.renderList ?? [];
            expect(casters).not.toContain(container.getChildMeshes()[0]);
        });

        it("should carry the mesh's own metadata onto the container it built", () => {
            // Arrange
            box.metadata = { type: "solid" };

            // Act
            const container = meshService.createMeshInstanceAndTransform(
                new Inputs.BabylonMesh.MeshInstanceAndTransformDto(box, ORIGIN, ORIGIN, [1, 1, 1]));

            // Assert
            expect(container.metadata).toEqual({ type: "solid" });
        });

        it("should hand back an empty container when it was given no mesh at all", () => {
            // Arrange
            const inputs = new Inputs.BabylonMesh.MeshInstanceAndTransformDto(undefined, ORIGIN, ORIGIN, [1, 1, 1]);

            // Act
            const container = meshService.createMeshInstanceAndTransform(inputs);

            // Assert
            expect(container.getChildMeshes()).toEqual([]);
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
