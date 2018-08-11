#include <psychlops.h>
using namespace Psychlops;

void psychlops_main()
{
	// Originally written by Mitsumasu Harasawa

	Canvas cnvs(Canvas::window);

	int frame = 0;
	const int DotNum = 512;
	const int LifeTime = 6;
	double radii = 200 * cnvs.getPixelRatio();
	double Ecce = 0;
	double Dotspeed = 1.0* cnvs.getPixelRatio();
	double tfreq = 0.5;

	double init_plaideg = 0.0, init_signal = 0.5;
	double SignalCol = 1.0, NoiseCol = 1.0;


	double  Dots[3][DotNum];
	double  DotsMotion[DotNum];

	Psychlops::Rectangle Dot(2 * cnvs.getPixelRatio(), 2 * cnvs.getPixelRatio());
	double SRate = init_signal;


	double radialPos, theta;
	for (int i = 0; i<DotNum; i++) {
		Dots[0][i] = radii + 1;
		Dots[1][i] = Dots[0][i];
		Dots[2][i] = Psychlops::random(LifeTime + 1);
		while (Dots[0][i] * Dots[0][i] + Dots[1][i] * Dots[1][i]>radii*radii) {
			Dots[0][i] = (-1.0 + 2.0*Psychlops::random())*radii;
			Dots[1][i] = (-1.0 + 2.0*Psychlops::random())*radii;
		}
		DotsMotion[i] = (2 * (Psychlops::random() % 2)) - 1;
	}

	double d;
	int SignalNum = floor(DotNum*SRate);
	double shift = Dotspeed;
	double PlaiDeg = init_plaideg;

	Widgets::Slider slider[4];
	Interval rng;
	slider[0].link(PlaiDeg, "Motion angle", 0.0 <= rng< 180.0, 30.0, 1.0);
	slider[1].link(SRate, "%Singal", 0.0 <= rng <= 1.0, 0.1, 0.05);
	slider[2].link(SignalCol, "SignalColor", 0.0 <= rng <= 1.0, 0.1, 0.05);
	slider[3].link(NoiseCol, "NoiseColor", 0.0 <= rng <= 1.0, 0.1, 0.05);
	//slider[4].link(tfreq     , "Frequency "  , 0.0<=rng<=4.0  ,  0.5 , 0.5 );


	// [begin mainloop]
	while (!Keyboard::esc.pushed()) {
		cnvs.clear();

		for (int i = 0; i<SignalNum; i++) {

			theta = PI*(DotsMotion[i] * PlaiDeg) / 180;

			Dots[0][i] += shift*cos(theta);
			Dots[1][i] += shift*sin(theta);
			Dots[2][i] -= 1;

			if (Dots[2][i]<1) {
				Dots[2][i] = LifeTime;
				Dots[0][i] = radii + 1;
				Dots[1][i] = Dots[0][i];
			}
			if (Dots[0][i] * Dots[0][i] + Dots[1][i] * Dots[1][i]>radii*radii) {
				while (Dots[0][i] * Dots[0][i] + Dots[1][i] * Dots[1][i]>radii*radii) {
					Dots[0][i] = (-1.0 + 2.0*Psychlops::random())*radii;
					Dots[1][i] = (-1.0 + 2.0*Psychlops::random())*radii;
				}
			}
			d = SignalCol*(1 - (sqrt(Dots[0][i] * Dots[0][i] + Dots[1][i] * Dots[1][i]) / radii));
			Dot.centering().shift(Dots[0][i] - Ecce, Dots[1][i]).draw(Color(d));

		}

		for (int i = SignalNum; i<DotNum; i++) {
			Dots[2][i] -= 1;
			if (Dots[2][i]<1) {
				Dots[2][i] = LifeTime;
				Dots[0][i] = radii + 1;
				Dots[1][i] = Dots[0][i];
			}
			while (Dots[0][i] * Dots[0][i] + Dots[1][i] * Dots[1][i]>radii*radii) {
				Dots[0][i] = (-1.0 + 2.0*Psychlops::random())*radii;
				Dots[1][i] = (-1.0 + 2.0*Psychlops::random())*radii;
			}
			d = NoiseCol*(1 - (sqrt(Dots[0][i] * Dots[0][i] + Dots[1][i] * Dots[1][i]) / radii));
			Dot.centering().shift(Dots[0][i] - Ecce, Dots[1][i]).draw(Color(d));
		}

		for (int i = 0; i<4; i++) {
			slider[i].draw();
		}
		cnvs.flip();
		frame++;
	}
	// [end mainloop]
}

