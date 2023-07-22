const adminModel = require("../Models/adminModel");
const courseModel = require("../Models/coursesModel");
const studentModel = require("../Models/studentsModel");
const gradesModel = require("../Models/gradesModel");
const upload = require("./MulterController");
const xlsx = require("xlsx");
const db = require("../Models/db");
const createError = require("http-errors");

const addAdmin = (req, res) => {
  const { Email, Password } = req.body;

  const admin = {
    Email,
    Password,
  };

  adminModel.insertAdmin(admin, (err, adminId) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to add admin" });
    }
    return res
      .status(200)
      .json({ message: "Admin added successfully", adminId });
  });
};

const addCourse = (req, res) => {
  const { Course_Name, Course_ID, Course_Type, Course_Term } = req.body;

  const course = {
    Course_Name,
    Course_ID,
    Course_Type,
    Course_Term,
  };

  courseModel.insertCourse(course, (err, courseId) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to add course" });
    }
    return res
      .status(200)
      .json({ message: "Course added successfully", courseId });
  });
};

const getAllCourses = (req, res) => {
  courseModel.getAllCourses((err, courses) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch courses" });
    }
    return res.status(200).json(courses);
  });
};

const updateCourse = (req, res) => {
  const { courseId } = req.params;
  const { Course_Name, Course_ID, Course_Type, Course_Term } = req.body;

  const courseUpdates = {
    Course_Name,
    Course_ID,
    Course_Type,
    Course_Term,
  };

  courseModel.updateCourse(courseId, courseUpdates, (err, updatedCourse) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to update course" });
    }
    return res
      .status(200)
      .json({ message: "Course updated successfully", updatedCourse });
  });
};

const deleteCourse = (req, res) => {
  const { courseName } = req.params;

  courseModel.deleteCourseByName(courseName, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to delete course" });
    }

    if (result.changes === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    return res.status(200).json({ message: "Course deleted successfully" });
  });
};

const extractAndSaveStudentData = (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to upload file" });
    }

    const file = req.file;
    const filePath = file.path;

    // Read the data from the Excel sheet
    const workbook = xlsx.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    // Iterate over the data and save it to the student table
    data.forEach((row) => {
      const [Student_Name, National_ID] = row;

      // Check if student already exists
      studentModel.getStudentById(National_ID, (err, existingStudent) => {
        if (err) {
          console.error(err);
          return;
        }

        if (existingStudent) {
          console.log(
            `Student with National ID ${National_ID} already exists. Skipping.`
          );
          return;
        }

        // Create and save new student
        const student = { Student_Name, National_ID };
        studentModel.insertStudent(student, (err) => {
          if (err) {
            console.error(err);
          }
        });
      });
    });

    return res
      .status(200)
      .json({ message: "Student data extracted and saved successfully" });
  });
};

const getAllStudents = (req, res) => {
  studentModel.getAllStudents((err, students) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to retrieve students" });
    }
    return res.status(200).json({ students });
  });
};

const deleteStudent = (req, res) => {
  const { nationalId } = req.params;

  studentModel.deleteStudent(nationalId, (err, numDeleted) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to delete student" });
    }

    if (numDeleted === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    return res.status(200).json({ message: "Student deleted successfully" });
  });
};

