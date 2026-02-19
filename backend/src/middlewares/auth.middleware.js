import jwt from 'jsonwebtoken';
export const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
export const adminOnly = (req, res, next) => {
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPERADMIN') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();
};
//# sourceMappingURL=auth.middleware.js.map