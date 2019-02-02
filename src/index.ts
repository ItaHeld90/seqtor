// import { ObservableMap } from 'mobx';
import { range as rangeArr } from 'lodash';

// Utils
function isBetweenRange(num1: number, num2: number, numToCheck: number) {
    const min = Math.max(num1, num2);
    const max = Math.min(num1, num2);

    return numToCheck > min && numToCheck < max;
}

function negate<T extends any[]>(fn: (...args: T) => boolean): (...args: T) => boolean {
    return (...args: T) => !fn(...args);
}

const shuffleArr = <T>(arr: T[]): T[] => {
    return shuffleArrN(arr);
}

const shuffleArrN = <T>(arr: T[], maxIdx: number = arr.length - 1): T[] => {
    function recurse(startIdx: number) {
        if (startIdx >= maxIdx) return;

        const rndIdx = randomInRange(startIdx, arr.length - 1);
        swap(startIdx, rndIdx, arr);
        recurse(startIdx + 1);
    }

    recurse(0);
    return arr;
}

const swap = <T>(idx1: number, idx2: number, arr: T[]) => {
    const temp = arr[idx1];
    arr[idx1] = arr[idx2];
    arr[idx2] = temp;
}

const randomInRange = (min: number, max: number) => {
    return Math.floor(min + Math.random() * (max - min + 1));
}

const _times = <T>(amount: number, fn: (idx: number) => T): T[] => {
    const result = [];

    for (let i = 0; i < amount; i++) {
        result.push(fn(i));
    }

    return result;
}

export const generatorToReusableIterable = <T, Args extends any[]>(genFn: (...args: Args) => IterableIterator<T>, ...args: Args) => {
    return {
        *[Symbol.iterator]() {
            yield* genFn(...args);
        }
    }
}


// Pipe Wrapper

interface IPipe<T extends any[], R> {
    <R1 extends R>(f1: (...args: T) => R1): R1 extends Iterable<infer U> ? IPipeWrapper<U> : any
    <R1 extends R, R2 extends R>(f1: (...args: T) => R1, f2: (a: R1) => R2): R2 extends Iterable<infer U> ? IPipeWrapper<U> : any;
    <R1 extends R, R2 extends R, R3 extends R>(f1: (...args: T) => R1, f2: (a: R1) => R2, f3: (a: R2) => R3): R3 extends Iterable<infer U> ? IPipeWrapper<U> : any;
    <R1 extends R, R2 extends R, R3 extends R, R4 extends R>(f1: (...args: T) => R1, f2: (a: R1) => R2, f3: (a: R2) => R3, f4: (a: R3) => R4): R4 extends Iterable<infer U> ? IPipeWrapper<U> : any;
    <R1 extends R, R2 extends R, R3 extends R, R4 extends R, R5 extends R>(f1: (...args: T) => R1, f2: (a: R1) => R2, f3: (a: R2) => R3, f4: (a: R3) => R4, f5: (a: R4) => R5): R5 extends Iterable<infer U> ? IPipeWrapper<U> : any;
    <R1 extends R, R2 extends R, R3 extends R, R4 extends R, R5 extends R, R6 extends R>(f1: (...args: T) => R1, f2: (a: R1) => R2, f3: (a: R2) => R3, f4: (a: R3) => R4, f5: (a: R4) => R5, f6: (a: R5) => R6): R6 extends Iterable<infer U> ? IPipeWrapper<U> : any;
    <R1 extends R, R2 extends R, R3 extends R, R4 extends R, R5 extends R, R6 extends R, R7 extends R>(f1: (...args: T) => R1, f2: (a: R1) => R2, f3: (a: R2) => R3, f4: (a: R3) => R4, f5: (a: R4) => R5, f6: (a: R5) => R6, f7: (a: R6) => R7): R7 extends Iterable<infer U> ? IPipeWrapper<U> : any;
}

interface IPipeWrapper<T> {
    pipe: IPipe<[Iterable<T>], Iterable<any>>;
    consume: <R>(consumeFn: (iterable: Iterable<T>) => R) => R;
    toArray: () => T[];
    toMap: <V>(keyValFn: (item: T) => [PropKey, V]) => { [key: string]: V };
    toSet: () => Set<T>;
    toES6Map: <K, V>(keyValFn: (item: T) => [K, V]) => Map<K, V>,
    value: Iterable<T>;
}

function pipeWrapper<T>(iterable: Iterable<T>): IPipeWrapper<T> {
    return {
        pipe: (...fns: any[]) => {
            return pipeWrapper(
                fns.reduce(
                    (result, fn) => fn(result),
                    iterable
                )
            )
        },
        consume: <R>(consumeFn: (iterable: Iterable<T>) => R) => consumeFn(iterable),
        toArray: () => toArray<T>()(iterable),
        toMap: <V>(keyValFn: (item: T) => [PropKey, V]) => toMap(keyValFn)(iterable),
        toSet: () => toSet(iterable),
        toES6Map: <K, V>(keyValFn: (item: T) => [K, V]) => toES6Map(keyValFn)(iterable),
        value: iterable
    }
}

