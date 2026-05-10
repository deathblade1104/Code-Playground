const helpers = require('../../helpers/index.js');
const EmployeeOperations = require('./employeeOperations.js');
const CourseOperations = require('../Courses/courseOperations.js');
const appData = require('../../helpers/utils/appData.js');

class CancelRegistration {
  canCancel(courseList, courseId) {
    if (courseList[courseId]['allotmentDone'] === true) {
      throw new Error(appData.cancelRejected);
    }
  }
  cancel(empRegId, courseId, courseList, empList) {
    EmployeeOperations.cancelEmployeeEnrollment([empRegId], empList);
    CourseOperations.removeEnrollmentFromCourse(courseList, courseId, empRegId);
    return `${empRegId} ${appData.cancelAccepted}`;
  }
  init(currCommandArr, courseList, empList) {
    try {
      helpers.validateParamsArray(currCommandArr, 2);
      const empRegId = currCommandArr[1];
      const courseId = EmployeeOperations.getCourseIdFromEmployee(
        empList,
        empRegId,
      );
      this.canCancel(courseList, courseId);
      return this.cancel(empRegId, courseId, courseList, empList);
    } catch (err) {
      return err.message;
    }
  }
}

module.exports = new CancelRegistration();
