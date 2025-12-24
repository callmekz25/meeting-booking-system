using System.Net;
using System.Net.Mail;
using System.Security.Claims;
using System.Threading.Tasks;
using Backend.Dtos;
using Backend.Smtp;
using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace Backend.Services
{
    public class EmailService
    {
        private readonly IConfiguration _configuration;
        private readonly SendGridOptions _options;


        public EmailService(IConfiguration configuration, IOptions<SendGridOptions> options)
        {
            _configuration = configuration;
            _options = options.Value;
        
        }

        public async Task SendPasswordCreateUserEmail(EmailCreateUserDto dto)
        {
            if (string.IsNullOrEmpty(dto.Email))
                return;
            
            var subject = "Your Booking Meeting Room Account Has Been Created";

            var body = $@"
                <p>Dear {dto.Name},</p>

                <p>Your account has been <strong>successfully created</strong> in the 
                <strong>Booking Meeting Room System</strong>.</p>

                <h3>Account Information</h3>
                <ul>
                    <li><strong>Username:</strong> {dto.Name}</li>
                    <li><strong>Temporary Password:</strong> 
                        <span style='color:red; font-weight:bold;'>{dto.Password}</span>
                    </li>
                </ul>

                <p>
                    For security reasons, please 
                    <strong>log in and change your password immediately</strong>.
                </p>

                <p>
                    <a href='https://team2info.netlify.app/login' 
                       style='padding:10px 20px;
                              background-color:#007bff;
                              color:white;
                              text-decoration:none;
                              border-radius:4px;'>
                        Log In Now
                    </a>
                </p>

                <p style='color:#dc3545;'>
                    Do not share this password with anyone.
                </p>

                <p>Thank you,<br/>
                <strong>Meeting Management System</strong></p>";

            await SendEmailAsync(dto.Email, subject, body);
        }

        public async Task SendInviteEmail(BookingDto booking)
        {
            if (booking.Attendees == null || !booking.Attendees.Any())
                return;
            var requesterEmail = booking.Requester?.Email;
            var subject = $"Invitation: Meeting \"{booking.Title}\"";
            
            foreach (var attendee in booking.Attendees)
            {
                if (!string.IsNullOrEmpty(requesterEmail) && attendee.Email.Equals(requesterEmail, StringComparison.OrdinalIgnoreCase))
                    continue;

                var body = $@"
                <p>Dear {attendee.FullName},</p>

                <p>You have been <strong>invited</strong> to join a meeting organized by 
                <strong>{booking.Requester.FullName}</strong>.</p>

                <h3>Meeting Details</h3>
                <ul>
                    <li><strong>Title:</strong> {booking.Title}</li>
                    <li><strong>Date:</strong> {booking.StartTime:dddd, dd MMM yyyy}</li>
                    <li><strong>Time:</strong> {booking.StartTime:HH:mm} – {booking.EndTime:HH:mm}</li>
                    <li><strong>Description:</strong>{booking.Description}</li>
                    <li><strong>Room:</strong> {booking.Room.Name}</li>
                    <li><strong>Code:</strong> {booking.Room.Code}</li>
                </ul>


                <p>If you did not expect this meeting invitation, you can safely ignore this email.</p>

                <p>Thank you,<br/>Meeting Management System</p>";
                await SendEmailAsync(attendee.Email, subject, body);
            }
        }

        public async Task SendUpdateEmail(BookingDto booking)
        {
            if (booking.Attendees.Count == 0 || !booking.Attendees.Any())
                return;
         
            var requesterEmail = booking.Requester?.Email;
            

            var subject = $"Updated: Meeting \"{booking.Title}\"";
            
            foreach (var attendee in booking.Attendees)
            {
               
             
                if (!string.IsNullOrEmpty(requesterEmail) && attendee.Email.Equals(requesterEmail, StringComparison.OrdinalIgnoreCase))
                {
                    var body1 = $@"
                    <p>Dear {attendee.FullName},</p>

                    <p>Your meeting was updated successful. 

                    <h3>Meeting Details</h3>
                    <ul>
                        <li><strong>Title:</strong> {booking.Title}</li>
                        <li><strong>Date:</strong> {booking.StartTime:dddd, dd MMM yyyy}</li>
                        <li><strong>Time:</strong> {booking.StartTime:HH:mm} – {booking.EndTime:HH:mm}</li>
                        <li><strong>Description:</strong>{booking.Description}</li>
                        <li><strong>Room:</strong> {booking.Room.Name}</li>
                        <li><strong>Code:</strong> {booking.Room.Code}</li>
                    </ul>

                    <p>Thank you,<br/>Meeting Management System</p>";
                    await SendEmailAsync(requesterEmail, subject, body1);
                }
                else
                {
                    var body = $@"
                    <p>Dear {attendee.FullName},</p>

                    <p>Your meeting was updated by 
                    <strong>{booking.Requester.FullName}</strong>.</p>

                    <h3>Meeting Updated Details</h3>
                    <ul>
                        <li><strong>Title:</strong> {booking.Title}</li>
                        <li><strong>Date:</strong> {booking.StartTime:dddd, dd MMM yyyy}</li>
                        <li><strong>Time:</strong> {booking.StartTime:HH:mm} – {booking.EndTime:HH:mm}</li>
                        <li><strong>Description:</strong>{booking.Description}</li>
                        <li><strong>Room:</strong> {booking.Room.Name}</li>
                        <li><strong>Code:</strong> {booking.Room.Code}</li>
                    </ul>


                    <p>If you did not expect this meeting update, you can safely ignore this email.</p>

                    <p>Thank you,<br/>Meeting Management System</p>";
                    
                    await SendEmailAsync(attendee.Email, subject, body);
                }
            }
        }

        public async Task SendPasswordResetEmail(string toEmail, string userName, string resetLink)
        {
            var subject = "Password Reset Request for Your Booking Meeting Room Account";
            var body = $@"
                <p>Dear {userName},</p>
                <p>We received a request to reset the password for your account associated with this email address.</p>
                <p>To complete the process and set a new password, please click the link below:</p>
                <p><a href='{resetLink}' style='padding:10px 20px; background-color:#007bff; color:white; text-decoration:none;'>Reset Your Password</a></p>
                <p>This link will expire in 15 minutes for security reasons. If the link expires, you will need to submit a new request.</p>
                <p>If you did not request a password reset, please ignore this email. Your password will remain the same.</p>
                <p>Thank you,<br/>The Support Team</p>
            ";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendPasswordChangeConfirmationEmail(string toEmail, string userName)
        {
            var subject = "Your Booking Meeting Room Password Has Been Successfully Changed";
            var currentTime = DateTime.UtcNow.ToString("f") + " UTC";
            var body = $@"
                <p>Dear {userName},</p>
                <p>This email confirms that the password for your Booking Meeting Room account was successfully changed at {currentTime}.</p>
                <p>You can now log in to your account using your new password.</p>
                <p><a href='https://team2info.netlify.app/login' style='padding:10px 20px; background-color:#28a745; color:white; text-decoration:none;'>Log In Now</a></p>
                <p>If you did not make this change, please contact our support team immediately by replying to this email or calling [Support Phone Number]. We recommend changing your password immediately.</p>
                <p>Thank you,<br/>The Support Team</p>
            ";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendCancellationEmailToRequester(BookingDto booking)
        {
            var requester = booking.Requester;
            if (requester == null || string.IsNullOrEmpty(requester.Email))
                return;

            var subject = $"Your meeting has been cancelled: \"{booking.Title}\"";

            var body = $@"
                    <p>Dear {requester.FullName},</p>

                    <p>Your meeting has been <strong>successfully cancelled</strong>. Below are the details of the cancelled meeting:</p>

                    <ul>
                        <li><strong>Title:</strong> {booking.Title}</li>
                        <li><strong>Date:</strong> {booking.StartTime:dddd, dd MMM yyyy}</li>
                        <li><strong>Time:</strong> {booking.StartTime:HH:mm} – {booking.EndTime:HH:mm}</li>
                        <li><strong>Room:</strong> {booking.Room.Name}</li>
                        <li><strong>Code:</strong> {booking.Room.Code}</li>
                    </ul>

                    <p>If you need to schedule a new meeting, please visit the Meeting Room Booking System.</p>

                    <p>Thank you,<br/>
                    Meeting Room Booking System</p>";

            await SendEmailAsync(requester.Email, subject, body);
        }

        public async Task SendCancellationEmail(BookingDto booking)
        {
            if (booking.Attendees == null || !booking.Attendees.Any())
                return;

            var requesterEmail = booking.Requester?.Email;
            //var email = _httpContext.HttpContext?.User?.FindFirstValue(ClaimTypes.Email);
            var subject = $"Invitation: Meeting \"{booking.Title}\"";
            
            foreach (var attendee in booking.Attendees)
            {
                //if(attendee.Email == email) continue;
                if (!string.IsNullOrEmpty(requesterEmail) && attendee.Email.Equals(requesterEmail, StringComparison.OrdinalIgnoreCase))
                    continue;

                var body = $@"
                <p>Dear {attendee.FullName},</p>

                <p>The following meeting has been canceled by the organizer, 
                <strong>{booking.Requester.FullName}</strong>. Please find the details below: 
                </p>

                <ul>
                    <li><strong>Title:</strong> {booking.Title}</li>
                    <li><strong>Date:</strong> {booking.StartTime:dddd, dd MMM yyyy}</li>
                    <li><strong>Time:</strong> {booking.StartTime:HH:mm} – {booking.EndTime:HH:mm}</li>
                    <li><strong>Room:</strong> {booking.Room.Name}</li>
                    <li><strong>Code:</strong> {booking.Room.Code}</li>
                </ul>


                <p>If this cancellation was in error, please contact the meeting organizer directly.</p>

                <p>Sincerely, The Meeting Room Booking System (MRBS) Team</p>";
                await SendEmailAsync(attendee.Email, subject, body);
            }
        }

        private async Task SendEmailAsync(string toEmail, string subject, string htmlContent)
        {
            // var smtpHost = _configuration["Smtp:Host"];
            // var smtpPort = _configuration.GetValue<int>("Smtp:Port");
            // var smtpUser = _configuration["Smtp:Username"];
            // var smtpPass = _configuration["Smtp:Password"];
            // var fromEmail = _configuration["Smtp:FromEmail"];
            // var fromName = _configuration["Smtp:FromName"];

            // using var client = new SmtpClient(_options.Host, _options.Port)
            // {
            //     Credentials = new NetworkCredential(_options.Username, _options.Password),
            //     EnableSsl = true
            // };
            //
            // var mailMessage = new MailMessage
            // {
            //     From = new MailAddress(_options.FromEmail, _options.FromName),
            //     Subject = subject,
            //     Body = body,
            //     IsBodyHtml = true
            // };
            // mailMessage.To.Add(toEmail);
            //
            // await client.SendMailAsync(mailMessage);
            var client = new SendGridClient(_options.ApiKey);
            var from = new EmailAddress(_options.SenderEmail, _options.SenderName);
            var to = new EmailAddress(toEmail);
            var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent: null, htmlContent: htmlContent);

            var response = await client.SendEmailAsync(msg);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Body.ReadAsStringAsync();
                throw new Exception($"SendGrid failed: {body}");
            }
        }

        public async Task SendApprovedEmail(BookingDto booking)
        {
            var requesterEmail = booking.Requester?.Email;
            if (string.IsNullOrEmpty(requesterEmail))
                return;

            var subject = $"[Approved] Meeting \"{booking.Title}\"";

            var body = $@"
                <p>Dear {booking.Requester.FullName},</p>

                <p>Your meeting room booking request has been 
                <strong style='color:green;'>approved</strong>.</p>

                <h3>Meeting Details</h3>
                <ul>
                    <li><strong>Title:</strong> {booking.Title}</li>
                    <li><strong>Date:</strong> {booking.StartTime:dddd, dd MMM yyyy}</li>
                    <li><strong>Time:</strong> {booking.StartTime:HH:mm} – {booking.EndTime:HH:mm}</li>
                    <li><strong>Description:</strong> {booking.Description}</li>
                    <li><strong>Room:</strong> {booking.Room.Name}</li>
                    <li><strong>Code:</strong> {booking.Room.Code}</li>
                </ul>

                <p>You can now manage this meeting from the system.</p>

                <p>Thank you,<br/>
                <strong>Meeting Management System</strong></p>";

            await SendEmailAsync(requesterEmail, subject, body);
        }

        public async Task SendRejectedEmail(BookingDto booking, string? rejectReason)
        {
            var requesterEmail = booking.Requester?.Email;
            if (string.IsNullOrEmpty(requesterEmail))
                return;

            var subject = $"[Rejected] Meeting \"{booking.Title}\"";

            var body = $@"
                    <p>Dear {booking.Requester.FullName},</p>

                    <p>We regret to inform you that your meeting room booking request has been 
                    <strong style='color:red;'>rejected</strong>.</p>

                    <h3>Meeting Details</h3>
                    <ul>
                        <li><strong>Title:</strong> {booking.Title}</li>
                        <li><strong>Date:</strong> {booking.StartTime:dddd, dd MMM yyyy}</li>
                        <li><strong>Time:</strong> {booking.StartTime:HH:mm} – {booking.EndTime:HH:mm}</li>
                        <li><strong>Description:</strong> {booking.Description}</li>
                        <li><strong>Room:</strong> {booking.Room.Name}</li>
                        <li><strong>Code:</strong> {booking.Room.Code}</li>
                    </ul>

                    <h4 style='color:red;'>Reason</h4>
                    <p>{rejectReason ?? "The requested time slot is not available."}</p>

                    <p>Please consider choosing a different time slot or room.</p>

                    <p>Thank you for your understanding,<br/>
                    <strong>Meeting Management System</strong></p>";

            await SendEmailAsync(requesterEmail, subject, body);
        }

        public async Task SendInventoryDailyJobMail(InventoryJobMailDto dto)
        {

            var adminemail = "anvan.270904@gmail.com";
            var subject = dto.IsSuccess
                ? "[Inventory Job] Import successful"
                : "[Inventory Job] Import failed";

            var body = $@"
                <h2>Inventory Daily Job Report</h2>

                <p><strong>Execution time:</strong> {dto.ExecutedAt:yyyy-MM-dd HH:mm}</p>
                <p><strong>File name:</strong> {dto.FileName}</p>

                <hr/>

                {(dto.IsSuccess
                            ? $@"
                        <p><strong>Status:</strong> <span style='color:green'>SUCCESS</span></p>
                       
                      "
                            : $@"
                        <p><strong>Status:</strong> <span style='color:red'>FAILED</span></p>
                        <p><strong>Error:</strong> {dto.ErrorMessage}</p>
                      "
                        )}

                <br/>
                <p>This email was generated automatically by the system.</p>
            ";

            await SendEmailAsync(adminemail, subject, body);
        }


    }
}
