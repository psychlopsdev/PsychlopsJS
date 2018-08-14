#include <psychlops.h>;
using namespace Psychlops;


 	void psychlops_main() {

	 const int imagenumber = 128; 
	 int imageHsize = 200;  
     int imageVsize = 200;  
	 int frame=0;
     int imageframe = 0;
	 int refreshtime = 1;
     double _i, _j, sd, env;
     double sfreq, orientation, contrast, phase, lum;
	
 	 Canvas window(Canvas::window);
     
     Psychlops::Image img[128]; 
     Psychlops::Rectangle centerrect(10,10);
     Psychlops::Color dotcol, figurecol;

 	 centerrect.centering();
 	 for (int k=0; k<imagenumber; k++){
         img[k].set(imageHsize, imageVsize); 
     }

 	 for(int i=0; i <imageHsize; i++){
         for(int j=0; j < imageVsize; j++){

            _i = i-imageHsize*0.5; 
            _j = j-imageVsize*0.5; 

 	        sd = imageVsize/8; 
            env=exp(-(_i*_i+_j*_j)/(2.0*(sd*sd)) ); 

              for (int k=0; k<imagenumber; k++){
 	             orientation = 30.0 * PI / 180.0; 
                  contrast = 1; 
                  phase = (double)k * 5*(2.0/128.0) * PI ; 
                  sfreq = 1.0/30.0;
                  lum = contrast * sin(2*PI*sfreq*(_i*sin(orientation)+_j*cos(orientation))+phase); 
                  img[k].pix(i,j, dotcol.set(0.5*(1+lum*env)));
                  }
            }
         }

 	    for (int k=0; k<imagenumber; k++){
            img[k].cache(); 
            img[k].centering().shift(100,100);
        }

	 while(!Keyboard::esc.pushed()){
        if(frame % refreshtime == 0){ imageframe++;}
        imageframe = imageframe % imagenumber; 
        window.clear(Color::black); 
        img[imageframe].draw(); 
        centerrect.draw(Color::red);
        window.flip();
		 frame++;
    }
}