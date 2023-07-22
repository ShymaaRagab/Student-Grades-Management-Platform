const express = require("express");
const adminController = require("../Controllers/adminController");
const generateExcelFile = require("../Controllers/generateExcelFile");
const router = express.Router();

// Route: POST /admin
router.post("/add", adminController.addAdmin);
router.post("/course", adminController.addCourse);
router.get("/courses", adminController.getAllCourses);
router.put("/course/:courseId", adminController.updateCourse);
router.delete("/course/:courseName", adminController.deleteCourse);
router.get("/course/:courseName", adminController.getGradesForSpecificCourse);
router.post("/upload", adminController.extractAndSaveStudentData);
router.get("/students", adminController.getAllStudents);
router.delete("/student/:nationalId", adminController.deleteStudent);
router.post("/saveGrades", adminController.saveGrades);
router.put("/updateGrades", adminController.updateGrades);
router.get(
  "/getAllStudentWithAllGrades",
  adminController.getAllStudentWithAllGrades
);
router.get("/courses/:term", adminController.getCoursesByTerm);
router.get("/generate-excel-file", async (req, res, next) => {
  try {
    const filePath = await generateExcelFile();
    res.download(filePath, "students_data.xlsx");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
