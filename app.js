const express = require('express');
const bodyParser = require('body-parser');
const adminRoutes = require('./Routes/adminRoute');
const adminModel = require('./Models/adminModel');
const courseModel = require('./Models/coursesModel');
const studentModel = require('./Models/studentsModel');
const gradesModel = require('./Models/gradesModel');

const app = express();
const port = 5000;

// Configure middleware
app.use(bodyParser.json());

// Create tables (if not already created)
adminModel.createAdminsTable();
courseModel.createCoursesTable();
studentModel.createStudentsTable();
gradesModel.createGradesTable();
// You can call other table creation functions as needed for other models

// Define routes
app.use('/admin', adminRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});