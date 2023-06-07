import User from '../../../lib/models/user';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, password } = req.body;

  // Validate name, email, and password
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide a name, email, and password' });
  }

  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return res.status(400).json({ message: 'Email ID Already Exists....' });
  }

  try {
    // Create the user in the database
    const user = await User.createUser(name, email, password);

    // Create session for the user
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.setHeader('Authorization', `Bearer ${token}`);
    return res.status(201).json({ message: 'Registration successful', token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error in Registration' });
  }
}
