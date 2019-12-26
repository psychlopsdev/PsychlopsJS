#include <psychlops.h>
using namespace Psychlops;

void psychlops_main() {
	Canvas window(Canvas::fullscreen); 

	Psychlops::Letters instruction("Press esc to end the program."); 

	while(!Keyboard::esc.pushed()) {  
		window.clear();
		instruction.centering();
		instruction.draw( Color::white ); 
		window.flip(); 
	} 

}