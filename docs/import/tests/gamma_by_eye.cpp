#include <psychlops.h>
using namespace Psychlops;

double estimated_gamma = 0;
double gamma_step = 8.0;
var estimate_gamma = function(colorlevel) {
	estimated_gamma = 0;
	gamma_step = 8.0;
	while (0.0001<gamma_step) {
		while (0<pow(colorlevel, estimated_gamma) - 0.5) {
			estimated_gamma += gamma_step;
		}
		estimated_gamma -= gamma_step;
		gamma_step /= 2.0;
	}
	estimated_gamma += gamma_step;
	return estimated_gamma;
};

void psychlops_main()
{
	//// 1 Declaration
	// declare default window and variables for its parameters
	double CANVAS_FRAMENUM;
	int CANVAS_REFRESHRATE;

	Canvas cnvs(Canvas::fullscreen);
	Widgets::Theme::setLightTheme();

	Interval rng;
	double Gr, Gb, Gg;
	double measured_r = 0.5, measured_g = 0.5, measured_b = 0.5;


	Widgets::Dial dial_r, dial_g, dial_b;
	dial_r.set(200, 60).centering().shift(-300, 200);
	dial_g.set(200, 60).centering().shift(0, 200);
	dial_b.set(200, 60).centering().shift(300, 200);
	dial_r.link(measured_r, "Red", 0 <= rng < 0.99, 1.0 / 8, 0.5);
	dial_g.link(measured_g, "Green", 0 <= rng < 0.99, 1.0 / 8, 0.5);
	dial_b.link(measured_b, "Blue", 0 <= rng < 0.99, 1.0 / 8, 0.5);


	Widgets::Button endbutton, switchbutton;
	endbutton.set(L"キャンセル", 48);
	endbutton.centering().shift(cnvs.getWidth()*0.4, cnvs.getHeight()*0.4);
	switchbutton.set(L" 次へ ", 48);
	switchbutton.centering(cnvs.getHcenter(), dial_g.getBottom() + 200);


	//// 2 Initialization
	// Set initial values for local variables
	CANVAS_REFRESHRATE = cnvs.getRefreshRate();
	CANVAS_FRAMENUM = 0;


	//// 3 Drawing
	Psychlops::Rectangle center_rect(100, 100);
	Image grads[3];
	Color grads_color[3];
	grads_color[0] = Color(1, 0, 0);
	grads_color[1] = Color(0, 1, 0);
	grads_color[2] = Color(0, 0, 1);

	for (int i = 0; i < 3; i++) {
		grads[i].set(200, 200);
		for (int y = 0; y < 200; y++) {
			for (int x = 0; x < 200; x++) {
				grads[i].pix(x, y, y % 2 == 0 ? grads_color[i] : Color::black);
			}
		}
		grads[i].cache();
		grads[i].centering().shift(-300 + i * 300, 0);
	}


	int endflag = 0;
	Mouse::show();

	Psychlops::Letters instruction1(L"それぞれの図形の下のスライダーを調整し、");
	Psychlops::Letters instruction2(L"中心の四角とその周りの明るさをできるだけ近づけてください。");
	instruction1.centering().shift(0, -300);
	instruction2.centering().shift(0, -300 + Psychlops.Font.default_font.size * 1.1);

	Figures::ShaderGabor gbr;
	gbr.setSigma(200);
	gbr.centering();

	bool calibrating = true;
	int frames = 0;

	Psychlops::Color::setGammaValue(1.0, 1.0, 1.0);

	// [begin loop]
	while (endflag < 1) {
		frames++;
		if (calibrating) {

			cnvs.clear();

			dial_r.draw();
			dial_g.draw();
			dial_b.draw();

			if (dial_r.changed()) { Gr = estimate_gamma(measured_r); }
			if (dial_g.changed()) { Gg = estimate_gamma(measured_g); }
			if (dial_b.changed()) { Gb = estimate_gamma(measured_b); }

			if (endflag == 0) {
				for (int i = 0; i < 3; i++) { grads[i].shift(0, (frames % 2) * 2 - 1).draw(); }
			} else if (endflag == 1) {
				for (int i = 0; i < 3; i++) { grads[i].draw(); }
			}

			center_rect.centering().shift(-300 + 0 * 300, 0);
			center_rect.draw(Color(measured_r, 0.0, 0.0));
			center_rect.centering().shift(-300 + 1 * 300, 0);
			center_rect.draw(Color(0.0, measured_g, 0.0));
			center_rect.centering().shift(-300 + 2 * 300, 0);
			center_rect.draw(Color(0.0, 0.0, measured_b));

			instruction1.draw(Color::white);
			instruction2.draw(Color::white);

			endbutton.draw();
			if (endbutton.pushed()) { endflag = 4; }
			switchbutton.draw();
			if (switchbutton.pushed()) {
				endflag += 1; calibrating = false; frames = 0;
				measured_r = 0.5; measured_g = 0.5; measured_b = 0.5;
			}
		} else {
			cnvs.clear();
			if (frames > 30) {
				calibrating = true;
				frames = 0;
			}
		}
		cnvs.flip();
		CANVAS_FRAMENUM++;
	}
	// [end loop]

	AppInfo::localSettings["GammaR"] = Gr;
	AppInfo::localSettings["GammaG"] = Gg;
	AppInfo::localSettings["GammaB"] = Gb;
	AppInfo::saveLocalSettings();
	//alert("Estimated Gamma:\r\nR: "+Gr+"\r\nG: "+Gg+"\r\nB:"+Gb);
}
