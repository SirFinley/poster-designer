using PosterManager.aws;
using PosterManager.form;
using PosterManager.render;
using System.Diagnostics;

namespace PosterManager
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            //var posterId = "5IAKKAG2";
            //var posterId = "YYAKEAD6";
            string posterId = posterIdInput.Text;
            _ = render(posterId);
        }

        async Task render(string posterId)
        {
            try
            {
                renderStatus.Text = "Retrieving poster data...";
                var posterItem = await new DynamoDbFacade().GetPosterItem(posterId);
                if (posterItem == null)
                {
                    throw new Exception("No poster with that id found");
                }

                DisaplyPosterSettings(posterItem);

                // missing renders
                if (!posterItem.HasRenders() || !PosterFiles.HasFiles(posterId))
                {
                    renderStatus.Text = "Rendering...";
                    var renderKeys = await new PosterRenderer().Render(posterItem);
                    posterItem.timeRendered = DateTime.UtcNow;
                    posterItem.fullRenderKey = renderKeys.fullRenderKey;
                    posterItem.previewRenderKey = renderKeys.previewRenderKey;
                    await new DynamoDbFacade().UpdatePoster(posterItem);
                }

                DisplayThumbnails(posterId);
                renderStatus.Text = "Rendered!";
            }
            catch (Exception ex)
            {
                renderStatus.Text = "Error: " + ex.Message;
                throw;
            }
        }

        private void DisplayThumbnails(string posterId)
        {
            clientThumbnail.Image = Image.FromFile(PosterFiles.GetThumbnail(posterId));
            previewRender.Image = Image.FromFile(PosterFiles.GetPreviewRenderPath(posterId));
        }

        private void DisaplyPosterSettings(PosterItem item)
        {
            var saveData = item.GetSaveData();
            posterIdLabelValue.Text = saveData.size;
            sizeLabelValue.Text = saveData.size;
            orientationLabelValue.Text = saveData.orientation;
            paperLabelValue.Text = "Glossy"; // TODO - get paper type
            borderLabelValue.Text = saveData.borders.left + "\"";
        }

        private void browseButton_Click(object sender, EventArgs e)
        {
            string posterId = posterIdInput.Text;
            string path = PosterFiles.GetDirectory(posterId);
            if (!Directory.Exists(path))
            {
                Directory.CreateDirectory(path);
            }

            Process.Start("explorer.exe", path);
        }
    }
}