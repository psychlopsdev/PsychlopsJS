#include <psychlops.h>
using namespace Psychlops;

void psychlops_main() {
	Canvas window(Canvas::window); 

	Psychlops::Polygon figure1; //多角形を作る時
	//（四角はあるのでそちらを使った方がよい）
	
	int Nvertices = 8; //頂点の数
	double radius = 100;//多角形の外接円の半径
	double angle;//頂点の位置を決めるための角度の変数
	
	for(int i=0; i<Nvertices; i++)
    {
        angle = i/Nvertices * 2*PI; 	
		//角度を弧度法で示す(2pi = 360度とする)
        //2piを頂点の数で等分にしている

		//図形の向きを調整したい時には，後ろに角度を足したり引いたりすればよい
        //angle = (i/Nvertices * 2*PI) +(30/360*2*PI);
        
        //外接円のどの部分を頂点とするかを一筆書きする（元に戻ること）
        //append = 頂点を追加していく
        figure1.append(radius*cos(angle), radius*sin(angle));    
        //三角関数の単位円を考える
        //cos(θ)はx座標，sin(θ)はy座標と考えると良い
       
    }

	while(!Keyboard::esc.pushed()) {
		window.clear(Color(0.5)); 
		figure1.centering();   
		figure1.draw( Color(0.0, 1.0, 0.5) ); 
		window.flip(); 
	} 
}