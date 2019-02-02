import { transformIterable, consumeIterable } from "./iterable-utils";
import { _times, shuffleArrN, randomInRange, shuffleArr } from "./helper-utils";
import { CompareFn, PropKey } from "./general-types";
import { take } from "./transformers";
import { nth, size } from "./consumers";

export const partitionMulti = <T>(...predicates: ((item: T) => boolean)[]) =>
    transformIterable<T, T[], T[][]>(
        {
            onValue: ({ value, state }) => {
                const validPredIdx = predicates.findIndex(pred => pred(value));
                const resultIdx = validPredIdx === -1
                    ? predicates.length
                    : validPredIdx;

                state[resultIdx].push(value);

                return {
                    values: [],
                    state
                };
            },
            onDone: ({ state }) => state,
            getInitialState: () => _times(predicates.length + 1, () => [])
        },
    )

export function shuffle<T>(iterable: Iterable<T>): Iterable<T> {
    return {
        *[Symbol.iterator]() {
            const arr = toArray<T>()(iterable);
            yield* shuffleArr(arr);
        }
    }
}

export function sample<T>(iterable: Iterable<T>): T {
    const len = size()(iterable);
    const idxToSample = randomInRange(0, len - 1);
    return nth<T>(idxToSample)(iterable);
}

export const sampleSize = (size: number) => <T>(iterable: Iterable<T>) => {
    return {
        *[Symbol.iterator]() {
            const arr = toArray<T>()(iterable);
            const len = arr.length;
            const numSample = Math.min(size, len);

            const shuffled = shuffleArrN(arr, numSample - 1);
            yield* take<T>(numSample)(shuffled);
        }
    }
}

export function reverse<T>(iterable: Iterable<T>): Iterable<T> {
    return {
        *[Symbol.iterator]() {
            const arr = toArray<T>()(iterable);
            const length = arr.length;

            for (let i = length - 1; i >= 0; i--) {
                yield arr[i];
            }
        },
    };
}

export const sort = <T>(compareFn: (item1: T, item2: T) => number) => (iterable: Iterable<T>) => {
    return {
        *[Symbol.iterator]() {
            const arr = toArray<T>()(iterable);

            for (let item of arr.sort(compareFn)) {
                yield item;
            }
        },
    };
}

export const sortBy = <T>(transFn: (item: T) => number) => (iterable: Iterable<T>) => {
    const compareFn = (item1: T, item2: T) => {
        const val1 = transFn(item1);
        const val2 = transFn(item2);

        return val1 < val2 ? -1 : val2 < val1 ? 1 : 0;
    };

    return sort(compareFn)(iterable);
}

export const sortWith = <T>(compareFns: CompareFn<T>[]) => (iterable: Iterable<T>) => {
    const compareFn = (item1: T, item2: T) => {
        let result = 0;
        let fnIdx = 0;

        while (result === 0 && fnIdx < compareFns.length) {
            result = compareFns[fnIdx](item1, item2);
            fnIdx++;
        }

        return result;
    };

    return sort(compareFn)(iterable);
}

export function toArray<T>() {
    return consumeIterable<T, T[], null>(
        {
            onValue: ({ acc, value }) => {
                acc.push(value);
                return {
                    result: acc
                }
            },
            initialValue: [] as T[]
        },
    )
}

export function toSet<T>(iterable: Iterable<T>) {
    return new Set(iterable);
}

export function toMap<T, V>(keyValFn: (item: T) => [PropKey, V]) {
    return consumeIterable<T, { [key: string]: V }, null>(
        {
            onValue: ({ acc, value }) => {
                const [key, val] = keyValFn(value);
                acc[key] = val;
                return {
                    result: acc
                }
            },
            initialValue: {} as { [key: string]: V }
        },
    )
}

export function toES6Map<T, K, V>(keyValFn: (item: T) => [K, V]) {
    return consumeIterable<T, Map<K, V>, null>(
        {
            onValue: ({ acc, value }) => {
                const [key, val] = keyValFn(value);

                return {
                    result: acc.set(key, val)
                }
            },
            initialValue: new Map<K, V>()
        },
    )
}

export const partition = <T>(predicateFn: (item: T) => boolean) =>
    consumeIterable<T, [T[], T[]], null>(
        {
            onValue: ({ acc, value }) => {
                const [passed, rejected] = acc;

                if (predicateFn(value)) {
                    passed.push(value);
                } else {
                    rejected.push(value);
                }

                return {
                    result: acc
                }
            },
            initialValue: [[], []] as [T[], T[]]
        },
    )

export function head<T>(iterable: Iterable<T>) {
    return iterable[Symbol.iterator]().next().value;
}

export const tap = <T>(fn: (intermediateValue: T[]) => void) => (iterable: Iterable<T>) => {
    const intermediateArr = toArray<T>()(iterable);
    fn(intermediateArr);
    return intermediateArr;
}

export const log = (label: string) => <T>(iterable: Iterable<T>) => {
    const intermediateArr = toArray<T>()(iterable);
    console.log(label + ':', intermediateArr);
    return intermediateArr;
}