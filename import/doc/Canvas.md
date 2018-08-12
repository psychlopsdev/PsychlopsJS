class Psychlops::Canvas
==========================

Usage
---------

`Canvas` represents drawing target like a window or a monitor. In PsychlopsJS, it represents canvas element linked with double-buffered WebGL context. Typically, only one instance of `Canvas` is required for a experiments. Once a `Canvas` instance is set, most of drawing functions automatically draw on the last-set instance.


Functions
-------------

### Initialization

`Canvas& set(Canvas::fullscreen)`
: set a new fullscreen Canvas. The size depends on the screen setting.

`Canvas& set(Canvas::window)`
: set a new window (or Canvas element in HTML). Default size is 800x600.

`Canvas& set(width, height)`
: set a new window by designated size.

### Initialization

`void flip()`
: finish drawing on a frame and show the latest frame.

### Auxiliary functions

`void var(number, x, y, color)`
: draw a number on designated coodinate and color.

`void msg(string, x, y, color)`
: draw a string on designated coodinate and color.

