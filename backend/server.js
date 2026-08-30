import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import dns from 'dns';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import resultRoutes from './routes/result.js';

// Debug: Check if Clerk publishable key is loaded
console.log('CLERK_PUBLISHABLE_KEY:', process.env.CLERK_PUBLISHABLE_KEY);
import { connectDB } from './config/db.js';

const app = express();
const PORT = process.env.PORT;

dns.setServers(["1.1.1.1","8.8.8.8"])


// Middleware

// Enable CORS for all origins (for development)
app.use(cors({
    origin: [
        "https://tech-quiz-master-dzb1.vercel.app",
        "https://tech-quiz-master-1.onrender.com",
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    credentials: true
}));

// Pass the publishableKey explicitly to Clerk middleware
app.use(ClerkExpressWithAuth({ publishableKey: process.env.CLERK_PUBLISHABLE_KEY }));
// === Place webhook route BEFORE express.json() ===
app.use(express.json());
app.use("/api/users", userRoutes); // This contains the webhook route with express.raw()

// Database connection
connectDB();

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/results", resultRoutes);

app.get('/', (req, res) => {
  res.send('API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});