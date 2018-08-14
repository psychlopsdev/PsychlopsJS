#include <psychlops.h>
using namespace Psychlops;


 	void psychlops_main() {
 	 int imageHsize = 200;  
     int imageVsize = 200;  
     double R, G, B;
     double env;
	 double _i, _j, sd;
	 double sfreq, orientation, contrast, phase, lum;

	 Canvas window(Canvas::window);
     Psychlops::Image img; 
     Psychlops::Rectangle centerrect(10,10);
     Psychlops::Color dotcol, figurecol;
     Psychlops::Rectangle figurerect(imageHsize, imageVsize);
		
 	 img.set(imageHsize, imageVsize); 
     orientation = 30 * PI / 180.0; 
     contrast = 0.75; 
     phase = PI ; 
     sfreq = 1.0/30.0;

     for(int i=0; i  < imageHsize; i++){
         for(int j=0; j  < imageVsize; j++){
 	          _i = i-imageHsize*0.5; 
          _j = j-imageVsize*0.5; 
          sd = imageVsize/8; 
          env=exp(-(_i*_i+_j*_j)/(2.0*(sd*sd)) ); 
 	      lum = contrast * sin(2*PI*sfreq*(_i*sin(orientation)+_j*cos(orientation))+phase); 
          img.pix(i,j, dotcol.set(0.5*(1+lum*env)));
         }
    }

    img.cache(); 
    img.centering(); 
    img.shift(100,100); 
    centerrect.centering();
    figurerect.centering().shift(100,100);
 	
    while(!Keyboard::esc.pushed()){
 	    window.clear(Color::black); 
        img.draw(); 
        centerrect.draw(Color::red);
        if(Keyboard::spc.pressed())figurerect.draw(figurecol.set(1.0,0.25,0.25, 0.2)); 
        window.flip();
    }
}