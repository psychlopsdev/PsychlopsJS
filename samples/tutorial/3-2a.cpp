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
         rect[i].shift((i - 0.5 * rectnum) * rectsize* 1.5,
                   (i - 0.5*rectnum) * rectsize * 1.5); 
          rectcolorR[i]=Psychlops::random(); 
          rectcolorG[i]=Psychlops::random(); 
          rectcolorB[i]=Psychlops::random(); 

         }
	
    int frame = 0;
    int motion_dir = 1;
    double Horizontal_shift, Vertical_shift;

    while(!Keyboard::esc.pushed()){
        window.clear(Color::black);

        if(frame % 60 ==0){ 
           motion_dir *= -1;
        }
		
        if(frame % 10 == 0){ 
	for(int i=0; i < rectnum; i++){
                rectcolorR[i]=Psychlops::random(); 
                rectcolorG[i]=Psychlops::random(); 
                rectcolorB[i]=Psychlops::random(); 
	    rect[i].resize(rectsize, rectsize); 
          }
        }

       for(int i=0; i < rectnum; i++){
	 rect[i].shift(Horizontal_shift, Vertical_shift);
	 Horizontal_shift=motion_dir * 2.0;
    	 Vertical_shift=motion_dir * 0;
              rect[i].draw(Color(rectcolorR[i], rectcolorG[i], rectcolorB[i])); 
        }
        window.flip();
        frame++;
    }
}