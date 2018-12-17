class Psychlops::Figures::ShaderGabor
==========================

## Usage

Typical usage:
~~~
Figures::ShaderGabor gbr;
gbr.setSigma(80);
gbr.wavelength = 5;
gbr.orientation = 0;
gbr.phase = 0;
gbr.contrast = 0.5;
gbr.centering().draw();
~~~

## Functions

### Initialization

#### By function

`ShaderGabor& setSigma(double sigma)`
: set size of Gabor patch be designating σ of the envelope.


### Translation

`ShaderGabor& centering()`
:place the Gabor patch at center of the window.

`ShaderGabor& centering(double x, double y)`
`ShaderGabor& centering(Point p)`
: place the Gabor patch centered at `(x,y)` or `(p.x, p.y)`. Typically, the function is used with `getCenter()` as `gabor.centering(image.getCenter())`.

`ShaderGabor& shift(double h, double v)`
: move the Gabor patch by `(h, v)`.

### Getting parameters

### Drawing

`void draw()`
: draw the Gabor;

