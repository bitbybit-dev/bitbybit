import { describe, expect, it } from "vitest";
import { automaticGlobalId, compressBytes, isGlobalId, keyGlobalId, projectGlobalId, randomGlobalId, structureGlobalId } from "./guid";

const NIL_UUID = "00000000000000000000000000000000";
const MAX_UUID = "ffffffffffffffffffffffffffffffff";
const SAMPLE_UUID = "3f2504e04f8911d39a0c0305e82c3301";
const SEQUENCE_UUID = "0123456789abcdef0123456789abcdef";
const NIL_GLOBAL_ID = "0000000000000000000000";
const MAX_GLOBAL_ID = "3$$$$$$$$$$$$$$$$$$$$$";
const SAMPLE_GLOBAL_ID = "0$9GJWJuaHqveC0mNeB3C1";
const SEQUENCE_GLOBAL_ID = "018qLdYQlDxm4ZHMU9gytl";
const GLOBAL_ID_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$";
const VERSION_FOUR_UUID = /^[0-9a-f]{12}4[0-9a-f]{3}[89ab][0-9a-f]{15}$/;
const SAMPLES = 32;

const bytesOfUuid = (uuid: string): Uint8Array => Uint8Array.from(uuid.match(/../g)!, (pair) => Number.parseInt(pair, 16));

