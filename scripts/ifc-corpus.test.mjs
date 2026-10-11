import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { boxOffset, CACHE, canonicalSets, FILES, fileOf, compareBoxes, compareSemantics, compareVolumes, cutHost, download, joinBoxes, manifestProblems, nodeShape, oracleByGlobalId, oracleCacheDir, oracleInMetres, oracleJsonOf, privateFiles, problemKinds, reportRow, sameDataSection, USER_AGENT, verify } from "./ifc-corpus.mjs";

const BODY = "ISO-10303-21;\nHEADER;\nENDSEC;\nDATA;\n#1=IFCPROJECT('x',$,$,$,$,$,$,$,$);\nENDSEC;\nEND-ISO-10303-21;\n";
const sha = (text) => createHash("sha256").update(text).digest("hex");

function entry(overrides = {}) {
    return { id: "kit-fzk-haus", url: "https://example.test/fzk.ifc", sha256: sha(BODY), bytes: Buffer.byteLength(BODY), schema: "IFC4", licence: "CC BY 4.0", features: [], ...overrides };
}

const folder = () => mkdtempSync(path.join(tmpdir(), "ifc-corpus-"));
const responseOf = (text, status = 200) => new Response(text, { status });

describe("manifestProblems", () => {
    it("should accept a manifest whose every entry is complete", () => {
        // Act
        const problems = manifestProblems({ files: [entry(), entry({ id: "duplex", schema: "IFC2X3" })] });

        // Assert
        assert.deepEqual(problems, []);
    });

    it("should name every field an entry gets wrong, and an id used twice", () => {
        // Arrange
        const broken = { id: "Not Kebab", url: "http://example.test/x.ifc", sha256: "abc", bytes: 0, schema: "IFC5", licence: " ", features: "clipping" };

        // Act
        const problems = manifestProblems({ files: [broken, entry(), entry()] });

        // Assert
        assert.deepEqual(problems, [
            "files[0] (Not Kebab): the id is not kebab-case",
            "files[0] (Not Kebab): the url is not https",
            "files[0] (Not Kebab): the sha256 is not 64 hexadecimal digits",
            "files[0] (Not Kebab): bytes is not a positive whole number",
            "files[0] (Not Kebab): the schema IFC5 is not one the library reads",
            "files[0] (Not Kebab): the licence is not stated",
            "files[0] (Not Kebab): features is not a list",
            "files[2] (kit-fzk-haus): the id is used twice",
        ]);
    });

    it("should refuse a manifest without a files list", () => {
        // Assert
        assert.deepEqual(manifestProblems({}), ["the manifest has no files list"]);
    });
});

describe("verify", () => {
    it("should pass a file of the manifest's size and hash, and name a missing, short or changed one", async () => {
        // Arrange
        const dir = folder();
        const good = path.join(dir, "good.ifc");
        const short = path.join(dir, "short.ifc");
        const changed = path.join(dir, "changed.ifc");
        writeFileSync(good, BODY);
        writeFileSync(short, BODY.slice(1));
        writeFileSync(changed, BODY.replace("x", "y"));

        // Act
        const results = await Promise.all([good, short, changed, path.join(dir, "absent.ifc")].map((file) => verify(entry(), file)));

        // Assert
        assert.equal(results[0], null);
        assert.equal(results[1], `kit-fzk-haus has ${Buffer.byteLength(BODY) - 1} bytes, the manifest says ${Buffer.byteLength(BODY)}`);
        assert.equal(results[2], `kit-fzk-haus has sha256 ${sha(BODY.replace("x", "y"))}, the manifest says ${sha(BODY)}`);
        assert.equal(results[3], "kit-fzk-haus is missing");
    });
});

