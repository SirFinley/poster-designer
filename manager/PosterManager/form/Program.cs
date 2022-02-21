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
            var renderKeys = await new PosterRenderer().Render(posterId);
            await new DynamoDbFacade().UpdatePoster(renderKeys);
        }
    }
}