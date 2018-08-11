#include <psychlops.h>
using namespace Psychlops;


void psychlops_main() {
	Canvas cnvs(Canvas::window);

	const int BUFFER = 100;
	const int whole_size = 200;
	const int stereo_size = 100;
	double disprity = 1.0;
	bool pause = false;
	int SOA = 0;

	Interval rng;
	Widgets::Slider slider[2];
	slider[0].link(disprity, "disprity", 0.0<rng<20.0, 5.0, 1.0);
	slider[1].link(SOA, "SOA", 0.0<rng<10.0, 1.0, 1.0);

	Color col;
	Image base[2][BUFFER];
	Image stereo[BUFFER];
	for(int i=0; i<BUFFER; i++) {
		//Display::progressbar(i, BUFFER);
		for(int j=0; j<2; j++) {
			base[j][i].set(whole_size, whole_size);
			for(int y=0; y<whole_size; y++) { for(int x=0; x<whole_size; x++) { base[j][i].pix(x,y,col.set(Psychlops::random())); }}
		}
		stereo[i].set(stereo_size, stereo_size);
			for(int y=0; y<stereo_size; y++) { for(int x=0; x<stereo_size; x++) { stereo[i].pix(x,y,col.set(Psychlops::random())); }}
	}

	int loop = 0;
	while(!Keyboard::esc.pushed()) {
		if(Keyboard::spc.pushed()) pause = !pause;
		if(!pause) {
			loop++;
			loop %= BUFFER;
		}
		cnvs.clear();
		base[0][loop].centering().shift(-whole_size, 0).draw();
		stereo[loop].centering().shift(-whole_size, 0).draw();
		base[1][loop].centering().shift(whole_size, 0).draw();
		stereo[loop].centering().shift(whole_size+disprity, 0).draw();
		cnvs.msg("Push space key to pause.", 400, 10, Color::red);
		
		slider[0].draw();
		slider[1].draw();
		
		cnvs.flip(SOA+1);
	}

}