describe("download", () => {
    it("should write the file only when its hash and size are the manifest's", async () => {
        // Arrange
        const target = path.join(folder(), "files", "fzk.ifc");

        const requests = [];

        // Act
        const problem = await download(entry(), target, async (url, options) => { requests.push([url, options.headers["user-agent"]]); return responseOf(BODY); }, 0);

        // Assert
        assert.equal(problem, null);
        assert.equal(readFileSync(target, "utf8"), BODY);
        assert.deepEqual(requests, [["https://example.test/fzk.ifc", USER_AGENT]]);
    });

    it("should keep nothing of a file whose hash differs, and say what arrived", async () => {
        // Arrange
        const target = path.join(folder(), "fzk.ifc");

        // Act
        const problem = await download(entry(), target, async () => responseOf(`${BODY} `), 0);

        // Assert
        assert.equal(problem, `kit-fzk-haus downloaded with sha256 ${sha(`${BODY} `)} and ${Buffer.byteLength(BODY) + 1} bytes, the manifest says ${sha(BODY)} and ${Buffer.byteLength(BODY)}`);
        assert.deepEqual([existsSync(target), existsSync(`${target}.part`)], [false, false]);
    });

    it("should keep nothing of a file of the right hash but not the manifest's size", async () => {
        // Arrange
        const target = path.join(folder(), "fzk.ifc");

        // Act
        const problem = await download(entry({ bytes: 1 }), target, async () => responseOf(BODY), 0);

        // Assert
        assert.equal(problem, `kit-fzk-haus downloaded with sha256 ${sha(BODY)} and ${Buffer.byteLength(BODY)} bytes, the manifest says ${sha(BODY)} and 1`);
        assert.equal(existsSync(target), false);
    });

    it("should stop at a missing file and retry a failing connection", async () => {
        // Arrange
        let calls = 0;
        const missing = async () => { calls++; return responseOf("", 404); };
        const flaky = async () => { calls++; if (calls < 3) { throw new Error("reset"); } return responseOf(BODY); };

        // Act
        const notFound = await download(entry(), path.join(folder(), "a.ifc"), missing, 0);
        const afterNotFound = calls;
        calls = 0;
        const recovered = await download(entry(), path.join(folder(), "b.ifc"), flaky, 0);

        // Assert
        assert.equal(notFound, "kit-fzk-haus could not be downloaded from https://example.test/fzk.ifc: HTTP 404");
        assert.equal(afterNotFound, 1);
        assert.deepEqual([recovered, calls], [null, 3]);
    });
});

describe("fileOf", () => {
    it("should keep a public file under its id with the extension its url gives, .ifczip or .ifc", () => {
        // Assert
        assert.deepEqual([fileOf(entry({ url: "https://example.test/a/house.IFCZIP?raw=1" })), fileOf(entry())], [path.join(FILES, "kit-fzk-haus.ifczip"), path.join(FILES, "kit-fzk-haus.ifc")]);
    });
});

describe("privateFiles", () => {
    it("should list the IFC files of a folder in name order under ids that do not name them", () => {
        // Arrange
        const dir = folder();
        ["d.ifc", "b.ifczip", "notes.txt", "e.ifc", "a.IFC", "c.ifc"].forEach((name) => writeFileSync(path.join(dir, name), ""));

        // Act
        const files = privateFiles(dir);

        // Assert
        assert.deepEqual(files, [
            { id: "private-1", file: path.join(dir, "a.IFC"), private: true },
            { id: "private-2", file: path.join(dir, "b.ifczip"), private: true },
            { id: "private-3", file: path.join(dir, "c.ifc"), private: true },
            { id: "private-4", file: path.join(dir, "d.ifc"), private: true },
            { id: "private-5", file: path.join(dir, "e.ifc"), private: true },
        ]);
        assert.deepEqual(privateFiles(undefined), []);
    });

    it("should keep a private file's oracle beside it, outside the repository", () => {
        // Assert
        assert.equal(oracleCacheDir({ file: "/data/models/a.ifc", private: true }), "/data/models/.bitbybit-oracle");
        assert.equal(oracleCacheDir({ file: "/repo/fzk.ifc" }), path.join(CACHE, "oracle"));
    });
});

describe("reportRow", () => {
    const comparison = { compared: 2, agreeing: 1, worst: [{ globalId: "2O2Fr$t4X7Zf8NOew3FLOH" }] };
    const result = { schema: "IFC2X3", elements: 2, volumes: comparison, boxes: comparison, semantics: comparison };

    it("should keep a public file's exporter and the elements that disagree", () => {
        // Act
        const row = reportRow({ ...entry(), exporter: "Archicad 20" }, result);

        // Assert
        assert.deepEqual(row, { id: "kit-fzk-haus", private: false, schema: "IFC2X3", exporter: "Archicad 20", elements: 2, volumes: comparison, boxes: comparison, semantics: comparison });
    });

    it("should keep counts only of a private file, naming it by its id and hiding GlobalIds where a failure names them", () => {
        // Arrange
        const tower = { id: "private-2", file: "/data/models/Model A.ifc", private: true };

        // Act
        const measured = JSON.parse(JSON.stringify(reportRow(tower, result)));
        const failed = reportRow(tower, { failed: "The GlobalId '0000000000000000000001' in /data/models/Model A.ifc, written as Model A.ifc", oracleFailed: "IfcOpenShell could not open /data/models/Model A.ifc" });

        // Assert
        assert.deepEqual(measured, { id: "private-2", private: true, schema: "IFC2X3", elements: 2, volumes: { compared: 2, agreeing: 1 }, boxes: { compared: 2, agreeing: 1 }, semantics: { compared: 2, agreeing: 1 } });
        assert.deepEqual([failed.failed, failed.oracleFailed], ["The GlobalId '<GlobalId>' in private-2, written as private-2", "IfcOpenShell could not open private-2"]);
    });
});

