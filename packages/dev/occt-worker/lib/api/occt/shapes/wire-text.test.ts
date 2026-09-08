import { describe, it, expect, beforeEach } from "vitest";
import { OCCTWorkerManager } from "../../../occ-worker/occ-worker-manager";
import { OCCTWire } from "./wire";
import { AnsweringWorker } from "../../__mocks__/test-helpers";
import { Inputs } from "@bitbybit-dev/occt";

const A_SHAPE: Inputs.OCCT.TopoDSShapePointer = { hash: 1, type: "occ-shape" };
const A_COMPOUND: Inputs.OCCT.TopoDSCompoundPointer = { hash: 2, type: "occ-shape" };

const A_TEXT: Inputs.OCCT.TextWiresDto = {
    text: "AB",
    xOffset: 0,
    yOffset: 0,
    height: 10,
    lineSpacing: 1,
    letterSpacing: 1,
    align: Inputs.Base.horizontalAlignEnum.left,
    extrudeOffset: 0,
    centerOnOrigin: false,
};

describe("OCCTWire textWiresWithData", () => {
    let wire: OCCTWire;
    let worker: AnsweringWorker;

    beforeEach(() => {
        const manager = new OCCTWorkerManager();
        worker = new AnsweringWorker();
        manager.setOccWorker(worker);
        wire = new OCCTWire(manager);
    });

    it("should post the dotted path of the method", async () => {
        // Arrange
        worker.answers.set("shapes.wire.textWiresWithData", {
            data: { type: "text", name: "AB", shapes: [] },
            shapes: [],
            compound: A_COMPOUND,
        });

        // Act
        await wire.textWiresWithData(A_TEXT);

        // Assert
        expect(worker.paths()).toEqual(["shapes.wire.textWiresWithData"]);
    });

    it("should hand back the compound the worker answered with", async () => {
        // Arrange
        worker.answers.set("shapes.wire.textWiresWithData", {
            data: { type: "text", name: "AB", shapes: [] },
            shapes: [],
            compound: A_COMPOUND,
        });

        // Act
        const result = await wire.textWiresWithData(A_TEXT);

        // Assert
        expect(result.compound).toBe(A_COMPOUND);
    });

    it("should replace the shape ids in the data with the shapes they name", async () => {
        // Arrange
        worker.answers.set("shapes.wire.textWiresWithData", {
            data: { type: "text", name: "AB", shapes: { letter: "shape-id-1" } },
            shapes: [{ id: "shape-id-1", shape: A_SHAPE }],
            compound: A_COMPOUND,
        });

        // Act
        const result = await wire.textWiresWithData(A_TEXT);

        // Assert
        expect(result).toMatchObject({ shapes: [{ id: "shape-id-1", shape: A_SHAPE }] });
    });

    it("should keep the type and name the worker reported", async () => {
        // Arrange
        worker.answers.set("shapes.wire.textWiresWithData", {
            data: { type: "text", name: "AB", shapes: [] },
            shapes: [],
            compound: A_COMPOUND,
        });

        // Act
        const result = await wire.textWiresWithData(A_TEXT);

        // Assert
        expect(result).toMatchObject({ type: "text", name: "AB" });
    });

    it("should fail when the worker answered without the data", async () => {
        // Arrange
        worker.answers.set("shapes.wire.textWiresWithData", { shapes: [], compound: A_COMPOUND });

        // Act & Assert
        await expect(wire.textWiresWithData(A_TEXT)).rejects.toThrow("Text wires could not be created");
    });

    it("should fail when the worker answered without the shapes", async () => {
        // Arrange
        worker.answers.set("shapes.wire.textWiresWithData", { data: { type: "text", name: "AB" }, compound: A_COMPOUND });

        // Act & Assert
        await expect(wire.textWiresWithData(A_TEXT)).rejects.toThrow("Text wires could not be created");
    });
});
