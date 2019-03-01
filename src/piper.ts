import { IPipeWrapper, PropKey, IterableConsumer } from "./general-types";
import { toArray, toMap, toSet, toES6Map } from "./intermideate-consumers";
import { consumeIterable } from "./iterable-utils";

export function pipeWrapper<T>(iterable: Iterable<T>): IPipeWrapper<T> {
  return {
    pipe: (...fns: Function[]) =>
      pipeWrapper(fns.reduce((result, fn) => fn(result), iterable)),
    consume: <R, S>(
      consumer: ((iterable: Iterable<T>) => R) | IterableConsumer<R, T, S>
    ) =>
      typeof consumer === "function"
        ? consumer(iterable)
        : consumeIterable(consumer)(iterable),
    toArray: () => toArray<T>()(iterable),
    toMap: <V>(keyValFn: (item: T) => [PropKey, V]) =>
      toMap(keyValFn)(iterable),
    toSet: () => toSet(iterable),
    toES6Map: <K, V>(keyValFn: (item: T) => [K, V]) =>
      toES6Map(keyValFn)(iterable),
    value: iterable
  };
}
