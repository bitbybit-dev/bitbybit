import { describe, it, expect } from "vitest";
import * as BABYLON from "@babylonjs/core";
import * as Inputs from "./index";
import { Base } from "./base-inputs";
import { Draw } from "./draw-inputs";

type Eq<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
const resolvesTo = <T extends true>(_proof?: T): boolean => true;

describe("Draw.Drawn maps an entity to what drawing it produces", () => {

    it("should resolve a node to the node, because drawing one parents an axis triad to it", () => {
        expect(resolvesTo<Eq<Draw.Drawn<BABYLON.TransformNode, BABYLON.Mesh>, BABYLON.TransformNode>>()).toBe(true);
    });

    it("should resolve a list of nodes to a list of nodes, not to a single mesh", () => {
        expect(resolvesTo<Eq<Draw.Drawn<BABYLON.TransformNode[], BABYLON.Mesh>, BABYLON.TransformNode[]>>()).toBe(true);
    });

    it("should resolve a list of meshes to a list, because no update path takes a list", () => {
        expect(resolvesTo<Eq<Draw.Drawn<BABYLON.Mesh[], BABYLON.Mesh>, BABYLON.TransformNode[]>>()).toBe(true);
    });

    it("should resolve a mesh handed back for an update to a mesh, not to the wider node type", () => {
        expect(resolvesTo<Eq<Draw.Drawn<BABYLON.Mesh, BABYLON.Mesh>, BABYLON.Mesh>>()).toBe(true);
    });

    it("should resolve a tag to the drawn tag, because a tag is an overlay and never geometry", () => {
        expect(resolvesTo<Eq<Draw.Drawn<Inputs.Tag.TagDto, BABYLON.Mesh>, Draw.DrawnTag>>()).toBe(true);
    });

    it("should resolve a list of tags to the drawn tags", () => {
        expect(resolvesTo<Eq<Draw.Drawn<Inputs.Tag.TagDto[], BABYLON.Mesh>, Draw.DrawnTags>>()).toBe(true);
    });

    it("should resolve a host-resolved overlay to a handle that only disposes itself", () => {
        expect(resolvesTo<Eq<Draw.Drawn<Draw.CustomOverlayDrawable, BABYLON.Mesh>, Draw.DrawnOverlay>>()).toBe(true);
    });

    it("should resolve a point to the renderer object", () => {
        expect(resolvesTo<Eq<Draw.Drawn<Base.Point3, BABYLON.Mesh>, BABYLON.Mesh>>()).toBe(true);
    });

    it("should resolve a list of shapes to one renderer object, because a list draws as one mesh", () => {
        expect(resolvesTo<Eq<Draw.Drawn<Inputs.OCCT.TopoDSShapePointer[], BABYLON.Mesh>, BABYLON.Mesh>>()).toBe(true);
    });

    it("should resolve a computed vector to the renderer object, so vector results stay drawable", () => {
        expect(resolvesTo<Eq<Draw.Drawn<number[], BABYLON.Mesh>, BABYLON.Mesh>>()).toBe(true);
    });

    it("should resolve a list of computed vectors to the renderer object", () => {
        expect(resolvesTo<Eq<Draw.Drawn<number[][], BABYLON.Mesh>, BABYLON.Mesh>>()).toBe(true);
    });

    it("should accept a vector service result as an entity", () => {
        const computed: number[] = [1, 2, 3];
        const asEntity: Draw.Entity = computed;
        expect(asEntity).toBe(computed);
    });

    it("should resolve a literal empty list to undefined, because an empty list draws nothing", () => {
        expect(resolvesTo<Eq<Draw.Drawn<[], BABYLON.Mesh>, undefined>>()).toBe(true);
    });

    it("should resolve an unknown entity to the union of every branch", () => {
        expect(resolvesTo<Eq<
            Draw.Drawn<Draw.Entity, BABYLON.Mesh>,
            BABYLON.Mesh | BABYLON.TransformNode | BABYLON.TransformNode[] | Draw.DrawnTag | Draw.DrawnTags | Draw.DrawnOverlay
        >>()).toBe(true);
    });
});
