
using Backend.Backgrounds;
using Backend.Backgrounds.Jobs;
using Backend.Cloud;
using Backend.Data;
using Backend.Interfaces;
using Backend.Models;
using Backend.RabbitMQ;
using Backend.Repositories;
using Backend.Services;
using Backend.Smtp;
using Hangfire;
using Hangfire.MySql;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();


builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
		
	});


builder.Services.Configure<CloudinaryOptions>(
    builder.Configuration.GetSection("Cloudinary")
);


builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCors", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173") 
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials(); 
    });
});



builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))
    )
);

builder.Services.AddAutoMapper(typeof(Program));


builder.Services.AddIdentity<User, IdentityRole>(options =>
    {
        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
        options.Lockout.MaxFailedAccessAttempts = 5;
        
        options.User.RequireUniqueEmail = true;
        
        options.Password.RequiredLength = 8;         
        options.Password.RequireDigit = false;       
        options.Password.RequireLowercase = false;   
        options.Password.RequireUppercase = false;     
        options.Password.RequireNonAlphanumeric = false; 
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            NameClaimType = ClaimTypes.NameIdentifier, 
            RoleClaimType = ClaimTypes.Role,
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

// Add services to the container.

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "API",
        Version = "v1"
    });
    c.CustomSchemaIds(type => type.FullName); 
    c.SupportNonNullableReferenceTypes();

    // Thêm cấu hình JWT Bearer
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập JWT token như: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
    
    
});

// RabbitMQ
builder.Services.Configure<RabbitMqSetting>(builder.Configuration.GetSection("RabbitMQ"));
builder.Services.AddSingleton<RabbitMqConnection>();
// builder.Services.Configure<SmtpOptions>(
//     builder.Configuration.GetSection("Smtp")
// );
builder.Services.Configure<SendGridOptions>(builder.Configuration.GetSection("SendGrid"));

builder.Services.AddScoped(typeof(IRabbitMqPublisher), typeof(RabbitMqPublisher));
builder.Services.AddHostedService<MailMessageConsumer>();
builder.Services.AddHostedService<UploadFileMessageConsumer>();

builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));

builder.Services.AddMemoryCache();
builder.Services.AddScoped<PasswordResetRateLimiter>();
builder.Services.AddScoped<BookingService>();
builder.Services.AddScoped<InventoryService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<RoomService>();
builder.Services.AddScoped<EquipmentTypeService>();
builder.Services.AddScoped<DashboardService>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<CloudinaryService>();
builder.Services.AddScoped<UploadFileService>();
builder.Services.AddHttpContextAccessor();
// builder.Services.AddScoped<InventoryCloudSyncJob>();

// builder.Services.AddHangfire(config =>
// {
//     config.UseStorage(
//         new MySqlStorage(
//             builder.Configuration.GetConnectionString("Hangfire"),
//             new MySqlStorageOptions
//             {
//                 TablesPrefix = "hangfire_",
//                 QueuePollInterval = TimeSpan.FromSeconds(15),
//                 JobExpirationCheckInterval = TimeSpan.FromHours(1),
//                 CountersAggregateInterval = TimeSpan.FromMinutes(5),
//                 PrepareSchemaIfNecessary = true
//             }
//         )
//     );
// });
//
// builder.Services.AddHangfireServer();

builder.Services.AddConnections();
var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "API V1");
    // c.RoutePrefix = string.Empty;
});
app.UseCors("DevCors");
app.MapGet("/", context =>
{
    context.Response.Redirect("/swagger");
    return Task.CompletedTask;
});

// app.UseHangfireDashboard("/hangfire");

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();
// RecurringJob.AddOrUpdate<InventoryCloudSyncJob>(
//     "inventory-cloud-sync",
//     job => job.RunAsync(),
//     Cron.Minutely
// );

app.MapControllers();

app.Run();