const result = pipeWrapper([1, 2, 3])
    .pipe(map(num => num * 2), filter(num => num > 2), map(() => 'hello'))
    .toArray()
// .toMap(num => [num, num + 1])

result

// Wrapper

type UnpackedArray<T> = T extends (infer U)[] ? U : T;
type CompareFn<T> = (item1: T, item2: T) => number;
type PropKey = string | number;

interface IWrapper<T> {
    [Symbol.iterator]: () => Iterator<T>;
    each: (fn: (item: T) => void) => void;
    reduce: <P>(reducerFn: (acc: P, item: T) => P, initialValue: P) => P;
    every: (predicateFn: (item: T) => boolean) => boolean;
    some: (predicateFn: (item: T) => boolean) => boolean;
    none: (predicateFn: (item: T) => boolean) => boolean;
    includes: (itemToFind: T) => boolean;
    countBy: (keyFn: (item: T) => PropKey) => { [key: string]: number };
    groupBy: (keyFn: (item: T) => PropKey) => { [key: string]: T[] };
    groupWith: (compareFn: (item1: T, item2: T) => boolean) => IWrapper<T[]>;
    keyBy: (keyFn: (item: T) => PropKey) => { [key: string]: T };
    sumBy: (valueFn: (item: T) => number) => number;
    maxBy: (valueFn: (item: T) => number) => number;
    minBy: (valueFn: (item: T) => number) => number;
    size: () => number;
    find: (predicateFn: (item: T) => boolean) => T;
    findIndex: (predicateFn: (item: T) => boolean) => number;
    indexOf: (itemToFind: T) => number;
    nth: (n: number) => T;
    filter: (predicateFn: (item: T) => boolean) => IWrapper<T>;
    reject: (predicateFn: (item: T) => boolean) => IWrapper<T>;
    uniq: () => IWrapper<T>;
    uniqBy: <P>(transFn: (item: T) => P) => IWrapper<T>;
    map: <P>(mapperFn: (item: T) => P) => IWrapper<P>;
    flatMap: <P>(mapperFn: (item: T) => P) => IWrapper<UnpackedArray<P>>;
    flatten: () => IWrapper<UnpackedArray<T>>;
    flattenDeep: () => IWrapper<any>;
    scan: <P>(reducerFn: (acc: P, item: T) => P, initialValue: P) => IWrapper<P>;
    take: (amount: number) => IWrapper<T>;
    takeWhile: (conditionFn: (item: T) => boolean) => IWrapper<T>;
    initial: () => IWrapper<T>;
    drop: (amount: number) => IWrapper<T>;
    dropWhile: (conditionFn: (item: T) => boolean) => IWrapper<T>;
    dropRepeats: () => IWrapper<T>;
    dropRepeatsWith: (compareFn: (item1: T, item2: T) => boolean) => IWrapper<T>;
    tail: () => IWrapper<T>;
    chunk: (size: number) => IWrapper<T[]>;
    splitAt: (idx: number) => IWrapper<T[]>;
    splitWhen: (predicateFn: (item: T) => boolean) => IWrapper<T[]>;
    compact: () => IWrapper<T>;
    prepend: (itemToPrepend: T) => IWrapper<T>;
    append: (itemToAppend: T) => IWrapper<T>;
    concat: (iterableToAppend: Iterable<T>) => IWrapper<T>;
    without: (iterableToExclude: Iterable<T>) => IWrapper<T>;
    union: (iterableToAppend: Iterable<T>) => IWrapper<T>;
    unionBy: <P>(transFn: (item: T) => P, iterableToAppend: Iterable<T>) => IWrapper<T>;
    difference: (otherIterable: Iterable<T>) => IWrapper<T>;
    differenceBy: <P>(transFn: (item: T) => P, otherIterable: Iterable<T>) => IWrapper<T>;
    intersection: (otherIterable: Iterable<T>) => IWrapper<T>;
    intersectionBy: <P>(transFn: (item: T) => P, otherIterable: Iterable<T>) => IWrapper<T>;
    xor: (otherIterable: Iterable<T>) => IWrapper<T>;
    xorBy: <P>(transFn: (item: T) => P, otherIterable: Iterable<T>) => IWrapper<T>;
    xprod: <P>(iterableToAplly: Iterable<P>) => IWrapper<[T, P]>;
    zip: <P>(iterableToApply: Iterable<P>) => IWrapper<[T, P]>;
    zipWith: <P, R>(zipFn: (item1: T, item2: P) => R, iterableToApply: Iterable<P>) => IWrapper<R>;
    adjust: (idxToAdjust: number, transFn: (item: T) => T) => IWrapper<T>;
    update: (idxToUpdate: number, newItem: T) => IWrapper<T>;
    insert: (idxToInsert: number, itemToInsert: T) => IWrapper<T>;
    insertAll: (idxToInsert: number, itemsToInsert: T[]) => IWrapper<T>;
    remove: (start: number, amount: number) => IWrapper<T>;
    slice: (from: number, to: number) => IWrapper<T>;
    intersperse: (separatorItem: T) => IWrapper<T>;
    join: (separator: string) => string;
    partition: (predicateFn: (item: T) => boolean) => [T[], T[]];
    reverse: () => IWrapper<T>;
    sort: (compareFn: CompareFn<T>) => IWrapper<T>;
    sortBy: (transFn: (item: T) => number) => IWrapper<T>;
    sortWith: (compareFns: CompareFn<T>[]) => IWrapper<T>;
    partitionMulti: (...predicates: ((item: T) => boolean)[]) => IWrapper<T[]>;
    shuffle: () => IWrapper<T>;
    sample: () => T;
    sampleSize: (size: number) => IWrapper<T>;
    toArray: () => T[];
    toMap: <V>(keyValFn: (item: T) => [PropKey, V]) => { [key: string]: V },
    toSet: () => Set<T>;
    toES6Map: <K, V>(keyValFn: (item: T) => [K, V]) => Map<K, V>,
    head: () => T;
    tap: (fn: (intermediateValue: T[]) => void) => IWrapper<T>;
    log: (label?: string) => IWrapper<T>;
    // equals
    // similar
    // similarUniq
    // startsWith
    // move
}