const saveGrades = async (req, res, next) => {
  try {
    const { Course_Name, Grades } = req.body;

    for (const gradeData of Grades) {
      const {
        National_ID,
        Grade,
        Oral_degree,
        Year_Work,
        Full_Grade,
        Practical_Exams_Grade,
        Written_Exams_Grade,
      } = gradeData;

      db.run(
        `INSERT INTO grades (Course_Name, National_ID, Grade, Oral_degree, Year_Work, Full_Grade, Practical_Exams_Grade, Written_Exams_Grade) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          Course_Name,
          National_ID,
          Grade,
          Oral_degree,
          Year_Work,
          Full_Grade,
          Practical_Exams_Grade,
          Written_Exams_Grade,
        ],
        function (err) {
          if (err) {
            console.error("Failed to add grades:", err);
            const error = new Error("Failed to add grades");
            error.statusCode = 500;
            return next(error);
          }
        }
      );
    }

    return res.status(201).json({ message: "Grades saved successfully" });
  } catch (error) {
    next(error);
  }
};

// Update grades for multiple students
const updateGrades = async (req, res, next) => {
  const { Course_Name, Grades } = req.body;
  try {
    const updatePromises = Grades.map(async (gradeData) => {
      const {
        National_ID,
        Grade,
        Oral_degree,
        Year_Work,
        Full_Grade,
        Practical_Exams_Grade,
        Written_Exams_Grade,
      } = gradeData;

      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE grades SET 
            Grade = ?, 
            Oral_degree = ?, 
            Year_Work = ?, 
            Full_Grade = ?, 
            Practical_Exams_Grade = ?, 
            Written_Exams_Grade = ? 
          WHERE Course_Name = ? AND National_ID = ?`,
          [
            Grade,
            Oral_degree,
            Year_Work,
            Full_Grade,
            Practical_Exams_Grade,
            Written_Exams_Grade,
            Course_Name,
            National_ID,
          ],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          }
        );
      });
    });

    Promise.all(updatePromises)
      .then(() => {
        return res.json({ message: "Grades updated successfully" });
      })
      .catch((error) => {
        return next(createError(500, "Failed to update grades"));
      });
  } catch (error) {
    next(error);
  }
};

const getAllStudentWithAllGrades = async (req, res, next) => {
  try {
    db.all(
      `
      SELECT s.National_ID, s.Student_Name, g.Course_Name, g.Grade, g.Year_Work, g.Full_Grade, g.Practical_Exams_Grade, g.Written_Exams_Grade, g.Oral_degree
      FROM students AS s
      LEFT JOIN grades AS g ON s.National_ID = g.National_ID
      `,
      [],
      (err, rows) => {
        if (err) {
          console.error("Failed to fetch students with grades:", err);
          const error = new Error("Failed to fetch students with grades");
          error.statusCode = 500;
          return next(error);
        }

        const studentsWithGrades = {};

        rows.forEach((row) => {
          const {
            National_ID,
            Student_Name,
            Course_Name,
            Grade,
            Year_Work,
            Full_Grade,
            Practical_Exams_Grade,
            Written_Exams_Grade,
            Oral_degree,
          } = row;

          if (!studentsWithGrades[National_ID]) {
            studentsWithGrades[National_ID] = {
              National_ID,
              Student_Name,
              grades: [],
            };
          }

          studentsWithGrades[National_ID].grades.push({
            Course_Name,
            Grade,
            Year_Work,
            Full_Grade,
            Practical_Exams_Grade,
            Written_Exams_Grade,
            Oral_degree,
          });
        });

        const students = Object.values(studentsWithGrades);

        return res.json(students);
      }
    );
  } catch (error) {
    next(error);
  }
};

// Get students with grades for a specific course
const getGradesForSpecificCourse = async (req, res, next) => {
  const courseName = req.params.courseName;

  db.all(
    `SELECT s.*, g.*
    FROM students AS s
    LEFT JOIN grades AS g ON s.National_ID = g.National_ID
    WHERE g.Course_Name = ?`,
    [courseName],
    (err, rows) => {
      if (err) {
        return next(
          createError(
            500,
            "Failed to fetch students with grades for the specified course"
          )
        );
      }

      return res.json(rows);
    }
  );
};

const getCoursesByTerm = (req, res, next) => {
  const term = req.params.term; // Extract the term value from the route parameter

  db.all(
    `SELECT *
    FROM courses
    WHERE Course_Term = '${term}'`, // Wrap the term value in single quotes
    (err, courses) => {
      if (err) {
        console.error(`Failed to fetch ${term} courses:`, err);
        const error = new Error(`Failed to fetch ${term} courses`);
        error.statusCode = 500;
        return next(error);
      }

      return res.json(courses);
    }
  );
};

module.exports = {
  addAdmin,
  addCourse,
  getAllCourses,
  updateCourse,
  deleteCourse,
  extractAndSaveStudentData,
  getAllStudents,
  deleteStudent,
  saveGrades,
  updateGrades,
  getGradesForSpecificCourse,
  getAllStudentWithAllGrades,
  getCoursesByTerm,
};
