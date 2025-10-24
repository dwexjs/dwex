/**
 * Checks if a value is a class constructor.
 *
 * @param value - The value to check
 * @returns true if the value is a constructor function
 */
export function isConstructor(value: any): boolean {
  return typeof value === 'function' && value.prototype && value.prototype.constructor === value;
}

/**
 * Checks if a value is undefined.
 *
 * @param value - The value to check
 * @returns true if the value is undefined
 */
export function isUndefined(value: any): value is undefined {
  return typeof value === 'undefined';
}

/**
 * Checks if a value is null or undefined.
 *
 * @param value - The value to check
 * @returns true if the value is null or undefined
 */
export function isNil(value: any): value is null | undefined {
  return value === null || typeof value === 'undefined';
}

/**
 * Checks if a value is a string.
 *
 * @param value - The value to check
 * @returns true if the value is a string
 */
export function isString(value: any): value is string {
  return typeof value === 'string';
}

/**
 * Checks if a value is an object (excluding null).
 *
 * @param value - The value to check
 * @returns true if the value is an object
 */
export function isObject(value: any): value is object {
  return value !== null && typeof value === 'object';
}

/**
 * Checks if a value is a symbol.
 *
 * @param value - The value to check
 * @returns true if the value is a symbol
 */
export function isSymbol(value: any): value is symbol {
  return typeof value === 'symbol';
}

/**
 * Checks if a value is a function.
 *
 * @param value - The value to check
 * @returns true if the value is a function
 */
export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}
