import { Tag } from "@bitbybit-dev/core";
import { JSCADText } from "@bitbybit-dev/jscad-worker";
import { GeometryHelper, MathBitByBit, Vector } from "@bitbybit-dev/base";
import { Context } from "../context";
import { DrawHelper } from "../draw-helper";
import { Draw } from "./draw";
import { JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker/lib";
import { InstancedMesh, LineSegments, Mesh, MeshPhongMaterial, Scene } from "three";
import * as Inputs from "../inputs";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";

describe("Draw unit tests", () => {
    let draw: Draw;
    let tag: Tag;
    let occtWorkerManager: OCCTWorkerManager;
    let jscadWorkerManager: JSCADWorkerManager;
    let manifoldWorkerManager: ManifoldWorkerManager;
    let vector: Vector;

    beforeAll(async () => {
        const context = new Context();
        jscadWorkerManager = new JSCADWorkerManager();
        occtWorkerManager = new OCCTWorkerManager();
        manifoldWorkerManager = new ManifoldWorkerManager();

        const solidText = new JSCADText(jscadWorkerManager);

        const math = new MathBitByBit();
        const geometryHelper = new GeometryHelper();

        vector = new Vector(math, geometryHelper);

        const drawHelper = new DrawHelper(context, solidText, vector, jscadWorkerManager, manifoldWorkerManager, occtWorkerManager);
        context.scene = new Scene();
        tag = new Tag(context);
        draw = new Draw(drawHelper, context, tag);
    });

    describe("Draw point and points tests", () => {

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

    describe("Draw line tests", () => {

        it("should draw a line via draw any async without options", async () => {
            const res = await draw.drawAnyAsync({ entity: { start: [1, -2, 3], end: [0, -3, 0] } });
            expect(res.name).toContain("polylines");
            expect(res.children.length).toBe(1);
            expect(res.children[0] instanceof LineSegments).toBe(true);
            expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.line);
        });

        it("should draw a line via draw any without options", async () => {
            const res = await draw.drawAny({ entity: { start: [1, -3, 3], end: [0, -3, 4] } });
            expect(res.name).toContain("polylines");
            expect(res.children.length).toBe(1);
            expect(res.children[0] instanceof LineSegments).toBe(true);
            expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.line);
        });

        it("should draw a line via draw any with options", () => {
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                size: 4,
                colours: "#ff0000",
            };
            const res = draw.drawAny({ entity: { start: [1, -3, 3], end: [0, -3, 4] }, options });

            expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.line);

            const ptMesh = res.children[0] as LineSegments;
            expect(res.name).toContain("polylines");
            expect(ptMesh.geometry.attributes.position.array.toString()).toEqual("1,-3,3,0,-3,4");
        });

        it("should draw lines via draw any with options", () => {
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                size: 4,
                colours: "#ff0000",
            };
            const res = draw.drawAny({ entity: [{ start: [1, -3, 3], end: [0, -3, 4] }, { start: [1, 3, 3], end: [0, 3, -4] }], options });

            expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.lines);

            const ptMesh = res.children[0] as LineSegments;
            expect(res.name).toContain("polylines");
            expect(ptMesh.geometry.attributes.position.array.toString()).toEqual("1,-3,3,0,-3,4,1,3,3,0,3,-4");
        });

        it("should update lines via draw any with options", () => {
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                size: 4,
                colours: "#ff0000",
                updatable: true,
            };
            const res = draw.drawAny({ entity: [{ start: [1, -3, 3], end: [0, -3, 4] }, { start: [1, 3, 3], end: [0, 3, -4] }], options });
            const res2 = draw.drawAny({ entity: [{ start: [3, -4, 4], end: [1, -4, 5] }, { start: [2, 4, 4], end: [1, 4, -5] }], options, group: res });

            expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.lines);
            expect(res2.name).toEqual(res.name);
            const ptMesh = res.children[0] as LineSegments;
            expect(res.name).toContain("polylines");
            expect(ptMesh.geometry.attributes.position.array.toString()).toEqual("3,-4,4,1,-4,5,2,4,4,1,4,-5");
        });

        it("should update a line via draw any with options", () => {
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                size: 4,
                colours: "#ff0000",
                updatable: true,
            };
            const res = draw.drawAny({ entity: { start: [1, -3, 3], end: [0, -3, 4] }, options });
            const res2 = draw.drawAny({ entity: { start: [1, 3, -33], end: [0, -33, 4] }, options, group: res });

            expect(res2.userData.type).toBe(Inputs.Draw.drawingTypes.line);
            expect(res.name).toEqual(res2.name);

            const lineSegments2 = res2.children[0] as LineSegments;
            expect(lineSegments2.geometry.attributes.position.array.toString()).toEqual("1,3,-33,0,-33,4");
        });

        it("should create a polyline via draw any with options", () => {
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                size: 4,
                colours: "#ff00ff",
                updatable: false,
            };
            const res = draw.drawAny({ entity: { points: [[1, -3, 3], [0, -3, 4], [3, 4, 5]] }, options });

            expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.polyline);

            const lineSegments1 = res.children[0] as LineSegments;
            expect(lineSegments1.geometry.attributes.position.array.toString()).toEqual("1,-3,3,0,-3,4,0,-3,4,3,4,5");
        });

        it("should update a polyline via draw any with options", () => {
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                size: 4,
                colours: "#ff00ff",
                updatable: true,
            };
            const res = draw.drawAny({ entity: { points: [[1, -3, 3], [0, -3, 4], [3, 4, 5]] }, options });
            const res2 = draw.drawAny({ entity: { points: [[2, -4, 4], [1, -4, 3], [4, 5, 6]] }, options, group: res });

            expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.polyline);
            expect(res.name).toEqual(res2.name);
            const lineSegments1 = res.children[0] as LineSegments;
            expect(lineSegments1.geometry.attributes.position.array.toString()).toEqual("2,-4,4,1,-4,3,1,-4,3,4,5,6");
        });

        it("should create a closed polyline with color via draw any with options", () => {
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                size: 4,
                colours: "#ff00ff",
                updatable: false,
            };
            const res = draw.drawAny({
                entity: [
                    { points: [[1, -3, 3], [0, -3, 4], [3, 4, 5]], isClosed: true, color: [1, 0, 1] },
                    { points: [[1, -3, 3], [0, -3, 4], [3, 4, 5]], isClosed: false, color: [1, 1, 1] }
                ], options
            });

            expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.polylines);

            const lineSegments1 = res.children[0] as LineSegments;
            expect(lineSegments1.geometry.attributes.position.array.toString()).toEqual("1,-3,3,0,-3,4,0,-3,4,3,4,5,3,4,5,1,-3,3,1,-3,3,0,-3,4,0,-3,4,3,4,5");
        });

        it("should update a polyline via draw any with options", () => {
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                size: 4,
                colours: "#ff0000",
                updatable: true,
            };
            const res = draw.drawAny({ entity: [{ points: [[1, -3, 3], [0, -3, 4], [3, 4, 5]] }, { points: [[3, -3, 3], [4, -4, 5], [4, 6, 5]] }], options });
            const res2 = draw.drawAny({ entity: [{ points: [[2, -4, 5], [1, -2, 3], [4, 6, 7]] }, { points: [[9, -4, 2], [3, -3, 5], [6, 4, 3]] }], options, group: res });

            expect(res2.userData.type).toBe(Inputs.Draw.drawingTypes.polylines);
            expect(res.name).toEqual(res2.name);

            const lineSegments1 = res.children[0] as LineSegments;
            const lineSegments2 = res2.children[0] as LineSegments;

            expect(lineSegments1.name).toEqual(lineSegments2.name);

            expect(lineSegments2.geometry.attributes.position.array.toString()).toEqual("2,-4,5,1,-2,3,1,-2,3,4,6,7,9,-4,2,3,-3,5,3,-3,5,6,4,3");
        });

        it("should update a polyline via draw any with options if at least one polyline has more points", () => {
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                size: 4,
                colours: "#ff0000",
                updatable: true,
            };
            const res = draw.drawAny({ entity: [{ points: [[1, -3, 3], [0, -3, 4], [3, 4, 5]] }, { points: [[3, -3, 3], [4, -4, 5], [4, 6, 5]] }], options });
            const res2 = draw.drawAny({ entity: [{ points: [[2, -4, 5], [1, -2, 3], [4, 6, 7], [3, 4, 6]] }, { points: [[9, -4, 2], [3, -3, 5], [6, 4, 3]] }], options, group: res });

            expect(res2.userData.type).toBe(Inputs.Draw.drawingTypes.polylines);
            expect(res.name).not.toEqual(res2.name);

            const lineSegments1 = res.children[0] as LineSegments;
            const lineSegments2 = res2.children[0] as LineSegments;

            expect(lineSegments1.name).not.toEqual(lineSegments2.name);
            expect(lineSegments1.geometry.attributes.position.array.toString()).toEqual("1,-3,3,0,-3,4,0,-3,4,3,4,5,3,-3,3,4,-4,5,4,-4,5,4,6,5");
            expect(lineSegments2.geometry.attributes.position.array.toString()).toEqual("2,-4,5,1,-2,3,1,-2,3,4,6,7,4,6,7,3,4,6,9,-4,2,3,-3,5,3,-3,5,6,4,3");
        });
    });

    describe("Draw verb geometry tests", () => {
        it("should draw a curve", async () => {
            const curveMock = {
                tessellate: () => {
                    return [[1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 6]];
                },
                _data: { controlPoints: [], knots: 3, degree: 3 },
            };
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                size: 4,
                colours: "#ff0000",
                updatable: true,
            };
            const res = await draw.drawAnyAsync({ entity: curveMock, options });
            expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.verbCurve);
            expect(res).toBeDefined();
            expect(res.name).toContain("polyline");
            expect(res.children.length).toBe(1);
            const lineSegments = res.children[0] as LineSegments;
            expect(lineSegments.geometry.attributes.position.array.toString()).toEqual("1,2,3,2,3,4,2,3,4,3,4,5,3,4,5,4,5,6");
        });

        it("should draw curves", async () => {
            const curveMock1 = {
                tessellate: () => {
                    return [[1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 6]];
                },
                _data: { controlPoints: [], knots: 3, degree: 3 },
            };
            const curveMock2 = {
                tessellate: () => {
                    return [[3, 2, 3], [4, 3, 4], [3, 5, 5], [3, 5, 6]];
                },
                _data: { controlPoints: [], knots: 3, degree: 3 },
            };
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                size: 4,
                colours: "#ff0000",
                updatable: true,
            };
            const res = await draw.drawAnyAsync({ entity: [curveMock1, curveMock2], options });
            expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.verbCurves);
            expect(res).toBeDefined();
            expect(res.name).toContain("polyline");
            const lineSegments = res.children[0] as LineSegments;
            expect(lineSegments.geometry.attributes.position.array.toString()).toEqual("1,2,3,2,3,4,2,3,4,3,4,5,3,4,5,4,5,6,3,2,3,4,3,4,4,3,4,3,5,5,3,5,5,3,5,6");
        });

        it("should update drawn curves", async () => {
            const curveMock1 = {
                tessellate: () => {
                    return [[1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 6]];
                },
                _data: { controlPoints: [], knots: 3, degree: 3 },
            };
            const curveMock2 = {
                tessellate: () => {
                    return [[3, 2, 3], [4, 3, 4], [3, 5, 5], [3, 5, 6]];
                },
                _data: { controlPoints: [], knots: 3, degree: 3 },
            };
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                size: 4,
                colours: "#ff0000",
                updatable: true,
            };
            const res = await draw.drawAnyAsync({ entity: [curveMock1, curveMock2], options });
            const res2 = await draw.drawAnyAsync({ entity: [curveMock2, curveMock1], options, group: res });

            expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.verbCurves);
            expect(res).toBeDefined();
            expect(res.name).toContain("polyline");
            expect(res.name).toEqual(res2.name);
            const lineSegments = res.children[0] as LineSegments;
            expect(lineSegments.geometry.attributes.position.array.toString()).toEqual("3,2,3,4,3,4,4,3,4,3,5,5,3,5,5,3,5,6,1,2,3,2,3,4,2,3,4,3,4,5,3,4,5,4,5,6");
        });

        it("should create new verb curve", async () => {
            const curveMock1 = {
                tessellate: () => {
                    return [[1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 6]];
                },
                _data: { controlPoints: [], knots: 3, degree: 3 },
            };
            const curveMock2 = {
                tessellate: () => {
                    return [[3, 2, 3], [4, 3, 4], [3, 5, 5], [3, 5, 6]];
                },
                _data: { controlPoints: [], knots: 3, degree: 3 },
            };
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                size: 4,
                colours: "#ff0000",
                updatable: true,
            };
            const res = await draw.drawAnyAsync({ entity: curveMock1, options });
            const res2 = await draw.drawAnyAsync({ entity: curveMock2, options, group: res });

            expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.verbCurve);
            expect(res).toBeDefined();
            expect(res.name).toContain("polyline");
            expect(res.name).toEqual(res2.name);
            const lineSegments1 = res.children[0] as LineSegments;
            expect(lineSegments1.geometry.attributes.position.array.toString()).toEqual("3,2,3,4,3,4,4,3,4,3,5,5,3,5,5,3,5,6");
            const lineSegments2 = res2.children[0] as LineSegments;
            expect(lineSegments2.geometry.attributes.position.array.toString()).toEqual("3,2,3,4,3,4,4,3,4,3,5,5,3,5,5,3,5,6");
        });

        it("should draw verb surface", async () => {
            const surfaceMock = createSurfaceMock();
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                size: 4,
                colours: "#ff0000",
                updatable: true,
            };
            const res = await draw.drawAnyAsync({ entity: surfaceMock, options });
            expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.verbSurface);
            expect(res).toBeDefined();
            expect(res.name).toContain("surface");
            expect(res.children.length).toBe(1);
            const faceMesh = res.children[0] as Mesh;
            const material = faceMesh.material as MeshPhongMaterial;
            expect(material.color.getHex()).toBe(0xff0000);
            expect(faceMesh.geometry.attributes.position.array.toString()).toEqual("3,4,5,2,3,4,1,2,3,4,5,6,3,4,5,2,3,4,34,-5,3,4,5,6,3,4,5");
        });

        it("should draw verb surface and hide it", async () => {
            const surfaceMock = createSurfaceMock();
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                size: 4,
                colours: "#ff0000",
                updatable: true,
                hidden: true,
            };
            const res = await draw.drawAnyAsync({ entity: surfaceMock, options });
            expect(res.visible).toBe(false);
        });

        it("should create new verb surface mesh in the older group when updating as that is not meant for real time updates", async () => {
            const surfaceMock1 = createSurfaceMock();
            const surfaceMock2 = createSurfaceMock2();
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                size: 4,
                colours: "#ff0000",
                updatable: true,
            };
            const res = await draw.drawAnyAsync({ entity: surfaceMock1, options });
            const res2 = await draw.drawAnyAsync({ entity: surfaceMock2, options, group: res });

            expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.verbSurface);
            expect(res).toBeDefined();
            expect(res.name).toContain("surface");
            expect(res.children.length).toBe(1);
            expect(res2.name).toEqual(res.name);
            const faceMesh = res.children[0] as Mesh;
            const material = faceMesh.material as MeshPhongMaterial;
            expect(material.color.getHex()).toBe(0xff0000);
            expect(faceMesh.geometry.attributes.position.array.toString()).toEqual("3,6,5,2,5,4,1,3,3,3,5,6,3,6,5,2,5,4,3,-5,3,3,5,6,3,6,5");
        });

        it("should draw verb surfaces", async () => {
            const surfaceMock1 = createSurfaceMock();
            const surfaceMock2 = {
                ...surfaceMock1
            };
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                size: 4,
                colours: ["#ff0000", "#00ff00"],
                updatable: true,
            };
            const res = await draw.drawAnyAsync({ entity: [surfaceMock1, surfaceMock2], options });
            expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.verbSurfaces);
            expect(res).toBeDefined();
            expect(res.name).toContain("colouredSurfaces");
            expect(res.children.length).toBe(2);

            const faceMesh1 = res.children[0].children[0] as Mesh;
            const material1 = faceMesh1.material as MeshPhongMaterial;
            expect(material1.color.getHex()).toBe(0xff0000);

            const faceMesh2 = res.children[1].children[0] as Mesh;
            const material2 = faceMesh2.material as MeshPhongMaterial;
            expect(material2.color.getHex()).toBe(0x00ff00);

            expect(faceMesh1.geometry.attributes.position.array.toString()).toEqual("3,4,5,2,3,4,1,2,3,4,5,6,3,4,5,2,3,4,34,-5,3,4,5,6,3,4,5");
        });
    });

    describe("Draw OCCT geometry tests", () => {

        it("should draw a cube mesh with default options", async () => {
            const options = new Inputs.Draw.DrawOcctShapeOptions();
            occtWorkerManager.genericCallToWorkerPromise = jest.fn().mockResolvedValue(mockOCCTBoxDecomposedMesh());

            const res = await draw.drawAnyAsync({ entity: { type: "occ-shape", hash: 12314455 }, options });
            expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.occt);
            expect(res).toBeDefined();
            expect(res.name).toContain("brepMesh");
            expect(res.children.length).toBe(2);
        });

        it("should draw a cube mesh with custom material", async () => {
            const options = new Inputs.Draw.DrawOcctShapeOptions();
            const customMaterial = new MeshPhongMaterial({ color: 0xff00ff });
            options.faceMaterial = customMaterial;

            occtWorkerManager.genericCallToWorkerPromise = jest.fn().mockResolvedValue(mockOCCTBoxDecomposedMesh());

            const res = await draw.drawAnyAsync({ entity: { type: "occ-shape", hash: 12314455 }, options });
            expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.occt);
            expect(res).toBeDefined();
            expect(res.name).toContain("brepMesh");
            expect(res.children.length).toBe(2);
            const face = res.children[0].children[0] as Mesh;
            const material = face.material as MeshPhongMaterial;
            expect(material.color.getHexString()).toEqual("ff00ff");
        });

        it("should draw a cube mesh with specific options", async () => {
            const options = new Inputs.Draw.DrawOcctShapeOptions();
            options.drawVertices = true;
            options.drawEdgeIndexes = true;
            options.drawFaceIndexes = true;
            occtWorkerManager.genericCallToWorkerPromise = jest.fn().mockResolvedValue(mockOCCTBoxDecomposedMesh());
            jscadWorkerManager.genericCallToWorkerPromise = jest.fn().mockResolvedValue([[[0.5, 0.3, 0.2], [0.5, 0.3, 0.2], [0.5, 0.3, 0.2], [0.5, 0.3, 0.2]]]);
            vector.add = jest.fn().mockReturnValue([[[1, 2, 3], [1, 2, 3]], [[1, 2, 3], [1, 2, 3]]]);
            const res = await draw.drawAnyAsync({ entity: { type: "occ-shape", hash: 12314455 }, options });
            expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.occt);
            expect(res).toBeDefined();
            expect(res.name).toContain("brepMesh");
            expect(res.children.length).toBe(4);
        });

        it("should draw multiple cubes mesh with default options", async () => {
            const options = new Inputs.Draw.DrawOcctShapeOptions();
            occtWorkerManager.genericCallToWorkerPromise = jest.fn().mockResolvedValue([mockOCCTBoxDecomposedMesh(), mockOCCTBoxDecomposedMesh()]);

            const res = await draw.drawAnyAsync({ entity: [{ type: "occ-shape", hash: 12314455 }, { type: "occ-shape", hash: 12314455 }], options });
            expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.occtShapes);
            expect(res).toBeDefined();
            expect(res.name).toContain("shapesMeshContainer");
            expect(res.children.length).toBe(2);
        });

        it("should draw multiple cubes with custom material with default options", async () => {
            const options = new Inputs.Draw.DrawOcctShapeOptions();
            const customMaterial = new MeshPhongMaterial({ color: 0xff00ff });
            options.faceMaterial = customMaterial;
            occtWorkerManager.genericCallToWorkerPromise = jest.fn().mockResolvedValue([mockOCCTBoxDecomposedMesh(), mockOCCTBoxDecomposedMesh()]);

            const res = await draw.drawAnyAsync({ entity: [{ type: "occ-shape", hash: 12314455 }, { type: "occ-shape", hash: 12314455 }], options });
            expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.occtShapes);
            expect(res).toBeDefined();
            expect(res.name).toContain("shapesMeshContainer");
            expect(res.children.length).toBe(2);
            const face = res.children[0].children[0].children[0] as Mesh;
            const material = face.material as MeshPhongMaterial;

            expect(material.color.getHexString()).toEqual("ff00ff");
        });
    });

    describe("Draw JSCAD meshes", () => {

        it("should draw a JSCAD mesh with default options", async () => {
            const options = new Inputs.Draw.DrawBasicGeometryOptions();
            jscadWorkerManager.genericCallToWorkerPromise = jest.fn().mockResolvedValue(mockJSCADBoxDecomposedMesh());
            const res = await draw.drawAnyAsync({ entity: { polygons: [] } as any, options });
            expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.jscadMesh);
            expect(res).toBeDefined();
            expect(res.name).toContain("jscadMesh");
            expect(res.children.length).toBe(1);
        });

        it("should draw a JSCAD mesh with specified color options", async () => {
            const options = new Inputs.Draw.DrawBasicGeometryOptions();
            jscadWorkerManager.genericCallToWorkerPromise = jest.fn().mockResolvedValue({ ...mockJSCADBoxDecomposedMesh() });
            const res = await draw.drawAnyAsync({ entity: { polygons: [], color: [0, 1, 0] } as any, options });
            expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.jscadMesh);
            expect(res).toBeDefined();
            expect(res.name).toContain("jscadMesh");
            expect(res.children.length).toBe(1);
            const mesh = res.children[0] as Mesh;
            const material = mesh.material as MeshPhongMaterial;
            expect(material.color.getHexString()).toEqual("00ff00");
        });

        it("should draw a JSCAD mesh with specified color options", async () => {
            const options = new Inputs.Draw.DrawBasicGeometryOptions();
            options.colours = "#00ffff";
            jscadWorkerManager.genericCallToWorkerPromise = jest.fn().mockResolvedValue({ ...mockJSCADBoxDecomposedMesh() });
            const res = await draw.drawAnyAsync({ entity: { polygons: [] } as any, options });
            expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.jscadMesh);
            expect(res).toBeDefined();
            expect(res.name).toContain("jscadMesh");
            expect(res.children.length).toBe(1);
            const mesh = res.children[0] as Mesh;
            const material = mesh.material as MeshPhongMaterial;
            expect(material.color.getHexString()).toEqual("00ffff");
        });

        it("should draw jscad mesh with native color and ignor options color", async () => {
            const options = new Inputs.Draw.DrawBasicGeometryOptions();
            options.colours = "#00ffff";
            jscadWorkerManager.genericCallToWorkerPromise = jest.fn().mockResolvedValue({ ...mockJSCADBoxDecomposedMesh() });
            const res = await draw.drawAnyAsync({ entity: { polygons: [], color: [0, 0, 1] } as any, options });
            expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.jscadMesh);
            expect(res).toBeDefined();
            expect(res.name).toContain("jscadMesh");
            expect(res.children.length).toBe(1);
            const mesh = res.children[0] as Mesh;
            const material = mesh.material as MeshPhongMaterial;
            expect(material.color.getHexString()).toEqual("0000ff");
        });

        it("should draw multiple JSCAD meshes with default options", async () => {
            const options = new Inputs.Draw.DrawBasicGeometryOptions();
            jscadWorkerManager.genericCallToWorkerPromise = jest.fn().mockResolvedValue([mockJSCADBoxDecomposedMesh(), mockJSCADBoxDecomposedMesh()]);
            const res = await draw.drawAnyAsync({ entity: [{ polygons: [] } as any, { polygons: [] } as any], options });
            expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.jscadMeshes);
            expect(res).toBeDefined();
            expect(res.name).toContain("jscadMesh");
            expect(res.children.length).toBe(2);
        });

        it("should draw multiple JSCAD meshes with custom color", async () => {
            const options = new Inputs.Draw.DrawBasicGeometryOptions();
            jscadWorkerManager.genericCallToWorkerPromise = jest.fn().mockResolvedValue([mockJSCADBoxDecomposedMesh(), { ...mockJSCADBoxDecomposedMesh(), color: [0, 0, 1] }]);
            const res = await draw.drawAnyAsync({ entity: [{ polygons: [] } as any, { polygons: [] } as any], options });
            expect(res.userData.type).toBe(Inputs.Draw.drawingTypes.jscadMeshes);
            expect(res).toBeDefined();
            expect(res.name).toContain("jscadMesh");
            expect(res.children.length).toBe(2);
            const mesh = res.children[1].children[0] as Mesh;
            const material = mesh.material as MeshPhongMaterial;
            expect(material.color.getHexString()).toEqual("0000ff");

        });
    });
});


