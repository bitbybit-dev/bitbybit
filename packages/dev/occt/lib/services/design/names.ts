import type * as Models from "../../api/models";

/** Per face of a shape, in `shapes.face.getFaces` order, the names references find it by, sorted. */
export type FaceNames = string[][];

/** The name a feature gives the faces it makes in `role`, from the sketch command `from` when given. */
export function nameOf(feature: string, role: string, from?: string): string {
    return from === undefined ? `${feature}:${role}` : `${feature}:${role}:${from}`;
}

/** The name copy `index` of a pattern or mirror gives a face the original held as `name`. */
export function copyNameOf(name: string, copier: string, index: number): string {
    return `${name}@${copier}#${index}`;
}

/** A shape's earlier names and what an operation made of that shape's faces. */
export interface NamedSource {
    names: FaceNames;
    history: Models.OCCT.ShapeHistory;
}

/**
 * The names of a result's `faceCount` faces: each face takes every name of the source faces that
 * became it, then the names `given` lists for it. Faces that end up with no name at all take
 * `unnamed`, when given, such as the `new` faces of a boolean.
 */
export function carryNames(faceCount: number, sources: NamedSource[], given: ReadonlyMap<number, string[]>, unnamed?: string): FaceNames {
    const names = Array.from({ length: faceCount }, () => new Set<string>());
    for (const source of sources) {
        source.names.forEach((sourceNames, sourceFace) => {
            for (const face of source.history.faces[sourceFace] ?? []) {
                sourceNames.forEach(name => names[face]?.add(name));
            }
        });
    }
    given.forEach((list, face) => list.forEach(name => names[face]?.add(name)));
    if (unnamed !== undefined) {
        names.forEach(set => {
            if (set.size === 0) {
                set.add(unnamed);
            }
        });
    }
    return names.map(set => [...set].sort());
}

/** Adds `name` to the names `given` lists for each of `faces`. */
export function give(given: Map<number, string[]>, faces: readonly number[], ...names: string[]): void {
    for (const face of faces) {
        given.set(face, [...(given.get(face) ?? []), ...names]);
    }
}

/** A face name without its copy marks, and the copy each pattern level marks it with. */
export interface NameParts {
    base: string;
    copies: Map<string, number>;
}

/**
 * A face name taken apart, by the grammar `feature:role[:from]` followed by one `@copier#index` for
 * each pattern or mirror that copied the face, in the order they ran: the base and, by copier, the
 * index of the copy.
 */
export function nameParts(name: string): NameParts {
    const [base, ...tags] = name.split("@");
    return {
        base: base!,
        copies: new Map(tags.map(tag => {
            const split = tag.lastIndexOf("#");
            return [tag.slice(0, split), Number(tag.slice(split + 1))] as const;
        })),
    };
}

/**
 * The faces holding a name with `base` and the copies `levels` asks for: each listed copier's copy
 * `index` (any copy or the original for `"all"`), and the original at every level not listed.
 */
export function facesCopied(names: FaceNames, base: string, levels: readonly Models.OCCT.DesignCopy[]): number[] {
    const listed = new Map(levels.map(level => [level.of, level.index]));
    const matches = (name: string): boolean => {
        const parts = nameParts(name);
        if (parts.base !== base) {
            return false;
        }
        for (const [copier, index] of parts.copies) {
            const wanted = listed.get(copier);
            if (wanted === undefined || (wanted !== "all" && wanted !== index)) {
                return false;
            }
        }
        return levels.every(level => level.index === "all" || parts.copies.get(level.of) === level.index);
    };
    return names.flatMap((list, face) => list.some(matches) ? [face] : []);
}

/** The faces whose names hold `name`, ascending. */
export function facesNamed(names: FaceNames, name: string): number[] {
    const faces: number[] = [];
    names.forEach((list, face) => {
        if (list.includes(name)) {
            faces.push(face);
        }
    });
    return faces;
}

/** Every name of every face, renamed as copy `index` of `copier` names it. */
export function copyNames(names: FaceNames, copier: string, index: number): FaceNames {
    return names.map(list => list.map(name => copyNameOf(name, copier, index)));
}
