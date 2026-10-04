import { describe, it, expect } from "vitest";
import { occtDtoRegistry } from "../../api/dto-registry";
import { placementOrder } from "./assembly";
import { assemblyIssues } from "./assembly-check";
import { versionOf } from "./identity";
import { libraryOf } from "./library";
import { documentIssues } from "./document-check";

const PLATE = "11111111-1111-4111-8111-111111111111";
const POST = "22222222-2222-4222-8222-222222222222";
const PAIR = "33333333-3333-4333-8333-333333333333";

const plate = {
    schemaVersion: 1,
    id: PLATE,
    configurations: [{ id: "thin", values: {} }],
    parameters: { width: 40 },
    features: [
        { id: "base", type: "sketch", on: { plane: "XY" }, pen: [{ type: "hLine", length: "width" }, { type: "vLine", length: 20 }, { type: "close" }] },
        { id: "plate", type: "extrude", profile: "base", distance: 10 },
    ],
    parts: [{ id: "plate", body: "plate", connectors: [{ id: "top", on: { of: "plate", role: "end" } }] }],
};

const loose = { schemaVersion: 1, id: POST, features: [{ id: "base", type: "sketch", on: { plane: "XY" }, pen: [{ type: "hLine", length: 4 }, { type: "vLine", length: 4 }, { type: "close" }] }, { id: "post", type: "extrude", profile: "base", distance: 6 }] };

const pair = { schemaVersion: 1, kind: "assembly", id: PAIR, components: [{ id: "plate", source: { document: PLATE, part: "plate" } }], connectors: [{ id: "deck", component: "plate", connector: "top" }] };

const issuesOf = (components: unknown[], parameters: Record<string, unknown> = { size: 3 }, joints?: unknown): { path: string; message: string }[] =>
    assemblyIssues({ schemaVersion: 1, kind: "assembly", parameters, components, ...(joints === undefined ? {} : { joints }) }, occtDtoRegistry, libraryOf([plate, loose, pair]).library);

const onPlate = (id: string, component: string, extra: Record<string, unknown> = {}): Record<string, unknown> => ({ id, type: "fastened", component, connector: "top", to: { component: "plate", connector: "top" }, ...extra });

