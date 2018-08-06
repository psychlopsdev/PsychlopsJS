#include <psychlops.h>
using namespace Psychlops;

void psychlops_main()
{
	Canvas cnvs(1024, 768, Canvas::window);

	Psychlops::Letters note(L"黄色い部分が一様で、端に１ドット黒い枠があることを確認してください。");
	note.shift(10, 80);

	Psychlops::Color col;
	Psychlops::Image test;
	test.set(500, 500);
	test.centering();

	Psychlops::Rectangle rect;
	rect.set(500, 500).centering();
	rect.fill = Color::blue;

	for (int y = 0; y < test.getHeight(); y++) {
		for (int x = 0; x < test.getWidth(); x++) {
			if (x == 0 || x == test.getWidth() - 1 || y == 0.0 || y == test.getHeight() - 1.0) {
				col.set(0);
			}
			else {
				col.set(x % 2, y % 2, 0.0, 1.0);
			}
			test.pix(x, y, col);
		}
	}


	// [begin loop]
	while (!Keyboard::esc.pushed()) {
		cnvs.clear(Color(127 / 255.0));

		rect.draw();
		test.draw();
		note.draw();

		cnvs.flip();
	}
	// [end loop]
}
