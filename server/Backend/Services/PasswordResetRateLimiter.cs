using Microsoft.Extensions.Caching.Memory;

namespace Backend.Services
{
    public class PasswordResetRateLimiter
    {
        private readonly IMemoryCache _cache;

        public PasswordResetRateLimiter(IMemoryCache cache)
        {
            _cache = cache;
        }

        public bool CanRequestReset(string email, string ip)
        {
            string emailKey = $"reset_email_{email}";
            string ipKey = $"reset_ip_{ip}";

            int emailCount = _cache.Get<int?>(emailKey) ?? 0;
            int ipCount = _cache.Get<int?>(ipKey) ?? 0;

            if (emailCount >= 3 || ipCount >= 3)
                return false;

            return true;
        }

        public void AddRequest(string email, string ip)
        {
            string emailKey = $"reset_email_{email}";
            string ipKey = $"reset_ip_{ip}";

            int emailCount = _cache.Get<int?>(emailKey) ?? 0;
            int ipCount = _cache.Get<int?>(ipKey) ?? 0;

            _cache.Set(emailKey, emailCount + 1, TimeSpan.FromHours(1));
            _cache.Set(ipKey, ipCount + 1, TimeSpan.FromHours(1));
        }
    }
}
