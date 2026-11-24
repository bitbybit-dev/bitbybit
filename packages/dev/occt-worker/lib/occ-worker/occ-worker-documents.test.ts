import { describe, it, expect, beforeEach, vi } from "vitest";
import type { BitbybitOcctModule } from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";
import type { CacheHelper } from "./cache-helper";
import type { DataInput } from "./occ-worker";
import { initializationComplete, onMessageInput } from "./occ-worker";
import type { DocumentReferences } from "./constants";
import { CACHE_THRESHOLD, MAX_DOCUMENT_VERSIONS_KEPT, MAX_DOCUMENT_VERSION_LABELS } from "./constants";

const { FakeDocument, kernelCalls, documentsMade, refusal, helpers } = vi.hoisted(() => {
    type Content = { pmi: number[]; name: string; parts: number };
    const kernelCalls: string[] = [];
    const documentsMade: { isDeleted(): boolean; content: Content }[] = [];
    const refusal: { next: Error | undefined; answer: unknown } = { next: undefined, answer: undefined };
    const helpers: { current: { base: { settings: object } } | undefined; settingsSeen: string[] } = { current: undefined, settingsSeen: [] };
    class FakeDocument {
        readonly $$ = {};
        private deleted = false;

        constructor(readonly content: Content) {
            documentsMade.push(this);
        }

        Main(): object {
            this.mustBeAlive();
            return {};
        }

        IsNull(): boolean {
            this.mustBeAlive();
            return false;
        }

        isDeleted(): boolean {
            return this.deleted;
        }

        delete(): void {
            this.mustBeAlive();
            this.deleted = true;
        }

        private mustBeAlive(): void {
            if (this.deleted) {
                throw new Error("FakeDocument instance already deleted");
            }
        }
    }
    return { FakeDocument, kernelCalls, documentsMade, refusal, helpers };
});

type Document = InstanceType<typeof FakeDocument>;

vi.mock("@bitbybit-dev/occt", () => {
    const noted = <I, R>(path: string, run: (inputs: I) => R) => (inputs: I): R => {
        kernelCalls.push(path);
        return run(inputs);
    };
    const changing = <I extends { document: Document }>(path: string, change: (inputs: I) => void) => noted(path, (inputs: I): unknown => {
        if (refusal.next !== undefined) {
            throw refusal.next;
        }
        change(inputs);
        helpers.settingsSeen.push(JSON.stringify(helpers.current?.base.settings));
        return refusal.answer ?? inputs.document;
    });
    class OCCTService {
        plugins: unknown;
        assembly = {
            manager: {
                loadStepToDoc: noted("loadStepToDoc", ({ stepData }: { stepData: string }): Document => new FakeDocument({ pmi: [], name: "as loaded", parts: stepData.length })),
                buildAssemblyDocument: noted("buildAssemblyDocument", ({ structure, existingDocument, sourceDocuments }: { structure: { name: string }; existingDocument?: Document; sourceDocuments?: Document[] }): Document => {
                    if (existingDocument === undefined) {
                        return new FakeDocument({ pmi: (sourceDocuments ?? []).flatMap(source => source.content.pmi), name: structure.name, parts: 1 });
                    }
                    existingDocument.content.name = structure.name;
                    existingDocument.content.pmi.push(...(sourceDocuments ?? []).flatMap(source => source.content.pmi));
                    return new FakeDocument(existingDocument.content);
                }),
                addDocumentPmi: changing("addDocumentPmi", ({ document, dimensions }: { document: Document; dimensions: number[] }) => {
                    document.content.pmi.push(...dimensions);
                }),
                removeDocumentPmi: changing("removeDocumentPmi", ({ document }: { document: Document }) => {
                    document.content.pmi = [];
                }),
                setDocLabelName: changing("setDocLabelName", ({ document, name }: { document: Document; name: string }) => {
                    document.content.name = name;
                }),
                exportDocumentToStep: noted("exportDocumentToStep", ({ document }: { document: Document }): string => `STEP of ${JSON.stringify({ pmi: document.content.pmi, name: document.content.name })}`),
            },
            query: {
                getDocumentPmi: noted("getDocumentPmi", ({ document }: { document: Document }) => ({ dimensions: [...document.content.pmi] })),
                getLabelInfo: noted("getLabelInfo", ({ document }: { document: Document }) => ({ name: document.content.name })),
                getDocumentParts: ({ document }: { document: Document }) => Array.from({ length: document.content.parts }, () => ({ instanceCount: 0 })),
            },
        };
        docToMesh = noted("docToMesh", ({ document }: { document: Document }) => ({ pmi: [...document.content.pmi] }));
    }
    class OccHelper {
        meshingService = {};
        base = { settings: {} };

        constructor() {
            helpers.current = this;
        }
    }
    return {
        OccHelper,
        OCCTService,
        occtDtoRegistry: {},
        occtDtoRules: new Map(),
        readKernelException: (_kernel: unknown, thrown: unknown): unknown => thrown,
        releaseDesignCaches: (): void => undefined,
    };
});

