#include <psychlops.h>
using namespace Psychlops;

void psychlops_main(){
	AppInfo::tabletMode(true);
	Canvas cnvs(Canvas::fullscreen);
	int frame = 0;
	double flip_interval_msec = 1000.0 / cnvs.getRefreshRate();

	Clock before, current, after;
	double frame_before, frame_current, frame_elapsed;

	Rectangle rect(cnvs.getWidth(), cnvs.getHeight());
	rect.centering();

	const int REP = 30;
	double elapsed_time[REP];

	before.update();
	frame_before = before.at_msec();

	Letters inst("Get ready");

	for (int i = 0; i < REP; i++) {
		// [begin loop]

		for (int j = 0; j < 60; j++) {
			cnvs.clear(Color::white);
			inst.centering().draw(Color::black);
			cnvs.flip();
		}

		int r_frame = random(120);


		for (int j = 0; j < r_frame; j++) {
			cnvs.clear(Color::white);
			cnvs.flip();
		}

		cnvs.clear(Color::black);
		rect.draw(Color::black);
		cnvs.flip();

		before.update();
		Keyboard::spc.pushed();
		Input::refresh();


		while (true) {

			if (Keyboard::esc.pushed()) {
				exit(0);
			}

			if (Keyboard::spc.pushed()) {
				break; // [end loop]
			}

			cnvs.clear(Color::black);
			cnvs.flip();
		}
		// [end loop]
		after.update();

		double elapsed = after.at_msec() - before.at_msec();
		elapsed_time[i] = elapsed;
	}

	
	Data::savearray("results.txt", "　", REP, elapsed_time);

	// [begin finished]
	while (true) {
		cnvs.clear(Color::white);
		
		cnvs.flip();

		if (Keyboard::esc.pushed()) {
			break; // [end finished]
		}
	}
	// [end finished]
}