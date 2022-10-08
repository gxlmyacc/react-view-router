declare type Contra<T> = T extends any ? (arg: T) => void : never;
declare type InferContra<T> = [
    T
] extends [(arg: infer I) => void] ? I : never;
declare type PickOne<T> = InferContra<InferContra<Contra<Contra<T>>>>;
declare type Union2Tuple<T> = PickOne<T> extends infer U ? Exclude<T, U> extends never ? [T] : [...Union2Tuple<Exclude<T, U>>, U] : never;
export { PickOne, Union2Tuple, };
