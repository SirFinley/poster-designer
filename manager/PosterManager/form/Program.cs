using PosterManager.aws;
using PosterManager.render;

namespace PosterManager
{
    internal static class Program
    {
        /// <summary>
        ///  The main entry point for the application.
        /// </summary>
        [STAThread]
        static async Task Main()
        {
            await render();
            // To customize application configuration such as set high DPI settings or default font,
            // see https://aka.ms/applicationconfiguration.
            //ApplicationConfiguration.Initialize();
            //Application.Run(new Form1());
        }

        static async Task render()
        {
            var posterId = "YYAKEAD6";
            var posterItem = await new DynamoDbFacade().GetPosterItem(posterId);

            // already rendered
            if (posterItem.HasRenders())
            {
                return;
            }

            var renderKeys = await new PosterRenderer().Render(posterItem);
            posterItem.fullRenderKey = renderKeys.fullRenderKey;
            posterItem.previewRenderKey = renderKeys.previewRenderKey;
            await new DynamoDbFacade().UpdatePoster(posterItem);
        }
    }
}