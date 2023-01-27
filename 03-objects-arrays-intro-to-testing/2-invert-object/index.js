/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  const result = {};

  if (obj) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value != 'object') {
        result[value] = key;
      } else {
        return;
      }
    }
    return result;
  }

  return;
}