namespace PosterManager.render
{
    class VirtualDimensions
    {
        public double canvasWidth { get; set; }
        public double canvasHeight { get; set; }
        public double canvasAspectRatio { get; set; }
        public double canvasHorizontalMargin { get; set; }
        public double canvasVerticalMargin { get; set; }

        public double inchesPerPixel { get; set; }

        public double posterAspectRatio { get; set; }
        public double posterWidth { get; set; }
        public double posterHeight { get; set; }

        public double posterLeft { get; set; }
        public double posterRight { get; set; }
        public double posterTop { get; set; }
        public double posterBottom { get; set; }

        public double borderWidth { get; set; }
        public double borderHeight { get; set; }
        public double posterInnerBorderWidth { get; set; }
        public double posterInnerBorderHeight { get; set; }
        public double posterLeftBorder { get; set; }
        public double posterRightBorder { get; set; }
        public double posterTopBorder { get; set; }
        public double posterBottomBorder { get; set; }
        public double borderInnerAspectRatio { get; set; }
    }
}
