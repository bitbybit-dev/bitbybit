export function recentlyUsed<T>(store: Map<string, T>, key: string): T | undefined {
    const known = store.get(key);
    if (known !== undefined) {
        store.delete(key);
        store.set(key, known);
    }
    return known;
}
