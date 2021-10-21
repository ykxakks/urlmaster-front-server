const encodeCourseList = (courseArray) => {
    return courseArray.map((course) => `${course.code}: ${course.name}`).join('\n');
}
const createCourse = (code, name) => {
    return {code, name};
}

exports.encodeCourseList = encodeCourseList;
exports.createCourse = createCourse;