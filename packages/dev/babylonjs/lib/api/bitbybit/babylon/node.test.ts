import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { createHeadlessScene, HeadlessScene } from "../../__test__/headless";
import { BabylonNode } from "./node";
import { DrawHelper } from "../../draw-helper";
import { Context } from "../../context";
import * as Inputs from "../../inputs";

const drawHelperFor = (context: Context): DrawHelper =>
    new DrawHelper(context, undefined!, undefined!, undefined!, undefined!, undefined!);

describe("BabylonNode", () => {
    let headless: HeadlessScene;
    let service: BabylonNode;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonNode(headless.context, drawHelperFor(headless.context));
    });

    afterEach(() => {
        headless.dispose();
    });

    describe("createNodeFromRotation", () => {
        it("should put the node on the context's scene where it was told", () => {
            // Act
            const node = service.createNodeFromRotation(
                new Inputs.BabylonNode.CreateNodeFromRotationDto(undefined, [1, 2, 3], [0, 0, 0]));

            // Assert
            expect(node).toBeInstanceOf(BABYLON.TransformNode);
            expect(node.getScene()).toBe(headless.scene);
            expect([node.position.x, node.position.y, node.position.z]).toEqual([1, 2, 3]);
        });

        it("should turn the rotation it was given from degrees into radians", () => {
            // Act
            const node = service.createNodeFromRotation(
                new Inputs.BabylonNode.CreateNodeFromRotationDto(undefined, [0, 0, 0], [90, 180, 270]));

            // Assert
            expect(node.rotation.x).toBeCloseTo(Math.PI / 2, 10);
            expect(node.rotation.y).toBeCloseTo(Math.PI, 10);
            expect(node.rotation.z).toBeCloseTo(Math.PI * 3 / 2, 10);
        });

        it("should turn a negative angle into the same turn measured the other way round", () => {
            // Act
            const node = service.createNodeFromRotation(
                new Inputs.BabylonNode.CreateNodeFromRotationDto(undefined, [0, 0, 0], [0, 0, -90]));

            // Assert
            expect(Math.cos(node.rotation.z)).toBeCloseTo(0, 10);
            expect(Math.sin(node.rotation.z)).toBeCloseTo(-1, 10);
        });

        it("should hang the node off the parent it was given", () => {
            // Arrange
            const parent = new BABYLON.TransformNode("parent", headless.scene);

            // Act
            const node = service.createNodeFromRotation(
                new Inputs.BabylonNode.CreateNodeFromRotationDto(parent, [0, 0, 0], [0, 0, 0]));

            // Assert
            expect(node.parent).toBe(parent);
        });

        it("should leave the node loose when it was given no parent", () => {
            // Act
            const node = service.createNodeFromRotation(
                new Inputs.BabylonNode.CreateNodeFromRotationDto(undefined, [0, 0, 0], [0, 0, 0]));

            // Assert
            expect(node.parent).toBeNull();
        });
    });

    describe("createWorldNode", () => {
        it("should hang the node off the scene's own root", () => {
            // Arrange
            const root = headless.scene.getTransformNodeByName("root")!;
            root.id = "root";

            // Act
            const node = service.createWorldNode();

            // Assert
            expect(node.parent).toBe(root);
        });
    });

    describe("getRootNode", () => {
        it("should hand back the scene's own root", () => {
            // Arrange
            const root = headless.scene.getTransformNodeByName("root")!;
            root.id = "root";

            // Assert
            expect(service.getRootNode()).toBe(root);
        });
    });

    describe("the directions a node points in", () => {
        it("should read the three axes of a node that was not turned", () => {
            // Arrange
            const node = new BABYLON.TransformNode("node", headless.scene);
            node.computeWorldMatrix(true);
            const inputs = new Inputs.BabylonNode.NodeDto(node);

            // Assert
            expect(service.getAbsoluteForwardVector(inputs)).toEqual([0, 0, 1]);
            expect(service.getAbsoluteRightVector(inputs)).toEqual([1, 0, 0]);
            expect(service.getAbsoluteUpVector(inputs)).toEqual([0, 1, 0]);
        });

        it("should follow the node round when it is turned", () => {
            // Arrange
            const node = service.createNodeFromRotation(
                new Inputs.BabylonNode.CreateNodeFromRotationDto(undefined, [0, 0, 0], [0, 90, 0]));
            node.computeWorldMatrix(true);

            // Act
            const forward = service.getAbsoluteForwardVector(new Inputs.BabylonNode.NodeDto(node));

            // Assert
            expect(forward[0]).toBeCloseTo(1, 6);
            expect(forward[2]).toBeCloseTo(0, 6);
        });
    });

    describe("where a node sits", () => {
        it("should read the position a node sits at in the world", () => {
            // Arrange
            const node = new BABYLON.TransformNode("node", headless.scene);
            node.position = new BABYLON.Vector3(1, 2, 3);

            // Assert
            expect(service.getAbsolutePosition(new Inputs.BabylonNode.NodeDto(node))).toEqual([1, 2, 3]);
        });

        it("should read a child's position in its parent's own space", () => {
            // Arrange
            const parent = new BABYLON.TransformNode("parent", headless.scene);
            parent.position = new BABYLON.Vector3(10, 0, 0);
            const child = new BABYLON.TransformNode("child", headless.scene);
            child.parent = parent;
            child.position = new BABYLON.Vector3(1, 0, 0);
            child.computeWorldMatrix(true);

            // Assert
            expect(service.getPositionExpressedInLocalSpace(new Inputs.BabylonNode.NodeDto(child))).toEqual([1, 0, 0]);
        });

        it("should move a node to an absolute position", () => {
            // Arrange
            const parent = new BABYLON.TransformNode("parent", headless.scene);
            parent.position = new BABYLON.Vector3(10, 0, 0);
            const child = new BABYLON.TransformNode("child", headless.scene);
            child.parent = parent;
            parent.computeWorldMatrix(true);

            // Act
            service.setAbsolutePosition(new Inputs.BabylonNode.NodePositionDto(child, [0, 0, 0]));
            child.computeWorldMatrix(true);

            // Assert
            expect(service.getAbsolutePosition(new Inputs.BabylonNode.NodeDto(child))).toEqual([0, 0, 0]);
        });
    });

    describe("the rotation of a node", () => {
        it("should read a rotation back in the degrees it was written in", () => {
            // Arrange
            const node = service.createNodeFromRotation(
                new Inputs.BabylonNode.CreateNodeFromRotationDto(undefined, [0, 0, 0], [30, 45, 60]));

            // Act
            const rotation = service.getRotation(new Inputs.BabylonNode.NodeDto(node));

            // Assert
            expect(rotation[0]).toBeCloseTo(30, 10);
            expect(rotation[1]).toBeCloseTo(45, 10);
            expect(rotation[2]).toBeCloseTo(60, 10);
        });

        it("should hand out the rotation as a matrix, in world space", () => {
            // Arrange
            const node = new BABYLON.TransformNode("node", headless.scene);
            node.computeWorldMatrix(true);

            // Act
            const matrix = service.getAbsoluteRotationTransformation(new Inputs.BabylonNode.NodeDto(node));

            // Assert
            expect(matrix).toHaveLength(16);
            expect(BABYLON.Matrix.FromArray(matrix).equals(BABYLON.Matrix.Identity())).toBe(true);
        });

        it("should hand out the rotation as a matrix, in the node's own space", () => {
            // Arrange
            const node = new BABYLON.TransformNode("node", headless.scene);
            node.rotationQuaternion = BABYLON.Quaternion.Identity();

            // Act
            const matrix = service.getRotationTransformation(new Inputs.BabylonNode.NodeDto(node));

            // Assert
            expect(BABYLON.Matrix.FromArray(matrix).equals(BABYLON.Matrix.Identity())).toBe(true);
        });

        it("should turn a node about an axis through a point", () => {
            // Arrange
            const node = new BABYLON.TransformNode("node", headless.scene);
            node.position = new BABYLON.Vector3(1, 0, 0);

            // Act
            service.rotateAroundAxisWithPosition(
                new Inputs.BabylonNode.RotateAroundAxisNodeDto(node, [0, 0, 0], [0, 1, 0], 90));

            // Assert
            expect(node.position.x).toBeCloseTo(0, 6);
            expect(node.position.z).toBeCloseTo(-1, 6);
        });

        it("should turn a node about an axis through itself", () => {
            // Arrange
            const node = new BABYLON.TransformNode("node", headless.scene);

            // Act
            service.rotate(new Inputs.BabylonNode.RotateNodeDto(node, [0, 1, 0], 90));
            node.computeWorldMatrix(true);

            // Assert
            expect(service.getAbsoluteForwardVector(new Inputs.BabylonNode.NodeDto(node))[0]).toBeCloseTo(1, 6);
        });

        it("should point a node in the direction it was given", () => {
            // Arrange
            const node = new BABYLON.TransformNode("node", headless.scene);

            // Act
            service.setDirection(new Inputs.BabylonNode.NodeDirectionDto(node, [1, 0, 0]));
            node.computeWorldMatrix(true);

            // Assert
            expect(service.getAbsoluteForwardVector(new Inputs.BabylonNode.NodeDto(node))[0]).toBeCloseTo(1, 6);
        });
    });

    describe("the family a node belongs to", () => {
        it("should read the children hanging off a node", () => {
            // Arrange
            const parent = new BABYLON.TransformNode("parent", headless.scene);
            const child = new BABYLON.TransformNode("child", headless.scene);
            child.parent = parent;

            // Assert
            expect(service.getChildren(new Inputs.BabylonNode.NodeDto(parent))).toEqual([child]);
        });

        it("should read the parent a node hangs off", () => {
            // Arrange
            const parent = new BABYLON.TransformNode("parent", headless.scene);
            const child = new BABYLON.TransformNode("child", headless.scene);
            child.parent = parent;

            // Assert
            expect(service.getParent(new Inputs.BabylonNode.NodeDto(child))).toBe(parent);
        });

        it("should hang a node off another one without moving it in the world", () => {
            // Arrange
            const parent = new BABYLON.TransformNode("parent", headless.scene);
            parent.position = new BABYLON.Vector3(5, 0, 0);
            parent.computeWorldMatrix(true);
            const child = new BABYLON.TransformNode("child", headless.scene);
            child.position = new BABYLON.Vector3(1, 0, 0);
            child.computeWorldMatrix(true);

            // Act
            service.setParent(new Inputs.BabylonNode.NodeParentDto(child, parent));
            child.computeWorldMatrix(true);

            // Assert
            expect(child.parent).toBe(parent);
            expect(service.getAbsolutePosition(new Inputs.BabylonNode.NodeDto(child))[0]).toBeCloseTo(1, 6);
        });
    });

    describe("translate", () => {
        it("should move a node along a direction by a distance", () => {
            // Arrange
            const node = new BABYLON.TransformNode("node", headless.scene);

            // Act
            service.translate(new Inputs.BabylonNode.NodeTranslationDto(node, [1, 0, 0], 5));

            // Assert
            expect(node.position.x).toBeCloseTo(5, 6);
        });
    });

    describe("drawNode and drawNodes", () => {
        it("should hang a set of axes off the node it was given", () => {
            // Arrange
            const node = new BABYLON.TransformNode("node", headless.scene);

            // Act
            service.drawNode(new Inputs.BabylonNode.DrawNodeDto(node));

            // Assert
            expect(service.getChildren(new Inputs.BabylonNode.NodeDto(node))).toHaveLength(1);
        });

        it("should hang a set of axes off every node it was given", () => {
            // Arrange
            const first = new BABYLON.TransformNode("first", headless.scene);
            const second = new BABYLON.TransformNode("second", headless.scene);

            // Act
            service.drawNodes(new Inputs.BabylonNode.DrawNodesDto([first, second]));

            // Assert
            expect(service.getChildren(new Inputs.BabylonNode.NodeDto(first))).toHaveLength(1);
            expect(service.getChildren(new Inputs.BabylonNode.NodeDto(second))).toHaveLength(1);
        });
    });
});
