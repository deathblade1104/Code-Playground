const helpers = require('../../helpers/index.js');
const CourseValidation = require('../Courses/courseValidator.js');
const CourseOperations = require('../Courses/courseOperations.js');
const EmployeeOperations = require('./employeeOperations.js');
const appData = require('../../helpers/utils/appData.js');

class RegisterEmployees {
  getEmployeeName(email) {
    const arr = email.split('@');
    return arr[0];
  }

  getEmployeeRegKey(name, courseName) {
    return `${appData.registerKey}-${name}-${courseName}`;
  }

  getEmpObj(name, email, courseId) {
    const empObj = {
      name,
      email,
      courseId,
      active: true,
    };
    return empObj;
  }

  addEmployeeToCourse(courseId, email, courseList, empList) {
    const name = this.getEmployeeName(email);
    const empRegKey = this.getEmployeeRegKey(
      name,
      courseList[courseId].courseName,
    );
    const empObj = this.getEmpObj(name, email, courseId);
    EmployeeOperations.addEmployeeRegistration(empList, empObj, empRegKey);
    CourseOperations.addEnrollmentToCourse(courseList, courseId, empRegKey);
    return `${empRegKey} ACCEPTED`;
  }

  init(commandArr, courseList, empList) {
    try {
      helpers.validateParamsArray(commandArr, 3);
      const email = commandArr[1];
      const courseId = commandArr[2];
      CourseValidation.checkIfCourseCanBeOffered(courseId, courseList);
      return this.addEmployeeToCourse(courseId, email, courseList, empList);
    } catch (err) {
      return err.message;
    }
  }
}

module.exports = new RegisterEmployees();
