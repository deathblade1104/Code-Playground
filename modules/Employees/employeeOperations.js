class EmployeeOperations {
  cancelEmployeeEnrollment(empKeysArr, empList) {
    for (const key of empKeysArr) {
      empList[key]['active'] = false;
    }
  }

  addEmployeeRegistration(empList, empObj, empRegKey) {
    empList[empRegKey] = empObj;
  }

  getCourseIdFromEmployee(empList, empRegId) {
    const courseId = empList[empRegId]['courseId'];
    return courseId;
  }
}

module.exports = new EmployeeOperations();
