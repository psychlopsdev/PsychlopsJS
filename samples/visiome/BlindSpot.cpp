#include <psychlops.h>
using namespace Psychlops;


void psychlops_main() {

	int Number=0;
	double XPos[1024], YPos[1024];
	
	
	int ResMax=15;

	Canvas cnvs(Canvas::fullscreen);
	
	double bg_lum    = 0.0;
	
	Psychlops::Rectangle Fixation(15 * cnvs.getPixelRatio(),15 * cnvs.getPixelRatio());
	
	double rect_size = 10 * cnvs.getPixelRatio();
	Psychlops::Rectangle Probe(10 * cnvs.getPixelRatio(),10 * cnvs.getPixelRatio());
	double ProbeWidth = 1 * cnvs.getPixelRatio();
	Psychlops::Color ProbeCol(1.0, 0.0, 0.0);
	
	double GridFlag = 0;
	double GridWidth = 60;
	Psychlops::Color GridCol(0.0, 0.2, 0.0);
	
	
	Psychlops::Rectangle the_rect, rect1(1,1), rect2(1,1), ProbeArray[1024];
	Psychlops::Color ColBuffer[1024];
	
	the_rect.set(cnvs.getWidth(), cnvs.getHeight()).centering();
	
	Fixation.centering().shift(100,0);
	Probe.centering().shift(-200,0);
	
	for(int i=0; i<1024; i++){ProbeArray[i].set(10,10);}
	
	//// Prepare two sliders to manipulate parameters.
	Widgets::Slider size_slider, grid_slider, bglm_slider;
	Interval rng;
	size_slider.link(rect_size, "Rect Size", 1.0<rng<50.0, 10.0);
	grid_slider.link(GridFlag, "Grid ON", 0.0<=rng<=1.0, 1.0);
	bglm_slider.link(bg_lum, "BG Luminance", 0.0<=rng<=1.0, 1.0);
	
	
	while(!Keyboard::esc.pushed()) {
		Probe.resize(rect_size,rect_size);
	
		cnvs.clear(Color(bg_lum));
		if(GridFlag) {
			double w=the_rect.getWidth();
			double h=the_rect.getHeight();

			int x=ceil(w/GridWidth);
			int y=ceil(h/GridWidth);

			for(int i=0; i<x; i++){cnvs.line(i*GridWidth, 0, i*GridWidth, h, col);}
			for(int i=0; i<y; i++){cnvs.line(0, i*GridWidth, w, i*GridWidth, col);}
		}
		
		Fixation.draw(Color::green);
		
		
		for(int i=0; i<1024; i++){
			ProbeArray[i].resize(rect_size,rect_size);
			if(i<Number-ResMax){ColBuffer[i].set(1.0/(Number-ResMax-i),0.0,0.0);}
			else ColBuffer[i].set(1.0,0.0,0.0);
			}
	
		for(int i=0; i<Number; i++){cnvs.ellipse(ProbeArray[i], ColBuffer[i]);}
		
		if(Keyboard::pad4.pressed()){
			if(!Keyboard::pad0.pressed())Probe.shift(-1,0);
			else Probe.shift(-25,0);
		}
		
		if(Keyboard::pad6.pressed()){
			if(!Keyboard::pad0.pressed())Probe.shift(1,0);
			else Probe.shift(25,0);
		}
		
		if(Keyboard::pad8.pressed()){
			if(!Keyboard::pad0.pressed())Probe.shift(0,-1);
			else Probe.shift(0,-25);
		}
		
		if(Keyboard::pad2.pressed()){
			if(!Keyboard::pad0.pressed())Probe.shift(0,1);
			else Probe.shift(0,25);
		}
	
		if(Keyboard::spc.pushed()){
			ProbeArray[Number].centering(Probe); 
			XPos[Number]=-200+Probe.getHcenter()-cnvs.getWidth()/2;
			YPos[Number]=Probe.getVcenter()-cnvs.getHeight()/2;
			Number++;
		}
		if(Keyboard::rtn.pushed()){
			Probe.centering().shift(-200,0);
			Number=0;
		}
		

		Psychlops::Rectangle Hbar(Probe.getWidth(), ProbeWidth), Vbar(ProbeWidth, Probe.getHeight());
		Hbar.centering(Probe.getCenter()).draw(ProbeCol);
		Vbar.centering(Probe.getCenter()).draw(ProbeCol);
		
		size_slider.draw();
		grid_slider.draw();
		bglm_slider.draw();
		
		cnvs.flip();
	}
	
	Data::savearray("BlindSpot_%TIME_.dat", "Xposition\tYposition", Number, XPos, YPos);
}



