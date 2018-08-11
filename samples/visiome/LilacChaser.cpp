// Lilac Chaser.
// Zaidi Q, Ennis R, Cao D, Lee B (2012)
// Neural locus of color after-image.
// Current Biology, 22, 220-224
///+ Prefix
//// Include Psychlops Package
#include <psychlops.h>
using namespace Psychlops;    // Initially developed with Psychlops Win32 1.5.3 / 20110311
							  ///- Prefix


							  ///+ Stimulus drawing function
							  //// A function for stimulus drawing (main body)
void psychlops_main() {

	///+ Preperation
	//// Declare and initialize local variables
	Canvas cnvs(Canvas::window); //Prepare drawing window
	double dotsize = 100 * cnvs.getPixelRatio();
	double dot_lum = 1;
	double bg_lum = 0.5;
	int stroke = 0;
	bool draw_base_position = false;

	Psychlops::Rectangle fixate;
	Psychlops::Image dot;
	Psychlops::Color col;
	double xp, yp, radius, a;

	double r = 1.0, g = 0.0, b = 1.0, duration = 8;
	Widgets::Slider slider[4];
	///- Preperation

	///+ set Independent
	//// set variables and value ranges for interaction
	Interval rng;
	slider[0].link(r, "Red", 0.0 <= rng <= 1.0, 0.1);
	slider[1].link(g, "Green", 0.0 <= rng <= 1.0, 0.1);
	slider[2].link(b, "Blue", 0.0 <= rng <= 1.0, 0.1);
	slider[3].link(duration, "Refresh", 0.0 <= rng <= 20.0, 1, 10);
	///- set Independent

	dot.set(dotsize, dotsize, Image::RGBA);
	const int width = dot.getWidth(), height = dot.getHeight(), sigma = width / 6.0;

	fixate.set(11, 11);
	fixate.fill = Color::black;

	int frame = 0;
	Color col;


	// [begin mainloop]
	while (!Keyboard::esc.pushed()) {

		///+ reflesh dot
		if (slider[0].changed() || slider[1].changed() || slider[2].changed()) {
			for (int y = 0; y<dotsize; y++) {
				yp = y - height / 2.0;
				for (int x = 0; x<dotsize; x++) {
					xp = x - width / 2.0;
					radius = sqrt(xp*xp + yp*yp);
					a = exp(-(radius*radius) / (2.0*sigma*sigma));
					col.set(r, g, b, a);
					dot.pix_raw(x, y, col);
				}
			}
			dot.cache();
		}
		///+ reflesh dot

		///+ stroke count
		if (floor(mod(frame, duration)) == 0) {
			stroke++; stroke %= 8;
		}
		///- stroke count

		cnvs.clear(Color(bg_lum)); //Clear window


								   ///+ Draw dots
								   //// Draw dots at a desinated position.
		for (int i = 0; i<8; i++) {
			if (i != stroke) {
				dot.centering().shift(dotsize*1.2*cos(i / 8.0 * 2 * PI), dotsize*1.2*sin(i / 8.0 * 2 * PI)).draw();
			}
		}
		///- Draw dots

		fixate.centering().draw();

		for (int i = 0; i<4; i++) { slider[i].draw(); }

		cnvs.flip(); // Flip frame buffers
		frame++;
	}
	// [end mainloop]

}
///- Stimulus drawing function
