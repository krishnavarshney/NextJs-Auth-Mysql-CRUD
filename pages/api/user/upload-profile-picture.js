import User from '../../../lib/models/user';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';

const verifyJwt = promisify(jwt.verify);

// Basic URL validation (very simple)
const isValidHttpUrl = (string) => {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
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
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ message: 'Image URL is required' });
  }

  if (!isValidHttpUrl(imageUrl)) {
    return res.status(400).json({ message: 'Invalid image URL format. Must be a valid HTTP/HTTPS URL.' });
  }

  // Add more validation for imageUrl if needed (e.g. length, specific domains)

  try {
    const success = await User.updateProfilePictureUrl(userId, imageUrl);

    if (!success) {
      // This might happen if the userId is somehow invalid, though JWT verification should prevent this.
      console.error(`Failed to update profile picture URL for user: ${userId}`);
      return res.status(500).json({ message: 'Error updating profile picture. Please try again.' });
    }

    return res.status(200).json({ message: 'Profile picture updated successfully.', imageUrl });

  } catch (error) {
    console.error('Update profile picture error:', error);
    return res.status(500).json({ message: 'An error occurred while updating your profile picture.' });
  }
}
