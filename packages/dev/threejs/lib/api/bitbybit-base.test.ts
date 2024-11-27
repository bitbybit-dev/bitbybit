import { BitByBitBase } from "./bitbybit-base";

describe("Bitbybit base unit tests", () => {

    it("should create BitByBitBase", () => {
        const bitbybit = new BitByBitBase();
        expect(bitbybit).toBeDefined();
    });

    it("should init bitbybitbase", () => {
        const bitbybit = new BitByBitBase();

        bitbybit.init({ mockScene: true } as jest.Mock, { mockWorker: true } as jest.Mock, { mockWorker: true } as jest.Mock);
        expect(bitbybit.context).toBeDefined();
        expect(bitbybit.context.scene).toBeDefined();
        expect(bitbybit.occtWorkerManager["occWorker"]).toBeDefined();
        expect(bitbybit.jscadWorkerManager["jscadWorker"]).toBeDefined();

    });

    it("should init bitbybitbase without occt and jscad workers", () => {
        const bitbybit = new BitByBitBase();

        bitbybit.init({ mockScene: true } as jest.Mock,undefined, undefined);
        expect(bitbybit.context).toBeDefined();
        expect(bitbybit.context.scene).toBeDefined();
        expect(bitbybit.occtWorkerManager["occWorker"]).not.toBeDefined();
        expect(bitbybit.jscadWorkerManager["jscadWorker"]).not.toBeDefined();

    });
});
