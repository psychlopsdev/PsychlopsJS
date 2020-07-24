#include <psychlops.h>;
using namespace Psychlops;


void psychlops_main() {

    Canvas window(Canvas::window);
    const int imagenumber = 128; 
    Psychlops::Image img[128]; 
    Psychlops::Rectangle centerrect(10,10);
    Psychlops::Color dotcol;
    int imageHsize = 100;  
    int imageVsize = 60;  
    double R, G, B;
    int frame = 0;
    int imageframe = 0;

    centerrect.centering();

    for (int k=0; k<imagenumber; k++){
        img[k].set(imageHsize, imageVsize); 
        for(int i=0; i <imageHsize; i++){
            for(int j=0; j < imageVsize; j++){
                R = Psychlops::random(); 
                G = Psychlops::random(); 
                B = Psychlops::random(); 
                img[k].pix(i,j, dotcol.set(R,G,B));
            }
        }
        img[k].cache(); 
        img[k].centering().shift(100,100);
    }


    while(!Keyboard::esc.pushed()) {
        frame++;
        if(frame % 20 == 0){ imageframe++; }
        imageframe = imageframe % imagenumber; 
        window.clear(Color::black); 
        img[imageframe].draw(); 
        centerrect.draw(Color::red);
        window.flip();
    }
}