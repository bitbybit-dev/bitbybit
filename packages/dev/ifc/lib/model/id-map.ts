import { TRIE_LEVELS, TRIE_MASK, TRIE_WIDTH } from "./constants";
import type { TrieNode } from "./model-types";

function slotAt(id: number, level: number): number {
    return Math.floor(id / TRIE_WIDTH ** level) & TRIE_MASK;
}

function writable<V>(node: TrieNode<V> | undefined, level: number, owner: object): TrieNode<V> {
    if (node?.owner === owner) {
        return node;
    }
    if (!node) {
        return level === 0 ? { owner, children: [], values: new Array<V | undefined>(TRIE_WIDTH) } : { owner, children: new Array<TrieNode<V> | undefined>(TRIE_WIDTH), values: [] };
    }
    return { owner, children: level === 0 ? node.children : node.children.slice(), values: level === 0 ? node.values.slice() : node.values };
}

function valueAt<V>(root: TrieNode<V> | undefined, id: number): V | undefined {
    let node = root;
    for (let level = TRIE_LEVELS - 1; level > 0 && node; level--) {
        node = node.children[slotAt(id, level)];
    }
    return node?.values[id & TRIE_MASK];
}

function visit<V>(node: TrieNode<V>, level: number, prefix: number, each: (value: V, id: number) => void): void {
    for (let slot = 0; slot < TRIE_WIDTH; slot++) {
        const id = prefix * TRIE_WIDTH + slot;
        if (level === 0) {
            const value = node.values[slot];
            if (value !== undefined) {
                each(value, id);
            }
        } else {
            const child = node.children[slot];
            if (child) {
                visit(child, level - 1, id, each);
            }
        }
    }
}

export class IdMap<V> {
    readonly size: number;
    private readonly root: TrieNode<V> | undefined;

    private constructor(root: TrieNode<V> | undefined, size: number) {
        this.root = root;
        this.size = size;
    }

    static empty<V>(): IdMap<V> {
        return new IdMap<V>(undefined, 0);
    }

    get(id: number): V | undefined {
        return valueAt(this.root, id);
    }

    has(id: number): boolean {
        return this.get(id) !== undefined;
    }

    withChanges(changes: Iterable<readonly [number, V | undefined]>): IdMap<V> {
        const owner = {};
        let root = this.root;
        let size = this.size;
        for (const [id, value] of changes) {
            if (value === undefined && valueAt(root, id) === undefined) {
                continue;
            }
            root = writable(root, TRIE_LEVELS - 1, owner);
            let node = root;
            for (let level = TRIE_LEVELS - 1; level > 0; level--) {
                const slot = slotAt(id, level);
                const child = writable(node.children[slot], level - 1, owner);
                node.children[slot] = child;
                node = child;
            }
            const slot = id & TRIE_MASK;
            const before = node.values[slot];
            node.values[slot] = value;
            size += (value === undefined ? 0 : 1) - (before === undefined ? 0 : 1);
        }
        return root === this.root ? this : new IdMap(root, size);
    }

    forEach(each: (value: V, id: number) => void): void {
        if (this.root) {
            visit(this.root, TRIE_LEVELS - 1, 0, each);
        }
    }
}
