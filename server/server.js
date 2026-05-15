import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();

// ✅ Middleware FIRST
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes AFTER middleware
app.get('/', (req, res) => {
  res.json({ message: 'T-Shirt Shop API is running!' });
});

app.post('/test', (req, res) => {
  console.log('Test body:', req.body);
  res.json({ received: req.body });
});

app.use('/auth', authRoutes); // ← moved to bottom

mongoose.connect(process.env.MONGODB_URI, { family: 4 })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((error) => console.error('❌ Error:', error.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});