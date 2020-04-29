#include <psychlops.h>
using namespace Psychlops;


void psychlops_main() {

	Canvas window(Canvas::window);

	///+ initialize conditions and results variables
	//// for typical constant method setup.
	const int MAX_TRIALS = 30;
	double condition[MAX_TRIALS];
	double answer[MAX_TRIALS];
	double reaction_time[MAX_TRIALS];
	
	for(int i=0; i<MAX_TRIALS; i++) {
		condition[i] = i % 2;
		answer[i] = -1;
		reaction_time[i] = -1;
	}
	Math::shuffle(condition, MAX_TRIALS);
	///- initialize conditions and results variables

	///+ initialize stimuli
	Rectangle box_stimuli[2];
	box_stimuli[0].set(100,100).centering().shift(-100, 0);
	box_stimuli[1].set(100,100).centering().shift( 100, 0);

	Color box_color[2];
	box_color[0].set(1.0, 0.5, 0.0); // orange
	box_color[1].set(0.0, 1.0, 1.0); // cyan
	///- initialize stimuli

	///+ initialize instructions
	Letters instructions[2];
	instructions[0].setString("Answer place of orange box by left or right key");
	instructions[1].setString("as quick as you can.");
	instructions[0].centering(window.getHcenter(), 100);
	instructions[1].centering(window.getHcenter(), 150);

    Widgets::Button downloadButton;
    downloadButton.set("Push this button to save the results.");
    downloadButton.centering();
	///- initialize instructions

	///+ initialize misc
	Clock before, after;
	///- initialize misc

	///+ set variables by conditions for each trial
	int col1 = 0;
	int col2 = 0;
	///- set variables by conditions for each trial
		
	///+ session loop
	for(int trial=0; trial<MAX_TRIALS; trial++) {

		col1 = condition[trial];
		col2 = 1-col1;

		///+ blanking
		for(int g=0; g<60; g++) {
		
			window.clear();

			instructions[0].draw(Color::white);
			instructions[1].draw(Color::white);

			window.flip();
		}
		///- blanking
		
		before.update();

		///+ main displaying
		while(!Keyboard::spc.pushed()){
			window.clear();
			
			box_stimuli[0].draw(box_color[col1]);
			box_stimuli[1].draw(box_color[col2]);

			if(Keyboard::left.pushed()) {
				answer[trial] = 0;
				break;
			}
			if(Keyboard::right.pushed()) {
				answer[trial] = 1;
				break;
			}
			
			window.flip();	
			
		}
		///+ main displaying

		after.update();
		reaction_time[trial] = after.at_msec() - before.at_msec();
	}
	///- session loop

	///+ save results
	while(!Keyboard::esc.pushed()){
		window.clear();

		downloadButton.draw();
        if(downloadButton.pushed()) {
            Data::savearray("data.csv", "condition, RT, left0/right1", MAX_TRIALS, condition, reaction_time, answer);
        }

		window.flip();
	}
	///- save results

}