import { IPipeWrapper, PropKey } from "./general-types";
import { toArray, toMap, toSet, toES6Map } from "./intermideate-consumers";

export function pipeWrapper<T>(iterable: Iterable<T>): IPipeWrapper<T> {
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