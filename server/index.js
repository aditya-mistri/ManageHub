require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
const session = require('express-session');
const mongoose = require('mongoose');
const { connect: connectRabbitMQ } = require('./config/rabbitmq');
const setupSwagger = require('./config/swagger');
const MongoStore = require('connect-mongo');


// Create Express app
const app = express();

// Connect to MongoDB
const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Set up middleware
app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Sessions
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || 'secret',
//     resave: false,
//     saveUninitialized: false
//   })
// );

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
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
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Set port
const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
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
    app.use('/api/auth', require('./routes/authRoute'));
    app.use('/api/customers', require('./routes/customerRoute'));    
    app.use('/api/orders', require('./routes/orderRoute'));
    app.use('/api/campaigns', require('./routes/campaignRoute'));
    
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