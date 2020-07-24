#include <psychlops.h>
using namespace Psychlops;

void psychlops_main() {
 	Canvas window(Canvas::window);

	Image img; //あらかじめ画像をためておく場所を確保する(Image)
	//毎回描くわけではないため，処理負荷が軽くなる（ことがある）
	Psychlops::Color dotcol;
	int imageHsize = 200; //Imageの大きさ（横） 
	int imageVsize = 60; //Imageの大きさ（縦）

	double R, G, B;
	
	img.set(imageHsize,imageVsize); //Imageの大きさの初期化

	for(int i=0; i < imageHsize; i++) {
		for(int j=0; j < imageVsize; j++) {
        //for文を二重に使用して，縦と横にドット（pix）をうつ

			//色（明るさ）はドット（pix）ごとにランダムにしている
			R=Psychlops::random(); 
			G=Psychlops::random(); 
			B=Psychlops::random(); 
			
			//ドットをImageにうつ	
			img.pix(i,j, dotcol.set(R, G, B));
			//iが0の時に　jは0からimageVsize-1までを繰り返す
			//（縦を先に全部書いたら，一個横にずれる）	
			
		}
	}
	img.cache();//おまじない
		
	while(!Keyboard::esc.pushed()) {
		window.clear(Color::black); 
		img.centering().shift(100,100); 
		img.draw();  
		window.flip();
	}

}