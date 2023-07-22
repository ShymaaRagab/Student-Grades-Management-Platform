const db = require('./db');

const createCoursesTable = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS courses (
      Course_Name TEXT PRIMARY KEY,
      Course_ID TEXT,
      Course_Type TEXT,
      Course_Term TEXT
    )
  `);
};

const getAllCourses = (callback) => {
  db.all('SELECT * FROM courses', (err, rows) => {
    if (err) {
      return callback(err);
    }
    return callback(null, rows);
  });
};

const getCourseByName = (courseName, callback) => {
  db.get('SELECT * FROM courses WHERE Course_Name = ?', [courseName], (err, row) => {
    if (err) {
      return callback(err);
    }
    return callback(null, row);
  });
};

const insertCourse = (course, callback) => {
  const { Course_Name, Course_ID, Course_Type, Course_Term } = course;

  db.run('INSERT INTO courses (Course_Name, Course_ID, Course_Type, Course_Term) VALUES (?, ?, ?, ?)', [Course_Name, Course_ID, Course_Type, Course_Term], function (err) {
    if (err) {
      return callback(err);
    }
    return callback(null, this.lastID);
  });
};

const updateCourse = (courseId, updates, callback) => {
  const { Course_Name, Course_ID, Course_Type, Course_Term } = updates;

  const query = `
    UPDATE courses
    SET Course_Name = ?,
        Course_ID = ?,
        Course_Type = ?,
        Course_Term = ?
    WHERE Course_ID = ?
  `;

  db.run(query, [Course_Name, Course_ID, Course_Type, Course_Term, courseId], function (err) {
    if (err) {
      return callback(err);
    }
    return callback(null, this.changes);
  });
};

const deleteCourse = (courseName, callback) => {
  db.run('DELETE FROM courses WHERE Course_Name = ?', [courseName], function (err) {
    if (err) {
      return callback(err);
    }
    return callback(null, this.changes);
  });
};

const deleteCourseByName = (courseName, callback) => {
  const query = `
    DELETE FROM courses
    WHERE Course_Name = ?
  `;

  db.run(query, [courseName], function (err) {
    if (err) {
      return callback(err);
    }
    return callback(null, { changes: this.changes });
  });
};

module.exports = {
  createCoursesTable,
  getAllCourses,
  getCourseByName,
  insertCourse,
  updateCourse,
  deleteCourse,
  deleteCourseByName
};