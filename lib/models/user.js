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
}

export default User;