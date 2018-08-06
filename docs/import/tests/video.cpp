#include <psychlops.h>
using namespace Psychlops;

void psychlops_main()
{
	Canvas cnvs(Canvas::window);

	int x = 0;
	Figures::ShaderGabor gabor;
	gabor.setSigma(50);
	gabor.contrast = 1;
	gabor.wavelength = 30;
	gabor.centering();

	var filenames = ["_potatoB_l1ver2_g_1-60.mp4", "_potatoB_l1ver2_m_1-60.mp4",
		"_potatoB_l2ver2_g_1-60.mp4", "_potatoB_l2ver2_m_1-60.mp4",
		"_potatoB_l3ver2_g_1-60.mp4", "_potatoB_l3ver2_m_1-60.mp4",
		"_potatoB_l4ver2_g_1-60.mp4", "_potatoB_l4ver2_m_1-60.mp4",
		"_potatoB_l5ver2_g_1-60.mp4", "_potatoB_l5ver2_m_1-60.mp4"];

	Movie mov[10];
	for (int i = 0; i < 10; i++) {
		mov[i].load("image/tamura_sample/" + filenames[i]);
		mov[i].initialize();
	}

	int loaded_count = 0, percentage, sum_percentage;
	while (loaded_count < 10) {
		loaded_count = 0;
		sum_percentage = 0;
		cnvs.clear(Color(127 / 255.0));
		for (int i = 0; i < 10; i++) {
			percentage = mov[i].tryDecoding();
			sum_percentage += percentage;
			if (percentage == 1) { loaded_count += 1; }
		}
		cnvs.msg(sprintf("Loading, please wait ... %2d %%", (sum_percentage / 10 * 100)), 100, 100);
		cnvs.flip();
	}

	int selected[10];
	for (int i = 0; i < 10; i++) { selected[i] = i; }
	Math::shuffle(selected, 10);


	while (!Keyboard::esc.pushed()) {
		cnvs.clear(Color(127 / 255.0));

		mov[selected[0]].centering().shift(-mov[0].getWidth(), -mov[0].getHeight()).nextFrame();
		mov[selected[1]].centering().shift(mov[0].getWidth(), -mov[0].getHeight()).nextFrame();
		mov[selected[2]].centering().shift(-mov[0].getWidth(), mov[0].getHeight()).nextFrame();
		mov[selected[3]].centering().shift(mov[0].getWidth(), mov[0].getHeight()).nextFrame();
		gabor.draw();
		gabor.phase += 2 * PI / 60;

		cnvs.flip();
	}
}

