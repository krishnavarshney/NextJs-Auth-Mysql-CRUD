import { compare } from 'bcrypt';
import User from '../../../lib/models/user';

import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const { email, password } = req.body;
  // Validate email and password
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide an email and password' });
  }
  // Retrieve user from the database
  try {
    const user = await User.findByEmail(email);
    // Check if user exists and password is correct
    if (!user || !(await compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    // User model's findByEmail now returns role as well.
    // Create session for the user, including their role and ID in the JWT
    const tokenPayload = {
      userId: user.id,
      email: user.email, // Good to have email for some contexts
      role: user.role,   // Add user role to the JWT
    };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '1h', // Token expiration time
    });
    // Send the token in the response body (and optionally as a header)
    // res.setHeader('Authorization', `Bearer ${token}`); // Client usually handles this from body
    return res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role } // Also return user info
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error in Login...' });
  }
}
