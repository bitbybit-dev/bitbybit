import { describe, it, expect } from "vitest";
import { hashOfBytes, hashOfText } from "./hashing";

describe("hashing", () => {
    it("should hash a text to the cyrb53 number every engine gives, so stored keys stay valid", () => {
        // Act
        const hashes = [hashOfText(""), hashOfText("hello"), hashOfText("héllo €"), hashOfText("a".repeat(1000))];

        // Assert
        expect(hashes).toEqual([3338908027751811, 4625896200565286, 1836997171649126, 7881309305845150]);
    });

    it("should hash bytes as the text hash does code units, so ASCII text gives one number either way", () => {
        // Act
        const fromBytes = [hashOfBytes(new Uint8Array([])), hashOfBytes(new TextEncoder().encode("hello"))];

        // Assert
        expect(fromBytes).toEqual([hashOfText(""), hashOfText("hello")]);
        expect(hashOfBytes(new Uint8Array([0, 255, 128]))).toBe(hashOfText("\u0000ÿ\u0080"));
    });

    it("should stay a safe integer for a long text", () => {
        // Act
        const hash = hashOfText("x".repeat(100_000));

        // Assert
        expect(Number.isSafeInteger(hash)).toBe(true);
    });
});
