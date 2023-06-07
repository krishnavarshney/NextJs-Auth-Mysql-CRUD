import User from '../../../lib/models/user';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  try {
    // Get the token from the request headers or cookies
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

    if (!token) {
        console.log("\n\n\nToken not found");
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Retrieve user data from the database
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'Authenticated', user });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
