import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import type * as Models from "../../api/models";

const GUIDE = new URL("../../../../../../docs/learn/using-ai-with-bitbybit/design-documents.md", import.meta.url);

function guideDocuments(): Map<string, Models.OCCT.DesignDocument> {
    const text = readFileSync(GUIDE, "utf8");
    const blocks = [...text.matchAll(/```json title="([^"]+\.design\.json)"\n([\s\S]*?)\n```/g)];
    return new Map(blocks.map(block => [block[1]!, JSON.parse(block[2]!) as Models.OCCT.DesignDocument]));
}

describe("the design documents guide", () => {
    let occt: OCCTService;
    let documents: Map<string, Models.OCCT.DesignDocument>;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
        documents = guideDocuments();
    }, 120_000);

    it("should show a part document and an assembly document", () => {
        // Assert
        expect([...documents.keys()]).toEqual(["bracket.design.json", "hinge.design.json"]);
    });

    it("should show documents that validate without a problem, the assembly with the part document it places", () => {
        // Arrange
        const bracket = documents.get("bracket.design.json")!;

        // Act
        const issues = [occt.design.validate({ document: bracket }), occt.design.validate({ document: documents.get("hinge.design.json")!, documents: [bracket] })];

        // Assert
        expect(issues).toEqual([[], []]);
    });

    it("should show a part document whose every feature builds, with the part, material and connectors it describes", () => {
        // Arrange
        const document = documents.get("bracket.design.json")!;

        // Act
        const result = occt.design.build({ document });

        // Assert
        const part = result.parts[0]!;
        expect(result.report.map(entry => [entry.id, entry.status])).toEqual([["base", "ok"], ["plate", "ok"], ["holes", "ok"], ["round", "ok"]]);
        expect(result.issues).toEqual([]);
        expect([part.id, part.properties["partNumber"], part.connectors.map(connector => connector.id)]).toEqual(["bracket", "BRK-60x40", ["pivotTop", "pivotBottom"]]);
        expect(part.mass).toBeGreaterThan(0);
    });

    it("should show an assembly that builds from the part document beside it, turned by its joint", () => {
        // Arrange
        const document = documents.get("hinge.design.json")!;

        // Act
        const result = occt.design.build({ document, documents: [documents.get("bracket.design.json")!] });

        // Assert
        expect(result.report.every(entry => entry.status === "ok")).toBe(true);
        expect(result.issues).toEqual([]);
        expect(result.parts).toHaveLength(2);
        expect(result.joints?.map(joint => [joint.component, joint.type, joint.angle, joint.limits])).toEqual([["upper", "revolute", 30, { angle: [0, 90] }]]);
    });
});
