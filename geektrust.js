const CommandProcessor = require('./modules/processCommands/index.js');

const main = () => {
  try {
    const filename = process.argv[2];
    const processorObj = new CommandProcessor();
    processorObj.processFile(filename);
  } catch (err) {
    console.log(err);
  }
};

main();
