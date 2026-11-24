import { describe, it, expect, beforeEach } from "vitest";
import type { Handle_TDocStd_Document } from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError } from "@bitbybit-dev/base";
import { MAX_DOCUMENT_VERSIONS_KEPT, MAX_DOCUMENT_VERSION_LABELS } from "./constants";
import { DocumentVersions } from "./document-versions";
import type { DocumentKernel, VersionToMake } from "./document-versions";
import { isDocumentHandle } from "./kernel-objects";

class Paper {
    readonly $$ = {};
    deleted = false;

    constructor(readonly lines: string[]) { }

    Main(): object {
        return {};
    }

    IsNull(): boolean {
        return false;
    }

    isDeleted(): boolean {
        return this.deleted;
    }

    delete(): void {
        this.deleted = true;
    }
}

const isHandle = (value: unknown): value is Handle_TDocStd_Document => isDocumentHandle(value);

const asDocument = (paper: Paper): Handle_TDocStd_Document => {
    if (!isHandle(paper)) {
        throw new Error("a paper is a document handle");
    }
    return paper;
};

const linesOf = (document: Handle_TDocStd_Document | undefined): string[] | undefined => document instanceof Paper ? document.lines : undefined;

const writing = (line: string) => (document: Handle_TDocStd_Document): Handle_TDocStd_Document => {
    if (document instanceof Paper) {
        document.lines.push(line);
    }
    return document;
};

const BUILD = "assembly.manager.buildAssemblyDocument";

const RENAME = "assembly.manager.setDocLabelName";

