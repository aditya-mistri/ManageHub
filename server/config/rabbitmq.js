const amqp = require('amqplib');

// RabbitMQ connection URL from environment variable with fallback
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

// Queue names
const QUEUES = {
  CUSTOMER: 'customer_queue',
  ORDER: 'order_queue',
  CAMPAIGN: 'campaign_queue' // ✅ Added campaign queue
};

// Exchange names
const EXCHANGES = {
  DATA_INGESTION: 'data_ingestion_exchange'
};

// Routing keys
const ROUTING_KEYS = {
  CUSTOMER_CREATE: 'customer.create',
  CUSTOMER_UPDATE: 'customer.update',
  ORDER_CREATE: 'order.create',
  ORDER_UPDATE: 'order.update',
  CAMPAIGN_CREATE: 'campaign.create' // ✅ Added campaign routing key
};

// Connect to RabbitMQ and set up exchange/queues
async function connect() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // Create the topic exchange
    await channel.assertExchange(EXCHANGES.DATA_INGESTION, 'topic', { durable: true });

    // Declare queues
    await channel.assertQueue(QUEUES.CUSTOMER, { durable: true });
    await channel.assertQueue(QUEUES.ORDER, { durable: true });
    await channel.assertQueue(QUEUES.CAMPAIGN, { durable: true }); // ✅ Declare campaign queue

    // Bind queues to the exchange with appropriate routing keys
    await channel.bindQueue(QUEUES.CUSTOMER, EXCHANGES.DATA_INGESTION, ROUTING_KEYS.CUSTOMER_CREATE);
    await channel.bindQueue(QUEUES.CUSTOMER, EXCHANGES.DATA_INGESTION, ROUTING_KEYS.CUSTOMER_UPDATE);
    await channel.bindQueue(QUEUES.ORDER, EXCHANGES.DATA_INGESTION, ROUTING_KEYS.ORDER_CREATE);
    await channel.bindQueue(QUEUES.ORDER, EXCHANGES.DATA_INGESTION, ROUTING_KEYS.ORDER_UPDATE);
    await channel.bindQueue(QUEUES.CAMPAIGN, EXCHANGES.DATA_INGESTION, ROUTING_KEYS.CAMPAIGN_CREATE); // ✅ Bind campaign queue

    console.log('✅ RabbitMQ connection and bindings established');
    return { connection, channel };
  } catch (error) {
    console.error('❌ Error connecting to RabbitMQ:', error);
    throw error;
  }
}

// Publish a message to the exchange with routing key
async function publishMessage(channel, routingKey, message) {
  try {
    await channel.publish(
      EXCHANGES.DATA_INGESTION,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
    console.log(`📤 Message published to "${routingKey}"`);
    return true;
  } catch (error) {
    console.error(`❌ Error publishing message to "${routingKey}":`, error);
    throw error;
  }
}

module.exports = {
  connect,
  publishMessage,
  QUEUES,
  EXCHANGES,
  ROUTING_KEYS
};
