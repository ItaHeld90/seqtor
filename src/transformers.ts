import { transformIterable } from "./iterable-utils";
import { negate } from "./helper-utils";
import { UnpackedArray } from "./general-types";

export function slice<T>(from: number, to: number) {
    return transformIterable<T, T, null>(
        {
            onValue: ({ value, idx }) => ({
                values: idx >= from && idx < to ? [value] : [],
                done: idx >= to,
            }),
        },
    );
}

export function groupWith<T>(compareFn: (item1: T, item2: T) => boolean) {
    return transformIterable<T, T[], { lastValue: T[] }>(
        {
            onValue: ({ value, state: { lastValue: currGroup } }) => {
                const lastItem = currGroup[currGroup.length - 1];
                const shouldAdd = currGroup.length === 0 || compareFn(value, lastItem);

                return {
                    values: shouldAdd ? [] : [currGroup],
                    state: { lastValue: shouldAdd ? [...currGroup, value] : [value] },
                };
            },
            getInitialState: () => ({ lastValue: [] as T[] }),
        },
    );
}

export function filter<T>(predicateFn: (item: T) => boolean) {
    return transformIterable<T, T, null>(
        {
            onValue: ({ value }) => ({ values: predicateFn(value) ? [value] : [] }),
        },
    );
}

export function reject<T>(predicateFn: (item: T) => boolean) {
    return filter(negate(predicateFn));
}

export function map<T, R>(mapperFn: (item: T) => R) {
    return transformIterable<T, R, null>(
        {
            onValue: ({ value }) => ({ values: [mapperFn(value)] }),
        },
    );
}

export function scan<T, P>(reducerFn: (acc: P, item: T) => P, initialValue: P) {
    return transformIterable<T, P, { lastValue: P }>(
        {
            onValue: ({ value, state: { lastValue } }) => {
                const result = reducerFn(lastValue, value);

                return {
                    values: [result],
                    state: { lastValue: result },
                };
            },
            getInitialState: () => ({ lastValue: initialValue })
        },
    )
}

export function uniq<T>() {
    return transformIterable<T, T, { hashset: Set<T> }>(
        {
            onValue: ({ value, state: { hashset } }) => ({
                values: hashset.has(value) ? [] : [value],
                state: { hashset: hashset.add(value) },
            }),
            getInitialState: () => ({ hashset: new Set<T>() })
        },
    )
}

export function uniqBy<T, P>(transFn: (item: T) => P) {
    return transformIterable<T, T, { hashset: Set<P> }>(
        {
            onValue: ({ value, state: { hashset } }) => {
                const key = transFn(value);
                return {
                    values: hashset.has(key) ? [] : [value],
                    state: { hashset: hashset.add(key) },
                };
            },
            getInitialState: () => ({ hashset: new Set<P>() })
        },
    )
}

export function initial<T>() {
    return transformIterable<T, T, { lastItem: T }>(
        {
            onValue: ({ value, idx, state: { lastItem } }) => ({
                values: idx > 0 ? [lastItem] : [],
                state: { lastItem: value },
            }),
            getInitialState: () => ({ lastItem: undefined as T })
        },
    )
}

export function take<T>(amount: number) {
    return transformIterable<T, T, null>(
        {
            onValue: ({ value, idx }) => ({
                values: [value],
                done: idx >= amount
            })
        },
    )
}

export function drop<T>(amount: number) {
    return transformIterable<T, T, null>(
        {
            onValue: ({ value, idx }) => ({
                values: idx >= amount ? [value] : []
            })
        },
    )
}

export function dropRepeats<T>() {
    return transformIterable<T, T, { lastItem: T }>(
        {
            onValue: ({ value, idx, state: { lastItem } }) => ({
                values: idx === 0 || value !== lastItem ? [value] : [],
                state: { lastItem: value },
            }),
            getInitialState: () => ({ lastItem: undefined as T })
        },
    )
}

export function dropRepeatsWith<T>(compareFn: (item1: T, item2: T) => boolean) {
    return transformIterable<T, T, { lastItem: T }>(
        {
            onValue: ({ value, idx, state: { lastItem } }) => ({
                values: idx === 0 || !compareFn(value, lastItem) ? [value] : [],
                state: { lastItem: value },
            }),
            getInitialState: () => ({ lastItem: undefined as T })
        },
    )
}

export function dropWhile<T>(conditionFn: (item: T) => boolean) {
    return transformIterable<T, T, { dropFlag: boolean }>(
        {
            onValue: ({ value, state: { dropFlag } }) => {
                const shouldDrop = dropFlag && conditionFn(value);
                return {
                    values: shouldDrop ? [] : [value],
                    state: { dropFlag: shouldDrop },
                };
            },
            getInitialState: () => ({ dropFlag: true })
        },
    )
}

export function takeWhile<T>(conditionFn: (item: T) => boolean) {
    return transformIterable<T, T, null>(
        {
            onValue: ({ value }) => {
                const shouldTake = conditionFn(value);
                return {
                    values: shouldTake ? [value] : [],
                    done: !shouldTake,
                };
            }
        },
    )
}

