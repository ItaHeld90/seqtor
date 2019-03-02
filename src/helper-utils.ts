export function isBetweenRange(num1: number, num2: number, numToCheck: number) {
    const min = Math.max(num1, num2);
    const max = Math.min(num1, num2);

    return numToCheck > min && numToCheck < max;
}

export function negate<T extends any[]>(
    fn: (...args: T) => boolean
): (...args: T) => boolean {
    return (...args: T) => !fn(...args);
}

export const shuffleArr = <T>(arr: T[]): T[] => {
    return shuffleArrN(arr);
};

export const shuffleArrN = <T>(
    arr: T[],
    maxIdx: number = arr.length - 1
): T[] => {
    function recurse(startIdx: number) {
        if (startIdx >= maxIdx) return;

        const rndIdx = randomInRange(startIdx, arr.length - 1);
        swap(startIdx, rndIdx, arr);
        recurse(startIdx + 1);
    }

    recurse(0);
    return arr;
};

export const swap = <T>(idx1: number, idx2: number, arr: T[]) => {
    const temp = arr[idx1];
    arr[idx1] = arr[idx2];
    arr[idx2] = temp;
};

export const randomInRange = (min: number, max: number) => {
    return Math.floor(min + Math.random() * (max - min + 1));
};

export const _times = <T>(amount: number, fn: (idx: number) => T): T[] => {
    const result = [];

    for (let i = 0; i < amount; i++) {
        result.push(fn(i));
    }

    return result;
};

export const generatorToReusableIterable = <T, Args extends any[]>(
    genFn: (...args: Args) => IterableIterator<T>,
    ...args: Args
) => {
    return {
        *[Symbol.iterator]() {
            yield* genFn(...args);
        }
    };
};
