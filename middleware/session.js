import jwt from 'jsonwebtoken';

function session(handler) {
  return async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
      return handler(req, res);
    } catch (error) {
      res.status(401).json({ message: 'Unauthorized' });
    }
  };
}

export default session;