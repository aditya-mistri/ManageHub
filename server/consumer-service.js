// Load environment variables from .env
require('dotenv').config();

const mongoose = require('mongoose');
const { connect } = require('./config/rabbitmq');
const { startConsumers } = require('./consumer/index');

// MongoDB connection
const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Start the consumer service
const startConsumerService = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Connect to RabbitMQ
    const { channel } = await connect();

    // Start message consumers
    await startConsumers(channel);

    console.log('✅ Consumer service is running');
  } catch (error) {
    console.error('❌ Failed to start consumer service:', error.message);
    process.exit(1);
  }
};

// Gracefully handle shutdown
process.on('SIGINT', () => {
  console.log('🛑 Consumer service shutting down...');
  process.exit(0);
});

// Start the service
startConsumerService();
