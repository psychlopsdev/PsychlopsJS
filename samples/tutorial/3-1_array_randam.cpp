#include <psychlops.h>
using namespace Psychlops;


void psychlops_main() {
    
    const int maxrectnum = 200;//使用できる最大の四角形の数を指定
    int rectnum = 30;//実際に使用する四角形の数
    double rectsize = 15.0;//四角形の大きさ
    
	Psychlops::Rectangle rect[maxrectnum];//用意する四角の宣言（maxrectnumだけ用意する）
	
    double rectlum[maxrectnum];//使用する明るさ
	
    Canvas window(Canvas::window);

    for(int i=0; i < rectnum; i++) {
        rect[i].set(rectsize, rectsize); //サイズの指定
        rect[i].centering().shift((i-rectnum/2)*(rectsize*1.5), 0.0); 
		// iが大きくなるにつれて左に移動するようにしている
		//隣り合う四角同士の距離は四角の大きさの1.5倍　rectsize*1.5
		//画面の中心から左右に並ぶようにしている　(i-rectnum/2)
		//i=0 ならば　(0-30/2) x 10.0 x 1.5 = -15 x 15 = -225(中心から左に225ピクセルずれたところ）
		//i=1 ならば　(1-30/2) x 10.0 x 1.5 = -14 x 15 = -210(中心から左に210ピクセルずれたところ）
		//i=2 ならば　(2-30/2) x 10.0 x 1.5 = -13 x 15 = -195(中心から左に195ピクセルずれたところ）
		
		//i=29 ならば　(29-30/2) x 10.0 x 1.5 = 14 x 15 = 210(中心から右に195ピクセルずれたところ）
		
		//明るさを同じにしたいとき
		//rectlum[i]=0.5; 
		
		//明るさをランダムにしたいとき
		rectlum[i]=Psychlops::random();//7桁もしくは15桁の精度で0から1の間のランダムな数値がはいる
		
		//色をランダムにしたいときはどうしたらよい？
			
    }

    while(!Keyboard::esc.pushed()) {
        window.clear(Color::black); 
        for(int i=0; i < rectnum; i++){
			rect[i].draw( Color(rectlum[i], rectlum[i], rectlum[i]) ); 
        }
        window.flip();
    }

}