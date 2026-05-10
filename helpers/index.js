const utils = require('./utils/index.js');
const appData = require('./utils/appData.js');
const fs = require('fs');

class Helpers {
  validateParamsArray(commandArray, requiredLength) {
    if (!utils.checkArraySize(commandArray, requiredLength))
      throw new Error(appData.inputDataError);
  }

  trimArrayContents(commandArr) {
    for (let i = 0; i < commandArr.length; i++) {
      commandArr[i] = commandArr[i].split(' ');
      for (let j = 0; j < commandArr[i].length; j++) {
        commandArr[i][j] = commandArr[i][j].trim();
      }
    }
  }

  parseDataToGetCommands(filename) {
    const commandLines = fs.readFileSync(filename).toString().split('\n');
    this.trimArrayContents(commandLines);
    return commandLines;
  }
}

module.exports = new Helpers();
