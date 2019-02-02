export function transformIterable<T, R, S>(
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

export function consumeIterable<T, R, S>(
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