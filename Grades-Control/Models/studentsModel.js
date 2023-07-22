const db = require('./db');

const createStudentsTable = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      National_ID INTEGER PRIMARY KEY,
      Student_Name TEXT
    )
  `);
};

const getAllStudents = (callback) => {
  db.all('SELECT * FROM students', (err, rows) => {
    if (err) {
      return callback(err);
    }
    return callback(null, rows);
  });
};

const getStudentById = (nationalId, callback) => {
  db.get('SELECT * FROM students WHERE National_ID = ?', [nationalId], (err, row) => {
    if (err) {
      return callback(err);
    }
    return callback(null, row);
  });
};

const insertStudent = (student, callback) => {
  const { National_ID, Student_Name } = student;

  db.run('INSERT INTO students (National_ID, Student_Name) VALUES (?, ?)', [National_ID, Student_Name], function (err) {
    if (err) {
      return callback(err);
    }
    return callback(null, this.lastID);
  });
};

const updateStudent = (student, callback) => {
  const { National_ID, Student_Name } = student;

  db.run('UPDATE students SET Student_Name = ? WHERE National_ID = ?', [Student_Name, National_ID], function (err) {
    if (err) {
      return callback(err);
    }
    return callback(null, this.changes);
  });
};

const deleteStudent = (nationalId, callback) => {
  db.run('DELETE FROM students WHERE National_ID = ?', [nationalId], function (err) {
    if (err) {
      return callback(err);
    }
    return callback(null, this.changes);
  });
};

module.exports = {
  createStudentsTable,
  getAllStudents,
  getStudentById,
  insertStudent,
  updateStudent,
  deleteStudent,
};