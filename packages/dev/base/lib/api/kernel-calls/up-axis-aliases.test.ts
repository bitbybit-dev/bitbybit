import { describe, it, expect } from "vitest";
import { resolveDto, resolveInputs } from "./resolve-dto";
import { checkedUpAxis } from "./up-axis-aliases";
import { InputError } from "./errors";
import { Base } from "../inputs/base-inputs";

const { keep, zUpToYUp, yUpToZUp } = Base.upAxisConversionEnum;

class ReadDto {
    text = "";
    upAxis?: Base.upAxisConversionEnum | undefined = zUpToYUp;
    adjustZtoY?: boolean | undefined;
}

class WriteDto {
    upAxis?: Base.upAxisConversionEnum | undefined = keep;
    adjustYtoZ?: boolean | undefined;
}

class PlainDto {
    adjustZtoY?: boolean | undefined;
}

function refusal(act: () => unknown): InputError {
    try {
        act();
    } catch (error) {
        if (error instanceof InputError) {
            return error;
        }
        throw error;
    }
    throw new Error("the call was not refused");
}

describe("resolveDto with the deprecated up-axis flags", () => {
    it("should keep the default axis when no flag is given", () => {
        // Act
        const resolved = resolveDto(ReadDto, { text: "a" });

        // Assert
        expect(resolved.upAxis).toBe(zUpToYUp);
    });

    it("should let a true adjustZtoY choose zUpToYUp when the axis is left out", () => {
        // Act
        const resolved = resolveDto(WriteDto, { adjustZtoY: true });

        // Assert
        expect(resolved.upAxis).toBe(zUpToYUp);
    });

    it("should let a false adjustZtoY keep the axes when the default turns Z into Y", () => {
        // Act
        const resolved = resolveDto(ReadDto, { adjustZtoY: false });

        // Assert
        expect(resolved.upAxis).toBe(keep);
    });

    it("should let a true adjustYtoZ choose yUpToZUp", () => {
        // Act
        const resolved = resolveDto(WriteDto, { adjustYtoZ: true });

        // Assert
        expect(resolved.upAxis).toBe(yUpToZUp);
    });

    it("should leave the default when a false adjustYtoZ does not contradict it", () => {
        // Act
        const resolved = resolveDto(ReadDto, { adjustYtoZ: false });

        // Assert
        expect(resolved.upAxis).toBe(zUpToYUp);
    });

    it("should drop the flags from what it resolves", () => {
        // Act
        const resolved: object = resolveDto(ReadDto, { adjustZtoY: true });

        // Assert
        expect("adjustZtoY" in resolved).toBe(false);
    });

    it("should let the flag decide when the axis given equals its default, as an editor passes it", () => {
        // Act
        const resolved = resolveDto(ReadDto, { upAxis: zUpToYUp, adjustZtoY: false });

        // Assert
        expect(resolved.upAxis).toBe(keep);
    });

    it("should accept an axis and a flag that agree", () => {
        // Act
        const resolved = resolveDto(WriteDto, { upAxis: yUpToZUp, adjustYtoZ: true });

        // Assert
        expect(resolved.upAxis).toBe(yUpToZUp);
    });

    it("should accept a false flag beside an axis it does not contradict", () => {
        // Act
        const resolved = resolveDto(WriteDto, { upAxis: zUpToYUp, adjustYtoZ: false });

        // Assert
        expect(resolved.upAxis).toBe(zUpToYUp);
    });

    it("should refuse a chosen axis that a true flag contradicts, naming both", () => {
        // Act
        const error = refusal(() => resolveDto(WriteDto, { upAxis: zUpToYUp, adjustYtoZ: true }));

        // Assert
        expect(error.message).toContain("`upAxis`");
        expect(error.message).toContain("`adjustYtoZ`");
        expect(error.property).toBe("adjustYtoZ");
    });

    it("should take a flag at its old default as no decision, so the axis chosen beside it holds", () => {
        // Act
        const resolved = [
            resolveDto(WriteDto, { upAxis: yUpToZUp, adjustYtoZ: false }).upAxis,
            resolveDto(WriteDto, { upAxis: zUpToYUp, adjustZtoY: false }).upAxis,
            resolveDto(ReadDto, { upAxis: keep, adjustZtoY: true }).upAxis,
        ];

        // Assert
        expect(resolved).toEqual([yUpToZUp, zUpToYUp, keep]);
    });

    it("should refuse a chosen axis that a false flag set against its old default contradicts", () => {
        // Act
        const error = refusal(() => resolveDto(ReadDto, { upAxis: yUpToZUp, adjustZtoY: false }));

        // Assert
        expect([error.property, error.message]).toEqual(["adjustZtoY", "`adjustZtoY` is false, but `upAxis` chooses another turn: give `upAxis` alone, since `adjustZtoY` is deprecated."]);
    });

    it("should leave an axis that is no turn to the method that checks it, refusing no flag beside it", () => {
        // Act
        const resolved: object = resolveDto(WriteDto, { upAxis: "Y", adjustYtoZ: true });

        // Assert
        expect(resolved).toEqual({ upAxis: "Y" });
    });

    it("should refuse two true flags, naming both", () => {
        // Act
        const error = refusal(() => resolveDto(WriteDto, { adjustYtoZ: true, adjustZtoY: true }));

        // Assert
        expect(error.message).toContain("`adjustZtoY`");
        expect(error.message).toContain("`adjustYtoZ`");
    });

    it("should leave a DTO without an up axis as it was", () => {
        // Act
        const resolved = resolveDto(PlainDto, { adjustZtoY: true });

        // Assert
        expect(resolved).toEqual({ adjustZtoY: true });
    });

    it("should apply the flags on the way to a registered operation", () => {
        // Act
        const resolved = resolveInputs({ "io.load": { dto: ReadDto } }, "io.load", { adjustZtoY: false }) as ReadDto;

        // Assert
        expect(resolved.upAxis).toBe(keep);
    });

    it("should never change the caller's object", () => {
        // Arrange
        const given = { adjustZtoY: false };

        // Act
        resolveDto(ReadDto, given);

        // Assert
        expect(given).toEqual({ adjustZtoY: false });
    });
});

describe("checkedUpAxis", () => {
    it("should give back a turn the method takes", () => {
        // Act
        const axis = checkedUpAxis(zUpToYUp, [keep, zUpToYUp]);

        // Assert
        expect(axis).toBe(zUpToYUp);
    });

    it("should refuse a turn the method does not take, naming the ones it does", () => {
        // Act
        const error = refusal(() => checkedUpAxis(yUpToZUp, [keep, zUpToYUp]));

        // Assert
        expect(error.message).toBe("`upAxis` is `yUpToZUp`, which this method does not take: it takes `keep` or `zUpToYUp`.");
        expect(error.property).toBe("upAxis");
    });

    it("should refuse a value that is no turn at all", () => {
        // Act
        const error = refusal(() => checkedUpAxis("sideways", [keep, zUpToYUp, yUpToZUp]));

        // Assert
        expect(error.message).toContain("`sideways`");
    });
});
