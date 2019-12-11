#include <psychlops.h>
using namespace Psychlops;


    void psychlops_main() {

    const int maxrectnum = 300;
    int rectnum = 300;
    double rectsize = 3;
    Psychlops::Rectangle rect[maxrectnum];
    double rectcolorR[maxrectnum];
    double rectcolorG[maxrectnum];
    double rectcolorB[maxrectnum];
    double noisefield_Hsize = 200;
    double noisefield_Vsize = 200;
    double tempcol;

    Canvas window(Canvas::window);

    for(int i=0; i < rectnum; i++) {

        rect[i].set(rectsize, rectsize); 
        rect[i].centering();
        rect[i].shift((random(noisefield_Hsize) - 0.5 * noisefield_Hsize),
                      (random(noisefield_Vsize) - 0.5 * noisefield_Vsize)); 

        tempcol=Psychlops::random();
        rectcolorR[i]=tempcol; 
        rectcolorG[i]=tempcol; 
        rectcolorB[i]=tempcol; 
    }

    while(!Keyboard::esc.pushed()){
        window.clear(Color::black);
        for(int i=0; i < rectnum; i++){
            rect[i].draw(Color(rectcolorR[i], rectcolorG[i], rectcolorB[i])); 
        }
        window.flip();
    }

}