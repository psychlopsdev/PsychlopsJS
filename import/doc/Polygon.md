class Psychlops::Polygon
========================

`Polygon& append(double vertex_x, double vertex_y)`
: append a new vertex to vertices list of the `Polygon` instance.

### Translation

`Polygon& centering()`
: place the Polygon at center of the window.

`Polygon& centering(x, y)`
`Polygon& centering(Point new_center)`
: place the rectangle centered at `(x,y)` or `(new_center.x, new_center.y)`. Typically, the function is used with `getCenter()` as `rect.centering(image.getCenter())`.

`Polygon& shift(double h, double v)`
: move the rectangle by `(h, v)`.


### Drawing

`void draw(color)`
: draw the ellipse with designated [Color](Color);