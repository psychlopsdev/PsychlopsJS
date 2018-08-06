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
	//Figures::ShaderGaussianDot dot[N * 2];	// パッチの用意
	Ellipse dot[N * 2];	// パッチの用意
	double patch_size = 40 * pxr;


	// パッチの位置をセット
	for (int i = 0; i<N; i++) {
		dot[i * 2].set(patch_size * 3, patch_size * 3);
		dot[i * 2 + 1].set(patch_size * 3, patch_size * 3);
		//cp.set(patch_size * 8 * (floor(i % halfN) - (N / 4 - 0.5)), patch_size * 8 * (floor(i / halfN) - 0.5));
		cp.set(0, 0);
		dot[i * 2].centering().shift(cp);
		dot[i * 2 + 1].centering().shift(cp);
	}

	double measured_v = 0;
	double v_value[3] = { 0.2, 0.4, 0.05 };
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
	Psychlops::Letters instruction2(L"ちらつき感がなるべく小さくなるようにしてください。");
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

		// [begin loop]
		while (!Keyboard::esc.pushed()) {
			cnvs.clear(Color::black);

			// フリッカ周期の判定（ハードコーディング注意）
			neg_pos = frames % 6 < 3 ? 0 : 1;
			touched = -1;

			for (int i = 0; i<N; i++) {
				// パッチの色をセット
				conf = measured_v;//base + i / scale, base + i / scale;
				switch (conf_color) {
				case 0:
					dot[i * 2].fill = Color(v_value[conf_color], v_value[conf_color], v_value[conf_color], 1);
					dot[i * 2 + 1].fill = Color(conf, 0, 0, 1);
					break;
				case 1:
					dot[i * 2].fill = Color(v_value[conf_color], v_value[conf_color], v_value[conf_color], 1);
					dot[i * 2 + 1].fill = Color(0, conf, 0, 1);
					break;
				case 2:
					dot[i * 2].fill = Color(v_value[conf_color], v_value[conf_color], v_value[conf_color], 1);
					dot[i * 2 + 1].fill = Color(0, 0, conf, 1);
					break;
				}

				dot[i * 2 + neg_pos].draw();

				// マウスカーソルがパッチの中にあるか判定
				if (dot[i * 2].include(Mouse::position)) touched = i;
			}
			v_ratio[conf_color] = v_value[conf_color] / measured_v;

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

	alert(v_ratio[0] + v_ratio[1] + v_ratio[2]);
	alert(v_ratio);

	AppInfo::localSettings["IsoluminantRatioRG"] = 1 / v_ratio[0];
	AppInfo::localSettings["IsoluminantRatioGB"] = 1;
	AppInfo::localSettings["IsoluminantRatioBR"] = v_ratio[1];
	AppInfo::saveLocalSettings();

}

