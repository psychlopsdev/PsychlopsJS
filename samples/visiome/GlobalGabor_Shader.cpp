#include <psychlops.h>;
using namespace Psychlops;

void psychlops_main() {

	Canvas::useNoisyBit(true); // This function must be called before the declaration of Canvas instance.
	Canvas cnvs(Canvas::window); // make a drawing window, 1024 x 768, 32bit, 60.0 Hz
	Color::setGammaValue(); // set gamma correction value as device-default.
	Font::default_font = Font(L"Arial", 18); //Set a default font.

	//// Prepare Global variables
	double direction = 90.0; // a direction of global motion
	double sigma = 2.0;    // a size of Gabor window
	double tf = 2.0;        //speed as a maximum temporal frequency
	double refresh = cnvs.getRefreshRate(); //get refresh rate of display
	double contrast = 0.1; // Carrier contrast
	double lambda = 8.0; // a wave length of carrier gratings
	Psychlops::Point center1 = cnvs.getCenter(); // get a center
	int sqrtN = 32;        // size of array
	double arraygap = 8.0;
	double shift = 0.0;
	double _x, _y;
	double initphase[4096];
	Psychlops::Rectangle fixation[2];
	Psychlops::Letters slider1Label, slider2Label;

	///+ Prepare the array of Gabor patch
	//// Prepare the Gabor elements using ShaderGaborAlpha Class which allowing shader programming
	Figures::ShaderGaborAlpha gabor[sqrtN*sqrtN];

	for (int i = 0; i<sqrtN*sqrtN; i++) {
		gabor[i].setSigma(sigma*1.5); // set a size of patch as a half width of Gaussian
		gabor[i].contrast = contrast;
		gabor[i].wavelength = lambda; //set wavelengths
		gabor[i].orientation = 10 * random(36);  //set orientations
		initphase[i] = random(2 * PI); //randomize initial phases
	}
	///- Prepare the array of Gabor patch

	///+ Prepare Interfaces
	//// Prepare two sliders to manipulate parameters.


	Interval rng;

	Widgets::Slider contrast_slider, dir_slider, vel_slider;
	contrast_slider.link(contrast, "Contrast", 0.0<rng<1.0, 0.1);
	//contrast_slider.centering().shift(-400,250);
	dir_slider.link(direction, "Direction", 0.0<rng<360.0, 1.0);
	//dir_slider.centering().shift(-400,300);
	vel_slider.link(tf, "Velocity", 0.0<rng<10.0, 1.0);
	///- Prepare Interfaces

	///+ Prepare fixation.
	//// Prepare fixation cross
	fixation[0].set(3, 9);
	fixation[0].centering();
	fixation[1].set(9, 3);
	fixation[1].centering();
	///- Prepare fixation.

	Mouse::show(); //Show mouse cursor

				   //// The main loop for stimulus drawing
				   //Display::watchFPS(); //Option to check frame failing
				   // [begin mainloop]
	while (!Keyboard::esc.pushed()) { // till escape key is pressed
		cnvs.clear(Color::gray); // fill a background with gray.
		shift += tf * 2 * PI / refresh; // increment phase
										///+ Locate Gabor Array and Draw them
										//// Locate and Draw Gabor Array
		for (int i = 0; i<sqrtN*sqrtN; i++) {
			_x = ((double)i / sqrtN - (double)sqrtN / 2.0) * sigma*arraygap;
			_y = (fmod((double)i, (double)sqrtN) - (double)sqrtN / 2.0) *sigma*arraygap;
			gabor[i].centering(_x + center1.x, _y + center1.y);
			gabor[i].phase = initphase[i] + shift*cos(gabor[i].orientation + PI / 2 + (direction*PI / 180.0));
			gabor[i].contrast = contrast;
			if ((_x*_x + _y*_y) > pow(6.0*sigma*arraygap, 2.0) && (_x*_x + _y*_y) < pow(sqrtN*0.5*sigma*arraygap, 2.0)) {
				gabor[i].draw();
			}
		}
		///- Locate Gabor Array and Draw them

		///+ Draw interfaces.
		//// Drawing interfaces
		contrast_slider.draw();
		dir_slider.draw();
		vel_slider.draw();
		///- Draw interfaces.

		fixation[0].draw(Color::red);
		fixation[1].draw(Color::red);
		//Display::showFPS();  //Option to check frame failing
		cnvs.flip(); // flip frame buffer
	}
	// [end mainloop]
}
