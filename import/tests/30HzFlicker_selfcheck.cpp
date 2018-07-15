#include <psychlops.h>
using namespace Psychlops;

void psychlops_main(){
	AppInfo::tabletMode(true);
	Canvas cnvs(Canvas::fullscreen);
	int frame = 0;
	double flip_interval_msec = 1000.0 / cnvs.getRefreshRate();

	Clock before, current, after;
	double frame_before, frame_current, frame_elapsed;
	int dropframe_realtime = 0, dropframe_total = 0;
	bool dropped = false;

	Rectangle rect(100, 100);


	for (int i = 0; i < 60; i++) {
		cnvs.clear(Color::black);
		cnvs.flip();
	}

	before.update();
	frame_before = before.at_msec();

	// [begin loop]
	for (int i = 0; i < 60* cnvs.getRefreshRate(); i++) {
	//while(true) {

		frame+=1;
		if(frame%2==0) { cnvs.clear(Color::white); }
		else { cnvs.clear(Color::black); }

		if (dropped) {
			//cnvs.var(frame_elapsed, 200, 350, Color::red);
			rect.draw(Color::red)
		} else {
			//cnvs.var(frame_elapsed, 200, 350, Color::green);
			rect.draw(Color::green)
		}

		cnvs.flip();

		current.update();
		frame_current = current.at_msec();
		frame_elapsed = frame_current - frame_before;
		frame_before = frame_current;
		if (frame_elapsed > (1.8 * flip_interval_msec) && frame > 1) {
			dropframe_realtime += Math::round(frame_elapsed / flip_interval_msec);
			dropped = true;
		} else {
			dropped = false;
		}

		if(Keyboard::esc.pushed()) {
			break; // [end loop]
		}
	}
	// [end loop]

	after.update();

	double elapsed = after.at_msec() - before.at_msec();
	double expected = frame * (1000.0 / cnvs.getRefreshRate());
	dropframe_total = Math::round((elapsed - expected) / flip_interval_msec);


	// [begin finished]
	while (true) {
		cnvs.clear(Color::white);


		cnvs.msg("Counted Flips", 200, 100);
		cnvs.var(frame, 400, 150);

		cnvs.msg("Expected Time", 200, 200);
		cnvs.var(expected, 400, 250);

		cnvs.msg("Elapsed Time", 200, 300);
		cnvs.var(elapsed, 400, 350);

		cnvs.msg("Dropframe (realtime count)", 200, 400);
		cnvs.var(dropframe_realtime, 400, 450);

		cnvs.msg("Dropframe (retrospective count)", 200, 500);
		cnvs.var(dropframe_total, 400, 550);

		cnvs.flip();

		if (Keyboard::esc.pushed()) {
			break; // [end finished]
		}
	}
	// [end finished]
}