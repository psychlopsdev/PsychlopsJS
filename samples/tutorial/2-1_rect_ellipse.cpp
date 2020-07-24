#include <psychlops.h>
using namespace Psychlops;

void psychlops_main() {
	Canvas window(Canvas::window); 

	Psychlops::Rectangle figure1; //四角を描く時
	Psychlops::Ellipse figure2; //丸を描く時
	
	//下の部分の数値を全て変数で置き換えてみよう
	
	while(!Keyboard::esc.pushed()) {
		window.clear(); 
		figure1.set( 100, 100 ); //大きさの指定
		figure1.centering();   //原点を画面中央に移動する
		figure1.shift( 10, 10 ); //移動させる量（この場合は中心から）
		figure1.draw( Color( 1, 0, 0) ); //描く，色の指定
		
		figure2.set( 100, 100 ); //大きさの指定
		figure2.centering();   //原点を画面中央に移動する
		figure2.shift( 100, -40 );//移動させる量（この場合は中心から） 
		figure2.draw( Color( 0, 0, 1) ); //描く，色の指定
			
		window.flip(); 
	} 
}