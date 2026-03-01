import jwt from 'jsonwebtoken';

const authMiddleware = (req) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { id: decoded.id };
    } catch (error) {
        throw new Error("Unauthorized: Invalid token");
    }
};

export default authMiddleware;

