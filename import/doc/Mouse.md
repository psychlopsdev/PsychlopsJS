class Mouse
==========================

## Functions of Key and Button

- bool pushed()
- bool released()
- bool pressed()

## Functions of Mouse

### Read pointer's position

- Mouse::point  // read only value
- Mouse::x // read only value
- Mouse::y // read only value

### Button lists
Use as this.


if(Mouse::left.pushed())
{
    doSomething();
}

- left, right, center

