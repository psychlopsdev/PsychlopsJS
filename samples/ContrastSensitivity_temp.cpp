#include <psychlops.h>
using namespace Psychlops;

void psychlops_main() {
	AppInfo::expname = "TemporalContrastSensitivity";

	Canvas::useNoisyBit(true); // This function must be called before the declaration of Canvas instance.
	Canvas cnvs(Canvas::fullscreen);
	Widgets::Theme::setLightTheme();
	Color::setGammaValue();
	double pxr = cnvs.getPixelRatio();
	double cnvs_nominal_scale = cnvs.getHeight() / 2048;
	double cnvs_scale_base = 1; if(cnvs.getHeight()/pxr < 900) { cnvs_scale_base = 0.75; } if(cnvs.getHeight()/pxr < 641) { cnvs_scale_base = 0.5; }
	double cnvs_scale = pxr * cnvs_scale_base;
	double zoom_base = cnvs_scale * 100 / 2;
	Psychlops::Canvas::Geometry geo(50.0, 19.71, 14.783, cnvs); // iPad Air 1/2

	Color background_color(127.0 / 255.0);

	Clock exam_start, exam_end, before, after;
	double elapsed_time = 0;

	const int MAX_PROGRESS = 8;

	double distance = 40;
	double pixel_per_cm = 100;

	const int MAX_NUM = 2;
	double GRID_SIZE = 300;


	const int TEMP_FREQ_NUM = 3;
	double temp_freq[TEMP_FREQ_NUM] = { 1.0 / 1, 1.0 / 4.0, 1.0 / 16.0 };
	const int WAVE_LENGTH_NUM = 2;
	double wavelength[WAVE_LENGTH_NUM] = { 64, 8 };
	const int ITERATION = 1;

	const int TRIAL_NUM = ITERATION*TEMP_FREQ_NUM*WAVE_LENGTH_NUM;
	int condition[TRIAL_NUM];
	for (int i = 0; i < TRIAL_NUM; i++) { condition[i] = i;  }
	Math::shuffle(condition, TRIAL_NUM);
	double temp_freqs[TRIAL_NUM];
	double wavelengths[TRIAL_NUM];
	double spatial_freqs[TRIAL_NUM];
	double results[TRIAL_NUM];
	double raw_rt[TRIAL_NUM];


	Figures::ShaderGabor gbr;
	gbr.setSigma(64 * cnvs_scale);
	gbr.wavelength = 30;
	gbr.contrast = 1;
	gbr.orientation = PI / 2;// Psychlops::random() * 2 * PI;
	gbr.phase = 0;

	Line noise_bar[1000];

	double font_size = 30 * cnvs_scale;

	Letters instruction1(L"Adjust contrast to the visible limit by dial.", font_size);
	Letters instruction2(L"Push 'next' button when contrast is adjusted.", font_size);
	instruction1.centering().shift(0, -font_size * 10);
	instruction2.centering().shift(0, -font_size * 9);


	Letters instruction_finish(L"，");
	instruction_finish.centering().shift(0, -50);

	Widgets::Button button_incomprehensible, button_stop, button_next;
	Image buttonlabels[7];
	buttonlabels[4].load("images/button/button_incomprehensible.png");
	buttonlabels[5].load("images/button/button_stop.png");
	buttonlabels[6].load("images/button/button_next.png");
	for(int i=0; i<7; i++) { buttonlabels[i]._zoom_(zoom_base); }
	button_incomprehensible.set(buttonlabels[4]).centering().shift(0, 0);
	button_stop.set(buttonlabels[5]).centering(cnvs.getHcenter(), buttonlabels[5].targetarea_.getHeight() / 2);
	button_next.set(buttonlabels[6]).centering(cnvs.getHcenter(), cnvs.getHeight() - buttonlabels[5].targetarea_.getHeight() / 2);
	button_next.toggle(false);
	
	Widgets::Dial dial;
	dial.set(300 * cnvs_scale, 50 * cnvs_scale).centering(cnvs.getHcenter(), cnvs.getHeight() - buttonlabels[5].targetarea_.getHeight()*2);
	dial.window_range = 1.0 / 4;
	dial.range.begin = -3;
	dial.range.end = 0;

	Widgets::ProgressBar progress_bar;
	progress_bar.set(100, 10);

	bool clicked = false;
	bool first = false;

	int frames = 0;
	int progress = 0;
	double temporal_freq = 0;


	exam_start.update();

	dial.setInitialValue(-0.5);
	// [begin instruction]
	while (true) {
		if (Keyboard::esc.pushed()) {
			exit(0);
		}
		if (button_next.pushed()) {
			break;//endloop
		}
		cnvs.clear(background_color);

		gbr.contrast = pow(10, dial.getValue());
		gbr.centering().draw();
		instruction1.draw();
		instruction2.draw();

		dial.draw();
		button_next.draw();

		cnvs.flip();
	}
	// [end instruction]

	// [begin session_loop]
	while (true) {
		if (progress >= TRIAL_NUM) {
			break;//endloop
		}


		frames = 0;
		gbr.wavelength = wavelength[
			floor(
				floor(condition[progress] / ITERATION)
			/ TEMP_FREQ_NUM)];
		temporal_freq = temp_freq[floor(condition[progress] % TEMP_FREQ_NUM)];
		temp_freqs[progress] = 1.0 / temporal_freq;
		wavelengths[progress] = gbr.wavelength;
		spatial_freqs[progress] = 1.0 / geo.calc(gbr.wavelength, "px", "arcdeg");
		dial.setInitialValue(-1);

		gbr.setSigma(128 + 2 * gbr.wavelength);


		// [begin blank]
		for (int i = 0; i < 1000; i++) {
			noise_bar[i].set(cnvs.getWidth() * random() * 0.25, cnvs.getHeight() * random() * 0.25, cnvs.getWidth() * random() * 0.25, cnvs.getHeight() * random() * 0.25);
			noise_bar[i].stroke.color.set(random());
			noise_bar[i].shift(cnvs.getWidth() * (random() * 0.5 + 0.125), cnvs.getHeight() * (random() * 0.5 + 0.125));
		}
		for (int g = 0; g < 60; g++) {
			cnvs.clear(background_color);
			for (int i = 0; i < 1000; i++) {
				noise_bar[i].draw();
			}
			cnvs.flip();
		}
		// [end blank]

		before.update();

		button_next.toggle(false);
		// [begin trial_loop]
		while (true) {

			cnvs.clear(background_color);
			if (Keyboard::esc.pushed()) {
				break;//endloop
			}

			gbr.contrast = cos(2 * PI * frames / cnvs.getRefreshRate() / temporal_freq) *  pow(10, dial.getValue());
			gbr.centering().draw();

			dial.draw();
			button_next.draw();
			if (button_next.pushed()) {
				results[progress] = 1.0 / pow(10, dial.getValue());
				after.update();
				raw_rt[progress] = (after.at_msec() - before.at_msec()) / 1000.0;
				break;//endloop
			}

			progress_bar.setValue(progress, 6);
			progress_bar.draw();

			button_stop.draw(); if (button_stop.pushed()) { exit(0); }
			cnvs.flip();
			frames++;
		}
		// [end trial_loop]

		progress++;

	}
	// [end session_loop]

	exam_end.update();
	double elapsed_time = (exam_end.at_msec() - exam_start.at_msec()) / 1000.0;

	char tmp_header[255];
	//sprintf(tmp_header, "Elapsed,%.1f\r\ntemporal_freq,wavelengths,results,RT", elapsed_time);
	sprintf(tmp_header, "Name, %s\r\nAge, %s\r\nGender, %s\r\nEye, %s\r\nElapsed,%.1f\r\n----\r\ntemporal_freq,wavelengths,results,RT", AppInfo::participant_attr.name, AppInfo::participant_attr.age, AppInfo::participant_attr.gender, AppInfo::participant_attr.eye, elapsed_time);

	Data::savearray("%EXPNAME_%TIME_.txt", tmp_header, TRIAL_NUM, temp_freqs, spatial_freqs, results, raw_rt);


	// [begin thanks]
	while (!Keyboard::esc.pushed()) {
		cnvs.clear(background_color);

		if (Mouse::left.pushed()) {
			break;//endloop
		}

		cnvs.flip();
	}
	// [end thanks]
}
