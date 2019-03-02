import { IWrapper, CompareFn, PropKey } from './general-types';
import {
    each,
    reduce,
    every,
    some,
    none,
    find,
    findIndex,
    indexOf,
    includes,
    countBy,
    groupBy,
    keyBy,
    sumBy,
    maxBy,
    minBy,
    size,
    nth,
    join
} from './consumers';
import {
    groupWith,
    filter,
    reject,
    map,
    scan,
    uniq,
    uniqBy,
    prepend,
    append,
    initial,
    take,
    drop,
    dropRepeats,
    dropRepeatsWith,
    dropWhile,
    takeWhile,
    tail,
    chunk,
    splitAt,
    splitWhen,
    compact,
    update,
    adjust,
    insert,
    insertAll,
    remove,
    slice,
    intersperse,
    flatten,
    flatMap,
    flattenDeep
} from './transformers';
import {
    without,
    concat,
    union,
    unionBy,
    difference,
    differnceBy,
    intersection,
    intersectionBy,
    xor,
    xorBy,
    xprod,
    zip,
    zipWith
} from './combiners';
import {
    partition,
    reverse,
    sort,
    sortBy,
    sortWith,
    partitionMulti,
    shuffle,
    sample,
    sampleSize,
    toArray,
    toMap,
    toES6Map,
    toSet,
    head,
    tap,
    log
} from './intermideate-consumers';

