#include <SFML/Graphics.hpp>
#include <array> 
#include <cmath>

class Cords2d {
	float initialCenterX;
	float initialCenterY;
	sf::RenderWindow* window;
	
	public:
		float offsetX = 0;
		float offsetY = 0;
		float 	 zoom = 50;

	Cords2d(int width, int height, sf::RenderWindow& window) {
		this->initialCenterX =  width / 2;
		this->initialCenterY = height / 2;
		this->window = &window;
	}

	sf::Vector2f getCenter() {
		return sf::Vector2f(
			this->offsetX + this->initialCenterX,
			this->offsetY + this->initialCenterY
		);
	}

	sf::Vector2f toPixels(float x, float y) {
		sf::Vector2f center = this->getCenter();
		return sf::Vector2f(
			center.x + x * this->zoom,
			center.y - y * this->zoom
		);
	}

	sf::Vector2f toCartesian(float w, float h) {
		sf::Vector2f center = this->getCenter();
		return sf::Vector2f(
			(w - center.x) / this->zoom,
		   -(h - center.y) / this->zoom
		);
	}

	template<typename T>
	void draw(T a, float x, float y) {
		sf::Vector2f pos = this->toPixels(x, y);
		a.setPosition(pos.x, pos.y);
		window->draw(a);
	}

};

template <typename t>
t clamp2(t x, t min, t max)
{
if (x < min) x = min;
if (x > max) x = max;
return x;
}

struct complex
{
    float real;
    float imag;
};

sf::Vector3f mandel(float x, float y, int iter) {
    complex z, _z;
    z.real = 0, _z.real = 0;
    z.imag = 0, _z.imag = 0;
    
    float a_2, b_2;

	int ITERATIONS;

    for (ITERATIONS=0; ITERATIONS < iter; ITERATIONS++) {
        a_2 = _z.real * _z.real;
        b_2 = _z.imag * _z.imag;
        
        z.real = a_2 - b_2;
        z.imag = 2 * _z.real * _z.imag;
        
        z.real += x;
        z.imag += y;

        _z.real = z.real;
        _z.imag = z.imag;

        if (a_2 + b_2 > 4)
            break;
    }


    return sf::Vector3f(z.real, z.imag, ITERATIONS);

} 

int main()
{
	//ulimit -s 204800
	const int width = 800, height = 600;

	sf::RectangleShape pixels[height][width];

	for (int i=0; i < height; i++) {
		for (int j=0; j < width; j++) {
			sf::RectangleShape rect(sf::Vector2f(1, 1));
			pixels[i][j] = rect;
			pixels[i][j].setPosition(sf::Vector2f(j, i));
		}
	}

	sf::RenderWindow window(sf::VideoMode(800, 600), "Not Tetris");


	Cords2d cords(width, height, window);
	sf::Event event;


	// sf::RectangleShape myRect(sf::Vector2f(50, 50)); 1 000 000

	float x = 0;
	float y = 0;

	
	sf::RectangleShape test_sprite(sf::Vector2f(50, 50));
	test_sprite.setFillColor(sf::Color(255, 69, 255));

	sf::Clock timer;

	while (window.isOpen()) {	
		timer.restart();
		while (window.pollEvent(event)) { if (event.type == sf::Event::Closed) window.close(); }
		window.clear();
		

		if (sf::Keyboard::isKeyPressed(sf::Keyboard::Z)) {
			cords.zoom += 1;
		}

		if (sf::Keyboard::isKeyPressed(sf::Keyboard::X)) {
			cords.zoom -= 1;
		}

		for (int i=0; i < height; i++)  {
			for (int j=0; j < width; j++) {
				sf::Vector2f cart = cords.toCartesian(j, i);

				sf::Vector3f iter = mandel(cart.x, cart.y, 50);

				int hue = 255 * iter.z / 50;
		        int value = iter.z < 50 ? 255 : 0;

				double nsmooth = iter.z + 1 - log(log(iter.x * iter.x + iter.y * iter.y))/ log(2);

				// pixels[i][j].setFillColor(sf::Color(clamp2(log(iter.z * nsmooth) , 0.0, 255.0) * 255, log(255 * hue), nsmooth * 255));
				pixels[i][j].setFillColor(sf::Color(0, value, 0));
				window.draw(pixels[i][j]);				
			}
		}


		// cords.draw(test_sprite, x, y);
		window.display();
	}

	return 0;
} 