function transformIterable<T, R, S>(
    props: {
        onValue: (x: { value: T; idx: number, state?: S }) => { values: Iterable<R>; done?: boolean; state?: S };
        onDone?: (x: { value: T, idx: number, state?: S }) => Iterable<R>;
        getInitialState?: () => S;
    },
): (iterable: Iterable<T>) => Iterable<R> {
    return (iterable: Iterable<T>): Iterable<R> => {
        const { onValue, onDone, getInitialState } = props;

        return {
            *[Symbol.iterator]() {
                let idx = 0;
                let state = getInitialState && getInitialState();

                for (let item of iterable) {
                    const transResult = onValue({ value: item, idx, state });

                    const { values, done } = transResult;
                    state = transResult.state;

                    if (done) return;

                    yield* values;
                    idx++;
                }

                const lastIdx = idx - 1;
                if (onDone) yield* onDone({ value: undefined, idx: lastIdx, state });
            },
        };
    }
}

function consumeIterable<T, R, S>(
    props: {
        onValue: (x: { acc: R, value: T, idx: number, state?: S }) => { result: R; done?: boolean; state?: S };
        onDone?: (x: { acc: R, value: T, idx: number, state?: S }) => R;
        initialValue: R;
        initialState?: S;
    },
): (iterable: Iterable<T>) => R {
    return (iterable: Iterable<T>) => {
        const { onValue, onDone, initialValue, initialState } = props;

        let idx = 0;
        let acc = initialValue;
        let state = initialState;

        for (let item of iterable) {
            const reducerResult = onValue({ acc, value: item, idx, state });

            const { done } = reducerResult;
            acc = reducerResult.result;
            state = reducerResult.state;

            if (done) return acc;

            idx++;
        }

        if (onDone) {
            acc = onDone({ acc, value: undefined, idx, state })
        }

        return acc;
    }
}

// Iterable transformers

function slice<T>(from: number, to: number) {
    return transformIterable<T, T, null>(
        {
            onValue: ({ value, idx }) => ({
                values: idx >= from && idx < to ? [value] : [],
                done: idx >= to,
            }),
        },
    );
}

