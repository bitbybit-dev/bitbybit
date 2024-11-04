import { GeometryHelper, JSCADText, MathBitByBit, Tag, Vector } from "@bitbybit-dev/core";
import { Context } from "../context";
import { DrawHelper } from "../draw-helper";
import { Draw } from "./draw";
import { JSCADWorkerManager } from "@bitbybit-dev/core/lib/workers";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker/lib";
import { InstancedMesh, Mesh, MeshPhongMaterial, Scene } from "three";
import * as Inputs from "../inputs";

describe("Draw unit tests", () => {
    let draw: Draw;

    beforeAll(async () => {
        const context = new Context();
        const jscadWorkerManager = new JSCADWorkerManager();
        const occtWorkerManager = new OCCTWorkerManager();

        const solidText = new JSCADText(jscadWorkerManager);
        const math = new MathBitByBit();
        const geometryHelper = new GeometryHelper();
        const vector = new Vector(context, math, geometryHelper);
        const drawHelper = new DrawHelper(context, solidText, vector, jscadWorkerManager, occtWorkerManager);
        context.scene = new Scene();
        const tag = new Tag(context);
        draw = new Draw(drawHelper, context, tag);
    });

    it("should draw a point via draw any async without options", async () => {
        const res = await draw.drawAnyAsync({ entity: [1, -2, 3] });
        const ptMesh = res.children[0];
        expect(res.name).toContain("pointMesh");
        expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.point);
        expect(ptMesh.position.x).toBe(1);
        expect(ptMesh.position.y).toBe(-2);
        expect(ptMesh.position.z).toBe(3);
    });

    it("should draw a point via draw any without options", () => {
        const res = draw.drawAny({ entity: [-1, 2, -3] });
        const ptMesh = res.children[0];
        expect(res.name).toContain("pointMesh");
        expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.point);
        expect(ptMesh.position.x).toBe(-1);
        expect(ptMesh.position.y).toBe(2);
        expect(ptMesh.position.z).toBe(-3);
    });

    it("should draw a point via draw any with options", () => {
        const options = {
            ...new Inputs.Draw.DrawBasicGeometryOptions(),
            size: 4,
            colours: "#ff0000",
        };
        const res = draw.drawAny({ entity: [-1, 2, -3], options });

        expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.point);

        const ptMesh = res.children[0] as Mesh;
        const material = ptMesh.material as MeshPhongMaterial;
        expect(res.name).toContain("pointMesh");
        expect(material.color.getHex()).toBe(0xff0000);
        expect(ptMesh.position.x).toBe(-1);
        expect(ptMesh.position.y).toBe(2);
        expect(ptMesh.position.z).toBe(-3);
    });

    it("should update the same point via draw any with options", () => {
        const options = {
            ...new Inputs.Draw.DrawBasicGeometryOptions(),
            size: 4,
            colours: "#ff0000",
            updatable: true
        };
        const res = draw.drawAny({ entity: [-1, 2, -3], options });
        const res2 = draw.drawAny({ entity: [2, 5, 5], options, group: res });

        expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.point);
        expect(res2.userData.type).toBe(Inputs.Draw.drawingTypes.point);

        const ptMesh = res2.children[0] as Mesh;
        const material = ptMesh.material as MeshPhongMaterial;
        expect(res2.name).toContain("pointMesh");
        expect(res2.name).toEqual(res.name);
        expect(material.color.getHex()).toBe(0xff0000);
        expect(ptMesh.position.x).toBe(2);
        expect(ptMesh.position.y).toBe(5);
        expect(ptMesh.position.z).toBe(5);
    });

    it("should update the same point via draw any with options that have colors in array", () => {
        const options = {
            ...new Inputs.Draw.DrawBasicGeometryOptions(),
            size: 4,
            colours: ["#0000ff"],
            updatable: true
        };
        const res = draw.drawAny({ entity: [-1, 2, -3], options });
        const res2 = draw.drawAny({ entity: [2, 5, 5], options, group: res });

        expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.point);
        expect(res2.userData.type).toBe(Inputs.Draw.drawingTypes.point);

        const ptMesh = res.children[0] as Mesh;
        const ptMesh2 = res2.children[0] as Mesh;
        const material = ptMesh.material as MeshPhongMaterial;
        const material2 = ptMesh2.material as MeshPhongMaterial;
        expect(res2.name).toContain("pointMesh");
        expect(res2.name).toEqual(res.name);
        expect(material.name).toEqual(material2.name);
        expect(material.color.getHex()).toBe(0x0000ff);
        expect(ptMesh.position.x).toBe(2);
        expect(ptMesh.position.y).toBe(5);
        expect(ptMesh.position.z).toBe(5);
        res2.children.forEach((child, index) => {
            expect(child.name).toEqual(res.children[index].name);
        });
    });

    it("should draw a points via draw any async without options", async () => {
        const res = await draw.drawAnyAsync({ entity: [[1, -2, 3], [2, 3, 4], [-3, 2, -1]] });
        expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.points);
        expect(res.children.length).toBe(3);
        expect(res.name).toContain("pointsMesh");
        expect(res.children[0].position.x).toBe(1);
        expect(res.children[0].position.y).toBe(-2);
        expect(res.children[0].position.z).toBe(3);
        expect(res.children[1].position.x).toBe(2);
        expect(res.children[1].position.y).toBe(3);
        expect(res.children[1].position.z).toBe(4);
        expect(res.children[2].position.x).toBe(-3);
        expect(res.children[2].position.y).toBe(2);
        expect(res.children[2].position.z).toBe(-1);
        expect(res.children[0] instanceof InstancedMesh).toBe(true);
        expect(res.children[1] instanceof InstancedMesh).toBe(true);
        expect(res.children[2] instanceof InstancedMesh).toBe(true);
    });

    it("should update points via draw any async without options", async () => {
        const options = {
            ...new Inputs.Draw.DrawBasicGeometryOptions(),
            size: 4,
            colours: ["#0000ff"],
            updatable: true
        };
        const res = await draw.drawAnyAsync({ entity: [[1, -2, 3], [2, 3, 4], [-3, 2, -1]], options });
        const res2 = await draw.drawAnyAsync({ entity: [[-1, 2, -3], [2.2, 3.5, -3], [3, -2, 1.5]], options, group: res });

        expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.points);
        expect(res2.userData.type).toBe(Inputs.Draw.drawingTypes.points);

        expect(res.children.length).toBe(3);
        expect(res.name).toContain("pointsMesh");

        expect(res.name).toEqual(res2.name);
        const secondPt = res.children[1] as InstancedMesh;
        const secondPtUpdated = res2.children[1] as InstancedMesh;
        expect(secondPtUpdated.name).toEqual(secondPt.name);

        const secondPtMaterial = secondPt.material as MeshPhongMaterial;
        const secondPtMaterialUpdated = secondPtUpdated.material as MeshPhongMaterial;
        expect(secondPtMaterial.color.getHex()).toBe(0x0000ff);
        expect(secondPtMaterialUpdated.color.getHex()).toBe(0x0000ff);
        expect(secondPtMaterial.name).toEqual(secondPtMaterialUpdated.name);

        expect(res2.children[0].position.x).toBe(-1);
        expect(res2.children[0].position.y).toBe(2);
        expect(res2.children[0].position.z).toBe(-3);
        expect(res2.children[1].position.x).toBe(2.2);
        expect(res2.children[1].position.y).toBe(3.5);
        expect(res2.children[1].position.z).toBe(-3);
        expect(res2.children[2].position.x).toBe(3);
        expect(res2.children[2].position.y).toBe(-2);
        expect(res2.children[2].position.z).toBe(1.5);
    });

    it("should create new points if two lists that should update are not of equal length", async () => {
        const options = {
            ...new Inputs.Draw.DrawBasicGeometryOptions(),
            size: 4,
            colours: ["#0000ff"],
            updatable: true
        };
        const res = await draw.drawAnyAsync({ entity: [[1, -2, 3], [2, 3, 4], [-3, 2, -1]], options });
        const res2 = await draw.drawAnyAsync({ entity: [[-1, 2, -3], [2.2, 3.5, -3], [3, -2, 1.5], [4, -4, 1.5]], options, group: res });

        expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.points);
        expect(res2.userData.type).toBe(Inputs.Draw.drawingTypes.points);

        expect(res.children.length).toBe(3);
        expect(res.name).toContain("pointsMesh");

        expect(res.name).not.toEqual(res2.name);
        const secondPt = res.children[1] as InstancedMesh;
        const secondPtUpdated = res2.children[1] as InstancedMesh;
        expect(secondPtUpdated.name).not.toEqual(secondPt.name);

        const secondPtMaterial = secondPt.material as MeshPhongMaterial;
        const secondPtMaterialUpdated = secondPtUpdated.material as MeshPhongMaterial;
        expect(secondPtMaterial.color.getHex()).toBe(0x0000ff);
        expect(secondPtMaterialUpdated.color.getHex()).toBe(0x0000ff);
        expect(secondPtMaterial.name).not.toEqual(secondPtMaterialUpdated.name);

        expect(res2.children[0].position.x).toBe(-1);
        expect(res2.children[0].position.y).toBe(2);
        expect(res2.children[0].position.z).toBe(-3);
        expect(res2.children[1].position.x).toBe(2.2);
        expect(res2.children[1].position.y).toBe(3.5);
        expect(res2.children[1].position.z).toBe(-3);
        expect(res2.children[2].position.x).toBe(3);
        expect(res2.children[2].position.y).toBe(-2);
        expect(res2.children[2].position.z).toBe(1.5);
    });

    it("should create detailed points if there are fewer then 1000 points in the list", async () => {
        const options = {
            ...new Inputs.Draw.DrawBasicGeometryOptions(),
            size: 3,
            colours: ["#0000ff"]
        };
        const res = await draw.drawAnyAsync({ entity: [[1, -2, 3], [2, 3, 4], [-3, 2, -1]], options });
        const mesh = res.children[0] as InstancedMesh;
        expect(mesh.geometry.attributes.position.count).toEqual(49);
    });

    it("should create less detailed points if there are more then 1000 points in the list", async () => {
        const options = {
            ...new Inputs.Draw.DrawBasicGeometryOptions(),
            size: 3,
            colours: ["#0000ff"]
        };
        const points = [];
        for (let i = 0; i < 1005; i++) {
            points.push([1, i, 3]);
        }
        const res = await draw.drawAnyAsync({ entity: points, options });
        const mesh = res.children[0] as InstancedMesh;
        expect(mesh.geometry.attributes.position.count).toEqual(12);
    });

    it("should create coloured points", async () => {
        const options = {
            ...new Inputs.Draw.DrawBasicGeometryOptions(),
            size: 3,
            colours: ["#0000ff", "#ff0000", "#00ff00"]
        };
        const res = await draw.drawAnyAsync({ entity: [[1, -2, 3], [2, 3, 4], [-3, 2, -1]], options });
        const mat1 = (res.children[0] as InstancedMesh).material as MeshPhongMaterial;
        const mat2 = (res.children[1] as InstancedMesh).material as MeshPhongMaterial;
        const mat3 = (res.children[2] as InstancedMesh).material as MeshPhongMaterial;
        expect(mat1.color.getHex()).toBe(0x0000ff);
        expect(mat2.color.getHex()).toBe(0xff0000);
        expect(mat3.color.getHex()).toBe(0x00ff00);
    });

    it("should create all points of the same colour if lengths of positions and colours do not match", async () => {
        const options = {
            ...new Inputs.Draw.DrawBasicGeometryOptions(),
            size: 3,
            colours: ["#0000ff", "#ff0000"]
        };
        const res = await draw.drawAnyAsync({ entity: [[1, -2, 3], [2, 3, 4], [-3, 2, -1]], options });

        const mat1 = (res.children[0] as InstancedMesh).material as MeshPhongMaterial;
        const mat2 = (res.children[1] as InstancedMesh).material as MeshPhongMaterial;
        const mat3 = (res.children[2] as InstancedMesh).material as MeshPhongMaterial;
        expect(mat1.color.getHex()).toBe(0x0000ff);
        expect(mat2.color.getHex()).toBe(0x0000ff);
        expect(mat3.color.getHex()).toBe(0x0000ff);
    });

});
