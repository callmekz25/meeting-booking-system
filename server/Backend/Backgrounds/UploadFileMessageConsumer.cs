using System.Text;
using System.Text.Json;
using Backend.Dtos;
using Backend.RabbitMQ;
using Backend.Services;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace Backend.Backgrounds;

public class UploadFileMessageConsumer : BackgroundService
{
    
    private readonly RabbitMqConnection _connection;
    private readonly IServiceProvider _services;
    private IChannel? _channel;
    
    public UploadFileMessageConsumer(RabbitMqConnection connection, IServiceProvider services)
    {
        _connection = connection;
        _services = services;
      
    }
    
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var connection = await _connection.GetConnection();
        _channel = await connection.CreateChannelAsync();


        await _channel.ExchangeDeclareAsync(exchange: RabbitMqExchanges.UploadFileExChange, type: ExchangeType.Topic, durable: true);
        
        await _channel.QueueDeclareAsync(
            queue: RabbitMqQueues.UploadFileQueue,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null
        );

        await _channel.QueueBindAsync(queue: RabbitMqQueues.UploadFileQueue, exchange: RabbitMqExchanges.UploadFileExChange,
            "uploadfile.*");
        
        var consumer = new AsyncEventingBasicConsumer(_channel);

        consumer.ReceivedAsync += async (model, ea) =>
        {
            var body = ea.Body.ToArray();
            var message = Encoding.UTF8.GetString(body);
      
            
            Console.WriteLine($"Received: {message}");
     
            
            try
            {
                await HandleMessage(message);
                await _channel.BasicAckAsync(ea.DeliveryTag, false);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Upload failed: {ex.Message}");

                await _channel.BasicNackAsync(
                    ea.DeliveryTag,
                    multiple: false,
                    requeue: false 
                );
            }

        };

        await _channel.BasicConsumeAsync(
            queue: RabbitMqQueues.UploadFileQueue,
            autoAck: false,
            consumer: consumer
        );
        
        
        await Task.CompletedTask;
    }


    private async Task HandleMessage(string body)
    {
        using var scope = _services.CreateScope();
        var cloudService = scope.ServiceProvider.GetRequiredService<CloudinaryService>();
            
         
        var data = JsonSerializer.Deserialize<UploadFileDto>(body)
                   ?? throw new Exception("Invalid message body");

        await cloudService.UploadFile(data.FilePath);
        
        if (File.Exists(data.FilePath))
        {
            File.Delete(data.FilePath);
        }
        
    }
    public override async void Dispose()
    {
        if (_channel is not null)
            await _channel.CloseAsync();

        
        base.Dispose();
    }
}