import User from '../../../lib/models/user';

export default async function handler(req, res) {
  try {
    const users = await User.fetchUsers();
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching users' });
  }
}
