const helpers = require('../../helpers/index.js');
const AddCourses = require('../Courses/addCourses.js');
const AllotCourses = require('../Courses/allotCourses.js');
const RegisterEmployees = require('../Employees/registerEmployees.js');
const CancelRegistration = require('../Employees/cancelRegistration.js');

class CommandProcessor {
  constructor() {
    this.courseList = {};
    this.empList = {};
  }

  switchCaseFunction(currCommandArr) {
    let res = '';
    switch (currCommandArr[0]) {
      case 'ADD-COURSE-OFFERING':
        res = AddCourses.init(currCommandArr, this.courseList);
        break;

      case 'REGISTER':
        res = RegisterEmployees.init(
          currCommandArr,
          this.courseList,
          this.empList,
        );
        break;

      case 'ALLOT':
        res = AllotCourses.init(currCommandArr, this.courseList, this.empList);
        break;

      case 'CANCEL':
        res = CancelRegistration.init(
          currCommandArr,
          this.courseList,
          this.empList,
        );
        break;
      default:
        res = 'INVALID_COMMAND';
        break;
    }
    return res;
  }
  commandIterator(commandArr, courseList, empList) {
    for (const command of commandArr) {
      const res = this.switchCaseFunction(command, courseList, empList);
      console.log(res);
    }
  }

  processFile(fileName) {
    try {
      const commandArray = helpers.parseDataToGetCommands(fileName);
      this.commandIterator(commandArray);
    } catch (err) {
      throw err;
    }
  }
}

module.exports = CommandProcessor;
