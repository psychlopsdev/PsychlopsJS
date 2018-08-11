/* CIELab plot
 *
 * L*:~100, a*:~400, b*:~400
 */

#include <psychlops.h>
using namespace Psychlops;

void psychlops_main()
{
	Canvas cnvs(1000, 1000, Canvas::window);
	Color::setGammaValue();

	double L = 70.0;
	double a, b;
	double Xw = 95.047, Yw = 100.00, Zw = 108.883; // White point: D65
	double X, Y, Z;
	double R, G, B;
	double t, s, sigma = 6.0 / 29.0;

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

				a = (x - (size / 2)) / size * 400;
				b = ((size - y) - (size / 2)) / size * 400;

				s = 1.0 / 116 * (L + 16);
				t = s + 1.0 / 500 * a;  X = Xw * (t > sigma ? t*t*t : 3 * sigma*sigma*(t - 4 / 29));
				t = s; Y = Yw * (t > sigma ? t*t*t : 3 * sigma*sigma*(t - 4 / 29));
				t = s - 1.0 / 200 * b;  Z = Zw * (t > sigma ? t*t*t : 3 * sigma*sigma*(t - 4 / 29));

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

