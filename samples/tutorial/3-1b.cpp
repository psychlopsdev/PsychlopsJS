#include <psychlops.h>
using namespace Psychlops;


    void psychlops_main() {

    const int maxrectnum = 200;
    int rectnum = 30;
    double rectsize = 10;
    Psychlops::Rectangle rect[maxrectnum];
    double rectcolorR[maxrectnum];
    double rectcolorG[maxrectnum];
    double rectcolorB[maxrectnum];
    Psychlops::Color rectcol;
    Canvas window(Canvas::window);

    for(int i=0; i < rectnum; i++) {
        rect[i].set(rectsize, rectsize); 
        rect[i].centering();
        rect[i].shift((i - 0.5 * rectnum) * rectsize * 1.5,
                                (i - 0.5 * rectnum) * rectsize * 1.5); 

        rectcolorR[i]=Psychlops::random(); 
        rectcolorG[i]=Psychlops::random(); 
        rectcolorB[i]=Psychlops::random(); 
    }

    while(!Keyboard::esc.pushed()) {
        window.clear(Color::black);
        for(int i=0; i < rectnum; i++) {
            rectcol.set(rectcolorR[i], rectcolorG[i], rectcolorB[i]);
            rect[i].draw(rectcol); 
        }
        window.flip();
    }

}