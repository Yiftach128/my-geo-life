import { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';
import { CreateUserInput, UpdateUserInput } from '../validators/userValidator.js';

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const createUser = async (
  req: Request<{}, {}, CreateUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (
  req: Request<{ id: string }, {}, UpdateUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after' }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};