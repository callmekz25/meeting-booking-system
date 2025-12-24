using System.Text;
using System.Text.Json;
using Backend.Interfaces;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;

namespace Backend.RabbitMQ;

public class RabbitMqPublisher : IRabbitMqPublisher
{
    private readonly RabbitMqConnection _connection;

    public RabbitMqPublisher(RabbitMqConnection connection)
    {
        _connection = connection;
    }

    public async Task SendMessage<T>(T message, string queueName, string exChange, string routingKey)
    {
        var connection = await _connection.GetConnection();
        var channel = await connection.CreateChannelAsync();

        await channel.ExchangeDeclareAsync(exChange, ExchangeType.Topic, durable: true);
        await channel.QueueDeclareAsync(queue: queueName, durable: true, exclusive: false, autoDelete: false, arguments: null);
        var messageJson = JsonSerializer.Serialize(message);
        var body = Encoding.UTF8.GetBytes(messageJson);

        await channel.BasicPublishAsync(exchange: exChange, routingKey: routingKey, body: body);
        
    }
}