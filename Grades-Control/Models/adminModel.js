const db = require('./db');

const createAdminsTable = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS Admins (
      Email TEXT PRIMARY KEY,
      Password TEXT
    )
  `);
};

const getAdminByEmail = (email, callback) => {
  db.get('SELECT * FROM Admins WHERE Email = ?', [email], (err, row) => {
    if (err) {
      return callback(err);
    }
    return callback(null, row);
  });
};

const insertAdmin = (admin, callback) => {
  const { Email, Password } = admin;

  db.run('INSERT INTO Admins (Email, Password) VALUES (?, ?)', [Email, Password], function (err) {
    if (err) {
      return callback(err);
    }
    return callback(null, this.lastID);
  });
};

const updateAdminPassword = (email, password, callback) => {
  db.run('UPDATE Admins SET Password = ? WHERE Email = ?', [password, email], function (err) {
    if (err) {
      return callback(err);
    }
    return callback(null, this.changes);
  });
};

const deleteAdmin = (email, callback) => {
  db.run('DELETE FROM Admins WHERE Email = ?', [email], function (err) {
    if (err) {
      return callback(err);
    }
    return callback(null, this.changes);
  });
};

module.exports = {
  createAdminsTable,
  getAdminByEmail,
  insertAdmin,
  updateAdminPassword,
  deleteAdmin,
};