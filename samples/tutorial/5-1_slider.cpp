#include <psychlops.h>
using namespace Psychlops;

void psychlops_main() {
	Canvas window(Canvas::window); 

	Psychlops::Rectangle figure1; //四角を描く時
	
	int fig_size = 100;
	int fig_x_posi = 0;
	figure1.set( fig_size, fig_size ); //大きさの指定
	
	//描画しながらパラメタを変えることができるスライダーの設置
	Interval rng;
	Widgets::Slider slider[2];
	//範囲を決める．rng
	//後の数値はステップサイズだが，マウスで動かすときは影響ない
	slider[0].link(fig_size, "Size", 0<rng<=300, 5.0, 1.0);
	slider[1].link(fig_x_posi, "X Position", -100<= rng <=100, 100, 10);
	
	while(!Keyboard::esc.pushed()) {
		window.clear(); 
		figure1.resize( fig_size, fig_size ); //大きさの再指定
	
		figure1.centering();   //原点を画面中央に移動する
		figure1.shift( fig_x_posi, 10 ); //移動させる量（この場合は中心から）
		
		figure1.draw( Color( 1, 0, 0) ); //描く，色の指定
		
		slider[0].draw();
		slider[1].draw();
				
		window.flip(); 
	} 
}