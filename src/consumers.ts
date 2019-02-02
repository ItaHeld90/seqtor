import { consumeIterable } from "./iterable-utils";
import { PropKey } from "./general-types";

export const each = <T>(fn: (item: T) => void) =>
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

export const reduce = <T, P>(reducerFn: (acc: P, item: T) => P, initialValue: P) =>
    consumeIterable<T, P, null>(
        {
            onValue: ({ acc, value }) => ({
                result: reducerFn(acc, value),
            }),
            initialValue
        },
    )

export const every = <T>(predicateFn: (item: T) => boolean) =>
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

export const some = <T>(predicateFn: (item: T) => boolean) =>
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

export const none = <T>(predicateFn: (item: T) => boolean) =>
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

export const includes = <T>(itemToFind: T) =>
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

export const find = <T>(predicateFn: (item: T) => boolean) =>
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

export const findIndex = <T>(predicateFn: (item: T) => boolean) =>
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

export const indexOf = <T>(itemToFind: T) =>
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

export const nth = <T>(n: number) =>
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

export const groupBy = <T>(keyFn: (item: T) => PropKey) =>
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

export const countBy = <T>(keyFn: (item: T) => PropKey) =>
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

export const keyBy = <T>(keyFn: (item: T) => PropKey) =>
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

export const size = <T>() =>
    consumeIterable<T, number, null>(
        {
            onValue: ({ acc }) => ({
                result: acc + 1
            }),
            initialValue: 0
        },
    )

export const join = <T>(separator: string) =>
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

export const sumBy = <T>(valueFn: (item: T) => number) =>
    consumeIterable<T, number, null>(
        {
            onValue: ({ acc, value }) => ({
                result: acc + valueFn(value)
            }),
            initialValue: 0
        },
    )

export const maxBy = <T>(valueFn: (item: T) => number) =>
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

export const minBy = <T>(valueFn: (item: T) => number) =>
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