describe("design assembly check", () => {
    it("should accept components whose sources, placements and joints name what the documents given have", () => {
        // Act
        const issues = issuesOf([
            { id: "plate", name: "Base", source: { document: PLATE, part: "plate", version: versionOf(plate), configuration: "thin", parameters: { width: "size * 10" } }, properties: { code: "P{size}" }, extras: {} },
            { id: "free", source: { document: POST, part: "post" }, at: { origin: [0, 0, "size"], normal: [0, 0, 1], direction: [1, 0, 0] }, suppressed: "size > 5" },
            { id: "second", source: { document: PLATE, part: "plate" } },
            { id: "framed", source: { document: PLATE, part: "plate" } },
            { id: "sub", source: { document: PAIR }, at: { origin: [9, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] } },
            { id: "joinedSub", source: { document: PAIR } },
            { id: "onSub", source: { document: PLATE, part: "plate" } },
            { id: "slide", source: { document: PLATE, part: "plate" } },
        ], { size: 3 }, [
            onPlate("second", "second", { type: "revolute", flip: true, angle: 90, offset: "size", limits: { angle: [-180, "size * 60"] } }),
            { id: "framed", type: "fastened", component: "framed", connector: "top", to: { frame: { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] } } },
            { id: "joinedSub", type: "fastened", component: "joinedSub", connector: "deck", to: { component: "plate", connector: "top" } },
            { id: "onSub", type: "cylindrical", component: "onSub", connector: "top", to: { component: "sub", connector: "deck" }, angle: 10, offset: 1, limits: { angle: [0, 45], offset: [0, 2] }, extras: {} },
            onPlate("slide", "slide", { type: "slider", offset: "size", limits: { offset: [0, 10] } }),
        ]);

        // Assert
        expect(issues).toEqual([]);
    });
    it("should refuse a header, parameters and components list it cannot read", () => {
        // Act
        const header = assemblyIssues({ schemaVersion: 1, features: [], components: {} }, occtDtoRegistry, new Map());
        const wrongKind = assemblyIssues({ schemaVersion: 1, kind: "part", components: [] }, occtDtoRegistry, new Map());
        const badParameter = issuesOf([], { size: "size + 1" });

        // Assert
        expect(header).toEqual([
            { path: "/features", message: "\"features\" is not a property here: use $schema, schemaVersion, kind, id, units, up, meta, requires, parameters, configurations, components, joints, connectors, properties, extras, extensions" },
            { path: "/kind", message: "one of assembly is expected" },
            { path: "/components", message: "components is a list" },
        ]);
        expect(wrongKind).toEqual([{ path: "/kind", message: "one of assembly is expected" }]);
        expect(badParameter).toEqual([{ path: "/parameters/size", message: "\"size\" depends on itself" }]);
    });

    it("should refuse sources that name what the documents given do not have", () => {
        // Act
        const issues = issuesOf([
            { id: "a", source: "plate" },
            { id: "b", source: { document: "unknown" } },
            { id: "c", source: { document: PLATE, part: "plate", version: "abc" } },
            { id: "d", source: { document: PLATE, part: "plate", version: "0".repeat(64) } },
            { id: "e", source: { document: PLATE } },
            { id: "f", source: { document: PAIR, part: "plate" } },
            { id: "g", source: { document: PLATE, part: "plank" } },
            { id: "h", source: { document: PLATE, part: "plate", configuration: "thick" } },
            { id: "i", source: { document: PLATE, part: "plate", parameters: { depth: 3 } } },
            { id: "j", source: { document: PLATE, part: "plate", parameters: { width: "nope" } } },
            { id: "k", source: { document: PLATE, part: "plate", parameters: [] } },
            { id: "l", source: { document: PLATE, part: "plate", colour: "red" } },
            { id: "m", source: { document: PLATE, part: 3 } },
        ]);

        // Assert
        expect(issues.map(issue => issue.path)).toEqual([
            "/components/0/source",
            "/components/1/source/document",
            "/components/2/source/version",
            "/components/3/source/version",
            "/components/4/source/part",
            "/components/5/source/part",
            "/components/6/source/part",
            "/components/7/source/configuration",
            "/components/8/source/parameters/depth",
            "/components/9/source/parameters/width",
            "/components/10/source/parameters",
            "/components/11/source/colour",
            "/components/12/source/part",
        ]);
        expect(issues[3]!.message).toBe(`the document "${PLATE}" has changed since this version: its version is now ${versionOf(plate)}`);
        expect(issues[6]!.message).toBe(`"plank" is not a part of "${PLATE}": its parts are plate`);
    });

    it("should refuse joints that cannot place the component they move", () => {
        // Arrange
        const movers = Array.from({ length: 22 }, (_, index) => ({ id: `m${index}`, source: { document: PLATE, part: "plate" } }));
        const components = [
            { id: "plate", source: { document: PLATE, part: "plate" } },
            { id: "pinned", source: { document: PLATE, part: "plate" }, at: { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] } },
            { id: "sub", source: { document: PAIR } },
            { id: "free", source: { document: POST, part: "post" } },
            ...movers,
        ];

        // Act
        const issues = issuesOf(components, { size: 3 }, [
            onPlate("j0", "pinned"),
            { id: "j1", type: "fastened", component: "sub", connector: "top", to: { component: "plate", connector: "top" } },
            onPlate("j2", "m2", { connector: "side" }),
            onPlate("j3", "m3", { to: { component: "ghost", connector: "top" } }),
            onPlate("j4", "m4", { to: { component: "m4", connector: "top" } }),
            onPlate("j5", "m5", { to: { component: "sub", connector: "top" } }),
            onPlate("j6", "m6", { to: { component: "plate", connector: "bottom" } }),
            onPlate("j7", "m7", { flip: "yes" }),
            onPlate("j8", "m8", { angle: "nope" }),
            onPlate("j9", "m9", { to: { frame: [0, 0, 0] } }),
            onPlate("j10", "m10", { to: "plate" }),
            onPlate("j11", "m11", { spin: 1 }),
            onPlate("j12", "m12", { type: "ball" }),
            onPlate("j13", "ghost"),
            onPlate("j14", "m14"),
            onPlate("j15", "m14"),
            onPlate("j16", "m16", { limits: { angle: [0, 1] } }),
            onPlate("j17", "m17", { type: "revolute", limits: { offset: [0, 1] } }),
            onPlate("j18", "m18", { type: "slider", limits: { offset: [5] } }),
            onPlate("j19", "m19", { type: "revolute", limits: { angle: [10, 0] } }),
            onPlate("j20", "m20", { type: "revolute", angle: 100, limits: { angle: [0, 90] } }),
            onPlate("j21", "m21", { type: "revolute", limits: { angle: ["nope", 3] } }),
            { id: "j22", type: "fastened", component: "free", connector: "anything", to: { component: "plate", connector: "top" } },
        ]);

        // Assert
        expect(issues.map(issue => issue.path)).toEqual([
            "/joints/0/component",
            "/joints/1/connector",
            "/joints/2/connector",
            "/joints/3/to/component",
            "/joints/4/to/component",
            "/joints/5/to/connector",
            "/joints/6/to/connector",
            "/joints/7/flip",
            "/joints/8/angle",
            "/joints/9/to/frame",
            "/joints/10/to",
            "/joints/11/spin",
            "/joints/12/type",
            "/joints/13/component",
            "/joints/15/component",
            "/joints/16/limits/angle",
            "/joints/17/limits/offset",
            "/joints/18/limits/offset",
            "/joints/19/limits/angle",
            "/joints/20/angle",
            "/joints/21/limits/angle/0",
        ]);
        expect(issues[0]!.message).toBe("\"pinned\" is placed at a frame, so no joint can move it");
        expect(issues[1]!.message).toBe("\"top\" is not a connector of the assembly \"sub\" places: its connectors are deck");
        expect(issues[2]!.message).toBe("\"side\" is not a connector of the part \"m2\" places: its connectors are top");
        expect(issues[5]!.message).toBe("\"top\" is not a connector of \"sub\": its connectors are deck");
        expect(issues[14]!.message).toBe("\"m14\" is moved by the joint \"j14\" already: a component is moved by one joint at most");
        expect(issues[15]!.message).toBe("a fastened joint moves nothing, so it has no limits");
        expect(issues[16]!.message).toBe("a revolute joint lets only its angle move");
        expect(issues[17]!.message).toBe("limits are [least, most]");
        expect(issues[18]!.message).toBe("the least, 10, is more than the most, 0");
        expect(issues[19]!.message).toBe("100 is outside the joint's limits, 0 to 90");
    });

    it("should refuse a joints list that is not a list", () => {
        // Act
        const issues = issuesOf([{ id: "plate", source: { document: PLATE, part: "plate" } }], { size: 3 }, "plate");

        // Assert
        expect(issues).toEqual([{ path: "/joints", message: "joints is a list" }]);
    });
    it("should check the connectors an assembly publishes against the components it places", () => {
        // Arrange
        const check = (connectors: unknown): string[] => assemblyIssues(
            { schemaVersion: 1, kind: "assembly", components: [{ id: "plate", source: { document: PLATE, part: "plate" } }, { id: "sub", source: { document: PAIR } }], connectors },
            occtDtoRegistry,
            libraryOf([plate, pair]).library,
        ).map(issue => issue.path);

        // Act
        const good = check([{ id: "a", component: "plate", connector: "top" }, { id: "b", component: "sub", connector: "deck", extras: {} }]);
        const notList = check("plate");
        const bad = check([
            { id: "a", component: "ghost", connector: "top" },
            { id: "b", component: "plate", connector: "side" },
            { id: "c", component: "sub", connector: "top" },
            { id: "d", component: "plate", connector: "top", flip: true },
            "e",
            { id: "a", component: "plate", connector: "top" },
        ]);
        const nested = assemblyIssues({ schemaVersion: 1, kind: "assembly", components: [{ id: "sub", source: { document: PAIR } }] }, occtDtoRegistry, libraryOf([plate, { ...pair, connectors: [{ id: "deck", component: "plate", connector: "edge" }] }]).library);

        // Assert
        expect(good).toEqual([]);
        expect(notList).toEqual(["/connectors"]);
        expect(bad).toEqual(["/connectors/4", "/connectors/0/component", "/connectors/1/connector", "/connectors/2/connector", "/connectors/3/flip", "/connectors/4"]);
        expect(nested).toEqual([{ path: "/documents/1/connectors/0/connector", message: "\"edge\" is not a connector of \"plate\": its connectors are top" }]);
    });

    it("should refuse components that are not objects, have no usable id, and joints that close a loop", () => {
        // Act
        const shapes = issuesOf(["plate", { id: "1x", source: { document: PLATE, part: "plate" } }, { id: "c", source: { document: PLATE, part: "plate" }, name: 3, suppressed: "nope", properties: { code: "{nope}" } }]);
        const both = [{ id: "a", source: { document: PLATE, part: "plate" } }, { id: "b", source: { document: PLATE, part: "plate" } }];
        const loop = issuesOf(both, { size: 3 }, [
            { id: "ab", type: "fastened", component: "a", connector: "top", to: { component: "b", connector: "top" } },
            { id: "ba", type: "revolute", component: "b", connector: "top", to: { component: "a", connector: "top" } },
        ]);
        const toItself = issuesOf([{ id: "x", source: { document: PLATE, part: "plate" } }, { id: "y", source: { document: PLATE, part: "plate" } }], { size: 3 }, [
            { id: "xy", type: "fastened", component: "x", connector: "top", to: { component: "y", connector: "top" } },
            { id: "yy", type: "fastened", component: "y", connector: "top", to: { component: "y", connector: "top" } },
        ]);

        // Assert
        expect(shapes.map(issue => issue.path)).toEqual(["/components/0", "/components/0", "/components/2/name"]);
        expect(loop).toEqual([{ path: "/joints/0/to", message: "\"a\" is moved, through its joints, by itself: a closed loop of joints needs a constraint solver, which is not built yet" }]);
        expect(toItself).toEqual([{ path: "/joints/1/to/component", message: "\"y\" is not another component of this assembly" }]);
    });
    it("should report the problems of the documents it places under their position, and an assembly that contains itself", () => {
        // Arrange
        const broken = { ...plate, features: [plate.features[0], { id: "plate", type: "extrude", profile: "nothing", distance: 10 }] };
        const looping = { schemaVersion: 1, kind: "assembly", id: PAIR, components: [{ id: "again", source: { document: PAIR } }] };

        // Act
        const nested = assemblyIssues({ schemaVersion: 1, kind: "assembly", components: [{ id: "plate", source: { document: PLATE, part: "plate" } }] }, occtDtoRegistry, libraryOf([loose, broken]).library);
        const loop = assemblyIssues(looping, occtDtoRegistry, libraryOf([looping]).library, [PAIR]);
        const twoLevels = assemblyIssues({ schemaVersion: 1, kind: "assembly", components: [{ id: "sub", source: { document: PAIR } }] }, occtDtoRegistry, libraryOf([pair, broken]).library);

        // Assert
        expect(nested).toEqual([{ path: "/documents/1/features/1/profile", message: "\"nothing\" is not a sketch made by an earlier feature" }]);
        expect(twoLevels).toEqual([{ path: "/documents/1/features/1/profile", message: "\"nothing\" is not a sketch made by an earlier feature" }]);
        expect(loop).toEqual([{ path: "/documents/0", message: `the assembly "${PAIR}" contains itself` }]);
    });

    it("should read the list of documents given and refuse ones without a distinct id", () => {
        // Act
        const notList = libraryOf("plate");
        const ids = libraryOf([plate, { schemaVersion: 1 }, plate]);
        const none = libraryOf(undefined);

        // Assert
        expect(notList.issues).toEqual([{ path: "/documents", message: "documents is a list of design documents" }]);
        expect(ids.issues.map(issue => issue.path)).toEqual(["/documents/1/id", "/documents/2/id"]);
        expect([...ids.library.keys()]).toEqual([PLATE]);
        expect(none).toEqual({ library: new Map(), issues: [] });
    });

    it("should check the connectors of a part document", () => {
        // Act
        const pathsOf = (connectors: unknown[]): string[] => documentIssues({ ...plate, parts: [{ id: "plate", body: "plate", connectors }] }, occtDtoRegistry).map(issue => issue.path);
        const good = pathsOf([{ id: "a", on: { of: "plate", role: "end" }, origin: [1, 2, 10], direction: [0, 1, 0], extras: {} }]);
        const ghost = pathsOf([{ id: "a", on: { of: "ghost", role: "end" } }]);
        const flat = pathsOf([{ id: "b", on: { of: "plate", role: "end" }, origin: [0, 0] }]);
        const tilted = pathsOf([{ id: "c", on: { of: "plate", role: "end" }, tilt: 1 }]);
        const duplicate = pathsOf([{ id: "a", on: { of: "plate", role: "end" } }, { id: "a", on: { of: "plate", role: "end" } }]);

        // Assert
        expect(good).toEqual([]);
        expect(ghost).toEqual(["/parts/0/connectors/0/on/of"]);
        expect(flat).toEqual(["/parts/0/connectors/0/origin"]);
        expect(tilted).toEqual(["/parts/0/connectors/0/tilt"]);
        expect(duplicate).toEqual(["/parts/0/connectors/1/id"]);
    });

    it("should check each document a library places once, however many paths reach it", () => {
        // Arrange
        const idOf = (level: number, side: number): string => `00000000-0000-4000-8000-${String(level * 2 + side).padStart(12, "0")}`;
        const levels = Array.from({ length: 30 }, (_, level) => [0, 1].map(side => ({
            schemaVersion: 1,
            kind: "assembly",
            id: idOf(level, side),
            components: [0, 1].map(from => ({ id: `c${from}`, source: level === 0 ? { document: PLATE, part: "plate" } : { document: idOf(level - 1, from) } })),
        }))).flat();

        // Act
        const issues = assemblyIssues(levels[59]!, occtDtoRegistry, libraryOf([plate, ...levels]).library);

        // Assert
        expect(issues).toEqual([]);
    });

    it("should refuse a document in another length unit than the assembly that places it", () => {
        // Arrange
        const inches = { ...plate, units: { length: "in" } };

        // Act
        const mixed = assemblyIssues({ schemaVersion: 1, kind: "assembly", components: [{ id: "plate", source: { document: PLATE, part: "plate" } }] }, occtDtoRegistry, libraryOf([inches]).library);
        const matching = assemblyIssues({ schemaVersion: 1, kind: "assembly", units: { length: "in" }, components: [{ id: "plate", source: { document: PLATE, part: "plate" } }] }, occtDtoRegistry, libraryOf([inches]).library);

        // Assert
        expect(mixed).toEqual([{ path: "/components/0/source/document", message: `"${PLATE}" is in in and this assembly in mm: everything one build places is in one length unit` }]);
        expect(matching).toEqual([]);
    });

    it("should order a long chain of joints without running out of stack", () => {
        // Arrange
        const components = Array.from({ length: 20000 }, (_, index) => ({ id: `c${index}`, source: { document: PLATE, part: "plate" } }));
        const moving = new Map(components.slice(1).map((component, index) => [component.id, { joint: { id: `j${index}`, type: "fastened" as const, component: component.id, connector: "top", to: { component: `c${index}`, connector: "top" } }, path: `/joints/${index}` }]));

        // Act
        const order = placementOrder([...components].reverse(), moving);

        // Assert
        expect(order).toHaveLength(20000);
        expect(order[0]).toBe(19999);
        expect(order[19999]).toBe(0);
    });
});
