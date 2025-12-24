using Backend.Dtos;
using Backend.Interfaces;
using Backend.RabbitMQ;
using Backend.Services;
using Microsoft.Extensions.Logging;

namespace Backend.Backgrounds.Jobs;

public class InventoryCloudSyncJob
{
    private readonly CloudinaryService _cloudinary;
    private readonly UploadFileService _uploadService;
    private readonly IRabbitMqPublisher _publisher;
    private readonly ILogger<InventoryCloudSyncJob> _logger;

    public InventoryCloudSyncJob(
        CloudinaryService cloudinary,
        UploadFileService uploadService,
        IRabbitMqPublisher publisher,
        ILogger<InventoryCloudSyncJob> logger)
    {
        _cloudinary = cloudinary;
        _uploadService = uploadService;
        _publisher = publisher;
        _logger = logger;
    }

    public async Task RunAsync()
    {
        _logger.LogInformation("Inventory Cloud Sync Job started");

        // 1️⃣ Lấy danh sách file CSV trên cloud
        var files = await _cloudinary.ListFilesAsync("inventories/pending");

        if (!files.Any())
        {
            _logger.LogInformation("No inventory files found");
            return;
        }

        foreach (var file in files)
        {
            try
            {
                // 2️⃣ Download file từ cloud về local
                var localPath = await _cloudinary.DownloadFileAsync(file);

                // 3️⃣ Extract CSV (ĐÚNG DTO)
                var uploadDto = new UploadFileDto
                {
                    FilePath = localPath
                };

                var extractResult = await _uploadService.ExtractCsv(uploadDto);

                if (!extractResult.Success)
                    throw new Exception(extractResult.Message);

                // 4️⃣ Insert / Update Inventory
                var insertResult = await _uploadService.HandleInsertData(
                    extractResult.Data.InventoryCsvDto,
                    extractResult.Data.FilePath
                );

                if (!insertResult.Success)
                    throw new Exception(insertResult.Message);

                // 5️⃣ Move file sang processed
                await _cloudinary.MoveFileAsync(
                    file.PublicId,
                    "inventories/processed"
                );

                // 6️⃣ Gửi mail SUCCESS
                await _publisher.SendMessage(
                    new InventoryJobMailDto
                    {
                        FileName = file.PublicId,
                        ExecutedAt = DateTime.Now,
                        IsSuccess = true
                    },
                    RabbitMqQueues.MailQueue,
                    RabbitMqExchanges.MailExChange,
                    RabbitRoutingKeys.InventoryDailyJobMail
                );

                _logger.LogInformation($"Processed inventory file successfully: {file.PublicId}");
            }
            catch (Exception ex)
            {
                // ❌ Gửi mail FAIL
                await _publisher.SendMessage(
                    new InventoryJobMailDto
                    {
                        FileName = file.PublicId,
                        ExecutedAt = DateTime.Now,
                        IsSuccess = false,
                        ErrorMessage = ex.Message
                    },
                    RabbitMqQueues.MailQueue,
                    RabbitMqExchanges.MailExChange,
                    RabbitRoutingKeys.InventoryDailyJobMail
                );

                _logger.LogError(ex, $"Failed processing inventory file: {file.PublicId}");
            }
        }

        _logger.LogInformation("Inventory Cloud Sync Job finished");
    }

}
