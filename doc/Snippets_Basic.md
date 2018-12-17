Snippets - Basic Code
==========================

~~~
#include <psychlops.h>
using namespace Psychlops;

void psychlops_main()
{
	Canvas cnvs(Canvas::window);


	Rectangle rect(100,100);

	while (!Keyboard::esc.pushed()) {
		cnvs.clear(Color::gray);

		rect.centering().draw(Color::green);

		cnvs.flip();
	}
}
~~~