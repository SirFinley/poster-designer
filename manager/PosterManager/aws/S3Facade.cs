using Amazon;
using Amazon.S3;
using Amazon.S3.Model;

namespace PosterManager.aws
{
    class S3Facade
    {
        // TODO - get from config
        const string bucketName = "TODO get from config";

        public async Task<Stream> GetObject(string keyName)
        {
            try
            {
                IAmazonS3 client = new AmazonS3Client(RegionEndpoint.USEast1);
                GetObjectRequest request = new GetObjectRequest
                {
                    BucketName = bucketName,
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
                IAmazonS3 client = new AmazonS3Client(RegionEndpoint.USEast1);
                PutObjectRequest request = new PutObjectRequest
                {
                    BucketName = bucketName,
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

    }
}
