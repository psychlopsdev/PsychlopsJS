#include <psychlops.h>
using namespace Psychlops;

void psychlops_main() {
	Canvas window(Canvas::window); 

	Psychlops::Rectangle figure; 

	while(!Keyboard::esc.pushed()) {  
		figure.set( 100, 100 ); 
		figure.centering();   
		figure.shift( 10, 10 ); 
		figure.draw( Color( 1, 0, 0) ); 
		window.flip(); 
	} 

}