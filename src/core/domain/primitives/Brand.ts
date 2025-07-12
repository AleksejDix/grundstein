/**
 * Branded Types utility for creating type-safe domain primitives
 * Based on: https://egghead.io/blog/using-branded-types-in-typescript
 */

declare const __brand: unique symbol;

/**
 * Brand utility type that adds a unique brand to a base type
 */
type Brand<B> = { readonly [__brand]: B };

/**
 * Branded type that combines a base type T with a brand B
 * This makes types with the same underlying representation incompatible
 */
export type Branded<T, B> = T & Brand<B>;

// Branded type is now properly imported as type-only in value objects

/**
 * Result type for error handling in functional style
 */
export type Result<T, E> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

/**
 * Option type for nullable values in functional style
 */
export type Option<T> =
  | { readonly some: true; readonly value: T }
  | { readonly some: false };

/**
 * Helper functions for Result type
 */
export const Result = {
  ok: <T>(data: T): Result<T, never> => ({ success: true, data }),

  error: <E>(error: E): Result<never, E> => ({ success: false, error }),

  map: <T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> =>
    result.success ? Result.ok(fn(result.data)) : (result as Result<U, E>),

  flatMap: <T, U, E>(
    result: Result<T, E>,
    fn: (value: T) => Result<U, E>,
  ): Result<U, E> =>
    result.success ? fn(result.data) : (result as Result<U, E>),

  isOk: <T, E>(result: Result<T, E>): result is { success: true; data: T } =>
    result.success,

  isError: <T, E>(
    result: Result<T, E>,
  ): result is { success: false; error: E } => !result.success,
};

/**
 * Helper functions for Option type
 */
export const Option = {
  some: <T>(value: T): Option<T> => ({ some: true, value }),

  none: (): Option<never> => ({ some: false }),

  map: <T, U>(option: Option<T>, fn: (value: T) => U): Option<U> =>
    option.some ? Option.some(fn(option.value)) : Option.none(),

  flatMap: <T, U>(option: Option<T>, fn: (value: T) => Option<U>): Option<U> =>
    option.some ? fn(option.value) : Option.none(),

  isSome: <T>(option: Option<T>): option is { some: true; value: T } =>
    option.some,

  isNone: <T>(option: Option<T>): option is { some: false } => !option.some,

  getOrElse: <T>(option: Option<T>, defaultValue: T): T =>
    option.some ? option.value : defaultValue,
};
