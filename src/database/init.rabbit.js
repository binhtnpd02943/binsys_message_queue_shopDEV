'use strict';

const amqp = require('amqplib');

const connectToRabbitMQ = async () => {
  try {
    const connection = await amqp.connect('amqp://guest:12345@localhost');
    if (!connection) throw new Error('Connection not established');

    const channel = await connection.createChannel();
    return { connection, channel };
  } catch (error) {
    console.error(`Error connecting to RabbitMQ:`, error);
    throw error;
  }
};

const connectToRabbitMQForTest = async () => {
  try {
    const { connection, channel } = await connectToRabbitMQ();
    // Publish message to a queue
    const queue = 'test-queue';
    const message = 'Hello, ShopDev by BinhTN';
    await channel.assertQueue(queue, {
      durable: true,
    });

    // Send messages to consumer channel
    await channel.sendToQueue(queue, Buffer.from(message));

    // Close
    await connection.close();
  } catch (error) {
    console.error(`Error connecting to RabbitMQ:`, error);
  }
};

const consumerQueue = async (channel, queueName) => {
  try {
    await channel.assertQueue(queueName, { durable: true });
    channel.consume(
      queueName,
      (messages) => {
        console.log(
          `Received message: ${queueName}::`,
          messages.content.toString()
        );
        // 1. find user following tại SHOP
        // 2. send message to user
        // 3. yes, 0k => success
        // 4. error. setup DLX...
      },
      {
        noAck: true,
      }
    );
  } catch (error) {
    console.error(`Error publish message to RabbitMQ:`, error);
  }
};

module.exports = {
  connectToRabbitMQ,
  consumerQueue,
  connectToRabbitMQForTest,
};
