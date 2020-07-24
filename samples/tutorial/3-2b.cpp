#include <psychlops.h>
using namespace Psychlops;

void psychlops_main() {
 	Canvas window(Canvas::window);
	Image img; 
	Psychlops::Rectangle centerrect;
	Psychlops::Color dotcol;
	int imageHsize = 60;  
	int imageVsize = 60;  
	double R, G, B;
	
	img.set(60,60); 

	for(int i=0; i < imageHsize; i++) {
		for(int j=0; j < imageVsize; j++) {
			R = Psychlops::random(1.0) * 0.5; 
			G = Psychlops::random(1.0) * 0.5; 
			B = Psychlops::random(1.0) * 0.5; 
			img.pix(i,j, dotcol.set(R, G, B));
		}
	}
	img.cache();
		
	while(!Keyboard::esc.pushed()) {
		window.clear(Color::black); 
		img.centering(); 
		img.shift(100,100); 
		img.draw();  
		window.flip();
	}

}