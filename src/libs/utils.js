/** @module utils */

/**
 * Return a promise that resolves after a set amount of time in milliseconds.
 *
 * @function
 * @async
 * @param {number} time - the amount of time to sleep in  milliseconds
 * @returns {Promise}
 */
function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

/**
 * Create a unique filename, if a name already exists then append it with "(x)"
 *
 * @function
 * @param {string} fileName - the name of the new file that you want to have a unique name 
 * @param {string[]} otherNames - the existing filenames that the new file should not be the same as 
 * @returns {string} The unique filename
 */
function getUniqueName(fileName, otherNames) {
  let tryName = fileName
  let numAdded = 0
  while (otherNames.indexOf(tryName) > -1) {
    numAdded = numAdded + 1;
    tryName = fileName + ' (' + numAdded + ')';
  }
  return tryName
}

export default {
  sleep,
  getUniqueName
}
