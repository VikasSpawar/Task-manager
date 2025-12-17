// backend/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // 1. Get the token from the header (Authorization: Bearer <token>)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract just the token part

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  // 2. Verify the token
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    // 3. Attach the user info to the request object
    (req as any).user = user; 
    
    // 4. Let the request pass to the controller
    next();
  });
};