function createSurfaceMock() {
    return {
        tessellate: () => {
            return {
                points: [[1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 6], [34, -5, 3]],
                normals: [[1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 6], [34, -5, 3]],
                uvs: [[1, 2], [2, 3], [3, 4], [4, 5], [34, -5]],
                faces: [[0, 1, 2], [1, 2, 3], [2, 3, 4]]
            };
        },
        _data: { controlPoints: [], knotsU: 3, knotsV: 4, degreeU: 3, degreeV: 4 },
    };
}

function createSurfaceMock2() {
    return {
        tessellate: () => {
            return {
                points: [[1, 3, 3], [2, 5, 4], [3, 6, 5], [3, 5, 6], [3, -5, 3]],
                normals: [[1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 6], [34, -5, 3]],
                uvs: [[1, 2], [2, 3], [3, 4], [4, 5], [34, -5]],
                faces: [[0, 1, 2], [1, 2, 3], [2, 3, 4]]
            };
        },
        _data: { controlPoints: [], knotsU: 3, knotsV: 4, degreeU: 3, degreeV: 4 },
    };
}

function mockOCCTBoxDecomposedMesh() {
    return { "faceList": [{ "vertex_coord": [-0.5, -1, -1.5, -0.5, -1, 1.5, -0.5, 1, -1.5, -0.5, 1, 1.5], "normal_coord": [-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0], "uvs": [0, 0, 3, 0, 0, -2, 3, -2], "tri_indexes": [0, 1, 2, 2, 1, 3], "vertex_coord_vec": [[-0.5, -1, -1.5], [-0.5, -1, 1.5], [-0.5, 1, -1.5], [-0.5, 1, 1.5]], "number_of_triangles": 2, "center_point": [-0.5, 0, 0], "center_normal": [-1, 0, 0], "face_index": 0 }, { "vertex_coord": [0.5, -1, -1.5, 0.5, -1, 1.5, 0.5, 1, -1.5, 0.5, 1, 1.5], "normal_coord": [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0], "uvs": [0, 0, 3, 0, 0, -2, 3, -2], "tri_indexes": [1, 0, 2, 1, 2, 3], "vertex_coord_vec": [[0.5, -1, -1.5], [0.5, -1, 1.5], [0.5, 1, -1.5], [0.5, 1, 1.5]], "number_of_triangles": 2, "center_point": [0.5, 0, 0], "center_normal": [1, 0, 0], "face_index": 1 }, { "vertex_coord": [-0.5, -1, -1.5, 0.5, -1, -1.5, -0.5, -1, 1.5, 0.5, -1, 1.5], "normal_coord": [0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0], "uvs": [0, 0, 0, 1, 3, 0, 3, 1], "tri_indexes": [1, 3, 0, 0, 3, 2], "vertex_coord_vec": [[-0.5, -1, -1.5], [0.5, -1, -1.5], [-0.5, -1, 1.5], [0.5, -1, 1.5]], "number_of_triangles": 2, "center_point": [0, -1, 0], "center_normal": [0, -1, 0], "face_index": 2 }, { "vertex_coord": [-0.5, 1, -1.5, 0.5, 1, -1.5, -0.5, 1, 1.5, 0.5, 1, 1.5], "normal_coord": [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], "uvs": [0, 0, 0, 1, 3, 0, 3, 1], "tri_indexes": [3, 1, 0, 3, 0, 2], "vertex_coord_vec": [[-0.5, 1, -1.5], [0.5, 1, -1.5], [-0.5, 1, 1.5], [0.5, 1, 1.5]], "number_of_triangles": 2, "center_point": [0, 1, 0], "center_normal": [0, 1, 0], "face_index": 3 }, { "vertex_coord": [-0.5, -1, -1.5, -0.5, 1, -1.5, 0.5, -1, -1.5, 0.5, 1, -1.5], "normal_coord": [0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1], "uvs": [0, 0, 0, 2, 1, 0, 1, 2], "tri_indexes": [1, 3, 0, 0, 3, 2], "vertex_coord_vec": [[-0.5, -1, -1.5], [-0.5, 1, -1.5], [0.5, -1, -1.5], [0.5, 1, -1.5]], "number_of_triangles": 2, "center_point": [0, 0, -1.5], "center_normal": [0, 0, -1], "face_index": 4 }, { "vertex_coord": [-0.5, -1, 1.5, -0.5, 1, 1.5, 0.5, -1, 1.5, 0.5, 1, 1.5], "normal_coord": [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], "uvs": [0, 0, 0, 2, 1, 0, 1, 2], "tri_indexes": [3, 1, 0, 3, 0, 2], "vertex_coord_vec": [[-0.5, -1, 1.5], [-0.5, 1, 1.5], [0.5, -1, 1.5], [0.5, 1, 1.5]], "number_of_triangles": 2, "center_point": [0, 0, 1.5], "center_normal": [0, 0, 1], "face_index": 5 }], "edgeList": [{ "vertex_coord": [[-0.5, -1, -1.5], [-0.5, -1, 1.5]], "middle_point": [-0.5, -1, 0], "edge_index": 0 }, { "vertex_coord": [[-0.5, -1, 1.5], [-0.5, 1, 1.5]], "middle_point": [-0.5, 0, 1.5], "edge_index": 1 }, { "vertex_coord": [[-0.5, 1, -1.5], [-0.5, 1, 1.5]], "middle_point": [-0.5, 1, 0], "edge_index": 2 }, { "vertex_coord": [[-0.5, -1, -1.5], [-0.5, 1, -1.5]], "middle_point": [-0.5, 0, -1.5], "edge_index": 3 }, { "vertex_coord": [[0.5, -1, -1.5], [0.5, -1, 1.5]], "middle_point": [0.5, -1, 0], "edge_index": 4 }, { "vertex_coord": [[0.5, -1, 1.5], [0.5, 1, 1.5]], "middle_point": [0.5, 0, 1.5], "edge_index": 5 }, { "vertex_coord": [[0.5, 1, -1.5], [0.5, 1, 1.5]], "middle_point": [0.5, 1, 0], "edge_index": 6 }, { "vertex_coord": [[0.5, -1, -1.5], [0.5, 1, -1.5]], "middle_point": [0.5, 0, -1.5], "edge_index": 7 }, { "vertex_coord": [[-0.5, -1, -1.5], [0.5, -1, -1.5]], "middle_point": [0, -1, -1.5], "edge_index": 8 }, { "vertex_coord": [[-0.5, -1, 1.5], [0.5, -1, 1.5]], "middle_point": [0, -1, 1.5], "edge_index": 9 }, { "vertex_coord": [[-0.5, 1, -1.5], [0.5, 1, -1.5]], "middle_point": [0, 1, -1.5], "edge_index": 10 }, { "vertex_coord": [[-0.5, 1, 1.5], [0.5, 1, 1.5]], "middle_point": [0, 1, 1.5], "edge_index": 11 }], "pointsList": [[-0.5, -1, 1.5], [-0.5, -1, -1.5], [-0.5, 1, 1.5], [-0.5, -1, 1.5], [-0.5, 1, 1.5], [-0.5, 1, -1.5], [-0.5, 1, -1.5], [-0.5, -1, -1.5], [0.5, -1, 1.5], [0.5, -1, -1.5], [0.5, 1, 1.5], [0.5, -1, 1.5], [0.5, 1, 1.5], [0.5, 1, -1.5], [0.5, 1, -1.5], [0.5, -1, -1.5], [0.5, -1, -1.5], [-0.5, -1, -1.5], [0.5, -1, 1.5], [0.5, -1, -1.5], [0.5, -1, 1.5], [-0.5, -1, 1.5], [-0.5, -1, 1.5], [-0.5, -1, -1.5], [0.5, 1, -1.5], [-0.5, 1, -1.5], [0.5, 1, 1.5], [0.5, 1, -1.5], [0.5, 1, 1.5], [-0.5, 1, 1.5], [-0.5, 1, 1.5], [-0.5, 1, -1.5], [-0.5, 1, -1.5], [-0.5, -1, -1.5], [0.5, 1, -1.5], [-0.5, 1, -1.5], [0.5, 1, -1.5], [0.5, -1, -1.5], [0.5, -1, -1.5], [-0.5, -1, -1.5], [-0.5, 1, 1.5], [-0.5, -1, 1.5], [0.5, 1, 1.5], [-0.5, 1, 1.5], [0.5, 1, 1.5], [0.5, -1, 1.5], [0.5, -1, 1.5], [-0.5, -1, 1.5]] };
}

