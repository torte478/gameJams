namespace ImageResizer
{
    using System;
    using System.Drawing;
    using System.Drawing.Drawing2D;
    using System.Drawing.Imaging;
    using System.IO;
    using nQuant;

    class Program
    {
        const int Unit = 16;
        const int OriginSize = 2048;
        const int DestSize = 32000;
        const int UnitDestSize = 2000;
        const int Side = OriginSize / Unit;

        static void Main(string[] args)
        {


            Algo1();
        }

        private static void Algo1()
        {
            var destRect = new Rectangle(0, 0, UnitDestSize, UnitDestSize);
            var quantizer = new WuQuantizer();

            using (var origin = new Bitmap("clock.png"))
            {
                for (var i = 0; i < Unit; ++i)
                for (var j = 0; j < Unit; ++j)
                {
                    var destImage = new Bitmap(UnitDestSize, UnitDestSize);

                    destImage.SetResolution(origin.HorizontalResolution, origin.VerticalResolution);


                    using (var image = new Bitmap(Side, Side))
                    {
                        for (var ii = 0; ii < Side; ++ii)
                        for (var jj = 0; jj < Side; ++jj)
                        {
                            image.SetPixel(jj, ii, origin.GetPixel(j * Side + jj, i * Side + ii));
                        }

                        using (var g = Graphics.FromImage(destImage))
                        {
                            g.CompositingMode = CompositingMode.SourceCopy;
                            g.CompositingQuality = CompositingQuality.HighSpeed;
                            g.InterpolationMode = InterpolationMode.Low;
                            g.SmoothingMode = SmoothingMode.None;
                            g.PixelOffsetMode = PixelOffsetMode.HighSpeed;

                            using (var wrapMode = new ImageAttributes())
                            {
                                wrapMode.SetWrapMode(WrapMode.TileFlipXY);

                                g.DrawImage(image, destRect, 0, 0, image.Width, image.Height, GraphicsUnit.Pixel, wrapMode);
                            }
                        }
                    }

                    var path = Path.Combine("output", $"bg_{i}_{j}.png");

                    using (var quantized = quantizer.QuantizeImage(destImage))
                    {
                        quantized.Save(path, ImageFormat.Png);
                    }

                    Console.WriteLine($"{i} {j}");
                }
            }
        }
    }
}