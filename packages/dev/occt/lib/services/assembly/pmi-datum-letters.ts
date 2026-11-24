import { InputError } from "@bitbybit-dev/base";
import type { HeldDatum, KernelPmiInput, KernelPmiPlace } from "./pmi-types";

const ONE_DATUM_PER_LETTER = "a letter names one datum in a document, since its STEP file holds one datum per letter for all its parts";

const placeKey = (place: KernelPmiPlace): string => JSON.stringify([place.part, place.face, place.edge, place.vertex]);

const keysOf = (places: readonly KernelPmiPlace[]): string => [...new Set(places.map(placeKey))].sort().join(" ");

const heldText = (held: HeldDatum): string => `${held.entry} on ${held.where}`;

const checkDatums = (given: KernelPmiInput, held: readonly HeldDatum[]): void => {
    given.datums.forEach((datum, at) => {
        const letter: unknown = datum.letter;
        if (typeof letter !== "string") {
            return;
        }
        const property = `datums[${at}].letter`;
        const earlier = given.datums.findIndex(other => other.letter === letter);
        if (earlier < at) {
            throw new InputError(`\`${property}\` gives ${letter} again, after \`datums[${earlier}]\`; ${ONE_DATUM_PER_LETTER}.`, property);
        }
        const sameLetter = held.filter(entry => entry.letter === letter);
        const shapes = keysOf(datum.shapes);
        if (sameLetter.length > 0 && !sameLetter.some(entry => keysOf(entry.places) === shapes)) {
            throw new InputError(`\`${property}\` gives ${letter}, which the document already gives datum ${heldText(sameLetter[0]!)}; ${ONE_DATUM_PER_LETTER}. Give ${letter} on those shapes to refer to that datum, or another letter.`, property);
        }
    });
};

const checkFrames = (given: KernelPmiInput, held: readonly HeldDatum[]): void => {
    const declared = new Set<unknown>(given.datums.map(datum => datum.letter));
    given.tolerances.forEach((tolerance, at) => {
        (tolerance.datums ?? []).forEach((letter: unknown, place) => {
            if (typeof letter !== "string" || declared.has(letter)) {
                return;
            }
            const property = `tolerances[${at}].datumLetters[${place}]`;
            const kept = held.find(entry => entry.letter === letter);
            throw kept === undefined
                ? new InputError(`\`${property}\` names datum ${letter}, which neither \`datums\` nor the document gives.`, property)
                : new InputError(`\`${property}\` names datum ${letter}, which the document gives (${heldText(kept)}) but this call does not; a tolerance is linked only to a datum given in the same call, so give ${letter} in \`datums\` again on those shapes, which keeps it one datum.`, property);
        });
    });
};

export const checkDatumLetters = (given: KernelPmiInput, held: readonly HeldDatum[]): void => {
    checkDatums(given, held);
    checkFrames(given, held);
};

/** `places` with each place kept once, where it first appears, as a datum's shapes are compared. */
export const withoutRepeats = (places: readonly KernelPmiPlace[]): KernelPmiPlace[] => {
    const seen = new Set<string>();
    return places.filter(place => {
        const key = placeKey(place);
        const first = !seen.has(key);
        seen.add(key);
        return first;
    });
};

/**
 * `given` with each datum that gives again a datum the document holds carrying that datum's places
 * as the document holds them, a place repeated in a STEP file included, since the kernel keeps one
 * datum per letter and list of places.
 */
export const asHeldDatums = (given: KernelPmiInput, held: readonly HeldDatum[]): KernelPmiInput => ({
    ...given,
    datums: given.datums.map(datum => {
        const same = held.find(entry => entry.letter === datum.letter && keysOf(entry.places) === keysOf(datum.shapes));
        return same === undefined ? datum : { ...datum, shapes: [...same.places] };
    }),
});

export const namesDatums = (given: KernelPmiInput): boolean => given.datums.length > 0 || given.tolerances.some(tolerance => (tolerance.datums ?? []).length > 0);