export function wrapper<T>(iterable: Iterable<T>): IWrapper<T> {
    return {
        [Symbol.iterator]: iterable[Symbol.iterator].bind(iterable),
        each: (fn: (item: T) => void) => each(fn)(iterable),
        reduce: <P>(reducerFn: (acc: P, item: T) => P, initialValue: P) =>
            reduce(reducerFn, initialValue)(iterable),
        every: (predicateFn: (item: T) => boolean) =>
            every(predicateFn)(iterable),
        some: (predicateFn: (item: T) => boolean) =>
            some(predicateFn)(iterable),
        none: (predicateFn: (item: T) => boolean) =>
            none(predicateFn)(iterable),
        find: (predicateFn: (item: T) => boolean) =>
            find(predicateFn)(iterable),
        findIndex: (predicateFn: (item: T) => boolean) =>
            findIndex(predicateFn)(iterable),
        indexOf: (itemToFind: T) => indexOf(itemToFind)(iterable),
        includes: (itemToFind: T) => includes(itemToFind)(iterable),
        countBy: (keyFn: (item: T) => string) => countBy(keyFn)(iterable),
        groupBy: (keyFn: (item: T) => string) => groupBy(keyFn)(iterable),
        groupWith: (compareFn: (item1: T, item2: T) => boolean) =>
            wrapper(groupWith(compareFn)(iterable)),
        keyBy: (keyFn: (item: T) => string) => keyBy(keyFn)(iterable),
        sumBy: (valueFn: (item: T) => number) => sumBy(valueFn)(iterable),
        maxBy: (valueFn: (item: T) => number) => maxBy(valueFn)(iterable),
        minBy: (valueFn: (item: T) => number) => minBy(valueFn)(iterable),
        size: () => size<T>()(iterable),
        filter: (predicateFn: (item: T) => boolean) =>
            wrapper(filter(predicateFn)(iterable)),
        reject: (predicateFn: (item: T) => boolean) =>
            wrapper(reject(predicateFn)(iterable)),
        map: <P>(mapperFn: (item: T) => P) => wrapper(map(mapperFn)(iterable)),
        scan: <P>(reducerFn: (acc: P, item: T) => P, initialValue: P) =>
            wrapper(scan(reducerFn, initialValue)(iterable)),
        uniq: () => wrapper(uniq<T>()(iterable)),
        uniqBy: <P>(transFn: (item: T) => P) =>
            wrapper(uniqBy(transFn)(iterable)),
        prepend: (itemToAppend: T) => wrapper(prepend(itemToAppend)(iterable)),
        append: (itemToAppend: T) => wrapper(append<T>(itemToAppend)(iterable)),
        without: (iterableToExclude: Iterable<T>) =>
            wrapper(without(iterableToExclude)(iterable)),
        concat: (iterableToAppend: Iterable<T>) =>
            wrapper(concat(iterableToAppend)(iterable)),
        union: (iterableToAppend: Iterable<T>) =>
            wrapper(union(iterableToAppend)(iterable)),
        unionBy: <P>(transFn: (item: T) => P, iterableToAppend: Iterable<T>) =>
            wrapper(unionBy(transFn, iterableToAppend)(iterable)),
        difference: (otherIterable: Iterable<T>) =>
            wrapper(difference(otherIterable)(iterable)),
        differenceBy: <P>(
            transFn: (iterm: T) => P,
            otherIterable: Iterable<T>
        ) => wrapper(differnceBy(transFn, otherIterable)(iterable)),
        intersection: (otherIterable: Iterable<T>) =>
            wrapper(intersection(otherIterable)(iterable)),
        intersectionBy: <P>(
            transFn: (iterm: T) => P,
            otherIterable: Iterable<T>
        ) => wrapper(intersectionBy(transFn, otherIterable)(iterable)),
        xor: (otherIterable: Iterable<T>) =>
            wrapper(xor(otherIterable)(iterable)),
        xorBy: <P>(transFn: (iterm: T) => P, otherIterable: Iterable<T>) =>
            wrapper(xorBy(transFn, otherIterable)(iterable)),
        xprod: <P>(iterableToApply: Iterable<P>) =>
            wrapper(xprod(iterableToApply)(iterable)),
        zip: <P>(iterableToApply: Iterable<P>) =>
            wrapper(zip(iterableToApply)(iterable)),
        zipWith: <P, R>(
            zipFn: (item1: T, item2: P) => R,
            iterableToApply: Iterable<P>
        ) => wrapper(zipWith(zipFn, iterableToApply)(iterable)),
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
        splitWhen: (predicateFn: (item: T) => boolean) =>
            wrapper(splitWhen(predicateFn)(iterable)),
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
        slice: (from: number, to: number) =>
            wrapper(slice<T>(from, to)(iterable)),
        intersperse: (separatorItem: T) =>
            wrapper(intersperse(separatorItem)(iterable)),
        nth: (n: number) => nth<T>(n)(iterable),
        join: (separator: string) => join(separator)(iterable),
        partition: (predicateFn: (item: T) => boolean) =>
            partition<T>(predicateFn)(iterable),
        reverse: () => wrapper(reverse(iterable)),
        sort: (compareFn: CompareFn<T>) => wrapper(sort(compareFn)(iterable)),
        sortBy: (transFn: (item: T) => number) =>
            wrapper(sortBy(transFn)(iterable)),
        sortWith: (compareFns: CompareFn<T>[]) =>
            wrapper(sortWith(compareFns)(iterable)),
        partitionMulti: (...predicates: ((item: T) => boolean)[]) =>
            wrapper(partitionMulti(...predicates)(iterable)),
        shuffle: () => wrapper(shuffle(iterable)),
        sample: () => sample(iterable),
        sampleSize: (size: number) => wrapper(sampleSize(size)(iterable)),
        flatten: () => wrapper(flatten<T>()(iterable)),
        flatMap: <P>(mapperFn: (item: T) => P) =>
            wrapper(flatMap(mapperFn)(iterable)),
        flattenDeep: () => wrapper(flattenDeep()(iterable)),
        toArray: () => toArray<T>()(iterable),
        toMap: <V>(keyValFn: (item: T) => [PropKey, V]) =>
            toMap(keyValFn)(iterable),
        toES6Map: <K, V>(keyValFn: (item: T) => [K, V]) =>
            toES6Map(keyValFn)(iterable),
        toSet: () => toSet(iterable),
        head: () => head(iterable),
        tap: (fn: (intermediateValue: T[]) => void) =>
            wrapper(tap(fn)(iterable)),
        log: (label?: string) => wrapper(log(label)(iterable))
    };
}
