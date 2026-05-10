const helpers = require('../../helpers/index.js');
const CourseValidation = require('./courseValidator.js');
const CourseOperations = require('./courseOperations.js');
const EmployeeOperations = require('../Employees/employeeOperations.js');

class AllotCourses {
  getEmployeeKeysArr(courseId, courseList) {
    const empSet = courseList[courseId]['empRegIdSet'];
    const empArr = [...empSet];
    empArr.sort();
    return empArr;
  }

  performAllocation(courseId, courseList, empList) {
    let state = true;
    const empArr = this.getEmployeeKeysArr(courseId, courseList);
    if (!CourseValidation.checkIfCourseCanBeAllotted(courseId, courseList)) {
      state = false;
      CourseOperations.cancelCourseAllotment(courseList, courseId);
      EmployeeOperations.cancelEmployeeEnrollment(empArr, empList);
    }
    CourseOperations.markAllotmentAsDone(courseList, courseId);
    return { state, empArr };
  }

  getResult(courseId, courseList, empList, payload) {
    const state = payload.state,
      empArr = payload.empArr;

    const status = state === false ? 'COURSE_CANCELED' : 'CONFIRMED';
    const courseName = courseList[courseId]['courseName'];
    const instructor = courseList[courseId]['instructor'];
    const courseDate = courseList[courseId]['courseDate'];
    const resArr = [];

    for (const key of empArr) {
      const email = empList[key]['email'];
      resArr.push(
        `${key} ${email} ${courseId} ${courseName} ${instructor} ${courseDate} ${status}`,
      );
    }
    return resArr.join('\n');
  }
  
  init(currCommandArr, courseList, empList) {
    try {
      helpers.validateParamsArray(currCommandArr, 2);
      const courseId = currCommandArr[1];
      CourseValidation.validateCourseForAllotment(courseId, courseList);
      const payload = this.performAllocation(courseId, courseList, empList);
      const res = this.getResult(courseId, courseList, empList, payload);
      return res;
    } catch (err) {
      return err.message;
    }
  }
}

module.exports = new AllotCourses();
