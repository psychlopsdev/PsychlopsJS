class Image
==========================

- Image set(width, height)
- Image load(file_name)

- Image centering()
- Image centering(Point new_center)
- Image centering(x, y)
- Image shift(delta_x, delta_y)

### Draw pixel on the image
- Image pix(x, y, color)
- Image pix_raw(x, y, color)
- Image pix_8bit(x, y, r, g, b, a)
- Image alpha(x, y, alpha)
- Color getPix(x, y);

- double getWidth()
- double getHeight()
- double getTop()
- double getLeft()
- double getBottom()
- double getRight()
- Point getCenter()