describe("problemKinds, nodeShape and cutHost", () => {
    it("should count problems by their kind, with entity ids and GlobalIds left out but entity names kept, the most common first", () => {
        // Act
        const kinds = problemKinds(["An IfcAdvancedBrep is not supported yet", "#12 has no swept area", "An IfcAdvancedBrep is not supported yet", "#9 has no swept area", "The GlobalId '2O2Fr$t4X7Zf8NOew3FLOH' belongs to 2 entities (#4, #5)", "An IfcSweptDiskSolid is not supported yet", "An IfcCompositeProfileDef profile is not supported yet"]);

        // Assert
        assert.deepEqual(Object.entries(kinds), [["#n has no swept area", 2], ["An IfcAdvancedBrep is not supported yet", 2], ["An IfcCompositeProfileDef profile is not supported yet", 1], ["An IfcSweptDiskSolid is not supported yet", 1], ["The GlobalId '<GlobalId>' belongs to 2 entities (#n, #n)", 1]]);
    });

    it("should name a root's shape by its cuts and compounds, through transforms", () => {
        // Arrange
        const nodes = [{ op: "triangles" }, { op: "extrude" }, { op: "transform", of: 0 }, { op: "compound", of: [2, 1, 0] }, { op: "voids", host: 3, openings: [1] }, { op: "difference", of: 2, tools: [1] }];

        // Act
        const shapes = [4, 5, 2, 9].map((index) => nodeShape(nodes, index));

        // Assert
        assert.deepEqual(shapes, ["voids(compound(extrude,triangles))", "difference(triangles)", "triangles", "missing"]);
    });

    it("should find the solid a root's cuts are made in, through transforms, and none for a root without cuts", () => {
        // Arrange
        const nodes = [{ op: "extrude" }, { op: "voids", host: 0, openings: [] }, { op: "transform", of: 1 }, { op: "difference", of: 0, tools: [] }];

        // Act
        const hosts = [2, 3, 0].map((index) => cutHost(nodes, index));

        // Assert
        assert.deepEqual(hosts, [0, 0, undefined]);
    });
});

describe("compareVolumes", () => {
    it("should count the closed elements within one per cent, or within a cubic centimetre, list the worst others, and leave open shells out", () => {
        // Arrange
        const ours = new Map([["a", 1.005], ["b", 2], ["c", 0.0000004], ["d", 4.2]]);
        const oracle = [
            { globalId: "a", type: "IfcWall", status: "ok", volume: 1 },
            { globalId: "b", type: "IfcSlab", status: "ok", volume: 1 },
            { globalId: "c", type: "IfcMember", status: "ok", volume: 0.0000009 },
            { globalId: "d", type: "IfcDoor", status: "ok", volume: 4 },
            { globalId: "e", type: "IfcWindow", status: "ok", volume: 1 },
            { globalId: "f", type: "IfcBeam", status: "not built" },
            { globalId: "g", type: "IfcCovering", status: "ok", closed: false, volume: 9 },
        ];

        // Act
        const result = compareVolumes(ours, oracle);

        // Assert
        assert.deepEqual({ ...result, worst: result.worst.map((row) => row.globalId) }, { oracleElements: 7, oracleFailed: 1, oracleOpen: 1, compared: 4, missing: 1, agreeing: 2, worst: ["b", "d"] });
    });
});

describe("oracleJsonOf", () => {
    it("should keep only the oracle's own line of what IfcOpenShell printed", () => {
        // Arrange
        const stdout = "face\n  loop has fewer than three points\n{\"ifcopenshell\": \"0.9.0\", \"elements\": []}\n";

        // Assert
        assert.equal(oracleJsonOf(stdout), "{\"ifcopenshell\": \"0.9.0\", \"elements\": []}");
        assert.equal(oracleJsonOf("Traceback (most recent call last):\n"), undefined);
    });
});

