//Add your tests here
const assert = require('assert');
const AddCourses = require('./modules/Courses/addCourses.js');
const AllotCourses = require('./modules/Courses/allotCourses.js');
const RegisterEmployees = require('./modules/Employees/registerEmployees.js');
const CancelRegistration = require('./modules/Employees/cancelRegistration.js');
const appData = require('./helpers/utils/appData.js');

describe('Course Scheduling Test', () => {
  const courseList = {},
    empList = {};

  it('Adds Course Offering +ve', () => {
    const res = AddCourses.init(
      ['', 'CPP', 'JAMES', '15062022', '1', '2'],
      courseList,
    );
    assert.equal(res, 'OFFERING-CPP-JAMES');
  });

  it('Adds Course Offering -ve', () => {
    const res = AddCourses.init([], courseList);
    assert.equal(res, 'INPUT_DATA_ERROR');
  });

  it('Registers course', () => {
    const res = RegisterEmployees.init(
      ['', 'JOY@YMAIL.COM', 'OFFERING-CPP-JAMES'],
      courseList,
      empList,
    );
    assert.equal(res, 'REG-COURSE-JOY-CPP ACCEPTED');
  });

  it('Registers course', () => {
    const res = RegisterEmployees.init(
      ['', 'JOSE@YMAIL.COM', 'OFFERING-CPP-JAMES'],
      courseList,
      empList,
    );
    assert.equal(res, 'REG-COURSE-JOSE-CPP ACCEPTED');
  });

  it('Registers course', () => {
    const res = RegisterEmployees.init(
      ['', 'TINA@YMAIL.COM', 'OFFERING-CPP-JAMES'],
      courseList,
      empList,
    );
    assert.equal(res, 'COURSE_FULL_ERROR');
  });

  it('Cancel Allotment', () => {
    const res = CancelRegistration.init(
      ['CANCEL', 'REG-COURSE-JOSE-CPP'],
      courseList,
      empList,
    );
    assert.equal(res, 'REG-COURSE-JOSE-CPP CANCEL_ACCEPTED');
  });

  it('Registers course', () => {
    const res = RegisterEmployees.init(
      ['', 'TINA@YMAIL.COM', 'OFFERING-CPP-JAMES'],
      courseList,
      empList,
    );
    assert.equal(res, 'REG-COURSE-TINA-CPP ACCEPTED');
  });

  it('Allots a Course', () => {
    const res = AllotCourses.init(
      ['ALLOT', 'OFFERING-CPP-JAMES'],
      courseList,
      empList,
    );
    assert.equal(
      res,
      'REG-COURSE-JOY-CPP JOY@YMAIL.COM OFFERING-CPP-JAMES CPP JAMES 15062022 CONFIRMED\nREG-COURSE-TINA-CPP TINA@YMAIL.COM OFFERING-CPP-JAMES CPP JAMES 15062022 CONFIRMED',
    );
  });

  it('Cancel Allotment -  Allotment Done', () => {
    const res = CancelRegistration.init(
      ['CANCEL', 'REG-COURSE-TINA-CPP'],
      courseList,
      empList,
    );
    assert.equal(res, appData.cancelRejected);
  });

  it('Allots a Course - Course Doesnt exist', () => {
    const res = AllotCourses.init(
      ['ALLOT', 'OFFERING-JAVA-JAMES'],
      courseList,
      empList,
    );
    assert.equal(res, appData.inputDataError);
  });

  it('Adds Course Offering +ve', () => {
    const res = AddCourses.init(
      ['', 'JAVA', 'JULIE', '05062022', '2', '3'],
      courseList,
    );
    assert.equal(res, 'OFFERING-JAVA-JULIE');
  });

  it('Registers course', () => {
    const res = RegisterEmployees.init(
      ['', 'JACK@YMAIL.COM', 'OFFERING-JAVA-JULIE'],
      courseList,
      empList,
    );
    assert.equal(res, 'REG-COURSE-JACK-JAVA ACCEPTED');
  });

  it('Allots a Course - Course not full', () => {
    const res = AllotCourses.init(
      ['ALLOT', 'OFFERING-JAVA-JULIE'],
      courseList,
      empList,
    );
    assert.equal(
      res,
      'REG-COURSE-JACK-JAVA JACK@YMAIL.COM OFFERING-JAVA-JULIE JAVA JULIE 05062022 COURSE_CANCELED',
    );
  });
});
