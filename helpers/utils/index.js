class Util {
  isUndefined(str, emptyStringCheck = false) {
    if (
      typeof str === 'undefined' ||
      str === null ||
      str === 'undefined' ||
      str === 'null'
    ) {
      return true;
    }
    if (
      emptyStringCheck &&
      typeof str === 'string' &&
      str.toString().trim().length === 0
    ) {
      return true;
    }
    return false;
  }
  checkArraySize(arr, requiredLength) {
    if (
      this.isUndefined(arr) ||
      !Array.isArray(arr) ||
      arr.length !== requiredLength
    )
      return false;

    return true;
  }
}
module.exports = new Util();
