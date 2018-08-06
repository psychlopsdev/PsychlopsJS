#include <psychlops.h>
using namespace Psychlops;

void psychlops_main(){
	AppInfo::tabletMode(true);
	Canvas cnvs(Canvas::fullscreen);
	int frame = 0;

	// [begin loop]
	while(true) {
	
		frame+=1;
		if(frame%2==0) { cnvs.clear(Color::white); }
		else { cnvs.clear(Color::black); }
		cnvs.flip();

		if(Keyboard::esc.pushed()) {
			break; // [end loop]
		}
	}
	// [end loop]

	// [begin finished]
	while (true) {
		Color::black;
		cnvs.msg("thank you", 200,200);
		cnvs.flip();

		if (Keyboard::esc.pushed()) {
			break; // [end finished]
		}
	}
	// [end finished]
}