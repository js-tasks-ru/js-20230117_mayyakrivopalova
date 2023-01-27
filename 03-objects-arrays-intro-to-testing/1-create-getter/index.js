/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */

export function createGetter(path) {
  let pathSteps = path.split(".");

  return function(field) {

    let stepValue = field;

    for (let step of pathSteps ) {
      if (stepValue[step]) {
        stepValue = stepValue[step]
      } else {
        return undefined;
      }
    }

    return stepValue;
  }
}