import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


interface JWTPayload {
    id: number;
    email: string;
}

const JWT_SECRET = process.env.JWT_SECRET;


if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in environment variables");
}
const requireAuth = (req: Request , res: Response, next: NextFunction): Response | void => {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

export default requireAuth;