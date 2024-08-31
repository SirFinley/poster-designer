export default {
    countsTableName: process.env.COUNTS_TABLE_NAME as string,
    postersTableName: process.env.POSTERS_TABLE_NAME as string,
    bucketName: process.env.BUCKET_NAME as string,
    thumbnailBucketName: process.env.THUMBNAIL_BUCKET_NAME as string,
    thumbnailBucketRegion: process.env.THUMBNAIL_BUCKET_REGION as string,
    corsAllowedOrigin: process.env.CORS_ALLOWED_ORIGIN as string,
};