#include <psychlops.h>
using namespace Psychlops;

void psychlops_main()
{
	Canvas cnvs(1000, 1000, Canvas::window);
	Color::setGammaValue();

	double L = 70.0, us = 50.0, vs = 50.0;
	double u, v;
	double Yw = 100.0, uw = 0.2009, vw = 0.4610;
	double X, Y, Z;
	double R, G, B;

	double size = 1000;
	int step = 100;

	Color col;
	Image master;
	master.set(size, size);
	Image img[step];

	Widgets::Slider sl;
	int view = 0;
	Interval rng;
	sl.link(view, "L", 0 <= rng<100, 1);
	double limit = 17;


	for (int i = 0; i<step; i++) {
		img[i].set(size, size);
		for (int y = 0; y<10; y++) { for (int x = 0; x<size; x++) { img[i].pix(x, y*size / 10, Color::white); } }
		for (int y = 0; y<size; y++) { for (int x = 0; x<10; x++) { img[i].pix(x*size / 10, y, Color::white); } }
		L = i;
		for (int y = 0; y<size; y++) {
			for (int x = 0; x<size; x++) {
				//u = us/(13*L)+uw;	// -100<us<100
				//v = vs/(13*L)+vw;	// -100<us<100

				u = x / size;
				v = (size - y) / size;

				Y = (L <= 8) ? Yw*L / 903.3 : Yw*pow((L + 16.0) / 116, 3);
				X = Y*(9.0*u) / (4.0*v);
				Z = Y*(12 - 3 * u - 20 * v) / (4 * v);

				R = 0.41847*X + -0.15866*Y + -0.082835*Z;
				G = -0.091169*X + 0.25243*Y + 0.015708*Z;
				B = 0.0009209*X + -0.0025498*Y + 0.17860*Z;

				if (R>0 && R<limit && G>0 && G<limit && B>0 && B<limit) {
					col.set(R / limit, G / limit, B / limit);
					master.pix(x, y, col);
					img[i].pix(x, y, col);
				}
				else {
					//col.set(0);
				};
			}
		}

		cnvs.clear(Color(127 / 255.0));

		cnvs.msg(i + "%", 100, 100, Color::white);

		cnvs.flip();
	}

	while (!Keyboard::esc.pushed()) {
		cnvs.clear(Color(127 / 255.0));

		//master.centering().draw();
		img[floor(view)].centering().draw();
		sl.draw();
		cnvs.msg(floor(view), 100, 100, Color::white);

		cnvs.flip();
	}
}

