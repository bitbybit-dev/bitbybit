import { describe, expect, it } from "vitest";
import { Base } from "../inputs/base-inputs";
import { InputError } from "./errors";
import type { BitbybitSettings } from "./settings";
import { CURRENT_CONVENTIONS, SettingsRelay, checkedSettings, settingsCacheKey, settingsOfConventions } from "./settings";

const refusalOf = (given: unknown): InputError => {
    try {
        checkedSettings(given);
    } catch (error) {
        if (error instanceof InputError) {
            return error;
        }
        throw error;
    }
    throw new Error("expected the settings to be refused");
};

describe("checkedSettings", () => {
    it.each([
        ["nothing", undefined],
        ["null", null],
        ["an empty object", {}],
        ["a setting passed as undefined", { coordinateSystem: undefined }],
        ["a setting passed as null", { coordinateSystem: null }],
    ])("should give no settings for %s", (_name, given) => {
        // Act
        const settings = checkedSettings(given);

        // Assert
        expect(settings).toEqual({});
        expect(Object.keys(settings)).toEqual([]);
    });

    it.each([Base.coordinateSystemEnum.leftHanded, Base.coordinateSystemEnum.rightHanded])("should keep the coordinate system %s", (coordinateSystem) => {
        // Act
        const settings = checkedSettings({ coordinateSystem });

        // Assert
        expect(settings).toEqual({ coordinateSystem });
    });

    it("should return a new object and leave the one it was given alone", () => {
        // Arrange
        const given = { coordinateSystem: Base.coordinateSystemEnum.leftHanded };

        // Act
        const settings = checkedSettings(given);
        settings.coordinateSystem = Base.coordinateSystemEnum.rightHanded;

        // Assert
        expect(given).toEqual({ coordinateSystem: "leftHanded" });
    });

    it("should refuse a value its setting does not take, naming the setting and what it takes", () => {
        // Act
        const refusal = refusalOf({ coordinateSystem: "upsideDown" });

        // Assert
        expect(refusal.property).toBe("coordinateSystem");
        expect(refusal.message).toBe("`coordinateSystem` is \"upsideDown\"; it is leftHanded, rightHanded or left out.");
    });

    it("should refuse a name that is no setting, so a misspelt one is not ignored", () => {
        // Act
        const refusal = refusalOf({ cordinateSystem: "leftHanded" });

        // Assert
        expect(refusal.property).toBe("cordinateSystem");
        expect(refusal.message).toBe("`cordinateSystem` is not a setting; the settings are coordinateSystem.");
    });

    it.each([
        ["a text", "leftHanded"],
        ["a number", 1],
        ["a list", ["leftHanded"]],
    ])("should refuse %s where the settings object belongs", (_name, given) => {
        // Act
        const refusal = refusalOf(given);

        // Assert
        expect(refusal.property).toBe("settings");
    });
});

describe("settingsOfConventions", () => {
    const OF_THE_ENGINE = { coordinateSystem: Base.coordinateSystemEnum.leftHanded };

    it.each([
        ["no level", undefined],
        ["a level of null", null],
        ["level 0", 0],
    ])("should give no settings for content saved with %s, so it runs as it always did", (_name, level) => {
        // Act
        const settings = settingsOfConventions(level, OF_THE_ENGINE);

        // Assert
        expect(settings).toEqual({});
    });

    it.each([
        ["level 1", 1],
        ["the newest level", CURRENT_CONVENTIONS],
        ["a level newer than this version knows", CURRENT_CONVENTIONS + 3],
    ])("should give the engine's settings for content saved with %s", (_name, level) => {
        // Act
        const settings = settingsOfConventions(level, OF_THE_ENGINE);

        // Assert
        expect(settings).toEqual({ coordinateSystem: "leftHanded" });
        expect(settings).not.toBe(OF_THE_ENGINE);
    });

    it.each([
        ["a negative number", -1],
        ["a fraction", 1.5],
        ["a text", "1"],
        ["a truth value", true],
        ["not a number", Number.NaN],
        ["infinity", Infinity],
    ])("should refuse %s as a level", (_name, level) => {
        // Act
        const refuse = (): unknown => settingsOfConventions(level, OF_THE_ENGINE);

        // Assert
        expect(refuse).toThrow(InputError);
        expect(refuse).toThrow("A conventions level is a whole number from 0");
    });

    it("should refuse engine settings that are no settings, whatever the level", () => {
        // Act & Assert
        expect(() => settingsOfConventions(1, JSON.parse("{\"handedness\":\"right\"}"))).toThrow("`handedness` is not a setting");
    });

    it("should count the engine's coordinate system as the first level", () => {
        // Assert
        expect(CURRENT_CONVENTIONS).toBe(1);
    });
});

