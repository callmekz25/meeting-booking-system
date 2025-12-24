using Microsoft.Extensions.Options;
using RabbitMQ.Client;

namespace Backend.RabbitMQ;

public class RabbitMqConnection : IAsyncDisposable
{
    private readonly RabbitMqSetting _settings;
    private IConnection? _connection;

    public RabbitMqConnection(IOptions<RabbitMqSetting> options)
    {
        _settings = options.Value;
    }

    public async Task<IConnection> GetConnection()
    {
        if (_connection is not null && _connection.IsOpen)
            return _connection;

        var factory = new ConnectionFactory
        {
            HostName = _settings.HostName,
            UserName = _settings.UserName,
            Password = _settings.Password,
            VirtualHost = _settings.VirtualHost,
            Port = _settings.Port,
        };

        _connection = await factory.CreateConnectionAsync();

        return _connection;
      
    }

    public async ValueTask DisposeAsync()
    {
        if (_connection is not null)
            await _connection.CloseAsync();
    }
}