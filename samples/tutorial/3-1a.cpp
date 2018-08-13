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

       Canvas window(Canvas::window);

 	     for(int i=0; i < rectnum; i++){
 	         rect[i].set(rectsize, rectsize); 
         rect[i].centering(); 
         rect[i].shift((i - 0.5 * rectnum) * rectsize * 1.5,
                (i - 0.5 * rectnum) * rectsize * 1.5); 

 	         rectcolorR[i]=(double)i * 1.0/(double)rectnum; 
         rectcolorG[i]=(double)i * 1.0/(double)rectnum; 
         rectcolorB[i]=(double)i * 1.0/(double)rectnum; 
    }
    
 	    while(!Keyboard::esc.pushed()){
        window.clear(Color::black); 
        for(int i=0; i < rectnum; i++){
            rect[i].draw(Color(rectcolorR[i], rectcolorG[i], rectcolorB[i])); 
        }
        window.flip();
    }

}