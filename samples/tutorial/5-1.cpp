#include <psychlops.h>
using namespace Psychlops;

void psychlops_main() {
	Canvas window(Canvas::window);
	Psychlops::Image img;
	Psychlops::Rectangle centerrect(10,10);

	img.load("samples/flower.png");
	img.cache(); 
    
	while(!Keyboard::esc.pushed()){
		window.clear(Color::black); 
		img.centering(); 
		img.shift(100,100); 
		img.draw(); 
		centerrect.draw(Color::red);

		window.flip();
	}

}