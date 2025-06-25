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

  const { id } = req.query; // This is the ID of the user to be edited/deleted
  const adminUserId = jwt.decode(req.headers.authorization.split(' ')[1]).userId; // ID of the admin making the request

  if (!id) {
    return res.status(400).json({ message: 'User ID parameter is required' });
  }
  const targetUserId = parseInt(id, 10);


  if (req.method === 'PUT') {
    const { name, email, role, password } = req.body;

    // Basic validation
    if (!name && !email && !role && !password) {
      return res.status(400).json({ message: 'No update data provided. At least one field (name, email, role, password) must be present.' });
    }
    if (email && !/.+@.+\..+/.test(email)) { // Simple email format check
        return res.status(400).json({ message: 'Invalid email format.' });
    }
    const validRoles = ['user', 'admin']; // Define valid roles
    if (role && !validRoles.includes(role)) {
        return res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    // Prevent admin from changing their own role from admin to user if they are the one making the request
    if (adminUserId === targetUserId && role && role !== 'admin') {
        // More complex logic could check if they are the *only* admin
        const currentUserMakingRequest = await User.findById(adminUserId);
        if (currentUserMakingRequest && currentUserMakingRequest.role === 'admin') {
            return res.status(403).json({ message: 'Admins cannot change their own role from admin to a non-admin role.' });
        }
    }

    try {
      const userDataToUpdate = {};
      if (name !== undefined) userDataToUpdate.name = name;
      if (email !== undefined) userDataToUpdate.email = email;
      if (role !== undefined) userDataToUpdate.role = role;
      if (password !== undefined && password !== "") userDataToUpdate.password = password; // Model handles hashing

      const affectedRows = await User.adminUpdateUser(targetUserId, userDataToUpdate);
      if (affectedRows > 0) {
        // Fetch the updated user data to return it
        const updatedUser = await User.findById(targetUserId);
        // Omit password from the returned user object
        if (updatedUser) delete updatedUser.password;
        return res.status(200).json({ message: 'User updated successfully', user: updatedUser });
      } else {
        // This could mean user not found, or no actual change was made to the data
        const userExists = await User.findById(targetUserId);
        if (!userExists) {
            return res.status(404).json({ message: 'User not found.' });
        }
        return res.status(200).json({ message: 'No changes detected or user not found.', user: userExists });
      }
    } catch (error) {
      console.error(`Error updating user ${targetUserId}:`, error);
      if (error.code === 'ER_DUP_ENTRY') { // Catch potential duplicate email errors from DB
        return res.status(409).json({ message: 'Email address is already in use by another account.' });
      }
      return res.status(500).json({ message: 'Error updating user' });
    }

  } else if (req.method === 'DELETE') {
    // Prevent admin from deleting themselves
    if (adminUserId === targetUserId) {
      return res.status(403).json({ message: 'Admins cannot delete their own account through this endpoint.' });
    }

    try {
      const affectedRows = await User.deleteUser(targetUserId);
      if (affectedRows > 0) {
        return res.status(200).json({ message: 'User deleted successfully' });
      } else {
        return res.status(404).json({ message: 'User not found or already deleted' });
      }
    } catch (error) {
      console.error(`Error deleting user ${targetUserId}:`, error);
      return res.status(500).json({ message: 'Error deleting user' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
