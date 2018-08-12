class Psychlops::Keyboard
==========================

## Usage

Typical usage:
~~~
if(Keyboard::spc.pushed())
{
    doSomething();
}
~~~

## Functions of Key and Button

`bool pushed()`
: Transient-signal.

`bool released()`
: Transient-signal.

`bool pressed()`
: Sustained-signal. Always returns `true` if the key is pressed.


## Key list

- f1, f2, f3, f4, f5, f6, f7, f8, f8, f10
- esc, one, two, three, four, five, six, seven, eight, nine, zero
- q,w,e,r,t,y,u,i,o,p
- a,s,d,f,g,h,j,k,l
- z,x,c,v,b,n,m, comma, period
- spc, left, right, up, down
- pad0, pad1, pad2, pad3, pad4, pad5, pad6, pad7, pad8, pad9
- ctrl, shift, alt