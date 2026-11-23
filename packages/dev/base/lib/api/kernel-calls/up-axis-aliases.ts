import { Base } from "../inputs/base-inputs";
import { InputError } from "./errors";

const UP_AXIS = "upAxis";

const FLAG_TURNS: readonly (readonly [string, Base.upAxisConversionEnum])[] = [
    ["adjustZtoY", Base.upAxisConversionEnum.zUpToYUp],
    ["adjustYtoZ", Base.upAxisConversionEnum.yUpToZUp],
];

const UP_AXIS_VALUES: readonly unknown[] = Object.values(Base.upAxisConversionEnum);

type Decided = { readonly value: Base.upAxisConversionEnum; readonly by: string | undefined };

function refused(by: string, flag: string, given: boolean): InputError {
    const said = by === UP_AXIS ? "`upAxis` chooses another turn" : `\`${by}\` asks for another turn`;
    return new InputError(`\`${flag}\` is ${String(given)}, but ${said}: give \`upAxis\` alone, since \`${flag}\` is deprecated.`, flag);
}

function decidedBy(given: Readonly<Record<string, unknown>>, axis: Base.upAxisConversionEnum, fallback: Base.upAxisConversionEnum): Decided {
    let decided: Decided = { value: axis, by: axis === fallback ? undefined : UP_AXIS };
    for (const [flag, turn] of FLAG_TURNS) {
        const value = given[flag];
        if (typeof value !== "boolean" || value === (turn === fallback)) {
            continue;
        }
        const asked = value ? turn : Base.upAxisConversionEnum.keep;
        if (decided.by !== undefined && decided.value !== asked) {
            throw refused(decided.by, flag, value);
        }
        decided = { value: asked, by: decided.by ?? flag };
    }
    return decided;
}

/**
 * Lays the deprecated `adjustZtoY` and `adjustYtoZ` flags of a caller's inputs onto the `upAxis`
 * of a DTO whose defaults carry one, and drops them. A flag at its released default (true where the
 * DTO's `upAxis` defaults to the flag's turn, false elsewhere) decides nothing, as an old example or
 * an old positional constructor spells it. Set the other way it decides: true chooses the flag's
 * turn, false `keep`. A deciding flag wins over an `upAxis` equal to its default, since an editor
 * passes every input and an explicit default cannot be told from one laid; it is refused beside an
 * `upAxis` that chooses another turn, or beside the other flag deciding another one. An `upAxis`
 * that is no turn is left for the method to refuse.
 * @param resolved - The inputs over the DTO's defaults, changed in place
 * @param given - The inputs as the caller passed them
 * @param defaults - The DTO's defaults
 * @throws InputError when the flags and `upAxis` ask for different turns, naming both
 */
export function layUpAxisFlags(resolved: Record<string, unknown>, given: Readonly<Record<string, unknown>>, defaults: Readonly<Record<string, unknown>>): void {
    const fallback = defaults[UP_AXIS];
    if (!UP_AXIS_VALUES.includes(fallback) || !FLAG_TURNS.some(([flag]) => typeof given[flag] === "boolean")) {
        return;
    }
    const axis = resolved[UP_AXIS];
    if (UP_AXIS_VALUES.includes(axis)) {
        resolved[UP_AXIS] = decidedBy(given, axis as Base.upAxisConversionEnum, fallback as Base.upAxisConversionEnum).value;
    }
    for (const [flag] of FLAG_TURNS) {
        delete resolved[flag];
    }
}

/**
 * The turn an operation was asked for, among the ones it can make: an operation that reads Z-up
 * files takes `keep` and `zUpToYUp`, one that writes for Z-up tools `keep` and `yUpToZUp`.
 * @param value - The `upAxis` the operation received
 * @param accepted - The turns the operation makes
 * @returns The turn, typed
 * @throws InputError when the value is not among `accepted`, naming the turns that are
 */
export function checkedUpAxis(value: unknown, accepted: readonly Base.upAxisConversionEnum[]): Base.upAxisConversionEnum {
    if (!accepted.includes(value as Base.upAxisConversionEnum)) {
        const takes = accepted.map(turn => `\`${turn}\``).join(" or ");
        throw new InputError(`\`${UP_AXIS}\` is \`${String(value)}\`, which this method does not take: it takes ${takes}.`, UP_AXIS);
    }
    return value as Base.upAxisConversionEnum;
}
