import { uniq, uniqBy, map } from "./transformers";
import { transformIterable } from "./iterable-utils";
import { toES6Map } from "./intermideate-consumers";

export const without = <T>(iterableToExclude: Iterable<T>) =>
    transformIterable<T, T, Set<T>>(
        {
            onValue: ({ value, state: exclude }) => ({
                values: exclude.has(value) ? [] : [value],
                state: exclude
            }),
            getInitialState: () => new Set(iterableToExclude)
        },
    );

export const union = <T>(srcIterable: Iterable<T>) => (targetIterable: Iterable<T>): Iterable<T> =>
    uniq<T>()(concat(srcIterable)(targetIterable));

export const unionBy = <T, P>(transFn: (item: T) => P, srcIterable: Iterable<T>) => (targetIterable: Iterable<T>): Iterable<T> =>
    uniqBy(transFn)(concat(srcIterable)(targetIterable));

export const difference = <T>(srcIterable: Iterable<T>) =>
    transformIterable<T, T, Set<T>>(
        {
            onValue: ({ value, state: diffSet }) => ({
                values: diffSet.has(value) ? [] : [value],
                state: diffSet
            }),
            getInitialState: () => new Set(srcIterable)
        },
    );

export const differnceBy = <T, P>(transFn: (item: T) => P, srcIterable: Iterable<T>) =>
    transformIterable<T, T, Set<P>>(
        {
            onValue: ({ value, state: diffSet }) => ({
                values: diffSet.has(transFn(value)) ? [] : [value],
                state: diffSet
            }),
            getInitialState: () => new Set(map(transFn)(srcIterable))
        },
    )

export const intersection = <T>(srcIterable: Iterable<T>) =>
    transformIterable<T, T, Set<T>>(
        {
            onValue: ({ value, state: diffSet }) => ({
                values: diffSet.has(value) ? [value] : [],
                state: diffSet
            }),
            getInitialState: () => new Set(srcIterable)
        },
    )

export const intersectionBy = <T, P>(transFn: (item: T) => P, srcIterable: Iterable<T>) =>
    transformIterable<T, T, Set<P>>(
        {
            onValue: ({ value, state: diffSet }) => ({
                values: diffSet.has(transFn(value)) ? [value] : [],
                state: diffSet
            }),
            getInitialState: () => new Set(map(transFn)(srcIterable))
        },
    )

export const xor = <T>(srcItearble: Iterable<T>) => (targetIterable: Iterable<T>) => {
    return transformIterable<T, T, Set<T>>(
        {
            onValue: ({ value, state: result }) => {
                const exist = result.has(value);

                result
                if (exist) {
                    result.delete(value)
                } else {
                    result.add(value)
                }

                return {
                    values: [],
                    state: result
                }
            },
            onDone: ({ state: result }) => result,
            getInitialState: () => new Set(srcItearble)
        },
    )
        (uniq<T>()(targetIterable))
}

export const xorBy = <T, P>(transFn: (item: T) => P, srcIterable: Iterable<T>) => (targetIterable: Iterable<T>) => {
    return transformIterable<T, T, Map<P, T>>(
        {
            onValue: ({ value, state: result }) => {
                const key = transFn(value);
                const exist = result.has(key);

                if (exist) {
                    result.delete(key);
                } else {
                    result.set(key, value);
                }

                result

                return {
                    values: [],
                    state: result
                }
            },
            onDone: ({ state: result }) => result.values(),
            getInitialState: () => toES6Map((item: T) => [transFn(item), item])(srcIterable)
        },
    )
        (uniq<T>()(targetIterable))
}

export const concat = <T>(srcIterable: Iterable<T>) => (targetIterable: Iterable<T>): Iterable<T> => {
    return {
        *[Symbol.iterator]() {
            yield* targetIterable;
            yield* srcIterable;
        },
    };
}

export const xprod = <P>(srcIterable: Iterable<P>) => <T>(targetIterable: Iterable<T>): Iterable<[T, P]> => {
    return {
        *[Symbol.iterator]() {
            for (let item1 of targetIterable) {
                for (let item2 of srcIterable) {
                    yield [item1, item2];
                }
            }
        },
    };
}

export const zip = <P>(srcItearble: Iterable<P>) => <T>(targetIterable: Iterable<T>): Iterable<[T, P]> => {
    return zipWith((item1: T, item2: P) => [item1, item2] as [T, P], srcItearble)(targetIterable);
}

export const zipWith = <T, P, R>(zipFn: (targetItem: T, srcItem: P) => R, srcIterable: Iterable<P>) =>
    (targetIterable: Iterable<T>): Iterable<R> => {
        return {
            *[Symbol.iterator]() {
                const srcIt = srcIterable[Symbol.iterator]();

                for (let targetItem of targetIterable) {
                    const { value: srcItem, done } = srcIt.next();

                    if (done) return;

                    yield zipFn(targetItem, srcItem);
                }
            },
        };
    }