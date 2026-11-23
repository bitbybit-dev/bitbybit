import { describe, it, expect, beforeAll, beforeEach, afterEach } from "vitest";
import type { BitbybitOcctModule } from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";
import initOpenCascade from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";
import { Inputs } from "@bitbybit-dev/occt";
import { namesOf, openWindow, watchModule } from "../../../__test__/embind-ledger";
import { OCCT_LEDGER } from "../../../__test__/kernel-ledger-options";
import type { CacheHelper } from "./cache-helper";
import type { DataInput } from "./occ-worker";
import { initializationComplete, onMessageInput } from "./occ-worker";
import { OCCTWorkerManager } from "./occ-worker-manager";
import { MAX_DOCUMENT_VERSIONS_KEPT } from "./constants";
import { OCCT } from "../api/occt/occt";

type Document = Inputs.OCCT.TDocStdDocumentPointer;
type Assembly = { document: Document; labels: string[] };

const COUNTED_KERNEL_CALLS = ["CopyDocument", "SetDocLabelColor", "SetDocLabelName", "AddDocumentPmiJson", "ExportDocumentToStep"] as const;
type CountedKernelCall = typeof COUNTED_KERNEL_CALLS[number];

const DOCUMENT_CLASS = "Handle_TDocStd_Document";
const MEGABYTE = 1024 * 1024;
const MANY_PARTS = 300;
const SLIDER_RUNS = 14;
const SLIDER_VALUES = 20;
const CHANNEL_STEPS = 1e6;

class KernelWorker extends EventTarget implements Worker {
    onmessage: Worker["onmessage"] = null;
    onmessageerror: Worker["onmessageerror"] = null;
    onerror: Worker["onerror"] = null;

    postMessage(message: DataInput): void {
        onMessageInput(structuredClone(message), (data: unknown) => {
            this.onmessage?.({ data: structuredClone(data) } as MessageEvent);
        });
    }

    terminate(): void {
        this.onmessage = null;
    }
}

const messageOf = (error: unknown): string => error instanceof Error ? error.message : String(error);

