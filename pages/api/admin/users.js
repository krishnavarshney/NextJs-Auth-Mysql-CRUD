import User from '../../../lib/models/user';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';

// Promisify jwt.verify if not already done elsewhere
const verifyJwt = promisify(jwt.verify);

async function isAdmin(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return false;
  }

  try {
    const decoded = await verifyJwt(token, process.env.JWT_SECRET);
    // Role should now be included in the JWT from the login process.
    if (decoded && decoded.role === 'admin') {
      return true;
    }
    // If role is not 'admin' or not present in JWT (which it should be), deny access.
    if (decoded && decoded.role !== 'admin') {
        console.log(`Access denied for user ${decoded.userId || decoded.email}. Role: ${decoded.role || 'not specified in JWT'}`);
    }
    return false;
  } catch (error) {
    console.error('JWT verification error:', error);
    return false;
  }
}

export default async function handler(req, res) {
  if (!await isAdmin(req)) {
    return res.status(403).json({ message: 'Forbidden: Access denied or role not admin in JWT.' });
  }

  if (req.method === 'GET') {
    try {
      const users = await User.fetchUsers(); // This now fetches id, name, email, role
      return res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ message: 'Error fetching users' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