describe("oracleInMetres", () => {
    const oracle = (metresPerUnit) => ({
        metresPerUnit,
        elements: [
            { globalId: "wall", status: "ok", volume: 1.5e9, area: 2e6, min: [0, 0, 0], max: [3000, 300, 2000] },
            { globalId: "plate", status: "ok", volume: 0, area: 0, min: null, max: null },
            { globalId: "door", status: "not built" },
        ],
    });

    it("should scale the file's units to metres with IfcOpenShell's unit, and say whether ours is the same", () => {
        // Act
        const agreeing = oracleInMetres(oracle(0.001), 0.001);
        const differing = oracleInMetres(oracle(0.001), 1);

        // Assert
        assert.deepEqual(agreeing.elements, [
            { globalId: "wall", status: "ok", volume: 1.5, area: 2, min: [0, 0, 0], max: [3, 0.3, 2] },
            { globalId: "plate", status: "ok", volume: 0, area: 0, min: null, max: null },
            { globalId: "door", status: "not built" },
        ]);
        assert.deepEqual([agreeing.unitsAgree, differing.unitsAgree, differing.elements[0].volume], [true, false, 1.5]);
    });

    it("should scale with our unit when IfcOpenShell could not read the file's", () => {
        // Act
        const scaled = oracleInMetres(oracle(null), 0.001);

        // Assert
        assert.deepEqual([scaled.unitsAgree, scaled.elements[0].max], [undefined, [3, 0.3, 2]]);
    });
});

describe("oracleByGlobalId", () => {
    it("should measure the entities that share a GlobalId together, as the roots tagged with it are", () => {
        // Arrange
        const elements = [
            { id: 10, globalId: "bar", type: "IfcReinforcingBar", status: "ok", volume: 1, min: [0, 0, 0], max: [1, 1, 1] },
            { id: 11, globalId: "bar", type: "IfcReinforcingBar", status: "ok", volume: 2, min: [-1, 0, 0.5], max: [0.5, 2, 1] },
            { id: 12, globalId: "wall", type: "IfcWall", status: "ok", volume: 3, min: [0, 0, 0], max: [3, 0.2, 2] },
            { id: 13, globalId: "beam", type: "IfcBeam", status: "ok", volume: 1, min: [0, 0, 0], max: [1, 1, 1] },
            { id: 14, globalId: "beam", type: "IfcBeam", status: "not built" },
            { id: 15, globalId: "sheet", type: "IfcPlate", status: "ok", closed: true, volume: 0, min: null, max: null },
            { id: 16, globalId: "sheet", type: "IfcPlate", status: "ok", closed: false, volume: 0.5, min: [0, 0, 0], max: [2, 2, 0.01] },
        ];

        // Act
        const merged = oracleByGlobalId(elements);

        // Assert
        assert.deepEqual(merged, [
            { globalId: "bar", type: "IfcReinforcingBar", entities: 2, status: "ok", closed: true, volume: 3, min: [-1, 0, 0], max: [1, 2, 1] },
            { ...elements[2], entities: 1 },
            { globalId: "beam", type: "IfcBeam", entities: 2, status: "not built" },
            { globalId: "sheet", type: "IfcPlate", entities: 2, status: "ok", closed: false, volume: 0.5, min: [0, 0, 0], max: [2, 2, 0.01] },
        ]);
    });

    it("should keep the failure of whichever entity failed first", () => {
        // Act
        const [merged] = oracleByGlobalId([
            { id: 1, globalId: "door", type: "IfcDoor", status: "Standard_ConstructionError" },
            { id: 2, globalId: "door", type: "IfcDoor", status: "ok", volume: 1, min: [0, 0, 0], max: [1, 1, 1] },
        ]);

        // Assert
        assert.deepEqual(merged, { globalId: "door", type: "IfcDoor", entities: 2, status: "Standard_ConstructionError" });
    });
});

describe("joinBoxes", () => {
    it("should span both boxes, and take either alone when the other is missing", () => {
        // Arrange
        const a = { min: [0, 0, 0], max: [1, 1, 1] };
        const b = { min: [-1, 0.5, 0], max: [0.5, 2, 1] };

        // Assert
        assert.deepEqual(joinBoxes(a, b), { min: [-1, 0, 0], max: [1, 2, 1] });
        assert.deepEqual([joinBoxes(undefined, b), joinBoxes(a, undefined)], [b, a]);
    });
});

