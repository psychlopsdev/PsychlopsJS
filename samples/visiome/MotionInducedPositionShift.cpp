#include <psychlops.h>
using namespace Psychlops;


void psychlops_main()
{
	AppInfo::expname = "MotionInducedPositionShift";

	Canvas::useNoisyBit(true);
	Canvas cnvs(Canvas::fullscreen);
	Color::setGammaValue();
	double pxr = cnvs.getPixelRatio();
	Clock before, after, exam_start, exam_end;
	int DISPLAYED_FRAMES = 0;

	Color background_color(127.0 / 255.0);

	double sigma = 20 * pxr, wavelength = 40, contrast = 0.4, phase = 0, vel = 10.0;

	Widgets::Slider slider[4];
	Interval rng;
	slider[0].link(sigma, "Sigma (diameter)", 1 <= rng <= 40, 20, 1);
	slider[1].link(wavelength, "Wave length", 2 <= rng <= 100, 10.0 / 1024, 10.0 / 1024);
	slider[2].link(vel, "Velocity", 0.0 <= rng <= 30.0, 100.0 / 1024, 100.0 / 1024);
	slider[3].link(contrast, "Contrast", 0.0 <= rng <= 1.0, 100.0 / 1024, 100.0 / 1024);

	Figures::Grating gbr("sin", "gauss", "gray");

	int distance = sigma * 8;
	bool stop = false;

	while (!Keyboard::esc.pushed()) {
		cnvs.clear(background_color);

		distance = sigma * 8;
		gbr.setSigma(sigma);

		gbr.contrast = contrast;
		gbr.orientation = PI / 2.0;
		gbr.wavelength = wavelength;
		if (!stop) { phase += vel / 360 * 2 * PI; }

		gbr.phase = -phase;
		gbr.centering().shift(0, -distance);
		gbr.draw();

		gbr.phase = phase;
		gbr.centering().shift(0, 0);
		gbr.draw();

		gbr.phase = -phase;
		gbr.centering().shift(0, +distance);
		gbr.draw();

		for (int i = 0; i < 4; i++) { slider[i].draw() }

		if (Keyboard::spc.pushed()) stop = !stop;
		cnvs.flip();
	}

}
