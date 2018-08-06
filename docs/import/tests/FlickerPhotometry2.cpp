#include <psychlops.h>
using namespace Psychlops;

void psychlops_main()
{
	AppInfo::tabletMode(true);

	Canvas::useNoisyBit(false);
	Canvas cnvs(Canvas::window);
	Widgets::Theme::setLightTheme();


	const int N = 8, halfN = N / 2;	// パッチの数
	Figures::ShaderGaussianDot dot[N * 2];	// パッチの用意

	// パッチの位置をセット
	for (int i = 0; i<N; i++) {
		dot[i * 2].setSigma(20);
		dot[i * 2 + 1].setSigma(20);
		dot[i * 2].centering().shift(20 * 8 * (floor(i % halfN) - (N / 4 - 0.5)), 20 * 8 * (floor(i / halfN) - 0.5));
		dot[i * 2 + 1].centering().shift(20 * 8 * (floor(i % halfN) - (N / 4 - 0.5)), 20 * 8 * (floor(i / halfN) - 0.5));
	}

	// 
	int frames = 0, neg_pos = 0;
	int touched = -1;

	double base = 0.0; // 調整する側の色の最小値
	double scale = 8; // 調整する側の色の変量の段階


	Input::refresh();

	// [begin loop]
	while (!Keyboard::esc.pushed()) {
		cnvs.clear(Color(127 / 255.0));

		// フリッカ周期の判定（ハードコーディング注意）
		neg_pos = frames % 6 < 3 ? 0 : 1;
		touched = -1;

		for (int i = 0; i<N; i++) {
			// パッチの色をセット
			dot[i * 2].fill = Color(0.5, 0, 0, 1);
			dot[i * 2 + 1].fill = Color(0, base + i / scale, base + i / scale, 1);

			dot[i * 2 + neg_pos].draw();

			// マウスカーソルがパッチの中にあるか判定
			if (dot[i * 2].include(Mouse::position)) touched = i;
		}

		// パッチがタッチされていたら調整する側の色を再調整
		if (Mouse::left.pushed() && touched >= 0) {
			base += (touched - 2) / scale;
			scale *= 4;
			Input::refresh();
		}

		cnvs.flip();
		frames++;
	}
	// [end loop]

}

