using Amazon;
using Amazon.Runtime;
using Microsoft.Extensions.Configuration;

namespace PosterManager.aws
{
    class Settings
    {

        public Settings()
        {
        }

        public Settings(IConfiguration config)
        {
            Config = config;
        }

        public string AccessKey { get; set; }
        public string SecretKey { get; set; }
		public string PostersTable { get; set; }
		public string UploadsBucket { get; set; }
        private IConfiguration Config { get; }

        public AWSCredentials GetCreds()
        {
            var settings = Config.GetSection("Settings").Get<Settings>();
            var accessKey = settings.AccessKey;
            var secretKey = settings.SecretKey;
            return new BasicAWSCredentials(accessKey, secretKey);
        }

        public string GetPostersTable()
        {
            return Config.GetSection("Settings").Get<Settings>().PostersTable;
        }

        public string GetUploadsBucket()
        {
            return Config.GetSection("Settings").Get<Settings>().UploadsBucket;
        }
    }

}
