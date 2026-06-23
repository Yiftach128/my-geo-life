import { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';
import User from '../models/User.js';

const getSecretKey = () => {
  return new TextEncoder().encode(process.env.JWT_SECRET);
};

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. check authorization header exists
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // 2. extract token from "Bearer eyJhbGci..."
    const token = authHeader.split(' ')[1];

    // 3. verify token and decode payload
    const { payload } = await jwtVerify(token, getSecretKey());

    // 4. find user from token payload
    const user = await User.findById(payload.id as string);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    // 5. check token version matches
    if (payload.version !== user.tokenVersion) {
      return res.status(401).json({ error: 'Token invalidated — please log in again' });
    }
    
    // 6. attach user to request
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};