#include <psychlops.h>
using namespace Psychlops;

void psychlops_main() {
	Canvas window(Canvas::window);
	Psychlops::Image img; 
	Psychlops::Rectangle centerrect(10,10);
	int imageHsize = 200;  
	int imageVsize = 200;  
	double R,　G,　B;
	Psychlops::Color dotcol;


	img.set(imageHsize, imageVsize); 

	for(int i=0; i < imageHsize; i++){
		for(int j=0; j < imageVsize; j++){
			R=Psychlops::random() * 0.5; 
			G=Psychlops::random() * 0.5; 
			B=Psychlops::random() * 0.5; 
			img.pix(i,j, dotcol.set(R,G,B));
			centerrect.centering();
		}
	}

	img.cache(); 
    
    Widgets::Button downloadButton;
    downloadButton.set("Save the image.");
    downloadButton.shift(10,10);

	while(!Keyboard::esc.pushed()){
		window.clear(Color::black); 
		img.centering(); 
		img.shift(100,100); 
		img.draw(); 
		centerrect.draw(Color::red);

		downloadButton.draw();
        if(downloadButton.pushed()) {
            img.save("psychlops_image_save_demo.png");
        }

		window.flip();
	}

}