class Psychlops::Rectangle
==========================


## Usage
Rectangleで扱う長方形は座標が固定されています。
通常、長方形を移動するときはcentering()などでセンタリングしてから、shift(double h, double v)で動かします。

~~~
// サンプル
Psychlops::Rectangle rect;
rect.set(100, 100).centering().shift(-100, 0);
rect.draw(Color::red);
   // rectという名前のRectangleを作る
   // 幅100高100ピクセルの大きさに設定し、センタリングしてx軸で100ピクセル左に移動
   // 赤い色で表示
~~~



## Functions

### Initialize

- `Rectangle()`: (0,0)で初期化します。
- `Rectangle(double l, double t, double r, double b)`: 長方形の左上の座標が(l,t)、右下の座標が(r,b)になるように初期化します。
- `Rectangle(double width, double height)`: 長方形を幅width、高さheightに初期化します。

-  Rectangle& set
	- `set(double l, double t, double r, double b)`: 長方形の左、上、右、下の座標を指定して定義します。
	- `set(double width, double height)`: 長方形の大きさを幅width、高さheightに変更します。左上は(0,0)になります。
- Rectangle& `resize(double width, double height)`: 長方形の大きさを幅width、高さheightに変更します。中央の位置が固定されます。

### Translate

- Rectangle& centering
	- `centering()`: 長方形を画面の中央に移動します。
	- `centering(double x, double y)`: 長方形の中心を(x,y)に移動します。
	- `centering(Point po)`: 長方形の中心をpoに移動します。
		- `centering(object.getCenter())`: [Image]()など`getCenter()`が定義されていればこの方法で重ね合わせできます。

- Rectangle& `shift(double h, double v)`: 長方形を現在の座標から(h,v)だけ移動します。

### Getting parameters

それぞれの関数名のとおりの長方形の情報を取得します。
例えば、getWidthなら長方形の幅を返します。

- double `getWidth()`:
- double `getHeight()`:
- Point `getCenter()`:
- double `getHcenter()`:
- double `getVcenter()`:
- double `getTop()`:
- double `getLeft()`:
- double `getBottom()`:
- double `getRight()`:


### Checking collision
Rectangleが、その座標内に他の点や四角形を含むかどうか判定します。判定時は自身を閉集合として考えます（＝境界線上に判定対象がある場合、含むと判定されます）。

- bool include
	- `include(double x, double y)`: Rectangleの中に(x,y)点が入っているかどうか判定します
	- `include(Point other)`: Rectangleの中にPoint点が入っているかどうか判定します
	- `include(Rectangle other)`: Rectangleの中に別のRectangleが完全に入っているかどうか判定します