function groupWith<T>(compareFn: (item1: T, item2: T) => boolean) {
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

function filter<T>(predicateFn: (item: T) => boolean) {
    return transformIterable<T, T, null>(
        {
            onValue: ({ value }) => ({ values: predicateFn(value) ? [value] : [] }),
        },
    );
}

function reject<T>(predicateFn: (item: T) => boolean) {
    return filter(negate(predicateFn));
}

function map<T, R>(mapperFn: (item: T) => R) {
    return transformIterable<T, R, null>(
        {
            onValue: ({ value }) => ({ values: [mapperFn(value)] }),
        },
    );
}

function scan<T, P>(reducerFn: (acc: P, item: T) => P, initialValue: P) {
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

function uniq<T>() {
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

function uniqBy<T, P>(transFn: (item: T) => P) {
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

function initial<T>() {
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

function take<T>(amount: number) {
    return transformIterable<T, T, null>(
        {
            onValue: ({ value, idx }) => ({
                values: [value],
                done: idx >= amount
            })
        },
    )
}

function drop<T>(amount: number) {
    return transformIterable<T, T, null>(
        {
            onValue: ({ value, idx }) => ({
                values: idx >= amount ? [value] : []
            })
        },
    )
}

function dropRepeats<T>() {
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

function dropRepeatsWith<T>(compareFn: (item1: T, item2: T) => boolean) {
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

function dropWhile<T>(conditionFn: (item: T) => boolean) {
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

function takeWhile<T>(conditionFn: (item: T) => boolean) {
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

function tail<T>() {
    return transformIterable<T, T, null>(
        {
            onValue: ({ value, idx }) => ({ values: idx > 0 ? [value] : [] })
        },
    )
}

function chunk<T>(size: number) {
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

function splitAt<T>(splitIdx: number) {
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

function splitWhen<T>(predicateFn: (item: T) => boolean) {
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

function compact<T>() {
    return transformIterable<T, T, null>(
        {
            onValue: ({ value }) => ({ values: !value ? [] : [value] })
        },
    )
}

function update<T>(idxToUpdate: number, newItem: T) {
    return transformIterable<T, T, null>(
        {
            onValue: ({ value, idx }) => ({ values: idx === idxToUpdate ? [newItem] : [value] })
        },
    )
}

function adjust<T>(idxToAdjust: number, transFn: (item: T) => T) {
    return transformIterable<T, T, null>(
        {
            onValue: ({ value, idx }) => ({
                values: idx === idxToAdjust ? [transFn(value)] : [value]
            })
        },
    )
}

function insert<T>(idxToInsert: number, itemToInsert: T) {
    return transformIterable<T, T, null>(
        {
            onValue: ({ value, idx }) => ({
                values: idx === idxToInsert ? [itemToInsert, value] : [value]
            })
        },
    )
}

function insertAll<T>(idxToInsert: number, itemsToInsert: T[]) {
    return transformIterable<T, T, null>(
        {
            onValue: ({ value, idx }) => ({
                values: idx === idxToInsert ? [...itemsToInsert, value] : [value]
            })
        },
    )
}

function remove<T>(start: number, amount: number) {
    return transformIterable<T, T, null>(
        {
            onValue: ({ value, idx }) => ({
                values: idx < start || idx >= start + amount ? [value] : []
            })
        },
    )
}

function intersperse<T>(separatorItem: T) {
    return transformIterable<T, T, null>(
        {
            onValue: ({ value, idx }) => ({
                values: idx > 0 ? [separatorItem, value] : [value]
            })
        },
    )
}

function prepend<T>(itemToPrepend: T) {
    return transformIterable<T, T, null>(
        {
            onValue: ({ value, idx }) => ({
                values: idx === 0 ? [itemToPrepend, value] : [value]
            }),
        },
    )
}

function append<T>(itemToAppend: T) {
    return transformIterable<T, T, null>(
        {
            onValue: ({ value }) => ({
                values: [value]
            }),
            onDone: () => [itemToAppend]
        },
    )
}

function flatten<T>(): (iterable: Iterable<T>) => Iterable<UnpackedArray<T>> {
    return transformIterable(
        {
            onValue: ({ value }) => ({
                values: Array.isArray(value) ? value : [value]
            })
        },
    )
}

function flattenDeep<T>(): (iterable: Iterable<T>) => Iterable<any> {
    return transformIterable<T, any, null>(
        {
            onValue: ({ value }) => ({
                values: Array.isArray(value) ? flattenDeep()(value) : [value]
            })
        },
    )
}

function flatMap<T, R>(mapperFn: (item: T) => R): (iterable: Iterable<T>) => Iterable<UnpackedArray<R>> {
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

// *******************************

// Combiners

const without = <T>(iterableToExclude: Iterable<T>) =>
    transformIterable<T, T, Set<T>>(
        {
            onValue: ({ value, state: exclude }) => ({
                values: exclude.has(value) ? [] : [value],
                state: exclude
            }),
            getInitialState: () => new Set(iterableToExclude)
        },
    );

const union = <T>(srcIterable: Iterable<T>) => (targetIterable: Iterable<T>): Iterable<T> =>
    uniq<T>()(concat(srcIterable)(targetIterable));

const unionBy = <T, P>(transFn: (item: T) => P, srcIterable: Iterable<T>) => (targetIterable: Iterable<T>): Iterable<T> =>
    uniqBy(transFn)(concat(srcIterable)(targetIterable));

const difference = <T>(srcIterable: Iterable<T>) =>
    transformIterable<T, T, Set<T>>(
        {
            onValue: ({ value, state: diffSet }) => ({
                values: diffSet.has(value) ? [] : [value],
                state: diffSet
            }),
            getInitialState: () => new Set(srcIterable)
        },
    );

const differnceBy = <T, P>(transFn: (item: T) => P, srcIterable: Iterable<T>) =>
    transformIterable<T, T, Set<P>>(
        {
            onValue: ({ value, state: diffSet }) => ({
                values: diffSet.has(transFn(value)) ? [] : [value],
                state: diffSet
            }),
            getInitialState: () => new Set(map(transFn)(srcIterable))
        },
    )

const intersection = <T>(srcIterable: Iterable<T>) =>
    transformIterable<T, T, Set<T>>(
        {
            onValue: ({ value, state: diffSet }) => ({
                values: diffSet.has(value) ? [value] : [],
                state: diffSet
            }),
            getInitialState: () => new Set(srcIterable)
        },
    )

const intersectionBy = <T, P>(transFn: (item: T) => P, srcIterable: Iterable<T>) =>
    transformIterable<T, T, Set<P>>(
        {
            onValue: ({ value, state: diffSet }) => ({
                values: diffSet.has(transFn(value)) ? [value] : [],
                state: diffSet
            }),
            getInitialState: () => new Set(map(transFn)(srcIterable))
        },
    )

const xor = <T>(srcItearble: Iterable<T>) => (targetIterable: Iterable<T>) => {
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

const xorBy = <T, P>(transFn: (item: T) => P, srcIterable: Iterable<T>) => (targetIterable: Iterable<T>) => {
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

const concat = <T>(srcIterable: Iterable<T>) => (targetIterable: Iterable<T>): Iterable<T> => {
    return {
        *[Symbol.iterator]() {
            yield* targetIterable;
            yield* srcIterable;
        },
    };
}

const xprod = <P>(srcIterable: Iterable<P>) => <T>(targetIterable: Iterable<T>): Iterable<[T, P]> => {
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

const zip = <P>(srcItearble: Iterable<P>) => <T>(targetIterable: Iterable<T>): Iterable<[T, P]> => {
    return zipWith((item1: T, item2: P) => [item1, item2] as [T, P], srcItearble)(targetIterable);
}

const zipWith = <T, P, R>(zipFn: (targetItem: T, srcItem: P) => R, srcIterable: Iterable<P>) =>
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

// Iterable Creators

function range(from: number, to: number, interval: number = 1): Iterable<number> {
    return {
        *[Symbol.iterator]() {
            let currNum = from;

            while (currNum < to) {
                yield currNum;
                currNum += interval;
            }
        },
    };
}

function repeat<T>(value: T, amount: number): Iterable<T> {
    return times(() => value, amount);
}

function times<T>(fn: (idx: number) => T, amount: number): Iterable<T> {
    return {
        *[Symbol.iterator]() {
            let count = 0;

            while (count < amount) {
                yield fn(count);
                count++;
            }
        },
    };
}

// Consumers

const each = <T>(fn: (item: T) => void) =>
    consumeIterable<T, void, null>(
        {
            onValue: ({ value }) => {
                fn(value);
                return {
                    result: undefined
                }
            },
            initialValue: undefined
        },
    )

const reduce = <T, P>(reducerFn: (acc: P, item: T) => P, initialValue: P) =>
    consumeIterable<T, P, null>(
        {
            onValue: ({ acc, value }) => ({
                result: reducerFn(acc, value),
            }),
            initialValue
        },
    )

const every = <T>(predicateFn: (item: T) => boolean) =>
    consumeIterable<T, boolean, null>(
        {
            onValue: ({ value }) => {
                const passed = predicateFn(value);
                return {
                    result: passed,
                    done: !passed
                }
            },
            initialValue: true
        },
    )

const some = <T>(predicateFn: (item: T) => boolean) =>
    consumeIterable<T, boolean, null>(
        {
            onValue: ({ value }) => {
                const passed = predicateFn(value);
                return {
                    result: passed,
                    done: passed
                }
            },
            initialValue: false
        },
    )

const none = <T>(predicateFn: (item: T) => boolean) =>
    consumeIterable<T, boolean, null>(
        {
            onValue: ({ value, }) => {
                const passed = predicateFn(value);
                return {
                    result: !passed,
                    done: passed
                }
            },
            initialValue: true
        },
    )

const includes = <T>(itemToFind: T) =>
    consumeIterable<T, boolean, null>(
        {
            onValue: ({ value }) => {
                const found = value === itemToFind;
                return {
                    result: found,
                    done: found
                }
            },
            initialValue: false
        },
    )

const find = <T>(predicateFn: (item: T) => boolean) =>
    consumeIterable<T, T, null>(
        {
            onValue: ({ acc, value }) => {
                const found = predicateFn(value);
                return {
                    result: found ? value : acc,
                    done: found
                }
            },
            initialValue: undefined
        },
    )

const findIndex = <T>(predicateFn: (item: T) => boolean) =>
    consumeIterable<T, number, null>(
        {
            onValue: ({ acc, value, idx }) => {
                const found = predicateFn(value);
                return {
                    result: found ? idx : acc,
                    done: found
                }
            },
            initialValue: -1
        },
    )

const indexOf = <T>(itemToFind: T) =>
    consumeIterable<T, number, null>(
        {
            onValue: ({ acc, value, idx }) => {
                const found = value === itemToFind;
                return {
                    result: found ? idx : acc,
                    done: found
                }
            },
            initialValue: -1
        },
    )

const nth = <T>(n: number) =>
    consumeIterable<T, T, null>(
        {
            onValue: ({ acc, value, idx }) => {
                const isN = n === idx;
                return {
                    result: isN ? value : acc,
                    done: isN
                }
            },
            initialValue: undefined
        },
    )

const groupBy = <T>(keyFn: (item: T) => PropKey) =>
    consumeIterable<T, { [key: string]: T[] }, null>(
        {
            onValue: ({ acc, value }) => {
                const key = keyFn(value);

                if (!acc[key]) {
                    acc[key] = [];
                }

                acc[key].push(value);

                return {
                    result: acc,
                }
            },
            initialValue: {} as { [key: string]: T[] }
        },
    )

const countBy = <T>(keyFn: (item: T) => PropKey) =>
    consumeIterable<T, { [key: string]: number }, null>(
        {
            onValue: ({ acc, value }) => {
                const key = keyFn(value);

                if (!acc[key]) {
                    acc[key] = 0;
                }

                acc[key]++;

                return {
                    result: acc,
                }
            },
            initialValue: {} as { [key: string]: number }
        },
    )

const keyBy = <T>(keyFn: (item: T) => PropKey) =>
    consumeIterable<T, { [key: string]: T }, null>(
        {
            onValue: ({ acc, value }) => {
                acc[keyFn(value)] = value;
                return {
                    result: acc
                }
            },
            initialValue: {} as { [key: string]: T }
        },
    )

const size = <T>() =>
    consumeIterable<T, number, null>(
        {
            onValue: ({ acc }) => ({
                result: acc + 1
            }),
            initialValue: 0
        },
    )

const join = <T>(separator: string) =>
    consumeIterable<T, string, null>(
        {
            onValue: ({ acc, value }) => ({
                result: acc.length
                    ? `${acc}${separator}${value}`
                    : value.toString()
            }),
            initialValue: ''
        },
    )

const sumBy = <T>(valueFn: (item: T) => number) =>
    consumeIterable<T, number, null>(
        {
            onValue: ({ acc, value }) => ({
                result: acc + valueFn(value)
            }),
            initialValue: 0
        },
    )

const maxBy = <T>(valueFn: (item: T) => number) =>
    consumeIterable<T, number, null>(
        {
            onValue: ({ acc: max, value }) => {
                const calculatedValue = valueFn(value);

                return {
                    result: max != null ? Math.max(max, calculatedValue) : calculatedValue,
                }
            },
            initialValue: undefined,
        },
    )

const minBy = <T>(valueFn: (item: T) => number) =>
    consumeIterable<T, number, null>(
        {
            onValue: ({ acc: min, value }) => {
                const calculatedValue = valueFn(value);

                return {
                    result: min != null ? Math.min(min, calculatedValue) : calculatedValue,
                }
            },
            initialValue: undefined,
        },
    )


// TODO: implement
// const equals = <T>(iterable1: Iterable<T>) => (iterable2: Iterable<T>) => {
//     return consumeIterable(
//         {
//             onValue: ({ acc, state: it2, value }) => {
//                 const { value: val2, done } = it2.next();

//             },
//             initialValue: true,
//             initialState: iterable2[Symbol.iterator]()
//         },
//         iterable1
//     )
// }

// Intermidiate consumers

const partitionMulti = <T>(...predicates: ((item: T) => boolean)[]) =>
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

function shuffle<T>(iterable: Iterable<T>): Iterable<T> {
    return {
        *[Symbol.iterator]() {
            const arr = toArray<T>()(iterable);
            yield* shuffleArr(arr);
        }
    }
}

function sample<T>(iterable: Iterable<T>): T {
    const len = size()(iterable);
    const idxToSample = randomInRange(0, len - 1);
    return nth<T>(idxToSample)(iterable);
}

const sampleSize = (size: number) => <T>(iterable: Iterable<T>) => {
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

function reverse<T>(iterable: Iterable<T>): Iterable<T> {
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

const sort = <T>(compareFn: (item1: T, item2: T) => number) => (iterable: Iterable<T>) => {
    return {
        *[Symbol.iterator]() {
            const arr = toArray<T>()(iterable);

            for (let item of arr.sort(compareFn)) {
                yield item;
            }
        },
    };
}

const sortBy = <T>(transFn: (item: T) => number) => (iterable: Iterable<T>) => {
    const compareFn = (item1: T, item2: T) => {
        const val1 = transFn(item1);
        const val2 = transFn(item2);

        return val1 < val2 ? -1 : val2 < val1 ? 1 : 0;
    };

    return sort(compareFn)(iterable);
}

const sortWith = <T>(compareFns: CompareFn<T>[]) => (iterable: Iterable<T>) => {
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

function toArray<T>() {
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

function toSet<T>(iterable: Iterable<T>) {
    return new Set(iterable);
}

function toMap<T, V>(keyValFn: (item: T) => [PropKey, V]) {
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

function toES6Map<T, K, V>(keyValFn: (item: T) => [K, V]) {
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

const partition = <T>(predicateFn: (item: T) => boolean) =>
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

function head<T>(iterable: Iterable<T>) {
    return iterable[Symbol.iterator]().next().value;
}

const tap = <T>(fn: (intermediateValue: T[]) => void) => (iterable: Iterable<T>) => {
    const intermediateArr = toArray<T>()(iterable);
    fn(intermediateArr);
    return intermediateArr;
}

const log = (label: string) => <T>(iterable: Iterable<T>) => {
    const intermediateArr = toArray<T>()(iterable);
    console.log(label + ':', intermediateArr);
    return intermediateArr;
}

// Wrapper

function wrapper<T>(iterable: Iterable<T>): IWrapper<T> {
    return {
        [Symbol.iterator]: iterable[Symbol.iterator],
        each: (fn: (item: T) => void) => each(fn)(iterable),
        reduce: <P>(reducerFn: (acc: P, item: T) => P, initialValue: P) => reduce(reducerFn, initialValue)(iterable),
        every: (predicateFn: (item: T) => boolean) => every(predicateFn)(iterable),
        some: (predicateFn: (item: T) => boolean) => some(predicateFn)(iterable),
        none: (predicateFn: (item: T) => boolean) => none(predicateFn)(iterable),
        find: (predicateFn: (item: T) => boolean) => find(predicateFn)(iterable),
        findIndex: (predicateFn: (item: T) => boolean) => findIndex(predicateFn)(iterable),
        indexOf: (itemToFind: T) => indexOf(itemToFind)(iterable),
        includes: (itemToFind: T) => includes(itemToFind)(iterable),
        countBy: (keyFn: (item: T) => string) => countBy(keyFn)(iterable),
        groupBy: (keyFn: (item: T) => string) => groupBy(keyFn)(iterable),
        groupWith: (compareFn: (item1: T, item2: T) => boolean) => wrapper(groupWith(compareFn)(iterable)),
        keyBy: (keyFn: (item: T) => string) => keyBy(keyFn)(iterable),
        sumBy: (valueFn: (item: T) => number) => sumBy(valueFn)(iterable),
        maxBy: (valueFn: (item: T) => number) => maxBy(valueFn)(iterable),
        minBy: (valueFn: (item: T) => number) => minBy(valueFn)(iterable),
        size: () => size<T>()(iterable),
        filter: (predicateFn: (item: T) => boolean) => wrapper(filter(predicateFn)(iterable)),
        reject: (predicateFn: (item: T) => boolean) => wrapper(reject(predicateFn)(iterable)),
        map: <P>(mapperFn: (item: T) => P) => wrapper(map(mapperFn)(iterable)),
        scan: <P>(reducerFn: (acc: P, item: T) => P, initialValue: P) =>
            wrapper(scan(reducerFn, initialValue)(iterable)),
        uniq: () => wrapper(uniq<T>()(iterable)),
        uniqBy: <P>(transFn: (item: T) => P) => wrapper(uniqBy(transFn)(iterable)),
        prepend: (itemToAppend: T) => wrapper(prepend(itemToAppend)(iterable)),
        append: (itemToAppend: T) => wrapper(append<T>(itemToAppend)(iterable)),
        without: (iterableToExclude: Iterable<T>) => wrapper(without(iterableToExclude)(iterable)),
        concat: (iterableToAppend: Iterable<T>) => wrapper(concat(iterableToAppend)(iterable)),
        union: (iterableToAppend: Iterable<T>) => wrapper(union(iterableToAppend)(iterable)),
        unionBy: <P>(transFn: (item: T) => P, iterableToAppend: Iterable<T>) =>
            wrapper(unionBy(transFn, iterableToAppend)(iterable)),
        difference: (otherIterable: Iterable<T>) => wrapper(difference(otherIterable)(iterable)),
        differenceBy: <P>(transFn: (iterm: T) => P, otherIterable: Iterable<T>) =>
            wrapper(differnceBy(transFn, otherIterable)(iterable)),
        intersection: (otherIterable: Iterable<T>) => wrapper(intersection(otherIterable)(iterable)),
        intersectionBy: <P>(transFn: (iterm: T) => P, otherIterable: Iterable<T>) =>
            wrapper(intersectionBy(transFn, otherIterable)(iterable)),
        xor: (otherIterable: Iterable<T>) => wrapper(xor(otherIterable)(iterable)),
        xorBy: <P>(transFn: (iterm: T) => P, otherIterable: Iterable<T>) =>
            wrapper(xorBy(transFn, otherIterable)(iterable)),
        xprod: <P>(iterableToApply: Iterable<P>) => wrapper(xprod(iterableToApply)(iterable)),
        zip: <P>(iterableToApply: Iterable<P>) => wrapper(zip(iterableToApply)(iterable)),
        zipWith: <P, R>(zipFn: (item1: T, item2: P) => R, iterableToApply: Iterable<P>) =>
            wrapper(zipWith(zipFn, iterableToApply)(iterable)),
        initial: () => wrapper(initial<T>()(iterable)),
        take: (amount: number) => wrapper(take<T>(amount)(iterable)),
        drop: (amount: number) => wrapper(drop<T>(amount)(iterable)),
        dropRepeats: () => wrapper(dropRepeats<T>()(iterable)),
        dropRepeatsWith: (compareFn: (item1: T, item2: T) => boolean) =>
            wrapper(dropRepeatsWith(compareFn)(iterable)),
        dropWhile: (conditionFn: (item: T) => boolean) =>
            wrapper(dropWhile(conditionFn)(iterable)),
        takeWhile: (conditionFn: (item: T) => boolean) =>
            wrapper(takeWhile(conditionFn)(iterable)),
        tail: () => wrapper(tail<T>()(iterable)),
        chunk: (size: number) => wrapper(chunk<T>(size)(iterable)),
        splitAt: (idx: number) => wrapper(splitAt<T>(idx)(iterable)),
        splitWhen: (predicateFn: (item: T) => boolean) => wrapper(splitWhen(predicateFn)(iterable)),
        compact: () => wrapper(compact<T>()(iterable)),
        update: (idxToUpdate: number, newItem: T) =>
            wrapper(update(idxToUpdate, newItem)(iterable)),
        adjust: (idxToAdjust: number, transFn: (item: T) => T) =>
            wrapper(adjust(idxToAdjust, transFn)(iterable)),
        insert: (idxToInsert: number, itemToInsert: T) =>
            wrapper(insert(idxToInsert, itemToInsert)(iterable)),
        insertAll: (idxToInsert: number, itemsToInsert: T[]) =>
            wrapper(insertAll(idxToInsert, itemsToInsert)(iterable)),
        remove: (start: number, amount: number) =>
            wrapper(remove<T>(start, amount)(iterable)),
        slice: (from: number, to: number) => wrapper(slice<T>(from, to)(iterable)),
        intersperse: (separatorItem: T) =>
            wrapper(intersperse(separatorItem)(iterable)),
        nth: (n: number) => nth<T>(n)(iterable),
        join: (separator: string) => join(separator)(iterable),
        partition: (predicateFn: (item: T) => boolean) => partition<T>(predicateFn)(iterable),
        reverse: () => wrapper(reverse(iterable)),
        sort: (compareFn: CompareFn<T>) => wrapper(sort(compareFn)(iterable)),
        sortBy: (transFn: (item: T) => number) => wrapper(sortBy(transFn)(iterable)),
        sortWith: (compareFns: CompareFn<T>[]) => wrapper(sortWith(compareFns)(iterable)),
        partitionMulti: (...predicates: ((item: T) => boolean)[]) => wrapper(partitionMulti(...predicates)(iterable)),
        shuffle: () => wrapper(shuffle(iterable)),
        sample: () => sample(iterable),
        sampleSize: (size: number) => wrapper(sampleSize(size)(iterable)),
        flatten: () => wrapper(flatten<T>()(iterable)),
        flatMap: <P>(mapperFn: (item: T) => P) => wrapper(flatMap(mapperFn)(iterable)),
        flattenDeep: () => wrapper(flattenDeep()(iterable)),
        toArray: () => toArray<T>()(iterable),
        toMap: <V>(keyValFn: (item: T) => [PropKey, V]) => toMap(keyValFn)(iterable),
        toES6Map: <K, V>(keyValFn: (item: T) => [K, V]) => toES6Map(keyValFn)(iterable),
        toSet: () => toSet(iterable),
        head: () => head(iterable),
        tap: (fn: (intermediateValue: T[]) => void) => wrapper(tap(fn)(iterable)),
        log: (label?: string) => wrapper(log(label)(iterable)),
    };
}

// Examples

function* bla() {
    yield 1;
    yield 2;
    yield 3;
}

const input = [1, 2, 3, 4, 5, 6, 7, 8];

const foo = wrapper(input)
    .drop(1)
    .map(num => num * 2)
    .log('temp')
    .filter(num => num > 2)
    .concat([10, 11, 12])
    .take(5)
    .dropWhile(num => num < 7)
    .intersperse(0)
    .remove(2, 2)
    .concat([8, 8, 12, 1])
    .initial()
    .reverse()
    .sortBy(num => num)
    .scan((res, num) => res + num, 0)
    .slice(1, 8)
    .append(100)
    .without([8, 16])
    .union([1, 2, 24, 100, 5])
    .shuffle()
    .sampleSize(3)
    .flatMap(num => [num, num])
    .take(5)
// .partitionMulti(num => num > 40, num => num > 5)
// .chunk(2)

foo.each(item => {
    item;
});

foo.each(item => {
    item;
});

const deep = wrapper([[[1, 2, 7], [0, 3], [4, 5, 6]]])
    .flattenDeep()
    .toArray();

deep

console.log(foo.join('-'))

const gaga = rangeArr(1, 100000);

console.time('1');

const res = gaga
    .map(num => num * 2)
    .map(num => num * 2)
    .map(num => num * 2)
    .map(num => num * 2)
    .filter(num => num > 1000)

console.timeEnd('1');

res

console.time('2');

const res2 = wrapper(gaga)
    .map(num => num * 2)
    .map(num => num * 2)
    .map(num => num * 2)
    .map(num => num * 2)
    .filter(num => num > 1000)
    .nth(99000)

res2

console.timeEnd('2');

// const res = wrapper(
// 	new ObservableMap<number>()
// 		.set('x', 1)
// 		.set('y', 2)
// 		.entries()
// )
// 	.append(new Map().set('z', 1))
// 	.map(([key, value]) => key + value)
// 	.toArray();

// res;

// TODO:


// better types for flattenDeep
// async iterator
// optimize iteration by not always wrapping the next value in array
// multi iterators runner
// embed custom function in wrapper (as chainable)
// use prototype instead of creating a new wrapper object each time
// add index to iterable iteration