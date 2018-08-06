#include <psychlops.h>
using namespace Psychlops;

void psychlops_main()
{
	Canvas cnvs(Canvas::window);

	Psychlops::Letters note(L"黄色い部分が一様で、端に１ドット黒い枠があることを確認してください。");
	note.shift(10, 80);

	Psychlops::Rectangle area;
	area.set(500, 500).centering();

	Psychlops::Rectangle rect;
	rect.set(500, 500).centering();
	rect.fill = Color::blue;

	Figures::ShaderField test;
	test.setCoordMode(Shader::LEFT_TOP);
	test.setFunction(" \
		void main(void) { \
		  float width = uCoord[0], height = uCoord[1]; \
		  float x = floor(xp()); \
		  float y = floor(yp()); \
		  if(x==0.0 || x==width-1.0 || y==0.0 || y==height-1.0) { \
		    pix(0.0,0.0,0.0,1.0); \
		  } else { \
		    pix(mod(x,2.0),mod(y,2.0),0.0,1.0); \
		  } \
		}");

	double param[4];
	param[0] = area.getWidth();
	param[1] = area.getHeight();
	param[2] = 0;
	param[3] = 0;




	// [begin loop]
	while (!Keyboard::esc.pushed()) {
		cnvs.clear(Color(127 / 255.0));

		rect.draw();
		test.draw(area, param, 1);
		note.draw();

		cnvs.flip();
	}
	// [end loop]
}