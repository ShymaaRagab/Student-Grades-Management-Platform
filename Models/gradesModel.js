const db = require('./db');

const createGradesTable = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS grades (
      Course_Name TEXT,
      National_ID INTEGER,
      Grade TEXT,
      Year_Work INTEGER,
      Full_Grade INTEGER,
      Practical_Exams_Grade INTEGER,
      Written_Exams_Grade INTEGER,
      PRIMARY KEY (National_ID, Course_Name),
      FOREIGN KEY (Course_Name) REFERENCES courses (Course_Name),
      FOREIGN KEY (National_ID) REFERENCES students (National_ID)
    )
  `);
  
};

const getAllGrades = (callback) => {
  db.all('SELECT * FROM grades', (err, rows) => {
    if (err) {
      return callback(err);
    }
    return callback(null, rows);
  });
};

const getGradeByCourseAndStudent = (courseName, nationalId, callback) => {
  db.get('SELECT * FROM grades WHERE Course_Name = ? AND National_ID = ?', [courseName, nationalId], (err, row) => {
    if (err) {
      return callback(err);
    }
    return callback(null, row);
  });
};

const insertGrade = (grade, callback) => {
  const { Course_Name, National_ID, Grade, Year_Work, Full_Grade, Practical_Exams_Grade, Written_Exams_Grade } = grade;

  db.run('INSERT INTO grades (Course_Name, National_ID, Grade, Year_Work, Full_Grade, Practical_Exams_Grade, Written_Exams_Grade) VALUES (?, ?, ?, ?, ?, ?, ?)', [Course_Name, National_ID, Grade, Year_Work, Full_Grade, Practical_Exams_Grade, Written_Exams_Grade], function (err) {
    if (err) {
      return callback(err);
    }
    return callback(null, this.lastID);
  });
};

const updateGrade = (grade, callback) => {
  const { Course_Name, National_ID, Grade, Year_Work, Full_Grade, Practical_Exams_Grade, Written_Exams_Grade } = grade;

  db.run('UPDATE grades SET Grade = ?, Year_Work = ?, Full_Grade = ?, Practical_Exams_Grade = ?, Written_Exams_Grade = ? WHERE Course_Name = ? AND National_ID = ?', [Grade, Year_Work, Full_Grade, Practical_Exams_Grade, Written_Exams_Grade, Course_Name, National_ID], function (err) {
    if (err) {
      return callback(err);
    }
    return callback(null, this.changes);
  });
};

const deleteGrade = (courseName, nationalId, callback) => {
  db.run('DELETE FROM grades WHERE Course_Name = ? AND National_ID = ?', [courseName, nationalId], function (err) {
    if (err) {
      return callback(err);
    }
    return callback(null, this.changes);
  });
};

module.exports = {
  createGradesTable,
  getAllGrades,
  getGradeByCourseAndStudent,
  insertGrade,
  updateGrade,
  deleteGrade,
};