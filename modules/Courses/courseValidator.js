const appData = require('../../helpers/utils/appData.js');

class CourseValidation {
  checkIfCourseIsValid(courseId, courseList) {
    if (!courseList.hasOwnProperty(courseId)) {
      throw new Error(appData.inputDataError);
    }
  }
  checkIfCourseIsFull(courseObj) {
    if (courseObj.currEnrolled === courseObj.maxEmployees) {
      throw new Error(appData.courseFullError);
    }
  }

  checkIfCourseIsAllotted(courseObj, empCase = true) {
    if (courseObj.allotmentDone === true) {
      throw new Error(
        empCase == true
          ? appData.courseAllotmentDoneError
          : appData.courseAlreadyAllotted,
      );
    }
  }

  checkIfCourseCanBeAllotted(courseId, courseList) {
    return (
      courseList[courseId]['currEnrolled'] >=
      courseList[courseId]['minEmployees']
    );
  }

  checkIfCourseCanBeOffered(courseId, courseList) {
    try {
      this.checkIfCourseIsValid(courseId, courseList);
      this.checkIfCourseIsFull(courseList[courseId]);
      this.checkIfCourseIsAllotted(courseList[courseId]);
    } catch (error) {
      throw error;
    }
  }

  validateCourseForAllotment(courseId, courseList) {
    try {
      this.checkIfCourseIsValid(courseId, courseList);
      this.checkIfCourseIsAllotted(courseList[courseId], false);
    } catch (error) {
      throw error;
    }
  }
  
}

module.exports = new CourseValidation();
