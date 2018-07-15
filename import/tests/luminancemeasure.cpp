#include <psychlops.h>
using namespace Psychlops;

void psychlops_main(){
	AppInfo::tabletMode(true);
	Canvas cnvs(Canvas::fullscreen);
	Color::setGammaValue(2, 2, 2);
	int frame = 0;

	Widgets::Button btn[7];
	for (int i = 0; i < 3; i++) {
		btn[i*2].set("上"); btn[i * 2].shift(0,i*200);
		btn[i*2+1].set("下"); btn[i * 2 + 1].shift(0, i* 200 +100);
	}
	btn[6].set("r"); btn[6].shift(0, 600);
	double r = 0, g = 0, b = 0;
	Color col;

	// [begin loop]
	while(true) {
	
		col.set(r, g, b);

		cnvs.clear(col);

		for (int i = 0; i < 7; i++) {
			btn[i].draw();
		}
		if (btn[0].pushed()) { r += 1 / 16; }
		if (btn[1].pushed()) { r -= 1 / 16; }
		if (btn[2].pushed()) { g += 1 / 16; }
		if (btn[3].pushed()) { g -= 1 / 16; }
		if (btn[4].pushed()) { b += 1 / 16; }
		if (btn[5].pushed()) { b -= 1 / 16; }
		if (btn[6].pushed()) { r = 0; g = 0; b = 0; }

		cnvs.flip();

		if(Keyboard::esc.pushed()) {
			break; // [end loop]
		}
	}
	// [end loop]
}