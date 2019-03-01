function sleep(time) {
  // Return a promise that resolves after _time_ milliseconds.
  return new Promise((resolve) => setTimeout(resolve, time));
}

function getUniqueName(fileName, otherNames) {
  let tryName = fileName
  let numAdded = 0
  while (otherNames.indexOf(tryName) > -1) {
    numAdded = numAdded + 1
    tryName = fileName + ' (' + numAdded + ')'
  }
  return tryName
}

export default {
  sleep,
  getUniqueName
}
