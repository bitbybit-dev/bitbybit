import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { isBackFace, markAsBackFace } from "./back-faces";

describe("the mark a back face carries", () => {
    let engine: BABYLON.NullEngine;
    let scene: BABYLON.Scene;

    beforeEach(() => {
        engine = new BABYLON.NullEngine();
        scene = new BABYLON.Scene(engine);
    });

    afterEach(() => {
        scene.dispose();
        engine.dispose();
    });

    it("should tell a marked mesh from one that is not, and from a node that is no mesh", () => {
        // Arrange
        const marked = new BABYLON.Mesh("back", scene);
        const plain = new BABYLON.Mesh("front", scene);
        const node = new BABYLON.TransformNode("group", scene);

        // Act
        markAsBackFace(marked);

        // Assert
        expect([isBackFace(marked), isBackFace(plain), isBackFace(node)]).toEqual([true, false, false]);
    });

    it("should keep what the mesh's metadata already held", () => {
        // Arrange
        const mesh = new BABYLON.Mesh("back", scene);
        mesh.metadata = { shadows: false };

        // Act
        markAsBackFace(mesh);

        // Assert
        expect(mesh.metadata).toEqual({ shadows: false, backFace: true });
    });

    it("should see an instance and a clone of a back face as one", () => {
        // Arrange
        const mesh = BABYLON.MeshBuilder.CreateBox("back", { size: 1 }, scene);
        markAsBackFace(mesh);

        // Act
        const copies = [mesh.createInstance("instance"), mesh.clone("clone")];

        // Assert
        expect(copies.map(isBackFace)).toEqual([true, true]);
    });

    it("should not take metadata that says something else under the same name for the mark", () => {
        // Arrange
        const mesh = new BABYLON.Mesh("front", scene);
        mesh.metadata = { backFace: "no" };

        // Act
        const seen = isBackFace(mesh);

        // Assert
        expect(seen).toBe(false);
    });
});
