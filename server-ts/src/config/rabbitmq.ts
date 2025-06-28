import amqp, { Connection, Channel } from 'amqplib';

// RabbitMQ connection URL from environment variable with fallback
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

// Queue names
export const QUEUES = {
  CUSTOMER: 'customer_queue',
  ORDER: 'order_queue',
  CAMPAIGN: 'campaign_queue',
} as const;

// Exchange names
export const EXCHANGES = {
  DATA_INGESTION: 'data_ingestion_exchange',
} as const;

// Routing keys
export const ROUTING_KEYS = {
  CUSTOMER_CREATE: 'customer.create',
  CUSTOMER_UPDATE: 'customer.update',
  ORDER_CREATE: 'order.create',
  ORDER_UPDATE: 'order.update',
  CAMPAIGN_CREATE: 'campaign.create',
  CAMPAIGN_PAUSE: 'campaign.pause',
  CAMPAIGN_RESUME: 'campaign.resume',
} as const;

export interface RabbitMQConnection {
  connection: Connection;
  channel: Channel;
}

// Connect to RabbitMQ and set up exchange/queues
export async function connect(): Promise<RabbitMQConnection> {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // Create the topic exchange
    await channel.assertExchange(EXCHANGES.DATA_INGESTION, 'topic', { durable: true });

    // Declare queues
    await channel.assertQueue(QUEUES.CUSTOMER, { durable: true });
    await channel.assertQueue(QUEUES.ORDER, { durable: true });
    await channel.assertQueue(QUEUES.CAMPAIGN, { durable: true });

    // Bind queues to the exchange with appropriate routing keys
    await channel.bindQueue(QUEUES.CUSTOMER, EXCHANGES.DATA_INGESTION, ROUTING_KEYS.CUSTOMER_CREATE);
    await channel.bindQueue(QUEUES.CUSTOMER, EXCHANGES.DATA_INGESTION, ROUTING_KEYS.CUSTOMER_UPDATE);
    await channel.bindQueue(QUEUES.ORDER, EXCHANGES.DATA_INGESTION, ROUTING_KEYS.ORDER_CREATE);
    await channel.bindQueue(QUEUES.ORDER, EXCHANGES.DATA_INGESTION, ROUTING_KEYS.ORDER_UPDATE);
    await channel.bindQueue(QUEUES.CAMPAIGN, EXCHANGES.DATA_INGESTION, ROUTING_KEYS.CAMPAIGN_CREATE);

    console.log('✅ RabbitMQ connection and bindings established');
    return { connection, channel };
  } catch (error) {
    console.error('❌ Error connecting to RabbitMQ:', error);
    throw error;
  }
}

// Publish a message to the exchange with routing key
export async function publishMessage(
  channel: Channel,
  routingKey: string,
  message: Record<string, any>
): Promise<boolean> {
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