function mockJSCADBoxDecomposedMesh() {
    return { "positions": [-0.5, -1, -1.5, -0.5, 1, 1.5, -0.5, 1, -1.5, -0.5, -1, -1.5, -0.5, -1, 1.5, -0.5, 1, 1.5, 0.5, -1, -1.5, 0.5, 1, 1.5, 0.5, -1, 1.5, 0.5, -1, -1.5, 0.5, 1, -1.5, 0.5, 1, 1.5, -0.5, -1, -1.5, 0.5, -1, 1.5, -0.5, -1, 1.5, -0.5, -1, -1.5, 0.5, -1, -1.5, 0.5, -1, 1.5, -0.5, 1, -1.5, 0.5, 1, 1.5, 0.5, 1, -1.5, -0.5, 1, -1.5, -0.5, 1, 1.5, 0.5, 1, 1.5, -0.5, -1, -1.5, 0.5, 1, -1.5, 0.5, -1, -1.5, -0.5, -1, -1.5, -0.5, 1, -1.5, 0.5, 1, -1.5, -0.5, -1, 1.5, 0.5, 1, 1.5, -0.5, 1, 1.5, -0.5, -1, 1.5, 0.5, -1, 1.5, 0.5, 1, 1.5], "normals": [], "indices": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35], "transforms": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], "hash": -1894319935 };
}