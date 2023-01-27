/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  const result = [];
  const arrRepeated = [];
  let temp_string = "";
  let current_letter = "";

  if (size == 0) {
    return '';
  } else if (size == undefined) {
    return string;
  } else {
    // получаю подмассивы повторяющихся элементов
    for (let i = 0; i <= string.length; i++) {

      if (string[i] == current_letter) {
        temp_string += string[i]
      }

      if (!current_letter) {
        temp_string += string[i]
        current_letter = string[i]
      }

      if (string[i] != current_letter) {
        arrRepeated.push(temp_string)
        current_letter = string[i]
        temp_string = string[i]
      }
    }

    // получаю из подмассива строку указанной длины
    for (let i = 0; i < arrRepeated.length; i++) {
      result.push(arrRepeated[i].slice(-size))
    }

    return result.join('')
  }
}