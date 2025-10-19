/**
 * Combines multiple class names into a single string, filtering out any falsy values.
 *
 * @param classes - An array of class names, which can be strings, undefined, or false.
 * @returns A string containing all the class names that are truthy, separated by spaces.
 */
export function classNames(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
