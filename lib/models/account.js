// /lib/models/account.js
import pool from '../db'; // Assuming your db.js exports the pool or a query function

class Account {
  /**
   * Links an OAuth account to a user.
   * This is typically called when a user signs in via an OAuth provider for the first time
   * with an email that either matches an existing user or after a new user is created.
   */
  static async linkAccount({
    userId,
    type, // e.g., 'oauth'
    provider, // e.g., 'google', 'github'
    providerAccountId, // ID from the provider
    access_token,
    expires_at, // Timestamp (seconds since epoch)
    refresh_token,
    id_token,
    scope,
    session_state,
    token_type,
  }) {
    const query = `
      INSERT INTO accounts
        (userId, type, provider, providerAccountId, access_token, expires_at, refresh_token, id_token, scope, session_state, token_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        access_token = VALUES(access_token),
        expires_at = VALUES(expires_at),
        refresh_token = COALESCE(VALUES(refresh_token), refresh_token), -- Keep old refresh_token if new one is null
        id_token = VALUES(id_token),
        scope = VALUES(scope),
        session_state = VALUES(session_state),
        token_type = VALUES(token_type)
    `;
    // Ensure expires_at is correctly handled if it's a Date object or needs conversion
    const values = [
      userId,
      type,
      provider,
      providerAccountId,
      access_token,
      expires_at, // Make sure this is a number if your DB expects INT
      refresh_token,
      id_token,
      scope,
      session_state,
      token_type,
    ];

    return new Promise((resolve, reject) => {
      pool.query(query, values, (error, results) => {
        if (error) {
          return reject(error);
        }
        // insertId might be 0 if ON DUPLICATE KEY UPDATE occurred on an existing row,
        // but results.affectedRows should be 1 (or 2 if updated).
        resolve(results);
      });
    });
  }

  /**
   * Retrieves an account by its provider and providerAccountId.
   * Used to check if a user has previously signed in with this OAuth account.
   */
  static async getAccountByProvider(provider, providerAccountId) {
    const query = 'SELECT * FROM accounts WHERE provider = ? AND providerAccountId = ?';
    const values = [provider, providerAccountId];

    return new Promise((resolve, reject) => {
      pool.query(query, values, (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results[0] || null); // Return the account or null if not found
      });
    });
  }

  /**
   * (Optional) Deletes all accounts associated with a userId.
   * Useful if a user's primary account is deleted.
   */
  static async deleteAccountsByUserId(userId) {
    const query = 'DELETE FROM accounts WHERE userId = ?';
    const values = [userId];
    return new Promise((resolve, reject) => {
      pool.query(query, values, (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results.affectedRows);
      });
    });
  }
}

export default Account;
