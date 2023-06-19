const amqp = require('amqplib');
var { logger } = require("../utils/logger");

exports.sendMessage = async (req, host, exchange, routingKey, message) => {
  try {
    const connection = await amqp.connect(host);
    const channel = await connection.createChannel();
    
    await channel.assertExchange(exchange, 'direct', { durable: true });

    const jsonMessage = JSON.stringify(message);
    const bufferMessage = Buffer.from(jsonMessage, 'utf-8');

    channel.publish(exchange, routingKey, bufferMessage); // El segundo parámetro representa la clave de enrutamiento, deja en blanco ('') si no se necesita
    
    logger.info({
        action: "sendMessage",
        message: message,
        userId: req.userId,
        host: host,
        exchange: exchange,
        routingKey: routingKey,
        companyId: req.companyId,
      });
    await channel.close();
    await connection.close();
  } catch (error) {  
    console.log("error: " + error);
    logger.error(
        "connection queue",
        "An error occurred during connection queue.",
        error,
        message
    );
  }
}
