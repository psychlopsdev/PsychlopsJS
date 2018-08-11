#include <psychlops.h>
using namespace Psychlops;


void psychlops_main()
{
	AppInfo::expname = "2f3f";

	Canvas::useNoisyBit(true);
	Canvas cnvs(Canvas::fullscreen);
	Color::setGammaValue();
	double pxr = cnvs.getPixelRatio();
	Clock before, after, exam_start, exam_end;
	int DISPLAYED_FRAMES = 0;

	Color background_color(127.0 / 255.0);

	int gratingwidth = 500 * pxr, gratingheight = 200 * pxr;
	double shift = 0.0;
	Color col(0);
	Psychlops::Rectangle grating;

	int SOA_Frames = 5, gap = 100;
	double contrast = 0.1, wavelength = 30.0;


	Widgets::Slider slider[4];
	Interval rng;
	slider[0].link(SOA_Frames, "SOA Frames", 1 <= rng <= 20, 1, 1);
	slider[1].link(gap, "Grating gap", 0 <= rng <= 200, 1, 1);
	slider[2].link(wavelength, "Wave Length", 1 <= rng <= 50, 1, 1);
	slider[3].link(contrast, "Contrast", 0.0 <= rng <= 1.0, 100.0 / 1024, 100.0 / 1024);


	// [begin session_loop]


	// [begin trial_loop]
	while (!Keyboard::esc.pushed()) {
		cnvs.clear();
		if(DISPLAYED_FRAMES%floor(SOA_Frames) == 0) shift += 1;

		grating.set(1, gratingheight).centering().shift(-gratingwidth / 2, 0);
		for (int i = 0; i<gratingwidth; i++) {
			col.set(
				+0.5*contrast*sin(2 * PI*(i*2.0 / wavelength + 0.50 * shift))
				+ 0.5*contrast*sin(2 * PI*(i*3.0 / wavelength + 0.75 * shift))
				+ 0.5
			);
			grating.shift(1, 0).draw(col);
		}

		grating.set(1, gratingheight).centering().shift(-gratingwidth / 2, -gratingheight - gap);
		for (int i = 0; i<gratingwidth; i++) {
			col.set(
				+0.5*contrast*sin(2 * PI*(i*2.0 / wavelength + 0.50 * shift))
				+ 0.5
			);
			grating.shift(1, 0).draw(col);
		}

		grating.set(1, gratingheight).centering().shift(-gratingwidth / 2, gratingheight + gap);
		for (int i = 0; i<gratingwidth; i++) {
			col.set(
				+0.5*contrast*sin(2 * PI*(i*3.0 / wavelength + 0.75 * shift))
				+ 0.5
			);
			grating.shift(1, 0).draw(col);
		}

		for (int i = 0; i < 4; i++) { slider[i].draw() }

		cnvs.flip(SOA_Frames);
		DISPLAYED_FRAMES++;
	}
	// [end trial_loop]


	// [end session_loop]

}