export function tail<T>() {
    return transformIterable<T, T, null>(
        {
            onValue: ({ value, idx }) => ({ values: idx > 0 ? [value] : [] })
        },
    )
}

export function chunk<T>(size: number) {
    return transformIterable<T, T[], { currChunk: T[] }>(
        {
            onValue: ({ value, state, state: { currChunk } }) => {
                currChunk.push(value);
                const isFull = currChunk.length >= size;
                return {
                    values: isFull ? [currChunk] : [],
                    state: isFull ? { currChunk: [] } : state
                }
            },
            onDone: ({ state: { currChunk } }) => currChunk.length ? [currChunk] : [],
            getInitialState: () => ({ currChunk: [] as T[] })
        },
    )
}

export function splitAt<T>(splitIdx: number) {
    return transformIterable<T, T[], { currChunk: T[] }>(
        {
            onValue: ({ value, idx, state: { currChunk } }) => {
                const isSplitPoint = idx === splitIdx;
                const nextChunk = isSplitPoint ? [value] : (currChunk.push(value), currChunk)
                return {
                    values: isSplitPoint ? [currChunk] : [],
                    state: { currChunk: nextChunk }
                }
            },
            onDone: ({ idx, state: { currChunk } }) => idx >= splitIdx ? [currChunk] : [currChunk, []],
            getInitialState: () => ({ currChunk: [] as T[] })
        },
    )
}

export function splitWhen<T>(predicateFn: (item: T) => boolean) {
    return transformIterable<T, T[], { currChunk: T[], hasSplit: boolean }>(
        {
            onValue: ({ value, state: { currChunk, hasSplit } }) => {
                const isSplitPoint = !hasSplit && predicateFn(value);
                const nextChunk = isSplitPoint ? [value] : (currChunk.push(value), currChunk)
                return {
                    values: isSplitPoint ? [currChunk] : [],
                    state: { currChunk: nextChunk, hasSplit: hasSplit || isSplitPoint }
                }
            },
            onDone: ({ state: { currChunk, hasSplit } }) => hasSplit ? [currChunk] : [currChunk, []],
            getInitialState: () => ({ currChunk: [] as T[], hasSplit: false })
        },
    )
}

export function compact<T>() {
    return transformIterable<T, T, null>(
        {
            onValue: ({ value }) => ({ values: !value ? [] : [value] })
        },
    )
}

export function update<T>(idxToUpdate: number, newItem: T) {
    return transformIterable<T, T, null>(
        {
            onValue: ({ value, idx }) => ({ values: idx === idxToUpdate ? [newItem] : [value] })
        },
    )
}

export function adjust<T>(idxToAdjust: number, transFn: (item: T) => T) {
    return transformIterable<T, T, null>(
        {
            onValue: ({ value, idx }) => ({
                values: idx === idxToAdjust ? [transFn(value)] : [value]
            })
        },
    )
}

export function insert<T>(idxToInsert: number, itemToInsert: T) {
    return transformIterable<T, T, null>(
        {
            onValue: ({ value, idx }) => ({
                values: idx === idxToInsert ? [itemToInsert, value] : [value]
            })
        },
    )
}

export function insertAll<T>(idxToInsert: number, itemsToInsert: T[]) {
    return transformIterable<T, T, null>(
        {
            onValue: ({ value, idx }) => ({
                values: idx === idxToInsert ? [...itemsToInsert, value] : [value]
            })
        },
    )
}

export function remove<T>(start: number, amount: number) {
    return transformIterable<T, T, null>(
        {
            onValue: ({ value, idx }) => ({
                values: idx < start || idx >= start + amount ? [value] : []
            })
        },
    )
}

export function intersperse<T>(separatorItem: T) {
    return transformIterable<T, T, null>(
        {
            onValue: ({ value, idx }) => ({
                values: idx > 0 ? [separatorItem, value] : [value]
            })
        },
    )
}

export function prepend<T>(itemToPrepend: T) {
    return transformIterable<T, T, null>(
        {
            onValue: ({ value, idx }) => ({
                values: idx === 0 ? [itemToPrepend, value] : [value]
            }),
        },
    )
}

export function append<T>(itemToAppend: T) {
    return transformIterable<T, T, null>(
        {
            onValue: ({ value }) => ({
                values: [value]
            }),
            onDone: () => [itemToAppend]
        },
    )
}

export function flatten<T>(): (iterable: Iterable<T>) => Iterable<UnpackedArray<T>> {
    return transformIterable(
        {
            onValue: ({ value }) => ({
                values: Array.isArray(value) ? value : [value]
            })
        },
    )
}

export function flattenDeep<T>(): (iterable: Iterable<T>) => Iterable<any> {
    return transformIterable<T, any, null>(
        {
            onValue: ({ value }) => ({
                values: Array.isArray(value) ? flattenDeep()(value) : [value]
            })
        },
    )
}

export function flatMap<T, R>(mapperFn: (item: T) => R): (iterable: Iterable<T>) => Iterable<UnpackedArray<R>> {
    return transformIterable(
        {
            onValue: ({ value }) => {
                const mappedValue = mapperFn(value);
                return {
                    values: Array.isArray(mappedValue) ? mappedValue : [mappedValue]
                }
            }
        },
    );
}