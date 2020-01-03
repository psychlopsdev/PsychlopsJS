

//Psychlops Code Template
//    Please visit following web site to get sample codes.
//    http://psychlops.sourceforge.jp/ja/?StartCode
//    CodeDresser at following address is also available to view the code.
//    http://visitope.org/Tools/codedresser.html

///+ 0 Setup Psychlops Circumstances
//// 0 Setup Psychlops Circumstances
#include <psychlops.h>
using namespace Psychlops;
// Psychlops Win32 1.7.0 / 20150205
///- 0 Setup Psychlops Circumstances

void psychlops_main() {
	AppInfo::expname = "MullerLyer";

	///+ 1 Declaration /////////////////////////////////////////////////////////////
	//// 1 Declaration
	// declare default window and variables for its parameters
	//Canvas cnvs(500,500, Canvas::window);
	Canvas cnvs;
	cnvs.antialiased = true;
	cnvs.set(800, 600, Canvas::window);
	double cnvsW = cnvs.getWidth();
	double cnvsH = cnvs.getHeight();
	//declare local variables around here

	///- 1 Declaration /////////////////////////////////////////////////////////////

	///+ 2 Initialization //////////////////////////////////////////////////////////
	//// 2 Initialization

	// Set initial values for local variables
	double CANVAS_REFRESHRATE = cnvs.getRefreshRate();
	double CANVAS_FRAMENUM = 0;
	Psychlops::Color DEFAULT_BG_COLOR(127.0 / 255.0, 127.0 / 255.0, 127.0 / 255.0, 1.0);

	double font_size = 24;
	Font::default_font.size = font_size;

	// Draw Offline images around here
	Psychlops::Letters L01("Adjust the length of the right line", font_size);
	Psychlops::Letters L02("so that the two lines look the same length.", font_size);
	Psychlops::Letters L03("Push the button to start trial.", font_size);
	Psychlops::Letters L04("When adjustment is complete, press the 'OK' button", font_size);
	Psychlops::Widgets::Button startbutton("Start", 60);
	Psychlops::Widgets::Button endbutton("Abort", 60);
	Psychlops::Widgets::Button rightbutton("Extend", 40);
	rightbutton.area.set(140, 70);
	Psychlops::Widgets::Button leftbutton("Shrink", 40);
	leftbutton.area.set(140, 70);
	Psychlops::Widgets::Button rightbutton2("Extend much", 40);
	rightbutton2.area.set(140, 100);
	Psychlops::Widgets::Button leftbutton2("Shrink much", 40);
	leftbutton2.area.set(140, 100);
	Psychlops::Widgets::Button setbutton(" OK ", 60);
	setbutton.area.set(240, 100);
	Psychlops::Widgets::Button downloadbutton("Download the results file", 60);

	Psychlops::Letters L001, L002;
	L001.str = "Finished Trial/";
	L002.str = "Trial";

	// Offline Movie calculation using Image array around here
	double trial_angle[256];
	double trial_length[256];
	int trial_number[256];
	double trial_time[256];

	///- 2 Initialization //////////////////////////////////////////////////////////
	///+ 3 Drawing /////////////////////////////////////////////////////////////////
	//// 3 Drawing

	///training

	double lineH = 2;
	double main_lineW = 240; //Lleft
	double main_lineW2 = 240;//Lright
	double ll;
	double angle;
	double stimY = -60;
	ll = main_lineW * 0.25;　// Length of slantline: 80 pixel

	int anglecondnum = 5;
	double anglecond[5];
	anglecond[0] = 30;
	anglecond[1] = 60;
	anglecond[2] = 90;
	anglecond[3] = 120;
	anglecond[4] = 150;

	int lengthcondnum = 2;
	double series_cond[2];
	series_cond[0] = -1; //upper series
	series_cond[1] = 1; //lower series

	int repetition = 1;
	int totaltrialnum = anglecondnum * lengthcondnum*repetition * 2;

	int trialseed[1024];
	for (int i = 0; i < totaltrialnum; i++) { trialseed[i] = i; }
	int a;
	int tmp;
	for (int i = 1; i < totaltrialnum; i++) {
		a = Psychlops.random(i + 1);
		tmp = trialseed[i];
		trialseed[i] = trialseed[a];
		trialseed[a] = tmp;
	}

	Psychlops::Rectangle main_lineL(main_lineW, lineH);
	main_lineL.centering().shift(-main_lineW * 0.5, stimY);

	Psychlops::Rectangle main_lineR(main_lineW2, lineH);
	main_lineR.centering().shift(main_lineW2*0.5, stimY);


	Psychlops::Color mainlinecol(0, 0, 0, 1);
	Psychlops::Color mainlinecol2(0, 0, 0, 1);
	Psychlops::Color textcol(0.1, 0.1, 0.1, 1.0);

	Psychlops::Color testpalett[4];
	testpalett[0].set(1, 0, 0, 0.05);
	testpalett[1].set(0, 1, 0, 0.05);
	testpalett[2].set(0, 0, 1, 0.05);
	testpalett[3].set(0, 0, 0, 0.05);

	Psychlops::Ellipse slantorg(lineH, lineH);


	//TRAININGS---------------------------------------------------
	while (!startbutton.pushed()) {

		cnvs.clear(Color::white);

		//Interactions
		if (rightbutton.pushed() && main_lineW2 < main_lineW*1.505) { main_lineW2 += lineH * 5; }
		if (leftbutton.pushed() && main_lineW2 > main_lineW*0.495) { main_lineW2 -= lineH * 0.5; }
		if (rightbutton2.pushed() && main_lineW2 < main_lineW*1.505) { main_lineW2 += lineH * 5; }
		if (leftbutton2.pushed() && main_lineW2 > main_lineW*0.495) { main_lineW2 -= lineH * 0.5; }
		main_lineR.resize(main_lineW2, lineH);
		main_lineR.centering().shift(main_lineW2*0.5, stimY);
		//Interactions

		//Stimulus drawing
		for (int i = 0; i < 4; i++) {
			angle = 90 * PI / 180;
			for (double l = 0; l < ll; l++) {
				slantorg.centering(main_lineL.getLeft() + l * cos(angle) + lineH * 0.5, main_lineL.getCenter().y - l * sin(angle)).draw(testpalett[i]);
				slantorg.centering(main_lineL.getLeft() + l * cos(angle) + lineH * 0.5, main_lineL.getCenter().y + l * sin(angle)).draw(testpalett[i]);
				slantorg.centering(main_lineL.getRight() + l * cos(PI - angle) + lineH * 0.5, main_lineL.getCenter().y - l * sin(PI - angle)).draw(testpalett[i]);
				slantorg.centering(main_lineL.getRight() + l * cos(PI - angle) + lineH * 0.5, main_lineL.getCenter().y + l * sin(PI - angle)).draw(testpalett[i]);
				slantorg.centering(main_lineR.getRight() + l * cos(angle) + lineH * 0.5, main_lineL.getCenter().y - l * sin(angle)).draw(testpalett[i]);
				slantorg.centering(main_lineR.getRight() + l * cos(angle) + lineH * 0.5, main_lineL.getCenter().y + l * sin(angle)).draw(testpalett[i]);
			}
		}

		main_lineL.draw(mainlinecol);
		main_lineR.draw(mainlinecol2);
		//Stimulus drawing

		//Interface drawing
		rightbutton.centering(cnvsW*0.5 + 120, cnvsH*0.5 + 120).draw();
		leftbutton.centering(cnvsW*0.5 - 120, cnvsH*0.5 + 120).draw();
		rightbutton2.centering(cnvsW*0.5 + 300, cnvsH*0.5 + 120).draw();
		leftbutton2.centering(cnvsW*0.5 - 300, cnvsH*0.5 + 120).draw();
		startbutton.centering(cnvsW*0.5, cnvsH*0.5 + 250).draw();
		L01.centering(cnvsW*0.5, cnvsH*0.5 + stimY - 200).draw(textcol);
		L02.centering(cnvsW*0.5, cnvsH*0.5 + stimY - 160).draw(textcol);
		L04.centering(cnvsW*0.5, cnvsH*0.5 + stimY - 120).draw(textcol);
		//Interface drawing

		cnvs.flip();
		CANVAS_FRAMENUM++;
	}


	//MAIN TRIALS--------------------------------------------------------
	stimY -= 60;
	main_lineL.centering().shift(-main_lineW * 0.5, stimY);
	int trialnum = 0;
	int trialkey;
	int itemp;
	double dtemp;
	double results[5][128];

	while (trialnum < totaltrialnum) {
		trialkey = trialseed[trialnum];
		//trial_number[trialnum]= trialnum;
		results[0][trialnum] = trialnum + 1;

		itemp = trialkey % anglecondnum;
		angle = anglecond[itemp] * PI / 180;
		results[1][trialnum] = anglecond[itemp];

		itemp = floor(trialkey / anglecondnum) % lengthcondnum;
		main_lineW2 = main_lineW + series_cond[itemp] * main_lineW *  (random(0.2)+0.3);
		results[2][trialnum] = main_lineW2;



		if (series_cond[itemp] > 0)main_lineW2 = main_lineW2 - 0.0*random(0.5);
		else main_lineW2 = main_lineW2 + 0.0*random(0.5);


		while (!startbutton.pushed()) {
			cnvs.clear(Color::white);
			cnvs.var(trialnum, 30, 70);
			L001.centering(110, 50).draw(Color::gray);
			cnvs.var(totaltrialnum, 170, 70);
			L002.centering(230, 50).draw(Color::gray);
			L03.centering().draw(textcol);
			startbutton.centering(cnvsW*0.5, cnvsH*0.5 + 250).draw();
			cnvs.flip();
		}

		CANVAS_FRAMENUM = 0;

		while (!setbutton.pushed()) {
			cnvs.clear(Color::white);

			//Interactions
			if (rightbutton.pushed() && main_lineW2 < main_lineW * 2) { main_lineW2 += lineH * 0.5; }
			if (leftbutton.pushed() && main_lineW2 > main_lineW*0.25) { main_lineW2 -= lineH * 0.5; }
			if (rightbutton2.pushed() && main_lineW2 < main_lineW * 2) { main_lineW2 += lineH * 5; }
			if (leftbutton2.pushed() && main_lineW2 > main_lineW*0.25) { main_lineW2 -= lineH * 5; }
			main_lineR.resize(main_lineW2, lineH);
			main_lineR.centering().shift(main_lineW2*0.5, stimY);
			//Interactions

			//Stimulus drawing
			for (double l = 0; l < ll; l++) {
				slantorg.centering(main_lineL.getLeft() + l * cos(angle) + lineH * 0.5, main_lineL.getCenter().y - l * sin(angle)).draw(Color::black);
				slantorg.centering(main_lineL.getLeft() + l * cos(angle) + lineH * 0.5, main_lineL.getCenter().y + l * sin(angle)).draw(Color::black);
				slantorg.centering(main_lineL.getRight() + l * cos(PI - angle) + lineH * 0.5, main_lineL.getCenter().y - l * sin(PI - angle)).draw(Color::black);
				slantorg.centering(main_lineL.getRight() + l * cos(PI - angle) + lineH * 0.5, main_lineL.getCenter().y + l * sin(PI - angle)).draw(Color::black);
				slantorg.centering(main_lineR.getRight() + l * cos(angle) + lineH * 0.5, main_lineL.getCenter().y - l * sin(angle)).draw(Color::black);
				slantorg.centering(main_lineR.getRight() + l * cos(angle) + lineH * 0.5, main_lineL.getCenter().y + l * sin(angle)).draw(Color::black);
			}
			main_lineL.draw(mainlinecol);
			main_lineR.draw(mainlinecol2);
			//Stimulus drawing

			//Interface drawing
			rightbutton.centering(cnvsW*0.5 + 120, cnvsH*0.5 + 120).draw();
			leftbutton.centering(cnvsW*0.5 - 120, cnvsH*0.5 + 120).draw();
			rightbutton2.centering(cnvsW*0.5 + 300, cnvsH*0.5 + 120).draw();
			leftbutton2.centering(cnvsW*0.5 - 300, cnvsH*0.5 + 120).draw();
			setbutton.centering(cnvsW*0.5, cnvsH*0.5 + 250).draw();
			//Interface drawing

			cnvs.flip();
			CANVAS_FRAMENUM++;

			results[3][trialnum] = main_lineW2;
		}

		results[4][trialnum] = Math.round(CANVAS_FRAMENUM / CANVAS_REFRESHRATE * 1000); //in msec

		trialnum++;
	}
	//MAIN TRIALS--------------------------------------------------------



	//Results--------------------------------------------------------
	double average[5], aveflag[5];
	for (int i = 0; i < 5; i++) { average[i] = 0; aveflag[i] = 0; }
	for (int j = 0; j < totaltrialnum; j++) {
		switch (results[1][j]) {
		case 30:
			average[0] = average[0] + results[3][j];
			aveflag[0] = aveflag[0] + 1;
			break;
		case 60:
			average[1] = average[1] + results[3][j];
			aveflag[1] = aveflag[1] + 1;
			break;
		case 90:
			average[2] = average[2] + results[3][j];
			aveflag[2] = aveflag[2] + 1;
			break;
		case 120:
			average[3] = average[3] + results[3][j];
			aveflag[3] = aveflag[3] + 1;
			break;
		case 150:
			average[4] = average[4] + results[3][j];
			aveflag[4] = aveflag[4] + 1;
			break;
		}
	}
	for (int i = 0; i < 5; i++) { average[i] = average[i] / aveflag[i]; }

	cnvs.clear(Color::white);
	cnvs.flip();
	double tableW = 180;

	Psychlops.File.saveToLocalFile = false;
	Data::savearray("ML_%TIME_.txt", "Trial,Angle,Series,PSE,RT_Msec", totaltrialnum, results[0], results[1], results[2], results[3], results[4]);
	Psychlops.File.saveToIndexDB = true;
	Psychlops.File.saveToLocalFile = true;

	while (!endbutton.pushed()) {

		cnvs.clear(Color::white);

		//Interface drawing
		endbutton.centering(cnvsW*0.5, cnvsH*0.5 + 280).draw();
		//Interface drawing

		downloadbutton.centering().draw();
		if (downloadbutton.pushed()) {
			Data::savearray("MLDATA_%TIME_.txt", "Trial,Angle,Series,PSE,RT_Msec", totaltrialnum, results[0], results[1], results[2], results[3], results[4]);
		}

		cnvs.flip();
		CANVAS_FRAMENUM++;
	}
	//Results--------------------------------------------------------

	///- 3 Drawing /////////////////////////////////////////////////////////////////


}
