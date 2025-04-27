import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import connectDB from './config/database.js';
import { initializeWebSocket } from './websockets/index.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import characterRoutes from './routes/character.routes.js';
import questRoutes from './routes/quest.routes.js';
import dungeonRoutes from './routes/dungeon.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import guildRoutes from './routes/guild.routes.js';
import shopRoutes from './routes/shop.routes.js';
import trainingRoutes from './routes/training.routes.js';
import tavernRoutes from './routes/tavern.routes.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';
import pvpRoutes from './routes/pvp.routes.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Create Express app
const app = express();

// Create HTTP server
const server = createServer(app);

// Initialize WebSocket
initializeWebSocket(server);

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/dungeons', dungeonRoutes);
app.use('/api/characters', inventoryRoutes);
app.use('/api/guilds', guildRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/tavern', tavernRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/pvp', pvpRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});