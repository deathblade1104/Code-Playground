class CourseOperations {
  addCourseToList(courseList, courseObj, courseId) {
    courseList[courseId] = courseObj;
    return;
  }

  addEnrollmentToCourse(courseList, courseId, empRegKey) {
    courseList[courseId]['currEnrolled']++;
    courseList[courseId]['empRegIdSet'].add(empRegKey);
    return;
  }

  removeEnrollmentFromCourse(courseList, courseId, empRegKey) {
    courseList[courseId]['currEnrolled']--;
    courseList[courseId]['empRegIdSet'].delete(empRegKey);
    return;
  }

  cancelCourseAllotment(courseList, courseId) {
    courseList[courseId]['cancelled'] = true;
  }

  markAllotmentAsDone(courseList, courseId) {
    courseList[courseId]['allotmentDone'] = true;
  }
}

module.exports = new CourseOperations();
