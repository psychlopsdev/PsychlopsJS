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

	double rect_size = 160 * pxr, wavelength = 40, contrast = 0.4, phase = 0, vel = 10.0;

	Widgets::Slider slider[4];
	Interval rng;
	slider[0].link(diameter, "diameter", 1 <= rng <= 500, 20, 1);
	slider[1].link(wavelength, "wavelength", 0 <= rng <= 1, 10.0 / 1024, 10.0 / 1024);
	slider[2].link(vel, "Velocity", 0.0 <= rng <= 30.0, 100.0 / 1024, 100.0 / 1024);
	slider[3].link(contrast, "Contrast", 0.0 <= rng <= 1.0, 100.0 / 1024, 100.0 / 1024);

	Figures::Grating gbr("sin", "gauss", "gray");

	int distance=rect_size;
	bool stop = false;

	while(!Keyboard::esc.pushed()) {
		cnvs.clear(background_color);

		distance = rect_size;
		gbr.setSigma(rect_size / 8);

		gbr.contrast = contrast;
		gbr.orientation = PI/2.0;
		gbr.wavelength = wavelength;
		if (!stop) { phase += vel/360 * 2 * PI; }

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

		if(Keyboard::spc.pushed()) stop = !stop;
		cnvs.flip();
	}

}
