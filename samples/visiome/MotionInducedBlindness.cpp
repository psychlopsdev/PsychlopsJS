//Motion Induced Blindness Demo
//Programmed by Kazushi Maruya, 2006
#include <psychlops.h>
using namespace Psychlops;

void psychlops_main()
{
	int i;
	double x, y, z, t, p, temp, xx, yy;

	//Set Target Initial Value
	double TargetEcce = 100.0, TargetSize = 5.0, TargetNumber = 3, Rotate = 0.0;

	//Set Background Initial Value
	double DotNumber = 100, thetaSpeed = 1.0, Axis = 0.0, BGRadii = 150, BGSize = 5.0;

	//Make the main window, width/height/color-depth/Refreshrate
	Canvas cnvs(Canvas::window);

	//Declare background dots and target
	Psychlops::Rectangle BGDot[2048];
	Psychlops::Rectangle Target[10];

	//Declare Matrix to keep back ground dots' coordinate value
	double DotXY[2][2048];

	//Set Independent variables to manipulate
	Widgets::Slider slider[7];
	Interval rng;
	slider[0].link(DotNumber, "BGDotNumber", 100 <= rng <= 500, 10.0, 100.0);
	slider[1].link(BGSize, "BGSize", 1.0 <= rng <= 6.0, 1.0, 1.0);
	slider[2].link(thetaSpeed, "BG speed", -5.0 <= rng <= 5.0, 0.5, 1.0);
	slider[3].link(Axis, "BGAxis", -180.0 <= rng <= 180.0, 10.0, 30.0);
	slider[4].link(BGRadii, "BGFieldSize ", 20 <= rng <= 500, 10.0, 100.0);
	slider[5].link(TargetNumber, "TargetNumber ", 2 <= rng <= 10, 1, 1);
	slider[6].link(Rotate, "TargetPosition ", -180 <= rng <= 180, 1.0, 30.0);

	//Initialize positions of background dots
	for (int i = 0; i<2048; i++) {
		t = Psychlops::random(2.0*PI);
		p = Psychlops::random(2.0*PI);
		DotXY[0][i] = t;
		DotXY[1][i] = p;

		x = BGRadii*cos(t)*cos(p);
		y = BGRadii*sin(t)*cos(p);
		BGDot[i].set(BGSize, BGSize);
		BGDot[i].centering().shift(x, y);
	}

	//Initialize positions of targets
	for (int i = 0; i<10; i++)Target[i].set(TargetSize, TargetSize);

	double COS, SIN;


	// [begin mainloop]
	while (!Keyboard::esc.pushed()) {
		//Clear the main window
		cnvs.clear(Color::black);


		temp = Axis / 360 * 2 * PI;
		COS = cos(temp);
		SIN = sin(temp);

		//Calculate positions of background dots and set them
		for (int i = 0; i<DotNumber; i++) {
			//Calculate in polar coordinate
			t = DotXY[0][i] + 2.0*PI*thetaSpeed / 360.0;
			p = DotXY[1][i];

			//Save current position
			DotXY[0][i] = t;

			//Convert to Decartes coordinate
			x = BGRadii*cos(t)*cos(p);
			y = BGRadii*sin(t)*cos(p);
			z = BGRadii*sin(p);
			xx = x;
			yy = SIN*y + COS*z;

			//Set Dotsize and Draw them
			BGDot[i].set(BGSize, BGSize);
			BGDot[i].centering().shift(xx, yy);
			BGDot[i].draw(Color::blue);
		}

		//Calculate positions of targets and set them
		temp = Rotate * 2 * PI / 360.0;
		for (i = 0; i<TargetNumber; i++) {
			t = 2 * PI / TargetNumber;
			x = TargetEcce*cos(i*t + temp);
			y = TargetEcce*sin(i*t + temp);
			Target[i].centering().shift(x, y);
			Target[i].draw(Color::yellow);
		}

		for (i = 0; i<7; i++) { slider[i].draw(); }

		//Reflect drawing at the next frame;
		cnvs.flip();
	}
	// [end mainloop]
}
