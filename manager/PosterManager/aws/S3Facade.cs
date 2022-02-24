using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;

namespace PosterManager.aws
{
    class S3Facade
    {

        public S3Facade(Settings settings)
        {
            Settings = settings;
        }

        public Settings Settings { get; }

        public async Task<Stream> GetObject(string keyName)
        {
            try
            {
                IAmazonS3 client = GetClient();
                GetObjectRequest request = new GetObjectRequest
                {
                    BucketName = Settings.GetUploadsBucket(),
                    Key = keyName,
                };

                GetObjectResponse response = await client.GetObjectAsync(request);
                return response.ResponseStream;
            }
            catch (AmazonS3Exception e)
            {
                // If the bucket or the object do not exist
                Console.WriteLine($"Error: '{e.Message}'");
                throw;
            }
        }

        public async Task UploadImage(Stream stream, string keyName)
        {
            try
            {
                IAmazonS3 client = GetClient();
                PutObjectRequest request = new PutObjectRequest
                {
                    BucketName = Settings.GetUploadsBucket(),
                    Key = keyName,
                    InputStream = stream,
                };

                PutObjectResponse response = await client.PutObjectAsync(request);
                if (response.HttpStatusCode != System.Net.HttpStatusCode.OK)
                {
                    throw new Exception("Error encountered while uploading image. " + response);
                }
            }
            catch (AmazonS3Exception e)
            {
                // If the bucket or the object do not exist
                Console.WriteLine($"Error: '{e.Message}'");
                throw;
            }
        }

        private IAmazonS3 GetClient()
        {
            return new AmazonS3Client(Settings.GetCreds(), RegionEndpoint.USEast1);
        }

    }
}
