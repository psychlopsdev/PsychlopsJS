class Psychlops::Rectangle
==========================


## Usage
Typically, a rectangle is designate its size by `set` and move to relative coordinate to center of window by `centering` and `shift` functions.


Typical usage:
~~~
Psychlops::Rectangle rect;
rect.set(100, 100).centering().shift(-100, 0);
rect.draw(Color::red);
~~~

## Functions

### Initialization

#### By decralation

`Rectangle()`
: set the rectangle's size as `0` * `0`.

`Rectangle(double left, double top, double right, double bottom)`
: 

`Rectangle(double width, double height)`
: set the rectangle's size as `width` * `height`. Left-Top corner is placed on (0,0).

#### By function

`Rectangle& set(double left, double top, double right, double bottom)`
: 

`Rectangle& set(double width, double height)`
: set the rectangle's size as `width` * `height`. Left-Top corner is placed on (0,0).

`Rectangle& resize(double width, double height)`
: resize the rectangle's size as `width` * `height`. Center of the rectangle will be kept.

### Translation

`Rectangle& centering()`
:place the rectangle at center of the window.

`Rectangle& centering(double x, double y)`
`Rectangle& centering(Point p)`
: place the rectangle centered at `(x,y)` or `(p.x, p.y)`. Typically, the function is used with `getCenter()` as `rect.centering(image.getCenter())`.

`Rectangle& shift(double h, double v)`
: move the rectangle by `(h, v)`.

### Getting parameters

- `double getWidth()`
- `double getHeight()`
- `Point getCenter()`
- `double getTop()`
- `double getLeft()`
- `double getBottom()`
- `double getRight()`

### Drawing

`void draw(color)`
: draw the ellipse with designated [Color]();

### Checking inclusion

These functions check whether the `Rectangle` instance includes other points in its area. The `Rectangle` instance is treated as closed set (= returns `true` if the point on the boundary line).

`bool include(double x, double y)`
: 

`bool include(Point other)`
: 

