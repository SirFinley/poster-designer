using Amazon;
using Amazon.S3;
using Amazon.S3.Model;

namespace PosterManager.aws
{
    class S3Facade
    {

        public async Task<Stream> GetObject(string keyName)
        {
            // TODO - get from config
            const string bucketName = "TODO get from config";

            IAmazonS3 client = new AmazonS3Client(RegionEndpoint.USEast1);

            try
            {
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
        
    }
}
