import User from '../../../lib/models/user';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Verification token is required' });
  }

  try {
    const verificationResult = await User.verifyNewEmail(token);

    if (verificationResult) {
      // verificationResult contains { userId, newEmail }
      console.log(`Email successfully verified and changed for user ID: ${verificationResult.userId} to ${verificationResult.newEmail}`);
      // Optionally, you might want to invalidate old JWTs or sessions here if they contain the old email.
      // For now, we assume user might need to log in again if they face issues, or token remains valid.
      return res.status(200).json({ message: 'Your new email address has been verified and updated successfully.' });
    } else {
      // Token was invalid, expired, or already used
      return res.status(400).json({ message: 'Invalid, expired, or already used verification token. Please request a new email change.' });
    }
  } catch (error) {
    console.error('Verify email change error:', error);
    return res.status(500).json({ message: 'An error occurred while verifying your email. Please try again.' });
  }
}
