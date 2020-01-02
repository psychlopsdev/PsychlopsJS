#include <psychlops.h>
using namespace Psychlops;

void psychlops_main() {
	Canvas window(Canvas::window);


	const int MAX_TRIALS = 10;

	// initialize independent and dependent variables
	double condition[MAX_TRIALS];
	double results[MAX_TRIALS];
	for(int i=0; i<MAX_TRIALS; i++) {
		condition[i] = i;
		results[i] = random(10);
	}
	Math::shuffle(condition, MAX_TRIALS);



    Widgets::Button downloadButton;
    downloadButton.set("Push this button to save the results.");
    downloadButton.centering();



	while(!Keyboard::esc.pushed()){
		window.clear();

		downloadButton.draw();
        if(downloadButton.pushed()) {
            Data::savearray("data.csv", "condition, results", MAX_TRIALS, condition, results);
        }

		window.flip();
	}

}