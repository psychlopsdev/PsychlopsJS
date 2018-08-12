class Psychlops::Mouse
==========================

## Usage

Typical usage:
~~~
Rectangle area(100,100);

if(Mouse::left.pushed() && area.include(Mouse::position))
{
    doSomething();
}
~~~

## Pointer's position

`Mouse::point`
: read only value

`Mouse::x`
: read only value

`Mouse::y`
: read only value

## Functions of Key and Button

`bool pushed()`
: Transient-signal.

`bool released()`
: Transient-signal.

`bool pressed()`
: Sustained-signal. Always returns `true` if the key is pressed.

### Button lists

- left, right, center

