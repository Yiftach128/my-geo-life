import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import User from '../models/User.js';
import { RegisterInput, LoginInput } from '../validators/authValidator.js';

// helper to get the secret key in the format jose expects
const getSecretKey = () => {
  return new TextEncoder().encode(process.env.JWT_SECRET);
};

// helper to generate a token
const generateToken = async (userId: string, tokenVersion: number): Promise<string> => {
  return new SignJWT({ id: userId, version: tokenVersion })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(process.env.JWT_EXPIRES_IN ?? '7d')
    .sign(getSecretKey());
};

export const register = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, age } = req.body;

    // check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // create the user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      age
    });

    // generate token
    const token = await generateToken(user._id.toString(), user.tokenVersion);

    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) { //user not found case
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // generate token
    const token = await generateToken(user._id.toString(), user.tokenVersion);

    res.json({ user, token });
  } catch (err) {
    next(err);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await User.findByIdAndUpdate(req.user!._id, {
      $inc: { tokenVersion: 1 } // increment by 1
    });
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};