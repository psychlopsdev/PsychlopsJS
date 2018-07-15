#include <psychlops.h>
using namespace Psychlops;

void psychlops_main()
{
	Canvas::useNoisyBit(true);
	Canvas cnvs(Canvas::window);
	Color::setGammaValue();

	Figures::ShaderGabor gbr;
	gbr.setSigma(200);
	gbr.centering();


	double wavelength_log = 5, contrast_log = 0, phase = 0.0, orientation = 0.0;
	double contrast_phase = 0;

	// Slider is not working between C++ and JavaScript.
	Interval rng;
	Widgets::Slider sl[4];
	sl[0].link(wavelength_log, "wavelength", 1<=rng<=8, 1);
	sl[1].link(contrast_log, "contrast", -3<=rng<=0, 1);
	sl[2].link(orientation, "orientation", -2 * PI <= rng <= 2 * PI, 1);
	sl[3].link(phase, "phase", -2 * PI <= rng <= 2 * PI, 1);


	// [begin loop]
	while (!Keyboard::esc.pushed()) {
		cnvs.clear(Color(127 / 255.0));

		gbr.contrast = pow(10, contrast_log) * cos(contrast_phase);
		gbr.wavelength = floor(pow(2, wavelength_log));
		gbr.orientation = orientation;
		gbr.phase = phase;
		gbr.draw();

		for (int i = 0; i<4; i++) { sl[i].draw(); }

		cnvs.flip();
	}
	// [end loop]

}

