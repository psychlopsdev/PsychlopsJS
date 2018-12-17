class Psychlops::Image
==========================

Usage
----------

Typical usage:
~~~
Image noise;
noise.set(100, 100);
for(int y=0; y < noise.getHeight(); y++) {
	for(int x=0; x< noise.getWidth(); x++) {
		noise.pix(x, y, col.set(random()));
	}
}
noise.centering().draw();
~~~

Functions
----------------

### Initialization

#### By decralation

`Image& set(int width, int height)`
: set a Image instance with designated size.

`Image& load(string file_name)`
: load a Image file. PNG and JPEG are supported.

### Translation

`Image& centering()`
: place the rectangle at center of the window.

`Image& centering(Point new_center)`
`Image& centering(x, y)`
: place the rectangle centered at `(x,y)` or `(p.x, p.y)`. Typically, the function is used with `getCenter()` as `rect.centering(image.getCenter())`.

`Image& shift(delta_x, delta_y)`
: move the rectangle by `(h, v)`.

### Pixel manipulation

`Image& pix(int x, int y, Color col)`
: set the [Color](Color) of designated pixel. With this function, alpha-blending is applied on drawing to the Image.

`Image& pix_raw(int x, int y, Color col)`
: set the [Color](Color) of designated pixel. With this function, color values are directly copied to the image. Alpha-blending will not be applied.

`Image& alpha(int x, int y, alpha)`
: set the alpha value of designated pixel.

`Color getPix(int x, int y)`
: get the [Color](Color) of designated pixel.


### Drawing

`void draw()`
: draw the Image on the [Canvas](Canvas)

### Getting parameters

- `double getWidth()`
- `double getHeight()`
- `double getTop()`
- `double getLeft()`
- `double getBottom()`
- `double getRight()`
- `Point getCenter()`