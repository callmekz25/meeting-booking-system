using System.Text;
using System.Text.Json;
using Backend.Dtos;
using Backend.RabbitMQ;
using Backend.Services;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace Backend.Backgrounds;

public class MailMessageConsumer : BackgroundService
{
    
    private readonly RabbitMqConnection _connection;
    private readonly IServiceProvider _services;
    private readonly ILogger<MailMessageConsumer> _logger;
    private IChannel? _channel;
    

    public MailMessageConsumer(RabbitMqConnection connection, IServiceProvider services, ILogger<MailMessageConsumer> logger)
    {
        _connection = connection;
        _services = services;
        _logger = logger;
    }
    
    
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
     
      
        var connection = await _connection.GetConnection();
        _channel = await connection.CreateChannelAsync();


        await _channel.ExchangeDeclareAsync(exchange: RabbitMqExchanges.MailExChange, type: ExchangeType.Topic, durable: true);
        
        await _channel.QueueDeclareAsync(
            queue: RabbitMqQueues.MailQueue,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null
        );

        await _channel.QueueBindAsync(queue: RabbitMqQueues.MailQueue, exchange: RabbitMqExchanges.MailExChange,
            "email.*");

        var consumer = new AsyncEventingBasicConsumer(_channel);

        consumer.ReceivedAsync += async (model, ea) =>
        {
            var body = ea.Body.ToArray();
            var message = Encoding.UTF8.GetString(body);
            
            var routingKey = ea.RoutingKey;
            
            Console.WriteLine($"Received: {message}");
            bool success = await HandleMessageAsync(routingKey, message);

            if (success)
                await _channel.BasicAckAsync(ea.DeliveryTag, false);
            else
                await _channel.BasicNackAsync(
                    ea.DeliveryTag,
                    multiple: false,
                    requeue: true
                );

        };

        await _channel.BasicConsumeAsync(
            queue: RabbitMqQueues.MailQueue,
            autoAck: false,
            consumer: consumer
        );


        await Task.CompletedTask;
    }
    
    private async Task<bool> HandleMessageAsync(string routingKey, string body)
    {
       
        try
        {
            using var scope = _services.CreateScope();
            var emailService = scope.ServiceProvider.GetRequiredService<EmailService>();

            switch (routingKey)
            {
                case RabbitRoutingKeys.CreateAccountMail:
                    {
                        var dataCreateAccountMail = JsonSerializer.Deserialize<EmailCreateUserDto>(body);
                        if (dataCreateAccountMail == null)
                        {
                            break;
                        }

                        await emailService.SendPasswordCreateUserEmail(dataCreateAccountMail);

                        break;
                    }
                case RabbitRoutingKeys.BookingApprovedMail:
                    {
                        var dataApprovedMail = JsonSerializer.Deserialize<EmailMessageDto>(body);
                        if (dataApprovedMail == null)
                        {
                            break;
                        }

                        await emailService.SendApprovedEmail(dataApprovedMail.Booking);

                        break;
                    }

                case RabbitRoutingKeys.BookingRejectedMail:
                    {
                        var dataRejectedMail = JsonSerializer.Deserialize<EmailMessageDto>(body);
                        if (dataRejectedMail == null)
                        {
                            break;
                        }

                        await emailService.SendRejectedEmail(
                            dataRejectedMail.Booking,
                            dataRejectedMail.RejectReason
                        );

                        break;
                    }

                case RabbitRoutingKeys.InviteMail:
                    var dataInviteMail = JsonSerializer.Deserialize<EmailMessageDto>(body);
                    if (dataInviteMail == null)
                    {
                        break;
                    }
                    await emailService.SendInviteEmail(dataInviteMail.Booking);
                    break;
                case RabbitRoutingKeys.CancelMeetingMail:
                    var dataCancellationMail = JsonSerializer.Deserialize<EmailMessageDto>(body);
                    if (dataCancellationMail == null)
                    {
                        break;
                    }
                    await emailService.SendCancellationEmail(dataCancellationMail.Booking);
                    break;
                case RabbitRoutingKeys.CancelMeetingRequesterMail:
                    var dataCancellReQMail = JsonSerializer.Deserialize<EmailMessageDto>(body);
                    if (dataCancellReQMail == null)
                    {
                        break;
                    }
                    await emailService.SendCancellationEmailToRequester(dataCancellReQMail.Booking);
                    break;

                case RabbitRoutingKeys.UpdateMeetingMail:
                    var dataUpdateMail = JsonSerializer.Deserialize<EmailMessageDto>(body);
                    if (dataUpdateMail == null)
                    {
                        break;
                    }
                    await emailService.SendUpdateEmail(dataUpdateMail.Booking);
                    break;
                case RabbitRoutingKeys.PasswordResetMail:
                    var dataPasswordResetMail = JsonSerializer.Deserialize<PasswordResetEmailDto>(body);
                    if (dataPasswordResetMail == null)
                    {
                        break;
                    }
                    Console.WriteLine($"PasswordResetMail: {dataPasswordResetMail}");
                    await emailService.SendPasswordResetEmail(dataPasswordResetMail.Email, dataPasswordResetMail.UserName, dataPasswordResetMail.ResetLink);
                    break;
                case RabbitRoutingKeys.ConfirmChangeMail:
                    var dataConfirmChangeMail = JsonSerializer.Deserialize<PasswordChangedEmail>(body);
                    if ( dataConfirmChangeMail == null)
                    {
                        break;
                    }
                    await emailService.SendPasswordChangeConfirmationEmail(dataConfirmChangeMail.Email,dataConfirmChangeMail.FullName);
                    break;
                case RabbitRoutingKeys.InventoryDailyJobMail:
                    var info = JsonSerializer.Deserialize<InventoryJobMailDto>(body);
                    await emailService.SendInventoryDailyJobMail(
                        info
                    );
                    break;


                default:
                    _logger.LogWarning($"Unknown routing key: {routingKey}");
                    break;
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling email message");
            return false;
        }
    }

    public override async void Dispose()
    {
        if (_channel is not null)
            await _channel.CloseAsync();

        
        base.Dispose();
    }

}