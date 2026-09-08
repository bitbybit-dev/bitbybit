const SESSION = Math.random().toString(36).slice(2, 10).padEnd(8, "0");
let counter = 0;

/**
 * Names a scene object so that no two objects share a name.
 *
 * Names reach exported files: glTF carries them through to whatever opens the model, and importers
 * are not all equally forgiving. The name must not end in a dot followed by digits - an importer
 * that reads that as a duplicate counter may parse a long run of digits into a fixed-width integer
 * and abort - which is why a bare random number is not usable here.
 *
 * Two parts do two different jobs. The counter makes every name in this context unique by
 * construction, not merely unlikely to repeat. The session part separates this context from every
 * other one, so names minted in another tab, another worker, or an earlier session that has since
 * been imported back into this scene cannot land on the same string.
 * @param prefix what the object is, which the suffix then makes unique
 * @returns the prefix followed by a suffix no other name shares
 */
export function uniqueName(prefix: string): string {
    counter += 1;
    return `${prefix}-${SESSION}-${counter}`;
}
