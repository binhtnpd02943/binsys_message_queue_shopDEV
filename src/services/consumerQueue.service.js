'use strict';

const { connectToRabbitMQ, consumerQueue } = require('../database/init.rabbit');

// const log = console.log;

// console.log = function () {
//   log.apply(console, [new Date()].concat(arguments));
// };

const MessageService = {
  consumerToQueue: async (queueName) => {
    try {
      const { connection, channel } = await connectToRabbitMQ();
      await consumerQueue(channel, queueName);
    } catch (error) {
      console.error(`Error consumerToQueue:`, error);
    }
  },

  // Case Processing
  consumerToQueueNormal: async (queueName) => {
    try {
      const { connection, channel } = await connectToRabbitMQ();
      const notificationQueue = 'notificationQueueProcess';
      // 1. TTL

      // const timeExpired = 15000;
      // setTimeout(() => {
      //   channel.consume(notificationQueue, (message) => {
      //     console.log(
      //       `Send notificationQueue successful processed:`,
      //       message.content.toString()
      //     );
      //     channel.ack(message);
      //   });
      // }, timeExpired);

      // 2. LOGIC
      channel.consume(notificationQueue, (message) => {
        try {
          const numberTest = Math.random();
          console.log({ numberTest });
          if (numberTest < 0.8) {
            throw new Error('Send notification failed:: HOT FIX');
          }

          console.log(
            `Send notificationQueue successful processed:`,
            message.content.toString()
          );
          channel.ack(message);
        } catch (error) {
          channel.nack(message, false, false);
          /*
              nack: negative acknowledgment
          */
        }
      });
    } catch (error) {
      console.error(error);
    }
  },

  // Case Failed Processing
  consumerToQueueFailed: async (queueName) => {
    try {
      const { connection, channel } = await connectToRabbitMQ();
      const notificationExchangeDLX = 'notificationExDLX'; // notificationEx direct
      const notificationRoutingKeyDLX = 'notificationRoutingKeyDLX'; // assert

      const notificationQueueHandler = 'notificationQueueHotFix';
      await channel.assertExchange(notificationExchangeDLX, 'direct', {
        durable: true,
      });

      const queueResult = await channel.assertQueue(notificationQueueHandler, {
        exclusive: false,
      });

      await channel.bindQueue(
        queueResult.queue,
        notificationExchangeDLX,
        notificationRoutingKeyDLX
      );

      await channel.consume(
        queueResult.queue,
        (msgFailed) => {
          console.log(
            `This notification error, please hot fix:`,
            msgFailed.content.toString()
          );
        },
        { noAck: true }
      );
    } catch (error) {
      console.error(error);
    }
  },
};

module.exports = MessageService;
