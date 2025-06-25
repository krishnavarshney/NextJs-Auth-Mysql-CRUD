import User from '../../../lib/models/user';
// No bcrypt needed here directly as User.updatePassword handles hashing

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  if (password.length < 6) { // Basic password length validation server-side
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    // Find user by reset token (also checks expiry)
    const user = await User.findByResetToken(token);

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token. Please request a new one.' });
    }

    // Update the user's password (hashing is handled by User.updatePassword)
    const passwordUpdated = await User.updatePassword(user.id, password);

    if (!passwordUpdated) {
        // This case should ideally not happen if user was found, but good to check
        console.error(`Failed to update password for user ${user.id} despite valid token.`);
        return res.status(500).json({ message: 'Error updating password. Please try again.' });
    }

    // Clear the reset token
    const tokenCleared = await User.clearPasswordResetToken(user.id);
    if (!tokenCleared) {
        // Log this error, but the password was updated, so it's not critical for the user flow
        console.warn(`Failed to clear password reset token for user ${user.id} after successful password reset.`);
    }

    return res.status(200).json({ message: 'Password has been reset successfully. You can now log in with your new password.' });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'An error occurred while resetting your password. Please try again.' });
  }
}