type Answer = { uid?: string; result?: unknown; error?: string; errorKind?: string };
type Reference = { type: string; hash: number };

const STOP_WORDS = new Int32Array(new SharedArrayBuffer(3 * Int32Array.BYTES_PER_ELEMENT));

const A_MODULE = Object.assign({} as BitbybitOcctModule, {
    CopyDocument: (document: Document): Document => {
        kernelCalls.push("CopyDocument");
        return new FakeDocument(structuredClone(document.content));
    },
    DocumentPmiJson: (document: Document): string => JSON.stringify({ dimensions: document.content.pmi, tolerances: [], datums: [] }),
    ReleaseKeptMeshes: (): void => undefined,
    ProgressControl: (): Int32Array => STOP_WORDS,
});

const STEP_FILE = { stepData: "ISO-10303-21;" };
const PART = "0:1:1:1";

describe("assembly documents through the worker's cache", () => {
    let cacheHelper: CacheHelper;
    let calls = 0;

    const answerTo = (functionName: string, inputs: Record<string, unknown>, documentReferences?: DocumentReferences | string): Answer => {
        const messages: unknown[] = [];
        calls++;
        const call = { action: { functionName, inputs }, uid: `uid-${calls}`, documentReferences } as DataInput;
        onMessageInput(call, (message: unknown) => messages.push(message));
        return messages[messages.length - 1] as Answer;
    };
    const resultOf = <T>(functionName: string, inputs: Record<string, unknown>, documentReferences?: DocumentReferences): T => {
        const answer = answerTo(functionName, inputs, documentReferences);
        expect(answer.error).toBeUndefined();
        return answer.result as T;
    };
    const loaded = (stepData = STEP_FILE.stepData): Reference => resultOf<Reference>("assembly.manager.loadStepToDoc", { stepData });
    const pmiOf = (document: Reference, references?: DocumentReferences): number[] => resultOf<{ dimensions: number[] }>("assembly.query.getDocumentPmi", { document }, references).dimensions;
    const nameOf = (document: Reference, references?: DocumentReferences): string => resultOf<{ name: string }>("assembly.query.getLabelInfo", { document, label: PART }, references).name;
    const stepOf = (document: Reference, references?: DocumentReferences): string => resultOf<string>("assembly.manager.exportDocumentToStep", { document }, references);
    const add = (document: Reference, dimensions: number[], references?: DocumentReferences): Reference => resultOf<Reference>("assembly.manager.addDocumentPmi", { document, dimensions }, references);
    const named = (document: Reference, name: string, references?: DocumentReferences): Reference => resultOf<Reference>("assembly.manager.setDocLabelName", { document, label: PART, name }, references);
    const removed = (document: Reference, references?: DocumentReferences): Reference => resultOf<Reference>("assembly.manager.removeDocumentPmi", { document }, references);
    const startRun = (): void => {
        resultOf("startedTheRun", {});
    };
    const runOf = (dimensions: number[]): { pmi: number[]; step: string } => {
        startRun();
        const document = loaded();
        add(document, dimensions);
        return { pmi: pmiOf(document), step: stepOf(document) };
    };
    const callsTo = (path: string): number => kernelCalls.filter(call => call === path).length;
    const documentsAlive = (): number => documentsMade.filter(document => !document.isDeleted()).length;
    const cachedDocument = (reference: Reference): Document => cacheHelper.checkCache(reference.hash) as Document;
    const step = (pmi: number[], name = "as loaded"): string => `STEP of ${JSON.stringify({ pmi, name })}`;

    beforeEach(() => {
        kernelCalls.length = 0;
        documentsMade.length = 0;
        refusal.next = undefined;
        refusal.answer = undefined;
        helpers.settingsSeen.length = 0;
        Atomics.store(STOP_WORDS, 0, 0);
        cacheHelper = initializationComplete(A_MODULE, undefined, true);
    });

    describe("a call that changes a document", () => {
        it("should change a copy and leave the document its creating call made as it was", () => {
            // Arrange
            const document = loaded();

            // Act
            add(document, [10]);

            // Assert
            expect(cachedDocument(document).content.pmi).toEqual([]);
            expect(pmiOf(document)).toEqual([10]);
            expect(callsTo("CopyDocument")).toBe(1);
        });

        it("should answer a reference to the version it made, which reads the change, as the document read under latest does", () => {
            // Arrange
            const document = loaded();

            // Act
            const changed = add(document, [10]);

            // Assert
            expect(changed).toEqual({ type: "occ-document", hash: expect.any(Number) });
            expect(changed.hash).not.toBe(document.hash);
            expect([pmiOf(changed), pmiOf(document)]).toEqual([[10], [10]]);
            expect([stepOf(changed), nameOf(changed)]).toEqual([stepOf(document), "as loaded"]);
        });

        it("should keep the version a change answered as it was made when a later change of the run applies to the same document", () => {
            // Arrange
            const document = loaded();
            const red = add(document, [10]);

            // Act
            add(document, [11]);

            // Assert
            expect([pmiOf(red), stepOf(red)]).toEqual([[10], step([10])]);
            expect(pmiOf(document)).toEqual([10, 11]);
        });

        it("should apply a change given the answer of the change before on that version, which stays as it was made", () => {
            // Arrange
            const document = loaded();
            const first = add(document, [10]);

            // Act
            const second = add(first, [11]);

            // Assert
            expect([pmiOf(first), pmiOf(second), pmiOf(document)]).toEqual([[10], [10, 11], [10, 11]]);
        });

        it("should answer a build into an existing document with a reference to the version it made, and leave the document as made", () => {
            // Arrange
            const document = resultOf<Reference>("assembly.manager.buildAssemblyDocument", { structure: { name: "first" } });

            // Act
            const built = resultOf<Reference>("assembly.manager.buildAssemblyDocument", { structure: { name: "second" }, existingDocument: document });

            // Assert
            expect(built.hash).not.toBe(document.hash);
            expect([nameOf(built), nameOf(document), nameOf(document, "exact")]).toEqual(["second", "second", "first"]);
            expect(cachedDocument(document).content.name).toBe("first");
            expect(documentsAlive()).toBe(2);
        });

        it("should free the copy of a change the kernel refuses and leave the version it was given as it was", () => {
            // Arrange
            const document = loaded();
            const version = add(document, [10], "exact");
            const aliveBefore = documentsAlive();
            refusal.next = new Error("the kernel refused");

            // Act
            const answer = answerTo("assembly.manager.addDocumentPmi", { document: version, dimensions: [11] }, "exact");

            // Assert
            expect(answer.errorKind).toBe("kernel");
            expect(documentsAlive()).toBe(aliveBefore);
            expect(pmiOf(version, "exact")).toEqual([10]);
        });

        it("should free the object a refused change took over, which may be half changed, and make the version it read again when read", () => {
            // Arrange
            const document = loaded();
            const version = add(document, [10]);
            refusal.next = new Error("the kernel refused");

            // Act
            const answer = answerTo("assembly.manager.addDocumentPmi", { document, dimensions: [11] });
            refusal.next = undefined;

            // Assert
            expect(answer.errorKind).toBe("kernel");
            expect(cacheHelper.documents.objectAt(version.hash)).toBeUndefined();
            expect([pmiOf(document), pmiOf(version)]).toEqual([[10], [10]]);
        });

        it("should refuse a change that answers something other than a document, and keep nothing it made", () => {
            // Arrange
            const document = loaded();
            const aliveBefore = documentsAlive();
            refusal.answer = { document: "not a handle", extra: new FakeDocument({ pmi: [], name: "made beside", parts: 1 }) };

            // Act
            const answer = answerTo("assembly.manager.addDocumentPmi", { document, dimensions: [10] });

            // Assert
            expect(answer.error).toContain("'assembly.manager.addDocumentPmi' changes a document but answered something else, so nothing it made was kept");
            expect(documentsAlive()).toBe(aliveBefore);
            expect(pmiOf(document)).toEqual([]);
        });

        it("should leave the copy of a change that crashed the kernel alone, and report the crash as it was", () => {
            // Arrange
            const document = loaded();
            refusal.next = new (Reflect.get(WebAssembly, "RuntimeError") as new (message: string) => Error)("memory access out of bounds");

            // Act
            const answer = answerTo("assembly.manager.addDocumentPmi", { document, dimensions: [10] });

            // Assert
            expect(answer.errorKind).toBe("crash");
            expect(answer.error).toContain("memory access out of bounds");
            expect(documentsAlive()).toBe(2);
        });

        it("should refuse a change of a document the cache does not hold", () => {
            // Act
            const answer = answerTo("assembly.manager.addDocumentPmi", { document: { type: "occ-document", hash: 404 }, dimensions: [10] });

            // Assert
            expect(answer.error).toContain("Document with hash 404 not found in cache");
            expect(callsTo("CopyDocument")).toBe(0);
        });
    });

    describe("how each call reads a document reference", () => {
        it("should read the document as made, for a call sent with exact, after changes sent with latest", () => {
            // Arrange
            const document = loaded();
            add(document, [10]);

            // Act
            const read = [pmiOf(document, "exact"), pmiOf(document, "latest"), pmiOf(document)];

            // Assert
            expect(read).toEqual([[], [10], [10]]);
        });

        it("should keep each branch of a graph reading its own version when another caller starts a run and changes the document under latest", () => {
            // Arrange
            const document = loaded();
            const measured = add(document, [10], "exact");
            const renamed = named(document, "Left", "exact");

            // Act
            startRun();
            add(document, [11]);

            // Assert
            expect([nameOf(renamed, "exact"), pmiOf(renamed, "exact")]).toEqual(["Left", []]);
            expect([nameOf(measured, "exact"), pmiOf(measured, "exact")]).toEqual(["as loaded", [10]]);
            expect(pmiOf(renamed)).toEqual([]);
        });

        it("should apply a change sent with exact to the document as made, and keep the version latest reads", () => {
            // Arrange
            const document = loaded();
            add(document, [10]);

            // Act
            const branch = add(document, [11], "exact");

            // Assert
            expect([pmiOf(branch), pmiOf(document)]).toEqual([[11], [10]]);
        });

        it("should refuse a call that names another way of reading references, and make nothing", () => {
            // Arrange
            const document = loaded();

            // Act
            const answer = answerTo("assembly.manager.addDocumentPmi", { document, dimensions: [10] }, "newest");

            // Assert
            expect(answer.errorKind).toBe("input");
            expect(answer.error).toContain("`documentReferences` is \"newest\"; it is latest or exact, or left out for latest");
            expect([callsTo("CopyDocument"), pmiOf(document)]).toEqual([0, []]);
        });

        it("should draw the document a call reads, as the change of the run left it or as made", () => {
            // Arrange
            const document = loaded();
            add(document, [10]);

            // Act
            const drawn = [resultOf("docToMesh", { document }), resultOf("docToMesh", { document }, "exact")];

            // Assert
            expect(drawn).toEqual([{ pmi: [10] }, { pmi: [] }]);
        });

        it("should read a document named inside a list, as a build names its source documents, as the changes of the run left it", () => {
            // Arrange
            const source = loaded();
            add(source, [10]);

            // Act
            const built = resultOf<Reference>("assembly.manager.buildAssemblyDocument", { structure: { name: "from sources" }, sourceDocuments: [source] });

            // Assert
            expect(pmiOf(built)).toEqual([10]);
        });

        it("should make the same change twice when a run asks for it twice, as the document itself would take it", () => {
            // Arrange
            const document = loaded();

            // Act
            add(document, [10]);
            add(document, [10]);

            // Assert
            expect(pmiOf(document)).toEqual([10, 10]);
        });

        it("should read, without a run having started, the changes made before, each made on the one before it", () => {
            // Arrange
            const document = loaded();
            add(document, [10]);

            // Act
            const afterOne = pmiOf(document);
            add(document, [11]);

            // Assert
            expect([afterOne, pmiOf(document)]).toEqual([[10], [10, 11]]);
        });
    });

    describe("a run made again", () => {
        it("should start each run from the document as its creating call made it", () => {
            // Arrange
            runOf([10]);

            // Act
            const again = runOf([11]);

            // Assert
            expect(again.pmi).toEqual([11]);
        });

        it("should read the document as it was made in a run that no longer changes it", () => {
            // Arrange
            runOf([10]);
            startRun();

            // Act
            const document = loaded();

            // Assert
            expect([pmiOf(document), stepOf(document)]).toEqual([[], step([])]);
        });

        it("should answer a run made again unchanged from the cache, its change and its export included", () => {
            // Arrange
            const first = runOf([10]);

            // Act
            const again = runOf([10]);

            // Assert
            expect(again).toEqual(first);
            expect([callsTo("CopyDocument"), callsTo("addDocumentPmi"), callsTo("exportDocumentToStep")]).toEqual([1, 1, 1]);
        });

        it("should export a changed document again, and answer the export from the cache once the change it had is back", () => {
            // Arrange
            const ten = runOf([10]);
            const eleven = runOf([11]);

            // Act
            const tenAgain = runOf([10]);

            // Assert
            expect([ten.step, eleven.step, tenAgain.step]).toEqual([step([10]), step([11]), step([10])]);
            expect([callsTo("CopyDocument"), callsTo("exportDocumentToStep")]).toEqual([2, 2]);
        });

        it("should give a script that passes each change's answer on what a script that ignores the answers gives, from the cache on the runs after", () => {
            // Arrange
            const ignoringAnswers = (): string => {
                startRun();
                const document = loaded();
                add(document, [10]);
                named(document, "Left");
                return stepOf(document);
            };
            const usingAnswers = (): string => {
                startRun();
                return stepOf(named(add(loaded(), [10]), "Left"));
            };

            // Act
            const steps = [ignoringAnswers(), usingAnswers(), ignoringAnswers(), usingAnswers()];

            // Assert
            expect(new Set(steps)).toEqual(new Set([step([10], "Left")]));
            expect([callsTo("CopyDocument"), callsTo("addDocumentPmi"), callsTo("setDocLabelName"), callsTo("exportDocumentToStep")]).toEqual([1, 1, 1, 1]);
        });

        it("should read a version an earlier run made as it was made, whatever the run now reading it changed", () => {
            // Arrange
            startRun();
            const document = loaded();
            const changed = add(document, [10]);

            // Act
            startRun();
            add(document, [11]);
            const read = pmiOf(changed);

            // Assert
            expect(read).toEqual([10]);
        });

        it("should give, for a removal and an addition, the addition alone on every run", () => {
            // Arrange
            const runWithRemoval = (dimensions: number[]): number[] => {
                startRun();
                const document = loaded();
                removed(document);
                add(document, dimensions);
                return pmiOf(document);
            };

            // Act
            const runs = [[10], [10], [11], [10]].map(runWithRemoval);

            // Assert
            expect(runs).toEqual([[10], [10], [11], [10]]);
        });
    });

    describe("a dataflow graph, every call sent with exact", () => {
        const branchesOf = (document: Reference, value: number): { measured: Reference; renamed: Reference } => ({
            measured: add(document, [value], "exact"),
            renamed: named(document, "Left", "exact"),
        });
        const stepsOf = (branches: { measured: Reference; renamed: Reference }): [string, string] => [stepOf(branches.measured, "exact"), stepOf(branches.renamed, "exact")];

        it("should keep two branches made from one document apart, each exporting its own change alone", () => {
            // Arrange
            const document = loaded();

            // Act
            const branches = branchesOf(document, 10);

            // Assert
            expect(stepsOf(branches)).toEqual([step([10]), step([], "Left")]);
            expect([nameOf(branches.measured, "exact"), pmiOf(branches.renamed, "exact"), pmiOf(document, "exact")]).toEqual(["as loaded", [], []]);
        });

        it("should give, when only the branch whose value changed runs again, what running every call again gives", () => {
            // Arrange
            const document = loaded();
            const before = branchesOf(document, 10);
            const renamedStep = stepOf(before.renamed, "exact");

            // Act
            const measuredAgain = add(document, [11], "exact");
            const partly = [stepOf(measuredAgain, "exact"), renamedStep];
            initializationComplete(A_MODULE, undefined, true);
            const fully = stepsOf(branchesOf(loaded(), 11));

            // Assert
            expect(partly).toEqual(fully);
            expect(fully).toEqual([step([11]), step([], "Left")]);
        });

        it("should answer an unchanged change and its export from the cache with the version made before, and a changed one with a new version", () => {
            // Arrange
            const document = loaded();
            const first = add(document, [10], "exact");
            stepOf(first, "exact");

            // Act
            const same = add(document, [10], "exact");
            const sameStep = stepOf(same, "exact");
            const other = add(document, [11], "exact");

            // Assert
            expect(same).toEqual(first);
            expect(other.hash).not.toBe(first.hash);
            expect(sameStep).toBe(step([10]));
            expect([callsTo("CopyDocument"), callsTo("addDocumentPmi"), callsTo("exportDocumentToStep")]).toEqual([2, 2, 1]);
        });

        it("should apply a change to the version it is given, along a chain of changes, and make the chain again only from the change whose value changed", () => {
            // Arrange
            const document = loaded();
            const cleared = removed(document, "exact");
            add(cleared, [10], "exact");

            // Act
            const chained = add(removed(document, "exact"), [11], "exact");

            // Assert
            expect(pmiOf(chained, "exact")).toEqual([11]);
            expect([callsTo("removeDocumentPmi"), callsTo("addDocumentPmi"), callsTo("CopyDocument")]).toEqual([1, 2, 3]);
        });

        it("should keep reading every reference exactly after a run past the cache threshold resets the cache", () => {
            // Arrange
            Object.assign(cacheHelper.usedHashes, Object.fromEntries(Array.from({ length: CACHE_THRESHOLD + 1 }, (_, index) => [`outgrown-${index}`, index])));
            startRun();

            // Act
            const branches = branchesOf(loaded(), 10);

            // Assert
            expect(stepsOf(branches)).toEqual([step([10]), step([], "Left")]);
        });

        it("should read each call as it was sent on the kernel the worker restarts after a crash", async () => {
            // Arrange
            const restart = (): void => {
                cacheHelper = initializationComplete(A_MODULE, undefined, true, restart);
            };
            cacheHelper = initializationComplete(A_MODULE, undefined, true, restart);
            refusal.next = new (Reflect.get(WebAssembly, "RuntimeError") as new (message: string) => Error)("memory access out of bounds");
            const crashed = answerTo("assembly.manager.addDocumentPmi", { document: loaded(), dimensions: [10] }, "exact");
            refusal.next = undefined;
            await new Promise(resolve => setTimeout(resolve, 0));

            // Act
            const branches = branchesOf(loaded(), 10);

            // Assert
            expect(crashed.errorKind).toBe("crash");
            expect(stepsOf(branches)).toEqual([step([10]), step([], "Left")]);
        });
    });

    describe("the versions a document's changes made", () => {
        it("should take the version over in place when a change sent with latest applies to the version the document reads in the run, making one copy for a run of changes", () => {
            // Arrange
            startRun();
            const document = loaded();

            // Act
            for (let value = 0; value < 20; value++) {
                add(document, [value]);
            }

            // Assert
            expect(callsTo("CopyDocument")).toBe(1);
            expect(documentsAlive()).toBe(2);
            expect(pmiOf(document)).toEqual(Array.from({ length: 20 }, (_, value) => value));
        });

        it("should make a version that was taken over again from its changes when something reads it, and keep it", () => {
            // Arrange
            startRun();
            const document = loaded();
            const first = removed(document);
            const second = add(document, [1]);
            add(document, [2]);
            const before = [callsTo("CopyDocument"), callsTo("removeDocumentPmi"), callsTo("addDocumentPmi")];

            // Act
            const read = [pmiOf(second), pmiOf(second), pmiOf(first)];

            // Assert
            expect(before).toEqual([1, 1, 2]);
            expect(read).toEqual([[1], [1], []]);
            expect([callsTo("CopyDocument"), callsTo("removeDocumentPmi"), callsTo("addDocumentPmi")]).toEqual([3, 3, 3]);
            expect(cacheHelper.documents.objectAt(second.hash)).toBeDefined();
        });

        it("should take nothing over for a change sent with exact, so a graph's branches each copy the version they change", () => {
            // Arrange
            const document = loaded();
            const first = add(document, [1], "exact");

            // Act
            const second = add(first, [2], "exact");

            // Assert
            expect(callsTo("CopyDocument")).toBe(2);
            expect([cacheHelper.documents.objectAt(first.hash), cacheHelper.documents.objectAt(second.hash)].every(kept => kept !== undefined)).toBe(true);
        });

        it("should make a version again from the nearest version kept, not from the document as made", () => {
            // Arrange
            const document = loaded();
            const first = add(document, [1], "exact");
            const second = add(first, [2], "exact");
            resultOf("releaseDocumentVersions", { documents: [second] });
            const additions = callsTo("addDocumentPmi");

            // Act
            const read = pmiOf(second, "exact");

            // Assert
            expect(read).toEqual([1, 2]);
            expect(callsTo("addDocumentPmi")).toBe(additions + 1);
        });

        it("should copy a version a change of the run gave before the latest, rather than take it over", () => {
            // Arrange
            startRun();
            const document = loaded();
            const red = add(document, [1]);
            add(document, [2]);
            pmiOf(red);
            const copies = callsTo("CopyDocument");

            // Act
            const fromRed = add(red, [3]);

            // Assert
            expect(callsTo("CopyDocument")).toBe(copies + 1);
            expect([pmiOf(fromRed), pmiOf(red), pmiOf(document)]).toEqual([[1, 3], [1], [1, 3]]);
            expect(cacheHelper.documents.objectAt(red.hash)).toBeDefined();
        });

        it("should copy, never take over, a version whose change names other documents, though it is the latest of the run", () => {
            // Arrange
            startRun();
            const source = loaded();
            const document = loaded("another file");
            const built = resultOf<Reference>("assembly.manager.buildAssemblyDocument", { structure: { name: "built" }, existingDocument: document, sourceDocuments: [source] });

            // Act
            const renamed = named(document, "Renamed");

            // Assert
            expect(callsTo("CopyDocument")).toBe(2);
            expect([nameOf(built), nameOf(renamed), nameOf(document)]).toEqual(["built", "Renamed", "Renamed"]);
        });

        it("should make a version again under the settings its change ran under, and work by the settings in force after", () => {
            // Arrange
            resultOf("setSettings", { coordinateSystem: "leftHanded" });
            const document = loaded();
            const version = add(document, [1], "exact");
            resultOf("setSettings", {});
            resultOf("releaseDocumentVersions", { documents: [version] });

            // Act
            const read = pmiOf(version, "exact");
            add(document, [2], "exact");

            // Assert
            expect(read).toEqual([1]);
            expect(helpers.settingsSeen).toEqual(["{\"coordinateSystem\":\"leftHanded\"}", "{\"coordinateSystem\":\"leftHanded\"}", "{}"]);
        });

        it("should keep at most the bound of one document's versions as objects, and read every version as it was made", () => {
            // Arrange
            const document = loaded();
            const values = Array.from({ length: MAX_DOCUMENT_VERSIONS_KEPT * 3 }, (_, value) => value);

            // Act
            const versions = values.map(value => add(document, [value], "exact"));
            const keptAfterChanges = cacheHelper.documents.kept;
            const read = versions.map(version => pmiOf(version, "exact"));

            // Assert
            expect(keptAfterChanges).toBe(MAX_DOCUMENT_VERSIONS_KEPT);
            expect(cacheHelper.documents.kept).toBe(MAX_DOCUMENT_VERSIONS_KEPT);
            expect(documentsAlive()).toBe(1 + MAX_DOCUMENT_VERSIONS_KEPT);
            expect(read).toEqual(values.map(value => [value]));
        });

        it("should keep the versions of all documents within the bound of labels, each weighed by its parts and its PMI, the least recently used freed first", () => {
            // Arrange
            const dimensionEach = 1;
            const labelsEach = MAX_DOCUMENT_VERSION_LABELS / 4 - dimensionEach;
            const documents = ["a", "b", "c"].map(name => loaded(name.repeat(labelsEach)));

            // Act
            const versions = documents.flatMap(document => [1, 2].map(value => add(document, [value], "exact")));
            const kept = cacheHelper.documents.kept;
            const lastRead = pmiOf(versions[0]!, "exact");

            // Assert
            expect(kept).toBe(4);
            expect(lastRead).toEqual([1]);
            expect(cacheHelper.documents.objectAt(versions[0]!.hash)).toBeDefined();
            expect(cacheHelper.documents.objectAt(versions[1]!.hash)).toBeUndefined();
        });

        it("should free beyond the bound a version whose change names other documents while the cache holds them, take none over, and make it again from them when read", () => {
            // Arrange
            startRun();
            const source = loaded();
            const document = loaded("another file");
            const builds: Reference[] = [];

            // Act
            for (let index = 0; index < MAX_DOCUMENT_VERSIONS_KEPT + 2; index++) {
                builds.push(resultOf<Reference>("assembly.manager.buildAssemblyDocument", { structure: { name: `build ${index}` }, existingDocument: document, sourceDocuments: [source] }));
            }

            // Assert
            expect(callsTo("CopyDocument")).toBe(MAX_DOCUMENT_VERSIONS_KEPT + 2);
            expect(builds.filter(build => cacheHelper.documents.objectAt(build.hash) !== undefined)).toHaveLength(MAX_DOCUMENT_VERSIONS_KEPT);
            expect(nameOf(builds[0]!)).toBe("build 0");
        });

        it("should release the versions a graph no longer holds, and make one again when it is read, passing over a document as made", () => {
            // Arrange
            const document = loaded();
            const version = add(document, [10], "exact");
            const aliveBefore = documentsAlive();

            // Act
            resultOf("releaseDocumentVersions", { documents: [version, document, { type: "occ-shape", hash: 1 }] });
            const aliveAfter = documentsAlive();
            const read = pmiOf(version, "exact");

            // Assert
            expect([aliveBefore, aliveAfter]).toEqual([2, 1]);
            expect(read).toEqual([10]);
            expect(pmiOf(document, "exact")).toEqual([]);
        });

        it("should refuse a release that names no list", () => {
            // Act
            const answer = answerTo("releaseDocumentVersions", { documents: "all" });

            // Assert
            expect(answer.errorKind).toBe("input");
            expect(answer.error).toContain("`documents` is not a list of assembly document references");
        });

        it("should free one version alone when the caller deletes it, leaving the document and its other branches whole", () => {
            // Arrange
            const document = loaded();
            const measured = add(document, [10], "exact");
            const renamed = named(document, "Left", "exact");

            // Act
            resultOf("deleteDocument", { document: measured });

            // Assert
            expect(documentsAlive()).toBe(2);
            expect([nameOf(renamed, "exact"), pmiOf(document, "exact"), pmiOf(measured, "exact")]).toEqual(["Left", [], [10]]);
        });

        it("should free the document with every version made from it, versions of versions included, when the document as made is deleted", () => {
            // Arrange
            const document = loaded();
            const chained = add(removed(document, "exact"), [10], "exact");
            add(document, [11], "exact");

            // Act
            resultOf("deleteDocument", { document });

            // Assert
            expect(documentsAlive()).toBe(0);
            expect(answerTo("assembly.query.getDocumentPmi", { document }).error).toContain(`Document with hash ${document.hash} not found in cache`);
            expect(answerTo("assembly.query.getDocumentPmi", { document: chained }).error).toContain(`Document with hash ${chained.hash} not found in cache`);
        });

        it("should refuse a delete that names no document", () => {
            // Act
            const answer = answerTo("deleteDocument", { document: "doc" });

            // Assert
            expect(answer.errorKind).toBe("input");
        });

        it("should refuse to read a version not kept once the document it is made from is gone", () => {
            // Arrange
            const document = loaded();
            const version = add(document, [10], "exact");
            resultOf("releaseDocumentVersions", { documents: [version] });

            // Act
            cacheHelper.cleanCacheForHash(String(document.hash));
            const answer = answerTo("assembly.query.getDocumentPmi", { document: version });

            // Assert
            expect(answer.error).toContain(`Document with hash ${version.hash} not found in cache`);
        });

        it("should change the document again on a run after the caller deleted it and made it again", () => {
            // Arrange
            runOf([10]);
            resultOf("deleteDocument", { document: loaded() });

            // Act
            const again = runOf([10]);

            // Assert
            expect(again.pmi).toEqual([10]);
            expect(callsTo("CopyDocument")).toBe(2);
        });

        it("should free every version when the cache is cleaned, and change a document made again on the next run", () => {
            // Arrange
            runOf([10]);

            // Act
            resultOf("cleanAllCache", {});
            const aliveAfterTheClean = documentsAlive();
            const next = runOf([10]);

            // Assert
            expect([aliveAfterTheClean, next.pmi]).toEqual([0, [10]]);
        });

        it("should read a document made again after the cache is cleaned in the middle of a run as it was made", () => {
            // Arrange
            add(loaded(), [10]);

            // Act
            resultOf("cleanAllCache", {});
            const madeAgain = loaded();

            // Assert
            expect(pmiOf(madeAgain)).toEqual([]);
        });

        it("should free every version when a run past the cache threshold resets the cache", () => {
            // Arrange
            runOf([10]);
            Object.assign(cacheHelper.usedHashes, Object.fromEntries(Array.from({ length: CACHE_THRESHOLD + 1 }, (_, index) => [`outgrown-${index}`, index])));

            // Act
            startRun();

            // Assert
            expect(documentsAlive()).toBe(0);
        });
    });

    describe("a call stopped", () => {
        it("should keep nothing a change made when the stop lands after its version was stored, and read the document as the run's changes before it left it", () => {
            // Arrange
            startRun();
            const document = loaded();
            const before = add(document, [1]);
            const store = cacheHelper.addToCache.bind(cacheHelper);
            cacheHelper.addToCache = (hash: string | number, entry: unknown): string | number => {
                if (typeof entry === "object" && entry !== null && "madeVersion" in entry) {
                    Atomics.store(STOP_WORDS, 0, 1);
                }
                return store(hash, entry);
            };
            const aliveBefore = documentsAlive();

            // Act
            const stopped = answerTo("assembly.manager.addDocumentPmi", { document, dimensions: [10] });
            Atomics.store(STOP_WORDS, 0, 0);
            cacheHelper.addToCache = store;
            const aliveAfter = documentsAlive();
            const read = pmiOf(document);
            const again = add(document, [10]);

            // Assert
            expect(stopped.errorKind).toBe("cancelled");
            expect(stopped.error).toContain("nothing it made was kept");
            expect([aliveBefore, aliveAfter, read]).toEqual([2, 1, [1]]);
            expect([pmiOf(again), pmiOf(before), callsTo("CopyDocument")]).toEqual([[1, 10], [1], 2]);
        });

        it("should keep the document reading as it did when a change answered from the cache is stopped", () => {
            // Arrange
            startRun();
            const document = loaded();
            add(document, [10]);
            startRun();
            Atomics.store(STOP_WORDS, 0, 1);

            // Act
            const stopped = answerTo("assembly.manager.addDocumentPmi", { document, dimensions: [10] });
            Atomics.store(STOP_WORDS, 0, 0);

            // Assert
            expect(stopped.errorKind).toBe("cancelled");
            expect(pmiOf(document)).toEqual([]);
        });

        it("should free a version made again for a call that is stopped, and take over nothing", () => {
            // Arrange
            const document = loaded();
            const version = add(document, [10], "exact");
            resultOf("releaseDocumentVersions", { documents: [version] });
            const aliveBefore = documentsAlive();
            const read = cacheHelper.documents.documentAt.bind(cacheHelper.documents);
            vi.spyOn(cacheHelper.documents, "documentAt").mockImplementation((hash) => {
                const made = read(hash);
                Atomics.store(STOP_WORDS, 0, 1);
                return made;
            });

            // Act
            const stopped = answerTo("assembly.query.getDocumentPmi", { document: version }, "exact");
            Atomics.store(STOP_WORDS, 0, 0);

            // Assert
            expect(stopped.errorKind).toBe("cancelled");
            expect(documentsAlive()).toBe(aliveBefore);
            expect(cacheHelper.documents.kept).toBe(0);
        });

        it("should free what a stopped change took over of a version it made again first", () => {
            // Arrange
            startRun();
            const document = loaded();
            const first = add(document, [1]);
            resultOf("releaseDocumentVersions", { documents: [first] });
            const aliveBefore = documentsAlive();
            Atomics.store(STOP_WORDS, 0, 1);

            // Act
            const stopped = answerTo("assembly.manager.addDocumentPmi", { document, dimensions: [2] });
            Atomics.store(STOP_WORDS, 0, 0);

            // Assert
            expect(stopped.errorKind).toBe("cancelled");
            expect([documentsAlive(), cacheHelper.documents.kept]).toEqual([aliveBefore, 0]);
            expect(pmiOf(document)).toEqual([1]);
        });

        it("should free the object a stopped change took over, and make the version it read again when read", () => {
            // Arrange
            startRun();
            const document = loaded();
            const first = add(document, [1]);
            Atomics.store(STOP_WORDS, 0, 1);

            // Act
            const stopped = answerTo("assembly.manager.addDocumentPmi", { document, dimensions: [2] });
            Atomics.store(STOP_WORDS, 0, 0);

            // Assert
            expect(stopped.errorKind).toBe("cancelled");
            expect([callsTo("CopyDocument"), callsTo("addDocumentPmi")]).toEqual([1, 2]);
            expect(cacheHelper.documents.objectAt(first.hash)).toBeUndefined();
            expect([pmiOf(first), pmiOf(document)]).toEqual([[1], [1]]);
        });
    });
});
