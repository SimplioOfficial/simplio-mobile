export type CompareFnResult<T> = [boolean, T];
export type CompareFn = <T>(pin: string) => CompareFnResult<T>;
export type ComapreFnDefault = (pin: string) => CompareFnResult<string>;
