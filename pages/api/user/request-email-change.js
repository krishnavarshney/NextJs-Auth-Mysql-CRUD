import User from '../../../lib/models/user';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { promisify } from 'util';

const verifyJwt = promisify(jwt.verify);

// Basic email format validation
const isValidEmail = (email) => {
  // Regex from https://emailregex.com/
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(String(email).toLowerCase());
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
  }
  const token = authHeader.split(' ')[1];

  let decodedToken;
  try {
    decodedToken = await verifyJwt(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }

  const userId = decodedToken.userId;
  const { newEmail } = req.body;

  if (!newEmail) {
    return res.status(400).json({ message: 'New email is required' });
  }

  if (!isValidEmail(newEmail)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    // Check if the current user's email is already the newEmail
    const currentUser = await User.findById(userId);
    if (currentUser && currentUser.email === newEmail) {
      return res.status(400).json({ message: 'This is already your current email address.' });
    }

    // Check if the new email is already in use by another user
    const existingUserWithNewEmail = await User.findByEmail(newEmail);
    if (existingUserWithNewEmail && existingUserWithNewEmail.id !== userId) {
      return res.status(400).json({ message: 'This email address is already in use by another account.' });
    }

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // Token expires in 1 hour

    const success = await User.setNewEmailWithToken(userId, newEmail, emailVerificationToken, expires);

    if (!success) {
      console.error(`Failed to set new email with token for user: ${userId}`);
      return res.status(500).json({ message: 'Error processing your request. Please try again.' });
    }

    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email-change?token=${emailVerificationToken}`;

    console.log('------------------------------------');
    console.log('EMAIL CHANGE VERIFICATION SIMULATION:');
    console.log(`To (New Email): ${newEmail}`);
    console.log(`User ID: ${userId}`);
    console.log(`Subject: Verify Your New Email Address`);
    console.log(`Body: Click this link to verify your new email: ${verificationUrl}`);
    console.log(`Token (for testing): ${emailVerificationToken}`);
    console.log('------------------------------------');

    // TODO: Implement actual email sending to newEmail

    return res.status(200).json({ message: `A verification link has been sent to ${newEmail}. Please check your inbox to confirm the change.` });

  } catch (error) {
    console.error('Request email change error:', error);
    return res.status(500).json({ message: 'An error occurred while processing your request.' });
  }
}
