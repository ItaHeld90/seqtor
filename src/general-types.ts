export type UnpackedArray<T> = T extends (infer U)[] ? U : T;
export type CompareFn<T> = (item1: T, item2: T) => number;
export type PropKey = string | number;

export interface IPipe<T extends any[], R> {
    <R1 extends R>(f1: (...args: T) => R1): R1 extends Iterable<infer U>
        ? IPipeWrapper<U>
        : any;
    <R1 extends R, R2 extends R>(
        f1: (...args: T) => R1,
        f2: (a: R1) => R2
    ): R2 extends Iterable<infer U> ? IPipeWrapper<U> : any;
    <R1 extends R, R2 extends R, R3 extends R>(
        f1: (...args: T) => R1,
        f2: (a: R1) => R2,
        f3: (a: R2) => R3
    ): R3 extends Iterable<infer U> ? IPipeWrapper<U> : any;
    <R1 extends R, R2 extends R, R3 extends R, R4 extends R>(
        f1: (...args: T) => R1,
        f2: (a: R1) => R2,
        f3: (a: R2) => R3,
        f4: (a: R3) => R4
    ): R4 extends Iterable<infer U> ? IPipeWrapper<U> : any;
    <R1 extends R, R2 extends R, R3 extends R, R4 extends R, R5 extends R>(
        f1: (...args: T) => R1,
        f2: (a: R1) => R2,
        f3: (a: R2) => R3,
        f4: (a: R3) => R4,
        f5: (a: R4) => R5
    ): R5 extends Iterable<infer U> ? IPipeWrapper<U> : any;
    <
        R1 extends R,
        R2 extends R,
        R3 extends R,
        R4 extends R,
        R5 extends R,
        R6 extends R
    >(
        f1: (...args: T) => R1,
        f2: (a: R1) => R2,
        f3: (a: R2) => R3,
        f4: (a: R3) => R4,
        f5: (a: R4) => R5,
        f6: (a: R5) => R6
    ): R6 extends Iterable<infer U> ? IPipeWrapper<U> : any;
    <
        R1 extends R,
        R2 extends R,
        R3 extends R,
        R4 extends R,
        R5 extends R,
        R6 extends R,
        R7 extends R
    >(
        f1: (...args: T) => R1,
        f2: (a: R1) => R2,
        f3: (a: R2) => R3,
        f4: (a: R3) => R4,
        f5: (a: R4) => R5,
        f6: (a: R5) => R6,
        f7: (a: R6) => R7
    ): R7 extends Iterable<infer U> ? IPipeWrapper<U> : any;
}

export interface IterableTransformer<T, R, S = null> {
  onValue: (x: {
      value: T;
      idx: number;
      state?: S;
  }) => { values: Iterable<R>; done?: boolean; state?: S };
  onDone?: (x: { value: T; idx: number; state?: S }) => Iterable<R>;
  getInitialState?: () => S;
}

export type IterableConsumer<T, R, S> = {
    onValue: (x: {
        acc: R;
        value: T;
        idx: number;
        state?: S;
    }) => { result: R; done?: boolean; state?: S };
    onDone?: (x: { acc: R; value: T; idx: number; state?: S }) => R;
    initialValue: R;
    initialState?: S;
};

interface IConsume<T> {
    <R>(consumeFn: (iterable: Iterable<T>) => R): R;
    <R, S>(consumer: IterableConsumer<T, R, S>): R;
}

export interface IPipeWrapper<T> {
    pipe: IPipe<[Iterable<T>], Iterable<any>>;
    consume: IConsume<T>;
    toArray: () => T[];
    toMap: <V>(keyValFn: (item: T) => [PropKey, V]) => { [key: string]: V };
    toSet: () => Set<T>;
    toES6Map: <K, V>(keyValFn: (item: T) => [K, V]) => Map<K, V>;
    value: Iterable<T>;
}

export interface IWrapper<T> {
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
    scan: <P>(
        reducerFn: (acc: P, item: T) => P,
        initialValue: P
    ) => IWrapper<P>;
    take: (amount: number) => IWrapper<T>;
    takeWhile: (conditionFn: (item: T) => boolean) => IWrapper<T>;
    initial: () => IWrapper<T>;
    drop: (amount: number) => IWrapper<T>;
    dropWhile: (conditionFn: (item: T) => boolean) => IWrapper<T>;
    dropRepeats: () => IWrapper<T>;
    dropRepeatsWith: (
        compareFn: (item1: T, item2: T) => boolean
    ) => IWrapper<T>;
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
    unionBy: <P>(
        transFn: (item: T) => P,
        iterableToAppend: Iterable<T>
    ) => IWrapper<T>;
    difference: (otherIterable: Iterable<T>) => IWrapper<T>;
    differenceBy: <P>(
        transFn: (item: T) => P,
        otherIterable: Iterable<T>
    ) => IWrapper<T>;
    intersection: (otherIterable: Iterable<T>) => IWrapper<T>;
    intersectionBy: <P>(
        transFn: (item: T) => P,
        otherIterable: Iterable<T>
    ) => IWrapper<T>;
    xor: (otherIterable: Iterable<T>) => IWrapper<T>;
    xorBy: <P>(
        transFn: (item: T) => P,
        otherIterable: Iterable<T>
    ) => IWrapper<T>;
    xprod: <P>(iterableToAplly: Iterable<P>) => IWrapper<[T, P]>;
    zip: <P>(iterableToApply: Iterable<P>) => IWrapper<[T, P]>;
    zipWith: <P, R>(
        zipFn: (item1: T, item2: P) => R,
        iterableToApply: Iterable<P>
    ) => IWrapper<R>;
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
    toMap: <V>(keyValFn: (item: T) => [PropKey, V]) => { [key: string]: V };
    toSet: () => Set<T>;
    toES6Map: <K, V>(keyValFn: (item: T) => [K, V]) => Map<K, V>;
    head: () => T;
    tap: (fn: (intermediateValue: T[]) => void) => IWrapper<T>;
    log: (label?: string) => IWrapper<T>;
}
