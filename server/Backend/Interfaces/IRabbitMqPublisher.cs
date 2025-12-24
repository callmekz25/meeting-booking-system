namespace Backend.Interfaces;

public interface IRabbitMqPublisher
{
    Task SendMessage<T>(T message, string queueName, string exChange, string routingKey);
}