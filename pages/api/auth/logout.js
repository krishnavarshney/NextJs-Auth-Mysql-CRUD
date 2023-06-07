export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  // Respond with a success message
  res.json({ message: 'Logout successful' });
};

