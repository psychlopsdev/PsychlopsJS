#include <psychlops.h>;
using namespace Psychlops;


 	void psychlops_main() {
		
	int imageHsize = 100;  
    int imageVsize = 100;  
    double R, G, B;
    double env;
	double _i, _j, sd;
	int frame=0;
	int imageframe = 0;
		
 	Canvas window(Canvas::window);
    const int imagenumber = 128; 
    Psychlops::Image img[128]; 
    Psychlops::Rectangle centerrect(10,10);
	Psychlops::Color dotcol, figurecol;
    Psychlops::Rectangle figurerect(imageHsize, imageVsize);

 	centerrect.centering();
 	
		for (int k=0; k<imagenumber; k++){
        img[k].set(imageHsize, imageVsize); 
    }

 	    for(int i=0; i < imageHsize; i++){
        for(int j=0; j < imageVsize; j++){
 	            _i = i-imageHsize*0.5; 
            _j = j-imageVsize*0.5; 
            sd = imageVsize/6; 
            env=exp(-(_i*_i+_j*_j)/(2.0*(sd*sd)) ); 

            for (int k=0; k<imagenumber; k++){
               R=Psychlops::random(); 
          	   G=Psychlops::random(); 
          	   B=Psychlops::random(); 
               img[k].pix(i,j, dotcol.set(env*R,env*G,env*B));

            }
        }
    }

 	    for (int k=0; k<imagenumber; k++){
        img[k].cache(); 
        img[k].centering().shift(100,100);
    }

 	   
    
	while(!Keyboard::esc.pushed()){
		frame++;
		if(frame % 3 == 0){ imageframe++;}
        imageframe = imageframe % imagenumber; 
        window.clear(Color::black); 
        img[imageframe].draw(); 
        centerrect.draw(Color::red);
        if(Keyboard::spc.pressed())figurerect.draw(figurecol.set(1.0,0.25,0.25, 0.2)); 

        window.flip();
    }

}