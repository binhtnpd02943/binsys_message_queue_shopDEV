'use strict';

const { connectToRabbitMQForTest } = require('../database/init.rabbit');

describe('RabbitMQ Connection', () => {
  it('Should connect to successful RabbitMQ', async () => {
    const result = await connectToRabbitMQForTest();
    expect(result).toBeUndefined();
  });
});
