import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app: Application = express();

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI as string)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Connection error:', err));

// Routes
app.use('/api/users', userRoutes);
app.use('/auth', authRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));