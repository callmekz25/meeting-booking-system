using Backend.Cloud;
using Backend.Common.Models;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;
using Backend.Dtos;
namespace Backend.Services;

public class CloudinaryService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(IOptions<CloudinaryOptions> options)
    {
        var opt = options.Value;

        var account = new Account(
            opt.CloudName,
            opt.ApiKey,
            opt.ApiSecret
        );

        _cloudinary = new Cloudinary(account);
    }

    public async Task UploadFile(string filePath, string? folder = "inventories")
    {
        try
        {
            if (!File.Exists(filePath))
                throw new FileNotFoundException(filePath);
            
            var uploadParams = new RawUploadParams
            {
                File = new FileDescription(filePath),
                Folder = folder,
                PublicId = Path.GetFileNameWithoutExtension(filePath)
            };

            var result = await _cloudinary.UploadAsync(uploadParams);

            if (result.Error != null)
            {
                throw new Exception(result.Error.Message);
            }
            
            File.Delete(filePath);

           
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            throw;
        }
    }

    public async Task<List<CloudinaryFileDto>> ListFilesAsync(string folder)
    {
        var result = await _cloudinary.Search()
            .Expression($"folder:{folder}")
            .ExecuteAsync();

        return result.Resources.Select(r => new CloudinaryFileDto
        {
            PublicId = r.PublicId,
            Url = r.SecureUrl.ToString()
        }).ToList();
    }
    public async Task<string> DownloadFileAsync(CloudinaryFileDto file)
    {
        var http = new HttpClient();
        var bytes = await http.GetByteArrayAsync(file.Url);

        var localPath = Path.Combine(
            Path.GetTempPath(),
            $"{file.PublicId.Replace("/", "_")}.csv"
        );

        await File.WriteAllBytesAsync(localPath, bytes);
        return localPath;
    }

    public async Task MoveFileAsync(string publicId, string targetFolder)
    {
        await _cloudinary.RenameAsync(
            publicId,
            $"{targetFolder}/{Path.GetFileName(publicId)}"
        );
    }


}