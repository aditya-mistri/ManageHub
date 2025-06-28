import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { connectDB } from '@/config/database';
import { connect as connectRabbitMQ } from '@/config/rabbitmq';
import setupSwagger from '@/config/swagger';

// Import routes
import authRoutes from '@/routes/authRoute';
import customerRoutes from '@/routes/customerRoute';
import orderRoutes from '@/routes/orderRoute';
import campaignRoutes from '@/routes/campaignRoute';

// Create Express app
const app = express();

// Set up middleware
app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI!,
      collectionName: 'sessions',
      ttl: 24 * 60 * 60, // 1 day
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: 'lax',
      httpOnly: true,
    },
  })
);

// Passport config
require('@/config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Set port
const PORT = process.env.PORT || 5000;

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Connect to RabbitMQ
    const { channel } = await connectRabbitMQ();
    
    // Store RabbitMQ channel in app for routes to use
    app.set('rabbitMQChannel', channel);
    
    // Set up Swagger documentation
    setupSwagger(app);
    
    // Define Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/customers', customerRoutes);    
    app.use('/api/orders', orderRoutes);
    app.use('/api/campaigns', campaignRoutes);
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGINT', () => {
  console.log('Server shutting down');
  process.exit(0);
});

// Start the server
startServer();