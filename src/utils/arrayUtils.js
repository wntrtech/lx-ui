export function checkArrayOfObjects(array) {
  if (!Array.isArray(array)) {
    return false;
  }
  if (array.length === 0) {
    return false;
  }
  if (!array.every((item) => typeof item === 'object' && item !== null && !Array.isArray(item))) {
    return false;
  }

  return array.every((item) => Object.keys(item).length !== 0);
}

export function checkArrayObjectProperty(array, property) {
  if (!checkArrayOfObjects(array)) {
    return false;
  }
  return array.every((item) => Object.prototype.hasOwnProperty.call(item, property));
}
