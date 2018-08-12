class Psychlops::Letters
======================

## Usage

Typical usage:
~~~
Letters message(L"Push space key.");
message.centering.draw(Color::white);
~~~

## Functions
### Initialization

#### By decralation

`Letters()`
: 

`Letters(string the_string)`
: initialize the Letters with `the_string`

#### By function

`Letters& setString(string the_string)`
: set string of the Letters as `the_string`

### Translation

`Letters& centering()`
: place the Letters at center of the window.

`Letters& centering(double x, double y)`
`Letters& centering(Point p)`
: place the Letters centered at `(x,y)` or `(p.x, p.y)`. Typically, the function is used with `getCenter()` as `message.centering(image.getCenter())`.

`Letters& shift(double h, double v)`
: move the Letters by `(h, v)`.

### Drawing

`void draw(color)`
: draw the Letters with designated [Color](Color);

### Getting parameters
