class Psychlops::Color
==========================


Functions
-----------

`Color set(gray)`
: set the same value to RGB. Range of the value is from 0 to 1. Alpha value is set as 1.

`Color set(r, g, b)`
:  set value of R, G, B. Range of the value is from 0 to 1. Alpha value is set as 1.

`Color set(r, g, b, a)`
: set value of R, G, B, A. Range of the value is from 0 to 1.

`double getR()`
`double getG()`
`double getB()`
`double getA()`
: Range of the value is from 0 to 1.

### Class Functions

`Color::setGammaValue()`
: set gamma value by default value. The default value could be changed by auxiliary tool.

`Color::setGammaValue(double red, double green, double blue)`
: set gamma value for correct linearity of luminance.

Constants
--------------

- `Color::black`
- `Color::gray`
- `Color::white`
- `Color::red`
- `Color::green`
- `Color::blue`
- `Color::yellow`
- `Color::magenta`
- `Color::cyan`
- `Color::transparent`
