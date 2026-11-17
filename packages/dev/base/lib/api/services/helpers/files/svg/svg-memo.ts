export function remembered<K, V>(known: Map<K, V>, key: K, read: (key: K) => V): V {
    if (!known.has(key)) {
        const value = read(key);
        known.set(key, value);
        return value;
    }
    return known.get(key) as V;
}
