// /server/models/User.js
import pool from '../db';
import { hash } from 'bcrypt';

class User {
  static async findByEmail(email) {
    // Also select the role
    const query = 'SELECT id, name, email, password, role FROM users WHERE email = ?';
    const values = [email];
    return new Promise((resolve, reject) => {
      pool.query(query, values, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results[0]);
        }
      });
    });
  }

  static async findById(id) {
    // Also select the role
    const query = 'SELECT id, name, email, password, role FROM users WHERE id = ?';
    const values = [id];
    return new Promise((resolve, reject) => {
      pool.query(query, values, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results[0]);
        }
      });
    });
  }

  static async createUser(name, email, password, role = 'user') {
    // Added role, defaults to 'user'. Assumes DB schema is updated:
    // ALTER TABLE users ADD COLUMN role VARCHAR(255) DEFAULT 'user';
    const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    const hashedPassword = await hash(password, 10);
    const values = [name, email, hashedPassword, role];

    return new Promise((resolve, reject) => {
      pool.query(query, values, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results.insertId);
        }
      });
    });
  }

  static async fetchUsers() {
    // Also select the role
    const query = 'SELECT id, name, email, role FROM users'; // Password excluded for general fetching
    return new Promise((resolve, reject) => {
      pool.query(query, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  static async deleteUser(userId) {
    const query = 'DELETE FROM users WHERE id = ?';
    const values = [userId];

    return new Promise((resolve, reject) => {
      pool.query(query, values, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results.affectedRows);
        }
      });
    });
  }

  static async updateUser(userId, userData) {
    const { name, password } = userData;
    const hashedPassword = await hash(password, 10);
    const query = 'UPDATE users SET name = ?, password = ? WHERE id = ?';
    const values = [name, hashedPassword, userId];

    return new Promise((resolve, reject) => {
      pool.query(query, values, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results.affectedRows);
        }
      });
    });
  }

  // Methods for password reset
  // Assumes DB schema is updated:
  // ALTER TABLE users ADD COLUMN resetPasswordToken VARCHAR(255) NULL;
  // ALTER TABLE users ADD COLUMN resetPasswordExpires DATETIME NULL;

  static async setPasswordResetToken(userId, token, expires) {
    const query = 'UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE id = ?';
    const values = [token, expires, userId];
    return new Promise((resolve, reject) => {
      pool.query(query, values, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results.affectedRows > 0);
        }
      });
    });
  }

  static async findByResetToken(token) {
    const query = 'SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > NOW()';
    const values = [token];
    return new Promise((resolve, reject) => {
      pool.query(query, values, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results[0]);
        }
      });
    });
  }

  static async clearPasswordResetToken(userId) {
    const query = 'UPDATE users SET resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id = ?';
    const values = [userId];
    return new Promise((resolve, reject) => {
      pool.query(query, values, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results.affectedRows > 0);
        }
      });
    });
  }

  static async updatePassword(userId, newPassword) {
    const hashedPassword = await hash(newPassword, 10);
    const query = 'UPDATE users SET password = ? WHERE id = ?';
    const values = [hashedPassword, userId];
     return new Promise((resolve, reject) => {
      pool.query(query, values, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results.affectedRows > 0);
        }
      });
    });
  }

  // Methods for Profile Enhancements
  // Assumes DB schema is updated with:
  // profilePictureUrl VARCHAR(255) NULL
  // newEmail VARCHAR(255) NULL
  // emailVerificationToken VARCHAR(255) NULL
  // emailVerificationTokenExpires DATETIME NULL

  static async updateProfilePictureUrl(userId, imageUrl) {
    const query = 'UPDATE users SET profilePictureUrl = ? WHERE id = ?';
    const values = [imageUrl, userId];
    return new Promise((resolve, reject) => {
      pool.query(query, values, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results.affectedRows > 0);
        }
      });
    });
  }

  static async setNewEmailWithToken(userId, newEmail, token, expires) {
    const query = 'UPDATE users SET newEmail = ?, emailVerificationToken = ?, emailVerificationTokenExpires = ? WHERE id = ?';
    const values = [newEmail, token, expires, userId];
    return new Promise((resolve, reject) => {
      pool.query(query, values, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results.affectedRows > 0);
        }
      });
    });
  }

  static async verifyNewEmail(token) {
    // First, find the user by the token and ensure it's not expired
    const findQuery = 'SELECT id, newEmail FROM users WHERE emailVerificationToken = ? AND emailVerificationTokenExpires > NOW()';
    return new Promise((resolve, reject) => {
      pool.query(findQuery, [token], async (error, results) => {
        if (error) {
          return reject(error);
        }
        const userToVerify = results[0];
        if (!userToVerify) {
          return resolve(null); // Token invalid, expired, or already used
        }

        // Token is valid, update the email and clear verification fields
        const updateQuery = 'UPDATE users SET email = ?, newEmail = NULL, emailVerificationToken = NULL, emailVerificationTokenExpires = NULL WHERE id = ?';
        const updateValues = [userToVerify.newEmail, userToVerify.id];
        pool.query(updateQuery, updateValues, (updateError, updateResults) => {
          if (updateError) {
            return reject(updateError);
          }
          if (updateResults.affectedRows > 0) {
            resolve({ userId: userToVerify.id, newEmail: userToVerify.newEmail });
          } else {
            // Should not happen if userToVerify was found
            resolve(null);
          }
        });
      });
    });
  }

  // findById and findByEmail should ideally select new fields like profilePictureUrl if they are needed frequently.
  // For now, SELECT * in findByResetToken or specific selections in other places will do.
  // If `check-auth` or similar general purpose user-fetching needs these, those queries should be updated.
  // For example, modifying findById:
  // static async findById(id) {
  //   const query = 'SELECT id, name, email, password, role, profilePictureUrl FROM users WHERE id = ?';
  //   ...
  // }
  // And findByEmail:
  // static async findByEmail(email) {
  //   const query = 'SELECT id, name, email, password, role, profilePictureUrl FROM users WHERE email = ?';
  //   ...
  // }
  // This change will be made in a subsequent step if profilePictureUrl is needed in Navbar or similar.
  // For now, only specific profile page will load it.

  // Method for Admin to update user details
  static async adminUpdateUser(userId, { name, email, role, password }) {
    const fieldsToUpdate = [];
    const values = [];

    if (name !== undefined) {
      fieldsToUpdate.push('name = ?');
      values.push(name);
    }
    if (email !== undefined) {
      fieldsToUpdate.push('email = ?');
      values.push(email);
      // If admin changes email, clear any pending email verification for that user
      fieldsToUpdate.push('newEmail = NULL');
      fieldsToUpdate.push('emailVerificationToken = NULL');
      fieldsToUpdate.push('emailVerificationTokenExpires = NULL');
    }
    if (role !== undefined) {
      fieldsToUpdate.push('role = ?');
      values.push(role);
    }
    if (password !== undefined && password !== '') { // only update password if provided and not empty
      const hashedPassword = await hash(password, 10);
      fieldsToUpdate.push('password = ?');
      values.push(hashedPassword);
    }

    if (fieldsToUpdate.length === 0) {
      return Promise.resolve(0); // No fields to update
    }

    values.push(userId); // For the WHERE id = ? clause

    const queryString = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;

    return new Promise((resolve, reject) => {
      pool.query(queryString, values, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results.affectedRows);
        }
      });
    });
  }
}

export default User;