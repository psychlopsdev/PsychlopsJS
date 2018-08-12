class Psychlops::Clock
==========================


Usage
----------

Typical usage:
~~~
Clock before, after;
before.update();

// do something...

after.update();
double elapsed_time = after.at_msec() - before.at_msec();
~~~

Functions
----------

`void update()`
: update internal value of the Clock instance.

`double at_msec()`
: returns Clock value by the unit of milliseconds.