describe("the memory and the readings of assembly document versions, on the real kernel", () => {
    let kernel: BitbybitOcctModule;
    let cacheHelper: CacheHelper;
    let manager: OCCTWorkerManager;
    let occt: OCCT;
    const kernelCalls = new Map<CountedKernelCall, number>();

    beforeAll(async () => {
        kernel = await initOpenCascade();
        watchModule(kernel, OCCT_LEDGER);
        COUNTED_KERNEL_CALLS.forEach(name => {
            const original = (Reflect.get(kernel, name) as (...args: unknown[]) => unknown).bind(kernel);
            Reflect.set(kernel, name, (...args: unknown[]): unknown => {
                kernelCalls.set(name, (kernelCalls.get(name) ?? 0) + 1);
                return original(...args);
            });
        });
    });

    beforeEach(() => {
        kernelCalls.clear();
        cacheHelper = initializationComplete(kernel, undefined, true);
        manager = new OCCTWorkerManager();
        manager.setOccWorker(new KernelWorker());
        occt = new OCCT(manager);
    });

    afterEach(() => {
        cacheHelper.cleanAllCache();
    });

    const callsSoFar = (): Record<CountedKernelCall, number> =>
        Object.fromEntries(COUNTED_KERNEL_CALLS.map(name => [name, kernelCalls.get(name) ?? 0])) as Record<CountedKernelCall, number>;

    const assemblyOf = async (count: number): Promise<Assembly> => {
        const parts = [];
        const nodes = [];
        for (let index = 0; index < count; index++) {
            const box = await occt.shapes.solid.createBox({ width: 1, length: 1, height: 1 + index * 0.01, center: [index * 2, 0, 0] });
            parts.push(await occt.assembly.manager.createPart({ id: `p${index}`, shape: box, name: `Part ${index}` }));
            nodes.push(await occt.assembly.manager.createInstanceNode({ id: `n${index}`, partId: `p${index}`, name: `Node ${index}`, translation: [0, 0, 0] }));
        }
        const structure = await occt.assembly.manager.combineStructure({ parts, nodes, clearDocument: false });
        const document = await occt.assembly.manager.buildAssemblyDocument({ structure });
        const found = await occt.assembly.query.getDocumentParts({ document });
        return { document, labels: found.filter(entry => entry.type === "part").map(entry => entry.label) };
    };

    const documentsAliveIn = (opened: ReturnType<typeof openWindow>): number =>
        namesOf(opened.made().filter(handle => !handle.isDeleted())).filter(name => name === DOCUMENT_CLASS).length;

    const colouredEach = async ({ document, labels }: Assembly, red: number): Promise<void> => {
        for (const label of labels) {
            await occt.assembly.manager.setDocLabelColor({ document, label, r: red, g: 0, b: 0, a: 1 });
        }
    };

    const thickness = (part: string, value: number): Inputs.OCCT.PmiDimensionDto => ({
        type: Inputs.OCCT.pmiDimensionTypeEnum.linearDistance,
        value,
        shapeRefs: [{ part, kind: Inputs.OCCT.pmiShapeKindEnum.face, index: 5 }],
        otherShapeRefs: [{ part, kind: Inputs.OCCT.pmiShapeKindEnum.face, index: 4 }],
        name: "thickness",
    });

    const valuesExported = async (document: Document): Promise<number[]> => {
        const step = await occt.assembly.manager.exportDocumentToStep({ document, fileName: "box.step", author: "", organization: "", compress: false, tryDownload: false });
        const read = await occt.assembly.manager.loadStepToDoc({ stepData: step });
        return (await occt.assembly.query.getDocumentPmi({ document: read })).dimensions.map(dimension => dimension.value);
    };

    const redOf = async (document: Document, label: string): Promise<number> =>
        Math.round((await occt.assembly.query.getLabelColor({ document, label })).r * CHANNEL_STEPS) / CHANNEL_STEPS;

    describe("a script that changes a document part by part", () => {
        it("should colour each part of a 300-part assembly in one run on one copy of it", async () => {
            // Arrange
            await manager.startedTheRun();
            const assembly = await assemblyOf(MANY_PARTS);
            const opened = openWindow();
            const heapBefore = kernel.HeapBytesInUse();

            // Act
            try {
                await manager.startedTheRun();
                await colouredEach(assembly, 1);
            } finally {
                opened.close();
            }

            // Assert
            expect(callsSoFar().CopyDocument).toBe(1);
            expect(documentsAliveIn(opened)).toBe(1);
            expect(kernel.HeapBytesInUse() - heapBefore).toBeLessThan(2 * MEGABYTE);
            expect(await redOf(assembly.document, assembly.labels[MANY_PARTS - 1]!)).toBe(1);
        });

        it("should keep the kernel's memory flat while a slider colours each of 300 parts again, run after run", async () => {
            // Arrange
            await manager.startedTheRun();
            const assembly = await assemblyOf(MANY_PARTS);
            const heaps: number[] = [];

            // Act
            for (let run = 0; run < SLIDER_RUNS; run++) {
                await manager.startedTheRun();
                await colouredEach(assembly, run / SLIDER_RUNS);
                heaps.push(kernel.HeapBytesInUse());
            }

            // Assert
            expect(heaps[SLIDER_RUNS - 1]! - heaps[0]!).toBeLessThan(MAX_DOCUMENT_VERSIONS_KEPT * MEGABYTE);
            expect(cacheHelper.documents.kept).toBeLessThanOrEqual(MAX_DOCUMENT_VERSIONS_KEPT);
            expect(callsSoFar().CopyDocument).toBe(SLIDER_RUNS);
            expect(await redOf(assembly.document, assembly.labels[0]!)).toBeCloseTo((SLIDER_RUNS - 1) / SLIDER_RUNS, 6);
        });

        it("should answer an unchanged run again with no kernel call, its colourings and its export included", async () => {
            // Arrange
            const run = async (): Promise<Uint8Array> => {
                await manager.startedTheRun();
                const assembly = await assemblyOf(3);
                await colouredEach(assembly, 1);
                return occt.assembly.manager.exportDocumentToStep({ document: assembly.document, fileName: "a.step", author: "", organization: "", compress: false, tryDownload: false });
            };
            const first = await run();
            const afterFirst = callsSoFar();

            // Act
            const again = await run();

            // Assert
            expect(afterFirst).toEqual({ CopyDocument: 1, SetDocLabelColor: 3, SetDocLabelName: 0, AddDocumentPmiJson: 0, ExportDocumentToStep: 1 });
            expect(callsSoFar()).toEqual(afterFirst);
            expect(again).toEqual(first);
        });

        it("should hold at most the bound of a document's versions alive while a slider builds a part into one document, run after run, and make the first run's version again from its shapes", async () => {
            // Arrange
            const built = async (height: number): Promise<{ document: Document; version: Document }> => {
                const { document } = await assemblyOf(3);
                const box = await occt.shapes.solid.createBox({ width: 1, length: 1, height, center: [0, 0, 0] });
                const part = await occt.assembly.manager.createPart({ id: "extra", shape: box, name: "Extra" });
                const node = await occt.assembly.manager.createInstanceNode({ id: "x", partId: "extra", name: "X", translation: [0, 5, 0] });
                const structure = await occt.assembly.manager.combineStructure({ parts: [part], nodes: [node], clearDocument: false });
                return { document, version: await occt.assembly.manager.buildAssemblyDocument({ structure, existingDocument: document }) };
            };
            const versions: Document[] = [];

            // Act
            for (let run = 0; run < SLIDER_VALUES; run++) {
                await manager.startedTheRun();
                versions.push((await built(1 + run)).version);
            }
            const first = await occt.assembly.query.getDocumentParts({ document: versions[0]! });

            // Assert
            expect(cacheHelper.documents.kept).toBeLessThanOrEqual(MAX_DOCUMENT_VERSIONS_KEPT);
            expect(first.filter(entry => entry.type === "part").map(entry => entry.name)).toContain("Extra");
        });

        it("should keep the document a run changed part by part when one change of it refuses a label, and read it again with no change replayed", async () => {
            // Arrange
            await manager.startedTheRun();
            const assembly = await assemblyOf(5);
            await colouredEach(assembly, 1);
            const before = callsSoFar().SetDocLabelColor;

            // Act
            const refused = await occt.assembly.manager.setDocLabelColor({ document: assembly.document, label: "0:1:1:999", r: 0, g: 1, b: 0, a: 1 }).then(() => "answered", messageOf);
            const keptAfterRefusal = cacheHelper.documents.kept;
            const red = await redOf(assembly.document, assembly.labels[0]!);

            // Assert
            expect(refused).not.toBe("answered");
            expect([keptAfterRefusal, red, callsSoFar().SetDocLabelColor - before]).toEqual([1, 1, 0]);
        });

        it("should export the colour a change answered, not the one a later change of the run gave the document", async () => {
            // Arrange
            await manager.startedTheRun();
            const { document, labels } = await assemblyOf(2);
            const part = labels[0]!;

            // Act
            const red = await occt.assembly.manager.setDocLabelColor({ document, label: part, r: 1, g: 0, b: 0, a: 1 });
            await occt.assembly.manager.setDocLabelColor({ document, label: part, r: 0, g: 0, b: 1, a: 1 });
            const exported = await occt.assembly.manager.exportDocumentToStep({ document: red, fileName: "red.step", author: "", organization: "", compress: false, tryDownload: false });
            const readBack = await occt.assembly.manager.loadStepToDoc({ stepData: exported });
            const readBackParts = await occt.assembly.query.getDocumentParts({ document: readBack });

            // Assert
            expect([await redOf(red, part), await redOf(document, part)]).toEqual([1, 0]);
            const channels = readBackParts.filter(entry => entry.type === "part").map(entry => [entry.color?.r, entry.color?.b].map(channel => channel === undefined ? undefined : Math.round(channel * CHANNEL_STEPS) / CHANNEL_STEPS));
            expect(channels).toContainEqual([1, 0]);
            expect(channels.map(([, blue]) => blue)).not.toContain(1);
        });
    });

    describe("a dataflow graph, which sends every call with exact", () => {
        beforeEach(() => {
            manager.setDocumentReferences("exact");
        });

        it("should export each slider value alone, however the session began", async () => {
            // Arrange
            const sessions: number[][][] = [];
            const slid = async (): Promise<number[][]> => {
                const { document, labels } = await assemblyOf(1);
                const exported: number[][] = [];
                for (const value of [10, 11, 12]) {
                    exported.push(await valuesExported(await occt.assembly.manager.addDocumentPmi({ document, dimensions: [thickness(labels[0]!, value)] })));
                }
                return exported;
            };

            // Act
            sessions.push(await slid());
            cacheHelper.cleanAllCache();
            manager.setDocumentReferences("latest");
            await manager.startedTheRun();
            await assemblyOf(1).then(({ document, labels }) => occt.assembly.manager.addDocumentPmi({ document, dimensions: [thickness(labels[0]!, 10)] }));
            manager.setDocumentReferences("exact");
            sessions.push(await slid());

            // Assert
            expect(sessions).toEqual([[[10], [11], [12]], [[10], [11], [12]]]);
        });

        it("should keep each branch reading its own version when another caller starts a run and changes the document under latest", async () => {
            // Arrange
            const { document, labels } = await assemblyOf(1);
            const part = labels[0]!;
            const measured = await occt.assembly.manager.addDocumentPmi({ document, dimensions: [thickness(part, 10)] });
            const renamed = await occt.assembly.manager.setDocLabelName({ document, label: part, name: "Left" });
            const read = async (version: Document): Promise<string> => `${(await occt.assembly.query.getLabelInfo({ document: version, label: part })).name} ${JSON.stringify((await occt.assembly.query.getDocumentPmi({ document: version })).dimensions.map(dimension => dimension.value))}`;

            // Act
            manager.setDocumentReferences("latest");
            await manager.startedTheRun();
            await occt.assembly.manager.addDocumentPmi({ document, dimensions: [thickness(part, 11)] });
            manager.setDocumentReferences("exact");

            // Assert
            expect([await read(renamed), await read(measured), await read(document)]).toEqual(["Left []", "Part 0 [10]", "Part 0 []"]);
            expect(await valuesExported(document)).toEqual([]);
        });

        it("should hold at most the bound of a document's versions alive while a slider takes 20 values, none once they are released, and two while each value it no longer holds is released", async () => {
            // Arrange
            const { document, labels } = await assemblyOf(1);
            const slid = (value: number): Promise<Document> => occt.assembly.manager.addDocumentPmi({ document, dimensions: [thickness(labels[0]!, value)] });
            const opened = openWindow();
            const slide = async (): Promise<{ held: number; released: number; aliveWhileReleasing: number[] }> => {
                const versions: Document[] = [];
                for (let value = 1; value <= SLIDER_VALUES; value++) {
                    versions.push(await slid(value));
                }
                const held = documentsAliveIn(opened);
                await manager.releaseDocumentVersions(versions);
                const released = documentsAliveIn(opened);
                const aliveWhileReleasing: number[] = [];
                let previous: Document | undefined;
                for (let value = SLIDER_VALUES + 1; value <= 2 * SLIDER_VALUES; value++) {
                    const version = await slid(value);
                    if (previous !== undefined) {
                        await manager.releaseDocumentVersions([previous]);
                    }
                    previous = version;
                    aliveWhileReleasing.push(documentsAliveIn(opened));
                }
                return { held, released, aliveWhileReleasing };
            };

            // Act
            const { held, released, aliveWhileReleasing } = await slide().finally(() => opened.close());

            // Assert
            expect([held, released]).toEqual([MAX_DOCUMENT_VERSIONS_KEPT, 0]);
            expect(Math.max(...aliveWhileReleasing)).toBe(1);
        });
    });

    describe("a call stopped", () => {
        it("should keep nothing a change made when the stop lands after its version was stored, and read the document as made", async () => {
            // Arrange
            await manager.startedTheRun();
            const { document, labels } = await assemblyOf(1);
            const words = Reflect.get(kernel, "bitbybitControl") as Int32Array;
            const store = cacheHelper.addToCache.bind(cacheHelper);
            cacheHelper.addToCache = (hash: string | number, entry: unknown): string | number => {
                if (typeof entry === "object" && entry !== null && "madeVersion" in entry) {
                    Atomics.store(words, 0, 1);
                }
                return store(hash, entry);
            };

            // Act
            let answer: string;
            try {
                answer = await occt.assembly.manager.setDocLabelName({ document, label: labels[0]!, name: "Renamed" }).then(() => "answered", messageOf);
            } finally {
                Atomics.store(words, 0, 0);
                cacheHelper.addToCache = store;
            }
            const name = (await occt.assembly.query.getLabelInfo({ document, label: labels[0]! })).name;

            // Assert
            expect(answer).toContain("was cancelled before it finished; nothing it made was kept");
            expect(name).toBe("Part 0");
            expect(cacheHelper.documents.kept).toBe(0);
        });
    });

    it("should refuse to read a released version made from a shape that was since deleted, saying its shapes are gone rather than naming a shape the call never received", async () => {
        // Arrange
        manager.setDocumentReferences("exact");
        const { document } = await assemblyOf(1);
        const box = await occt.shapes.solid.createBox({ width: 3, length: 1, height: 1, center: [0, 0, 0] });
        const part = await occt.assembly.manager.createPart({ id: "extra", shape: box, name: "Extra" });
        const node = await occt.assembly.manager.createInstanceNode({ id: "x", partId: "extra", name: "X", translation: [0, 5, 0] });
        const structure = await occt.assembly.manager.combineStructure({ parts: [part], nodes: [node], clearDocument: false });
        const built = await occt.assembly.manager.buildAssemblyDocument({ structure, existingDocument: document });
        await manager.releaseDocumentVersions([built]);
        await occt.deleteShape({ shape: box });

        // Act
        const answer = await occt.assembly.query.getAssemblyHierarchy({ document: built }).then(() => "read", messageOf);

        // Assert
        expect(answer).toContain("from shapes or other kernel objects the worker no longer keeps");
        expect(answer).not.toContain(`Shape with hash ${box.hash}`);
    });

    it("should read a version kept as an object whole after the document it was made from is freed", async () => {
        // Arrange
        manager.setDocumentReferences("exact");
        const { document, labels } = await assemblyOf(2);
        const renamed = await occt.assembly.manager.setDocLabelName({ document, label: labels[0]!, name: "Renamed" });

        // Act
        cacheHelper.cleanCacheForHash(String(document.hash));
        const name = (await occt.assembly.query.getLabelInfo({ document: renamed, label: labels[0]! })).name;
        const answer = await occt.assembly.query.getLabelInfo({ document, label: labels[1]! }).then(() => "read", messageOf);

        // Assert
        expect(name).toBe("Renamed");
        expect(answer).toContain(`Document with hash ${document.hash} not found in cache`);
    });
});
