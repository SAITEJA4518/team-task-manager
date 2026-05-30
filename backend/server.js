import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import taskRoutes from './routes/task.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Gateways
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// --- PRODUCTION FRONTEND SERVING CORE ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Instruct the system to host the static frontend folder elements
app.use(express.static(path.join(__dirname, '../frontend')));

// FIX: Official Express v5 matching pattern for root + nested sub-directories
app.get('/{*catchall}', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Database Connection Bridge
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Successfully connected to the Database Vault! ☁️🔋'))
  .catch((err) => console.error('Database connection error ❌:', err.message));

app.listen(PORT, () => {
  console.log(`Server is actively running on port ${PORT}`);
});