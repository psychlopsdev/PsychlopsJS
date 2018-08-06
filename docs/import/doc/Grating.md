*class Psychlops::Figures::Grating*
===================================

## 概要

> - Grating型の実装は未確定です。
> - PsychoPyのGratingPatchをコピーしたものです。
> - *現在ブラウザ版のみです。*


## Usage
~~~
Figures::Grating gbr("sin", "gauss", "gray");

gbr.wavelength = 5;
gbr.orientation = 0;
gbr.phase = 0;
gbr.contrast = 0.5;
~~~

## Functions

- PUBLIC VARIABLES
	- `wavelength`
	- `orientation`
	- `phase`
	- `contrast`

- centering
	- `centering()`: move this object at the center of the window.
	- `centering(x, y)`: make this object centered at `(x, y)`.
	- `centering(point)`: make this object centered at `(point)`.
