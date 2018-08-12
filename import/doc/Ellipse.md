class Psychlops::Ellipse
======================

## Usage
Psychlops::Ellipse expresses inscribed ellipsoids inside a rectangle. Typically, a ellipse is designate its size by `set` and move to relative coordinate to center of window by `centering` and `shift` functions.

Typical usage:
~~~
Psychlops::Ellipse rect;
rect.set(100, 100).centering().shift(-100, 0);
rect.draw(Color::red);
~~~

## Functions
### Initialization

#### By decralation

`Ellipse()`
: set the ellipse's size as `0` * `0`.

`Ellipse(double left, double top, double right, double bottom)`
: 

`Ellipse(double width, double height)`
: set the ellipse's size as `width` * `height`. Left-Top corner is placed on (0,0).

#### By function

`Ellipse& set(double left, double top, double right, double bottom)`
: 

`Ellipse& set(double width, double height)`
: set the ellipse's size as `width` * `height`. Left-Top corner is placed on (0,0).

`Ellipse& resize(double width, double height)`
: resize the ellipse's size as `width` * `height`. Center of the ellipse will be kept.

### Translation

`Rectangle& centering()`
:place the rectangle at center of the window.

`Rectangle& centering(double x, double y)`
`Rectangle& centering(Point p)`
: place the rectangle centered at `(x,y)` or `(p.x, p.y)`. Typically, the function is used with `getCenter()` as `rect.centering(image.getCenter())`.

`Rectangle& shift(double h, double v)`
: move the rectangle by `(h, v)`.

### Drawing

`void draw(color)`
: draw the ellipse with designated [Color](Color);

### Getting parameters

- `double getWidth()`
- `double getHeight()`
- `Point getCenter()`
- `double getTop()`
- `double getLeft()`
- `double getBottom()`
- `double getRight()`