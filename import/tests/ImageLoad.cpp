#include <psychlops.h>
using namespace Psychlops;

void psychlops_main()
{
	Canvas cnvs(1024, 768, Canvas::window);

	Psychlops::Letters note(L"青枠の中に黒猫の画像が表示されていることを確認してください。");
	note.shift(10, 80);

	Psychlops::Color col;
	Psychlops::Image test;
	test.load("import/tests/cat.jpg");
	test.centering();

	Psychlops::Rectangle rect;
	rect.set(500, 500).centering();
	rect.fill = Color::blue;


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