describe("settingsCacheKey", () => {
    it("should give nothing for no settings, so results made without any keep the key they always had", () => {
        // Act
        const key = settingsCacheKey({});

        // Assert
        expect(key).toBeUndefined();
    });

    it("should give the settings themselves when any are set", () => {
        // Arrange
        const settings = { coordinateSystem: Base.coordinateSystemEnum.rightHanded };

        // Act
        const key = settingsCacheKey(settings);

        // Assert
        expect(key).toBe(settings);
    });
});

describe("SettingsRelay", () => {
    const RIGHT_HANDED = { coordinateSystem: Base.coordinateSystemEnum.rightHanded };
    const LEFT_HANDED = { coordinateSystem: Base.coordinateSystemEnum.leftHanded };

    type Relayed = { sent: BitbybitSettings[]; refusals: unknown[]; relay: SettingsRelay };

    const relayed = (answer: () => Promise<unknown> = () => new Promise(() => undefined)): Relayed => {
        const sent: BitbybitSettings[] = [];
        const refusals: unknown[] = [];
        const relay = new SettingsRelay((settings) => { sent.push(settings); return answer(); }, (reason) => { refusals.push(reason); });
        return { sent, refusals, relay };
    };

    it("should send checked settings to the worker and resolve without waiting for its answer", async () => {
        // Arrange
        const { sent, relay } = relayed();

        // Act
        const kept = await relay.set(RIGHT_HANDED, true);

        // Assert
        expect(kept).toEqual({ coordinateSystem: "rightHanded" });
        expect(sent).toEqual([{ coordinateSystem: "rightHanded" }]);
    });

    it("should keep settings given before a worker is set and send them when one is", async () => {
        // Arrange
        const { sent, relay } = relayed();
        await relay.set(LEFT_HANDED, false);
        const beforeTheWorker = [...sent];

        // Act
        relay.workerSet();

        // Assert
        expect([beforeTheWorker, sent]).toEqual([[], [{ coordinateSystem: "leftHanded" }]]);
    });

    it("should send a worker nothing when no settings were ever given", () => {
        // Arrange
        const { sent, relay } = relayed();

        // Act
        relay.workerSet();

        // Assert
        expect(sent).toEqual([]);
    });

    it.each([
        ["with a worker set", true],
        ["before any worker is set", false],
    ])("should reject a name that is no setting %s, send nothing and keep the settings it had", async (_name, toWorker) => {
        // Arrange
        const { sent, relay } = relayed();
        await relay.set(LEFT_HANDED, toWorker);
        sent.length = 0;

        // Act
        const refused = relay.set(JSON.parse("{\"cordinateSystem\":\"rightHanded\"}"), toWorker);
        await expect(refused).rejects.toThrow("`cordinateSystem` is not a setting");
        relay.workerSet();

        // Assert
        expect(sent).toEqual([{ coordinateSystem: "leftHanded" }]);
    });

    it("should send each worker a copy of its own, which a caller changing what it gave cannot reach", async () => {
        // Arrange
        const { sent, relay } = relayed();
        const given = { ...LEFT_HANDED };
        await relay.set(given, true);

        // Act
        given.coordinateSystem = Base.coordinateSystemEnum.rightHanded;
        relay.workerSet();

        // Assert
        expect(sent).toEqual([{ coordinateSystem: "leftHanded" }, { coordinateSystem: "leftHanded" }]);
        expect(sent[0]).not.toBe(sent[1]);
    });

    it("should report a worker's refusal, which no caller waits for", async () => {
        // Arrange
        const refusal = new Error("'setSettings' is not a call this worker knows");
        const { refusals, relay } = relayed(() => Promise.reject(refusal));

        // Act
        await relay.set(RIGHT_HANDED, true);
        await Promise.resolve();

        // Assert
        expect(refusals).toEqual([refusal]);
    });
});
