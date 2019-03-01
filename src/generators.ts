export function range(
    from: number,
    to: number,
    interval: number = 1
): Iterable<number> {
    return {
        *[Symbol.iterator]() {
            let currNum = from;

            while (currNum < to) {
                yield currNum;
                currNum += interval;
            }
        }
    };
}

export function repeat<T>(value: T, amount: number): Iterable<T> {
    return times(() => value, amount);
}

export function times<T>(fn: (idx: number) => T, amount: number): Iterable<T> {
    return {
        *[Symbol.iterator]() {
            let count = 0;

            while (count < amount) {
                yield fn(count);
                count++;
            }
        }
    };
}