function uuidOf(globalId: string): string {
    const valueOf = (from: number, count: number): number => [...globalId.slice(from, from + count)].reduce((value, character) => value * 64 + GLOBAL_ID_ALPHABET.indexOf(character), 0);
    const bytes = [valueOf(0, 2)];
    for (let at = 2; at < 22; at += 4) {
        const value = valueOf(at, 4);
        bytes.push(Math.floor(value / 65536) % 256, Math.floor(value / 256) % 256, value % 256);
    }
    return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

describe("compressBytes", () => {
    it("should compress UUIDs to the GlobalIds IfcOpenShell gives for them", () => {
        // Act
        const globalIds = [NIL_UUID, MAX_UUID, SAMPLE_UUID, SEQUENCE_UUID].map((uuid) => compressBytes(bytesOfUuid(uuid)));

        // Assert
        expect(globalIds).toEqual([NIL_GLOBAL_ID, MAX_GLOBAL_ID, SAMPLE_GLOBAL_ID, SEQUENCE_GLOBAL_ID]);
    });

    it("should give back the bytes a GlobalId was compressed from", () => {
        // Act
        const uuid = uuidOf(compressBytes(bytesOfUuid(SAMPLE_UUID)));

        // Assert
        expect(uuid).toBe(SAMPLE_UUID);
    });

    it("should refuse fewer or more than sixteen bytes", () => {
        // Act & Assert
        expect(() => compressBytes(new Uint8Array(15))).toThrow("A GlobalId holds 16 bytes, got 15");
        expect(() => compressBytes(new Uint8Array(17))).toThrow("A GlobalId holds 16 bytes, got 17");
    });
});

describe("isGlobalId", () => {
    it("should accept 22 characters of the GlobalId alphabet", () => {
        // Act
        const results = [NIL_GLOBAL_ID, MAX_GLOBAL_ID, SAMPLE_GLOBAL_ID, SEQUENCE_GLOBAL_ID].map(isGlobalId);

        // Assert
        expect(results).toEqual([true, true, true, true]);
    });

    it("should refuse a text one character short or one too long", () => {
        // Act
        const results = [SAMPLE_GLOBAL_ID.slice(1), `${SAMPLE_GLOBAL_ID}0`].map(isGlobalId);

        // Assert
        expect(results).toEqual([false, false]);
    });

    it("should refuse a first character above 3", () => {
        // Act
        const result = isGlobalId(`4${SAMPLE_GLOBAL_ID.slice(1)}`);

        // Assert
        expect(result).toBe(false);
    });

    it("should refuse characters outside the GlobalId alphabet", () => {
        // Act
        const results = ["0$9GJWJuaHqveC0mNeB3C-", "0$9GJWJuaHqveC0mNeB3C ", "0$9GJWJuaHqveC0mNeB3C+"].map(isGlobalId);

        // Assert
        expect(results).toEqual([false, false, false]);
    });

    it("should refuse an empty text", () => {
        // Act
        const result = isGlobalId("");

        // Assert
        expect(result).toBe(false);
    });
});

describe("randomGlobalId", () => {
    it("should make valid GlobalIds of version 4 UUIDs of the RFC variant", () => {
        // Act
        const globalIds = Array.from({ length: SAMPLES }, () => randomGlobalId());

        // Assert
        expect(globalIds.filter((globalId) => !isGlobalId(globalId))).toEqual([]);
        expect(globalIds.map(uuidOf).filter((uuid) => !VERSION_FOUR_UUID.test(uuid))).toEqual([]);
    });

    it("should make a different GlobalId on each call", () => {
        // Act
        const globalIds = new Set(Array.from({ length: SAMPLES }, () => randomGlobalId()));

        // Assert
        expect(globalIds.size).toBe(SAMPLES);
    });
});

describe("keyGlobalId", () => {
    it("should give the same GlobalId for the same seed and key", () => {
        // Act
        const first = keyGlobalId("seed", "wall-1");
        const second = keyGlobalId("seed", "wall-1");

        // Assert
        expect(second).toBe(first);
    });

    it("should keep giving the GlobalId it gave before, so a model rebuilt from a script keeps its ids", () => {
        // Act
        const globalId = keyGlobalId("seed", "wall-1");

        // Assert
        expect(globalId).toBe("2NRqMLfEzE0vfghfEmeiuA");
    });

    it("should give different GlobalIds for different keys and for different seeds", () => {
        // Act
        const globalIds = [keyGlobalId("seed", "wall-1"), keyGlobalId("seed", "wall-2"), keyGlobalId("other", "wall-1")];

        // Assert
        expect(new Set(globalIds).size).toBe(3);
    });

    it("should keep the seed and the key apart, so moving a character from one to the other changes the GlobalId", () => {
        // Act
        const first = keyGlobalId("ab", "c");
        const second = keyGlobalId("a", "bc");

        // Assert
        expect(second).not.toBe(first);
    });

    it("should derive a GlobalId from a key that itself looks like a GlobalId", () => {
        // Act
        const globalId = keyGlobalId("seed", "1stFloorLivingRoomWall");

        // Assert
        expect(isGlobalId("1stFloorLivingRoomWall")).toBe(true);
        expect(globalId).not.toBe("1stFloorLivingRoomWall");
    });

    it("should make valid, distinct GlobalIds of version 4 UUIDs of the RFC variant", () => {
        // Act
        const globalIds = Array.from({ length: SAMPLES }, (_, index) => keyGlobalId("seed", `wall-${index}`));

        // Assert
        expect(globalIds.filter((globalId) => !isGlobalId(globalId))).toEqual([]);
        expect(globalIds.map(uuidOf).filter((uuid) => !VERSION_FOUR_UUID.test(uuid))).toEqual([]);
        expect(new Set(globalIds).size).toBe(SAMPLES);
    });
});

describe("the GlobalId domains", () => {
    it("should never give a key the GlobalId the library derives for its own objects from the same text", () => {
        // Act
        const globalIds = [keyGlobalId("seed", "#12"), automaticGlobalId("seed", "#12"), structureGlobalId("seed", "#12"), keyGlobalId("seed", "site"), structureGlobalId("seed", "site")];

        // Assert
        expect(new Set(globalIds).size).toBe(5);
    });

    it("should derive a project's GlobalId from its seed alone, apart from every key", () => {
        // Act
        const project = projectGlobalId("house");

        // Assert
        expect(project).toBe(projectGlobalId("house"));
        expect(project).not.toBe(keyGlobalId("house", "project"));
        expect(isGlobalId(project)).toBe(true);
    });
});
