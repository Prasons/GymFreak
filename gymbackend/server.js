import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from "./config/db.js";


// Import routes
import userRoutes from "./routes/userRoutes.js";
import trainerRoutes from "./routes/trainerRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import dietPlanRoutes from "./routes/dietPlanRoutes.js";
import workoutPlanRoutes from "./routes/workoutPlanRoutes.js";
import trainingScheduleRoutes from "./routes/trainingScheduleRoutes.js";
import referralRoutes from "./routes/referralRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import membershipPlanRoutes from "./routes/membershipPlanRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import testRoutes from "./routes/testRoutes.js";

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';

// Load environment variables
const envPath = isProduction 
  ? path.resolve(process.cwd(), '.env.production') 
  : path.resolve(process.cwd(), '.env');
  
dotenv.config({ path: envPath });

// Initialize Express app
const app = express();

// Connect to database
connectDB().catch(err => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});

// CORS configuration
const allowedOrigins = [
  // Always allow localhost in any environment for development
  /^http:\/\/localhost(:[0-9]+)?$/,  // Match any localhost with any port
  /^http:\/\/127\.0\.0\.1(:[0-9]+)?$/,  // Match any 127.0.0.1 with any port
  
  // Add production domains (only used in production)
  ...(isProduction ? [
    "https://your-production-domain.com",
    // Add more production domains as needed
  ] : [])
];

// Trust first proxy in production
if (isProduction) {
  app.set('trust proxy', 1);
}

// CORS options
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin matches any allowed pattern
    if (allowedOrigins.some(pattern => {
      if (typeof pattern === 'string') {
        return pattern === origin;
      } else if (pattern instanceof RegExp) {
        return pattern.test(origin);
      }
      return false;
    })) {
      return callback(null, true);
    }
    
    // Origin not allowed
    console.error(`CORS error: ${origin} not in allowed origins`);
    console.log('Allowed origins:', allowedOrigins);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  maxAge: 86400 // 24 hours
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply CORS to all routes
app.use(cors(corsOptions));

// Enable CORS pre-flight across all routes
app.options('*', cors(corsOptions));

// Request logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/api/diet-plans", dietPlanRoutes);
app.use("/api/workout-plans", workoutPlanRoutes);
app.use("/api/training-schedules", trainingScheduleRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/membership-plans", membershipPlanRoutes);
app.use("/api/progress", progressRoutes);

app.use("/api/payment",paymentRoutes)

// Test routes (temporary, remove in production)
app.use('/api/test', testRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Not Found - ${req.originalUrl}`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${isProduction ? 'production' : 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

export default app;
