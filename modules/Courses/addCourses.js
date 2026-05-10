const appData = require('../../helpers/utils/appData.js');
const helpers = require('../../helpers/index.js');
const CourseOperations = require('./courseOperations.js');

class AddCourses {
  getUniqueCourseOfferingKey(courseName, instructor) {
    return `OFFERING-${courseName}-${instructor}`;
  }

  makeCourseObject(
    courseName,
    instructor,
    courseDate,
    minEmployees,
    maxEmployees,
  ) {
    const courseObj = {
      courseName,
      instructor,
      courseDate,
      minEmployees,
      maxEmployees,
      currEnrolled: appData.defaultCurrEnrolled,
      empRegIdSet: new Set(),
      allotmentDone: appData.defaultAllotmentDone,
      cancelled: appData.defaultCancelled,
    };
    return courseObj;
  }

  init(currCommandArr, courseList) {
    try {
      helpers.validateParamsArray(currCommandArr, 6);

      const courseName = currCommandArr[1];
      const instructor = currCommandArr[2];

      const courseObj = this.makeCourseObject(
        courseName,
        instructor,
        currCommandArr[3],
        +currCommandArr[4],
        +currCommandArr[5],
      );

      const courseId = this.getUniqueCourseOfferingKey(courseName, instructor);
      CourseOperations.addCourseToList(courseList, courseObj, courseId);

      return courseId;
    } catch (error) {
      return error.message;
    }
  }
}

module.exports = new AddCourses();
