namespace PosterManager.form
{
    public class PosterFiles
    {

        public static string GetFullRenderPath(string posterId)
        {
            return GetPath(posterId, "full-render.png");
        }

        public static string GetPreviewRenderPath(string posterId)
        {
            return GetPath(posterId, "preview-render.png");
        }

        public static string GetUpload(string posterId)
        {
            string path = GetPath(posterId);
            return Directory.GetFiles(path, "upload.*").First();
        }

        public static string GetUpload(string posterId, string key)
        {
            string fileExt = key.Split(".").Last();
            if (fileExt == "svg+xml")
            {
                fileExt = "svg";
            }

            return GetPath(posterId, $"upload.{fileExt}");
        }

        public static bool HasFiles(string posterId)
        {
            return File.Exists(GetUpload(posterId))
                && File.Exists(GetThumbnail(posterId))
                && File.Exists(GetFullRenderPath(posterId))
                && File.Exists(GetPreviewRenderPath(posterId));
        }

        public static string GetThumbnail(string posterId)
        {
            return GetPath(posterId, "thumbnail.png");
        }

        private static string GetPath(string posterId)
        {
            string root = Path.GetFullPath(".");
            return Path.Combine(root, "posters", posterId);
        }

        private static string GetPath(string posterId, string file)
        {
            return Path.Combine(GetPath(posterId), file);
        }

    }
}
