import User from '../../../lib/models/user';
import crypto from 'crypto';
// import nodemailer from 'nodemailer'; // For actual email sending

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await User.findByEmail(email);

    if (!user) {
      // It's generally better not to reveal if an email exists or not for security reasons.
      // So, we send a generic success-like message even if user not found.
      console.log(`Password reset request for non-existent email: ${email}`);
      return res.status(200).json({ message: 'If your email address is in our system, you will receive a password reset link.' });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Set token expiration (e.g., 1 hour from now)
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    // Store the token and expiration in the database
    // Note: Storing a HASH of the resetToken would be more secure.
    // For this implementation, storing the token directly as per simpler interpretation.
    const success = await User.setPasswordResetToken(user.id, resetToken, expires);

    if (!success) {
      console.error(`Failed to set password reset token for user: ${user.id}`);
      return res.status(500).json({ message: 'Error processing your request. Please try again.' });
    }

    // Construct reset URL (replace with your actual domain in production)
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Simulate sending email
    console.log('------------------------------------');
    console.log('PASSWORD RESET EMAIL SIMULATION:');
    console.log(`To: ${user.email}`);
    console.log(`Subject: Password Reset Request`);
    console.log(`Body: Click this link to reset your password: ${resetUrl}`);
    console.log(`Token (for testing): ${resetToken}`);
    console.log('------------------------------------');

    // TODO: Implement actual email sending here using a service like Nodemailer
    // Example (requires nodemailer setup and mail server):
    // const transporter = nodemailer.createTransport({ /* ...config... */ });
    // await transporter.sendMail({
    //   to: user.email,
    //   subject: 'Password Reset Request',
    //   html: `<p>Please click this link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
    // });

    return res.status(200).json({ message: 'If your email address is in our system, you will receive a password reset link.' });

  } catch (error) {
    console.error('Forgot password error:', error);
    // Generic error message to the client
    return res.status(500).json({ message: 'An error occurred while processing your request.' });
  }
}
