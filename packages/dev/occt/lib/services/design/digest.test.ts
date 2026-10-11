import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import { sha256 } from "./digest";

describe("design digest", () => {
    it("should give the published SHA-256 of the standard test messages", () => {
        // Act
        const digests = [sha256(new TextEncoder().encode("")), sha256(new TextEncoder().encode("abc"))];

        // Assert
        expect(digests).toEqual([
            "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
        ]);
    });

    it("should agree with Node's SHA-256 on every length around the padding boundaries and on a long message", () => {
        // Arrange
        const lengths = [1, 54, 55, 56, 57, 63, 64, 65, 119, 120, 128, 1000, 100_000];
        const messages = lengths.map(length => Uint8Array.from({ length }, (_, index) => (index * 31 + length) % 256));

        // Act
        const ours = messages.map(sha256);
        const node = messages.map(message => createHash("sha256").update(message).digest("hex"));

        // Assert
        expect(ours).toEqual(node);
    });
});
