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
import { OCCT } from "../api/occt/occt";

type Document = Inputs.OCCT.TDocStdDocumentPointer;
type Rgb = [number, number, number];

const COUNTED_KERNEL_CALLS = ["CopyDocument", "AddDocumentPmiJson", "RemoveDocumentPmiJson", "SetDocLabelColor", "SetDocLabelName", "ExportDocumentToStep"] as const;
type CountedKernelCall = typeof COUNTED_KERNEL_CALLS[number];

const DOCUMENT_CLASS = "Handle_TDocStd_Document";
const RED: Rgb = [1, 0, 0];
const BLUE: Rgb = [0, 0, 1];
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

describe("an editor running a script that changes an assembly document, again and again", () => {
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

    const boxDocument = async (): Promise<{ document: Document; part: string }> => {
        const box = await occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [0, 0, 0] });
        const part = await occt.assembly.manager.createPart({ id: "box", shape: box, name: "Box" });
        const structure = await occt.assembly.manager.combineStructure({ parts: [part], nodes: [], clearDocument: false });
        const document = await occt.assembly.manager.buildAssemblyDocument({ structure });
        const parts = await occt.assembly.query.getDocumentParts({ document });
        return { document, part: parts.find(entry => entry.type === "part")!.label };
    };

    const thickness = (part: string, value: number): Inputs.OCCT.PmiDimensionDto => ({
        type: Inputs.OCCT.pmiDimensionTypeEnum.linearDistance,
        value,
        shapeRefs: [{ part, kind: Inputs.OCCT.pmiShapeKindEnum.face, index: 5 }],
        otherShapeRefs: [{ part, kind: Inputs.OCCT.pmiShapeKindEnum.face, index: 4 }],
        name: "thickness",
    });

    const valuesIn = async (document: Document): Promise<number[]> =>
        (await occt.assembly.query.getDocumentPmi({ document })).dimensions.map(dimension => dimension.value);

    const stepOf = (document: Document): Promise<Uint8Array> =>
        occt.assembly.manager.exportDocumentToStep({ document, fileName: "box.step", author: "", organization: "", compress: false, tryDownload: false });

    const valuesInStep = async (step: Uint8Array): Promise<number[]> =>
        valuesIn(await occt.assembly.manager.loadStepToDoc({ stepData: step }));

    const runOf = async (change: (made: { document: Document; part: string }) => Promise<unknown>): Promise<{ document: Document; values: number[]; step: Uint8Array }> => {
        await manager.startedTheRun();
        const made = await boxDocument();
        await change(made);
        return { document: made.document, values: await valuesIn(made.document), step: await stepOf(made.document) };
    };

    const addingPmi = (value: number) => ({ document, part }: { document: Document; part: string }): Promise<unknown> =>
        occt.assembly.manager.addDocumentPmi({ document, dimensions: [thickness(part, value)] });

    const removingThenAddingPmi = (value: number) => async ({ document, part }: { document: Document; part: string }): Promise<unknown> => {
        await occt.assembly.manager.removeDocumentPmi({ document });
        return occt.assembly.manager.addDocumentPmi({ document, dimensions: [thickness(part, value)] });
    };

    const unchanged = (): Promise<unknown> => Promise.resolve();

    it("should hold one dimension of the value each run adds, read and exported, when the value goes 10, 10, 11 and back to 10", async () => {
        // Act
        const runs = [];
        for (const value of [10, 10, 11, 10]) {
            runs.push(await runOf(addingPmi(value)));
        }
        const exported = [];
        for (const run of runs) {
            exported.push(await valuesInStep(run.step));
        }

        // Assert
        expect(runs.map(run => run.values)).toEqual([[10], [10], [11], [10]]);
        expect(exported).toEqual([[10], [10], [11], [10]]);
    });

    it("should hold the dimension the addition writes on every run when a run removes the PMI before it adds", async () => {
        // Act
        const runs = [];
        for (const value of [10, 10, 11, 10]) {
            runs.push(await runOf(removingThenAddingPmi(value)));
        }
        const exported = [];
        for (const run of runs) {
            exported.push(await valuesInStep(run.step));
        }

        // Assert
        expect(runs.map(run => run.values)).toEqual([[10], [10], [11], [10]]);
        expect(exported).toEqual([[10], [10], [11], [10]]);
    });

    it("should give the colour and the name the last run set, and the document as it was made once a run sets neither", async () => {
        // Arrange
        const colourAndNameOf = async (document: Document, part: string): Promise<[Rgb, string]> => {
            const colour = await occt.assembly.query.getLabelColor({ document, label: part });
            const info = await occt.assembly.query.getLabelInfo({ document, label: part });
            return [[colour.r, colour.g, colour.b].map(channel => Math.round(channel * CHANNEL_STEPS) / CHANNEL_STEPS) as Rgb, info.name];
        };
        const recolouredAndRenamed = (rgb: Rgb, name: string) => async ({ document, part }: { document: Document; part: string }): Promise<unknown> => {
            await occt.assembly.manager.setDocLabelColor({ document, label: part, r: rgb[0], g: rgb[1], b: rgb[2], a: 1 });
            return occt.assembly.manager.setDocLabelName({ document, label: part, name });
        };
        const seen: [Rgb, string][] = [];
        const runSeeing = async (change: (made: { document: Document; part: string }) => Promise<unknown>): Promise<void> => {
            await manager.startedTheRun();
            const made = await boxDocument();
            await change(made);
            seen.push(await colourAndNameOf(made.document, made.part));
        };

        // Act
        await runSeeing(unchanged);
        await runSeeing(recolouredAndRenamed(RED, "Left"));
        await runSeeing(recolouredAndRenamed(RED, "Left"));
        await runSeeing(recolouredAndRenamed(BLUE, "Right"));
        await runSeeing(unchanged);

        // Assert
        const [asMade, red, redAgain, blue, unchangedAgain] = seen;
        expect([red, redAgain, blue]).toEqual([[RED, "Left"], [RED, "Left"], [BLUE, "Right"]]);
        expect(unchangedAgain).toEqual(asMade);
        expect(asMade![1]).toBe("Box");
    });

    it("should give the document as it was made, read and exported, once the run no longer changes it", async () => {
        // Arrange
        const untouched = await runOf(unchanged);
        await runOf(addingPmi(10));

        // Act
        const afterTheChangeWent = await runOf(unchanged);

        // Assert
        expect(afterTheChangeWent.values).toEqual([]);
        expect(await valuesInStep(afterTheChangeWent.step)).toEqual([]);
        expect(afterTheChangeWent.step).toEqual(untouched.step);
    });

    it("should make no kernel call for the change or the export of a run made again unchanged", async () => {
        // Arrange
        const first = await runOf(removingThenAddingPmi(10));
        const afterTheFirst = callsSoFar();

        // Act
        const again = await runOf(removingThenAddingPmi(10));

        // Assert
        expect(afterTheFirst).toEqual({ CopyDocument: 1, AddDocumentPmiJson: 1, RemoveDocumentPmiJson: 1, SetDocLabelColor: 0, SetDocLabelName: 0, ExportDocumentToStep: 1 });
        expect(callsSoFar()).toEqual(afterTheFirst);
        expect(again.step).toEqual(first.step);
    });

    it("should answer a build that applies a structure to a document with the version it made, which the document's reference reads in that run and not in the next, make the version again once it alone is deleted, and leave no document alive once the document as made is deleted", async () => {
        // Arrange
        const opened = openWindow();
        const namesSeen: string[] = [];
        const runRenaming = async (rename: boolean): Promise<{ document: Document; built: Document | undefined }> => {
            await manager.startedTheRun();
            const { document, part } = await boxDocument();
            let built: Document | undefined;
            if (rename) {
                const update = await occt.assembly.manager.createPartUpdate({ label: part, name: "Renamed" });
                const structure = await occt.assembly.manager.combineStructure({ parts: [], nodes: [], partUpdates: [update], clearDocument: false });
                built = await occt.assembly.manager.buildAssemblyDocument({ structure, existingDocument: document });
                namesSeen.push((await occt.assembly.query.getLabelInfo({ document: built, label: part })).name);
            }
            namesSeen.push((await occt.assembly.query.getLabelInfo({ document, label: part })).name);
            return { document, built };
        };
        const productsIn = async (document: Document): Promise<boolean[]> => {
            const step = new TextDecoder().decode(await stepOf(document));
            return ["Renamed", "Box"].map(name => step.includes(`'${name}'`));
        };

        // Act
        let renamed: { document: Document; built: Document | undefined };
        let builtAgain: boolean[];
        try {
            renamed = await runRenaming(true);
            await runRenaming(false);
            await occt.assembly.manager.deleteDocument({ document: renamed.built! });
            builtAgain = await productsIn(renamed.built!);
            await occt.assembly.manager.deleteDocument({ document: renamed.document });
        } finally {
            opened.close();
        }

        // Assert
        expect(renamed.built!.hash).not.toBe(renamed.document.hash);
        expect(namesSeen).toEqual(["Renamed", "Renamed", "Box"]);
        expect(builtAgain).toEqual([true, false]);
        expect(namesOf(opened.made().filter(handle => !handle.isDeleted())).filter(name => name === DOCUMENT_CLASS)).toEqual([]);
    });

    it("should leave no document alive, versions included, once the caller deletes the document and what it loaded", async () => {
        // Arrange
        const opened = openWindow();
        const loadedBack: Document[] = [];
        let document: Document | undefined;

        // Act
        try {
            for (const value of [10, 11, 10]) {
                const run = await runOf(removingThenAddingPmi(value));
                loadedBack.push(await occt.assembly.manager.loadStepToDoc({ stepData: run.step }));
                document = run.document;
            }
            await occt.assembly.manager.deleteDocument({ document: document! });
            for (const loaded of loadedBack) {
                await occt.assembly.manager.deleteDocument({ document: loaded });
            }
        } finally {
            opened.close();
        }

        // Assert
        expect(namesOf(opened.made().filter(handle => !handle.isDeleted())).filter(name => name === DOCUMENT_CLASS)).toEqual([]);
        expect(await valuesIn(document!).catch(messageOf)).toContain(`Document with hash ${document!.hash} not found in cache`);
    });

    it("should leave a shape taken out of a changed document whole once the document and its versions are freed", async () => {
        // Arrange
        await manager.startedTheRun();
        const { document, part } = await boxDocument();
        await addingPmi(10)({ document, part });
        const shape = await occt.assembly.query.getShapeFromLabel({ document, label: part });

        // Act
        await occt.assembly.manager.deleteDocument({ document });
        const volume = await occt.shapes.solid.getSolidVolume({ shape });

        // Assert
        expect(volume).toBeCloseTo(1000, 6);
    });

    it("should leave no document alive, versions included, once the cache is cleaned", async () => {
        // Arrange
        const opened = openWindow();

        // Act
        try {
            for (const value of [10, 11, 10]) {
                await runOf(removingThenAddingPmi(value));
            }
            await manager.cleanAllCache();
        } finally {
            opened.close();
        }

        // Assert
        expect(namesOf(opened.made().filter(handle => !handle.isDeleted())).filter(name => name === DOCUMENT_CLASS)).toEqual([]);
    });

    it("should give a script that exports what each change answered the STEP file of a script that exports the document it changed", async () => {
        // Arrange
        const runUsingAnswers = async (value: number): Promise<{ values: number[]; step: Uint8Array }> => {
            await manager.startedTheRun();
            const { document, part } = await boxDocument();
            const cleared = await occt.assembly.manager.removeDocumentPmi({ document });
            const measured = await occt.assembly.manager.addDocumentPmi({ document: cleared, dimensions: [thickness(part, value)] });
            return { values: await valuesIn(measured), step: await stepOf(measured) };
        };

        // Act
        const ignoring = await runOf(removingThenAddingPmi(11));
        const using = await runUsingAnswers(11);

        // Assert
        expect(using.values).toEqual([11]);
        expect(using.step).toEqual(ignoring.step);
    });

    describe("a dataflow graph, which reads every document reference exactly and runs again only what changed", () => {
        const renaming = (document: Document, part: string): Promise<Document> =>
            occt.assembly.manager.setDocLabelName({ document, label: part, name: "Left" });
        const measuring = (document: Document, part: string, value: number): Promise<Document> =>
            occt.assembly.manager.addDocumentPmi({ document, dimensions: [thickness(part, value)] });
        const nameIn = async (document: Document, part: string): Promise<string> =>
            (await occt.assembly.query.getLabelInfo({ document, label: part })).name;

        beforeEach(() => {
            manager.setDocumentReferences("exact");
        });

        it("should export the PMI each value gives through the reference the change answered, and answer an unchanged value from the cache", async () => {
            // Arrange
            const { document, part } = await boxDocument();
            const ten = await measuring(document, part, 10);
            const tenStep = await stepOf(ten);

            // Act
            const eleven = await measuring(document, part, 11);
            const elevenStep = await stepOf(eleven);
            const afterEleven = callsSoFar();
            const elevenAgain = await measuring(document, part, 11);
            const elevenStepAgain = await stepOf(elevenAgain);

            // Assert
            expect(eleven.hash).not.toBe(ten.hash);
            expect([await valuesInStep(tenStep), await valuesInStep(elevenStep)]).toEqual([[10], [11]]);
            expect(elevenAgain).toEqual(eleven);
            expect(elevenStepAgain).toEqual(elevenStep);
            expect(callsSoFar()).toEqual(afterEleven);
            expect(await valuesIn(document)).toEqual([]);
        });

        it("should keep two branches from one document apart, and give, when only one runs again, what running all of them gives", async () => {
            // Arrange
            const { document, part } = await boxDocument();
            const renamed = await renaming(document, part);
            const renamedStep = await stepOf(renamed);
            await stepOf(await measuring(document, part, 10));

            // Act
            const measured = await measuring(document, part, 11);
            const partly = { measured: await valuesInStep(await stepOf(measured)), measuredName: await nameIn(measured, part), renamed: await valuesInStep(renamedStep), renamedName: await nameIn(renamed, part) };
            cacheHelper.cleanAllCache();
            cacheHelper = initializationComplete(kernel, undefined, true);
            const made = await boxDocument();
            const fullRenamed = await renaming(made.document, made.part);
            const fullMeasured = await measuring(made.document, made.part, 11);
            const fully = { measured: await valuesInStep(await stepOf(fullMeasured)), measuredName: await nameIn(fullMeasured, made.part), renamed: await valuesInStep(await stepOf(fullRenamed)), renamedName: await nameIn(fullRenamed, made.part) };

            // Assert
            expect(partly).toEqual({ measured: [11], measuredName: "Box", renamed: [], renamedName: "Left" });
            expect(partly).toEqual(fully);
        });

        it("should give one document with every label coloured from one change of many labels, where a change per label from the one document gives each colour a document of its own", async () => {
            // Arrange
            const boxes = await Promise.all([0, 20, 40].map(x => occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [x, 0, 0] })));
            const parts = await Promise.all(boxes.map((shape, at) => occt.assembly.manager.createPart({ id: `box${at}`, shape, name: `Box ${at}` })));
            const document = await occt.assembly.manager.buildAssemblyDocument({ structure: await occt.assembly.manager.combineStructure({ parts, nodes: [], clearDocument: false }) });
            const labels = (await occt.assembly.query.getDocumentParts({ document })).filter(entry => entry.type === "part").map(entry => entry.label);
            const redIn = async (made: Document): Promise<string[]> => {
                const colours = await Promise.all(labels.map(label => occt.assembly.query.getLabelColor({ document: made, label })));
                const rounded = (channel: number): number => Math.round(channel * CHANNEL_STEPS) / CHANNEL_STEPS;
                return labels.filter((_label, at) => [colours[at]!.r, colours[at]!.g, colours[at]!.b].map(rounded).join() === RED.join());
            };
            const red = { r: RED[0], g: RED[1], b: RED[2], a: 1 };

            // Act
            const perLabel = [];
            for (const label of labels) {
                perLabel.push(await occt.assembly.manager.setDocLabelColor({ document, label, ...red }));
            }
            const copiesBefore = callsSoFar().CopyDocument;
            const together = await occt.assembly.manager.setDocLabelColors({ document, labels, ...red });
            const copies = callsSoFar().CopyDocument - copiesBefore;
            const named = await occt.assembly.manager.setDocLabelNames({ document: together, labels, names: ["Left", "Middle", "Right"] });

            // Assert
            const each = [];
            for (const version of perLabel) {
                each.push(await redIn(version));
            }
            expect(each).toEqual(labels.map(label => [label]));
            expect(await redIn(together)).toEqual(labels);
            expect(copies).toBe(1);
            expect(await redIn(named)).toEqual(labels);
            expect(await Promise.all(labels.map(async label => (await occt.assembly.query.getLabelInfo({ document: named, label })).name))).toEqual(["Left", "Middle", "Right"]);
            expect(await redIn(document)).toEqual([]);
        });
    });

    it("should keep no copy of a document whose change was stopped while the kernel made it, and read the document as it was", async () => {
        // Arrange
        const { document, part } = await boxDocument();
        const words = Reflect.get(kernel, "bitbybitControl") as Int32Array;
        const counted: unknown = Reflect.get(kernel, "AddDocumentPmiJson");
        const addPmi = (counted as (...args: unknown[]) => unknown).bind(kernel);
        Reflect.set(kernel, "AddDocumentPmiJson", (...args: unknown[]): unknown => {
            const added = addPmi(...args);
            Atomics.store(words, 0, 1);
            return added;
        });
        const opened = openWindow();

        // Act
        let stopped: string;
        try {
            stopped = await occt.assembly.manager.addDocumentPmi({ document, dimensions: [thickness(part, 10)] }).then(() => "", messageOf);
        } finally {
            opened.close();
            Reflect.set(kernel, "AddDocumentPmiJson", counted);
            Atomics.store(words, 0, 0);
        }

        // Assert
        expect(stopped).toContain("was cancelled before it finished");
        expect(namesOf(opened.made().filter(handle => !handle.isDeleted())).filter(name => name === DOCUMENT_CLASS)).toEqual([]);
        expect(await valuesIn(document)).toEqual([]);
    });
});
