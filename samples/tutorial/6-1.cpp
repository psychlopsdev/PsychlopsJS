#include <psychlops.h>
using namespace Psychlops;

void psychlops_main() {
	Canvas window(Canvas::window);

	Psychlops::Rectangle rect1(100,100);
	Psychlops::Rectangle rect2(100,100);

	auto table = Data::loadCSV("samples/sample.csv");
	Color col[2];

	for(int i=0; i<2; i++) {
		col[i].set(table[i][0], table[i][1], table[i][2]);
	}

    
	while(!Keyboard::esc.pushed()){
		window.clear(Color::black);

		rect1.centering().shift(-100,0).draw(col[0]);
		rect2.centering().shift( 100,0).draw(col[1]);

		window.flip();
	}

}