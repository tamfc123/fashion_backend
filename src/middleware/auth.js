import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authMiddleware = async (req) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Fetch full user to get up-to-date role
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return null;
        }
        return user;
    } catch (error) {
        throw new Error("Unauthorized: Invalid token");
    }
};

export default authMiddleware;

