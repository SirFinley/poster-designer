namespace PosterManager.render
{
    class RenderSettings
    {
        public string imgUrl { get; set; }
        public RenderBorders borders { get; set; }
        public RenderImage image { get; set; }
        public RenderCanvas canvas { get; set; }
        public bool isSvg { get; set; }
        public double svgScaledBy { get; set; }

    }

    class RenderCanvas
    {
        public int width { get; set; }
        public int height { get; set; }
        public string backgroundColor { get; set; }
    }

    class RenderImage
    {
        public int left { get; set; }
        public int top { get; set; }
        public int width { get; set; }
        public int height { get; set; }
    }

    class RenderBorders
    {
        public int leftWidth { get; set; }
        public int rightWidth { get; set; }
        public int topWidth { get; set; }
        public int bottomWidth { get; set; }
        public string color { get; set; }
    }
}
