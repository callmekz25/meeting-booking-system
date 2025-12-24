using RabbitMQ.Client;

namespace Backend.RabbitMQ;

public class RabbitMqSetting
{
    public string HostName { get; set; }
    public string UserName  { get; set; }
    public string Password { get; set; }
    public string VirtualHost { get; set; }
    public int Port { get; set; } = 5672;
       
}

 
public static class RabbitMqQueues
{
    public const string MailQueue = "mailQueue";
    public const string UploadFileQueue = "uploadFileQueue";
}

public static class RabbitMqExchanges
{
    public const string MailExChange = "mailExchange";
    public const string UploadFileExChange = "uploadFileExchange";
}

public static class RabbitRoutingKeys
{
    public const string BookingApprovedMail = "email.approved";
    public const string BookingRejectedMail = "email.rejected";
    public const string InviteMail = "email.invite";
    public const string PasswordResetMail = "email.reset";
    public const string CreateAccountMail = "email.create-account";
    public const string ConfirmChangeMail = "email.confirm";
    public const string CancelMeetingMail = "email.cancel";
    public const string CancelMeetingRequesterMail = "email.cancelRequester";
    public const string UpdateMeetingMail = "email.update";
    public const string UploadFileCsv = "uploadfile.csv";
    public const string InventoryDailyJobMail = "email.inventory.daily";

}
