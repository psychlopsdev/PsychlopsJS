#include <psychlops.h>
using namespace Psychlops;

void psychlops_main()
{
	Canvas cnvs(Canvas::fullscreen);
	Psychlops.Canvas.useNoisyBit(true);

	Figures::ShaderGabor gbr;
	Figures::ShaderGaborAlpha gbr2;

	gbr.setSigma(100);
	gbr.wavelength = 40;
	gbr.contrast = 0.125;

	gbr2.setSigma(100);
	gbr2.wavelength = 40;
	gbr2.contrast = 0.125;

	double contrast = 0.125;
	Widgets::Slider sl;
	Interval rng;
	sl.link(contrast, "contrast", 0<=rng<=0.125, 1 / 256.0);

	// [begin loop]
	while (!Keyboard::esc.pushed()) {
		cnvs.clear(Color(127 / 255.0));

		gbr.contrast = contrast;
		gbr2.contrast = contrast;
		gbr.centering().shift(0, -300).draw();
		gbr2.centering().shift(0, 300).draw();

		sl.draw();

		cnvs.flip();
	}
	// [end loop]
}