describe("compareBoxes", () => {
    it("should allow each corner one per cent of the oracle's diagonal, or a millimetre for a small part, and list the worst others", () => {
        // Arrange
        const wall = { min: [0, 0, 0], max: [3, 0, 4] };
        const ours = new Map([
            ["near", { min: [0.04, 0, 0], max: [3, 0, 4] }],
            ["far", { min: [0.06, 0, 0], max: [3, 0, 4] }],
            ["moved", { min: [1, 0, 0], max: [4, 0, 4] }],
            ["screw", { min: [0.0009, 0, 0], max: [0.01, 0.01, 0.01] }],
            ["tall", { min: [0, 0, 0], max: [3, 0, 4.1] }],
        ]);
        const oracle = [
            { globalId: "near", type: "IfcWall", status: "ok", ...wall },
            { globalId: "far", type: "IfcWall", status: "ok", ...wall },
            { globalId: "moved", type: "IfcWall", status: "ok", ...wall },
            { globalId: "screw", type: "IfcMechanicalFastener", status: "ok", min: [0, 0, 0], max: [0.01, 0.01, 0.01] },
            { globalId: "tall", type: "IfcWall", status: "ok", ...wall },
            { globalId: "unbuilt", type: "IfcBeam", status: "not built" },
            { globalId: "drawn by them only", type: "IfcCovering", status: "ok", closed: false, min: [0, 0, 0], max: [1, 1, 0] },
        ];

        // Act
        const result = compareBoxes(ours, oracle);

        // Assert
        assert.deepEqual({ ...result, worst: result.worst.map((row) => row.globalId) }, { compared: 5, agreeing: 2, missing: 1, worst: ["moved", "tall", "far"] });
        assert.deepEqual(boxOffset(ours.get("moved"), wall), { offset: 1, allowed: 0.05 });
    });
});

describe("canonicalSets and compareSemantics", () => {
    it("should describe property sets by name and number of values, in order", () => {
        // Assert
        assert.deepEqual(canonicalSets([{ name: "Pset_WallCommon", properties: { IsExternal: true, FireRating: "EI 60" } }, { name: "Acoustics", properties: {} }]), ["Acoustics:0", "Pset_WallCommon:2"]);
    });

    it("should count the types, storeys and property sets that agree, leave shared GlobalIds aside and list the differences", () => {
        // Arrange
        const theirs = {
            counts: { IfcWall: 2, IfcDoor: 1, IfcBeam: 1 },
            elements: [
                { globalId: "wall", storey: "ground", sets: ["Pset_WallCommon:2"] },
                { globalId: "door", storey: "first", sets: [] },
                { globalId: "beam", storey: "", sets: ["Pset_BeamCommon:3"] },
                { globalId: "twin", storey: "ground", sets: [] },
                { globalId: "twin", storey: "ground", sets: [] },
            ],
        };
        const ours = {
            counts: { IfcWall: 2, IfcDoor: 1, IfcColumn: 1 },
            storeys: new Map([["wall", "ground"], ["door", "ground"], ["twin", "ground"]]),
            sets: new Map([["wall", ["Pset_WallCommon:2"]], ["beam", ["Pset_BeamCommon:2"]]]),
        };

        // Act
        const result = compareSemantics(ours, theirs);

        // Assert
        assert.deepEqual(result, {
            types: { compared: 4, agreeing: 2 },
            storeys: { compared: 2, agreeing: 1, missing: 1 },
            propertySets: { compared: 2, agreeing: 1 },
            sharedGlobalIds: 2,
            worst: [
                { kind: "count", type: "IfcColumn", ours: 1, theirs: 0 },
                { kind: "count", type: "IfcBeam", ours: 0, theirs: 1 },
                { kind: "storey", globalId: "door", ours: "ground", theirs: "first" },
                { kind: "sets", globalId: "beam", ours: ["Pset_BeamCommon:2"], theirs: ["Pset_BeamCommon:3"] },
            ],
        });
    });
});

describe("sameDataSection", () => {
    it("should compare the DATA sections only, whatever the headers say", () => {
        // Arrange
        const original = Buffer.from(BODY);
        const newHeader = Buffer.from(BODY.replace("HEADER;", "HEADER;\nFILE_NAME('other');"));
        const newData = Buffer.from(BODY.replace("'x'", "'y'"));

        // Assert
        assert.equal(sameDataSection(original, newHeader), true);
        assert.equal(sameDataSection(original, newData), false);
        assert.equal(sameDataSection(original, Buffer.from("not a step file")), false);
    });
});
