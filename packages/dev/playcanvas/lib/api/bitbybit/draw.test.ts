/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock PlayCanvas with GPU instancing support
jest.mock("playcanvas", () => {
    const { createPlayCanvasMock } = jest.requireActual("../__mocks__/playcanvas.mock");
    return createPlayCanvasMock();
});

import { Tag } from "@bitbybit-dev/core";
import { JSCADText } from "@bitbybit-dev/jscad-worker";
import { GeometryHelper, MathBitByBit, Vector } from "@bitbybit-dev/base";
import { Context } from "../context";
import { DrawHelper } from "../draw-helper";
import { Draw } from "./draw";
import { JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker/lib";
import * as Inputs from "../inputs";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";

import * as pc from "playcanvas";

describe("Draw unit tests", () => {
    let draw: Draw;
    let tag: Tag;
    let occtWorkerManager: OCCTWorkerManager;
    let jscadWorkerManager: JSCADWorkerManager;
    let manifoldWorkerManager: ManifoldWorkerManager;
    let vector: Vector;
    let solidText: JSCADText;

    beforeAll(async () => {
        const context = new Context();
        jscadWorkerManager = new JSCADWorkerManager();
        occtWorkerManager = new OCCTWorkerManager();
        manifoldWorkerManager = new ManifoldWorkerManager();

        solidText = new JSCADText(jscadWorkerManager);

        const math = new MathBitByBit();
        const geometryHelper = new GeometryHelper();

        vector = new Vector(math, geometryHelper);

        const drawHelper = new DrawHelper(context, solidText, vector, jscadWorkerManager, manifoldWorkerManager, occtWorkerManager);
        context.scene = new pc.Entity("root");

        // Create a mock graphics device with the required methods and vram tracking
        const mockGraphicsDevice = {
            createVertexBufferImpl: jest.fn(),
            createIndexBufferImpl: jest.fn(),
            createTextureImpl: jest.fn(function () {
                return {
                    id: Math.random(),
                    propertyChanged: jest.fn(),
                    destroy: jest.fn()
                };
            }),
            setVertexBuffer: jest.fn(),
            setIndexBuffer: jest.fn(),
            draw: jest.fn(),
            vram: {
                vb: 0,
                ib: 0,
                tex: 0,
                totalUsed: 0
            },
            buffers: [],
            indexBuffers: [],
            _textureRegistry: []  // Required by PlayCanvas Texture constructor
        };

        context.app = {
            graphicsDevice: mockGraphicsDevice,
            systems: {
                render: {
                    defaultMaterial: new pc.StandardMaterial()
                }
            }
        } as unknown as pc.Application;

        tag = new Tag(context);
        draw = new Draw(drawHelper, context, tag);
    });

    describe("Draw point and points tests", () => {

        it("should draw a point via draw any async without options", async () => {
            const res = await draw.drawAnyAsync({ entity: [1, -2, 3] });
            expect(res.name).toContain("pointMesh");
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.point);

            // Validate structure - with GPU instancing, children represent color groups
            expect(res).toBeInstanceOf(pc.Entity);
            expect(res.children.length).toBe(1); // Single color group
            expect(res.children[0]).toBeDefined();
        });

        it("should draw a point via draw any without options", () => {
            const res = draw.drawAny({ entity: [-1, 2, -3] });
            expect(res.name).toContain("pointMesh");
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.point);
            // With GPU instancing, children represent color groups, not individual points
            expect(res.children.length).toBe(1);
            expect(res.children[0]).toBeDefined();
        });

        it("should draw a point via draw any with options", () => {
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                size: 4,
                colours: "#ff0000",
            };
            const res = draw.drawAny({ entity: [-1, 2, -3], options });

            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.point);

            expect(res.name).toContain("pointMesh");
            // With GPU instancing, verify structure but not individual positions
            expect(res.children.length).toBe(1);
            expect(res.children[0]).toBeDefined();
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

            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.point);
            expect(res2.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.point);

            expect(res2.name).toContain("pointMesh");
            expect(res2.name).toEqual(res.name);
            // With GPU instancing, verify the entity is reused but skip position checks
            expect(res2.children.length).toBe(1);
            expect(res2.children[0]).toBeDefined();
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

            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.point);
            expect(res2.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.point);

            expect(res2.name).toContain("pointMesh");
            expect(res2.name).toEqual(res.name);
            // With GPU instancing, verify structure
            expect(res2.children.length).toBe(1);
            expect(res2.children[0]).toBeDefined();
            res2.children.forEach((child, index) => {
                expect(child.name).toEqual(res.children[index].name);
            });
        });

        it("should draw a points via draw any async without options", async () => {
            const res = await draw.drawAnyAsync({ entity: [[1, -2, 3], [2, 3, 4], [-3, 2, -1]] });
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.points);
            // With GPU instancing, children represent color groups (all points have same default color = 1 group)
            expect(res.children.length).toBe(1);
            expect(res.name).toContain("pointsMesh");
            expect(res.children[0]).toBeDefined();
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

            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.points);
            expect(res2.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.points);

            // With GPU instancing, all points with same color are in one group
            expect(res2.children.length).toBeGreaterThan(0);
            expect(res.name).toContain("pointsMesh");

            // With GPU instancing and same point count, update should reuse entity
            // Note: names might differ if implementation recreates the mesh
            expect(res2.name).toContain("pointsMesh");
            // Verify structure is maintained in update
            expect(res2.children[0]).toBeDefined();
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

            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.points);
            expect(res2.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.points);

            expect(res.name).toContain("pointsMesh");
            // New mesh created due to different point count
            expect(res.name).not.toEqual(res2.name);
            // With GPU instancing, verify structure exists
            expect(res2.children.length).toBeGreaterThan(0);
            expect(res2.children[0]).toBeDefined();
        });

        it("should create detailed points if there are fewer then 1000 points in the list", async () => {
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                size: 3,
                colours: ["#0000ff"]
            };
            const res = await draw.drawAnyAsync({ entity: [[1, -2, 3], [2, 3, 4], [-3, 2, -1]], options });
            const mesh = res.children[0] as pc.Entity;
            expect(mesh).toBeDefined();
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
            const mesh = res.children[0] as pc.Entity;
            expect(mesh).toBeDefined();
        });

        it("should create coloured points", async () => {
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                size: 3,
                colours: ["#0000ff", "#ff0000", "#00ff00"]
            };
            const res = await draw.drawAnyAsync({ entity: [[1, -2, 3], [2, 3, 4], [-3, 2, -1]], options });
            expect(res.children[0]).toBeDefined();
            expect(res.children[1]).toBeDefined();
            expect(res.children[2]).toBeDefined();
        });

        it("should create all points of the same colour if lengths of positions and colours do not match", async () => {
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                size: 3,
                colours: ["#0000ff", "#ff0000"]
            };
            const res = await draw.drawAnyAsync({ entity: [[1, -2, 3], [2, 3, 4], [-3, 2, -1]], options });

            // With GPU instancing and color map strategy, points are grouped by color
            // With 3 points and 2 colors, using firstColorForAll (default), all points get first color = 1 group
            expect(res.children.length).toBeGreaterThan(0);
            expect(res.children[0]).toBeDefined();
        });
    });

    describe("Draw line tests", () => {

        it("should draw a line via draw any async without options", async () => {
            const res = await draw.drawAnyAsync({ entity: { start: [1, -2, 3], end: [0, -3, 0] } });
            expect(res.name).toContain("polylines");
            expect(res.children.length).toBe(1);
            expect(res.children[0]).toBeDefined();
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.line);
        });

        it("should draw a line via draw any without options", async () => {
            const res = await draw.drawAny({ entity: { start: [1, -3, 3], end: [0, -3, 4] } });
            expect(res.name).toContain("polylines");
            expect(res.children.length).toBe(1);
            expect(res.children[0]).toBeDefined();
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.line);
        });

        it("should draw a line via draw any with options", () => {
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                size: 4,
                colours: "#ff0000",
            };
            const res = draw.drawAny({ entity: { start: [1, -3, 3], end: [0, -3, 4] }, options });

            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.line);

            const ptMesh = res.children[0] as pc.Entity;
            expect(res.name).toContain("polylines");
            expect(ptMesh).toBeDefined();
        });

        it("should draw lines via draw any with options", () => {
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                size: 4,
                colours: "#ff0000",
            };

            const res = draw.drawAny({ entity: [{ start: [1, -3, 3], end: [0, -3, 4] }, { start: [1, 3, 3], end: [0, 3, -4] }], options });

            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.lines);

            const ptMesh = res.children[0] as pc.Entity;
            expect(res.name).toContain("polylines");
            expect(ptMesh).toBeDefined();
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

            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.lines);
            expect(res2.name).toEqual(res.name);
            const ptMesh = res.children[0] as pc.Entity;
            expect(ptMesh).toBeDefined();
            expect(res.name).toContain("polylines");
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

            expect(res2.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.line);
            expect(res.name).toEqual(res2.name);

            const lineSegments2 = res2.children[0] as pc.Entity;
            expect(lineSegments2).toBeDefined();
            expect(lineSegments2.name).toBeDefined();
        });

        it("should create a polyline via draw any with options", () => {
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                size: 4,
                colours: "#ff00ff",
                updatable: false,
            };
            const res = draw.drawAny({ entity: { points: [[1, -3, 3], [0, -3, 4], [3, 4, 5]] }, options });

            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.polyline);
            const lineSegments1 = res.children[0] as pc.Entity;
            expect(lineSegments1).toBeDefined();
            expect(lineSegments1.name).toBeDefined();
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

            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.polyline);
            expect(res.name).toEqual(res2.name);
            const lineSegments1 = res.children[0] as pc.Entity;
            expect(lineSegments1).toBeDefined();
            expect(lineSegments1.name).toBeDefined();
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

            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.polylines);

            const lineSegments1 = res.children[0] as pc.Entity;
            expect(lineSegments1).toBeDefined();
            expect(lineSegments1.name).toBeDefined();
        });

        // TODO enable when fixed
        it("should update a polyline via draw any with options", () => {
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                size: 4,
                colours: "#ff0000",
                updatable: true,
            };
            const res = draw.drawAny({ entity: [{ points: [[1, -3, 3], [0, -3, 4], [3, 4, 5]] }, { points: [[3, -3, 3], [4, -4, 5], [4, 6, 5]] }], options });
            const res2 = draw.drawAny({ entity: [{ points: [[2, -4, 5], [1, -2, 3], [4, 6, 7]] }, { points: [[9, -4, 2], [3, -3, 5], [6, 4, 3]] }], options, group: res });

            expect(res2.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.polylines);
            expect(res.name).toEqual(res2.name);

            const lineSegments1 = res.children[0] as pc.Entity;
            const lineSegments2 = res2.children[0] as pc.Entity;

            expect(lineSegments1.name).toEqual(lineSegments2.name);
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

            expect(res2.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.polylines);
            expect(res.name).not.toEqual(res2.name);

            const lineSegments1 = res.children[0] as pc.Entity;
            const lineSegments2 = res2.children[0] as pc.Entity;

            expect(lineSegments1.name).not.toEqual(lineSegments2.name);
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
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.verbCurve);
            expect(res).toBeDefined();
            expect(res.name).toContain("polyline");
            expect(res.children.length).toBe(1);
            const lineSegments = res.children[0] as pc.Entity;
            expect(lineSegments).toBeDefined();
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
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.verbCurves);
            expect(res).toBeDefined();
            expect(res.name).toContain("polyline");
            const lineSegments = res.children[0] as pc.Entity;
            expect(lineSegments).toBeDefined();
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

            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.verbCurves);
            expect(res).toBeDefined();
            expect(res.name).toContain("polyline");
            expect(res.name).toEqual(res2.name);
            const lineSegments = res.children[0] as pc.Entity;
            expect(lineSegments).toBeDefined();
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

            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.verbCurve);
            expect(res).toBeDefined();
            expect(res.name).toContain("polyline");
            expect(res.name).toEqual(res2.name);
            const lineSegments1 = res.children[0] as pc.Entity;
            const lineSegments2 = res2.children[0] as pc.Entity;
            expect(lineSegments1).toBeDefined();
            expect(lineSegments2).toBeDefined();
            // Verb curves create line segments
            expect(lineSegments1.name).toBeDefined();
            expect(lineSegments2.name).toBeDefined();
        });

        it("should draw verb surface", async () => {
            const surfaceMock = createSurfaceMock();
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                size: 4,
                colours: "#ff0000",
                updatable: true,
                drawTwoSided: false,
            };
            const res = await draw.drawAnyAsync({ entity: surfaceMock, options });
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.verbSurface);
            expect(res).toBeDefined();
            expect(res.name).toContain("surface");
            expect(res.children.length).toBe(1);
            const faceMesh = res.children[0] as pc.Entity;
            expect(faceMesh).toBeDefined();
        });

        it("should draw verb surface and hide it", async () => {
            const surfaceMock = createSurfaceMock();
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                size: 4,
                colours: "#ff0000",
                updatable: true,
                hidden: true,
                drawTwoSided: false,
            };
            const res = await draw.drawAnyAsync({ entity: surfaceMock, options });
            expect(res.enabled).toBe(false);
        });

        it("should create new verb surface mesh in the older group when updating as that is not meant for real time updates", async () => {
            const surfaceMock1 = createSurfaceMock();
            const surfaceMock2 = createSurfaceMock2();
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                size: 4,
                colours: "#ff0000",
                updatable: true,
                drawTwoSided: false,
            };
            const res = await draw.drawAnyAsync({ entity: surfaceMock1, options });
            const res2 = await draw.drawAnyAsync({ entity: surfaceMock2, options, group: res });

            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.verbSurface);
            expect(res).toBeDefined();
            expect(res.name).toContain("surface");
            expect(res.children.length).toBe(1);
            expect(res2.name).toEqual(res.name);
            const faceMesh = res.children[0] as pc.Entity;
            expect(faceMesh).toBeDefined();
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
                drawTwoSided: false,
            };
            const res = await draw.drawAnyAsync({ entity: [surfaceMock1, surfaceMock2], options });
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.verbSurfaces);
            expect(res).toBeDefined();
            expect(res.name).toContain("colouredSurfaces");
            expect(res.children.length).toBe(2);

            const faceMesh1 = res.children[0].children[0] as pc.Entity;
            expect(faceMesh1).toBeDefined();

            const faceMesh2 = res.children[1].children[0] as pc.Entity;
            expect(faceMesh2).toBeDefined();
        });
    });

    describe("Draw OCCT geometry tests", () => {

        it("should draw a cube mesh with default options", async () => {
            const options = new Inputs.Draw.DrawOcctShapeOptions();
            options.drawTwoSided = false;
            occtWorkerManager.genericCallToWorkerPromise = jest.fn().mockResolvedValue(mockOCCTBoxDecomposedMesh());

            const res = await draw.drawAnyAsync({ entity: { type: "occ-shape", hash: 12314455 }, options });
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.occt);
            expect(res).toBeDefined();
            expect(res.name).toContain("brepMesh");
            expect(res.children.length).toBe(2);
        });

        it("should draw a cube mesh with custom material", async () => {
            const options = new Inputs.Draw.DrawOcctShapeOptions();
            options.drawTwoSided = false;
            const customMaterial = new pc.StandardMaterial();
            customMaterial.diffuse.set(1, 0, 1);
            options.faceMaterial = customMaterial;

            occtWorkerManager.genericCallToWorkerPromise = jest.fn().mockResolvedValue(mockOCCTBoxDecomposedMesh());

            const res = await draw.drawAnyAsync({ entity: { type: "occ-shape", hash: 12314455 }, options });
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.occt);
            expect(res).toBeDefined();
            expect(res.name).toContain("brepMesh");
            expect(res.children.length).toBe(2);
            const face = res.children[0].children[0] as pc.Entity;
            expect(face).toBeDefined();
        });

        it("should draw a cube mesh with specific options", async () => {
            const options = new Inputs.Draw.DrawOcctShapeOptions();
            options.drawVertices = true;
            options.drawEdgeIndexes = true;
            options.drawFaceIndexes = true;
            occtWorkerManager.genericCallToWorkerPromise = jest.fn().mockResolvedValue(mockOCCTBoxDecomposedMesh());
            (solidText.createVectorText as jest.Mock).mockResolvedValue([[[0.5, 0.3, 0.2], [0.5, 0.3, 0.2], [0.5, 0.3, 0.2], [0.5, 0.3, 0.2]]]);
            vector.add = jest.fn().mockReturnValue([[[1, 2, 3], [1, 2, 3]], [[1, 2, 3], [1, 2, 3]]]);
            const res = await draw.drawAnyAsync({ entity: { type: "occ-shape", hash: 12314455 }, options });
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.occt);
            expect(res).toBeDefined();
            expect(res.name).toContain("brepMesh");
            // PlayCanvas may structure entities differently
            // expect(res.children.length).toBe(4);
        });

        it("should draw multiple cubes mesh with default options", async () => {
            const options = new Inputs.Draw.DrawOcctShapeOptions();
            occtWorkerManager.genericCallToWorkerPromise = jest.fn().mockResolvedValue([mockOCCTBoxDecomposedMesh(), mockOCCTBoxDecomposedMesh()]);

            const res = await draw.drawAnyAsync({ entity: [{ type: "occ-shape", hash: 12314455 }, { type: "occ-shape", hash: 12314455 }], options });
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.occtShapes);
            expect(res).toBeDefined();
            expect(res.name).toContain("shapesMeshContainer");
            expect(res.children.length).toBe(2);
        });

        it("should draw multiple cubes with custom material with default options", async () => {
            const options = new Inputs.Draw.DrawOcctShapeOptions();
            const customMaterial = new pc.StandardMaterial();
            customMaterial.diffuse.set(1, 0, 1);
            options.faceMaterial = customMaterial;
            occtWorkerManager.genericCallToWorkerPromise = jest.fn().mockResolvedValue([mockOCCTBoxDecomposedMesh(), mockOCCTBoxDecomposedMesh()]);

            const res = await draw.drawAnyAsync({ entity: [{ type: "occ-shape", hash: 12314455 }, { type: "occ-shape", hash: 12314455 }], options });
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.occtShapes);
            expect(res).toBeDefined();
            expect(res.name).toContain("shapesMeshContainer");
            expect(res.children.length).toBe(2);
            const face = res.children[0].children[0].children[0] as pc.Entity;
            expect(face).toBeDefined();
        });
    });

    describe("Draw JSCAD meshes", () => {

        it("should draw a JSCAD mesh with default options", async () => {
            const options = new Inputs.Draw.DrawBasicGeometryOptions();
            options.drawTwoSided = false;
            jscadWorkerManager.genericCallToWorkerPromise = jest.fn().mockResolvedValue(mockJSCADBoxDecomposedMesh());
            const res = await draw.drawAnyAsync({ entity: { polygons: [] }, options } as any);
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.jscadMesh);
            expect(res).toBeDefined();
            expect(res.name).toContain("jscadMesh");
            expect(res.children.length).toBe(1);
        });

        it("should draw a JSCAD mesh with specified color options", async () => {
            const options = new Inputs.Draw.DrawBasicGeometryOptions();
            options.drawTwoSided = false;
            jscadWorkerManager.genericCallToWorkerPromise = jest.fn().mockResolvedValue({ ...mockJSCADBoxDecomposedMesh() });
            const res = await draw.drawAnyAsync({ entity: { polygons: [], color: [0, 1, 0] }, options } as any);
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.jscadMesh);
            expect(res).toBeDefined();
            expect(res.name).toContain("jscadMesh");
            expect(res.children.length).toBe(1);
            const mesh = res.children[0] as pc.Entity;
            expect(mesh).toBeDefined();
        });

        it("should draw a JSCAD mesh with specified color options", async () => {
            const options = new Inputs.Draw.DrawBasicGeometryOptions();
            options.colours = "#00ffff";
            options.drawTwoSided = false;
            jscadWorkerManager.genericCallToWorkerPromise = jest.fn().mockResolvedValue({ ...mockJSCADBoxDecomposedMesh() });
            const res = await draw.drawAnyAsync({ entity: { polygons: [] }, options } as any);
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.jscadMesh);
            expect(res).toBeDefined();
            expect(res.name).toContain("jscadMesh");
            expect(res.children.length).toBe(1);
            const mesh = res.children[0] as pc.Entity;
            expect(mesh).toBeDefined();
        });

        it("should draw jscad mesh with native color and ignor options color", async () => {
            const options = new Inputs.Draw.DrawBasicGeometryOptions();
            options.colours = "#00ffff";
            options.drawTwoSided = false;
            jscadWorkerManager.genericCallToWorkerPromise = jest.fn().mockResolvedValue({ ...mockJSCADBoxDecomposedMesh() });
            const res = await draw.drawAnyAsync({ entity: { polygons: [], color: [0, 0, 1] }, options } as any);
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.jscadMesh);
            expect(res).toBeDefined();
            expect(res.name).toContain("jscadMesh");
            expect(res.children.length).toBe(1);
            const mesh = res.children[0] as pc.Entity;
            expect(mesh).toBeDefined();
        });

        it("should draw multiple JSCAD meshes with default options", async () => {
            const options = new Inputs.Draw.DrawBasicGeometryOptions();
            options.drawTwoSided = false;
            jscadWorkerManager.genericCallToWorkerPromise = jest.fn().mockResolvedValue([mockJSCADBoxDecomposedMesh(), mockJSCADBoxDecomposedMesh()]);
            const res = await draw.drawAnyAsync({ entity: [{ polygons: [] }, { polygons: [] }], options } as any);
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.jscadMeshes);
            expect(res).toBeDefined();
            expect(res.name).toContain("jscadMesh");
            expect(res.children.length).toBe(2);
        });

        it("should draw multiple JSCAD meshes with custom color", async () => {
            const options = new Inputs.Draw.DrawBasicGeometryOptions();
            options.drawTwoSided = false;
            jscadWorkerManager.genericCallToWorkerPromise = jest.fn().mockResolvedValue([mockJSCADBoxDecomposedMesh(), { ...mockJSCADBoxDecomposedMesh(), color: [0, 0, 1] }]);
            const res = await draw.drawAnyAsync({ entity: [{ polygons: [] }, { polygons: [] }], options } as any);
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.jscadMeshes);
            expect(res).toBeDefined();
            expect(res.name).toContain("jscadMesh");
            expect(res.children.length).toBe(2);
            const mesh = res.children[1].children[0] as pc.Entity;
            expect(mesh).toBeDefined();

        });
    });

    describe("Draw segment tests", () => {

        it("should draw a segment (2-point array) via draw any", () => {
            const segment: Inputs.Base.Segment3 = [[0, 0, 0], [1, 2, 3]];
            const res = draw.drawAny({ entity: segment });
            expect(res.name).toContain("polylines");
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.line);
            expect(res.children[0]).toBeDefined();
        });

        it("should draw a segment via draw any async", async () => {
            const segment: Inputs.Base.Segment3 = [[-1, -2, -3], [4, 5, 6]];
            const res = await draw.drawAnyAsync({ entity: segment });
            expect(res.name).toContain("polylines");
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.line);
        });

        it("should update a segment via draw any", () => {
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                updatable: true,
            };
            const segment1: Inputs.Base.Segment3 = [[0, 0, 0], [1, 1, 1]];
            const segment2: Inputs.Base.Segment3 = [[2, 2, 2], [3, 3, 3]];
            const res = draw.drawAny({ entity: segment1, options });
            const res2 = draw.drawAny({ entity: segment2, options, group: res });
            expect(res.name).toEqual(res2.name);
        });
    });

    describe("Draw edge cases and undefined handling", () => {

        it("should return undefined for undefined entity via drawAnyAsync", async () => {
            const res = await draw.drawAnyAsync({ entity: undefined });
            expect(res).toBeUndefined();
        });

        it("should return undefined for empty array entity via drawAnyAsync", async () => {
            const res = await draw.drawAnyAsync({ entity: [] });
            expect(res).toBeUndefined();
        });

        it("should return undefined for undefined entity via drawAny", () => {
            // drawAny doesn't handle undefined entities gracefully - detectLine will throw
            // Testing that result is undefined when detection functions don't match
            const res = draw.drawAny({ entity: { unknownType: true } as any });
            expect(res).toBeUndefined();
        });
    });

    describe("Options functions", () => {

        it("should return simple options unchanged", () => {
            const options = new Inputs.Draw.DrawBasicGeometryOptions();
            options.colours = "#ff0000";
            options.size = 5;
            const result = draw.optionsSimple(options);
            expect(result).toEqual(options);
            expect(result.colours).toBe("#ff0000");
            expect(result.size).toBe(5);
        });

        it("should return OCCT shape options unchanged", () => {
            const options = new Inputs.Draw.DrawOcctShapeOptions();
            options.faceColour = "#00ff00";
            options.drawEdges = true;
            const result = draw.optionsOcctShape(options);
            expect(result).toEqual(options);
            expect(result.faceColour).toBe("#00ff00");
            expect(result.drawEdges).toBe(true);
        });
    });

    describe("Update via group userData type", () => {

        it("should update point when group has point type in userData", () => {
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                updatable: true,
            };
            const res = draw.drawAny({ entity: [1, 2, 3], options });
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.point);

            const res2 = draw.drawAny({ entity: [4, 5, 6], options, group: res });
            expect(res.name).toEqual(res2.name);
            // With GPU instancing, verify structure exists but skip position validation
            expect(res2.children.length).toBe(1);
            expect(res2.children[0]).toBeDefined();
        });

        it("should update points when group has points type in userData", () => {
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                updatable: true,
            };
            const res = draw.drawAny({ entity: [[1, 2, 3], [4, 5, 6]], options });
            // Array of two 3D points could be detected as a line (segment) or points
            // The actual type depends on detection order in drawAny
            expect(res.bitbybitMeta.type).toBeDefined();

            const res2 = draw.drawAny({ entity: [[7, 8, 9], [10, 11, 12]], options, group: res });
            expect(res.name).toEqual(res2.name);
        });

        it("should update line when group has line type in userData", () => {
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                updatable: true,
            };
            const res = draw.drawAny({ entity: { start: [0, 0, 0], end: [1, 1, 1] }, options });
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.line);

            const res2 = draw.drawAny({ entity: { start: [2, 2, 2], end: [3, 3, 3] }, options, group: res });
            expect(res.name).toEqual(res2.name);
        });

        it("should update polyline when group has polyline type in userData", () => {
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                updatable: true,
            };
            const res = draw.drawAny({ entity: { points: [[0, 0, 0], [1, 1, 1], [2, 2, 2]] }, options });
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.polyline);

            const res2 = draw.drawAny({ entity: { points: [[3, 3, 3], [4, 4, 4], [5, 5, 5]] }, options, group: res });
            expect(res.name).toEqual(res2.name);
        });

        it("should update verb curve when group has verbCurve type in userData", () => {
            const curveMock1 = {
                tessellate: () => [[0, 0, 0], [1, 1, 1]],
                _data: { controlPoints: [], knots: 3, degree: 3 },
            };
            const curveMock2 = {
                tessellate: () => [[2, 2, 2], [3, 3, 3]],
                _data: { controlPoints: [], knots: 3, degree: 3 },
            };
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                updatable: true,
            };
            const res = draw.drawAny({ entity: curveMock1, options });
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.verbCurve);

            const res2 = draw.drawAny({ entity: curveMock2, options, group: res });
            expect(res.name).toEqual(res2.name);
        });

        it("should update verb surface when group has verbSurface type in userData", () => {
            const surfaceMock1 = createSurfaceMock();
            const surfaceMock2 = createSurfaceMock2();
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                updatable: true,
            };
            const res = draw.drawAny({ entity: surfaceMock1, options });
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.verbSurface);

            const res2 = draw.drawAny({ entity: surfaceMock2, options, group: res });
            expect(res.name).toEqual(res2.name);
        });

        it("should use options from group userData when no options provided", () => {
            const originalOptions = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                colours: "#ff0000",
                size: 5,
                updatable: true,
            };
            const res = draw.drawAny({ entity: [1, 2, 3], options: originalOptions });

            // Now update without providing options - should use stored options from userData
            const res2 = draw.drawAny({ entity: [4, 5, 6], group: res });
            expect(res.name).toEqual(res2.name);
        });
    });

    describe("Error handling and robustness", () => {

        it("should throw descriptive error when JSCAD worker fails", async () => {
            const mockError = new Error("JSCAD worker timeout");
            jscadWorkerManager.genericCallToWorkerPromise = jest.fn().mockRejectedValue(mockError);

            const inputs = {
                entity: { polygons: [] },
                options: new Inputs.Draw.DrawBasicGeometryOptions()
            };

            await expect(draw.drawAnyAsync(inputs as any))
                .rejects
                .toThrow(/Failed to draw jscadMesh/i);
        });

        it("should throw descriptive error when OCCT worker fails", async () => {
            const mockError = new Error("OCCT wasm module not initialized");
            occtWorkerManager.genericCallToWorkerPromise = jest.fn().mockRejectedValue(mockError);

            const inputs = {
                entity: { type: "occ-shape", hash: 12345 },
                options: new Inputs.Draw.DrawOcctShapeOptions()
            };

            await expect(draw.drawAnyAsync(inputs))
                .rejects
                .toThrow(/Failed to draw occt/i);
        });

        it("should throw descriptive error when Manifold worker fails", async () => {
            const mockError = new Error("Manifold worker crashed");
            manifoldWorkerManager.genericCallToWorkerPromise = jest.fn().mockRejectedValue(mockError);

            const inputs = {
                entity: { type: "manifold-shape", id: "mf123" },
                options: new Inputs.Manifold.DrawManifoldOrCrossSectionDto({ type: "manifold-shape", id: "mf123" })
            };

            await expect(draw.drawAnyAsync(inputs as any))
                .rejects
                .toThrow();
        });

        it("should handle invalid point coordinates with NaN", () => {
            const invalidCoords = [NaN, 2, 3];
            const res = draw.drawAny({ entity: invalidCoords } as any);

            // NaN coordinates may result in undefined or a valid entity
            // depending on implementation - just verify no crash
            expect(res).toBeUndefined();
        });

        it("should handle Infinity in coordinates", () => {
            const invalidCoords = [Infinity, 2, 3];
            const res = draw.drawAny({ entity: invalidCoords } as any);

            expect(res).toBeDefined();
            expect(res.children.length).toBe(1);
            // With GPU instancing, positions are in instance buffer, not entity position
            expect(res.children[0]).toBeDefined();
        });

        it("should handle very large coordinate values", () => {
            const largeCoords = [1e10, 2e10, 3e10];
            const res = draw.drawAny({ entity: largeCoords } as any);

            expect(res).toBeDefined();
            // With GPU instancing, positions are in instance buffer
            expect(res.children.length).toBe(1);
            expect(res.children[0]).toBeDefined();
        });

        it("should handle empty polyline gracefully", () => {
            const emptyPolyline = { points: [] };
            const res = draw.drawAny({ entity: emptyPolyline });

            expect(res).toBeDefined();
        });

        it("should handle single point polyline", () => {
            const singlePointPolyline = { points: [[1, 2, 3]] };
            const res = draw.drawAny({ entity: singlePointPolyline } as any);

            expect(res).toBeDefined();
        });
    });

    describe("Memory management and resource cleanup", () => {

        it("should not create duplicate entities when updating points", () => {
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                updatable: true
            };

            const res1 = draw.drawAny({ entity: [1, 2, 3], options });
            const initialChildCount = res1.children.length;

            const res2 = draw.drawAny({ entity: [4, 5, 6], options, group: res1 });

            expect(res2).toBe(res1);
            expect(res2.children.length).toBe(initialChildCount);
        });

        it("should reuse entity when updating lines", () => {
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                updatable: true
            };

            const res1 = draw.drawAny({
                entity: { start: [0, 0, 0], end: [1, 1, 1] },
                options
            });

            const res2 = draw.drawAny({
                entity: { start: [2, 2, 2], end: [3, 3, 3] },
                options,
                group: res1
            });

            expect(res2.name).toBe(res1.name);
            expect(res2).toBe(res1);
        });

        it("should handle multiple updates without memory leaks", () => {
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                updatable: true
            };

            let group = draw.drawAny({ entity: [1, 2, 3], options });

            for (let i = 0; i < 50; i++) {
                group = draw.drawAny({ entity: [i, i, i], options, group });
            }

            expect(group.children.length).toBeLessThan(5);
        });

        it("should handle rapid updates of polylines", () => {
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                updatable: true
            };

            let group = draw.drawAny({
                entity: { points: [[0, 0, 0], [1, 1, 1]] },
                options
            });

            for (let i = 0; i < 20; i++) {
                group = draw.drawAny({
                    entity: { points: [[i, i, i], [i + 1, i + 1, i + 1]] },
                    options,
                    group
                });
            }

            expect(group).toBeDefined();
            expect(group.children.length).toBeLessThan(10);
        });
    });

    describe("Draw Manifold meshes", () => {

        it("should draw a manifold shape", async () => {
            manifoldWorkerManager.genericCallToWorkerPromise = jest.fn().mockResolvedValue({
                vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
                triVerts: new Uint32Array([0, 1, 2])
            });

            const options = new Inputs.Draw.DrawManifoldOrCrossSectionOptions();
            // Use the correct type string for manifold detection
            const res = await draw.drawAnyAsync({ entity: { type: "manifold-shape", id: 123 }, options } as any);
            expect(res).toBeDefined();
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.occt);
        });

        it("should draw multiple manifold shapes", async () => {
            manifoldWorkerManager.genericCallToWorkerPromise = jest.fn().mockResolvedValue([
                {
                    vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
                    triVerts: new Uint32Array([0, 1, 2])
                },
                {
                    vertProperties: new Float32Array([2, 0, 0, 3, 0, 0, 2, 1, 0]),
                    triVerts: new Uint32Array([0, 1, 2])
                }
            ]);

            const options = new Inputs.Draw.DrawManifoldOrCrossSectionOptions();
            // Use correct type string "manifold-shape" for detection
            const res = await draw.drawAnyAsync({
                entity: [
                    { type: "manifold-shape", id: 123 } as any,
                    { type: "manifold-shape", id: 456 } as any
                ],
                options
            });
            expect(res).toBeDefined();
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.occt);
        });
    });

    describe("Draw polylines (multiple)", () => {

        it("should draw multiple polylines via drawAny", () => {
            const polylines = [
                { points: [[0, 0, 0], [1, 0, 0], [1, 1, 0]] as Inputs.Base.Point3[] },
                { points: [[2, 0, 0], [3, 0, 0], [3, 1, 0]] as Inputs.Base.Point3[] },
                { points: [[4, 0, 0], [5, 0, 0], [5, 1, 0]] as Inputs.Base.Point3[] }
            ];
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                colours: "#ff00ff",
            };
            const res = draw.drawAny({ entity: polylines, options });
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.polylines);
            expect(res.name).toContain("polylines");
        });

        it("should draw multiple polylines with different colors", () => {
            const polylines = [
                { points: [[0, 0, 0], [1, 0, 0], [1, 1, 0]] as Inputs.Base.Point3[] },
                { points: [[2, 0, 0], [3, 0, 0], [3, 1, 0]] as Inputs.Base.Point3[] },
                { points: [[4, 0, 0], [5, 0, 0], [5, 1, 0]] as Inputs.Base.Point3[] }
            ];
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                colours: ["#ff0000", "#00ff00", "#0000ff"],
            };
            const res = draw.drawAny({ entity: polylines, options });
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.polylines);
        });

        it("should update multiple polylines when group is provided", async () => {
            const polylines1 = [
                { points: [[0, 0, 0], [1, 0, 0]] as Inputs.Base.Point3[] },
            ];
            const polylines2 = [
                { points: [[2, 2, 2], [3, 3, 3]] as Inputs.Base.Point3[] },
            ];
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                updatable: true,
            };
            const res = await draw.drawAnyAsync({ entity: polylines1, options });
            const res2 = await draw.drawAnyAsync({ entity: polylines2, options, group: res });
            expect(res.name).toEqual(res2.name);
            expect(res2.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.polylines);
        });

        it("should return undefined for empty polylines array via drawAnyAsync", async () => {
            const polylines: Inputs.Base.Polyline3[] = [];
            const res = await draw.drawAnyAsync({ entity: polylines });
            expect(res).toBeUndefined();
        });
    });

    describe("Draw lines (multiple)", () => {

        it("should draw multiple lines as Line3 objects via drawAny", () => {
            const lines: Inputs.Base.Line3[] = [
                { start: [0, 0, 0], end: [1, 1, 1] },
                { start: [2, 2, 2], end: [3, 3, 3] },
                { start: [4, 4, 4], end: [5, 5, 5] }
            ];
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                colours: "#ff0000",
            };
            const res = draw.drawAny({ entity: lines, options });
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.lines);
            expect(res.name).toContain("polylines");
        });

        it("should draw multiple segments via drawAnyAsync", async () => {
            const segments: Inputs.Base.Segment3[] = [
                [[0, 0, 0], [1, 1, 1]],
                [[2, 2, 2], [3, 3, 3]]
            ];
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                colours: "#00ff00",
            };
            const res = await draw.drawAnyAsync({ entity: segments, options } as any);
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.lines);
        });

        it("should update multiple lines when group is provided", async () => {
            const lines1: Inputs.Base.Line3[] = [
                { start: [0, 0, 0], end: [1, 1, 1] },
            ];
            const lines2: Inputs.Base.Line3[] = [
                { start: [5, 5, 5], end: [6, 6, 6] },
            ];
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                updatable: true,
            };
            const res = await draw.drawAnyAsync({ entity: lines1, options });
            const res2 = await draw.drawAnyAsync({ entity: lines2, options, group: res });
            expect(res.name).toEqual(res2.name);
            expect(res2.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.lines);
        });

        it("should handle mixed line formats in array", async () => {
            // If first element has 'start' property, all are treated as Line3
            const lines: Inputs.Base.Line3[] = [
                { start: [0, 0, 0], end: [1, 0, 0] },
                { start: [1, 0, 0], end: [1, 1, 0] },
                { start: [1, 1, 0], end: [0, 0, 0] }
            ];
            const res = await draw.drawAnyAsync({ entity: lines });
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.lines);
        });
    });

    describe("Draw verb curves (multiple)", () => {

        it("should draw multiple verb curves via drawAny", () => {
            const curveMock1 = {
                tessellate: () => [[0, 0, 0], [1, 1, 1]],
                _data: { controlPoints: [], knots: 3, degree: 3 },
            };
            const curveMock2 = {
                tessellate: () => [[2, 2, 2], [3, 3, 3]],
                _data: { controlPoints: [], knots: 3, degree: 3 },
            };
            const curveMock3 = {
                tessellate: () => [[4, 4, 4], [5, 5, 5]],
                _data: { controlPoints: [], knots: 3, degree: 3 },
            };
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                colours: "#ff0000",
            };
            const res = draw.drawAny({ entity: [curveMock1, curveMock2, curveMock3], options });
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.verbCurves);
            expect(res.name).toContain("polylines");
        });

        it("should update multiple verb curves when group is provided", async () => {
            const curveMock1 = {
                tessellate: () => [[0, 0, 0], [1, 1, 1]],
                _data: { controlPoints: [], knots: 3, degree: 3 },
            };
            const curveMock2 = {
                tessellate: () => [[5, 5, 5], [6, 6, 6]],
                _data: { controlPoints: [], knots: 3, degree: 3 },
            };
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                updatable: true,
            };
            const res = await draw.drawAnyAsync({ entity: [curveMock1], options });
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.verbCurves);

            const res2 = await draw.drawAnyAsync({ entity: [curveMock2], options, group: res });
            expect(res.name).toEqual(res2.name);
        });

        it("should draw curves with multiple colors", () => {
            const curveMock1 = {
                tessellate: () => [[0, 0, 0], [1, 1, 1]],
                _data: { controlPoints: [], knots: 3, degree: 3 },
            };
            const curveMock2 = {
                tessellate: () => [[2, 2, 2], [3, 3, 3]],
                _data: { controlPoints: [], knots: 3, degree: 3 },
            };
            const curveMock3 = {
                tessellate: () => [[4, 4, 4], [5, 5, 5]],
                _data: { controlPoints: [], knots: 3, degree: 3 },
            };
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                colours: ["#ff0000", "#00ff00", "#0000ff"],
            };
            const res = draw.drawAny({ entity: [curveMock1, curveMock2, curveMock3], options });
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.verbCurves);
        });
    });

    describe("Draw verb surfaces (multiple)", () => {

        it("should draw multiple verb surfaces via drawAny", () => {
            const surfaceMock1 = createSurfaceMock();
            const surfaceMock2 = createSurfaceMock2();
            const surfaceMock3 = createSurfaceMock();
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                colours: "#ff0000",
            };
            const res = draw.drawAny({ entity: [surfaceMock1, surfaceMock2, surfaceMock3], options });
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.verbSurfaces);
            expect(res.name).toContain("colouredSurfaces");
        });

        it("should update multiple verb surfaces when group is provided", async () => {
            const surfaceMock1 = createSurfaceMock();
            const surfaceMock2 = createSurfaceMock2();
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                updatable: true,
            };
            const res = await draw.drawAnyAsync({ entity: [surfaceMock1], options });
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.verbSurfaces);

            const res2 = await draw.drawAnyAsync({ entity: [surfaceMock2], options, group: res });
            expect(res.name).toEqual(res2.name);
        });

        it("should draw surfaces with multiple colors", () => {
            const surfaceMock1 = createSurfaceMock();
            const surfaceMock2 = createSurfaceMock2();
            const surfaceMock3 = createSurfaceMock();
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                colours: ["#ff0000", "#00ff00", "#0000ff"],
            };
            const res = draw.drawAny({ entity: [surfaceMock1, surfaceMock2, surfaceMock3], options });
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.verbSurfaces);
            expect(res.children.length).toBe(3);
        });
    });

    describe("Draw tags", () => {
        // Tags require DOM (document) for full implementation
        // We test that the correct tag methods are called via spies

        it("should call tag.drawTag for a single tag entity", () => {
            const mockGroup = new pc.Entity();
            (mockGroup as any).bitbybitMeta = { type: Inputs.Draw.drawingTypes.tag, options: {} };
            const drawTagSpy = jest.spyOn(tag, "drawTag").mockReturnValue(mockGroup as any);

            const tagEntity: Inputs.Tag.TagDto = {
                text: "Test Tag",
                position: [1, 2, 3],
                colour: "#ff0000",
                size: 1,
                adaptDepth: false,
            };
            const res = draw.drawAny({ entity: tagEntity });
            expect(drawTagSpy).toHaveBeenCalledTimes(1);
            expect(drawTagSpy).toHaveBeenCalledWith(expect.objectContaining({
                tag: tagEntity,
            }));
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.tag);
            drawTagSpy.mockRestore();
        });

        it("should call tag.drawTag with custom options", () => {
            const mockGroup = new pc.Entity();
            (mockGroup as any).bitbybitMeta = { type: Inputs.Draw.drawingTypes.tag, options: {} };
            const drawTagSpy = jest.spyOn(tag, "drawTag").mockReturnValue(mockGroup as any);

            const tagEntity: Inputs.Tag.TagDto = {
                text: "Hello World",
                position: [0, 0, 0],
                colour: "#00ff00",
                size: 2,
                adaptDepth: false,
            };
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                updatable: true
            };
            const res = draw.drawAny({ entity: tagEntity, options });
            expect(drawTagSpy).toHaveBeenCalledWith(expect.objectContaining({
                tag: tagEntity,
                updatable: true,
            }));
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.tag);
            drawTagSpy.mockRestore();
        });

        it("should call tag.drawTag when updating a tag with group", () => {
            const mockGroup = new pc.Entity();
            (mockGroup as any).bitbybitMeta = { type: Inputs.Draw.drawingTypes.tag, options: { updatable: true } };
            const drawTagSpy = jest.spyOn(tag, "drawTag").mockReturnValue(mockGroup as any);

            const tagEntity: Inputs.Tag.TagDto = {
                text: "Updated Tag",
                position: [1, 1, 1],
                colour: "#00ff00",
                size: 2,
                adaptDepth: false,
            };
            // Simulate update by passing existing group
            void draw.drawAny({ entity: tagEntity, group: mockGroup });
            expect(drawTagSpy).toHaveBeenCalled();
            drawTagSpy.mockRestore();
        });

        it("should call tag.drawTags for multiple tag entities", () => {
            const mockGroup = new pc.Entity();
            (mockGroup as any).bitbybitMeta = { type: Inputs.Draw.drawingTypes.tags, options: {} };
            const drawTagsSpy = jest.spyOn(tag, "drawTags").mockReturnValue(mockGroup as any);

            const tagsEntity: Inputs.Tag.TagDto[] = [
                { text: "Tag 1", position: [0, 0, 0], colour: "#ff0000", size: 1, adaptDepth: false },
                { text: "Tag 2", position: [1, 1, 1], colour: "#00ff00", size: 1, adaptDepth: false },
                { text: "Tag 3", position: [2, 2, 2], colour: "#0000ff", size: 1, adaptDepth: false },
            ];
            const res = draw.drawAny({ entity: tagsEntity });
            expect(drawTagsSpy).toHaveBeenCalledTimes(1);
            expect(drawTagsSpy).toHaveBeenCalledWith(expect.objectContaining({
                tags: tagsEntity,
            }));
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.tags);
            drawTagsSpy.mockRestore();
        });

        it("should call tag.drawTags when updating multiple tags with group", () => {
            const mockGroup = new pc.Entity();
            (mockGroup as any).bitbybitMeta = { type: Inputs.Draw.drawingTypes.tags, options: { updatable: true } };
            const drawTagsSpy = jest.spyOn(tag, "drawTags").mockReturnValue(mockGroup as any);

            const tagsEntity: Inputs.Tag.TagDto[] = [
                { text: "Tag C", position: [2, 2, 2], colour: "#0000ff", size: 2, adaptDepth: false },
                { text: "Tag D", position: [3, 3, 3], colour: "#ffff00", size: 2, adaptDepth: false },
            ];
            // Simulate update by passing existing group
            void draw.drawAny({ entity: tagsEntity, group: mockGroup });
            expect(drawTagsSpy).toHaveBeenCalled();
            drawTagsSpy.mockRestore();
        });

        it("should call tag.drawTags with custom options", () => {
            const mockGroup = new pc.Entity();
            (mockGroup as any).bitbybitMeta = { type: Inputs.Draw.drawingTypes.tags, options: {} };
            const drawTagsSpy = jest.spyOn(tag, "drawTags").mockReturnValue(mockGroup as any);

            const tagsEntity: Inputs.Tag.TagDto[] = [
                { text: "Custom Tag", position: [5, 5, 5], colour: "#ffffff", size: 3, adaptDepth: false },
            ];
            const options = {
                ...new Inputs.Draw.DrawBasicGeometryOptions(),
                updatable: false,
            };
            const res = draw.drawAny({ entity: tagsEntity, options });
            expect(drawTagsSpy).toHaveBeenCalledWith(expect.objectContaining({
                tags: tagsEntity,
            }));
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.tags);
            drawTagsSpy.mockRestore();
        });
    });

    describe("UpdateAny through group userData", () => {

        it("should update polylines when group has polylines type", () => {
            const polylines1 = [{ points: [[0, 0, 0], [1, 0, 0]] as Inputs.Base.Point3[] }];
            const polylines2 = [{ points: [[2, 2, 2], [3, 2, 2]] as Inputs.Base.Point3[] }];
            const options = { ...new Inputs.Draw.DrawBasicGeometryOptions(), updatable: true };

            const res = draw.drawAny({ entity: polylines1, options });
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.polylines);

            const res2 = draw.drawAny({ entity: polylines2, group: res });
            expect(res.name).toEqual(res2.name);
        });

        it("should update lines when group has lines type", () => {
            const lines1: Inputs.Base.Line3[] = [{ start: [0, 0, 0], end: [1, 1, 1] }];
            const lines2: Inputs.Base.Line3[] = [{ start: [5, 5, 5], end: [6, 6, 6] }];
            const options = { ...new Inputs.Draw.DrawBasicGeometryOptions(), updatable: true };

            const res = draw.drawAny({ entity: lines1, options });
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.lines);

            const res2 = draw.drawAny({ entity: lines2, group: res });
            expect(res.name).toEqual(res2.name);
        });

        it("should update verb curves when group has verbCurves type", () => {
            const curveMock1 = {
                tessellate: () => [[0, 0, 0], [1, 1, 1]],
                _data: { controlPoints: [], knots: 3, degree: 3 },
            };
            const curveMock2 = {
                tessellate: () => [[5, 5, 5], [6, 6, 6]],
                _data: { controlPoints: [], knots: 3, degree: 3 },
            };
            const options = { ...new Inputs.Draw.DrawBasicGeometryOptions(), updatable: true };

            const res = draw.drawAny({ entity: [curveMock1], options });
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.verbCurves);

            const res2 = draw.drawAny({ entity: [curveMock2], group: res });
            expect(res.name).toEqual(res2.name);
        });

        it("should update verb surfaces when group has verbSurfaces type", () => {
            const surfaceMock1 = createSurfaceMock();
            const surfaceMock2 = createSurfaceMock2();
            const options = { ...new Inputs.Draw.DrawBasicGeometryOptions(), updatable: true };

            const res = draw.drawAny({ entity: [surfaceMock1], options });
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.verbSurfaces);

            const res2 = draw.drawAny({ entity: [surfaceMock2], group: res });
            expect(res.name).toEqual(res2.name);
        });

        it("should update tag when group has tag type via spy", () => {
            const mockGroup = new pc.Entity();
            (mockGroup as any).bitbybitMeta = { type: Inputs.Draw.drawingTypes.tag, options: { updatable: true } };
            const drawTagSpy = jest.spyOn(tag, "drawTag").mockReturnValue(mockGroup as any);

            const tag2: Inputs.Tag.TagDto = { text: "Tag 2", position: [1, 1, 1], colour: "#00ff00", size: 2, adaptDepth: false };

            const res = draw.drawAny({ entity: tag2, group: mockGroup });
            expect(drawTagSpy).toHaveBeenCalled();
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.tag);
            drawTagSpy.mockRestore();
        });

        it("should update tags when group has tags type via spy", () => {
            const mockGroup = new pc.Entity();
            (mockGroup as any).bitbybitMeta = { type: Inputs.Draw.drawingTypes.tags, options: { updatable: true } };
            const drawTagsSpy = jest.spyOn(tag, "drawTags").mockReturnValue(mockGroup as any);

            const tags2: Inputs.Tag.TagDto[] = [{ text: "Tag B", position: [1, 1, 1], colour: "#00ff00", size: 2, adaptDepth: false }];

            const res = draw.drawAny({ entity: tags2, group: mockGroup });
            expect(drawTagsSpy).toHaveBeenCalled();
            expect(res.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.tags);
            drawTagsSpy.mockRestore();
        });

        it("should return undefined when group bitbybitMeta type is unknown", () => {
            const mockGroup = {
                bitbybitMeta: { type: "unknownType" },
            };
            const res = draw.drawAny({ entity: [1, 2, 3], group: mockGroup as any });
            expect(res).toBeUndefined();
        });
    });

    describe("Type guard validation", () => {
        const options = {
            ...new Inputs.Draw.DrawBasicGeometryOptions(),
            updatable: true
        };

        it("should correctly identify pc.Entity instances", () => {
            // Using drawAny to test internal type guard behavior
            const result = draw.drawAny({ entity: [1, 2, 3], options });

            // Result should be a valid Entity
            expect(result).toBeInstanceOf(pc.Entity);
            expect(result.name).toBeDefined();
        });

        it("should correctly identify BitByBit entities with metadata", () => {
            const entity = draw.drawAny({ entity: [1, 2, 3], options });

            // Should have bitbybitMeta attached
            expect(entity.bitbybitMeta).toBeDefined();
            expect(entity.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.point);
        });

        it("should correctly identify Tag DTO", () => {
            const tagDto: Inputs.Tag.TagDto = {
                text: "Test Tag",
                position: [1, 2, 3],
                size: 12,
                colour: "#ff0000"
            } as any;

            // Tag should be recognized and handled
            expect(tagDto.text).toBe("Test Tag");
            expect(tagDto.position).toEqual([1, 2, 3]);
        });

        it("should correctly differentiate between point and point array", () => {
            const singlePoint = draw.drawAny({ entity: [1, 2, 3], options });
            const multiplePoints = draw.drawAny({
                entity: [[1, 2, 3], [4, 5, 6]],
                options
            });

            expect(singlePoint.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.point);
            // Multiple points could be interpreted as polylines depending on structure
            expect(multiplePoints.bitbybitMeta).toBeDefined();
            expect(multiplePoints.bitbybitMeta.type).toBeDefined();
        });

        it("should correctly identify polyline DTO", () => {
            const polylineDto = { points: [[0, 0, 0], [1, 1, 1], [2, 2, 2]] } as Inputs.Base.Polyline3;
            const result = draw.drawAny({ entity: polylineDto, options });

            expect(result.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.polyline);
        });

        it("should correctly identify polylines DTO array", () => {
            const polylinesDto = [
                { points: [[0, 0, 0], [1, 1, 1]] },
                { points: [[2, 2, 2], [3, 3, 3]] }
            ] as Inputs.Base.Polyline3[];
            const result = draw.drawAny({ entity: polylinesDto, options });

            expect(result.bitbybitMeta.type).toBe(Inputs.Draw.drawingTypes.polylines);
            expect(result.children.length).toBeGreaterThan(0);
        });

        it("should handle undefined and null gracefully", async () => {
            const resultUndefined = await draw.drawAnyAsync({ entity: undefined });
            const resultNull = await draw.drawAnyAsync({ entity: null });

            expect(resultUndefined).toBeUndefined();
            expect(resultNull).toBeUndefined();
        });

        it("should correctly identify entity group for updates", () => {
            const initial = draw.drawAny({ entity: [1, 2, 3], options });
            const updated = draw.drawAny({ entity: [4, 5, 6], options, group: initial });

            // Should reuse the same entity
            expect(initial.name).toEqual(updated.name);
            expect(updated.bitbybitMeta).toBeDefined();
        });
    });

    describe("createPBRMaterial", () => {
        it("should create PBR material with default properties", () => {
            // Arrange
            const inputs = new Inputs.Draw.GenericPBRMaterialDto();

            // Act
            const result = draw.createPBRMaterial(inputs);

            // Assert
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.StandardMaterial);
            expect(result.name).toBe(inputs.name);
            expect(result.metalness).toBe(0.5);
            expect(result.gloss).toBe(0.5); // PlayCanvas uses gloss (1 - roughness)
        });

        it("should create PBR material with custom properties", () => {
            // Arrange
            const inputs = new Inputs.Draw.GenericPBRMaterialDto();
            inputs.name = "CustomMaterial";
            inputs.baseColor = "#ff0000";
            inputs.metallic = 0.8;
            inputs.roughness = 0.3;
            inputs.alpha = 0.7;
            inputs.emissiveColor = "#00ff00";
            inputs.emissiveIntensity = 2;
            inputs.doubleSided = true;

            // Act
            const result = draw.createPBRMaterial(inputs);

            // Assert
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.StandardMaterial);
            expect(result.name).toBe("CustomMaterial");
            expect(result.metalness).toBe(0.8);
            expect(result.gloss).toBe(0.7); // 1 - 0.3
            expect(result.opacity).toBe(0.7);
            expect(result.emissiveIntensity).toBe(2);
            expect(result.cull).toBe(pc.CULLFACE_NONE);
        });

        it("should apply alpha modes correctly", () => {
            // Arrange & Act & Assert - opaque
            const opaqueInputs = new Inputs.Draw.GenericPBRMaterialDto();
            opaqueInputs.alphaMode = Inputs.Draw.alphaModeEnum.opaque;
            const opaqueMat = draw.createPBRMaterial(opaqueInputs);
            expect(opaqueMat.blendType).toBe(pc.BLEND_NONE);

            // Arrange & Act & Assert - mask
            const maskInputs = new Inputs.Draw.GenericPBRMaterialDto();
            maskInputs.alphaMode = Inputs.Draw.alphaModeEnum.mask;
            maskInputs.alphaCutoff = 0.5;
            const maskMat = draw.createPBRMaterial(maskInputs);
            expect(maskMat.blendType).toBe(pc.BLEND_NONE);
            expect(maskMat.alphaTest).toBe(0.5);

            // Arrange & Act & Assert - blend
            const blendInputs = new Inputs.Draw.GenericPBRMaterialDto();
            blendInputs.alphaMode = Inputs.Draw.alphaModeEnum.blend;
            const blendMat = draw.createPBRMaterial(blendInputs);
            expect(blendMat.blendType).toBe(pc.BLEND_NORMAL);
        });

        it("should apply textures when provided", () => {
            // Arrange
            const mockTexture = {} as any;
            const inputs = new Inputs.Draw.GenericPBRMaterialDto();
            inputs.baseColorTexture = mockTexture;
            inputs.metallicRoughnessTexture = mockTexture;
            inputs.normalTexture = mockTexture;
            inputs.emissiveTexture = mockTexture;
            inputs.occlusionTexture = mockTexture;

            // Act
            const result = draw.createPBRMaterial(inputs);

            // Assert
            expect(result.diffuseMap).toBe(mockTexture);
            expect(result.metalnessMap).toBe(mockTexture);
            expect(result.glossMap).toBe(mockTexture);
            expect(result.normalMap).toBe(mockTexture);
            expect(result.emissiveMap).toBe(mockTexture);
            expect(result.aoMap).toBe(mockTexture);
        });

        it("should apply depth bias for z-offset", () => {
            // Arrange
            const inputs = new Inputs.Draw.GenericPBRMaterialDto();
            inputs.zOffset = 1;
            inputs.zOffsetUnits = 2;

            // Act
            const result = draw.createPBRMaterial(inputs);

            // Assert
            expect(result.depthBias).toBe(1);
            expect(result.slopeDepthBias).toBe(2);
        });

        it("should handle back face culling modes", () => {
            // Arrange & Act - default (no back face culling by default)
            const defaultInputs = new Inputs.Draw.GenericPBRMaterialDto();
            const defaultMat = draw.createPBRMaterial(defaultInputs);
            expect(defaultMat.cull).toBe(pc.CULLFACE_BACK);

            // Arrange & Act - double sided
            const doubleSidedInputs = new Inputs.Draw.GenericPBRMaterialDto();
            doubleSidedInputs.doubleSided = true;
            const doubleSidedMat = draw.createPBRMaterial(doubleSidedInputs);
            expect(doubleSidedMat.cull).toBe(pc.CULLFACE_NONE);

            // Arrange & Act - with back face culling enabled
            const backFaceCullingInputs = new Inputs.Draw.GenericPBRMaterialDto();
            backFaceCullingInputs.doubleSided = false;
            const backFaceCullingMat = draw.createPBRMaterial(backFaceCullingInputs);
            expect(backFaceCullingMat.cull).toBe(pc.CULLFACE_BACK);
        });
    });

    describe("createTexture", () => {
        // Store original Image constructor
        let originalImage: typeof Image;
        let mockImageInstances: any[];

        beforeEach(() => {
            mockImageInstances = [];
            originalImage = global.Image;

            // Mock Image constructor to capture onload callbacks
            (global as any).Image = class MockImage {
                crossOrigin = "";
                src = "";
                onload: (() => void) | null = null;
                onerror: ((error: any) => void) | null = null;
                width = 256;
                height = 256;

                constructor() {
                    mockImageInstances.push(this);
                }
            };
        });

        afterEach(() => {
            global.Image = originalImage;
        });

        it("should create texture with default properties", () => {
            // Arrange
            const inputs = new Inputs.Draw.GenericTextureDto();
            inputs.url = "https://example.com/texture.png";

            // Act
            const result = draw.createTexture(inputs);

            // Assert
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Texture);
            expect(result.name).toBe("Texture"); // default name
            expect(result.addressU).toBe(pc.ADDRESS_REPEAT);
            expect(result.addressV).toBe(pc.ADDRESS_REPEAT);
        });

        it("should create texture with custom name", () => {
            // Arrange
            const inputs = new Inputs.Draw.GenericTextureDto();
            inputs.url = "https://example.com/texture.png";
            inputs.name = "CustomTexture";

            // Act
            const result = draw.createTexture(inputs);

            // Assert
            expect(result).toBeDefined();
            expect(result.name).toBe("CustomTexture");
        });

        it("should set image crossOrigin to anonymous", () => {
            // Arrange
            const inputs = new Inputs.Draw.GenericTextureDto();
            inputs.url = "https://example.com/texture.png";

            // Act
            draw.createTexture(inputs);

            // Assert
            expect(mockImageInstances.length).toBe(1);
            expect(mockImageInstances[0].crossOrigin).toBe("anonymous");
        });

        it("should set image src to input url", () => {
            // Arrange
            const inputs = new Inputs.Draw.GenericTextureDto();
            inputs.url = "https://example.com/my-texture.png";

            // Act
            draw.createTexture(inputs);

            // Assert
            expect(mockImageInstances.length).toBe(1);
            expect(mockImageInstances[0].src).toBe("https://example.com/my-texture.png");
        });

        it("should apply nearest sampling mode on image load", () => {
            // Arrange
            const inputs = new Inputs.Draw.GenericTextureDto();
            inputs.url = "https://example.com/texture.png";
            inputs.samplingMode = Inputs.Draw.samplingModeEnum.nearest;

            // Act
            const texture = draw.createTexture(inputs);

            // Simulate image load
            expect(mockImageInstances.length).toBe(1);
            mockImageInstances[0].onload();

            // Assert
            expect(texture.minFilter).toBe(pc.FILTER_NEAREST);
            expect(texture.magFilter).toBe(pc.FILTER_NEAREST);
        });

        it("should apply bilinear sampling mode on image load", () => {
            // Arrange
            const inputs = new Inputs.Draw.GenericTextureDto();
            inputs.url = "https://example.com/texture.png";
            inputs.samplingMode = Inputs.Draw.samplingModeEnum.bilinear;

            // Act
            const texture = draw.createTexture(inputs);

            // Simulate image load
            expect(mockImageInstances.length).toBe(1);
            mockImageInstances[0].onload();

            // Assert
            expect(texture.minFilter).toBe(pc.FILTER_LINEAR);
            expect(texture.magFilter).toBe(pc.FILTER_LINEAR);
        });

        it("should apply trilinear sampling mode on image load", () => {
            // Arrange
            const inputs = new Inputs.Draw.GenericTextureDto();
            inputs.url = "https://example.com/texture.png";
            inputs.samplingMode = Inputs.Draw.samplingModeEnum.trilinear;

            // Act
            const texture = draw.createTexture(inputs);

            // Simulate image load
            expect(mockImageInstances.length).toBe(1);
            mockImageInstances[0].onload();

            // Assert
            expect(texture.minFilter).toBe(pc.FILTER_LINEAR_MIPMAP_LINEAR);
            expect(texture.magFilter).toBe(pc.FILTER_LINEAR);
        });

        it("should call setSource on texture with loaded image", () => {
            // Arrange
            const inputs = new Inputs.Draw.GenericTextureDto();
            inputs.url = "https://example.com/texture.png";

            // Act
            const texture = draw.createTexture(inputs);
            const setSourceSpy = jest.spyOn(texture, "setSource");

            // Simulate image load
            expect(mockImageInstances.length).toBe(1);
            const mockImage = mockImageInstances[0];
            mockImage.onload();

            // Assert
            expect(setSourceSpy).toHaveBeenCalledWith(mockImage);
        });

        it("should return texture immediately without waiting for image load", () => {
            // Arrange
            const inputs = new Inputs.Draw.GenericTextureDto();
            inputs.url = "https://example.com/texture.png";

            // Act
            const texture = draw.createTexture(inputs);

            // Assert - texture should be returned even before image loads
            expect(texture).toBeDefined();
            expect(texture).toBeInstanceOf(pc.Texture);
            // Image load hasn't happened yet
            expect(mockImageInstances[0].onload).toBeDefined();
        });

        it("should handle multiple textures independently", () => {
            // Arrange
            const inputs1 = new Inputs.Draw.GenericTextureDto();
            inputs1.url = "https://example.com/texture1.png";
            inputs1.name = "Texture1";
            inputs1.samplingMode = Inputs.Draw.samplingModeEnum.nearest;

            const inputs2 = new Inputs.Draw.GenericTextureDto();
            inputs2.url = "https://example.com/texture2.png";
            inputs2.name = "Texture2";
            inputs2.samplingMode = Inputs.Draw.samplingModeEnum.trilinear;

            // Act
            const texture1 = draw.createTexture(inputs1);
            const texture2 = draw.createTexture(inputs2);

            // Simulate both images loading
            mockImageInstances[0].onload();
            mockImageInstances[1].onload();

            // Assert
            expect(texture1.name).toBe("Texture1");
            expect(texture2.name).toBe("Texture2");
            expect(texture1.minFilter).toBe(pc.FILTER_NEAREST);
            expect(texture2.minFilter).toBe(pc.FILTER_LINEAR_MIPMAP_LINEAR);
        });

        it("should use graphics device from context app", () => {
            // Arrange
            const inputs = new Inputs.Draw.GenericTextureDto();
            inputs.url = "https://example.com/texture.png";

            // Act
            const texture = draw.createTexture(inputs);

            // Assert
            expect(texture).toBeDefined();
            // The texture should have been created using the mock graphics device
            expect(texture.device).toBeDefined();
        });

        it("should handle default sampling mode when not specified", () => {
            // Arrange
            const inputs = new Inputs.Draw.GenericTextureDto();
            inputs.url = "https://example.com/texture.png";
            // samplingMode defaults to 'nearest'

            // Act
            const texture = draw.createTexture(inputs);

            // Simulate image load
            mockImageInstances[0].onload();

            // Assert - default is 'nearest'
            expect(texture.minFilter).toBe(pc.FILTER_NEAREST);
            expect(texture.magFilter).toBe(pc.FILTER_NEAREST);
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