import User from '../../../../lib/models/user';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';

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

  const { id } = req.query;

  if (req.method === 'DELETE') {
    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    try {
      // It might be prudent to prevent admins from deleting themselves.
      // For now, this is not implemented.
      // const decodedToken = jwt.decode(req.headers.authorization.split(' ')[1]);
      // if (decodedToken.userId === parseInt(id, 10)) {
      //   return res.status(400).json({ message: 'Admins cannot delete themselves through this endpoint.' });
      // }

      const affectedRows = await User.deleteUser(parseInt(id, 10));
      if (affectedRows > 0) {
        return res.status(200).json({ message: 'User deleted successfully' });
      } else {
        return res.status(404).json({ message: 'User not found or already deleted' });
      }
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      return res.status(500).json({ message: 'Error deleting user' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
