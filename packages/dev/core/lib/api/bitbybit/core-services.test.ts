import { describe, it, expect, beforeEach } from "vitest";
import * as verb from "verb-nurbs-web";
import { GeometryHelper, MathBitByBit } from "@bitbybit-dev/base";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { ContextBase } from "../context";
import { Time } from "./time";
import { Verb } from "./verb/verb";
import { VerbCurve } from "./verb/curve";
import { VerbSurface } from "./verb/surface";
import { VerbIntersect } from "./verb/intersect";
import { OCCTW } from "./occt/occt";
import { OCCTWIO } from "./occt/io";
import { BaseTypes } from "./base-types";
import * as Inputs from "../inputs";

// The small pieces of the core API that hold no geometry of their own: the render-loop registry, the
// two classes that gather the verb and OCCT services, the OCCT io that reads a file before sending
// it, and the shared result types.

type PostedCall = { action: { functionName: string; inputs: unknown }; uid: string };

class RecordingWorker extends EventTarget implements Worker {
    readonly posted: PostedCall[] = [];
    onmessage: Worker["onmessage"] = null;
    onmessageerror: Worker["onmessageerror"] = null;
    onerror: Worker["onerror"] = null;

    postMessage(message: PostedCall): void {
        this.posted.push(message);
    }

    terminate(): void {
        this.posted.length = 0;
    }
}

describe("Time", () => {
    let context: ContextBase;
    let time: Time;

    beforeEach(() => {
        context = new ContextBase();
        time = new Time(context);
    });

    describe("registerRenderFunction", () => {
        it("should put the function on the render loop", () => {
            // Act
            time.registerRenderFunction(() => undefined);

            // Assert
            expect(context.renderLoopBag).toHaveLength(1);
        });

        it("should hand the registered function the time the loop reports", () => {
            // Arrange
            const seen: number[] = [];
            time.registerRenderFunction((timePassedMs) => seen.push(timePassedMs));

            // Act
            context.renderLoopBag[0]!(16);

            // Assert
            expect(seen).toEqual([16]);
        });

        it("should keep every function that was registered", () => {
            // Act
            time.registerRenderFunction(() => undefined);
            time.registerRenderFunction(() => undefined);

            // Assert
            expect(context.renderLoopBag).toHaveLength(2);
        });
    });
});

describe("Verb", () => {
    let verbService: Verb;

    beforeEach(() => {
        const context = new ContextBase();
        context.verb = verb;
        verbService = new Verb(context, new GeometryHelper(), new MathBitByBit());
    });

    it("should gather the curve service", () => {
        expect(verbService.curve).toBeInstanceOf(VerbCurve);
    });

    it("should gather the surface service", () => {
        expect(verbService.surface).toBeInstanceOf(VerbSurface);
    });

    it("should gather the intersection service", () => {
        expect(verbService.intersect).toBeInstanceOf(VerbIntersect);
    });
});

describe("OCCTW", () => {
    let worker: RecordingWorker;
    let occt: OCCTW;
    let context: ContextBase;

    beforeEach(() => {
        const manager = new OCCTWorkerManager();
        worker = new RecordingWorker();
        manager.setOccWorker(worker);
        context = new ContextBase();
        occt = new OCCTW(context, manager);
    });

    it("should replace the io service with the one that can read a file", () => {
        expect(occt.io).toBeInstanceOf(OCCTWIO);
    });

    it("should keep the rest of the kernel API reachable", () => {
        // Act
        void occt.shapes.solid.createSphere({ radius: 1, center: [0, 0, 0] });

        // Assert
        expect(worker.posted[0]!.action.functionName).toBe("shapes.solid.createSphere");
    });

    describe("io.loadSTEPorIGES", () => {
        it("should read the file through the context before sending it", async () => {
            // Arrange
            const file = new File(["ISO-10303-21;"], "part.step");
            const asked: (File | Blob)[] = [];
            context.getFile = (asset: File | Blob) => {
                asked.push(asset);
                return Promise.resolve("ISO-10303-21;");
            };

            // Act
            void occt.io.loadSTEPorIGES(new Inputs.OCCT.ImportStepIgesDto(file, false));
            await Promise.resolve();

            // Assert
            expect(asked).toEqual([file]);
            expect(worker.posted[0]!.action).toEqual({
                functionName: "io.loadSTEPorIGES",
                inputs: { filetext: "ISO-10303-21;", assetFile: undefined, fileName: "part.step", adjustZtoY: false },
            });
        });
    });

    describe("io.loadSTEPorIGESFromText", () => {
        it("should send the text under a name carrying the file type", () => {
            // Act
            void occt.io.loadSTEPorIGESFromText(new Inputs.OCCT.ImportStepIgesFromTextDto("ISO-10303-21;", Inputs.OCCT.fileTypeEnum.step, true));

            // Assert
            expect(worker.posted[0]!.action).toEqual({
                functionName: "io.loadSTEPorIGES",
                inputs: { filetext: "ISO-10303-21;", assetFile: undefined, fileName: "fake.step", adjustZtoY: true },
            });
        });
    });
});

describe("BaseTypes", () => {
    describe("IntervalDto", () => {
        it("should run from zero to one until it is told otherwise", () => {
            // Act
            const interval = new BaseTypes.IntervalDto();

            // Assert
            expect(interval).toEqual({ min: 0, max: 1 });
        });
    });

    describe("UVDto", () => {
        it("should start at the origin of the surface", () => {
            // Act
            const uv = new BaseTypes.UVDto();

            // Assert
            expect(uv).toEqual({ u: 0, v: 0 });
        });
    });
});
