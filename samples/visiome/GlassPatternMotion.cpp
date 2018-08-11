// Motion with glass patterns.
// Ross, J., Badcock, D. R., and Hayes, A. (2000)
// Coherent global motion in the absence of coherent velocity signals.
// Current Biology, 10, 679-682.

#include <psychlops.h>
using namespace Psychlops;    // Initially developed with Psychlops Win32 1.5.3 / 20110311

void psychlops_main()
{

	///+ Preperation
	//// Declare and initialize local variables
	Canvas cnvs(Canvas::window); //Prepare drawing window

	const int DOTSNUM = 2048;
	double pixelRatio = cnvs.getPixelRatio();
	int duration = 6;
	double dotsize = 2 * pixelRatio;
	double dot_lum = 0.5;
	double bg_lum = 0.2;
	double distance = 3.0 * pixelRatio;
	double fieldsize = 600 * pixelRatio;
	double orientation[DOTSNUM];
	Psychlops::Rectangle dots(dotsize, dotsize);
	Psychlops::Color col;
	col.set(bg_lum);

	//// prepare dots position and paired orientation
	double positionmat[DOTSNUM][2];
	for (int i = 0; i<DOTSNUM; i++) {
		positionmat[i][0] = random(fieldsize) - 0.5*fieldsize;
		positionmat[i][1] = random(fieldsize) - 0.5*fieldsize;
		orientation[i] = atan2(positionmat[i][1], positionmat[i][0]);
	}

	//// prepare selectbox to select stimulus type.
	int stimulus_type = 0.0;
	///- Preperation

	///+ Draw Gaussian Envelope
	////Draw offscreen Gaussian Envelope
	Psychlops::Image envelope(fieldsize + 100, fieldsize + 100, Image::RGBA); //declare offscreen image
	envelope.clear(col); //clear offscreen image
	double _x;
	double _y;
	for (int i = 0; i<fieldsize + 100; i++) {
		_x = i - 0.5*fieldsize - 50;
		for (int j = 0; j<fieldsize + 100; j++) {
			_y = j - 0.5*fieldsize - 50;
			envelope.alpha(i, j, 1.0 - exp(-((_x*_x + _y*_y) / (2.0*pow(fieldsize / 6.0, 2.0)))));
		}
	}
	envelope.cache();
	///- Draw Gaussian Envelope
	///+ set Independent
	//// set variables and value ranges for interaction
	Widgets::Slider slider[3];
	Interval rng;
	slider[0].link(distance, "distance between pairs", 1 <= rng <= 100, 1.0, 10.0);
	slider[1].link(duration, "Refresh", 0.0 <= rng <= 10.0, 1, 1);
	slider[2].link(stimulus_type, "Stimulus Type", 0.0 <= rng < 3.0, 1, 1);


	///- set Independent

	int frame = 0;
	// [begin mainloop]
	while (!Keyboard::esc.pushed()) {
		///+ position change
		//// Re-randomize position with a desingated interval
		if (frame > duration)
		{
			for (int i = 0; i<DOTSNUM; i++) {
				positionmat[i][0] = random(fieldsize) - 0.5*fieldsize;
				positionmat[i][1] = random(fieldsize) - 0.5*fieldsize;
				orientation[i] = atan2(positionmat[i][1], positionmat[i][0]);
			}
			frame = 0;
		}
		///- position change
		cnvs.clear(Color(bg_lum)); //Clear window

		if (floor(stimulus_type) == 0) {
			//// Rotation
			for (int i = 0; i < DOTSNUM; i++) {
				dots.centering().shift(positionmat[i][0], positionmat[i][1]); // move to center position
				dots.shift(-0.5*distance*cos(orientation[i] + 0.5*PI), -0.5*distance*sin(orientation[i] + 0.5*PI));// move to the first position
				dots.draw(Color(dot_lum)); // draw first dot
				dots.shift(distance*cos(orientation[i] + 0.5*PI), distance*sin(orientation[i] + 0.5*PI));// move to the second position
				dots.draw(Color(dot_lum)); // Draw dots at a desinated position.
			}
		}
		else if (floor(stimulus_type) == 1) {
			////Diversion
			for (int i = 0; i < DOTSNUM; i++) {
				dots.centering().shift(positionmat[i][0], positionmat[i][1]);// move to center position
				dots.shift(-0.5*distance*cos(orientation[i] + 0.5*PI), -0.5*distance*sin(orientation[i] + 0.5*PI));// move to the first position
				dots.draw(Color(dot_lum));// draw first dot
				dots.shift(distance*cos(orientation[i]), distance*sin(orientation[i]));// move to the second position	
				dots.draw(Color(dot_lum)); // Draw dots at a desinated position.
			}
		} else {
			//// Spiral
			for (int i = 0; i<DOTSNUM; i++) {
				dots.centering().shift(positionmat[i][0], positionmat[i][1]);// move to center position
				dots.shift(-0.5*distance*cos(orientation[i] + 0.5*PI), -0.5*distance*sin(orientation[i] + 0.5*PI));// move to the first position
				dots.draw(Color(dot_lum));// draw first dot
				dots.shift(distance*cos(orientation[i] + 0.25*PI), distance*sin(orientation[i] + 0.25*PI));// move to the second position
				dots.draw(Color(dot_lum)); // Draw dots at a desinated position.
			}
		}
		///- Draw dots
		envelope.centering().draw(); //Draw offscreen Gaussian onto screen


		for (i = 0; i<3; i++) { slider[i].draw(); }

		cnvs.flip(); // Flip frame buffers
		frame++;
	}
	// [end mainloop]

}