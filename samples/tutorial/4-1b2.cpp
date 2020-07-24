#include <psychlops.h>
using namespace Psychlops;


void psychlops_main() {
    Canvas window(Canvas::window);
    Psychlops::Image img; 
    Psychlops::Rectangle centerrect(10,10);
    Psychlops::Rectangle figurerect;
    Psychlops::Color dotcol, figurecol;

    int imageHsize = 200;  
    int imageVsize = 200;  
    double R, G, B;
    double env;
    double _i, _j, sd;

	figurerect.set(imageHsize,imageVsize);
    img.set(imageHsize, imageVsize); 

    for(int i=0; i  < imageHsize; i++){
        for(int j=0; j  < imageVsize; j++){
            _i = i-imageHsize*0.5; 
            _j = j-imageVsize*0.5; 
            sd = imageVsize/6; 
            env=exp(-(_i*_i+_j*_j)/(2.0*(sd*sd)) ); 
            R=Psychlops::random(); 
            G=Psychlops::random(); 
            B=Psychlops::random(); 

            img.pix(i,j, dotcol.set(env*R, env*G, env*B));
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