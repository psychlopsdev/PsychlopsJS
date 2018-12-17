Psychlops JavaScript Known Issues
=================================

## 変更履歴

2018.02.13
:    flip時にfirefoxのみsetIntervalを使う仕様であったものが全てに適用されていたのを修正、全面的にrequestAnimationFrameを使用

## Bugs
- Canvasの大きさは最初に実行したサイズで固定されます．プログラムを書き換えてウインドウサイズを変えても誤った表示になります．この問題を解決するには，ページを再読み込みしてください．

## 仕様（改善は難しい）

- IEやSafari8以前ではflipを含むループに補助コードが必要です．while/forの直前に`[begin 識別名]`、、それに対応する終わり括弧 } の直後に`// [end 識別名]`という行を追加してください．
- 補助コードによるループ範囲は入れ子構造にできます．
	- ループを脱する`break;`は`break;//endloop;`に置き換えてください．
-変数の宣言はこの補助コードを書く前にすべて済ませてください．

~~~	
const int trial_max = 10;
int current_trial= 0;

// [begin exp]							
while (current_trial&lt;trial_max) {
	// [begin xx]
	while (Keyboard::spc.pushed()) {
		if (frames>10) {
			break;//endloop
		}
		// (描画)
		cnvs.flip();
	}
	// [end xx]
	current_trial++;
}
// [end exp]
~~~

