#include <psychlops.h>
using namespace Psychlops;

void psychlops_main()
{
	Canvas cnvs(Canvas::window);

	int iarray[10];
	for(int i=0; i<10; i++) { iarray[i] = i; }
	
	Data::savearray("test_result_%TIME_.txt", "TEST", 10, iarray);

	Rectangle rect(100,100);

	while (!Keyboard::esc.pushed()) {
		cnvs.clear(Color(127 / 255.0));

		rect.centering().draw(Color::green);

		cnvs.flip();
	}

}

