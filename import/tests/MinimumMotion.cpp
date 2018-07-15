#include <psychlops.h>
using namespace Psychlops;

void psychlops_main()
{
	AppInfo::tabletMode(false);

	Canvas::useNoisyBit(false);
	Canvas cnvs(Canvas::fullscreen);
	Widgets::Theme::setLightTheme();
	Psychlops::Color::setGammaValue();

	Psychlops::Point cp, mp;

	double pxr = cnvs.getPixelRatio();
	const int N = 1, halfN = floor(N / 2);	// パッチの数
	Psychlops::Rectangle dot[2];
	double patch_size = 40 * pxr;
	Color patch_a, patch_b;


	// パッチの位置をセット
	for (int i = 0; i<N; i++) {
		dot[i * 2].set(50 * pxr, 300 * pxr);
		dot[i * 2 + 1].set(50 * pxr, 300 * pxr);
	}

	double measured_v = 0;
	double v_value[3] = { 1.0/8, 1.0/4, 1.0/32 };
	double v_ratio[3];
	Interval rng;
	Widgets::Dial dial_r, dial_g, dial_b;
	dial_g.set(200 * pxr, 60 * pxr).centering().shift(0 * pxr, 200 * pxr);
	dial_g.link(measured_v, "", 0 <= rng < 0.99, 1.0 / 8, 0.5);

	Widgets::Button endbutton, switchbutton;
	endbutton.set(L"キャンセル", 48);
	endbutton.centering().shift(cnvs.getWidth()*0.4, cnvs.getHeight()*0.4);
	switchbutton.set(L" 次へ ", 48);
	switchbutton.centering(cnvs.getHcenter(), dial_g.getBottom() + 200 * pxr);

	Psychlops::Letters instruction1(L"それぞれの図形の下のスライダーを調整し、");
	Psychlops::Letters instruction2(L"左右どちらにも動いていないように見えるようにしてください。");
	instruction1.centering().shift(0, -300 * pxr);
	instruction2.centering().shift(0, -300 * pxr + Psychlops.Font.default_font.size * 1.1);

	// 
	int frames = 0, neg_pos = 0;
	int touched = -1;
	int conf_color = 0;
	double conf;

	double base = 0.0; // 調整する側の色の最小値
	double scale = 8; // 調整する側の色の変量の段階


	Input::refresh();

	// [begin session]
	while (!Keyboard::esc.pushed()) {
		if (conf_color >= 3) {
			break;//endloop
		}

		dial_g.setValue(0);
		frames = 0;

		// [begin loop]
		while (!Keyboard::esc.pushed()) {
			cnvs.clear(Color::black);

			// フリッカ周期の判定（ハードコーディング注意）
			neg_pos = floor(frames % 4 /1);
			touched = -1;

			for (int i = 0; i<N; i++) {
				conf = measured_v;//base + i / scale, base + i / scale;
				switch (conf_color) {
				case 0:
					patch_a.set(v_value[conf_color], v_value[conf_color], v_value[conf_color], 1);
					patch_b.set(conf, 0, 0, 1);
					break;
				case 1:
					patch_a.set(v_value[conf_color], v_value[conf_color], v_value[conf_color], 1);
					patch_b.set(0, conf, 0, 1);
					break;
				case 2:
					patch_a.set(v_value[conf_color], v_value[conf_color], v_value[conf_color], 1);
					patch_b.set(0, 0, conf, 1);
					break;
				}

				switch (neg_pos) {
				case 0:
				case 2:
					dot[0].fill.set(v_value[conf_color] * 2, v_value[conf_color] * 2, v_value[conf_color] * 2);
					dot[1].fill.set(0.0, 0.0, 0.0);
					break;
				case 1:
				case 3:
					dot[0].fill = patch_a;
					dot[1].fill = patch_b;
					break;
				}
			}

			dot[0].centering().shift(-dot[0].getWidth() * (20 + neg_pos/2), 0);
			dot[1].centering().shift(-dot[0].getWidth() * (21 + neg_pos/2), 0);
			for (int j = 0; j < 40; j++) {
				dot[0].shift(dot[0].getWidth() * 2, 0).draw();
				dot[1].shift(dot[1].getWidth() * 2, 0).draw();
			}


			v_ratio[conf_color] =  v_value[conf_color] / measured_v;

			instruction1.draw(Color::white);
			instruction2.draw(Color::white);
			dial_g.draw();

			//endbutton.draw();
			//if (endbutton.pushed()) { endflag = 4; }
			switchbutton.draw();
			if (switchbutton.pushed()) {
				conf_color++;
				break;//endloop
			}

			cnvs.flip();
			frames++;
		}
		// [end loop]

	}
	// [end session]

	AppInfo::localSettings["IsoluminantRatioR"] = v_ratio[0];
	AppInfo::localSettings["IsoluminantRatioG"] = v_ratio[1];
	AppInfo::localSettings["IsoluminantRatioB"] = v_ratio[2];
	AppInfo::saveLocalSettings();

}