describe("the versions of assembly documents", () => {
    let originals: Map<string, Paper>;
    let forgottenCalls: (string | number)[];
    let held: Set<string | number>;
    let weighed: number;
    let versions: DocumentVersions;

    const kernel: DocumentKernel = {
        copy: document => asDocument(new Paper([...(linesOf(document) ?? [])])),
        replay: (recipe, document) => writing(String(recipe.inputs["line"]))(document),
        weigh: document => {
            weighed += 1;
            return linesOf(document)?.length ?? 0;
        },
    };

    const change = (version: string, parent: string, line: string, inputs: Record<string, unknown> = {}, functionName = RENAME): VersionToMake => ({
        version,
        call: `call of ${version}`,
        parent,
        functionName,
        property: "document",
        inputs: { document: { type: "occ-document", hash: parent }, line, ...inputs },
        settings: {},
        references: "exact",
    });

    const made = (version: string, parent: string, line: string, inputs?: Record<string, unknown>, functionName?: string): void => {
        const object = versions.documentAt(parent) ?? asDocument(originals.get(parent)!);
        versions.make(change(version, parent, line, inputs, functionName), object, writing(line));
        versions.answered(version, "exact");
    };

    const shapes = { structure: { parts: [{ shape: { type: "occ-shape", hash: 7 } }] } };

    beforeEach(() => {
        originals = new Map([["doc", new Paper(["as made"])]]);
        forgottenCalls = [];
        held = new Set([7]);
        weighed = 0;
        versions = new DocumentVersions({
            original: hash => originals.get(hash) ?? null,
            forgetCall: hash => forgottenCalls.push(hash),
            holds: hash => held.has(hash),
        });
        versions.useKernel(kernel);
    });

    it("should refuse to make a version before it is given a kernel", () => {
        // Arrange
        const withoutKernel = new DocumentVersions({ original: () => undefined, forgetCall: () => undefined, holds: () => false });

        // Act & Assert
        expect(() => withoutKernel.make(change("v1", "doc", "one"), asDocument(new Paper([])), writing("one"))).toThrow("No kernel was given to make assembly document versions with.");
    });

    it("should make a version again from the document as made, change after change, once the versions between are freed", () => {
        // Arrange
        made("v1", "doc", "one");
        made("v2", "v1", "two");
        versions.release("v1");
        versions.release("v2");

        // Act
        const again = versions.documentAt("v2");

        // Assert
        expect(linesOf(again)).toEqual(["as made", "one", "two"]);
        expect(versions.objectAt("v1")).toBeUndefined();
    });

    it("should answer nothing for a key that is no version, and for a version whose document as made is gone", () => {
        // Arrange
        made("v1", "doc", "one");
        versions.release("v1");
        originals.clear();

        // Act & Assert
        expect([versions.documentAt("doc"), versions.documentAt("v1")]).toEqual([undefined, undefined]);
    });

    it("should forget every version of a document and the answers of the calls that made them", () => {
        // Arrange
        made("v1", "doc", "one");
        made("v2", "v1", "two");

        // Act
        versions.forgetFamily("doc");

        // Assert
        expect([versions.has("v1"), versions.has("v2"), versions.kept]).toEqual([false, false, 0]);
        expect(forgottenCalls.sort()).toEqual(["call of v1", "call of v2"]);
    });

    it("should free a version that names kernel objects for the bounds while the cache holds them, and make it again from them when read", () => {
        // Act
        for (let index = 0; index < 12; index++) {
            made(`v${index}`, "doc", `line ${index}`, shapes, BUILD);
            versions.settleCall();
        }

        // Assert
        expect(versions.kept).toBe(MAX_DOCUMENT_VERSIONS_KEPT);
        expect([versions.objectAt("v0"), linesOf(versions.documentAt("v0"))]).toEqual([undefined, ["as made", "line 0"]]);
    });

    it("should keep beyond the bounds a version whose named kernel objects the cache no longer holds, since it could not be made again", () => {
        // Arrange
        held.clear();

        // Act
        for (let index = 0; index < 12; index++) {
            made(`v${index}`, "doc", `line ${index}`, shapes, BUILD);
            versions.settleCall();
        }

        // Assert
        expect(versions.kept).toBe(12);
    });

    it("should refuse to make a freed version again once the kernel objects its change named are gone, saying so instead of naming a missing shape", () => {
        // Arrange
        made("v1", "doc", "one", shapes, BUILD);
        made("v2", "v1", "two");
        versions.release("v1");
        versions.release("v2");
        held.clear();

        // Act & Assert
        expect(() => versions.documentAt("v2")).toThrow("was made by 'assembly.manager.buildAssemblyDocument' from shapes or other kernel objects the worker no longer keeps");
    });

    it("should weigh each version by what it holds, after a change that may add labels, and as the version it was made from after one that only sets what labels hold", () => {
        // Arrange
        const many = Array.from({ length: MAX_DOCUMENT_VERSION_LABELS / 2 }, (_, index) => `line ${index}`);
        const grown = (document: Handle_TDocStd_Document): Handle_TDocStd_Document => {
            linesOf(document)?.push(...many);
            return document;
        };

        const call = (make: () => void): void => {
            versions.beginCall();
            make();
            versions.settleCall();
        };

        // Act
        call(() => versions.make(change("v1", "doc", "grown", {}, BUILD), asDocument(originals.get("doc")!), grown));
        call(() => versions.make(change("v2", "v1", "renamed"), versions.documentAt("v1")!, writing("renamed")));
        call(() => versions.make(change("v3", "v2", "renamed again"), versions.documentAt("v2")!, writing("renamed again")));

        // Assert
        expect(weighed).toBe(1);
        expect([versions.kept, versions.objectAt("v1")]).toEqual([2, undefined]);
    });

    it("should keep the object a change under latest took over when the change refuses its inputs, which it does before it changes anything", () => {
        // Arrange
        versions.make({ ...change("v1", "doc", "one"), references: "latest" }, asDocument(originals.get("doc")!), writing("one"));
        versions.answered("v1", "latest");
        versions.settleCall();
        const taken = versions.objectAt("v1")!;
        versions.beginCall();

        // Act
        const refused = (): void => versions.make({ ...change("v2", "v1", "two"), references: "latest" }, taken, () => {
            throw new InputError("`label` names no label", "label");
        });

        // Assert
        expect(refused).toThrow("names no label");
        versions.abandonCall();
        expect([taken.isDeleted(), versions.objectAt("v1"), versions.has("v2")]).toEqual([false, taken, false]);
        expect(linesOf(versions.documentAt("v1"))).toEqual(["as made", "one"]);
    });

    describe("rewriting the references a call reads under latest", () => {
        beforeEach(() => {
            versions.make({ ...change("v1", "doc", "one"), references: "latest" }, asDocument(originals.get("doc")!), writing("one"));
            versions.answered("v1", "latest");
        });

        it("should name the version a document as made reads, at any depth, and leave everything else as it was", () => {
            // Arrange
            const points = [[1, 2, 3], [4, 5, 6]];
            const bytes = new Uint8Array([1, 2]);
            const buffer = new ArrayBuffer(2);
            const handle = { $$: {}, hash: "doc" };
            const given = { document: { type: "occ-document", hash: "doc" }, sources: [{ type: "occ-document", hash: "v1" }, { type: "occ-document", hash: "other" }], nested: { list: [{ type: "occ-document", hash: "doc" }] }, points, bytes, buffer, handle, empty: [], label: "0:1:1:1" };

            // Act
            const read = versions.atVersionsRead(given, "latest");

            // Assert
            expect(read).toEqual({ ...given, document: { type: "occ-document", hash: "v1" }, nested: { list: [{ type: "occ-document", hash: "v1" }] } });
            expect([read.points, read.bytes, read.buffer, read.handle, read.sources]).toEqual([points, bytes, buffer, handle, given.sources]);
            expect(read.sources).toBe(given.sources);
        });

        it("should give back the very value when nothing in it reads another version, and walk nothing under exact", () => {
            // Arrange
            const given = { document: { type: "occ-document", hash: "elsewhere" }, values: [1, 2, 3] };

            // Act & Assert
            expect(versions.atVersionsRead(given, "latest")).toBe(given);
            expect(versions.atVersionsRead({ document: { type: "occ-document", hash: "doc" } }, "exact")).toEqual({ document: { type: "occ-document", hash: "doc" } });
        });

        it("should read the document as made again once a run begins", () => {
            // Act
            versions.beginRun();

            // Assert
            expect(versions.versionRead("doc", "latest")).toBe("doc");
        });
    });

    describe("a call abandoned", () => {
        it("should forget the versions it made, free those it made again, and read the documents as before it", () => {
            // Arrange
            versions.make({ ...change("v1", "doc", "one"), references: "latest" }, asDocument(originals.get("doc")!), writing("one"));
            versions.answered("v1", "latest");
            versions.settleCall();
            versions.release("v1");
            versions.beginCall();

            // Act
            const madeAgain = versions.documentAt("v1");
            versions.make({ ...change("v2", "v1", "two"), references: "latest" }, madeAgain!, writing("two"));
            versions.answered("v2", "latest");
            versions.abandonCall();

            // Assert
            expect([versions.has("v2"), versions.objectAt("v1"), versions.versionRead("doc", "latest")]).toEqual([false, undefined, "v1"]);
            expect(forgottenCalls).toEqual(["call of v2"]);
        });

        it("should free a version it made again that is still kept", () => {
            // Arrange
            made("v1", "doc", "one");
            versions.release("v1");
            versions.beginCall();
            const madeAgain = versions.documentAt("v1");

            // Act
            versions.abandonCall();

            // Assert
            expect([madeAgain?.isDeleted(), versions.kept]).toEqual([true, 0]);
        });
    });
});
